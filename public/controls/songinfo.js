const SongInfo = (largeArt, track) => (
    `
        <div class="card">
            <div class="content text-center">
                <div class="content text-center">
                    <div class="row">
                        <div class="col-12">
                            <img src="${largeArt}">
                            <h6 class="light">${track.title}</h6>
                            <p class="title">${track.user.username}</p>
                            <div class="song-desc">
                                <p><pre>${track.description}</pre></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
);

export default SongInfo