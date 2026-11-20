(() => {
  const POINTS=Object.freeze({walk:10,single:50,double:100,"home-run":200});
  const OUTCOMES=Object.freeze({walk:{id:"walk",label:"WALK"},single:{id:"single",label:"SINGLE"},double:{id:"double",label:"DOUBLE"},"home-run":{id:"home-run",label:"HOME RUN"}});
  const easternCalendar=new Intl.DateTimeFormat("en-CA",{timeZone:"America/New_York",year:"numeric",month:"2-digit",day:"2-digit"});
  function normalize(value) {
    return String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
  }
  function distance(a,b) {
    if(a===b)return 0;
    let previous=Array.from({length:b.length+1},(_,i)=>i);
    for(let i=1;i<=a.length;i++){
      const row=[i];
      for(let j=1;j<=b.length;j++)row[j]=Math.min(row[j-1]+1,previous[j]+1,previous[j-1]+(a[i-1]===b[j-1]?0:1));
      previous=row;
    }
    return previous[b.length];
  }
  function resolveGuess(guess,answers) {
    const value=normalize(guess);
    if(!value)return{kind:"empty"};
    const entries=answers.map(item=>{
      const aliases=[...(item.aliases||[]),item.name].map(normalize).filter(Boolean);
      const surname=item.allowSurname===false?"":normalize(item.name).replace(/ (jr|sr|ii|iii|iv)$/,"").split(" ").at(-1);
      if(surname) aliases.push(surname);
      return{item,aliases:[...new Set(aliases)]};
    });
    const exact=entries.filter(entry=>entry.aliases.includes(value));
    if(exact.length===1)return{kind:"correct",answer:exact[0].item};
    if(exact.length>1)return{kind:"ambiguous"};
    const candidates=entries.map(entry=>({entry,score:Math.min(...entry.aliases.map(alias=>distance(value,alias)))}));
    const best=Math.min(...candidates.map(candidate=>candidate.score));
    const length=value.replace(/ /g,"").length;
    const limit=length>=8?2:length>=5?1:0;
    const close=candidates.filter(candidate=>candidate.score===best&&best<=limit);
    if(close.length===1)return{kind:"correct",answer:close[0].entry.item,corrected:true};
    if(close.length>1)return{kind:"ambiguous"};
    return{kind:"incorrect"};
  }
  function etDate(date=new Date()) {
    const parts=easternCalendar.formatToParts(date);
    const get=type=>parts.find(part=>part.type===type).value;
    return`${get("year")}-${get("month")}-${get("day")}`;
  }
  function dailyIndex(date,cycleStart="2026-11-19") {
    const day=value=>Date.UTC(...value.split("-").map((n,i)=>i===1?Number(n)-1:Number(n)));
    const elapsed=Math.floor((day(date)-day(cycleStart))/86_400_000);
    return((elapsed%28)+28)%28;
  }
  const logic={POINTS,OUTCOMES,normalize,distance,resolveGuess,etDate,dailyIndex,pointValue:tier=>POINTS[tier]||0,answerOutcome:tier=>OUTCOMES[tier]||OUTCOMES.walk,chooseTimeout:random=>random()<.5?"STRIKE":"FOUL"};
  if(typeof module!=="undefined"&&module.exports)module.exports=logic;
  if(typeof window!=="undefined")window.HomerunCore=logic;
})();
