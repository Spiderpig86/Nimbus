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
        this.chartItem.className = 'col-4';
        // this.chartItem.setAttribute('data-genre', this._genre);
        // this.chartItem.setAttribute('data-limit', this._limit);
        this.bindEvents();
        let tempInner = document.createElement('div');
        tempInner.innerHTML = `
                <div class="chart-item card">
                    <div class="card-container">
                        <div class="card-image" style="background-image: url(https://images.unsplash.com/photo-1467952497026-86722ef1916f?dpr=1.25&amp;auto=compress,format&amp;fit=crop&amp;w=1199&amp;h=799&amp;q=80&amp;cs=tinysrgb&amp;crop=);"></div>

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
        }, false);
    }
}

export default ChartItem;