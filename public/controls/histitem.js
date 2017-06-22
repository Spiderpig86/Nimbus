import consts from '../../consts-sec.json';

let SC = require('soundcloud');

class HistItem {

    constructor(bg, track, player, errorDownloadCallback) {
        this._bg = bg;
        this._track = track;
        this._errorDownloadCallback = errorDownloadCallback;

        this.histItem = document.createElement('div');
        this.histItem.className = 'card';
        this.histItem.setAttribute('id', 'histItem');
        this.histItem.setAttribute('data-id', track.id);
        this.histItem.addEventListener('click', (e) => {
            console.log('test');
            player.streamSong(track.id);
        }, false);
        let tempInner = document.createElement('div');
        tempInner.innerHTML = `
            <div class="card" data-id="${this._track.id}">
                <div id="histItemBg" class="bg-image" style="background-image: url('${this._bg}')"></div>
                <div class="player-content overlay">
                    <div class="row level">
                        <div class="level-left" style="position:relative;">
                            <img src="${this._track.artwork_url === null ? this._track.user.avatar_url : this._track.artwork_url.replace('large', 't500x500')}">
                            <span class="hist-play">
                                <i class="fa fa-play center-alt" aria-hidden="true"></i>
                            </span>
                        </div>
                        <div class="desc">
                            <p class="title">${this._track.title}</p>
                            <p class="subtitle">${this._track.artist}</p>
                            <p class="subtitle">${this._track.genre || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                <div class="row overlay">
                    <div class="action-bar center no-padding">
                        <div class="action-bar-item">
                            <a href="${this._track.downloadable === false ? this._errorDownloadCallback : `https://api.soundcloud.com/tracks/${this._track.id}/download?client_id=${consts.client_id}`}" target="_blank"><button class="btn-transparent">Download</button></a>
                        </div>
                        <div class="action-bar-item">
                            <a href="${this._track.permalink_url}" target="_blank"><button class="btn-transparent">View</button></a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.histItem.appendChild(tempInner); // Must use this method to preserve listeners
    }

    render() {
         return this.histItem; // Cannot return innerHTML since that removes all listeners
    }
}

export default HistItem