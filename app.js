const QUERY = encodeURIComponent('Select *');

const DATABASE_ID = '15aAzBnPpvBR3ntpgvbLN9WE5ftH6mSTPElIBsFxefk0';
const GAMES_LOG_ID = '1r8BtslMkYsPrT3gRfWNOGKM8-QjrsfuN8ts8N5JqZXQ';
const DATABASE_DOC = `https://docs.google.com/spreadsheets/d/${DATABASE_ID}/gviz/tq?`;
const GAMES_LOG_DOC  = `https://docs.google.com/spreadsheets/d/${GAMES_LOG_ID}/gviz/tq?`;

// ! UPDATE THESE IF COLUMNS ARE REORDERED, SHEET TAB IS RENAMED, OR IS MOVED TO ANOTHER DOC
const SHEETS = {
  "events": {
    "SHEET": "Events",
    "DOC": DATABASE_DOC,
    "COLS": {
      "date": 0,
      "start": 1,
      "end": 2,
      "name": 3,
      "location": 4,
      "rsvp": 6,
      "calendar": 7,
      "instagram": 8,
      "image": 9,
      "show": 10
    }
  },
  "links": {
    "SHEET": "Links",
    "DOC": DATABASE_DOC,
    "COLS": {
      "name": 0,
      "icon": 1,
      "link": 2,
      "show": 3
    }
  },
  "gallery": {
    "SHEET": "Gallery",
    "DOC": DATABASE_DOC,
    "COLS": {
      "collection": 0,
      "image": 1,
      "caption": 2,
      "show": 3
    }
  },
  "collections": {
    "SHEET": "Collections",
    "DOC": DATABASE_DOC,
    "COLS": {
      "name": 0,
      "show": 1
    }
  },
  "council": {
    "SHEET": "Council",
    "DOC": DATABASE_DOC,
    "COLS": {
      "year": 0,
      "name": 1,
      "position": 2,
      "photo": 3
    }
  },
  "positions": {
    "SHEET": "Positions",
    "DOC": DATABASE_DOC,
    "COLS": {
      "position": 0,
      "type": 1,
      "email": 2,
      "key": 3,
      "responsibilities": 4,
      "filled": 5
    }
  },
  "merch": {
    "SHEET": "Merch",
    "DOC": DATABASE_DOC,
    "COLS": {
      "item": 0,
      "price": 1,
      "category": 2,
      "sizes": 3,
      "oos_sizes": 4,
      "status": 5,
      "image": 6,
      "show": 7
    }
  },
  "categories": {
    "SHEET": "Categories",
    "DOC": DATABASE_DOC,
    "COLS": {
      "name": 0,
      "icon": 1,
      "show": 2
    }
  },
  "sponsors": {
    "SHEET": "Sponsors",
    "DOC": DATABASE_DOC,
    "COLS": {
      "name": 0,
      "logo": 1,
      "link": 2,
      "show": 3
    }
  },
  "contacts": {
    "SHEET": "Contacts",
    "DOC": DATABASE_DOC,
    "COLS": {
      "option": 0,
      "email": 1,
      "override": 2,
      "show": 3
    }
  },
  "matches": {
    "SHEET": "Matches",
    "DOC": GAMES_LOG_DOC,
    "COLS": {
      "timestamp": 0,
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
  },
  "players": {
    "SHEET": "Players",
    "DOC": GAMES_LOG_DOC,
    "COLS": {
      "id": 0,
      "name": 1
    }
  },
  "games": {
    "SHEET": "Games",
    "DOC": GAMES_LOG_DOC,
    "COLS": {
      "name": 0,
      "icon": 1,
      "system": 2,
      "rounding": 3,
      "starts": 4,
      "show": 5
    }
  },
  "parameters": {
    "SHEET": "Parameters",
    "DOC": GAMES_LOG_DOC,
    "COLS": {
      "game": 0,
      "init_rating": 1,
      "base": 2,
      "divisor": 3,
      "k": 4,
      "interpolation": 5,
      "starts": 6
    }
  }
};

const MONTHS = new Map([[1, "Jan"], [2, "Feb"], [3, "Mar"], [4, "Apr"], [5, "May"], [6, "Jun"], [7, "Jul"], [8, "Aug"], [9, "Sep"], [10, "Oct"], [11, "Nov"], [12, "Dec"]]);

let data = {};
fixNullData();

let councilYears = [];
let galleryYears = [];

let playerRatings = {};
let playerNames;

// GENERAL

const body = document.querySelector('body');

async function init() {
  let page = body.getAttribute('id');
  switch (page) {
    case 'home-page':
      await Promise.all([fetchSheet('links'), fetchSheet('positions'), fetchSheet('events'), fetchSheet('collections'), fetchSheet('gallery')]);
      makeLinks();
      makeOpenings();
      makeEvents(3);
      makeGallery();
      break;
    case 'events-page':
      await Promise.all([fetchSheet('events')]);
      makeEvents(Number.POSITIVE_INFINITY);
      break;
    case 'council-page':
      await Promise.all([fetchSheet('council'), fetchSheet('positions')]);
      makeYearSelect();
      makeCouncilGrid();
      break;
    case 'merch-page':
      await Promise.all([fetchSheet('merch')]);
      makeMerch();
      break;
    case 'contact-page':
      await Promise.all([fetchSheet('contacts'), fetchSheet('positions')]);
      makeContactOptions();
      break;
    case 'leaderboard-page':
      await Promise.all([fetchSheet('matches'), fetchSheet('players'), fetchSheet('games'), fetchSheet('parameters')]);
      makeLeaderboardGames();
      setPlayerNames();
      calculatePlayerRatings();
      let currentBoard = localStorage.currentBoard != null ? localStorage.currentBoard : data.games[0].c[SHEETS.games.COLS.name].v;
      changeLeaderboard(currentBoard);
      break;
    default:
      break;
  }

  document.querySelectorAll(':has(>.tooltip)').forEach((el) => { handleTooltips(el); });

  window.addEventListener('resize', function() { document.querySelectorAll(':has(>.tooltip)').forEach((el) => { handleTooltips(el); }); });
  
  // document.querySelectorAll(':has(>.tooltip)').forEach((el) => {
  //   el.addEventListener('mouseover', (event) => { fixTooltipPosition(el); });
  // });
}
window.addEventListener('DOMContentLoaded', init);

function fixNullData() {
  Object.keys(SHEETS).forEach((key) => {
    data[key] = [];
  });
}

function makeSheetUrl(sheet) {
  return `${SHEETS[sheet].DOC}&sheet=${SHEETS[sheet].SHEET}&tq=${QUERY}`;
}

async function fetchSheet(sheet) {
  await fetch(makeSheetUrl(sheet)).then((res) => res.text()).then((rep) => { data[sheet] = JSON.parse(rep.substring(47).slice(0,-2)).table.rows; });
}

let startY;
let mouseStartY;
let canReload;
let reloading = false;
let wasAtTop;

const PULL_HEIGHT = 150;
const RELOAD_TIME = 400;

function ease(x, dir, type) {
  switch (dir) {
    case 'in':
      switch (type) {
        case 'poly2':
          return x * x;
        case 'poly3':
          return x * x * x;
        case 'exp':
          return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
        default:
          break;
      }
    case 'out':
      switch (type) {
        case 'poly2':
          return 1 - (1 - x) * (1 - x);
        case 'poly3':
          return 1 - Math.pow(1 - x, 3);
        case 'poly4':
          return 1 - Math.pow(1 - x, 4);
        case 'exp':
          return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
        case 'bounce':
          const c1 = 1.70158;
          const c3 = c1 + 1;
          return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
        default:
          break;
      }
    default:
      break;
  }
  return 0;
}

const indicator = document.querySelector('#reload-indicator');
indicator.innerHTML = '<i class="fa-solid fa-arrow-rotate-right"></i>'
const transformOnReload = document.querySelectorAll('#content, .section-header > :not(#reload-indicator):not(img)');

body.addEventListener('touchstart', (event) => {
  wasAtTop = false;
  canReload = true;
  reloading = false;
  startY = event.touches[0].pageY;
  mouseStartY = event.touches[0].clientY;
}, {passive: true});

body.addEventListener('touchmove', (event) => {
  const y = event.touches[0].pageY;
  const mouseY = event.touches[0].clientY;
  if (mouseY < mouseStartY) {
    if (wasAtTop && mouseStartY > (mouseY + 20)) {
      canReload = false;
      endReload(0);
    }
  }
  else {
    mouseStartY = mouseY;
  }
  if (document.scrollingElement.scrollTop === 0 && canReload == true) {
    wasAtTop = true;
    let pullEase = ease(Math.min((y - startY) / (PULL_HEIGHT * 7 / 8), 1), 'out', 'poly2');
    let scaleEase = ease(Math.min((y - startY) / (PULL_HEIGHT * 7 / 8), 1), 'in', 'poly3')
    let indicatorStyle = `filter: opacity(${Math.min(1, pullEase + 0.1)}); transform: translateY(calc((25px + 0.25 * var(--navbar-height)) * ${pullEase} + var(--section-header-height) / 6 * ${pullEase})) scale(${1 + 0.2 * scaleEase})`;

    indicator.style = 'transition-duration: 0s; ' + indicatorStyle + ';';

    transformOnReload.forEach((el) => {
      el.style = `transition-duration: 0s; transform: translateY(${3 * pullEase}vw)`;
      // filter: blur(${0.5 * pullEase}vw);
    })
    if (y > (startY + PULL_HEIGHT)) {
      reloading = true;
      // body.style = 'overflow: hidden;'
      indicator.style = indicatorStyle + ` rotate(360deg); transition-duration: ${RELOAD_TIME}ms;`;
      setTimeout(function() {
        indicator.style = `transition-duration: 0.1s; transform: translateY(0px) rotate(360deg);`;
      }, RELOAD_TIME)
      location.reload();
    }
  }
}, {passive: true});

function endReload(delay) {
  setTimeout(function(){
    indicator.style = 'transition-duration: 0.1s;';
    transformOnReload.forEach((el) => {
      el.style = 'transition-duration: 0.1s; transform: translateY(0);';
    });
  }, delay);
}

body.addEventListener('touchend', (event) => {
  endReload(reloading == true ? RELOAD_TIME : 0);
});

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

// HOME

function makeOpenings() {
  for (let i = 0; i < data.positions.length; i ++) {
    if (data.positions[i].c[SHEETS.positions.COLS.position] == null) { break; } // skip blank entries
    if (data.positions[i].c[SHEETS.positions.COLS.filled].v == false) { // if position not filled
      if (data.positions[i].c[SHEETS.positions.COLS.type].v == 'Executive') {
        document.getElementById('exec-openings').innerHTML += '<li><div>' + data.positions[i].c[SHEETS.positions.COLS.position].v + '</div><i class="fa-solid fa-circle-info"><div class="tooltip">' + data.positions[i].c[SHEETS.positions.COLS.responsibilities].v + '</div></i></li>';
      }
      else {
        document.getElementById('exo-openings').innerHTML += '<li><div>' + data.positions[i].c[SHEETS.positions.COLS.position].v + '</div><i class="fa-solid fa-circle-info"><div class="tooltip">' + data.positions[i].c[SHEETS.positions.COLS.responsibilities].v + '</div></i></li>';
      }
    }
  }
}

function makeLinks() {
  let html = '';
  for (let i = 0; i < data.links.length; i ++) {
    if (data.links[i].c[SHEETS.links.COLS.name] == null || data.links[i].c[SHEETS.links.COLS.link] == null || data.links[i].c[SHEETS.links.COLS.show].v == false) { continue; } // skip blank entries
    let icon = (data.links[i].c[SHEETS.links.COLS.icon] != null) ? '<i class="fa-solid fa-' + data.links[i].c[SHEETS.links.COLS.icon].v + '"></i>' : '';
    html += '<li><a class="button link" href="' + data.links[i].c[SHEETS.links.COLS.link].v + '" target="_blank">' + (icon + data.links[i].c[SHEETS.links.COLS.name].v) + '</a></li>';
  }
  document.getElementById('links').innerHTML = html;
}

function makeGallery() {
  let yearsSet = new Set();
  for (let i = 0; i < data.collections.length; i ++) { // loops through collections entries and gets the most recent year
    if (data.collections[i].c[SHEETS.collections.COLS.name] == null || data.collections[i].c[SHEETS.collections.COLS.show].v == false) { continue; }
    let currYear = Number(data.collections[i].c[SHEETS.collections.COLS.name].v.split(' ')[0].split('/')[0]);
    yearsSet.add(currYear);
  }

  galleryYears = [];
  for (let el of yearsSet) {
    galleryYears.push(el);
  }

  galleryYears = galleryYears.sort().reverse();

  let html = '';

  for (let i = 0; i < galleryYears.length; i ++) {
    html += '<h3>' + galleryYears[i] + '–' + (galleryYears[i] + 1) + '</h3>';
    for (let j = 0; j < data.collections.length; j ++) {
      if (data.collections[j].c[SHEETS.collections.COLS.name] == null || data.collections[j].c[SHEETS.collections.COLS.show].v == false) { continue; }
      let currYear = Number(data.collections[j].c[SHEETS.collections.COLS.name].v.split(' ')[0].split('/')[0]);
      if (galleryYears[i] != currYear) { continue; }
      let collectionName = data.collections[j].c[SHEETS.collections.COLS.name].v;
      html += '<h4>' + collectionName.substring(collectionName.indexOf(' ') + 1) + '</h4>';
      html += '<ul class="collection">';

      for (let k = 0; k < data.gallery.length; k ++) {
        if (data.gallery[k].c[SHEETS.gallery.COLS.image] == null || data.gallery[k].c[SHEETS.gallery.COLS.collection] == null || data.gallery[k].c[SHEETS.gallery.COLS.show].v == false) { continue; }
        if (data.gallery[k].c[SHEETS.gallery.COLS.collection].v != data.collections[j].c[SHEETS.collections.COLS.name].v) { continue; }
        let imgURL = data.gallery[k].c[SHEETS.gallery.COLS.image].v;
        let imgSrc = 'https://drive.google.com/thumbnail?id=' + imgURL.substring(imgURL.indexOf('/d/') + 3, imgURL.indexOf('/view')) + '&sz=w1080';
        html += '<li><figure><img src="' + imgSrc + '">';
        if (data.gallery[k].c[SHEETS.gallery.COLS.caption] != null) {
          html += '<figcaption>' + data.gallery[k].c[SHEETS.gallery.COLS.caption].v + '</figcaption>';
        }
        html += '</figure></li>';
      }
      html += '</ul>';
    }
  }
  
  document.getElementById('gallery').innerHTML = html;
}

// EVENTS

function makeEvents(num) {
  let upcoming = new Map();
  let today = Date.now() - 1000 * 60 * 60 * 24;
  for (let i = 0; i < data.events.length; i ++) {
    if (data.events[i].c[SHEETS.events.COLS.show].v == false || data.events[i].c[SHEETS.events.COLS.date] == null || data.events[i].c[SHEETS.events.COLS.name] == null) { continue; } // skip blank entries
    let date = data.events[i].c[SHEETS.events.COLS.date].v.substring(5).split(')')[0].split(',');
    let utc = Date.UTC(date[0], date[1], date[2]);
    if (utc < today) { continue; }
    upcoming.set(i, utc);
  }
  let sorted = Array.from(upcoming).sort((a, b) => a[1] - b[1]).slice(0, Math.min(num, Array.from(upcoming).length));

  let html = '';
  for (let i = 0; i < sorted.length; i ++) {
    let currEvent = data.events[sorted[i][0]];
    let date = currEvent.c[SHEETS.events.COLS.date].v.substring(5).split(')')[0].split(',');
    html += '<li class="event">';

    let imgSrc = '/media/events/none.jpg';
    if (currEvent.c[SHEETS.events.COLS.image] != null) {
      let imgURL = currEvent.c[SHEETS.events.COLS.image].v;
      imgSrc = 'https://drive.google.com/thumbnail?id=' + imgURL.substring(imgURL.indexOf('/d/') + 3, imgURL.indexOf('/view')) + '&sz=w1080';
    }

    if (currEvent.c[SHEETS.events.COLS.instagram] != null) {
      html += '<a href="' + currEvent.c[SHEETS.events.COLS.instagram].v + '" target="_blank">';
    }
    html += '<img src="' + imgSrc + '" alt="' + currEvent.c[SHEETS.events.COLS.name].v + '">';
    html += (currEvent.c[SHEETS.events.COLS.instagram] != null) ? '</a>' : '';
    
    html += '<h2>' + currEvent.c[SHEETS.events.COLS.name].v + '</h2>';
    html += '<ul class="event-dtl">';
    html += '<li><i class="fa-solid fa-calendar"></i>' + date[2] + ' ' + MONTHS.get(Number(date[1]) + 1) + ' ' + date[0] + '</li>';
    let eventTime = (currEvent.c[SHEETS.events.COLS.start] == null ? 'TBD' : (currEvent.c[SHEETS.events.COLS.start].f + (currEvent.c[SHEETS.events.COLS.end] == null ? '' : ('–' + currEvent.c[SHEETS.events.COLS.end].f))));
    html += '<li><i class="fa-solid fa-clock"></i>' + eventTime + '</li>';
    html += '<li><i class="fa-solid fa-location-dot"></i>' + (currEvent.c[SHEETS.events.COLS.location] != null ? currEvent.c[SHEETS.events.COLS.location].v : 'TBD') + '</li>';
    html += '</ul>';
    if (currEvent.c[SHEETS.events.COLS.rsvp] != null || currEvent.c[SHEETS.events.COLS.calendar] != null) {
      html += '<ul class="event-links">';
      html += (currEvent.c[SHEETS.events.COLS.rsvp] != null ? ('<li><a class="button link" href="' + currEvent.c[SHEETS.events.COLS.rsvp].v + '" target="_blank"><i class="fa-solid fa-reply"></i>RSVP</a></li>') : '');
      html += (currEvent.c[SHEETS.events.COLS.calendar] != null ? ('<li><a class="button link" href="' + currEvent.c[SHEETS.events.COLS.calendar].v + '" target="_blank"><i class="fa-brands fa-google"></i>Add to Calendar</a></li>') : '');
      html += '</ul>';
    }
    html += '</li>';
  }
  document.getElementById('events').innerHTML = html;
}

// COUNCIL

function makeYearSelect() {
  let yearsSet = new Set();
  for (let i = 0; i < data.council.length; i ++) { // loops through council entries and gets the most recent year
    if (data.council[i].c[SHEETS.council.COLS.year] == null) { break; } // skip blank entries
    let currYear = Number(data.council[i].c[SHEETS.council.COLS.year].v.split('/')[0]);
    if (isNaN(currYear) == true) { continue; } //! FOR SOME REASON, HEADER IS GETTING FETCHED TOO
    yearsSet.add(currYear);
  }

  councilYears = [];
  for (let el of yearsSet) {
    councilYears.push(el);
  }

  councilYears = councilYears.sort().reverse();

  let selectHTML = '';
  for (let i = 0; i < councilYears.length; i ++) {
    selectHTML += '<option value="' + councilYears[i] + '">' + councilYears[i] + '–' + (councilYears[i] + 1) + '</option>';
  }
  document.getElementById('council-year').innerHTML = selectHTML;
}

function makeCouncilGrid() {
  let selectObj = document.getElementById('council-year');
  let selectedYear = selectObj.options[selectObj.selectedIndex].value;
  
  let html = '';
  for (let p = 0; p < data.positions.length; p ++) { // looping through the positions sheet allows for heirarchical ordering even if the 'Council' sheet entries are out of order
    for (let i = 0; i < data.council.length; i ++) {
      if (data.council[i].c[SHEETS.council.COLS.year] == null) { break; } // skip blank entries
      let currYear = Number(data.council[i].c[SHEETS.council.COLS.year].v.split('/')[0]); // current year
      if (isNaN(currYear) == true) { continue; }
      let currPositions = data.council[i].c[SHEETS.council.COLS.position].v.split(', '); // creates an array of positions held by the member
      if (currYear == selectedYear && currPositions[0] == data.positions[p].c[SHEETS.positions.COLS.position].v) { // heirarchical ordering done by *first* position in list
        html += '<li class="council-member">';

        let imgSrc = '/media/council/none.jpg';
        if (data.council[i].c[SHEETS.council.COLS.photo].v != null) { //! THIS '.v' SHOULD BE REMOVED IF A COLUMN IS PLACED AFTER PHOTO
          let imgURL = data.council[i].c[SHEETS.council.COLS.photo].v;
          imgSrc = 'https://drive.google.com/thumbnail?id=' + imgURL.substring(imgURL.indexOf('/d/') + 3, imgURL.indexOf('/view')) + '&sz=w1080';
        }

        html += ('<img src="' + imgSrc + '" alt="' + data.council[i].c[SHEETS.council.COLS.name].v + '">'); // photo
        html += '<h2>' + data.council[i].c[SHEETS.council.COLS.name].v + '</h2>'; // name
        html += '<h3>';
        for (let j = 0; j < currPositions.length; j ++) {
          for (let k = 0; k < data.positions.length; k ++) {
            if (currPositions[j] == data.positions[k].c[SHEETS.positions.COLS.position].v) {
              html += '<span>' + currPositions[j] + '<i class="fa-solid fa-circle-info"><div class="tooltip">' + data.positions[k].c[SHEETS.positions.COLS.responsibilities].v + '</div></i></span>';
              break;
            }
          }
          if (j + 1 < currPositions.length) { // add comma if more than one position, and not at last one
            html += ', ';
          }
        }
        html += '</h3>';
        if (currYear == councilYears[0]) { // only list emails for current council
          let firstEmail = true; // in the event of no emails, we dont want to create empty lists
          for (let j = 0; j < currPositions.length; j ++) {
            for (let k = 0; k < data.positions.length; k ++) {
              if (currPositions[j] == data.positions[k].c[SHEETS.positions.COLS.position].v) {
                if (data.positions[k].c[SHEETS.positions.COLS.email] != null) {
                  if (firstEmail == true) {
                    html += '<ul>';
                    firstEmail = false;
                  }
                  html += '<li>';
                  html += '<a class="button link" href="mailto:' + data.positions[k].c[SHEETS.positions.COLS.email].v + '">' + data.positions[k].c[SHEETS.positions.COLS.email].v + '</a>';
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

// MERCH

function makeMerch() {
  let selectObj = document.getElementById('merch-categories');
  let html = '';

  let categories = new Set(["ALL"]);
  for (let i = 0; i < data.merch.length; i ++) {
    if (data.merch[i].c[SHEETS.merch.COLS.item] == null || data.merch[i].c[SHEETS.merch.COLS.price] == null || data.merch[i].c[SHEETS.merch.COLS.show].v == false) { continue; } // skip blank entries
    html += '<li class="merch-item' + ((data.merch[i].c[SHEETS.merch.COLS.category] != null) ? (' ' + data.merch[i].c[SHEETS.merch.COLS.category].v.toLowerCase()) : '') + '">';
    html += '<img src="media/merch/' + data.merch[i].c[SHEETS.merch.COLS.item].v + '.jpg">';
    html += '<h2>' + data.merch[i].c[SHEETS.merch.COLS.item].v + '</h2>';
    html += '<div><p class="price">$' + Number(data.merch[i].c[SHEETS.merch.COLS.price].v).toFixed(2) + '</p>';
    if (data.merch[i].c[SHEETS.merch.COLS.sizes] != null) {
      let sizes = data.merch[i].c[SHEETS.merch.COLS.sizes].v.split(', ');
      let oosSizes = (data.merch[i].c[SHEETS.merch.COLS.oos_sizes] != null) ? data.merch[i].c[SHEETS.merch.COLS.oos_sizes].v.split(', ') : [];
      html += '<ul class="sizes">';
      for (let j = 0; j < sizes.length; j ++) {
        let isOutOfStock = false;
        for (let k = 0; k < oosSizes.length; k ++) {
          if (sizes[j] == oosSizes[k]) { isOutOfStock = true; }
        }
        html += '<li' + ((isOutOfStock == true) ? ' class="out-of-stock"' : '') + '>' + sizes[j] + '</li>';
      }
      html += '</ul>';
    }
    else if (data.merch[i].c[SHEETS.merch.COLS.status] != null && data.merch[i].c[SHEETS.merch.COLS.status].v == 'Out of stock') {
      html += '<p class="out-of-stock">Out of stock</p>';
    }
    html += '</div>';
    html += '</li>'

    if (data.merch[i].c[SHEETS.merch.COLS.category] != null) { // create categories set
      categories.add(data.merch[i].c[SHEETS.merch.COLS.category].v.toUpperCase());
    }
  }
  document.getElementById('merch-grid').innerHTML = html;

  categories = Array.from(categories);
  
  for (let i = 0; i < categories.length; i ++) {
    selectObj.innerHTML += '<option value="' + categories[i] + '">' + categories[i] + '</option>';
  }
}

function filterMerch() {
  let selectObj = document.getElementById('merch-categories');
  let category = selectObj.options[selectObj.selectedIndex].value.toLowerCase();

  let merchItems = document.querySelectorAll('.merch-item');

  for (let i = 0; i < merchItems.length; i ++) {
    if (category == 'all' || merchItems[i].classList.contains(category)) {
      merchItems[i].style.display = '';
    }
    else {
      merchItems[i].style.display = 'none';
    }
  }
}
document.querySelectorAll('#merch-categories').forEach((el) => {
  el.addEventListener('input', filterMerch);
});

// CONTACT

function makeContactOptions() {
  let html = '';
  for (let i = 0; i < data.contacts.length; i ++) {
    if (data.contacts[i].c[SHEETS.contacts.COLS.option] == null || data.contacts[i].c[SHEETS.contacts.COLS.show].v == false) { continue; } // skip blank entries
    html += '<option value="' + data.contacts[i].c[SHEETS.contacts.COLS.option].v + '">' + data.contacts[i].c[SHEETS.contacts.COLS.option].v + '</option>';
  }

  let key;
  for (let i = 0; i < data.positions.length; i ++) {
    if (data.positions[i].c[SHEETS.positions.COLS.email] != null && data.contacts[0].c[SHEETS.contacts.COLS.email].v == data.positions[i].c[SHEETS.positions.COLS.email].v) {
      key = data.positions[i].c[SHEETS.positions.COLS.key].v;
      break;
    }
  }

  document.getElementById('form-key').setAttribute('value', key);
  document.getElementById('form-subject').setAttribute('value', `Website Contact Message (${data.contacts[0].c[SHEETS.contacts.COLS.option].v})`);

  document.getElementById('form-type').innerHTML = html;
}

function updateContactForm() {
  let selectObj = document.getElementById('form-type');
  let type = selectObj.options[selectObj.selectedIndex].value;

  let key;
  for (let i = 0; i < data.contacts.length; i ++) {
    if (data.contacts[i].c[SHEETS.contacts.COLS.option] == null || data.contacts[i].c[SHEETS.contacts.COLS.show].v == false) { continue; } // skip blank entries
    if (data.contacts[i].c[SHEETS.contacts.COLS.option].v == type) {
      let searchEmail = (data.contacts[i].c[SHEETS.contacts.COLS.override] != null) ? data.contacts[i].c[SHEETS.contacts.COLS.override].v : (data.contacts[i].c[SHEETS.contacts.COLS.email] != null) ? data.contacts[i].c[SHEETS.contacts.COLS.email].v : data.contacts[0].c[SHEETS.contacts.COLS.email].v; // take preference for override, otherwise use regular email, if both blank, default to first entry
      for (let j = 0; j < data.positions.length; j ++) {
        if (data.positions[j].c[SHEETS.positions.COLS.email] != null && data.positions[j].c[SHEETS.positions.COLS.email].v == searchEmail) {
          key = (data.positions[j].c[SHEETS.positions.COLS.key] != null) ? data.positions[j].c[SHEETS.positions.COLS.key].v : data.positions[0].c[SHEETS.positions.COLS.key].v; // lowermost default to president
          break;
        }
      }
    }
  }
  let subject = `Website Contact Message (${type})`;

  document.getElementById('form-key').setAttribute('value', key);
  document.getElementById('form-subject').setAttribute('value', subject);
}
document.querySelectorAll('#form-type').forEach((el) => {
  el.addEventListener('input', updateContactForm);
});

// LEADERBOARD

function dateToUTC(date) {
  let splitDate = date.split('(')[1].split(')')[0].split(',');
  if (splitDate.length > 3) {
    return Date.UTC(splitDate[0], splitDate[1], splitDate[2], splitDate[3], splitDate[4]);
  }
  else {
    return Date.UTC(splitDate[0], splitDate[1], splitDate[2]);
  }
}

function getParamsAtDate(game, date) {
  let searchUtc = dateToUTC(date);

  let latestIndex = -1;
  let firstOfGame = true;

  for (let i = 0; i < data.parameters.length; i ++) {
    if (data.parameters[i].c[SHEETS.parameters.COLS.game] == null || data.parameters[i].c[SHEETS.parameters.COLS.game].v != game || data.parameters[i].c[SHEETS.parameters.COLS.starts] == null) { continue; }

    let paramUtc = dateToUTC(data.parameters[i].c[SHEETS.parameters.COLS.starts].v);

    if (firstOfGame == true) {
      firstOfGame = false;
      latestIndex = i;
    }
    else if (searchUtc >= paramUtc) {
      latestIndex = i;
    }
  }

  return data.parameters[latestIndex];
}

function setPlayerNames() {
  playerNames = new Map();
  for (let i = 0; i < data.players.length; i ++) {
    if (data.players[i].c[SHEETS.players.COLS.id] == null || data.players[i].c[SHEETS.players.COLS.name] == null) { continue; }
    playerNames.set(data.players[i].c[SHEETS.players.COLS.id].v, data.players[i].c[SHEETS.players.COLS.name].v);
  }
}

function minMaxLerp(a, b, t) {
  return Math.max(0, Math.min(1, t)) * (Math.max(a, b) - Math.min(a, b)) + Math.min(a, b);
}

function getPlayerRating(game, id, timestamp) {
  if (playerRatings[game].has(id) == false) {
    let latestInitRating = getParamsAtDate(game, timestamp).c[SHEETS.parameters.COLS.init_rating].v;
    playerRatings[game].set(id, latestInitRating);
  }
  return playerRatings[game].get(id);
}

function setPlayerRating(game, id, rating) {
  playerRatings[game].set(id, rating);
}

function calculatePlayerRatings() {
  for (let i = 0; i < data.games.length; i ++) {
    if (data.games[i].c[SHEETS.games.COLS.name] == null || data.games[i].c[SHEETS.games.COLS.system] == null || data.games[i].c[SHEETS.games.COLS.starts] == null || dateToUTC(data.games[i].c[SHEETS.games.COLS.starts].v) > Date.now() || data.games[i].c[SHEETS.games.COLS.show].v == false) { continue; }
    playerRatings[data.games[i].c[SHEETS.games.COLS.name].v] = new Map();
  }

  for (let r = 0; r < data.matches.length; r ++) {
    if (data.matches[r].c[SHEETS.matches.COLS.timestamp] == null) { continue; }
    // get game
    let game = data.matches[r].c[SHEETS.matches.COLS.game].v;
    let timestamp = data.matches[r].c[SHEETS.matches.COLS.timestamp].v;

    let system = '';
    for (let i = 0; i < data.games.length; i ++) {
      if (data.games[i].c[SHEETS.games.COLS.name] != null && data.games[i].c[SHEETS.games.COLS.name].v == game && data.games[i].c[SHEETS.games.COLS.show].v == true && data.games[i].c[SHEETS.games.COLS.system] != null && data.games[i].c[SHEETS.games.COLS.starts] != null && dateToUTC(data.games[i].c[SHEETS.games.COLS.starts].v) <= dateToUTC(timestamp)) {
        system = data.games[i].c[SHEETS.games.COLS.system].v;
        break;
      }
    }
    if (system == '') { continue; } // if no game record being tracked, don't bother

    // get player ids
    let ids = [];
    // team A
    ids[0] = Number(data.matches[r].c[SHEETS.matches.COLS.p1_id].v); // P1
    ids[1] = data.matches[r].c[SHEETS.matches.COLS.p2_id] != null ? Number(data.matches[r].c[SHEETS.matches.COLS.p2_id].v) : 0; // P2
    // team B
    ids[2] = data.matches[r].c[SHEETS.matches.COLS.p3_id] != null ? Number(data.matches[r].c[SHEETS.matches.COLS.p3_id].v) : 0; // P3
    ids[3] = data.matches[r].c[SHEETS.matches.COLS.p4_id] != null ? Number(data.matches[r].c[SHEETS.matches.COLS.p4_id].v) : 0; // P4

    // get player ratings (or set to init value if new)
    let Rs = []; // prior ratings
    let playerCount = 0;
    for (let i = 0; i < 4; i ++) {
      if (ids[i] != 0) {
        Rs[i] = getPlayerRating(game, ids[i], timestamp);
        playerCount ++;
      }
      else {
        Rs[i] = Rs[Math.max(i-1, 0)];
      }
    }

    let gameParams = getParamsAtDate(game, timestamp);

    if (system == 'Best Time') {
      let time = data.matches[r].c[SHEETS.matches.COLS.time].v;
      if (time < Rs[0]) {
        setPlayerRating(game, ids[0], time);
      }
    }
    else if (system == 'Elo FFA') {
      let Qs = []; // q values
      for (let i = 0; i < playerCount; i ++) {
        Qs[i] = Math.pow(gameParams.c[SHEETS.parameters.COLS.base].v, Rs[i] / gameParams.c[SHEETS.parameters.COLS.divisor].v);
      }

      let Es = [new Array(playerCount), new Array(playerCount), new Array(playerCount), new Array(playerCount)]; // estimated scores
      for (let i = 0; i < playerCount; i ++) {
        for (let j = 0; j < playerCount; j ++) {
          Es[i][j] = Qs[i] / (Qs[i] + Qs[j]); // player i playing against player j
        }
      }

      let Ss = [data.matches[r].c[SHEETS.matches.COLS.p1_points] != null ? Number(data.matches[r].c[SHEETS.matches.COLS.p1_points].v) : 0, data.matches[r].c[SHEETS.matches.COLS.p2_points] != null ? Number(data.matches[r].c[SHEETS.matches.COLS.p2_points].v) : 0, data.matches[r].c[SHEETS.matches.COLS.p3_points] != null ? Number(data.matches[r].c[SHEETS.matches.COLS.p3_points].v) : 0, data.matches[r].c[SHEETS.matches.COLS.p4_points] != null ? Number(data.matches[r].c[SHEETS.matches.COLS.p4_points].v) : 0]; // actual scores

      for (let i = 0; i < playerCount; i ++) {
        let mult = 0;
        for (let j = 0; j < playerCount; j ++) {
          if (i == j) { continue; }
          let wld = Ss[i] > Ss[j] ? 1 : Ss[i] < Ss[j] ? 0 : 0.5; // win-lose-draw
          mult += wld - Es[i][j];
        }
        setPlayerRating(game, ids[i], Rs[i] + gameParams.c[SHEETS.parameters.COLS.k].v / (playerCount - 1) * mult);
      }
    }
    else if (system == 'Elo Teams') {
      let Rt = [minMaxLerp(Rs[0], Rs[1], gameParams.c[SHEETS.parameters.COLS.interpolation].v), minMaxLerp(Rs[2], Rs[3], gameParams.c[SHEETS.parameters.COLS.interpolation].v)]; // ratings for team A and B
      let Qs = [Math.pow(gameParams.c[SHEETS.parameters.COLS.base].v, Rt[0] / gameParams.c[SHEETS.parameters.COLS.divisor].v), Math.pow(gameParams.c[SHEETS.parameters.COLS.base].v, Rt[1] / gameParams.c[SHEETS.parameters.COLS.divisor].v)];
      let Es = [Qs[0] / (Qs[0] + Qs[1]), Qs[1] / (Qs[0] + Qs[1])]; // estimated scores for team A and B
      let Ss = [data.matches[r].c[SHEETS.matches.COLS.winner].v == 'Team A' ? 1 : 0, data.matches[r].c[SHEETS.matches.COLS.winner].v == 'Team B' ? 1 : 0]; // actual scores for team A and B

      for (let i = 0; i < 4; i ++) {
        if (ids[i] == 0) { continue; }
        setPlayerRating(game, ids[i], Rs[i] + gameParams.c[SHEETS.parameters.COLS.k].v * (Ss[Math.floor(i / 2)] - Es[Math.floor(i / 2)]));
      }
    }
  }

  refreshLeaderboard();
}

function refreshLeaderboard() {
  for (let i = 0; i < data.games.length; i ++) {
    if (data.games[i].c[SHEETS.games.COLS.name] == null || data.games[i].c[SHEETS.games.COLS.system] == null || data.games[i].c[SHEETS.games.COLS.starts] == null || dateToUTC(data.games[i].c[SHEETS.games.COLS.starts].v) > Date.now() || data.games[i].c[SHEETS.games.COLS.show].v == false) { continue; }

    let game = data.games[i].c[SHEETS.games.COLS.name].v;
    let system = data.games[i].c[SHEETS.games.COLS.system].v;
    let rounding = (data.games[i].c[SHEETS.games.COLS.rounding] != null) ? Math.round(data.games[i].c[SHEETS.games.COLS.rounding].v): 0;
    let rankedMap;

    if (system == 'Best Time') {
      rankedMap = new Map(Array.from(playerRatings[game]).sort((a, b) => a[1] - b[1]));
    }
    else {
      rankedMap = new Map(Array.from(playerRatings[game]).sort((b, a) => a[1] - b[1]));
    }
    document.getElementById(game + '-board').innerHTML = makeLeaderboardHTML(Array.from(rankedMap.values()), Array.from(rankedMap.keys()), rounding);
  }

  // let cards = document.querySelectorAll(".player-card");
  // cards.forEach((el) => observer.observe(el));
}

let shownGames = [];

function makeLeaderboardGames() {
  let buttonsHTML = '';
  let boardsHTML = '';
  for (let i = 0; i < data.games.length; i ++) {
    if (data.games[i].c[SHEETS.games.COLS.name] == null || data.games[i].c[SHEETS.games.COLS.system] == null || data.games[i].c[SHEETS.games.COLS.starts] == null || data.games[i].c[SHEETS.games.COLS.show].v == false) { continue; }

    shownGames.push(data.games[i].c[SHEETS.games.COLS.name].v);

    buttonsHTML += `<li><button class="button" id="${data.games[i].c[SHEETS.games.COLS.name].v}-button">`;
    if (data.games[i].c[SHEETS.games.COLS.icon] != null) {
      buttonsHTML += `<i class="fa-solid fa-${data.games[i].c[SHEETS.games.COLS.icon].v}"></i>`;
    }
    buttonsHTML += `${data.games[i].c[SHEETS.games.COLS.name].v}</button></li>`;

    boardsHTML += `<ul class="leaderboard-container" id="${data.games[i].c[SHEETS.games.COLS.name].v}-board" style="display: none;">`;
    
    if (dateToUTC(data.games[i].c[SHEETS.games.COLS.starts].v) > Date.now()) {
      let date = data.games[i].c[SHEETS.games.COLS.starts].v.split('(')[1].split(')')[0].split(',');
      boardsHTML += `<li class="player-card message"><div>This leaderboard starts on ${date[2]} ${MONTHS.get(Number(date[1]) + 1)} ${date[0]}!</div></li>`;
    }
    
    boardsHTML += `</ul>`;
  }
  document.getElementById('leaderboard-games').innerHTML = buttonsHTML;
  document.getElementById('leaderboards').innerHTML = boardsHTML;

  document.querySelectorAll('#leaderboard-page :not(nav) .button').forEach(el => {
    el.addEventListener('click', event => { changeLeaderboard(el.getAttribute('id').split('-')[0]); });
  });
}

function makeLeaderboardHTML(values, keys, round) {
  let html = '';

  if (keys.length == 0) {
      return `<li class="player-card message"><div>No contenders yet. Be the first!</div></li>`;
  }

  for (let i = 0; i < keys.length; i ++) {
    let playerName = playerNames.get(keys[i]) ? playerNames.get(keys[i]) : 'Anonymous';

    let rating = Math.round(values[i] * Math.pow(10, -round)) / Math.pow(10, -round);

    let tieCount = 0;
    while (i > 0 && rating == Math.round(values[i - 1] * Math.pow(10, -round)) / Math.pow(10, -round)) {
      i --;
      tieCount ++;
    }

    html += '<li class="player-card"><div class="rank r' + (i + 1) + '">' + (i + 1) + '</div><div class="name">' + playerName + '</div><div class="rating">' + rating.toFixed(Math.max(-round, 0)) + '</div></li>';

    i += tieCount;
  }

  return html;
}

function changeLeaderboard(id) {
  document.querySelectorAll('.leaderboard-container').forEach(el => {
    el.style.display = 'none';
  });
  document.querySelectorAll('#leaderboard-page :not(nav) .button').forEach(el => {
    el.classList.remove('selected');
  });
  document.getElementById(id + '-board').style.display = '';
  document.getElementById(id + '-button').classList.add('selected');

  localStorage.currentBoard = id;
}

function filterSearch() {
  let cards = document.querySelectorAll('.player-card');
  let input = document.getElementById('leaderboard-search').value.toUpperCase();
  for (let i = 0; i < cards.length; i ++) {
    let nameObj = cards[i].querySelector('.name');
    if (nameObj == null) { continue; }
    let name = nameObj.innerHTML;
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