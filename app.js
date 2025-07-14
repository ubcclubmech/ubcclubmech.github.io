const SHEET_ID = '15aAzBnPpvBR3ntpgvbLN9WE5ftH6mSTPElIBsFxefk0';
const BASE = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?`;
const EVENTS_SHEET = 'Events';
const COUNCIL_SHEET = 'Council';
const POSITIONS_SHEET = 'Positions';
const QUERY = encodeURIComponent('Select *');
const EVENTS_URL = `${BASE}&sheet=${EVENTS_SHEET}&tq=${QUERY}`;
const COUNCIL_URL = `${BASE}&sheet=${COUNCIL_SHEET}&tq=${QUERY}`;
const POSITIONS_URL = `${BASE}&sheet=${POSITIONS_SHEET}&tq=${QUERY}`;

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
  "responsibilities": 3,
  "filled": 4
}
//!

//! CURRENTLY THESE ARE ALL UBCMECHEVENTS KEYS
const FORM_KEYS = new Map([['general', 'c4548fb5-1ac4-4648-ab1f-d9366657bcb3'], ['sponsorship', 'c4548fb5-1ac4-4648-ab1f-d9366657bcb3'], ['events', 'c4548fb5-1ac4-4648-ab1f-d9366657bcb3'], ['council', 'c4548fb5-1ac4-4648-ab1f-d9366657bcb3']]); // general: ubcclubmech@gmail.com, sponsorship: clubmechprofessional@gmail.com, events: ubcmechevents@gmail.com, council: clubmechsecretary@gmail.com

const MONTHS = new Map([[1, "Jan"], [2, "Feb"], [3, "Mar"], [4, "Apr"], [5, "May"], [6, "Jun"], [7, "Jul"], [8, "Aug"], [9, "Sep"], [10, "Oct"], [11, "Nov"], [12, "Dec"]]);

let events;
let council;
let positions;
let years = [];

async function init() {
  if (document.getElementById('exec-openings') != null) { // home page
    await Promise.all([getPositions(), getEvents()]);
    makeOpenings();
    makeEvents(3);
  }
  if (document.getElementById('events') != null && document.getElementById('exec-openings') == null) { // events page
    await getEvents();
    makeEvents(999);
  }
  if (document.getElementById('council-grid') != null) { // council page
    await Promise.all([getCouncil(), getPositions()]);
    makeYearSelect();
    makeCouncilGrid();
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
document.getElementById('open-nav').addEventListener('click', toggleNav);

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
    html += '<div class="event">';
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
      html += (currEvent.c[EVENTS_COLS.rsvp] != null ? ('<li><a href="' + currEvent.c[EVENTS_COLS.rsvp].v + '" target="_blank"><i class="fa-solid fa-reply"></i>RSVP</a></li>') : '');
      html += (currEvent.c[EVENTS_COLS.calendar] != null ? ('<li><a href="' + currEvent.c[EVENTS_COLS.calendar].v + '" target="_blank"><i class="fa-brands fa-google"></i>Add to Calendar</a></li>') : '');
      html += '</ul>';
    }
    html += '</div>';
  }
  document.getElementById('events').innerHTML = html;
}

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
        html += '<div class="council-member">';
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
                  html += '<a href="mailto:' + positions[k].c[POSITIONS_COLS.email].v + '">' + positions[k].c[POSITIONS_COLS.email].v + '</a>';
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
        html += '</div>';
      }
    }
  }
  document.getElementById('council-grid').innerHTML = html;
}
document.querySelectorAll('#council-year').forEach((el) => {
  el.addEventListener('input', makeCouncilGrid);
});

function updateContactForm() {
  let selectObj = document.getElementById('form-type');
  let type = selectObj.options[selectObj.selectedIndex].value;

  let key = FORM_KEYS.get(type);
  let subject = 'Website Contact Message (' + type + ')';

  document.getElementById('form-key').setAttribute('value', key);
  document.getElementById('form-subject').setAttribute('value', subject);
}
document.querySelectorAll('#form-type').forEach((el) => {
  el.addEventListener('input', updateContactForm);
})

function changePage(href) {
  if (href != null) {
    window.location.href = href;
  }
}
document.querySelectorAll('.nav').forEach((el) => {
  el.addEventListener('click', (event) => changePage(el.getAttribute('href')));
});