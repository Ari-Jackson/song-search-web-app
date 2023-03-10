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
document.addEventListener("DOMContentLoaded", renderNewReleases);
//on search
searchBtn.addEventListener("click", renderSearchResults);

//open modal inside renderResult
//close modal
closeModal.addEventListener("click", () => dialog.close());

/* <------------------------- Functions ------------------------->*/
//Modal Functions
async function showSongOrAlbumModal(e) {
  dialogMain.innerHTML = "";

  const result = await fetchSingleResult(e);

  renderResultModal(result);

  dialog.showModal();
}

function createImg(result) {
  const img = document.createElement("img");
  img.setAttribute(
    "src",
    result.hasOwnProperty("images")
      ? result.images[1].url
      : result.album.images[1].url
  );
  img.setAttribute("class", "album-cover");

  return img;
}

function createAllResultInfo(result, appendTo) {
  const name = document.createElement("h4");
  name.textContent = `${result.name}`;

  const albumType = document.createElement("h5");
  albumType.textContent = result.hasOwnProperty("album")
    ? album.album_type
    : "Album";

  //main content
  const artist = document.createElement("p");
  artist.innerHTML = `<strong>Artists: </strong> ${result.artists
    .map((artist) => artist.name)
    .join(", ")}`;

  const albumInfo = result.hasOwnProperty("album") ? result.album : result;

  const released = document.createElement("p");
  released.innerHTML = `<strong>Realease Date: </strong> ${new Date(
    albumInfo.release_date
  ).toLocaleDateString("en-us", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })}`;

  appendTo.append(name, albumType, artist, released);
}

function renderResultModal(result) {
  const div = document.createElement("div");

  createAllResultInfo(result, div);

  if (!result.hasOwnProperty("album")) {
    const recordingLabel = document.createElement("p");
    recordingLabel.innerHTML = `<strong>Record Label: </strong> ${result.label}`;

    const copyright = document.createElement("p");
    copyright.textContent = `${
      result.hasOwnProperty("copyrights")
        ? result.copyrights[0].text
        : "Copyright Unavailable"
    }`;

    div.append(recordingLabel, copyright);
  } else {
    //duration
    let minute = Math.floor(result.duration_ms / 1000 / 60);
    let second = Math.ceil((result.duration_ms / 1000) % 60);

    const duration = document.createElement("p");

    duration.innerHTML = `<strong>Duration: </strong> ${minute}:${second
      .toString()
      .padStart(2, "0")}`;

    //Explicit
    const explicit = document.createElement("p");
    explicit.textContent = `${result.explicit ? "Explicit" : "Clean"}`;

    div.append(duration, explicit);

    //track #
    if (result.album.album_type !== "single") {
      const trackNumber = document.createElement("p");

      trackNumber.innerHTML = `<strong>Track Number: </strong> ${result.track_number} of ${result.album.total_tracks}`;

      div.append(trackNumber);
    }
    //audioplayer
    let preview;
    console.log(result);
  }
  const img = createImg(result);
  dialogMain.append(img, div);
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

  if (textInput.value.trim() == "") {
    if (!document.querySelector(".js-error")) {
      // console.log("This will be for errors");
      errorP = document.createElement("dialog");
      errorP.textContent =
        "Oh no! A search must include a song or album to search for.";
      errorP.setAttribute("class", "js-error error");

      document.querySelector("header").append(errorP);
      errorP.show();
      console.log(errorP);
    }
    return "";
  }

  if (document.querySelector(".js-error")) {
    document.querySelector(".js-error").remove();
  }

  const searchResults = await returnTwelveSearchResults();
  const searchType = returnCheckedRadio() == "track" ? "Song" : "Album";

  mainHeading.textContent = `${searchType} results for "${textInput.value.trim()}"`;

  textInput.value = "";
  mainArticle.innerHTML = "";

  searchResults[Object.keys(searchResults)[0]].items.forEach(renderResult);
}

async function returnTwelveSearchResults() {
  const q = textInput.value.replace(/\s/g, "%20");
  const type = returnCheckedRadio();
  const endpoint = `https://api.spotify.com/v1/search?q=${q}&type=${type}&limit=12`;

  const requestOptions = await createRequestOptions();

  let rawResult = await fetch(endpoint, requestOptions);

  let jsonResult = await rawResult.json();

  return jsonResult;
}

returnCheckedRadio = () =>
  Array.from(radioOptions).find((option) => option.checked).value;

//On Load Functions
async function renderNewReleases() {
  let newReleases = await fetchNewReleases();
  newReleases.albums.items.forEach(renderResult);
}

function renderResult(result) {
  const h4 = document.createElement("h4");
  h4.textContent = result.name;

  const img = createImg(result);

  const p = document.createElement("p");
  p.textContent = result.artists[0].name;

  const div = document.createElement("div");
  div.setAttribute("class", "card");
  div.setAttribute("id", result.type + " " + result.id);

  div.append(img, h4, p);
  div.addEventListener("click", showSongOrAlbumModal);

  mainArticle.append(div);
}

async function fetchNewReleases() {
  let requestOptions = await createRequestOptions();

  let newReleasesRaw = await fetch(
    "https://api.spotify.com/v1/browse/new-releases?limit=12&country=US",
    requestOptions
  );

  let newReleases = await newReleasesRaw.json();

  return newReleases;
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
