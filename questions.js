/*
 * Editorial daily bank: 28 seasons × seven prompts. The MVP, Cy Young,
 * Rookie of the Year, batting record, franchise and World Series fields are
 * stored as answer sets so the game can reveal accepted names and aliases.
 * Season records stop at 2025; each row carries its own source and cutoff.
 */
(() => {
  const retrosheetAwards = "https://www.retrosheet.org/boxesetc/MISC/XOH.htm";
  const bRef = name => `https://www.baseball-reference.com/search/search.fcgi?search=${encodeURIComponent(name)}`;
  const playerAliases = {
    "Alex Rodriguez":["A-Rod","Arod"], "Ichiro Suzuki":["Ichiro"], "Ivan Rodriguez":["Pudge Rodriguez"],
    "Mark McGwire":["Big Mac"], "David Ortiz":["Big Papi"], "Randy Johnson":["Big Unit","The Big Unit"],
    "Felix Hernandez":["King Felix"], "Giancarlo Stanton":["Mike Stanton"], "R.A. Dickey":["RA Dickey"],
    "CC Sabathia":["C.C. Sabathia"], "Ronald Acuna Jr.":["Ronald Acuna"], "Michael Harris II":["Michael Harris"],
    "Ken Griffey Jr.":["Ken Griffey","Junior","The Kid"], "Babe Ruth":["George Herman Ruth","The Bambino"]
  };
  const years = Array.from({length:28}, (_, i) => 1998+i);
  const source = (title, url, cutoff="2025 season") => ({title, url, cutoff});
  const record = (id, category, question, answers, details, ref, rarity) => ({
    id, category, question,
    answers:answers.map(([name,tier,aliases])=>({
      name,tier,aliases:[...new Set([name,...(playerAliases[name]||[]),...(aliases||[])])],
      allowSurname:category!=="franchises"
    })),
    details, source:ref, furtherReading:bRef(answers[0][0]), rarity
  });
  const answer = (name,tier="walk",aliases=[]) => [name,tier,aliases];
  const mvp = [
    [1998,"Sammy Sosa","Juan Gonzalez"],[1999,"Chipper Jones","Ivan Rodriguez"],
    [2000,"Jeff Kent","Jason Giambi"],[2001,"Barry Bonds","Ichiro Suzuki"],
    [2002,"Barry Bonds","Miguel Tejada"],[2003,"Barry Bonds","Alex Rodriguez"],
    [2004,"Barry Bonds","Vladimir Guerrero"],[2005,"Albert Pujols","Alex Rodriguez"],
    [2006,"Ryan Howard","Justin Morneau"],[2007,"Jimmy Rollins","Alex Rodriguez"],
    [2008,"Albert Pujols","Dustin Pedroia"],[2009,"Albert Pujols","Joe Mauer"],
    [2010,"Joey Votto","Josh Hamilton"],[2011,"Ryan Braun","Justin Verlander"],
    [2012,"Buster Posey","Miguel Cabrera"],[2013,"Andrew McCutchen","Miguel Cabrera"],
    [2014,"Clayton Kershaw","Mike Trout"],[2015,"Bryce Harper","Josh Donaldson"],
    [2016,"Kris Bryant","Mike Trout"],[2017,"Giancarlo Stanton","Jose Altuve"],
    [2018,"Christian Yelich","Mookie Betts"],[2019,"Cody Bellinger","Mike Trout"],
    [2020,"Freddie Freeman","Jose Abreu"],[2021,"Bryce Harper","Shohei Ohtani"],
    [2022,"Paul Goldschmidt","Aaron Judge"],[2023,"Ronald Acuna Jr.","Shohei Ohtani"],
    [2024,"Shohei Ohtani","Aaron Judge"],[2025,"Shohei Ohtani","Aaron Judge"]
  ];
  const cyYoung = [
    ["Roger Clemens","Tom Glavine"],["Pedro Martinez","Randy Johnson"],
    ["Pedro Martinez","Randy Johnson"],["Roger Clemens","Randy Johnson"],
    ["Barry Zito","Randy Johnson"],["Roy Halladay","Eric Gagne"],
    ["Johan Santana","Roger Clemens"],["Bartolo Colon","Chris Carpenter"],
    ["Johan Santana","Brandon Webb"],["CC Sabathia","Jake Peavy"],
    ["Cliff Lee","Tim Lincecum"],["Zack Greinke","Tim Lincecum"],
    ["Felix Hernandez","Roy Halladay"],["Justin Verlander","Clayton Kershaw"],
    ["David Price","R.A. Dickey"],["Max Scherzer","Clayton Kershaw"],
    ["Corey Kluber","Clayton Kershaw"],["Dallas Keuchel","Jake Arrieta"],
    ["Rick Porcello","Max Scherzer"],["Corey Kluber","Max Scherzer"],
    ["Blake Snell","Jacob deGrom"],["Justin Verlander","Jacob deGrom"],
    ["Shane Bieber","Trevor Bauer"],["Robbie Ray","Corbin Burnes"],
    ["Justin Verlander","Sandy Alcantara"],["Gerrit Cole","Blake Snell"],
    ["Tarik Skubal","Chris Sale"],["Tarik Skubal","Paul Skenes"]
  ];
  const rookie = [
    ["Kerry Wood","Ben Grieve"],["Scott Williamson","Carlos Beltran"],
    ["Rafael Furcal","Kazuhiro Sasaki"],["Albert Pujols","Ichiro Suzuki"],
    ["Jason Jennings","Eric Hinske"],["Dontrelle Willis","Angel Berroa"],
    ["Jason Bay","Bobby Crosby"],["Ryan Howard","Huston Street"],
    ["Hanley Ramirez","Justin Verlander"],["Ryan Braun","Dustin Pedroia"],
    ["Geovany Soto","Evan Longoria"],["Chris Coghlan","Andrew Bailey"],
    ["Buster Posey","Neftali Feliz"],["Craig Kimbrel","Jeremy Hellickson"],
    ["Bryce Harper","Mike Trout"],["Jose Fernandez","Wil Myers"],
    ["Jacob deGrom","Jose Abreu"],["Kris Bryant","Carlos Correa"],
    ["Corey Seager","Michael Fulmer"],["Cody Bellinger","Aaron Judge"],
    ["Ronald Acuna Jr.","Shohei Ohtani"],["Pete Alonso","Yordan Alvarez"],
    ["Devin Williams","Kyle Lewis"],["Jonathan India","Randy Arozarena"],
    ["Michael Harris II","Julio Rodriguez"],["Corbin Carroll","Gunnar Henderson"],
    ["Paul Skenes","Luis Gil"],["Drake Baldwin","Nick Kurtz"]
  ];
  const champions = [
    "New York Yankees","New York Yankees","New York Yankees","Arizona Diamondbacks",
    "Anaheim Angels","Florida Marlins","Boston Red Sox","Chicago White Sox",
    "St. Louis Cardinals","Boston Red Sox","Philadelphia Phillies","New York Yankees",
    "San Francisco Giants","St. Louis Cardinals","San Francisco Giants","Boston Red Sox",
    "San Francisco Giants","Kansas City Royals","Chicago Cubs","Houston Astros",
    "Boston Red Sox","Washington Nationals","Los Angeles Dodgers","Atlanta Braves",
    "Houston Astros","Texas Rangers","Los Angeles Dodgers","Los Angeles Dodgers"
  ];
  const worldSeriesMvp = [
    "Scott Brosius","Mariano Rivera","Derek Jeter",["Randy Johnson","Curt Schilling"],"Troy Glaus","Josh Beckett",
    "Manny Ramirez","Jermaine Dye","David Eckstein","Mike Lowell","Cole Hamels","Hideki Matsui",
    "Edgar Renteria","David Freese","Pablo Sandoval","David Ortiz","Madison Bumgarner","Salvador Perez",
    "Ben Zobrist","George Springer","Steve Pearce","Stephen Strasburg","Corey Seager","Jorge Soler",
    "Jeremy Pena","Corey Seager","Freddie Freeman","Yoshinobu Yamamoto"
  ];
  const battingRows = [
    ["Who hit at least 70 home runs in the 1998 season?",[["Mark McGwire","walk",["Big Mac"]]],"70 home runs, then a major-league single-season record."],
    ["Who hit at least 63 home runs in the 1999 season?",[["Mark McGwire","single",["Big Mac"]],["Sammy Sosa","walk"]],"McGwire hit 65 and Sosa hit 63."],
    ["Who hit at least 73 home runs in the 2001 season?",[["Barry Bonds","walk"]],"Bonds set the major-league single-season record with 73."],
    ["Who hit at least 58 home runs in the 2006 season?",[["Ryan Howard","single"]],"Howard hit 58 for Philadelphia."],
    ["Who hit at least 59 home runs in the 2017 season?",[["Giancarlo Stanton","single"]],"Stanton led the majors with 59."],
    ["Who hit at least 62 home runs in the 2022 season?",[["Aaron Judge","walk"]],"Judge set the American League single-season record."],
    ["Who hit at least 58 home runs in the 2024 season?",[["Aaron Judge","walk"]],"Judge led the majors with 58."],
    ["Name an AL or NL hitter with at least 56 home runs in 2025.",[["Cal Raleigh","walk"],["Kyle Schwarber","double"]],"Raleigh hit 60 for Seattle and Schwarber hit 56 for Philadelphia."],
    ["Who hit at least 60 home runs in the 1927 season?",[["Babe Ruth","walk"]],"Ruth's 60 stood as the record until 1961."],
    ["Who hit at least 61 home runs in the 1961 season?",[["Roger Maris","single"]],"Maris broke Ruth's single-season record."],
    ["Who hit at least 58 home runs in the 1932 season?",[["Jimmie Foxx","double"]],"Foxx hit 58, an American League record at the time."],
    ["Who hit at least 56 home runs in the 1930 season?",[["Hack Wilson","home-run"]],"Wilson hit 56 and drove in a still-standing 191 runs."],
    ["Who hit at least 58 home runs in the 1938 season?",[["Hank Greenberg","double"]],"Greenberg hit 58 for Detroit."],
    ["Name an AL or NL hitter with at least 51 home runs in 1947.",[["Johnny Mize","home-run"],["Ralph Kiner","double"]],"Mize and Kiner shared the major league lead with 51 each."],
    ["Who hit at least 52 home runs in the 1956 season?",[["Mickey Mantle","walk"]],"Mantle hit 52 while winning the Triple Crown."],
    ["Who hit at least 52 home runs in the 1965 season?",[["Willie Mays","single"]],"Mays hit 52 for San Francisco."],
    ["Who hit at least 52 home runs in the 1996 season?",[["Mark McGwire","walk",["Big Mac"]]],"McGwire hit 52 for Oakland."],
    ["Who hit at least 50 home runs in the 2000 season?",[["Sammy Sosa","single"]],"Sosa hit 50 for the Cubs."],
    ["Who hit at least 51 home runs in the 2005 season?",[["Andruw Jones","double"]],"Jones hit 51 for Atlanta."],
    ["Who hit at least 54 home runs in the 2007 season?",[["Alex Rodriguez","walk",["A-Rod"]]],"Rodriguez hit 54 for the Yankees."],
    ["Who hit at least 54 home runs in the 2010 season?",[["Jose Bautista","double"]],"Bautista led the majors with 54."],
    ["Who hit at least 53 home runs in the 2013 season?",[["Chris Davis","double"]],"Davis led the majors with 53."],
    ["Who hit at least 59 home runs in the 1921 season?",[["Babe Ruth","walk"]],"Ruth's 59 established a new single-season record."],
    ["Who hit at least 54 home runs in the 1928 season?",[["Babe Ruth","walk"]],"Ruth hit 54 for the Yankees."],
    ["Name an AL or NL hitter with at least 56 home runs in 1997.",[["Mark McGwire","walk"],["Ken Griffey Jr.","single"]],"McGwire hit 58 across two clubs and Griffey hit 56 for Seattle."],
    ["Name an AL or NL player who had at least six hits in a game in 2001.",[["Paul Lo Duca","double"],["Damion Easley","home-run"]],"Lo Duca did it for the Dodgers on May 28 and Easley for Detroit on August 8."],
    ["Name an AL or NL player who collected at least 222 hits in 1927.",[["Paul Waner","single",["Big Poison"]],["Earle Combs","double"],["Lloyd Waner","home-run",["Little Poison"]]],"Paul Waner had 234 hits, Combs 230, and Lloyd Waner 222."],
    ["Name an AL or NL player who had at least six hits in a game in 2025.",[["Nick Kurtz","single"],["Austin Wynns","home-run"]],"Wynns did it for Cincinnati on April 20 and Kurtz for the Athletics on July 25."]
  ];
  const tierByName = new Map([
    ["Barry Bonds","walk"],["Babe Ruth","walk"],["Shohei Ohtani","walk"],["Aaron Judge","walk"],
    ["Sammy Sosa","single"],["Mark McGwire","single"],["Mickey Mantle","walk"],["Willie Mays","single"],
    ["Yoshinobu Yamamoto","home-run"],["Hack Wilson","home-run"],["Johnny Mize","home-run"],["Kyle Schwarber","double"],
    ["New York Yankees","walk"],["Arizona Diamondbacks","double"],["Anaheim Angels","double"],
    ["Florida Marlins","home-run"],["Chicago White Sox","double"],["Washington Nationals","home-run"],
    ["Kansas City Royals","double"],["Texas Rangers","home-run"],["Atlanta Braves","walk"],
    ["Josh Gibson","walk"],["Buck Leonard","double"],["Satchel Paige","walk"],
    ["Scott Brosius","home-run"],["Troy Glaus","double"],["Josh Beckett","double"],
    ["Jermaine Dye","double"],["David Eckstein","home-run"],["Mike Lowell","single"],
    ["Edgar Renteria","single"],["Pablo Sandoval","single"],["Steve Pearce","home-run"],
    ["Stephen Strasburg","single"],["Jorge Soler","double"],["Jeremy Pena","home-run"],
    ["Roger Clemens","walk"],["Tom Glavine","single"],["Pedro Martinez","walk"],
    ["Randy Johnson","walk"],["David Price","single"],["R.A. Dickey","home-run"],
    ["Corey Kluber","single"],["Sandy Alcantara","double"],["Paul Skenes","walk"],
    ["Kerry Wood","single"],["Scott Williamson","home-run"],["Kazuhiro Sasaki","home-run"],
    ["Jason Jennings","home-run"],["Angel Berroa","home-run"],["Huston Street","double"],
    ["Neftali Feliz","home-run"],["Jeremy Hellickson","home-run"],["Jose Fernandez","double"],
    ["Wil Myers","double"],["Michael Fulmer","home-run"],["Devin Williams","double"],
    ["Jonathan India","double"],["Nick Kurtz","home-run"],["Drake Baldwin","home-run"]
  ]);
  const awardsRef=section=>source("Retrosheet awards and honors",`${retrosheetAwards}#${section}`);
  const mvpQuestions = mvp.flatMap(([year,nl,al])=>[
    record(`player-${year}-nl`,"player",`${nl.split(" ")[0]} ___ won the ${year} NL MVP. Name the player.`,[answer(nl,tierByName.get(nl)||"walk")],`${year} National League Most Valuable Player.`,awardsRef("A4"),"player-name"),
    record(`player-${year}-al`,"player",`${al.split(" ")[0]} ___ won the ${year} AL MVP. Name the player.`,[answer(al,tierByName.get(al)||"walk")],`${year} American League Most Valuable Player.`,awardsRef("A4"),"player-name")
  ]);
  const negroHallSource={
    ...awardsRef("A1"),
    corroboration:"https://baseballhall.org/hall-of-fame/hall-of-famers-by-election-method"
  };
  mvpQuestions[0]=record("negro-leagues-hof-1972","player","Josh ___ and Buck ___ made the Hall of Fame in 1972 via the Negro Leagues committee. Name either player.",[answer("Josh Gibson","walk"),answer("Buck Leonard","double")],"Gibson and Leonard were elected by the Committee on Negro Baseball Leagues in 1972.",negroHallSource,"player-name");
  mvpQuestions[1]=record("negro-leagues-hof-1971","player","Satchel ___ was the Negro Leagues committee’s first Hall of Fame electee in 1971. Name the pitcher.",[answer("Satchel Paige","walk",["Leroy Paige"])],"Satchel Paige was elected in 1971.",negroHallSource,"player-name");
  const batting = battingRows.map(([question,answers,details],i)=>{
    const year=question.match(/\b\d{4}\b/)[0];
    const wording=question.replace("Who hit at least", "Name an AL or NL player who hit at least");
    const ref=source(`Retrosheet ${year} regular season event files`,`https://www.retrosheet.org/events/${year}eve.zip`);
    return record(`batting-${i+1}`,"batting",wording,answers,details,ref,"batting");
  });
  const pitching = cyYoung.map(([al,nl],i)=>{
    const year=1998+i;
    return record(`pitching-${year}`,"pitching",`Name a Cy Young Award winner from ${year}.`,[answer(al,tierByName.get(al)||"walk"),answer(nl,tierByName.get(nl)||"single")],`${year} American and National League Cy Young Award winners.`,awardsRef("A5"),"pitching");
  });
  const awards = rookie.map(([nl,al],i)=>{
    const year=1998+i;
    return record(`awards-${year}`,"awards",`Name a Rookie of the Year Award winner from ${year}.`,[answer(nl,tierByName.get(nl)||"single"),answer(al,tierByName.get(al)||"walk")],`${year} National and American League Rookie of the Year winners.`,awardsRef("A6"),"awards");
  });
  const franchises = champions.map((team,i)=>{
    const year=1998+i;
    const aliases=team==="Anaheim Angels"?["Los Angeles Angels","Angels"]:team==="Florida Marlins"?["Miami Marlins","Marlins"]:team==="Washington Nationals"?["Montreal Expos","Nationals"]:team==="San Francisco Giants"?["New York Giants","Giants"]:team==="Los Angeles Dodgers"?["Brooklyn Dodgers","Dodgers"]:team==="Atlanta Braves"?["Boston Braves","Milwaukee Braves","Braves"]:team==="Chicago White Sox"?["White Sox"]:team==="Chicago Cubs"?["Cubs"]:team==="Boston Red Sox"?["Red Sox"]:team==="New York Yankees"?["Yankees"]:team==="Houston Astros"?["Astros"]:team==="St. Louis Cardinals"?["Cardinals"]:team==="Kansas City Royals"?["Royals"]:team==="Arizona Diamondbacks"?["Diamondbacks","D-backs"]:team==="Philadelphia Phillies"?["Phillies"]:team==="Texas Rangers"?["Rangers"]:team;
    const ref=source(`Retrosheet ${year} postseason results`,`https://www.retrosheet.org/boxesetc/${year}/YPS_${year}.htm`);
    return record(`franchise-${year}`,"franchises",`Which franchise won the World Series in ${year}?`,[answer(team,tierByName.get(team)||"walk",Array.isArray(aliases)?aliases:[aliases])],`${year} World Series champion.`,ref,"franchise");
  });
  const postseason = worldSeriesMvp.map((winners,i)=>{
    const year=1998+i;
    const names=[winners].flat();
    const details=names.length===1?`${year} World Series Most Valuable Player.`:"Johnson and Schilling shared the award.";
    return record(`postseason-${year}`,"postseason",`Name a World Series MVP from ${year}.`,names.map(name=>answer(name,tierByName.get(name)||"single")),details,awardsRef("A10"),"postseason");
  });
  const all = [...mvpQuestions,...batting,...pitching,...awards,...franchises,...postseason];
  const decks = years.map((year,i)=>[
    mvpQuestions[i*2],mvpQuestions[i*2+1],batting[i],pitching[i],awards[i],franchises[i],postseason[i]
  ]);
  window.HOMERUN_BANK = {all,decks,cycleStart:"2026-11-19"};
})();
