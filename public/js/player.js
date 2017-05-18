import consts from '../../consts-sec.json';
import HistItem from '../controls/HistItem';
import SongInfo from '../controls/songinfo';

let SC = require('soundcloud');

// Soundcloud Properties 
const RAND_COUNT = 7000000;
const OFFSET = 3000000;

// IDs to get to get newer tracks
const RAND_COUNT_2 = 90000000;
const OFFSET_2 = 10000000;

// IDs to get to get newer tracks
const RAND_COUNT_3 = 300000000;
const OFFSET_3 = 100000000;

class Player {

    /**
     * Sets up the the application variables and hooking events to controls.
     */
    constructor() {
        // Initialize variables
        this.history = [];
        this.isPlaying = false;
        this.curPlayer = null;
        this.curPosition = 0;

        // Widget Props (BETA)
        this.widgetTrack = {
            cover: '',
            title: '',
            artist: '',
            permalink_url: '',
            description: '',
            created_at: '',
            duration: 0,
            currentPosition: 0
        };

        // Bind page elements 
        this.bindControlElements();
        this.bindControlEvents();

        // Load a track when the app is laded.
        document.getElementById('widgettest').setAttribute('src', `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/170202151`);
        let iframeID = document.getElementById('widgettest');
        this.curPlayer = SC.Widget(iframeID);
        // Update the player
        this.bindWidgetEvents(this.curPlayer); // Bind event handlers for widget.
        this.fetchNext();
        console.log('construct done');
    }

    /**
     * Binds the page elements to JS objects so we can access them in other functions.
     */
    bindControlElements() {
        this.mainPlayer = document.getElementById('songContainer');
        this.playBtn = document.getElementById('play-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.histContainer = document.getElementById('histContainer');
        this.btnFf = document.getElementById('seek-fw-btn');
        this.btnBk = document.getElementById('seek-bk-btn');
        this.btnCustom = document.getElementById('custom-btn');
    }

    /**
     * Binds components on the page to commands on action.
     */
    bindControlEvents() {
        this.playBtn.onclick = (e) => {
            // if (this.curPlayer === null && !this.isPlaying)
            //     this.updateStream(this.getRandomTrack());
            this.togglePlay();
        }

        // Bind the skip button
        this.nextBtn.onclick = (e) => {
            this.fetchNext();
        }

        // Event handler for seeking forward
        this.btnFf.onclick = (e) => {
            this.seekForward(10);
        }

        // Event handler for seeking back
        this.btnBk.onclick = (e) => {
            this.seekBack(10);
        }

        // Event handler to play custom song
        this.btnCustom.onclick = (e) => {
            let url = prompt("Enter song url.");
            if (url == null)
                return;

            // Reset the player
            try {
                togglePlay();
            } catch(e) {
                console.log(e.message);
            }

            //document.getElementById('widgettest').setAttribute('src', `https://w.soundcloud.com/player/?url=${url}`);
            let iframeID = document.getElementById('widgettest');
            this.curPlayer = SC.Widget(iframeID);
            //this.curPlayer.load(`https%3A//api.soundcloud.com/tracks/${id}`); // For id
            this.curPlayer.load(`${url}`);
            // Update the player
            this.bindWidgetEvents(this.curPlayer); // Bind event handlers for widget.
            setTimeout(() => this.loadWidgetSong(this.curPlayer), 1000);
        }

        // Bind keyboard shortcuts
        document.onkeyup = (e) => {
            if (e.keyCode == 39) {
                // right arrow key pressed, play next
                this.fetchNext();
            } else if (e.keyCode == 32) {
                // space key to toggle playback
                this.togglePlay();
            } else if (e.shiftKey && e.keyCode == 38) {
                // shift up
                this.volumeUp(0.1);
            } else if (e.shiftKey && e.keyCode == 40) {
                // shift down
                this.volumeDown(0.1);

            } else if (e.shiftKey && e.keyCode == 66) {
                let id = prompt("Enter song id.");
                if (id == null)
                    return;

                document.getElementById('widgettest').setAttribute('src', `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${id}`);
                let iframeID = document.getElementById('widgettest');
                this.curPlayer = SC.Widget(iframeID);
                this.curPlayer.load(`https%3A//api.soundcloud.com/tracks/${id}`);
                // Update the player
                this.bindWidgetEvents(this.curPlayer); // Bind event handlers for widget.
                setTimeout(() => this.loadWidgetSong(this.curPlayer), 1000);
            }
        }
    }

    /**
     * Attempts to load information associated to the widget to local vars and displays them
     * @param {SoundCloudWidget} widget - widget loaded by API
     */
    loadWidgetSong(widget) {
        try {
            console.log('loadwidgetsong called');
            widget.getCurrentSound((song) => {
                console.log('getcurrentsound start');
                console.log(song);
                widget.play();
                this.isPlaying = true;
                let rndImg = this.fetchRandomImage();
                this.widgetTrack.cover = song.artwork_url;
                this.widgetTrack.title = song.title;
                this.widgetTrack.artist = song.user.username || 'N/A'; // Some tracks don't have a usernme associated
                this.widgetTrack.permalink_url = song.permalink_url;
                this.widgetTrack.description = song.description;
                this.widgetTrack.created_at = song.created_at;
                this.widgetTrack.duration = song.duration;
                this.widgetTrack.currentPosition = 0;

                console.log(song.title);

                this.mainPlayer.innerHTML = SongInfo((song.artwork_url === null ? song.user.avatar_url : song.artwork_url.replace('large', 't500x500')), song);
                //this.curTrack.track = track;
                document.getElementById('background').style.backgroundImage = 'url(' + (song.artwork_url === null ? rndImg : song.artwork_url.replace('large', 't500x500')) + ')';

                // Add listener for flipContainer
                this.flipContainer = document.getElementById('flipContainer');
                this.flipContainer.onclick = (e) => {
                    $('#flipContainer').toggleClass('flipped');
                }

                if (!this.history.includes(song)) { // Do not add if it already exists
                    this.history.push(song); // Push the track so it can be replayed from history. 
                    this.histContainer.innerHTML += HistItem((song.artwork_url === null ? song.user.avatar_url : song.artwork_url), (song.artwork_url === null ? rndImg : song.artwork_url), song.title, song.user.username === undefined ? 'N/A' : song.user.username, song); // Append to history
                }

                console.log('getcurrentsound done');
            });

            // Update the play state
            this.togglePlayState(true);
            return;
        } catch (ex) {
            console.log(ex.toString());
        }
    }

    /**
     * The starting point of the application called by app.js. This initalizes the SoundCloud API.
     */
    start() {
        try {
            SC.initialize({
                client_id: consts.client_id
            });
        } catch (e) {
            console.log('Error initializing SoundCloud API. Stack trace: ' + e.toString());
        }
        console.log('SoundCloud API initalized!');
    }

    /**
     * Bind event handlers to the widget
     * @param {SoundCloudWidget} widget - widget loaded from API
     */
    bindWidgetEvents(widget) {
        // if (this.curPlayer === null)
        //     return; // We don't want any accidents

        console.log("cool");
        this.curPlayer = widget;
        widget.bind(SC.Widget.Events.READY, (e) => {

            // Bind when the song is playing
            widget.bind(SC.Widget.Events.PLAY_PROGRESS, (e) => {
                this.curPosition = e.currentPosition;
                let curTimeStr = this.millisToMinutesAndSeconds(e.currentPosition);
                let totalTimeStr = this.millisToMinutesAndSeconds(this.widgetTrack.duration);
                document.getElementById('curTime').innerText = `${curTimeStr} / ${totalTimeStr}`;
            });

            // Bind when the song has finished
            widget.bind(SC.Widget.Events.FINISH, (e) => {
                // When the song finishes, we need to find a new song to play.
                console.log('finished');
                this.fetchNext();
            });

            // // Handle errors
            // widget.bind(SC.Widget.Events.ERROR, (e) => {
            //     console.log('Unable to fetch song. No resource at URL');
            //     //this.fetchNext();
            // });

        });
    }

    /**
     * This function is designed to get a random track from SoundCloud
     */
    getRandomTrack() {
        try {
            // Choose to use old track ids or new track ids
            let chooseId = (Math.floor(Math.random() * 10));
            let trackId = 0;

            // Generate random song id. Give slight preference to newer tracks
            switch (chooseId) {
                case 0:
                case 1:
                    trackId = Math.floor((Math.random() * RAND_COUNT) + OFFSET);
                    break;
                case 2:
                case 3:
                case 4:
                    trackId = Math.floor((Math.random() * RAND_COUNT_2) + OFFSET_2);
                    break;
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                    trackId = Math.floor((Math.random() * RAND_COUNT_3) + OFFSET_3);
                    break;
            }
            console.log('in id');
            // Check if song is valid first (prevents extra recursion)
            // let b = this.songExists(id)
            // if (!b) {
            //     console.log('in id recur' + this.songExists(b));
            //     id = this.getRandomTrack();
            // }

            return trackId;
        } catch (e) {
            console.log('getRandomTrack() - ' + e.toString());
        }
    }

    /**
     * Simple function to convert milliseconds to a string with minutes and seconds
     * @param {*int} millis - time in milliseconds
     */
    millisToMinutesAndSeconds(millis) {
        let minutes = Math.floor(millis / 60000);
        let seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }

    /**
     * Update the UI controls for when the song is playing
     * @param {boolean} playing - if the song is playing or not
     */
    togglePlayState(playing) {
        if (playing) {
            this.playBtn.innerHTML = '<i class="fa fa-pause" aria-hidden="true"></i>';
            document.title = `\u25B6   Nimbus - ${this.widgetTrack.title}`;
        } else {
            this.playBtn.innerHTML = '<i class="fa fa-play" aria-hidden="true"></i>';
            document.title = `\u23F8   Nimbus - ${this.widgetTrack.title}`;
        }
    }

    // UTIL functions
    /**
     * Fast foward song by offset
     * @param {int} seconds - offset to fast foward song
     */
    seekForward(seconds) {
        // Now handled in binded event of widget above.
        // this.curPlayer.getPosition((position) => {
        //     this.curPosition = position;
        // });
        // We need to store the seek value in a temp var, doing it inline causes error
        let seekVal = this.curPosition + (1000 * seconds);
        this.curPlayer.seekTo(Math.floor(seekVal));
    }

    /**
     * Rewind song by offset
     * @param {int} seconds - offset to rewind the song
     */
    seekBack(seconds) {
        let seekVal = this.curPosition - (1000 * seconds);
        this.curPlayer.seekTo(Math.max(Math.floor(seekVal), 0));
    }

    /**
     * Resets the song back to 0
     */
    restartSong() {
        this.curPlayer.seekTo(0);
    }

    /**
     * Increases the volume with the maximum bound being 1.
     * @param {float} offset - how much to increase the volume by
     */
    volumeUp(offset) {
        this.curPlayer.getVolume((vol) => {
            this.curPlayer.setVolume(Math.min(1, vol + offset));
        });
    }

    /**
     * Lowers the volume by offset with the minimum bound being 0.
     * @param {float} offset - how much to lower the volume by
     */
    volumeDown(offset) {
        this.curPlayer.getVolume((vol) => {
            this.curPlayer.setVolume(Math.min(1, vol - offset));
        });
    }

    /**
     * Updates controls to show that the song is in progress.
     */
    togglePlay() {
        if (!this.isPlaying) {
            // Nuanced but adds that 'break' in the sound so you know it was pressed just in case isPlaying is the wrong value
            this.curPlayer.play();
            console.log('isPlaying = true');
            this.isPlaying = true;
            // this.mainPlayer.innerHTML = SongInfo((this.curTrack.track.artwork_url === null ? '../img/cd.png' : this.curTrack.track.artwork_url.replace('large', 't500x500')), this.curTrack.track);
            // Update play state
            this.isPlaying = true;
            this.togglePlayState(true);
        } else {
            this.curPlayer.pause();

            // Update play state
            this.togglePlayState(false);
            this.isPlaying = false;
        }
    }

    /**
     * Fetch the next song and verify that the song exists (non 404).
     */
    fetchNext() {
        try {
            this.curPlayer.pause();
            this.restartSong();
        } catch (e) {
            // Shoddy way to catch error just buffer to next track
            // issue where streaming the same track triggers this error
            //this.fetchNext();
            console.log('fetchNext' + e.toString());
        }
        console.log('pre-id');
        let id = this.getRandomTrack(); // Works for tracks with 403 errors in other API
        console.log(`id - ${id}`);

        SC.get('/tracks/' + id).then((track) => { // Check if there are results
            // Really just designed to check if the song actually exists
           this.streamSong(id);
        }, (err) => {
            console.log(err.status);
            // if (err.status === 0) { // Invalid API key
            //     console.log('0/401 Unauthorized. Possible Invalid SoundCloud key')
            //     throw '0/401 Unauthorized. Possible Invalid SoundCloud key'
            // }
            if (err.status === 403) { // Play the song anyway even if this API requiest returns a forbidden request (Soundcloud problem)
                this.streamSong(id);
                return;
            }
            // If there is no song with the associated ID, fetch a new one.
            console.log('track fetch fail' + id);
            this.fetchNext();
            console.log('track fetch fail post' + id);
        });
    }

    /**
     * Stream the song when a valid id is found
     * @param {int} id - holds the song id
     */
    streamSong(id) {
        console.log('track fetch success' + id);
        this.curPlayer.load(`https%3A//api.soundcloud.com/tracks/${id}`);
        this.togglePlayState(true);
        setTimeout(() => this.loadWidgetSong(this.curPlayer), 1000);
    }

    /**
     * Grab a random image when a song does not have cover art.
     */
    fetchRandomImage() {
        let i = Math.floor(Math.random() * 4050) + 1;
        return `http://img.infinitynewtab.com/wallpaper/${i}.jpg`;
    }

}

export default Player;