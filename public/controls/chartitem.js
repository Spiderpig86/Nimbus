import consts from '../../consts-sec.json';

let SC = require('soundcloud');

class ChartItem {
    constructor(player, title, artist, kind, genre, limit, art) {
        this._player = player;
        this._title = title;
        this._artist = artist;
        this._kind = kind;
        this._genre = genre;
        this._limit = limit;
        this._art = art;

        this.chartItem = document.createElement('div');
        this.chartItem.className = 'col-4';
        // this.chartItem.setAttribute('data-genre', this._genre);
        // this.chartItem.setAttribute('data-limit', this._limit);
        this.bindEvents();
        let tempInner = document.createElement('div');
        tempInner.innerHTML = `
                <div class="chart-item card">
                    <div class="card-container">
                        <div class="card-image" style="background-image: url(${art});"></div>

                        <div class="title-container">
                            <p class="title">${this._title}</p><span class="subtitle">By SoundCloud</span>
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
        this.chartItem.addEventListener('click', (e) => {
            this._player.getTracksFromCharts(this._kind, this._genre, this._limit);
            this._player.searchDialog.toggleSearchDialog();
        }, false);
    }
}

export default ChartItem;