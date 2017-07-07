import ChartItem from './chartitem'
import Utils from '../js/utils'

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
                        </div>
                    </div>
                    <space class="x-large"></space>
                    <div class="row">
                        <h3>Featured</h3>
                        <div class="row flex expand" id="chartContainer">

                        </div>
                    </div>
                </div>
            </div>
            `;
    }

    bindEvents() {
        this.searchCloseBtn = document.getElementById('searchCloseBtn');
        this.searchField = document.getElementById('searchField');
        this.chkShuffle = document.getElementById('chkShuffle');
        this.chkNumber = document.getElementById('chkNumber');

        this.searchSets = document.getElementById('searchSets');
        this.searchUser = document.getElementById('searchUser');
        this.searchTags = document.getElementById('searchTags');

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
    }

    processSearchField() {
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
            this._player.curPlayer.load(`${searchQuery}`);
        } else if (isNaN(searchQuery)) { // Check if this is a string query
            // Check tags
            console.log(searchQuery.startsWith('set:'));
            if (searchQuery.startsWith('playlist:') || searchQuery.startsWith('set:')) {
                this._player.getSetByKeyWord(searchQuery.split(':')[1].trim());
                this._player.isPlaylist = true;
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
        }

        setTimeout(() => this._player.loadWidgetSong(this._player.curPlayer), 2000); // Needs longer delay time so it prevents stalling (track not auto playing)
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
        let count = prompt('How many results do you want to queue?');

        if (count === null || !isFinite(count)) {
            Utils.showToast('Please enter a numerical value and try again.');
            this.chkNumber.checked = false;
            return;
        }
        $('#chkNumberText').text(`${count} results`);
        this._player.queueNum = count;
    }

    loadCharts() {
        this.chartContainer = document.querySelector('#chartContainer');
        let c = new ChartItem(this._player, 'SoundCloud Top 50', 'SoundCloud', 'top', 'soundcloud%3Agenres%3Aall-music', 50, `../img/soundcloud_top50.jpg`);
        this.chartContainer.appendChild(c.render());
        c = new ChartItem(this._player, 'Rap Top 50', 'SoundCloud', 'top', 'soundcloud%3Agenres%3Ahiphoprap', 50, `../img/rap_top50.png`);
        this.chartContainer.appendChild(c.render());
        c = new ChartItem(this._player, 'Fresh Hip-hop & Rap', 'SoundCloud', 'trending', 'soundcloud%3Agenres%3Ahiphoprap', 50, `../img/fresh_rap.png`);
        this.chartContainer.appendChild(c.render());
        c = new ChartItem(this._player, 'Dance & EDM Top 50', 'SoundCloud', 'top', 'soundcloud%3Agenres%3Adanceedm', 50, `../img/edm_top50.jpg`);
        this.chartContainer.appendChild(c.render());
        c = new ChartItem(this._player, 'Essential EDM', 'SoundCloud', 'trending', 'soundcloud%3Agenres%3Adanceedm', 50, `../img/essential_edm.png`);
        this.chartContainer.appendChild(c.render());
        
    }

}

export default Search;