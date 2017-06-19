let SC = require('soundcloud');

class Search {

    constructor(player) {
        this._player = player;
        this.isShown = false;
        
        // Create the search dialog html
        document.querySelector('#searchModalContainer').innerHTML += `
            <div class="hero-body">
                <div id="searchCloseBtn" class="link-btn">
                    <span class="icon">
                        <i class="fa fa-times" aria-hidden="true"></i>
                    </span>
                </div>
                <div class="content">
                    <h6 class="uppercase">Search for songs, playlists, artists, and more</h6>
                    <input type="text" placeholder="search" id="searchField"/>
                </div>
            </div>
            `;
        this.bindSearchBoxEvents();
    }

    bindSearchBoxEvents() {
        this.searchField = document.getElementById('searchField');
        this.searchCloseBtn = document.getElementById('searchCloseBtn');

        // Bind search field key combination
        this.searchField.onkeydown = (e) => {
            if (e.keyCode === 13) {
                // EDIT: If the queue is nonempty, preserve the queue elements and just insert the song in between history and queue (no code)

                // Hide the search dialog
                this.hideSearchDialog();

                this.processSearchField();
            }
        }

        // Event handler for close button for search dialog
        this.searchCloseBtn.onclick = (e) => {
            this.hideSearchDialog();
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
                this._player.getSongsByUser(searchQuery.split(':')[1].trim());
                this._player.isPlaylist = false;
            } else if (searchQuery.startsWith('genre:') || searchQuery.startsWith('genres:')) {
                this._player.getSongsByGenres(searchQuery.split(':')[1].trim());
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
        this.isShown = !this.isShown;
        console.log(this.isShown);
        if (this.isShown) {
            this.searchField.value = "";
            $('#searchModalContainer').addClass('shown');
            $('body').css({'overflow-y': 'hidden'});
        } else {
            // Reset dialog (must place up here to account for invalid input)
            $('#searchModalContainer').removeClass('shown'); // Hide the search modal
            $('body').css({'overflow-y': 'scroll'});
        }
    }


    hideSearchDialog() {
        // Reset dialog (must place up here to account for invalid input)
        $('#searchModalContainer').removeClass('shown'); // Hide the search modal
        $('body').css({'overflow-y': 'scroll'});
        this.isShown = false;
    }

}

export default Search;