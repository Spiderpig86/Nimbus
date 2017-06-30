import Utils from '../js/utils';

class QueueItem {

    constructor(player, track) {
        this._player = player;
        this._track = track;
        
        
    }

    render() {
        return `
            <div class="queue-item">
                <h6 class="title light btn-tooltip" data-tooltip="${this._track.title}"><span>${this._track.title}</span><div class="pull-right">${Utils.millisToMinutesAndSeconds(this._track.duration)}</div></h6>
                <p class="subtitle"><span>${this._track.user.username}</span>
                    <span class="queue-item-actions pull-right">
                        <span class="icon" id="queueView"><i class="fa fa-external-link-square" aria-hidden="true"></i></span>
                        <span class="icon" id="queueDelete"><i class="fa fa-times small" aria-hidden="true"></i></span>
                    </span>
                </p>
            </div>
        `;
    }

    bindEvents() {

    }
}

export default QueueItem;