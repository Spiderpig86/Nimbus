const SongInfo = (largeArt, track) => (
    `
        <div class="card">
            <div class="content text-center">
                <div class="content text-center">
                    <div class="row">
                        <div class="col-12">
                            <div class="flipContainer" id="flipContainer">
                                <img id="songArt" src="${largeArt}">
                                <div class="song-desc">
                                    <p>${track.description}</p>
                                </div>
                            </div>
                            <h6 class="light">${track.title}</h6>
                            <p class="title">${track.user.username}</p>
                            <p class="subtitle" id="curTime">0:00 / 4:20</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
);

export default SongInfo