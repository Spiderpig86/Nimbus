const SongInfo = (largeArt, track, tags, errorPurchase) => (
    `
        <div class="card level">
            <div class="content-no-padding text-center">
                    <div class="row center" id="artContainer">
                        <div class="col-12 no-margin no-padding">
                            <div class="flipContainer" id="flipContainer">
                                <img id="songArt" src="${largeArt}">
                                <div class="song-desc">
                                    <div class="content-no-padding">
                                        <div class="row text-center" id="descNavBar">
                                            <button class="btn-transparent" id="desc-likes"><i class="fa fa-heart small" aria-hidden="true"></i><span>${track.likes_count}</span></button>
                                            <a href="${track.permalink_url + '/comments'}" target="_blank"><button class="btn-transparent" id="desc-comments"><i class="fa fa-comment small" aria-hidden="true"></i><span>${track.comment_count || 0}</span></button></a>
                                            <button class="btn-transparent" id="desc-reposts"><i class="fa fa-retweet small" aria-hidden="true"></i><span>${track.reposts_count}</span></button>
                                            <a href="${track.user.permalink_url}" target="_blank"><button class="btn-transparent" id="desc-user"><i class="fa fa-user small" aria-hidden="true"></i><span>${track.user.username}</span></button></a>
                                            <a href="${track.user.purchase_url || errorPurchase}" target="_blank"><button class="btn-transparent" id="desc-buy"><i class="fa fa-usd small" aria-hidden="true"></i><span>Purchase</span></button></a>
                                        </div>
                                        <div class="row text-center" id="descStats">
                                            <p>Created: ${track.created_at.split('T')[0].replace(/-/g, ' / ')}</p>
                                        </div>
                                        <div class="row" id="descTags">
                                            ${tags}
                                        </div>
                                    </div>
                                    <space class="large"></space>
                                    <div class="content">
                                        <pre>${track.description || 'No description available.'}</pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <h5 id="trackTitle" class="light">${track.title}</h5>
                    <p class="title uppercase">${track.user.username}</p>
                    <p class="subtitle" id="curTime">0:00 / 4:20</p>
                    <div class="waveform"></div>
            </div>
        </div>
    `
);

export default SongInfo