(() => {
  const TOTAL = 7;
  const ROUND_MS = 30_000;
  const ANIMATION_MS = 1_350;
  const STORAGE_KEY = "homerun.daily.v1";
  const {normalize,resolveGuess,etDate,dailyIndex,pointValue,answerOutcome,chooseTimeout}=window.HomerunCore;
  const $ = id => document.getElementById(id);
  const elements = {
    panel:$('game-panel'),intro:$('intro-card'),start:$('start-button'),form:$('answer-form'),input:$('answer-input'),
    title:$('question-title'),hint:$('question-hint'),category:$('category-tag'),counter:$('question-counter'),
    day:$('panel-day'),date:$('date-label'),timer:$('timer-value'),timerBar:$('timer-bar'),score:$('score'),atBat:$('at-bat'),
    status:$('game-status'),inning:$('inning-label'),bug:$('scorebug-count'),feedback:$('answer-feedback'),
    details:$('result-details'),banner:$('result-banner'),stadium:$('stadium'),bases:$('base-state'),postgame:$('postgame')
  };
  const categories = {player:"PLAYER NAME",batting:"BATTING",pitching:"PITCHING",awards:"AWARDS",franchises:"FRANCHISES",postseason:"POSTSEASON"};
  const rarityLabels = {walk:"COMMON",single:"KNOWN",double:"DEEP CUT","home-run":"DEEPEST CUT"};

  function dailyDeckIndex(date) { return dailyIndex(date,window.HOMERUN_BANK.cycleStart); }
  function deckFor(date) { return window.HOMERUN_BANK.decks[dailyDeckIndex(date)]; }
  function emptyGame(date) { return {date,phase:"ready",questionIndex:0,score:0,hits:[],deadline:0,pending:null}; }
  function readStore() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY))||{}; } catch { return {}; }
  }
  let store=readStore();
  let today=etDate();
  let game=store.game?.date===today?store.game:emptyGame(today);

  function save() {
    store.game=game;
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify(store)); } catch { /* The current tab can still play. */ }
  }
  function setDate() {
    elements.date.textContent=new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",month:"short",day:"numeric"}).format(new Date(`${today}T12:00:00-05:00`)).toUpperCase();
    elements.day.textContent=`DAY ${String(dailyIndex(today)+1).padStart(2,"0")} / 28`;
  }
  function currentQuestion() { return deckFor(game.date)[game.questionIndex]; }
  function render() {
    elements.panel.classList.toggle("ready",game.phase==="ready");
    elements.panel.classList.toggle("hidden",game.phase==="complete");
    elements.intro.classList.toggle("hidden",game.phase!=="ready");
    elements.postgame.classList.toggle("hidden",game.phase!=="complete");
    elements.stadium.dataset.outcome=game.pending?.outcome.id||"";
    const landing=game.pending?.landing;
    elements.stadium.style.setProperty("--foul-x",landing?`${landing.x}px`:"");
    elements.stadium.style.setProperty("--foul-y",landing?`${landing.y}px`:"");
    elements.banner.classList.toggle("show",game.phase==="result");
    const occupied=game.pending?.outcome.id;
    for (const base of elements.bases.children) {
      base.classList.toggle("active",base.dataset.base===(occupied==="double"?"second":["walk","single"].includes(occupied)?"first":""));
    }
    if(game.phase==="complete") { renderPostgame(); return; }
    const question=currentQuestion();
    elements.score.textContent=String(game.score).padStart(3,"0");
    elements.atBat.textContent=String(game.phase==="ready"?0:Math.min(game.questionIndex+1,TOTAL)).padStart(2,"0");
    elements.status.textContent=game.phase==="ready"?"DAILY GAME":game.phase==="result"?"BALL IN PLAY":"AT THE PLATE";
    elements.inning.textContent=game.phase==="ready"?"PLAY BALL":game.phase==="result"?"RESULT":"7 AT-BATS";
    if(!question) return;
    elements.title.textContent=question.question;
    elements.hint.textContent="Name any one valid answer. Rarer answers score more.";
    elements.category.textContent=categories[question.category]||question.category.toUpperCase();
    elements.counter.textContent=`AT-BAT ${String(game.questionIndex+1).padStart(2,"0")} / ${TOTAL}`;
    elements.form.classList.toggle("hidden",game.phase!=="playing");
    elements.details.classList.toggle("visible",Boolean(game.pending));
    if(game.pending) {
      const result=game.pending;
      elements.details.innerHTML=result.type==="correct"
        ? `<strong>${escapeHTML(result.answer.name.toUpperCase())}</strong> · ${rarityLabels[result.answer.tier]} · ${result.outcome.label} +${result.points} POINTS<br>${result.corrected?"Typo corrected. ":""}${escapeHTML(question.details)}`
        : `<strong>${escapeHTML(result.label)}</strong> · 0 POINTS<br>${escapeHTML(question.details)}`;
    } else elements.details.textContent="";
    elements.banner.textContent=game.pending?.label||"";
    elements.banner.dataset.kind=game.pending?.outcome?.id||"";
    updateTimer(Date.now());
  }
  function updateTimer(now) {
    const ms=game.phase==="ready"?ROUND_MS:Math.max(0,game.deadline-now);
    const seconds=Math.ceil(ms/1000);
    elements.timer.textContent=String(seconds).padStart(2,"0");
    elements.bug.textContent=`00:${String(seconds).padStart(2,"0")}`;
    elements.timerBar.style.width=`${ms/ROUND_MS*100}%`;
    elements.timerBar.classList.toggle("low",seconds<=8);
  }
  function startGame() {
    tick();
    if(game.phase!=="ready") return;
    game.phase="playing";
    game.deadline=Date.now()+ROUND_MS;
    save();render();elements.input.focus({preventScroll:true});
  }
  function tick() {
    const now=Date.now();
    const current=etDate(new Date(now));
    if(current!==today) {
      today=current;
      game=store.game?.date===today?store.game:emptyGame(today);
      elements.feedback.textContent="";
      elements.input.value="";
      save();setDate();render();
    }
    if(game.phase==="playing"&&now>=game.deadline) timeOut();
    if(game.phase==="result"&&now>=game.pending.advanceAt) advance();
    if(game.phase==="playing") updateTimer(now);
  }
  function submit(event) {
    event.preventDefault();
    tick();
    if(game.phase!=="playing") return;
    const result=resolveGuess(elements.input.value,currentQuestion().answers);
    elements.feedback.className="answer-feedback";
    if(result.kind==="empty") return;
    if(result.kind==="incorrect") { elements.feedback.textContent="Not in the book. Same question, same clock—take another cut.";return; }
    if(result.kind==="ambiguous") { elements.feedback.textContent="That guess matches more than one answer. Try the full name.";elements.feedback.classList.add("warning");return; }
    const outcome=answerOutcome(result.answer.tier);
    const points=pointValue(result.answer.tier);
    game.score+=points;
    finishAtBat({type:"correct",answer:result.answer,corrected:result.corrected,outcome,points,label:outcome.label});
  }
  function timeOut(random=Math.random) {
    if(game.phase!=="playing") return;
    const label=chooseTimeout(random);
    const landing=label==="FOUL"?foulLanding(random):undefined;
    finishAtBat({type:"timeout",label,outcome:{id:label.toLowerCase(),label},points:0,landing});
  }
  function foulLanding(random) {
    const x=32+936*random();
    // SVG foul lines run from home (500, 496) to the poles at (98, 299) and (902, 299).
    const foulLineY=496-Math.abs(x-500)*197/402;
    const minY=foulLineY+12;
    return {x,y:minY+(544-minY)*random()};
  }
  function finishAtBat(pending) {
    game.phase="result";
    game.pending={...pending,advanceAt:Date.now()+ANIMATION_MS};
    game.hits[game.questionIndex]={
      question:currentQuestion(),answer:pending.answer?.name,outcome:pending.label,points:pending.points
    };
    if(game.questionIndex===TOTAL-1) store.best=Math.max(store.best||0,game.score);
    game.deadline=0;
    elements.feedback.textContent="";
    elements.input.value="";
    save();render();
  }
  function advance() {
    if(game.phase!=="result") return;
    game.pending=null;
    game.questionIndex++;
    if(game.questionIndex>=TOTAL) {
      game.phase="complete";
      store.best=Math.max(store.best||0,game.score);
    } else {
      game.phase="playing";
      game.deadline=Date.now()+ROUND_MS;
    }
    save();render();
    if(game.phase==="playing") elements.input.focus({preventScroll:true});
  }
  function renderPostgame() {
    elements.form.classList.add("hidden");
    const rows=deckFor(game.date).map((scheduledQuestion,index)=>{
      const hit=game.hits[index];
      const question=hit?.question||scheduledQuestion;
      const accepted=question.answers.find(answer=>answer.name===hit?.answer);
      const answers=[...question.answers].sort((left,right)=>
        pointValue(right.tier)-pointValue(left.tier)||left.name.localeCompare(right.name));
      const filters=["all","home-run","double","single","walk"].map(tier=>{
        const count=tier==="all"?answers.length:answers.filter(answer=>answer.tier===tier).length;
        const label=tier==="all"?"All":answerOutcome(tier).label;
        return `<button type="button" class="tier-filter" data-tier="${tier}" aria-pressed="${tier==="all"}">${label} ${count}</button>`;
      }).join("");
      const entries=answers.map(answer=>{
        const searchText=normalize([answer.name,...answer.aliases].join(" "));
        return `<li data-tier="${answer.tier}" data-search="${escapeHTML(searchText)}"><span>${escapeHTML(answer.name)}</span>
          <span class="answer-tier">${answerOutcome(answer.tier).label} · ${pointValue(answer.tier)} pts</span></li>`;
      }).join("");
      return `<details class="answer-review">
        <summary>
          <strong>${String(index+1).padStart(2,"0")} · ${escapeHTML(question.question)}</strong>
          <span class="review-answer" data-tier="${accepted?.tier||"out"}">
            ${hit?.answer?`Your answer: ${escapeHTML(hit.answer)} · `:""}${escapeHTML(hit?.outcome||"TIMEOUT")} +${hit?.points||0}
          </span>
        </summary>
        <div class="answer-browser">
          <div class="tier-filters" role="group" aria-label="Filter answers for at-bat ${index+1}">${filters}</div>
          <label class="sr-only" for="answer-search-${index}">Search answers for at-bat ${index+1}</label>
          <input type="search" id="answer-search-${index}" class="answer-search" placeholder="Search answers…" autocomplete="off">
          <ul class="answer-results">${entries}</ul>
          <p class="answer-list-status" aria-live="polite">${answers.length} answers</p>
          <p class="answer-sources">
            <a href="${escapeHTML(question.source.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(question.source.title)}</a>
            ${question.source.corroboration ? ` · <a href="${escapeHTML(question.source.corroboration)}" target="_blank" rel="noopener noreferrer">Baseball Hall of Fame</a>` : ""}
            · <a href="${escapeHTML(question.furtherReading)}" target="_blank" rel="noopener noreferrer">Baseball Reference</a>
          </p>
        </div>
      </details>`;
    }).join("");
    elements.postgame.innerHTML=`
      <div class="finish-card">
        <h2 id="final-heading">FINAL SCORE</h2>
        <div class="final-score">${String(game.score).padStart(3,"0")}</div>
        <p class="best-line">PERSONAL BEST · ${String(store.best||game.score).padStart(3,"0")}</p>
        <p>The next daily game opens at midnight Eastern.</p>
      </div>
      <section class="hit-log" aria-labelledby="review-heading">
        <h3 id="review-heading">REVIEW YOUR AT-BATS</h3>
        ${rows}
      </section>`;
    elements.score.textContent=String(game.score).padStart(3,"0");
    elements.atBat.textContent="07";elements.status.textContent="FINAL";elements.inning.textContent="GAME OVER";
  }
  function filterReview(event) {
    const button=event.target.closest(".tier-filter");
    if(event.type==="click"?!button:!event.target.matches(".answer-search")) return;
    const review=event.target.closest(".answer-review");
    if(button) {
      for(const filter of review.querySelectorAll(".tier-filter")) {
        filter.setAttribute("aria-pressed",String(filter===button));
      }
    }
    const tier=review.querySelector('.tier-filter[aria-pressed="true"]').dataset.tier;
    const query=normalize(review.querySelector(".answer-search").value);
    let count=0;
    for(const entry of review.querySelectorAll(".answer-results li")) {
      entry.hidden=(tier!=="all"&&entry.dataset.tier!==tier)||!entry.dataset.search.includes(query);
      if(!entry.hidden) count++;
    }
    review.querySelector(".answer-list-status").textContent=count===0?"No matching answers.":`${count} ${count===1?"answer":"answers"}`;
  }
  function escapeHTML(value) { return String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char])); }
  elements.start.addEventListener("click",startGame);
  elements.form.addEventListener("submit",submit);
  elements.postgame.addEventListener("click",filterReview);
  elements.postgame.addEventListener("input",filterReview);
  setDate();
  render();
  tick();
  window.setInterval(tick,200);
  window.addEventListener("storage",event=>{
    if(event.key!==STORAGE_KEY) return;
    const latest=readStore();
    if(latest.game?.date!==today) return;
    store=latest;
    game=store.game;
    render();
  });
})();
