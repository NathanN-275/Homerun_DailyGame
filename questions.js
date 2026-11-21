/*
 * Seven open-answer prompts per day. Season records stop at 2026.
 * Retrosheet supplies historical answer sets; MLB.com supplies 2026 results. Scoring tiers are editorial.
 */
(() => {
  const retrosheetAwards = "https://www.retrosheet.org/boxesetc/MISC/XOH.htm";
  const bRef = name => `https://www.baseball-reference.com/search/search.fcgi?search=${encodeURIComponent(name)}`;
  const playerAliases = {
    "Alex Rodriguez":["A-Rod","Arod"], "Ichiro Suzuki":["Ichiro"], "Ivan Rodriguez":["Pudge Rodriguez"],
    "Mark McGwire":["Big Mac"], "David Ortiz":["Big Papi"], "Randy Johnson":["Big Unit","The Big Unit"],
    "Felix Hernandez":["King Felix"], "Giancarlo Stanton":["Mike Stanton"], "R.A. Dickey":["RA Dickey"],
    "CC Sabathia":["C.C. Sabathia"], "Ronald Acuna Jr.":["Ronald Acuna"], "Michael Harris II":["Michael Harris"],
    "Ken Griffey Jr.":["Ken Griffey","Junior","The Kid"], "Babe Ruth":["George Herman Ruth","The Bambino"],
    "Satchel Paige":["Leroy Paige"], "Cool Papa Bell":["James Bell","Cool Papa"], "Pop Lloyd":["John Henry Lloyd"],
    "Paul Waner":["Big Poison"], "Lloyd Waner":["Little Poison"]
  };
  const years = [2026, ...Array.from({length:27}, (_, i) => 1999+i)];
  const source = (title, url, cutoff="2025 season") => ({title, url, cutoff});
  const record = (id, category, question, answers, details, ref) => ({
    id, category, question,
    answers:answers.map(([name,tier,aliases])=>({
      name,tier,aliases:[...new Set([name,...(playerAliases[name]||[]),...(aliases||[])])],
      allowSurname:category!=="franchises"
    })),
    details, source:ref, furtherReading:bRef(answers[0][0])
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
    ["Cam Schlittler","Jacob Misiorowski"],["Pedro Martinez","Randy Johnson"],
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
    ["Sal Stewart","Kevin McGonigle"],["Scott Williamson","Carlos Beltran"],
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
  const worldSeriesTeams = [
    ["Milwaukee Brewers", "Tampa Bay Rays"],
    ["New York Yankees", "Atlanta Braves"],
    ["New York Yankees", "New York Mets"],
    ["Arizona Diamondbacks", "New York Yankees"],
    ["Anaheim Angels", "San Francisco Giants"],
    ["Florida Marlins", "New York Yankees"],
    ["Boston Red Sox", "St. Louis Cardinals"],
    ["Chicago White Sox", "Houston Astros"],
    ["St. Louis Cardinals", "Detroit Tigers"],
    ["Boston Red Sox", "Colorado Rockies"],
    ["Philadelphia Phillies", "Tampa Bay Rays"],
    ["New York Yankees", "Philadelphia Phillies"],
    ["San Francisco Giants", "Texas Rangers"],
    ["St. Louis Cardinals", "Texas Rangers"],
    ["San Francisco Giants", "Detroit Tigers"],
    ["Boston Red Sox", "St. Louis Cardinals"],
    ["San Francisco Giants", "Kansas City Royals"],
    ["Kansas City Royals", "New York Mets"],
    ["Chicago Cubs", "Cleveland Indians"],
    ["Houston Astros", "Los Angeles Dodgers"],
    ["Boston Red Sox", "Los Angeles Dodgers"],
    ["Washington Nationals", "Houston Astros"],
    ["Los Angeles Dodgers", "Tampa Bay Rays"],
    ["Atlanta Braves", "Houston Astros"],
    ["Houston Astros", "Philadelphia Phillies"],
    ["Texas Rangers", "Arizona Diamondbacks"],
    ["Los Angeles Dodgers", "New York Yankees"],
    ["Los Angeles Dodgers", "Toronto Blue Jays"]
  ];
  const worldSeriesMvp = [
    "William Contreras","Mariano Rivera","Derek Jeter",["Randy Johnson","Curt Schilling"],"Troy Glaus","Josh Beckett",
    "Manny Ramirez","Jermaine Dye","David Eckstein","Mike Lowell","Cole Hamels","Hideki Matsui",
    "Edgar Renteria","David Freese","Pablo Sandoval","David Ortiz","Madison Bumgarner","Salvador Perez",
    "Ben Zobrist","George Springer","Steve Pearce","Stephen Strasburg","Corey Seager","Jorge Soler",
    "Jeremy Pena","Corey Seager","Freddie Freeman","Yoshinobu Yamamoto"
  ];
  const battingRows = [
    [2026, "home runs", 40, [["Pete Crow-Armstrong","double"], ["Kyle Schwarber","single"], ["Pete Alonso","single"], ["Yordan Alvarez","walk"], ["Junior Caminero","double"], ["Hunter Goodman","home-run"], ["Matt Olson","single"], ["Ben Rice","home-run"]]],
    [1999, "home runs", 63, [["Mark McGwire","single"], ["Sammy Sosa","walk"]]],
    [2000, "doubles", 51, [["Todd Helton","walk"], ["Carlos Delgado","single"], ["Jeff Cirillo","double"], ["Nomar Garciaparra","single"], ["Jose Vidro","home-run"]]],
    [2001, "hits in one game", 6, [["Damion Easley","home-run"], ["Paul Lo Duca","double"]]],
    [2002, "doubles", 47, [["Garret Anderson","double"], ["Nomar Garciaparra","single"], ["Alfonso Soriano","double"], ["Magglio Ordonez","home-run"]]],
    [2003, "triples", 10, [["Cristian Guzman","double"], ["Nomar Garciaparra","single"], ["Steve Finley","double"], ["Rafael Furcal","home-run"], ["Carlos Beltran","single"]]],
    [2004, "hits in one game", 6, [["Raul Ibanez","double"], ["Alfonso Soriano","double"], ["Carlos Pena","double"], ["Omar Vizquel","home-run"], ["Joe Randa","home-run"], ["Frank Catalanotto","home-run"]]],
    [2005, "doubles", 45, [["Derrek Lee","double"], ["Todd Helton","walk"], ["Randy Winn","double"], ["Miguel Tejada","home-run"]]],
    [2006, "doubles", 48, [["Grady Sizemore","single"], ["Michael Young","double"], ["Luis Gonzalez","single"], ["Miguel Cabrera","walk"]]],
    [2007, "triples", 12, [["Curtis Granderson","single"], ["Jimmy Rollins","single"], ["Jose Reyes","home-run"]]],
    [2008, "hits in one game", 6, [["Johnny Damon","single"], ["Skip Schumaker","double"]]],
    [2009, "doubles", 47, [["Billy Butler","double"], ["Brian Roberts","double"], ["Dustin Pedroia","single"]]],
    [2010, "doubles", 45, [["Adrian Beltre","walk"], ["Ryan Braun","single"], ["Jayson Werth","double"]]],
    [1947, "home runs", 51, [["Johnny Mize","home-run"], ["Ralph Kiner","double"]]],
    [2012, "doubles", 45, [["Alex Gordon","double"], ["Albert Pujols","walk"], ["Aramis Ramirez","double"], ["Robinson Cano","single"]]],
    [2013, "home runs", 36, [["Chris Davis","double"], ["Miguel Cabrera","walk"], ["Pedro Alvarez","double"], ["Paul Goldschmidt","walk"], ["Edwin Encarnacion","single"]]],
    [2014, "doubles", 43, [["Miguel Cabrera","walk"], ["Jonathan Lucroy","double"], ["Michael Brantley","double"], ["Jose Altuve","walk"]]],
    [2015, "triples", 11, [["Eddie Rosario","double"], ["Kevin Kiermaier","double"], ["Rajai Davis","double"], ["Evan Gattis","home-run"]]],
    [2016, "hits in one game", 6, [["Brandon Crawford","single"], ["C.J. Cron","double"], ["Chase Utley","single"], ["Wilmer Flores","home-run"]]],
    [2017, "triples", 10, [["Charlie Blackmon","single"], ["Billy Hamilton","double"], ["Nick Castellanos","double"]]],
    [2018, "doubles", 44, [["Alex Bregman","double"], ["Xander Bogaerts","single"], ["Miguel Andujar","double"]]],
    [2019, "home runs", 45, [["Pete Alonso","walk"], ["Eugenio Suarez","single"], ["Jorge Soler","single"], ["Cody Bellinger","walk"], ["Mike Trout","walk"]]],
    [2020, "triples", 4, [["Kyle Tucker","single"], ["Trevor Story","double"], ["Trea Turner","single"], ["Mike Yastrzemski","home-run"]]],
    [2021, "doubles", 40, [["Bryce Harper","walk"], ["Whit Merrifield","single"], ["Jeimer Candelario","double"], ["J. D. Martinez","single"]]],
    [2022, "triples", 7, [["Amed Rosario","double"], ["Jorge Mateo","double"], ["Steven Kwan","double"], ["Gavin Lux","home-run"], ["Brandon Nimmo","home-run"]]],
    [2023, "doubles", 40, [["Freddie Freeman","walk"], ["Corey Seager","single"], ["Anthony Santander","single"]]],
    [1927, "hits", 222, [["Paul Waner","single"], ["Earle Combs","double"], ["Lloyd Waner","home-run"]]],
    [2025, "hits in one game", 6, [["Nick Kurtz","single"], ["Austin Wynns","home-run"]]]
  ];
  const warmupRows = [
    [2026, "home runs", 45, [["Pete Crow-Armstrong","walk"], ["Kyle Schwarber","single"]]],
    [1999, "hits", 200, [["Derek Jeter","walk"], ["B.J. Surhoff","double"], ["Luis Gonzalez","single"], ["Doug Glanville","home-run"], ["Bernie Williams","home-run"], ["Randy Velarde","home-run"]]],
    [2000, "home runs", 44, [["Sammy Sosa","walk"], ["Barry Bonds","walk"], ["Troy Glaus","single"], ["Jeff Bagwell","walk"], ["Vladimir Guerrero","walk"], ["Richard Hidalgo","home-run"]]],
    [2001, "home runs", 49, [["Barry Bonds","walk"], ["Sammy Sosa","walk"], ["Luis Gonzalez","single"], ["Alex Rodriguez","walk"], ["Jim Thome","walk"], ["Shawn Green","single"], ["Todd Helton","walk"]]],
    [2002, "home runs", 42, [["Alex Rodriguez","walk"], ["Jim Thome","walk"], ["Sammy Sosa","walk"], ["Barry Bonds","walk"], ["Rafael Palmeiro","single"], ["Shawn Green","single"], ["Lance Berkman","home-run"]]],
    [2003, "home runs", 43, [["Alex Rodriguez","walk"], ["Jim Thome","walk"], ["Barry Bonds","walk"], ["Richie Sexson","home-run"], ["Javy Lopez","home-run"], ["Albert Pujols","walk"]]],
    [2004, "home runs", 42, [["Adrian Beltre","walk"], ["Albert Pujols","walk"], ["Adam Dunn","single"], ["Barry Bonds","walk"], ["Manny Ramirez","walk"], ["Jim Thome","walk"], ["Jim Edmonds","home-run"]]],
    [2005, "home runs", 43, [["Andruw Jones","single"], ["Alex Rodriguez","walk"], ["David Ortiz","walk"], ["Derrek Lee","home-run"], ["Manny Ramirez","walk"], ["Mark Teixeira","home-run"]]],
    [2006, "home runs", 44, [["Ryan Howard","single"], ["David Ortiz","walk"], ["Albert Pujols","walk"], ["Alfonso Soriano","home-run"], ["Lance Berkman","home-run"], ["Jermaine Dye","home-run"]]],
    [2007, "home runs", 36, [["Alex Rodriguez","walk"], ["Prince Fielder","single"], ["Ryan Howard","single"], ["Carlos Pena","home-run"], ["Adam Dunn","single"], ["Matt Holliday","single"]]],
    [2008, "home runs", 37, [["Ryan Howard","single"], ["Adam Dunn","single"], ["Carlos Delgado","single"], ["Miguel Cabrera","walk"], ["Manny Ramirez","walk"], ["Albert Pujols","walk"], ["Ryan Braun","single"], ["Ryan Ludwick","home-run"]]],
    [2009, "home runs", 39, [["Albert Pujols","walk"], ["Prince Fielder","single"], ["Ryan Howard","single"], ["Mark Reynolds","home-run"], ["Adrian Gonzalez","home-run"], ["Carlos Pena","home-run"], ["Mark Teixeira","home-run"]]],
    [2010, "home runs", 37, [["Jose Bautista","single"], ["Albert Pujols","walk"], ["Paul Konerko","double"], ["Miguel Cabrera","walk"], ["Adam Dunn","single"], ["Joey Votto","single"]]],
    [2011, "home runs", 37, [["Jose Bautista","single"], ["Curtis Granderson","single"], ["Mark Teixeira","double"], ["Matt Kemp","home-run"], ["Prince Fielder","single"], ["Mark Reynolds","home-run"], ["Albert Pujols","walk"]]],
    [2012, "home runs", 41, [["Miguel Cabrera","walk"], ["Curtis Granderson","single"], ["Josh Hamilton","single"], ["Edwin Encarnacion","single"], ["Ryan Braun","single"], ["Adam Dunn","single"]]],
    [2013, "hits", 186, [["Adrian Beltre","walk"], ["Matt Carpenter","double"], ["Miguel Cabrera","walk"], ["Dustin Pedroia","single"], ["Mike Trout","walk"], ["Robinson Cano","single"]]],
    [2014, "home runs", 35, [["Nelson Cruz","single"], ["Chris Carter","double"], ["Giancarlo Stanton","walk"], ["Mike Trout","walk"], ["Jose Abreu","single"], ["David Ortiz","walk"], ["Jose Bautista","single"]]],
    [2015, "home runs", 41, [["Chris Davis","double"], ["Nelson Cruz","single"], ["Bryce Harper","walk"], ["Nolan Arenado","walk"], ["Mike Trout","walk"], ["Josh Donaldson","single"]]],
    [2016, "home runs", 41, [["Mark Trumbo","double"], ["Nelson Cruz","single"], ["Khris Davis","double"], ["Edwin Encarnacion","single"], ["Brian Dozier","home-run"], ["Nolan Arenado","walk"], ["Chris Carter","home-run"]]],
    [2017, "home runs", 39, [["Giancarlo Stanton","walk"], ["Aaron Judge","walk"], ["J.D. Martinez","single"], ["Khris Davis","home-run"], ["Joey Gallo","home-run"], ["Nelson Cruz","single"], ["Cody Bellinger","walk"]]],
    [2018, "home runs", 38, [["Khris Davis","double"], ["J.D. Martinez","single"], ["Joey Gallo","double"], ["Jose Ramirez","walk"], ["Mike Trout","walk"], ["Nolan Arenado","walk"], ["Giancarlo Stanton","walk"], ["Francisco Lindor","walk"]]],
    [2019, "hits", 187, [["Whit Merrifield","single"], ["Rafael Devers","single"], ["DJ LeMahieu","double"], ["Ozzie Albies","home-run"], ["Xander Bogaerts","single"], ["Ketel Marte","home-run"]]],
    [2020, "home runs", 17, [["Luke Voit","double"], ["Jose Abreu","single"], ["Marcell Ozuna","double"], ["Mike Trout","walk"], ["Fernando Tatis Jr.","walk"], ["Jose Ramirez","walk"]]],
    [2021, "home runs", 39, [["Vladimir Guerrero Jr.","walk"], ["Salvador Perez","single"], ["Shohei Ohtani","walk"], ["Marcus Semien","single"], ["Fernando Tatis Jr.","walk"], ["Brandon Lowe","home-run"], ["Matt Olson","single"], ["Mitch Haniger","home-run"], ["Aaron Judge","walk"]]],
    [2022, "home runs", 37, [["Aaron Judge","walk"], ["Kyle Schwarber","walk"], ["Mike Trout","walk"], ["Pete Alonso","walk"], ["Austin Riley","home-run"], ["Yordan Alvarez","home-run"]]],
    [2023, "home runs", 40, [["Matt Olson","single"], ["Kyle Schwarber","walk"], ["Pete Alonso","walk"], ["Shohei Ohtani","walk"], ["Ronald Acuna Jr.","walk"], ["Marcell Ozuna","home-run"]]],
    [2024, "home runs", 39, [["Aaron Judge","walk"], ["Shohei Ohtani","walk"], ["Anthony Santander","single"], ["Juan Soto","walk"], ["Jose Ramirez","walk"], ["Brent Rooker","single"], ["Marcell Ozuna","home-run"]]],
    [2025, "home runs", 45, [["Cal Raleigh","walk"], ["Kyle Schwarber","walk"], ["Shohei Ohtani","walk"], ["Aaron Judge","walk"], ["Eugenio Suarez","single"], ["Junior Caminero","home-run"]]]
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
  const mvpQuestions = mvp.map(([year,nl,al])=>
    record(`player-${year}-mvp`,"player",`Name a player who won the AL or NL MVP Award in ${year}.`,
      [answer(nl,tierByName.get(nl)||"walk"),answer(al,tierByName.get(al)||"single")],
      `${year} AL and NL Most Valuable Players.`,awardsRef("A4"))
  );
  mvpQuestions[0]=record("player-2026-mvp","player",
    "Name a player who won the AL or NL MVP Award in 2026.",
    [answer("Yordan Alvarez","walk"),answer("Pete Crow-Armstrong","single")],
    "Yordan Alvarez won the American League MVP Award, and Pete Crow-Armstrong won the National League award.",
    source("MLB.com 2026 MVP results","https://www.mlb.com/news/2026-mlb-mvp-award-winners","2026 season"));
  mvpQuestions[27]=record("player-2023-25-mvp","player",
    "Name a player who won the AL or NL MVP Award from 2023 through 2025.",
    [answer("Shohei Ohtani"),answer("Aaron Judge"),answer("Ronald Acuna Jr.","single")],
    "Both leagues’ MVP winners from those three seasons qualify.",awardsRef("A4"));

  function battingPrompt(id,category,[year,stat,minimum,answers]) {
    const ref=year===2026
      ? source("MLB.com 2026 regular season home run leaders","https://www.mlb.com/stats/home-runs/regular-season/2026","2026 season")
      : source(`Retrosheet ${year} regular season event files`,`https://www.retrosheet.org/events/${year}eve.zip`);
    const clue=stat==="hits in one game"
      ? `Name an AL or NL player who had at least ${minimum} hits in a game during the ${year} regular season.`
      : `Name an AL or NL player with at least ${minimum} ${stat} in the ${year} regular season.`;
    const prompt=record(id,category,clue,
      answers,`Qualifying totals are from the ${year} AL and NL regular season.`,ref);
    return {...prompt,stat};
  }
  const warmups=warmupRows.map((row,index)=>battingPrompt(`player-${years[index]}-batting`,"player",row));
  const negroHallSource={
    ...awardsRef("A1"),
    corroboration:"https://baseballhall.org/hall-of-fame/hall-of-famers-by-election-method"
  };
  warmups[13]=record("negro-leagues-hof-1974-77","player",
    "Name a player the Negro Leagues committee elected to the Hall of Fame from 1974 through 1977.",
    [answer("Cool Papa Bell"),answer("Judy Johnson","double"),answer("Oscar Charleston","single"),
      answer("Martín Dihigo","double"),answer("Pop Lloyd","home-run")],
    "These five players were elected in the committee’s final four years.",
    negroHallSource);
  const batting=battingRows.map((row,index)=>battingPrompt(`batting-${index+1}`,"batting",row));
  const pitching = cyYoung.map(([al,nl],i)=>{
    const year=years[i];
    const ref=year===2026
      ? source("MLB.com 2026 Cy Young results","https://www.mlb.com/news/2026-mlb-cy-young-award-winners","2026 season")
      : awardsRef("A5");
    return record(`pitching-${year}`,"pitching",`Name a Cy Young Award winner from ${year}.`,[answer(al,tierByName.get(al)||"walk"),answer(nl,tierByName.get(nl)||"single")],`${year} American and National League Cy Young Award winners.`,ref);
  });
  const awards = rookie.map(([nl,al],i)=>{
    const year=years[i];
    const ref=year===2026
      ? source("MLB.com 2026 Rookie of the Year results","https://www.mlb.com/news/2026-mlb-rookie-of-the-year-award-winners","2026 season")
      : awardsRef("A6");
    return record(`awards-${year}`,"awards",`Name a Rookie of the Year Award winner from ${year}.`,[answer(nl,tierByName.get(nl)||"single"),answer(al,tierByName.get(al)||"walk")],`${year} National and American League Rookie of the Year winners.`,ref);
  });
  const teamAliases={
    "Anaheim Angels":["Los Angeles Angels","Angels"], "Florida Marlins":["Miami Marlins","Marlins"],
    "Washington Nationals":["Montreal Expos","Nationals","Expos"], "San Francisco Giants":["New York Giants","Giants"],
    "Los Angeles Dodgers":["Brooklyn Dodgers","Dodgers"], "Atlanta Braves":["Boston Braves","Milwaukee Braves","Braves"],
    "Boston Red Sox":["Red Sox"], "Chicago White Sox":["White Sox"], "Chicago Cubs":["Cubs"],
    "St. Louis Cardinals":["Cardinals"], "Arizona Diamondbacks":["Diamondbacks","D-backs"],
    "Cleveland Indians":["Cleveland Guardians","Indians","Guardians"], "Tampa Bay Rays":["Rays","Devil Rays"]
  };
  const franchises = worldSeriesTeams.map(([winner,runnerUp],i)=>{
    const year=years[i];
    const ref=year===2026
      ? source("MLB.com 2026 postseason results","https://www.mlb.com/postseason/history/2026","2026 postseason")
      : source(`Retrosheet ${year} postseason results`,`https://www.retrosheet.org/boxesetc/${year}/YPS_${year}.htm`);
    const answers=[winner,runnerUp].map((team,index)=>
      answer(team,tierByName.get(team)||(index===0?"walk":"single"),teamAliases[team]||[team.split(" ").at(-1)])
    );
    return record(`franchise-${year}`,"franchises",`Name a franchise that played in the ${year} World Series.`,
      answers,`${winner} beat ${runnerUp} in the ${year} World Series.`,ref);
  });
  const postseason = worldSeriesMvp.map((winners,i)=>{
    const year=years[i];
    const previous=i===0?["Yoshinobu Yamamoto"]:i===1?["Scott Brosius"]:[worldSeriesMvp[i-1]].flat();
    const names=[...new Set([...previous,...[winners].flat()])];
    const ref=year===2026
      ? source("MLB.com 2026 World Series MVP","https://www.mlb.com/awards/postseason","2026 postseason")
      : awardsRef("A10");
    const period=`${year-1} or ${year}`;
    return record(`postseason-${year}`,"postseason",`Name a World Series MVP from ${period}.`,
      names.map(name=>answer(name,tierByName.get(name)||"single")),
      `World Series MVPs from ${period} qualify.`,ref);
  });
  const all = [...mvpQuestions,...warmups,...batting,...pitching,...awards,...franchises,...postseason];
  const decks = [0,...Array.from({length:27},(_,i)=>27-i)].map(i=>[
    mvpQuestions[i],warmups[i],batting[i],pitching[i],awards[i],franchises[i],postseason[i]
  ]);
  window.HOMERUN_BANK = {all,decks,cycleStart:"2026-11-19"};
})();
