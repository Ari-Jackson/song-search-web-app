/* <------------------------- Selectors ------------------------->*/
//main page
const mainArticle = document.querySelector(".js-main-article");
const searchBtn = document.querySelector(".js-submit-button");
const textInput = document.querySelector(".js-input-field");
const radioOptions = document.querySelectorAll(".js-radio");
const form = document.querySelector(".js-form");
const mainHeading = document.querySelector(".js-main-heading");
//modal
const dialog = document.querySelector(".js-modal");
const dialogMain = document.querySelector(".js-modal-section");
const closeModal = document.querySelector(".js-x-button");

/* <------------------------- Event Listeners------------------------->*/
//on load
document.addEventListener("DOMContentLoaded", renderTenNewReleases);
//on search
searchBtn.addEventListener("click", renderSearchResults);

//open modal on line 167

//close modal
closeModal.addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => modalPlay.removeAttribute("id"));

/* <------------------------- Functions ------------------------->*/
//Dialog Functions
async function showSongOrAlbumModal(e) {
  dialogMain.innerHTML = "";

  const result = await fetchSingleResult(e);

  renderModalImg(result);
  renderResultModal(result);

  dialog.showModal();
}

function renderModalImg(result) {
  
  const img = document.createElement("img");
  img.setAttribute(
    "src",
    result.type == "track" ? result.album.images[1].url : result.images[1].url
  );
  img.setAttribute("class", "album-cover");

  dialogMain.append(img);
}

function renderResultModal(result) {
  console.log(result);
  // heading

  const name = document.createElement("h4");
  name.textContent = `${result.name}`;

  //main content
  const artist = document.createElement("p");
  artist.innerHTML = `<strong>Artists: </strong> ${result.artists
    .map((artist) => artist.name)
    .join(", ")}`;

  //just for albums
  const albumType = document.createElement("h5");
  albumType.textContent = result.album_type == "single" ? "Single" : "Album";

  const released = document.createElement("p");
  released.innerHTML = `<strong>Realease Date: </strong> ${new Date(
    result.release_date
  ).toLocaleDateString("en-us", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })}`;

  const recordingLabel = document.createElement("p");
  recordingLabel.innerHTML = `<strong>Record Label: </strong> ${result.label}`;

  const copyright = document.createElement("p");
  copyright.textContent = `${result.copyrights[0].text}`;

  //append
  const div = document.createElement("div");
  div.append(name, albumType, artist, released, recordingLabel, copyright);

  dialogMain.append(div);
}

async function fetchSingleResult(e) {
  const type = e.target.id.split(" ");

  const requestOptions = await createRequestOptions();

  let resultRaw = await fetch(
    `https://api.spotify.com/v1/${type[0]}s/${type[1]}`,
    requestOptions
  );

  let result = await resultRaw.json();

  return result;
}

//Seach button functions
async function renderSearchResults(e) {
  e.preventDefault();

  const searchResults = await returnTenSearchResults();

  textInput.value = "";
  mainArticle.innerHTML = "";

  mainHeading.textContent = "Search Results";


  searchResults[Object.keys(searchResults)[0]].items.forEach(renderResult);
}

async function returnTenSearchResults() {
  const q = textInput.value.replace(/\s/g, "%20");
  const type = Array.from(radioOptions).find((option) => option.checked).value;

  const requestOptions = await createRequestOptions();

  let rawResult = await fetch(
    `https://api.spotify.com/v1/search?q=${q}&type=${type}&limit=10`,
    requestOptions
  );

  let jsonResult = await rawResult.json();

  return jsonResult;
}

//On Load Functions
async function renderTenNewReleases() {
  let topTen = await fetchTopTen();
  topTen.albums.items.forEach(renderResult);
}

function renderResult(result) {
  const h4 = document.createElement("h4");
  h4.textContent = result.name;

  const img = document.createElement("img");
  img.setAttribute(
    "src",
    result.hasOwnProperty("images")
      ? result.images[1].url
      : result.album.images[1].url
  );
  img.setAttribute("class", "album-cover");

  const p = document.createElement("p");
  p.textContent = result.artists[0].name;

  const div = document.createElement("div");
  div.setAttribute("class", "card");
  div.setAttribute("id", result.type + " " + result.id);

  div.append(img, h4, p);
  div.addEventListener("click", showSongOrAlbumModal);

  mainArticle.append(div);
}

async function fetchTopTen() {
  let requestOptions = await createRequestOptions();

  let topTenRaw = await fetch(
    "https://api.spotify.com/v1/browse/new-releases?limit=10&country=US",
    requestOptions
  );

  let topTen = await topTenRaw.json();

  return topTen;
}

async function createRequestOptions() {
  const tokenInfo = await getToken();

  const myHeaders = new Headers([
    ["Accept", "application/json"],
    ["Content-Type", "application/json"],
    ["Authorization", "Bearer " + tokenInfo],
  ]);

  return {
    method: "GET",
    headers: myHeaders,
  };
}

async function getToken() {
  const clientId = "bc1cdb2dee2845e9836cf96cd3fb1f4f";
  const clientSecret = "ffb8e1b3153941ca8de5102997a6dd1f";

  let myHeaders = new Headers([
    ["Authorization", "Basic " + btoa(clientId + ":" + clientSecret)],
    ["Content-Type", "application/x-www-form-urlencoded"],
  ]);

  let urlencoded = new URLSearchParams([["grant_type", "client_credentials"]]);

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
  };

  let result = await fetch(
    "https://accounts.spotify.com/api/token",
    requestOptions
  );

  let jsonResult = await result.json();

  return jsonResult.access_token;
}
