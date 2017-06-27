class QueueItem {

    constructor(player, track) {
        this._player = player;
        this._track = track;

        
    }

    render() {
        return `
            <div class="queue-item">
                <h6 class="title light"><span>${this._track.title}</span><div class="pull-right">${this._track.duration}</div></h6>
                <p class="subtitle"><span>${this._track.user.username}</span><span class="queue-item-actions pull-right">
                    <span class="icon"><i class="fa fa-times small" aria-hidden="true"></i></span>
                    <span class="icon"><i class="fa fa-times small" aria-hidden="true"></i></span>
                    <span class="icon"><i class="fa fa-times small" aria-hidden="true"></i></span>
                    </span>
                </p>
            </div>
        `;
    }

    bindEvents() {

    }
}

export default QueueItem;