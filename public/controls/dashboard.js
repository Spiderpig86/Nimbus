import QueueItem from './queueitem';
import Utils from '../js/utils';
import Settings from '../js/settings';

class Dashboard {

    constructor(player) {
        this._player = player;
        this.isShown = false;
        this.queueItemCount = 0; // Counts number of songs on queue
        document.querySelector('#dashboardModalContainer').innerHTML += this.render();
        this.bindEvents();
        Settings.loadPrefs(); // Init settings
        this.updateControls(); // Update settings controls
    }

    render() {
        return `
            <div class="hero-body">
                <div id="dashboardCloseBtn" class="dialog-close-btn link-btn">
                    <span class="icon">
                        <i class="fa fa-times" aria-hidden="true"></i>
                    </span>
                </div>
                <div id="tabs" class="content">
                    <div class="tab-container tabs-center">
                        <ul>
                            <li class="tab-item selected">
                                <a>Settings</a>
                            </li>
                            <li id="queueTab" class="tab-item">
                                <a>Queue</a>
                            </li>
                        </ul>
                    </div>
                    <div class="tabpage shown">
                        <h3>Settings</h3>
                        <div class="divider"></div>
                        <div class="row">
                            <div class="toggle-container">
                                <p>Enable battery saver</p>
                                <div class="toggle-switch"><input type="checkbox" id="chkBattery"/><label for="chkBattery"></label></div>
                            </div>
                            <div class="toggle-container">
                                <p>Dark Theme</p>
                                <div class="toggle-switch"><input type="checkbox" id="chkDark"/><label for="chkDark"></label></div>
                            </div>
                        </div>
                    </div>
                    <div class="tabpage">
                        <div class="row level">
                            <h3 style="flex-grow: 1;">Queue</h3><button id="btnClearQueue" class="btn-small btn-nimbus">Clear Queue</button>
                        </div>
                        <div class="divider"></div>
                        <space></space>
                        <div id="queueContainer">

                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        this.dashboardCloseBtn = document.getElementById('dashboardCloseBtn');
        this.queueTab = document.getElementById('queueTab');
        this.queueContainer = document.getElementById('queueContainer');
        this.btnClearQueue = document.getElementById('btnClearQueue');

        this.chkBattery = document.getElementById('chkBattery');

        // Event handler for close button for search dialog
        this.dashboardCloseBtn.onclick = (e) => {
            this.hideDashboard();
        }

        this.queueTab.onclick = (e) => {
            // Update queue items
            this.refreshQueueContainer();
        }

        // Settings controls
        this.chkBattery.onclick = (e) => {
            Settings.storePref('batterySaver', this.chkBattery.checked);
            if (this.chkBattery.checked && !document.getElementById("batterySaver")) {
                $(Settings.batterySaverCSS).appendTo("head");
            } else {
                $('#batterySaver').remove(); // Remove the style sheet
            }
        }

        this.btnClearQueue.onclick = (e) => {
            this.clearQueue();
        }
    }

    updateControls() {

        // Update settings controls
        this.chkBattery.checked = JSON.parse(Settings.getPref('batterySaver'));
    }

    toggleDashboard() {
        // Scroll to top to show the search dialog
        window.scrollTo(0, 0);

        this.isShown = !this.isShown;
        if (this.isShown) {
            $('#dashboardModalContainer').addClass('shown');
            if ($(window).width() <= 768)
                $('body').css({'overflow-y': 'hidden'});
            this.refreshQueueContainer();
            //if (window.innerWidth > 768) {
                $('#playerHero').addClass('unfocused');
            //}
        } else {
            // Reset dialog (must place up here to account for invalid input)
            $('#dashboardModalContainer').removeClass('shown'); // Hide the search modal
            if ($(window).width() <= 768) // For mobile UI
                $('body').css({'overflow-y': 'scroll'});

            //if (window.innerWidth > 768) {
                $('#playerHero').removeClass('unfocused');
            //}
        }
    }


    hideDashboard() {
        // Reset dialog (must place up here to account for invalid input)
        $('#dashboardModalContainer').removeClass('shown'); // Hide the search modal
        if ($(window).width() <= 768) // For mobile UI
            $('body').css({'overflow-y': 'scroll'});
        this.isShown = false;
        //if (window.innerWidth > 768) {
            $('#playerHero').removeClass('unfocused');
        //}
    }
    
    refreshQueueContainer() {
        if (this._player.queue.length > 0 ) {
            this.queueItemCount = 0;
            let q = null;
            let frag = '';
            for (let i = this._player.queue.length - 1; i >= 0; i--) {
                q = new QueueItem(this._player, this._player.queue[i]);
                frag += q.render();
                this.queueItemCount += 1;
            }
            this.queueContainer.innerHTML = frag;
        } else {
            this.queueItemCount = 0;
            // Notification that queue is empty
            this.queueContainer.innerHTML = `<div class="text-center">
                <h6 class="light" style="color: #717579;">
                Looks like your queue is empty. Nimbus will continue to fetch music in the background.</h6>
            </div>`;
        }
    }

    clearQueue() {
        this._player.queue = []; // Clear the queue
        this.queueContainer.innerHTML = `<div class="text-center">
                <h6 class="light" style="color: #717579;">
                Looks like your queue is empty. Nimbus will continue to fetch music in the background.</h6>
            </div>`;
    }
}

export default Dashboard;