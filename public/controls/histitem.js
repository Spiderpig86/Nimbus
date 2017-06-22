const HistItem = (imgurl, bg, title, artist, track, download_url, errorDownloadCallback) => (
    // Using string literals
    `
        <div class="card">
            <div id="histItemBg" class="bg-image" style="background-image: url('${bg}')"></div>
            <div class="player-content overlay">
                <div class="row level">
                    <div class="level-left" style="position:relative;">
                        <img src="${imgurl}">
                        <span class="center-alt hist-play" data-id="${track.id}">
                            <i class="fa fa-play center-alt" aria-hidden="true"></i>
                        </span>
                    </div>
                    <div class="desc">
                        <p class="title">${title}</p>
                        <p class="subtitle">${artist}</p>
                        <p class="subtitle">${track.genre || 'N/A'}</p>
                    </div>
                </div>
            </div>
            <div class="row overlay">
                <div class="action-bar center no-padding">
                    <div class="action-bar-item">
                        <a href="${track.downloadable === false ? errorDownloadCallback : download_url}" target="_blank"><button class="btn-transparent">Download</button></a>
                    </div>
                    <div class="action-bar-item">
                        <a href="${track.permalink_url}" target="_blank"><button class="btn-transparent">View</button></a>
                    </div>
                </div>
            </div>
        </div>
    `
);

export default HistItem