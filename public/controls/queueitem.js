import Utils from '../js/utils';

class QueueItem {

    constructor(player, track) {
        this._player = player;
        this._track = track;

        this.queueItem = document.createElement('div');
        this.queueItem.innerHTML = `
            <div class="queue-item">
                <h6 class="title light btn-tooltip" data-tooltip="${this._track.title}"><span>${this._track.title}</span><div class="pull-right">${Utils.convertMillisecondsToDigitalClock(this._track.duration).clock}</div></h6>
                <p class="subtitle"><span>${this._track.user.username}</span>
                    <span class="queue-item-actions pull-right">
                        <a href="${this._track.permalink_url}" target="_blank"><span class="icon"><i class="fa fa-external-link-square small" aria-hidden="true"></i></span></a>
                        <span class="icon queueDelete" data-id="${this._track.id}"><i class="fa fa-times small" aria-hidden="true"></i></span>
                    </span>
                </p>
            </div>
        `;
    }

    render() {
        return this.queueItem;
    }

    bindEvents() {
        // Event binded in player.js
    }
}

export default QueueItem;