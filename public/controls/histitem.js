const HistItem = (imgurl, bg, title, artist, track) => (
    // Using string literals
    `
        <div class="card">
            <div id="histItemBg" class="bg-image" style="background-image: url('${bg}')"></div>
            <div class="player-content overlay">
                <div class="row level">
                    <div class="level-left">
                        <img src="${imgurl}">
                    </div>
                    <div class="desc">
                        <p class="title">${title}</p>
                        <p class="subtitle">${artist}</p>
                        <p class="subtitle">${track.genre === undefined ? 'N/A' : track.genre}</p>
                    </div>
                </div>
            </div>
            <div class="row overlay">
                <div class="action-bar center">
                    <a href="${track.download_url}" target="_blank"><button class="btn">Download</button></a>
                    <a href="${track.permalink_url}" target="_blank"><button class="btn">View</button></a>
                </div>
            </div>
        </div>
    `
);

export default HistItem