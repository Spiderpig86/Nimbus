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
                                    <div class="content">
                                        <div class="row text-center" id="descNavBar">
                                            <button class="btn-transparent" id="desc-likes"><i class="fa fa-heart small" aria-hidden="true"></i><span>${track.likes_count}</span></button>
                                            <a href="${track.permalink_url + '/comments'}" target="_blank"><button class="btn-transparent" id="desc-comments"><i class="fa fa-comment small" aria-hidden="true"></i><span>${track.comment_count}</span></button></a>
                                            <a href="${track.user.permalink_url}" target="_blank"><button class="btn-transparent" id="desc-user"><i class="fa fa-user small" aria-hidden="true"></i><span>${track.user.username}</span></button></a>
                                        </div>
                                    </div>
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