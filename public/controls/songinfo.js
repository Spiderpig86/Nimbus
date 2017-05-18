const SongInfo = (largeArt, track) => (
    `
        <div class="card level">
            <div class="content text-center">
                <div class="content text-center">
                    <div class="row">
                        <div class="col-12">
                            <div class="flipContainer" id="flipContainer">
                                <img id="songArt" src="${largeArt}">
                                <div class="song-desc">
                                    <pre>${track.description}</pre>
                                </div>
                            </div>
                            <h6 class="light">${track.title}</h6>
                            <p class="title">${track.user.username}</p>
                            <p class="subtitle" id="curTime">0:00 / 4:20</p>
                            <div class="waveform"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
);

export default SongInfo