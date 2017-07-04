import consts from '../../consts-sec.json';

let SC = require('soundcloud');

class ChartItem {
    constructor(player, title, artist, kind, genre, limit) {
        this._player = player;
        this._title = title;
        this._artist = artist;
        this._kind = kind;
        this._genre = genre;
        this._limit = limit;

        this.chartItem = document.createElement('div');
        this.chartItem.className = 'col-4 chart-item';
        this.chartItem.setAttribute('data-genre', this._genre);
        this.chartItem.setAttribute('data-limit', this._limit);
        this.chartItem.addEventListener('click', (e) => {
            player.getTracksFromCharts(this._kind, this._genre, this._limit);
        }, false);
        let tempInner = document.createElement('div');
        tempInner.innerHTML = `
            <div class="card" data-id="${this._track.id}">
                <div id="chartItemBg" class="bg-image" style="background-image: url('${this._bg}')"></div>
                <div class="player-content overlay">
                    <div class="row level">
                        <div class="level-left" style="position:relative;">
                            <img src="${this._track.artwork_url === null ? this._track.user.avatar_url : this._track.artwork_url}">
                            <span class="hist-play center">
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
        this.chartItem.appendChild(tempInner); // Must use this method to preserve listeners
    }

    render() {
        return this.chartItem;
    }

    bindEvents() {

    }
}