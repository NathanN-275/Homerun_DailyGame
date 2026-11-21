import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
const bankContext={window:{}};
const coreContext={module:{exports:{}}};
vm.runInNewContext(await readFile(new URL("./core.js",import.meta.url),"utf8"),coreContext);
const core=coreContext.module.exports;
const styles=await readFile(new URL("./styles.css",import.meta.url),"utf8");
const app=await readFile(new URL("./app.js",import.meta.url),"utf8");
const markup=await readFile(new URL("./index.html",import.meta.url),"utf8");
const coreCode=await readFile(new URL("./core.js",import.meta.url),"utf8");
vm.runInNewContext(await readFile(new URL("./questions.js",import.meta.url),"utf8"),bankContext);
const {all,decks,cycleStart}=bankContext.window.HOMERUN_BANK;
assert.equal(all.length,196,"the bank has seven prompts for each of 28 days");
assert.equal(decks.length,28);
assert.equal(new Set(all.map(q=>q.id)).size,196,"prompt IDs are unique");
assert.equal(new Set(all.map(q=>q.question)).size,196,"daily prompts do not repeat");
for(const deck of decks){
  assert.equal(deck.length,7);
  assert.ok(deck.slice(0,2).every(q=>q.category==="player"));
  assert.deepEqual(Array.from(deck.slice(2).map(q=>q.category)),["batting","pitching","awards","franchises","postseason"]);
  for(const prompt of deck){
    assert.ok(prompt.source.title&&prompt.source.url&&prompt.source.cutoff,`source and cutoff for ${prompt.id}`);
    assert.ok(prompt.answers.length>=2,`multiple valid answers for ${prompt.id}`);
    assert.equal(new Set(prompt.answers.map(answer=>core.normalize(answer.name))).size,prompt.answers.length);
    for(const answer of prompt.answers){
      assert.ok(core.POINTS[answer.tier],`tier for ${prompt.id}/${answer.name}`);
      assert.ok(answer.aliases.includes(answer.name),`canonical alias for ${prompt.id}/${answer.name}`);
      for(const alias of answer.aliases)assert.equal(core.resolveGuess(alias,prompt.answers).kind,"correct",`alias ${alias} resolves`);
    }
  }
}

const misspelled=core.resolveGuess("Shohei Ohtan",[{name:"Shohei Ohtani",tier:"walk",aliases:["Shohei Ohtani"]}]);
assert.equal(misspelled.kind,"correct");
assert.equal(misspelled.corrected,true,"a unique clear typo is corrected");
assert.equal(core.resolveGuess("Young",[
  {name:"Chris Young",aliases:["Chris Young"]},{name:"Mike Young",aliases:["Mike Young"]}
]).kind,"ambiguous","shared last names stay unresolved");
assert.equal(core.resolveGuess("Babe Ruth",[{name:"Mickey Mantle",aliases:["Mickey Mantle"]}]).kind,"incorrect");
assert.deepEqual(["walk","single","double","home-run"].map(core.pointValue),[10,50,100,200]);
assert.deepEqual(["walk","single","double","home-run"].map(tier=>core.answerOutcome(tier).label),["WALK","SINGLE","DOUBLE","HOME RUN"]);
assert.equal(core.chooseTimeout(()=>0),"STRIKE");
assert.equal(core.chooseTimeout(()=>.99),"FOUL");
assert.match(styles,/\.result-banner\.show\{opacity:1/,"result text stays visible with reduced motion");
assert.match(styles,/prefers-reduced-motion:reduce/,"reduced-motion styles are defined");
assert.match(styles, /\[data-outcome="strike"\] .baseball \{ animation: strike-pitch/);
assert.match(styles, /\[data-outcome="foul"\] .baseball \{ animation: foul-ball/);
assert.equal(core.etDate(new Date("2026-11-20T04:59:59Z")),"2026-11-19");
assert.equal(core.etDate(new Date("2026-11-20T05:00:00Z")),"2026-11-20");
assert.equal(core.dailyIndex(cycleStart),0);
assert.equal(core.dailyIndex("2026-12-17"),0,"the daily schedule repeats after 28 days");
assert.equal(core.dailyIndex("2026-11-20"),1,"midnight Eastern selects the next daily deck");
assert.equal(core.resolveGuess("Waner",all.find(q=>q.id==="batting-27").answers).kind,"ambiguous");
assert.equal(core.resolveGuess("Sox",all.find(q=>q.id==="franchise-2005").answers).kind,"incorrect");
const batting1999=all.find(q=>q.id==="batting-2");
assert.equal(core.resolveGuess("Big Mac",batting1999.answers).answer.name,"Mark McGwire");
assert.equal(core.resolveGuess("Sammy Sosa",batting1999.answers).answer.name,"Sammy Sosa");

// Run the actual game controller against the markup IDs with a deterministic clock and storage.
let now=Date.parse("2026-11-20T04:50:00Z");
let sampleRandom=()=>0;
const storage=new Map();
class TestDate extends Date {
  constructor(value=now) { super(value); }
  static now() { return now; }
}
function loadGame() {
  function node() {
    const classes=new Set();
    return {
      textContent:"", value:"", dataset:{}, style:{setProperty(name,value){this[name]=value;}}, events:{},
      classList:{contains:name=>classes.has(name),add:name=>classes.add(name),
        toggle(name,on) { if(on) classes.add(name); else classes.delete(name); }},
      addEventListener(event,handler) { this.events[event]=handler; },
      focus(){}
    };
  }
  const nodes=Object.fromEntries([...markup.matchAll(/\bid="([^"]+)"/g)].map(([,id])=>[id,node()]));
  nodes["base-state"].children=["second","first"].map(base=>Object.assign(node(),{dataset:{base}}));
  let tick;
  const window={HOMERUN_BANK:bankContext.window.HOMERUN_BANK,setInterval(handler){ tick=handler; },addEventListener(){}};
  const context=vm.createContext({window,Date:TestDate,Math:Object.assign(Object.create(Math),{random:()=>sampleRandom()}),
    localStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)},
    document:{getElementById:id=>nodes[id]}});
  vm.runInContext(coreCode,context);
  vm.runInContext(app,context);
  return {nodes, tick, submit(guess){
    nodes["answer-input"].value=guess;
    nodes["answer-form"].events.submit({preventDefault(){}});
  }};
}
let browser=loadGame();
browser.nodes["start-button"].events.click();
now+=3_000;
browser=loadGame();
assert.equal(browser.nodes["timer-value"].textContent,"27");
browser.submit("Ty Cobb");
assert.match(browser.nodes["answer-feedback"].textContent,/another cut/);
assert.equal(browser.nodes["timer-value"].textContent,"27");
assert.equal(browser.nodes["at-bat"].textContent,"01");

function expectOutcome(guess,outcome,score,base) {
  browser.submit(guess);
  assert.equal(browser.nodes.stadium.dataset.outcome,outcome);
  assert.equal(Number(browser.nodes.score.textContent),score);
  for(const marker of browser.nodes["base-state"].children) {
    assert.equal(marker.classList.contains("active"),marker.dataset.base===base);
  }
  now+=1_400;
  browser.tick();
  assert.equal(browser.nodes.stadium.dataset.outcome,"");
}
expectOutcome("Yordan Alvare","walk",10,"first");
expectOutcome("Kyle Schwarber","single",60,"first");
expectOutcome("Ben Rice","home-run",260);
expectOutcome("Jacob Misiorowski","single",310,"first");
expectOutcome("Kevin McGonigle","walk",320,"first");
expectOutcome("Tampa Bay Rays","single",370,"first");
for(const [value,outcome] of [[0,"strike"],[.99,"foul"]]) {
  sampleRandom=()=>value;
  now+=30_000;
  browser.tick();
  assert.equal(browser.nodes.stadium.dataset.outcome,outcome);
  assert.ok(browser.nodes["result-banner"].classList.contains("show"));
    assert.equal(Number(browser.nodes.score.textContent),370);
  const rightLanding=browser.nodes.stadium.style["--foul-x"];
  browser=loadGame();
  assert.equal(browser.nodes.stadium.dataset.outcome,outcome);
  if(outcome==="foul") {
    assert.ok(parseFloat(rightLanding)>500);
    assert.equal(browser.nodes.stadium.style["--foul-x"],rightLanding);
  }
  now+=1_400;
  browser.tick();
  assert.equal(browser.nodes["timer-value"].textContent,"30");
}
expectOutcome("William Contreras","single",420,"first");
browser=loadGame();
assert.match(browser.nodes.postgame.innerHTML,/PERSONAL BEST · 420/);
assert.match(browser.nodes.postgame.innerHTML,/STRIKE \+0[\s\S]*FOUL \+0/);
assert.equal([...browser.nodes.postgame.innerHTML.matchAll(/<details class="answer-review">/g)].length,7);
for(const [label,points] of [["WALK",10],["SINGLE",50],["DOUBLE",100],["HOME RUN",200]]) {
  assert.match(browser.nodes.postgame.innerHTML,new RegExp(`${label} · ${points} pts`));
}
browser.nodes["start-button"].events.click();
assert.equal(browser.nodes.score.textContent,"420");
assert.equal(browser.nodes["game-status"].textContent,"FINAL");
now=Date.parse("2026-11-20T05:00:00Z");
browser.tick();
assert.equal(browser.nodes["panel-day"].textContent,"DAY 02 / 28");
assert.equal(browser.nodes.score.textContent,"000");
assert.equal(browser.nodes["timer-value"].textContent,"30");
assert.equal(JSON.parse([...storage.values()][0]).best,420);
browser.nodes["start-button"].events.click();
for(const horizontalRoll of [.05,.5,.95]) {
  const rolls=[.9,horizontalRoll,.3];
  sampleRandom=()=>rolls.shift();
  now+=30_000;
  browser.tick();
  assert.equal(browser.nodes.stadium.dataset.outcome,"foul");
  const x=parseFloat(browser.nodes.stadium.style["--foul-x"]);
  const y=parseFloat(browser.nodes.stadium.style["--foul-y"]);
  assert.equal(x,32+936*horizontalRoll);
  assert.ok(y>496-Math.abs(x-500)*197/402 && y<=544);
  now+=1_400;
  browser.tick();
}
console.log("Verified 196 prompts, 28 decks, answer matching, all scoring and timeout states, reload and resume, the completion lock, and midnight Eastern rollover.");
