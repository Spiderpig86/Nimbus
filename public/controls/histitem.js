const HistItem = (imgurl, title, artist, track) => (
    // Using string literals
    `
        <div class="card">
            <div class="player-content">
                <div class="row level">
                    <div class="col-4">
                        <img src="${imgurl}">
                    </div>
                    <div class="col-7">
                        <p class="title">${title}</p>
                        <p class="subtitle">${artist}</p>
                        <p class="subtitle">${track.genre}</p>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="action-bar center">
                    <a href="${track.download_url}" target="_blank"><button class="btn">Download</button></a>
                    <a href="${track.permalink_url}" target="_blank"><button class="btn">View</button></a>
                </div>
            </div>
        </div>
    `
);

export default HistItem