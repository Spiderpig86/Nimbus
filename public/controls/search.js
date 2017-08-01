import ChartItem from './chartitem';
import Utils from '../js/utils';
import Settings from '../js/settings';
import Constants from '../js/constants';

let SC = require('soundcloud');

class Search {

    constructor(player) {
        this._player = player;
        this.isShown = false;
        
        this.render();
        this.bindEvents();

        this.loadCharts();
    }

    render() {
        // Create the search dialog html
        document.querySelector('#searchModalContainer').innerHTML += `
            <div class="hero-body">
                <div id="searchCloseBtn" class="dialog-close-btn link-btn">
                    <span class="icon">
                        <i class="fa fa-times" aria-hidden="true"></i>
                    </span>
                </div>
                <div class="content">
                    <space style="height: 20vh;"></space>
                    <h6 class="uppercase">Search for songs, <span class="search-item" id="searchSets">sets</span>, <span class="search-item" id="searchUser">users</span>, <span class="search-item" id="searchTags">tags</span>, and more</h6>
                    <input type="text" placeholder="search" id="searchField"/>
                    <space></space>
                    <div class="overflow-container">
                        <div class="row level" id="optionsContainer">
                            <label class="button-switch btn-tooltip" data-tooltip="Shuffle tracks before adding to queue.">
                                <input type="checkbox" name="shuffle" value="Shuffle" id="chkShuffle"/>
                                <span class="uppercase">Shuffle</span>
                            </label>

                            <label class="button-switch btn-tooltip" data-tooltip="Number of results to queue.">
                                <input type="checkbox" name="results" value="results" id="chkNumber">
                                <span id="chkNumberText" class="uppercase">120 results</span>
                            </label>

                             <label class="button-switch btn-tooltip" data-tooltip="Song Length">
                                <a href="#modal-duration">
                                    <input type="checkbox" name="any" value="Any" id="chkTime">
                                    <span id="chkTimeText" class="uppercase">Length: Any</span>
                                </a>
                            </label>

                            <label class="button-switch btn-tooltip" data-tooltip="Help">
                                <a href="#modal-help">
                                    <input type="checkbox" name="any" value="Any" id="chkTime">
                                    <span id="chkHelp" class="uppercase">?</span>
                                </a>
                            </label>
                        </div>
                    </div>
                    <div class="modal modal-animated" id="modal-duration">
                        <a href="#searchModalDialog" class="modal-overlay close-btn" aria-label="Close"></a>
                        <div class="modal-content" role="document">
                            <div class="modal-header">
                                <a href="#modals" class="pull-right" aria-label="Close"><span class="icon"><i class="fa fa-times"></i></span></a>
                                <div class="modal-title">Filter Duration</div>
                            </div>
                            <div class="modal-body">
                                <div class="content">
                                    <div class="row">
                                        <li class="settings-rb">
                                            <input type="radio" id="radioShort" name="time">
                                            <label for="radioShort">&lt; 2 minutes</label>
                                            <div class="check"></div>
                                        </li>

                                        <li class="settings-rb">
                                            <input type="radio" id="radioMedium" name="time">
                                            <label for="radioMedium">2 - 10 minutes</label>
                                            <div class="check"></div>
                                        </li>

                                        <li class="settings-rb">
                                            <input type="radio" id="radioLong" name="time">
                                            <label for="radioLong">10 - 30 minutes</label>
                                            <div class="check"></div>
                                        </li>

                                        <li class="settings-rb">
                                            <input type="radio" id="radioEpic" name="time">
                                            <label for="radioEpic">&gt; 30 minutes</label>
                                            <div class="check"></div>
                                        </li>

                                        <li class="settings-rb">
                                            <input type="radio" id="radioAny" name="time">
                                            <label for="radioAny">Any</label>
                                            <div class="check"></div>
                                        </li>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal modal-animated" id="modal-help">
                        <a href="#searchModalDialog" class="modal-overlay close-btn" aria-label="Close"></a>
                        <div class="modal-content" role="document">
                            <div class="modal-header">
                                <a href="#modals" class="pull-right" aria-label="Close"><span class="icon"><i class="fa fa-times"></i></span></a>
                                <div class="modal-title">Filter Duration</div>
                            </div>
                            <div class="modal-body">
                                <div class="content">
                                    <h6>Help</h6>
                                    <div class="divider"></div>
                                    <p></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <space class="x-large"></space>
                    <div class="row">
                        <div class="row level toggle-container">
                            <h3 class="white">Featured</h3>
                            <button id="charts-btn" class="btn-nimbus">View All</button>
                        </div>
                        <div class="chart-overflow">
                            <div class="row flex expand" id="chartContainer">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;
    }

    bindEvents() {
        // Search modal buttons
        this.searchCloseBtn = document.getElementById('searchCloseBtn');
        this.searchField = document.getElementById('searchField');
        this.chkShuffle = document.getElementById('chkShuffle');
        this.chkNumber = document.getElementById('chkNumber');
        this.chkTime = document.getElementById('chkTime');
        this.btnCharts = document.getElementById('charts-btn');

        // Search options
        this.searchSets = document.getElementById('searchSets');
        this.searchUser = document.getElementById('searchUser');
        this.searchTags = document.getElementById('searchTags');

        // Duration filter radio buttons
        this.radioShort = document.getElementById('radioShort');
        this.radioMedium = document.getElementById('radioMedium');
        this.radioLong = document.getElementById('radioLong');
        this.radioEpic = document.getElementById('radioEpic');
        this.radioAny = document.getElementById('radioAny');

        // Bind search field key combination
        this.searchField.onkeydown = (e) => {
            if (e.keyCode === 13) {
                // EDIT: If the queue is nonempty, preserve the queue elements and just insert the song in between history and queue (no code)

                // Hide the search dialog
                this.hideSearchDialog();
                this.processSearchField();
            }
        }

        document.onkeyup = (e) => {
            if (e.keyCode === 27) { // esc
                this.toggleSearchDialog();
            }
        }

        // Event handler for close button for search dialog
        this.searchCloseBtn.onclick = (e) => {
            this.hideSearchDialog();
        }

        this.chkShuffle.onclick = (e) => {
            this._player.shuffleQueue = this.chkShuffle.checked;
        }

        this.chkNumber.onclick = (e) => {
            this.setResultCount();
        }

        this.chkTime.onclick = (e) => {
            this.showVolumeModal();
        }

        this.searchSets.onclick = (e) => {
            this.searchItemClick(this.searchSets);
            this.searchField.focus();
        }  

        this.searchUser.onclick = (e) => {
            this.searchItemClick(this.searchUser);
            this.searchField.focus();
        }

        this.searchTags.onclick = (e) => {
            this.searchItemClick(this.searchTags);
            this.searchField.focus();
        }

        // Event handler to show the charts
        this.btnCharts.onclick = (e) => {
            this.hideSearchDialog();
            this._player.chartsDialog.toggleCharts();
        }

        this.bindDurationFilterModalEvents();
        this.loadDurationFilter();
    }

    async processSearchField() {
        // Check if input is empty
        if (this.searchField.value.length === 0)
            return; // Exit

        let iframeID = document.getElementById('widgettest');
        this._player.curPlayer = SC.Widget(iframeID);

        let searchQuery = this.searchField.value.toLowerCase(); // Assign the search query

        // Determine input type
        if (searchQuery.startsWith('http') && isNaN(searchQuery)) { // Check if this is a url
            this._player.isPlaylist = false; // Reset
            if (searchQuery.includes('sets')) {
                this._player.isPlaylist = true;
            }                    
            //this._player.curPlayer.load(`${searchQuery}`);

            let p = this._player;
            // Resolve song url through API
            SC.resolve(searchQuery).then((response) => {
                try {
                    this._player.queue.push({id: response.id, track: response});
                    Utils.showToast(`Added ${response.title} to the queue.`);
                } catch (e) {
                    Utils.log('processSearchField Error - ' + e.message);
                }
            });
        } else if (isNaN(searchQuery)) { // Check if this is a string query
            // Check tags
            if (searchQuery.startsWith('playlist:') || searchQuery.startsWith('set:')) {
                this._player.getSetByKeyWord(searchQuery.split(':')[1].trim());
            } else if (searchQuery.startsWith('tag:') || searchQuery.startsWith('tags:')) {
                this._player.getTracksByTags(searchQuery.split(':')[1].trim());
                this._player.isPlaylist = false;
            } else if (searchQuery.startsWith('user:')){
                this._player.getTracksByUser(searchQuery.split(':')[1].trim());
                this._player.isPlaylist = false;
            } else if (searchQuery.startsWith('genre:') || searchQuery.startsWith('genres:')) {
                this._player.getTracksByGenres(searchQuery.split(':')[1].trim());
                this._player.isPlaylist = false;
            } else {
                this._player.getTrackByKeyWord(searchQuery);
                this._player.isPlaylist = false;
            }
        } else { // Must be a song ID
            this._player.curPlayer.load(`https%3A//api.soundcloud.com/tracks/${searchQuery}`); // For id
            this._player.isPlaylist = false;
            setTimeout(() => this._player.loadWidgetSong(this._player.curPlayer), 2000); // Needs longer delay time so it prevents stalling (track not auto playing)
        }
    }

    toggleSearchDialog() {
        // Scroll to top to show the search dialog
        window.scrollTo(0, 0);

        this.isShown = !this.isShown;
        if (this.isShown) {
            this.searchField.value = "";
            this.searchField.focus();
            $('#searchModalContainer').addClass('shown');
            if ($(window).width() <= 768)
                $('body').css({'overflow-y': 'hidden'});

            //if (window.innerWidth > 768) {
                $('#playerHero').addClass('unfocused');
            //}
        } else {
            // Reset dialog (must place up here to account for invalid input)
            $('#searchModalContainer').removeClass('shown'); // Hide the search modal
            if ($(window).width() <= 768) // For mobile UI
                $('body').css({'overflow-y': 'scroll'});

            //if (window.innerWidth > 768) {
                $('#playerHero').removeClass('unfocused');
            //}
        }
    }


    hideSearchDialog() {
        // Reset dialog (must place up here to account for invalid input)
        $('#searchModalContainer').removeClass('shown'); // Hide the search modal
        if ($(window).width() <= 768) // For mobile UI
            $('body').css({'overflow-y': 'scroll'});

        //if (window.innerWidth > 768) {
            $('#playerHero').removeClass('unfocused');
        //}
        this.isShown = false;
    }

    // Search tag buttons
    searchItemClick(element) {
        switch (element.id) {
            case 'searchSets':
                this.searchField.value = 'set: ';
                break;
            case 'searchUser':
                this.searchField.value = 'user: ';
                break;
            case 'searchTags':
                this.searchField.value = 'tags: ';
        }
    }

    setResultCount() {
        if (this.chkNumber.checked) {
            let count = prompt('How many songs do you want to queue?');

            if (count === null || !isFinite(count)) {
                Utils.showToast('Please enter a numerical value and try again.');
                this.chkNumber.checked = false;
                return;
            }
            $('#chkNumberText').text(`${count} songs`);
            this._player.queueNum = count;
            this.chkNumber.checked = true;
        } else {
            this.chkNumber.checked = false;
        }
    }

    loadCharts() {
        let c = null;
        this.chartContainer = document.querySelector('#chartContainer');
        $.ajax({
            url: 'http://polarity.x10.mx/nimbus/featured.json',
            type: "GET",
            dataType:'json', 
            success: (data) => {
                for (let i = 0; i < data.collection.length; i++) {
                    c = new ChartItem(this._player, data.collection[i].chart.title, data.collection[i].chart.author, data.collection[i].chart.kind, data.collection[i].chart.genre_url, data.collection[i].chart.limit, data.collection[i].chart.image_url);
                    this.chartContainer.appendChild(c.render());
                }
            }
        });
        
    }

    loadDurationFilter() {
        // Load the selected option in settings
        switch (Settings.getPref('durationFilter')) {
            case Constants.getDurationFilter().SHORT:
                this.radioShort.checked = true;
                $('#chkTimeText').text('Length: < 2 min');
                break;
            case Constants.getDurationFilter().MEDIUM:
                this.radioMedium.checked = true;
                $('#chkTimeText').text('Length: 2 < min < 10');
                break;
            case Constants.getDurationFilter().LONG:
                this.radioLong.checked = true;
                $('#chkTimeText').text('Length: 10 < min < 30');
                break;
            case Constants.getDurationFilter().EPIC:
                this.radioEpic.checked = true;
                $('#chkTimeText').text('Length: > 30 min');
                break;
            case Constants.getDurationFilter().ANY:
                this.radioAny.checked = true;
                $('#chkTimeText').text('Length: Any');
                break;
        }
    }

    bindDurationFilterModalEvents() {
        this.radioShort.onclick = (e) => {
            Settings.storePref('durationFilter', Constants.getDurationFilter().SHORT);
            $('#chkTimeText').text('Length: < 2 min');
        }

        this.radioMedium.onclick = (e) => {
            Settings.storePref('durationFilter', Constants.getDurationFilter().MEDIUM);
            $('#chkTimeText').text('Length: 2 < min < 10');
        }

        this.radioLong.onclick = (e) => {
            Settings.storePref('durationFilter', Constants.getDurationFilter().LONG);
            $('#chkTimeText').text('Length: 10 < min < 30');
        }

        this.radioEpic.onclick = (e) => {
            Settings.storePref('durationFilter', Constants.getDurationFilter().EPIC);
            $('#chkTimeText').text('Length: > 30 min');
        }

        this.radioAny.onclick = (e) => {
            Settings.storePref('durationFilter', Constants.getDurationFilter().ANY);
            $('#chkTimeText').text('Length: Any');
        }
    }

}

export default Search;