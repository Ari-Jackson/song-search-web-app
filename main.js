/* <------------------------- Selectors ------------------------->*/
const mainArticle = document.querySelector(".js-main-article");
const searchBtn = document.querySelector(".js-submit-button");
const textInput = document.querySelector(".js-input-field");
const radioOptions = document.querySelectorAll(".js-radio");
const form = document.querySelector(".js-form");
const mainHeading = document.querySelector(".js-main-heading");

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
  const endpoint = "https://api.spotify.com/v1/search?";
  const q = textInput.value.replace(/\s/g, "%20");
  const type = Array.from(radioOptions).find((option) => option.checked).value;
  const token = await getToken();

  const myHeaders = new Headers([
    ["Accept", "application/json"],
    ["Content-Type", "application/json"],
    ["Authorization", "Bearer " + token.access_token],
  ]);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
  };

  let rawResult = await fetch(
    `${endpoint}q=${q}&type=${type}&limit=10`,
    requestOptions
  );

  let jsonResult = await rawResult.json();

  return jsonResult;
}

const renderResult = (result) => {
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
  div.append(img, h4, p);
  mainArticle.append(div);
};

//On Load Functions

async function renderTenNewReleases() {
  let tokenInfo = await getToken();
  let topTen = await getTopTen(tokenInfo);

  console.log(topTen.albums.items);

  topTen.albums.items.forEach(renderResult);
}

async function getTopTen(tokenInfo) {
  const myHeaders = new Headers([
    ["Accept", "application/json"],
    ["Content-Type", "application/json"],
    ["Authorization", "Bearer " + tokenInfo.access_token],
  ]);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "manual",
  };

  let topTenRaw = await fetch(
    "https://api.spotify.com/v1/browse/new-releases?limit=10&country=US",
    requestOptions
  );

  let topTen = await topTenRaw.json();

  return topTen;
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

  return jsonResult;
}
