const QUERY = encodeURIComponent('Select *');

const SHEET_ID = '15aAzBnPpvBR3ntpgvbLN9WE5ftH6mSTPElIBsFxefk0';
const BASE = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?`;
const EVENTS_SHEET = 'Events';
const COUNCIL_SHEET = 'Council';
const POSITIONS_SHEET = 'Positions';
const LINKS_SHEET = 'Links';
const CONTACTS_SHEET = 'Contacts';
const EVENTS_URL = `${BASE}&sheet=${EVENTS_SHEET}&tq=${QUERY}`;
const COUNCIL_URL = `${BASE}&sheet=${COUNCIL_SHEET}&tq=${QUERY}`;
const POSITIONS_URL = `${BASE}&sheet=${POSITIONS_SHEET}&tq=${QUERY}`;
const LINKS_URL = `${BASE}&sheet=${LINKS_SHEET}&tq=${QUERY}`;
const CONTACTS_URL = `${BASE}&sheet=${CONTACTS_SHEET}&tq=${QUERY}`;

const MATCHES_ID = '1r8BtslMkYsPrT3gRfWNOGKM8-QjrsfuN8ts8N5JqZXQ';
const MATCHES_BASE  = `https://docs.google.com/spreadsheets/d/${MATCHES_ID}/gviz/tq?`;
const MATCHES_SHEET = 'Matches';
const PLAYERS_SHEET = 'Players';
const MATCHES_URL = `${MATCHES_BASE}&sheet=${MATCHES_SHEET}&tq=${QUERY}`;
const PLAYERS_URL = `${MATCHES_BASE}&sheet=${PLAYERS_SHEET}&tq=${QUERY}`;

//! UPDATE THESE IF SHEETS COLUMNS ARE REORDERED
const EVENTS_COLS = {
  "date": 0,
  "start": 1,
  "end": 2,
  "name": 3,
  "location": 4,
  "type": 5,
  "rsvp": 6,
  "calendar": 7,
  "instagram": 8,
  "image": 9
}

const COUNCIL_COLS = {
  "year": 0,
  "name": 1,
  "position": 2,
  "photo": 3
}

const POSITIONS_COLS = {
  "position": 0,
  "type": 1,
  "email": 2,
  "key": 3,
  "responsibilities": 4,
  "filled": 5
}

const LINKS_COLS = {
  "name": 0,
  "icon": 1,
  "link": 2,
  "show": 3
}

const CONTACTS_COLS = {
  "option": 0,
  "email": 1,
  "override": 2,
  "show": 3
}

const MATCHES_COLS = {
  "game": 1,
  "p1_id": 2,
  "p2_id": 3,
  "p3_id": 4,
  "p4_id": 5,
  "winner": 6,
  "p1_points": 7,
  "p2_points": 8,
  "p3_points": 9,
  "p4_points": 10,
  "time": 11
}

const PLAYERS_COLS = {
  "id": 0,
  "name": 1
}
//!

const GAME_PARAMS = {
  "Foosball": {
    "INIT_RATING": 1000.0,
    "BASE": 10.0,
    "DIVISOR": 400.0,
    "K": 100.0
  },
  "Pong": {
    "INIT_RATING": 1000.0,
    "BASE": 10.0,
    "DIVISOR": 400.0,
    "K": 100.0
  },
  "Mario Kart": {
    "INIT_RATING": 1000.0,
    "BASE": 10.0,
    "DIVISOR": 400.0,
    "K": 100.0
  },
  "Smash Bros": {
    "INIT_RATING": 1000.0,
    "BASE": 10.0,
    "DIVISOR": 400.0,
    "K": 100.0
  },
  "BOAT Race": {
    "INIT_RATING": Number.POSITIVE_INFINITY
  }
}

const GAME_SHORTS = new Map([["Foosball", "foos"], ["Pong", "pong"], ["Mario Kart", "kart"], ["Smash Bros", "smsh"], ["BOAT Race", "boat"]]);

const MONTHS = new Map([[1, "Jan"], [2, "Feb"], [3, "Mar"], [4, "Apr"], [5, "May"], [6, "Jun"], [7, "Jul"], [8, "Aug"], [9, "Sep"], [10, "Oct"], [11, "Nov"], [12, "Dec"]]);

let events;
let council;
let positions;
let links;
let contacts;
let years = [];

let gameData;
let playerNameData;
let playerRatings;
let playerNames;

// GENERAL

async function init() {
  if (document.getElementById('exec-openings') != null) { // home page
    await Promise.all([getLinks(), getPositions(), getEvents()]);
    makeLinks();
    makeOpenings();
    makeEvents(3);
  }
  else if (document.getElementById('events') != null && document.getElementById('exec-openings') == null) { // events page
    await getEvents();
    makeEvents(999);
  }
  else if (document.getElementById('council-grid') != null) { // council page
    await Promise.all([getCouncil(), getPositions()]);
    makeYearSelect();
    makeCouncilGrid();
  }
  else if (document.getElementById('form-type') != null) { // contact page
    await Promise.all([getContacts(), getPositions()]);
    makeContactOptions();
  }
  else if (document.getElementById('leaderboard-games') != null) { // leaderboard page
    await Promise.all([getGameData(), getPlayerNameData()]);
    setPlayerNames();
    calculatePlayerRatings();
    let currentBoard = localStorage.currentBoard != null ? localStorage.currentBoard : "foos";
    changeLeaderboard(currentBoard);
  }
  document.querySelectorAll(':has(>.tooltip)').forEach((el) => { handleTooltips(el); });

  window.addEventListener('resize', function() { document.querySelectorAll(':has(>.tooltip)').forEach((el) => { handleTooltips(el); }); });
  
  // document.querySelectorAll(':has(>.tooltip)').forEach((el) => {
  //   el.addEventListener('mouseover', (event) => { fixTooltipPosition(el); });
  // });
}
window.addEventListener('DOMContentLoaded', init);

async function getEvents() {
  await fetch(EVENTS_URL).then((res) => res.text()).then((rep) => {events = JSON.parse(rep.substring(47).slice(0,-2)).table.rows});
}

async function getCouncil() {
  await fetch(COUNCIL_URL).then((res) => res.text()).then((rep) => {council = JSON.parse(rep.substring(47).slice(0,-2)).table.rows});
}

async function getPositions() {
  await fetch(POSITIONS_URL).then((res) => res.text()).then((rep) => {positions = JSON.parse(rep.substring(47).slice(0,-2)).table.rows});
}

async function getLinks() {
  await fetch(LINKS_URL).then((res) => res.text()).then((rep) => {links = JSON.parse(rep.substring(47).slice(0,-2)).table.rows});
}

async function getContacts() {
  await fetch(CONTACTS_URL).then((res) => res.text()).then((rep) => {contacts = JSON.parse(rep.substring(47).slice(0,-2)).table.rows});
}

async function getGameData() {
  await fetch(MATCHES_URL).then((res) => res.text()).then((rep) => {gameData = JSON.parse(rep.substring(47).slice(0,-2)).table.rows});
}

async function getPlayerNameData() {
  await fetch(PLAYERS_URL).then((res) => res.text()).then((rep) => {playerNameData = JSON.parse(rep.substring(47).slice(0,-2)).table.rows});
}

function toggleNav() {
  let nav = document.getElementById('nav')
  let classes = nav.classList;

  if (classes.contains('hidden')) {
    nav.classList.remove('hidden');
  }
  else
  {
    nav.classList.add('hidden');
  }
}
document.querySelectorAll('#open-nav').forEach((el) => {
  el.addEventListener('click', toggleNav);
});

function handleTooltips(el) {
  let ibound = el.getBoundingClientRect();
  let tooltip = el.children[0];
  // let ttbound = tooltip.getBoundingClientRect();

  tooltip.classList.remove('left', 'right');
  if (ibound.x + ibound.width / 2 <= window.outerWidth / 2) {
    tooltip.classList.add('right');
  }
  else {
    tooltip.classList.add('left');
  }
}

function changePage(href) {
  if (href != null) {
    window.location.href = href;
  }
}
document.querySelectorAll('.nav').forEach((el) => {
  el.addEventListener('click', (event) => changePage(el.getAttribute('href')));
});

// HOME

function makeOpenings() {
  for (let i = 0; i < positions.length; i ++) {
    if (positions[i].c[POSITIONS_COLS.position] == null) { break; } // skip blank entries
    if (positions[i].c[POSITIONS_COLS.filled].v == false) { // if position not filled
      if (positions[i].c[POSITIONS_COLS.type].v == 'Executive') {
        document.getElementById('exec-openings').innerHTML += '<li><div>' + positions[i].c[POSITIONS_COLS.position].v + '</div><i class="fa-solid fa-circle-info"><div class="tooltip">' + positions[i].c[POSITIONS_COLS.responsibilities].v + '</div></i></li>';
      }
      else {
        document.getElementById('exo-openings').innerHTML += '<li><div>' + positions[i].c[POSITIONS_COLS.position].v + '</div><i class="fa-solid fa-circle-info"><div class="tooltip">' + positions[i].c[POSITIONS_COLS.responsibilities].v + '</div></i></li>';
      }
    }
  }
}

function makeLinks() {
  console.log(links);
  let html = '';
  for (let i = 0; i < links.length; i ++) {
    if (links[i].c[LINKS_COLS.name] == null || links[i].c[LINKS_COLS.link] == null || links[i].c[LINKS_COLS.show].v == false) { continue; } // skip blank entries
    let icon = (links[i].c[LINKS_COLS.icon] != null) ? '<i class="fa-solid fa-' + links[i].c[LINKS_COLS.icon].v + '"></i>' : '';
    html += '<li><a class="button link" href="' + links[i].c[LINKS_COLS.link].v + '">' + (icon + links[i].c[LINKS_COLS.name].v) + '</a></li>';
  }
  document.getElementById('links').innerHTML = html;
}

// EVENTS

function makeEvents(num) {
  let upcoming = new Map();
  let today = Date.now() - 1000 * 60 * 60 * 24;
  for (let i = 0; i < events.length; i ++) {
    if (events[i].c[EVENTS_COLS.date] == null) { break; } // skip blank entries
    let date = events[i].c[EVENTS_COLS.date].f.split('-');
    let utc = Date.UTC(date[0], date[1]-1, date[2]);
    if (utc < today) { continue; }
    upcoming.set(i, utc);
  }
  let sorted = Array.from(upcoming).sort((a, b) => a[1] - b[1]).slice(0, Math.min(num, Array.from(upcoming).length));

  let html = '';
  for (let i = 0; i < sorted.length; i ++) {
    let currEvent = events[sorted[i][0]];
    let date = currEvent.c[EVENTS_COLS.date].f.split('-');
    html += '<li class="event">';
    // if (currEvent.c[EVENTS_COLS.instagram] != null) {
    //   html += '<div class="insta">' + currEvent.c[EVENTS_COLS.instagram].v + '</div>';
    // }
    // else {
    let imgSrc = currEvent.c[EVENTS_COLS.image].v == true ? date[0] + '/' + date[1] + '/' + date[2] + ' ' + currEvent.c[EVENTS_COLS.name].v + '.jpg' : 'none.jpg';
    html += '<img src="media/events/' + imgSrc + '">';
    // }
    html += '<h3>' + currEvent.c[EVENTS_COLS.name].v + '</h3>';
    html += '<ul class="event-dtl">';
    html += '<li><i class="fa-solid fa-calendar"></i>' + date[2] + ' ' + MONTHS.get(Number(date[1])) + ' ' + date[0] + '</li>';
    let eventTime = (currEvent.c[EVENTS_COLS.start] == null ? 'TBD' : (currEvent.c[EVENTS_COLS.start].f + (currEvent.c[EVENTS_COLS.end] == null ? '' : ('–' + currEvent.c[EVENTS_COLS.end].f))));
    html += '<li><i class="fa-solid fa-clock"></i>' + eventTime + '</li>';
    html += '<li><i class="fa-solid fa-location-dot"></i>' + (currEvent.c[EVENTS_COLS.location] != null ? currEvent.c[EVENTS_COLS.location].v : 'TBD') + '</li>';
    html += '</ul>';
    if (currEvent.c[EVENTS_COLS.rsvp] != null || currEvent.c[EVENTS_COLS.calendar] != null) {
      html += '<ul class="event-links">';
      html += (currEvent.c[EVENTS_COLS.rsvp] != null ? ('<li><a class="button link" href="' + currEvent.c[EVENTS_COLS.rsvp].v + '" target="_blank"><i class="fa-solid fa-reply"></i>RSVP</a></li>') : '');
      html += (currEvent.c[EVENTS_COLS.calendar] != null ? ('<li><a class="button link" href="' + currEvent.c[EVENTS_COLS.calendar].v + '" target="_blank"><i class="fa-brands fa-google"></i>Add to Calendar</a></li>') : '');
      html += '</ul>';
    }
    html += '</li>';
  }
  document.getElementById('events').innerHTML = html;
}

// COUNCIL

function makeYearSelect() {
  let yearsSet = new Set();
  for (let i = 0; i < council.length; i ++) { // loops through council entries and gets the most recent year
    let currYear = council[i].c[COUNCIL_COLS.year];
    if (currYear == null) { break; } // skip blank entries
    yearsSet.add(currYear.v);
  }

  years = [];
  for (let el of yearsSet) {
    years.push(el);
  }

  years = years.sort().reverse();

  let selectHTML = '';
  for (let i = 0; i < years.length; i ++) {
    selectHTML += '<option value="' + years[i] + '">' + years[i] + '–' + (years[i] + 1) + '</option>';
  }
  document.getElementById('council-year').innerHTML = selectHTML;
}

function makeCouncilGrid() {
  let selectObj = document.getElementById('council-year');
  let selectedYear = selectObj.options[selectObj.selectedIndex].value;
  
  let html = '';
  for (let p = 0; p < positions.length; p ++) { // looping through the positions sheet allows for heirarchical ordering even if the 'Council' sheet entries are out of order
    for (let i = 0; i < council.length; i ++) {
      let currYear = council[i].c[COUNCIL_COLS.year]; // current year
      if (currYear == null) { break; } // skip blank entries
      let currPositions = council[i].c[COUNCIL_COLS.position].v.split(', '); // creates an array of positions held by the member
      if (currYear.v == selectedYear && currPositions[0] == positions[p].c[POSITIONS_COLS.position].v) { // heirarchical ordering done by *first* position in list
        html += '<li class="council-member">';
        let imgSrc = council[i].c[COUNCIL_COLS.photo].v == true ? String(council[i].c[COUNCIL_COLS.year].v) + '/' + council[i].c[COUNCIL_COLS.name].v : 'none';
        html += ('<img src="media/council/' + imgSrc + '.jpg" alt="' + council[i].c[COUNCIL_COLS.name].v + '">'); // photo
        html += '<h2>' + council[i].c[COUNCIL_COLS.name].v + '</h2>'; // name
        html += '<h3>';
        for (let j = 0; j < currPositions.length; j ++) {
          for (let k = 0; k < positions.length; k ++) {
            if (currPositions[j] == positions[k].c[POSITIONS_COLS.position].v) {
              html += '<span>' + currPositions[j] + '<i class="fa-solid fa-circle-info"><div class="tooltip">' + positions[k].c[POSITIONS_COLS.responsibilities].v + '</div></i></span>';
              break;
            }
          }
          if (j + 1 < currPositions.length) { // add comma if more than one position, and not at last one
            html += ', ';
          }
        }
        html += '</h3>';
        if (currYear.v == years[0]) { // only list emails for current council
          let firstEmail = true; // in the event of no emails, we dont want to create empty lists
          for (let j = 0; j < currPositions.length; j ++) {
            for (let k = 0; k < positions.length; k ++) {
              if (currPositions[j] == positions[k].c[POSITIONS_COLS.position].v) {
                if (positions[k].c[POSITIONS_COLS.email] != null) {
                  if (firstEmail == true) {
                    html += '<ul>';
                    firstEmail = false;
                  }
                  html += '<li>';
                  html += '<a class="button link" href="mailto:' + positions[k].c[POSITIONS_COLS.email].v + '">' + positions[k].c[POSITIONS_COLS.email].v + '</a>';
                  html += '</li>';
                }
                break;
              }
            }
          }
          if (firstEmail == false) {
            html += '</ul>';
          }
        }
        html += '</li>';
      }
    }
  }
  document.getElementById('council-grid').innerHTML = html;
}
document.querySelectorAll('#council-year').forEach((el) => {
  el.addEventListener('input', makeCouncilGrid);
});

// CONTACT

function makeContactOptions() {
  let selectObj = document.getElementById('form-type');

  let html = '';
  
  for (let i = 0; i < contacts.length; i ++) {
    if (contacts[i].c[CONTACTS_COLS.option] == null || contacts[i].c[CONTACTS_COLS.show].v == false) { continue; } // skip blank entries
    html += '<option value="' + contacts[i].c[CONTACTS_COLS.option].v + '">' + contacts[i].c[CONTACTS_COLS.option].v + '</option>';
  }

  let key;
  for (let i = 0; i < positions.length; i ++) {
    if (positions[i].c[POSITIONS_COLS.email] != null && contacts[0].c[CONTACTS_COLS.email].v == positions[i].c[POSITIONS_COLS.email].v) {
      key = positions[i].c[POSITIONS_COLS.key].v;
      break;
    }
  }

  document.getElementById('form-key').setAttribute('value', key);
  document.getElementById('form-subject').setAttribute('value', contacts[0].c[CONTACTS_COLS.option].v);

  selectObj.innerHTML = html;
}

function updateContactForm() {
  let selectObj = document.getElementById('form-type');
  let type = selectObj.options[selectObj.selectedIndex].value;

  let key;
  for (let i = 0; i < contacts.length; i ++) {
    if (contacts[i].c[CONTACTS_COLS.option] == null || contacts[i].c[CONTACTS_COLS.show].v == false) { continue; } // skip blank entries
    if (contacts[i].c[CONTACTS_COLS.option].v == type) {
      let searchEmail = (contacts[i].c[CONTACTS_COLS.override] != null) ? contacts[i].c[CONTACTS_COLS.override].v : (contacts[i].c[CONTACTS_COLS.email] != null) ? contacts[i].c[CONTACTS_COLS.email].v : contacts[0].c[CONTACTS_COLS.email].v; // take preference for override, otherwise use regular email, if both blank, default to first entry
      for (let j = 0; j < positions.length; j ++) {
        if (positions[j].c[POSITIONS_COLS.email] != null && positions[j].c[POSITIONS_COLS.email].v == searchEmail) {
          key = (positions[j].c[POSITIONS_COLS.key] != null) ? positions[j].c[POSITIONS_COLS.key].v : positions[0].c[POSITIONS_COLS.key].v; // lowermost default to president
          break;
        }
      }
    }
  }
  let subject = 'Website Contact Message (' + type + ')';

  document.getElementById('form-key').setAttribute('value', key);
  document.getElementById('form-subject').setAttribute('value', subject);
}
document.querySelectorAll('#form-type').forEach((el) => {
  el.addEventListener('input', updateContactForm);
});

// LEADERBOARD

function setPlayerNames() {
  playerNames = new Map();
  for (let i = 0; i < playerNameData.length; i ++) {
    let id = Number(playerNameData[i].c[PLAYERS_COLS.id].v);
    let name = playerNameData[i].c[PLAYERS_COLS.name].v;
    playerNames.set(id, name);
  }
}

function getPlayerRating(game, id) {
  if (playerRatings[game].has(id)) {
    return playerRatings[game].get(id);
  }
  playerRatings[game].set(id, GAME_PARAMS[game].INIT_RATING);
  return GAME_PARAMS[game].INIT_RATING;
}

function setPlayerRating(game, id, rating) {
  playerRatings[game].set(id, rating);
}

function calculatePlayerRatings() {
  playerRatings = {
    "Foosball": new Map(),
    "Pong": new Map(),
    "Mario Kart": new Map(),
    "Smash Bros": new Map(),
    "BOAT Race": new Map()
  };

  for (let r = 0; r < gameData.length; r ++) {
    // get game
    let game = gameData[r].c[MATCHES_COLS.game].v;

    // get player ids
    let ids = [];
    // team A
    ids[0] = Number(gameData[r].c[MATCHES_COLS.p1_id].v); // P1
    ids[1] = gameData[r].c[MATCHES_COLS.p2_id] != null ? Number(gameData[r].c[MATCHES_COLS.p2_id].v) : 0; // P2
    // team B
    ids[2] = gameData[r].c[MATCHES_COLS.p3_id] != null ? Number(gameData[r].c[MATCHES_COLS.p3_id].v) : 0; // P3
    ids[3] = gameData[r].c[MATCHES_COLS.p4_id] != null ? Number(gameData[r].c[MATCHES_COLS.p4_id].v) : 0; // P4

    // get player ratings (or set to 1000 if new)
    let Rs = []; // prior ratings
    let playerCount = 0;
    for (let i = 0; i < 4; i ++) {
      if (ids[i] != 0) {
        Rs[i] = getPlayerRating(game, ids[i]);
        playerCount ++;
      }
      else {
        Rs[i] = Rs[Math.max(i-1, 0)];
      }
    }

    if (game == 'BOAT Race') {
      let time = gameData[r].c[MATCHES_COLS.time].v;
      if (time < Rs[0]) {
        setPlayerRating(game, ids[0], time);
      }
    }
    else if (game == 'Mario Kart' || game == 'Smash Bros') {
      let Qs = []; // q values
      for (let i = 0; i < playerCount; i ++) {
        Qs[i] = Math.pow(GAME_PARAMS[game].BASE, Rs[i] / GAME_PARAMS[game].DIVISOR);
      }

      let Es = [new Array(playerCount), new Array(playerCount), new Array(playerCount), new Array(playerCount)]; // estimated scores
      for (let i = 0; i < playerCount; i ++) {
        for (let j = 0; j < playerCount; j ++) {
          Es[i][j] = Qs[i] / (Qs[i] + Qs[j]); // player i playing against player j
        }
      }

      let Ss = [gameData[r].c[MATCHES_COLS.p1_points] != null ? Number(gameData[r].c[MATCHES_COLS.p1_points].v) : 0, gameData[r].c[MATCHES_COLS.p2_points] != null ? Number(gameData[r].c[MATCHES_COLS.p2_points].v) : 0, gameData[r].c[MATCHES_COLS.p3_points] != null ? Number(gameData[r].c[MATCHES_COLS.p3_points].v) : 0, gameData[r].c[MATCHES_COLS.p4_points] != null ? Number(gameData[r].c[MATCHES_COLS.p4_points].v) : 0]; // actual scores

      for (let i = 0; i < playerCount; i ++) {
        let mult = 0;
        for (let j = 0; j < playerCount; j ++) {
          if (i == j) { continue; }
          let wld = Ss[i] > Ss[j] ? 1 : Ss[i] < Ss[j] ? 0 : 0.5; // win-lose-draw
          mult += wld - Es[i][j];
        }
        setPlayerRating(game, ids[i], Rs[i] + GAME_PARAMS[game].K / (playerCount - 1) * mult);
      }
    }
    else { // foos & pong
      let Rt = [Math.max(Rs[0], Rs[1]), Math.max(Rs[2], Rs[3])]; // ratings for team A and B
      let Qs = [Math.pow(GAME_PARAMS[game].BASE, Rt[0] / GAME_PARAMS[game].DIVISOR), Math.pow(GAME_PARAMS[game].BASE, Rt[1] / GAME_PARAMS[game].DIVISOR)];
      let Es = [Qs[0] / (Qs[0] + Qs[1]), Qs[1] / (Qs[0] + Qs[1])]; // estimated scores for team A and B
      let Ss = [gameData[r].c[MATCHES_COLS.winner].v == 'Team A' ? 1 : 0, gameData[r].c[MATCHES_COLS.winner].v == 'Team B' ? 1 : 0]; // actual scores for team A and B

      for (let i = 0; i < 4; i ++) {
        if (ids[i] == 0) { continue; }
        setPlayerRating(game, ids[i], Rs[i] + GAME_PARAMS[game].K * (Ss[Math.floor(i / 2)] - Es[Math.floor(i / 2)]));
      }
    }
  }

  refreshLeaderboard();
}

function refreshLeaderboard() {
  for (let i = 0; i < Array.from(GAME_SHORTS.keys()).length; i ++) {

    let game = Array.from(GAME_SHORTS.values())[i];
    let rankedMap;

    if (game == 'boat') {
      rankedMap = new Map(Array.from(playerRatings[Array.from(GAME_SHORTS.keys())[i]]).sort((a, b) => a[1] - b[1]));
    }
    else {
      rankedMap = new Map(Array.from(playerRatings[Array.from(GAME_SHORTS.keys())[i]]).sort((b, a) => a[1] - b[1]));
    }
    document.getElementById(game + '-board').innerHTML = makeLeaderboardHTML(Array.from(rankedMap.values()), Array.from(rankedMap.keys()), game == 'boat' ? 2 : 0);
  }

  // let cards = document.querySelectorAll(".player-card");
  // cards.forEach((el) => observer.observe(el));
}

function makeLeaderboardHTML(values, keys, round) {
  let html = '';

  for (let i = 0; i < keys.length; i ++) {
    let playerName = playerNames.get(keys[i]) ? playerNames.get(keys[i]) : 'Anonymous';

    let delay = i * 0; // ms

    let rating = Math.round(values[i] * Math.pow(10, round)) / Math.pow(10, round);

    let tieCount = 0;
    while (i > 0 && rating == Math.round(values[i - 1] * Math.pow(10, round)) / Math.pow(10, round)) {
      i --;
      tieCount ++;
    }

    // html += "<div class='player-card' style='transition-delay: " + delay + "ms;'><div class='player-ranking";

    html += '<li class="player-card"><p class="rank r' + (i + 1) + '">' + (i + 1) + '</p><p class="name">' + playerName + '</p><p class="rating">' + rating.toFixed(round) + '</p></li>';

    i += tieCount;
  }

  return html;
}

function changeLeaderboard(id) {
  document.querySelectorAll('.leaderboard-container').forEach(el => {
    el.style.display = 'none';
  });
  document.querySelectorAll('.button.leaderboard').forEach(el => {
    el.classList.remove('selected');
  });
  document.getElementById(id + '-board').style.display = '';
  document.getElementById(id + '-button').classList.add('selected');

  localStorage.currentBoard = id;
}
document.querySelectorAll('.button.leaderboard').forEach(el => {
  el.addEventListener('click', event => {changeLeaderboard(el.getAttribute('id').substring(0, 4));});
});

function filterSearch() {
  let cards = document.querySelectorAll('.player-card');
  let input = document.getElementById('leaderboard-search').value.toUpperCase();
  for (let i = 0; i < cards.length; i ++) {
    let name = cards[i].getElementsByClassName('name')[0].innerHTML;
    if (name.toUpperCase().indexOf(input) > -1) {
      cards[i].style.display = '';
    }
    else {
      cards[i].style.display = 'none';
    }
  }
}
document.querySelectorAll('#leaderboard-search').forEach((el) => {
  el.addEventListener('keyup', filterSearch);
});