/* <------------------------- Selectors ------------------------->*/
const mainArticle = document.querySelector(".js-main-article");
const searchBtn = document.querySelector(".js-submit-button");
const textInput = document.querySelector(".js-input-field");
const radioOptions = document.querySelectorAll(".js-radio");
const form = document.querySelector(".js-form");
const mainHeading = document.querySelector(".js-main-heading");
const dialog = document.querySelector(".js-modal");

/* <------------------------- Event Listeners------------------------->*/
document.addEventListener("DOMContentLoaded", renderTenNewReleases);
searchBtn.addEventListener("click", renderSearchResuls);
/* <------------------------- Functions ------------------------->*/
//Seach button functions
async function renderSearchResuls(e) {
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
  console.log(topTen);

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
  div.setAttribute("id", result.id);
  div.append(img, h4, p);
  //   div.addEventListener("click", showSongOrAlbumModal)

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
