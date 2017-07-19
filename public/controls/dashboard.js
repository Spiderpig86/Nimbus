import QueueItem from './queueitem';
import Utils from '../js/utils';
import Settings from '../js/settings';

class Dashboard {

    constructor(player) {
        this._player = player;
        this.isShown = false;
        this.queueItemCount = 0; // Counts number of songs on queue
        this.queuedTime = 0; // Total time of queued songs
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
                            <li class="tab-item">
                                <a>About</a>
                            </li>
                        </ul>
                    </div>
                    <space class="large"></space>
                    <div class="tabpage shown">
                        <h3>Settings</h3>
                        <div class="divider"></div>
                        <div class="scrollable-container">
                            <p class="settings-title">Shuffle Mode</p>
                            <div class="row">
                                <li class="settings-rb">
                                    <input type="radio" id="radioRandom" name="selector">
                                    <label for="radioRandom">Random Tracks</label>
                                    <div class="check"></div>
                                </li>

                                <li class="settings-rb">
                                    <input type="radio" id="radioRelated" name="selector">
                                    <label for="radioRelated">Related Tracks</label>
                                    <div class="check"></div>
                                </li>
                            </div>

                            <p class="settings-title">Appearance</p>
                            <div class="row">
                                <div class="toggle-container">
                                    <p>Disable Animations</p>
                                    <div class="toggle-switch"><input type="checkbox" id="chkAnimations"/><label for="chkAnimations"></label></div>
                                </div>
                                <div class="toggle-container">
                                    <p>Disable Blur</p>
                                    <div class="toggle-switch"><input type="checkbox" id="chkBlur"/><label for="chkBlur"></label></div>
                                </div>
                            </div>

                            <p class="settings-title">Advanced</p>
                            <div class="row">
                                <div class="toggle-container">
                                    <p>Debug Mode</p>
                                    <div class="toggle-switch"><input type="checkbox" id="chkDebug"/><label for="chkDebug"></label></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="tabpage">
                        <h3>Queue</h3>
                        <div class="row level">
                            <p id="totalQueueTime" class="no-margin" style="flex-grow: 1"></p>
                            <button id="btnClearQueue" class="btn-small btn-nimbus">Clear Queue</button>
                        </div>
                        <div class="divider"></div>
                        <space></space>
                        <div id="queueContainer" class="scrollable-container">

                        </div>
                    </div>

                    <div class="tabpage">
                        <h3>About</h3>
                        <div class="divider"></div>
                        <div class="row text-center">
                            <img class="center" src="../img/NimbusLogo.png" style="max-width: 200px; width: 100%;" />
                            <p class="no-margin">An open source SoundCloud client for discovering and streaming tracks. Made with <i class="fa fa-heart animated pulse pad-left pad-right" style="color:#e90606"></i> in New York.<br/>
                            Nimbus is not affiliated with SoundCloud.<br />
                            Shout out to <a href="https://unsplash.com/" target="_blank">Unsplash</a> for the amazing photography. <br /> Copyright &copy; ${new Date().getFullYear()} Stanley Lim</p>
                            <space class="x-large"></space>
                            <div class="row center">
                                <a href="https://github.com/Spiderpig86/Nimbus" target="_blank"><button class="btn-nimbus">Github</button></a>
                            </div>
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

        // Settings
        this.rbRandom = document.getElementById('radioRandom');
        this.rbRelated = document.getElementById('radioRelated');
        this.chkAnimations = document.getElementById('chkAnimations');
        this.chkBlur = document.getElementById('chkBlur');
        this.chkDebug = document.getElementById('chkDebug');

        // Event handler for close button for search dialog
        this.dashboardCloseBtn.onclick = (e) => {
            this.hideDashboard();
        }

        this.queueTab.onclick = (e) => {
            // Update queue items
            this.refreshQueueContainer();
        }

        this.btnClearQueue.onclick = (e) => {
            this.clearQueue();
        }

        this.bindSettingsControls();
    }

    bindSettingsControls() {
        // Settings controls
        this.rbRandom.onclick = (e) => {
            Settings.storePref('shuffleMode', 'random');
        }

        this.rbRelated.onclick = (e) => {
            Settings.storePref('shuffleMode', 'related');
        }

        this.chkAnimations.onclick = (e) => {
            Settings.storePref('disableAnimations', this.chkAnimations.checked);
            if (this.chkAnimations.checked && !document.getElementById("disableAnimations")) {
                $(Settings.disableAnimationsCSS).appendTo("head");
            } else {
                $('#disableAnimations').remove(); // Remove the style sheet
            }
        }

        this.chkBlur.onclick = (e) => {
            Settings.storePref('disableBlur', this.chkBlur.checked);
            if (this.chkBlur.checked && !document.getElementById("disableBlur")) {
                $(Settings.disableBlurCSS).appendTo("head");
            } else {
                $('#disableBlur').remove(); // Remove the style sheet
            }
        }

        this.chkDebug.onclick = (e) => {
            Settings.storePref('debug', this.chkDebug.checked);
        }
    }

    updateControls() {

        // Update settings controls
        this.chkAnimations.checked = JSON.parse(Settings.getPref('disableAnimations'));
        this.chkBlur.checked = JSON.parse(Settings.getPref('disableBlur'));
        this.chkDebug.checked = JSON.parse(Settings.getPref('debug'));

        if (JSON.stringify(Settings.getPref('shuffleMode')) === 'random')
            this.rbRandom.checked = true;
        else
            this.rbRelated.checked = true;
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
        this.queueContainer.innerHTML = `<div></div>`; // Clear the container
        if (this._player.queue.length > 0 ) {
            this.queueItemCount = 0;
            this.queuedTime = 0;
            let q = null;
            let frag = document.createElement('div');;
            for (let i = this._player.queue.length - 1; i >= 0; i--) {
                q = new QueueItem(this._player, this._player.queue[i].track);
                frag.appendChild(q.render());
                this.queuedTime += q._track.duration;
                this.queueItemCount += 1;
            }
            this.queueContainer.appendChild(frag);

            $('.queueDelete').on('click', () => { // Add event handler on all tracks, not the most efficient: https://stackoverflow.com/questions/11248855/how-do-i-use-jquery-get-the-id-of-the-div-which-has-been-clicked-on
                let curIndex = this._player.queue.map((track) => {return String(track.id)}).indexOf(String($(event.currentTarget).attr('data-id'))); // Find the song's id associated with this object in the queue
                // NOTE: Must convert mapped vars to string or same datatype in order to check for equality
                if (curIndex === -1) return; // In case we couldn't find it, which is an error
                this._player.queue.splice(curIndex, 1); // Remove the element
                this.refreshQueueContainer(); // Update the queue container
            });
        } else {
            this.queueItemCount = 0;
            this.queuedTime = 0;
            // Notification that queue is empty
            this.queueContainer.innerHTML = `<div class="text-center">
                <h6 class="light" style="color: #717579;">
                Looks like your queue is empty. Nimbus will continue to fetch music in the background.</h6>
            </div>`;
        }

        document.querySelector('#totalQueueTime').innerText = Utils.convertMillisecondsToDigitalClock(this.queuedTime).clock_long + ', ' + this._player.queue.length + ' songs';
    }

    clearQueue() {
        this._player.queue = []; // Clear the queue
        this.queueItemCount = 0;
        this.queuedTime = 0;
        document.querySelector('#totalQueueTime').innerText = Utils.convertMillisecondsToDigitalClock(this.queuedTime).clock_long + ', ' + this._player.queue.length + ' songs';
        this.queueContainer.innerHTML = `<div class="text-center">
                <h6 class="light" style="color: #717579;">
                Looks like your queue is empty. Nimbus will continue to fetch music in the background.</h6>
            </div>`;
    }
}

export default Dashboard;