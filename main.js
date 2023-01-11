/* <------------------------- Selectors ------------------------->*/

/* <------------------------- Event Listeners------------------------->*/
document.addEventListener('DOMContentLoaded',renderTenNewReleases)


/* <------------------------- Functions ------------------------->*/

//On Load Functions

async function renderTenNewReleases(){
    let tokenInfo = await getToken()
    let topTen = await getTopTen(tokenInfo)

    topTen.albums.items.forEach(renderAlbum)
}

const renderAlbum = (album) => {
    const h4 =  document.createElement("h4")
    h4.textContent = album.name
    
    const img = document.createElement("img");
    img.setAttribute("src", album.images[1].url);
    img.setAttribute("class", "album-cover");
    
    const p = document.createElement("p")
    p.textContent = album.artists[0].name
    
    const div =  document.createElement('div');
    div.setAttribute("class", "card");
    div.append(img,h4, p)
    document.querySelector("main article").append(div)

}

async function getTopTen(tokenInfo){

    const myHeaders = new Headers([
        ["Accept", "application/json"],
        ["Content-Type", "application/json"],
        ["Authorization", "Bearer " + tokenInfo.access_token]
    ])
    
    const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'manual'
    };
    
    let topTenRaw = await fetch("https://api.spotify.com/v1/browse/new-releases?limit=10&country=US", requestOptions)
    
    let topTen = await topTenRaw.json()

    return topTen
}

async function getToken(){
    const clientId = "bc1cdb2dee2845e9836cf96cd3fb1f4f";
    const clientSecret = "ffb8e1b3153941ca8de5102997a6dd1f";

    let myHeaders = new Headers([
        ["Authorization", "Basic " + btoa(clientId + ":" + clientSecret)],
        ["Content-Type", "application/x-www-form-urlencoded"]
    ]);

    let urlencoded = new URLSearchParams([
        ["grant_type", "client_credentials"]
    ]);

    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: urlencoded,
    };

    let result = await fetch("https://accounts.spotify.com/api/token", requestOptions)

    let jsonResult = await result.json()

    return jsonResult
}