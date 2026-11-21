"""Compare the launch answer sets with the public historical records."""

import csv
import html
import io
import json
import re
import subprocess
import sys
import unicodedata
import zipfile
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from functools import lru_cache
from pathlib import Path
from urllib.parse import urlsplit
from urllib.request import urlopen


def normalized(name):
    name = unicodedata.normalize("NFKD", name.casefold())
    name = re.sub(r"[^a-z0-9 ]", "", name)
    return re.sub(r" (jr|ii)$", "", name)


def text(source):
    return html.unescape(re.sub(r"<[^>]+>", "", source)).strip()


def awards_from(page, section, year, league=""):
    table = page.split(f'<A name="{section}">', 1)[1].split("</PRE>", 1)[0]
    prefix = f"{year} {league}".strip() + " "
    names = [text(line[len(prefix):]).split(" (")[0]
             for line in table.splitlines() if line.startswith(prefix)]
    return [re.sub(r"^(AL|NL) ", "", name) for name in names]


@lru_cache
def batting_counts(archive_bytes):
    names, game_hits = {}, Counter()
    totals = {stat: Counter() for stat in ("home runs", "hits", "doubles", "triples")}
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        for entry in archive.namelist():
            if entry.upper().endswith(".ROS"):
                roster = archive.read(entry).decode("latin-1").splitlines()
                for player, last, first, *_ in csv.reader(roster):
                    names[player] = f"{first} {last}"
            if entry.upper().endswith((".EVA", ".EVN", ".EDA", ".EDN")):
                for line in archive.read(entry).splitlines():
                    if line.startswith(b"id,"):
                        game = line[3:]
                    if not line.startswith(b"play,"):
                        continue
                    fields = line.split(b",", 6)
                    event = re.match(rb"^(HR|H|S|D|T)(?=[0-9/.+;]|$)", fields[-1])
                    if event:
                        player = fields[3].decode()
                        totals["hits"][player] += 1
                        game_hits[game, player] += 1
                        stat = {b"HR": "home runs", b"H": "home runs",
                                b"D": "doubles", b"T": "triples"}.get(event[1])
                        if stat:
                            totals[stat][player] += 1
    totals["hits in one game"] = Counter()
    for (_, player), count in game_hits.items():
        totals["hits in one game"][player] = max(count, totals["hits in one game"][player])
    return names, totals


def expected_answers(prompt, read_source):
    question = prompt["question"]
    years = [int(year) for year in re.findall(r"\b\d{4}\b", question)]
    url = prompt["source"]["url"]
    data = read_source(url)
    category = prompt["category"]
    if "stat" in prompt:
        names, totals = batting_counts(data)
        mark = int(re.search(r"at least (\d+)", question)[1])
        return {names[player] for player, count in totals[prompt["stat"]].items() if count >= mark}
    page = data.decode("utf-8")
    if category == "franchises":
        series = re.search(r"<H2>World Series: (.*?) \(\d+\) defeated (.*?) \(\d+\)", page)
        return {text(name) for name in series.groups()}
    section = urlsplit(url).fragment
    if section == "A1":
        # The Hall's election-method page identifies the committee's exact class.
        election_page = read_source(prompt["source"]["corroboration"]).decode("utf-8")
        committee = election_page.split("Elected by Committee on Negro Baseball Leagues", 1)[1]
        committee = committee.split("Elected by Special Committee on Negro Leagues", 1)[0]
        electees = {normalized(text(name)) for name in re.findall(r"<h3\b[^>]*>(.*?)</h3>", committee)}
        return {name for year in range(years[0], years[-1] + 1) for name in awards_from(page, section, year)
                if normalized(name) in electees}
    return {name for year in range(years[0], years[-1] + 1)
            for name in awards_from(page, section, year)}


def main(cache):
    cache.mkdir(parents=True, exist_ok=True)
    project = Path(__file__).resolve().parent
    bank = json.loads(subprocess.check_output(
        ["node", "-e", 'global.window={};require("./questions.js");console.log(JSON.stringify(window.HOMERUN_BANK.all))'],
        cwd=project,
    ))

    def download(url):
        filename = Path(urlsplit(url).path).name
        path = cache / filename
        if not path.exists():
            with urlopen(url, timeout=30) as response:
                path.write_bytes(response.read())
        return path.read_bytes()

    urls = {url.split("#")[0] for prompt in bank
            if urlsplit(prompt["source"]["url"]).netloc != "www.mlb.com"
            for key, url in prompt["source"].items() if key in ("url", "corroboration")}
    with ThreadPoolExecutor(max_workers=6) as pool:
        sources = dict(zip(urls, pool.map(download, urls)))
    discrepancies = []
    official_sources = 0
    for prompt in bank:
        if urlsplit(prompt["source"]["url"]).netloc == "www.mlb.com":
            official_sources += 1
            continue
        expected = expected_answers(prompt, lambda url: sources[url.split("#")[0]])
        actual = {answer["name"] for answer in prompt["answers"]}
        if not expected or {normalized(name) for name in actual} != {normalized(name) for name in expected}:
            discrepancies.append(f"{prompt['id']}: bank {sorted(actual)} vs. source {sorted(expected)}")
    if discrepancies:
        sys.exit("\n".join(discrepancies))
    print(f"Verified {len(bank)-official_sources} historical answer sets against Retrosheet and the Baseball Hall of Fame; {official_sources} 2026 answer sets link to official MLB.com sources.")


if __name__ == "__main__":
    main(Path(sys.argv[1]))
