import consts from '../../consts-sec.json';
import HistItem from '../controls/HistItem';
import SongInfo from '../controls/songinfo';
import WaveForm from '../controls/waveform';
import Request from './request';

let SC = require('soundcloud'); // Import node module

// Soundcloud Properties 
const RAND_COUNT = 7000000;
const OFFSET = 3000000;

// IDs to get to get newer tracks
const RAND_COUNT_2 = 90000000;
const OFFSET_2 = 10000000;

// IDs to get to get newer tracks
const RAND_COUNT_3 = 300000000;
const OFFSET_3 = 100000000;

let hasBeenFetched = false; // Used to stop duplicates during recursion
let timerUpdate = 0;

class Player {

    /**
     * Sets up the the application variables and hooking events to controls.
     */
    constructor() {
        // Initialize variables
        this.history = [];
        this.queue = []; // For tracks playing next
        this.isPlaying = false;
        this.curPlayer = null;
        this.curPosition = 0;
        this.waveform = null;
        this.isRepeating = false; // For repeating songs

        // Widget Props
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
        this.histContainer = document.getElementById('histContainer');
        this.btnFf = document.getElementById('seek-fw-btn');
        this.btnBk = document.getElementById('seek-bk-btn');
        this.btnCustom = document.getElementById('custom-btn');
        this.btnRepeat = document.getElementById('repeat-btn');
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

        // Event handler for seeking forward / fetch new song
        this.btnFf.onclick = (e) => {
            if (this.queue.length > 0) {
                this.seekForward(); // Seek forward in queue
            } else { // Else just load another song
                this.fetchNext();
            }
        }

        // Event handler for seeking back
        this.btnBk.onclick = (e) => {
            if (this.curPosition > 10000) { // If the song is past 10 seconds, reset song back to beginning (like in Spotify)
                this.restartSong();
            } else { // Else, go to the last song
                this.seekBack();
            }
        }

        // Event handler to play custom song
        this.btnCustom.onclick = (e) => {
            let url = prompt("Enter song url.");
            if (url == null)
                return;
            
            // If the queue is not empty, shift everything to the history so that the order of the songs occur in the same order as shown
            if (this.queue.length > 0) {
                for (let i = 0; i < this.queue.length; i++)
                    this.history.push(this.queue.pop());
            }

            //document.getElementById('widgettest').setAttribute('src', `https://w.soundcloud.com/player/?url=${url}`);
            let iframeID = document.getElementById('widgettest');
            this.curPlayer = SC.Widget(iframeID);
            //this.curPlayer.load(`https%3A//api.soundcloud.com/tracks/${id}`); // For id
            this.curPlayer.load(`${url}`);
            // Update the player
            //this.bindWidgetEvents(this.curPlayer); // Bind event handlers for widget.
            setTimeout(() => this.loadWidgetSong(this.curPlayer), 2000); // Needs longer delay time so it prevents stalling (track not auto playing)
        }
        
        // Event handler for repeats
        this.btnRepeat.onclick = (e) => {
            this.isRepeating = !this.isRepeating; // Toggle the value
            if (this.isRepeating) {
                this.btnRepeat.style.color = '#ff5b02';
            } else {
                this.btnRepeat.style.color = 'inherit';
            }
        }

        // Bind keyboard shortcuts
        document.onkeyup = (e) => {
            if (e.keyCode == 32) {
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
                this.togglePlay
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
            this.waveform = null; // Reset the reference
            widget.getCurrentSound((song) => {
                console.log(song);
                console.log('getcurrentsound start');
                widget.play();
                this.isPlaying = true;
                let rndImg = this.fetchRandomImage();
                this.widgetTrack.cover = song.artwork_url;
                this.widgetTrack.title = song.title;
                this.widgetTrack.artist = song.user.username || 'N/A'; // Some tracks don't have a usernme associated
                this.widgetTrack.permalink_url = song.permalink_url;
                this.widgetTrack.description = song.description || 'N/A';
                this.widgetTrack.created_at = song.created_at;
                this.widgetTrack.duration = song.duration || 'N/A';
                this.widgetTrack.currentPosition = 0;

                document.title = `\u25B6   Nimbus - ${this.widgetTrack.title}`;

                this.mainPlayer.innerHTML = SongInfo((song.artwork_url === null ? song.user.avatar_url : song.artwork_url.replace('large', 't500x500')), song);
                //this.curTrack.track = track;
                document.getElementById('background').style.backgroundImage = 'url(' + (song.artwork_url === null ? rndImg : song.artwork_url.replace('large', 't500x500')) + ')';

                // Add listener for flipContainer
                this.flipContainer = document.getElementById('flipContainer');
                this.flipContainer.onclick = (e) => {
                    $('#flipContainer').toggleClass('flipped');
                }

                let found = false; // Boolean to see if the song exists
                if (this.history.length > 0 || this.queue.length > 0) {
                    let songList = this.history.concat(this.queue); // Use this to prevent adding any duplicates
                    for (let i = 0; i < songList.length; i++) {
                        if (songList[i]._resource_id == song._resource_id) {
                            found = true;
                        }
                    };

                    if (!found) { // Append the song if not found
                        this.history.push(song); // Push the track so it can be replayed from history. 
                        this.histContainer.innerHTML += HistItem((song.artwork_url === null ? song.user.avatar_url : song.artwork_url), (song.artwork_url === null ? rndImg : song.artwork_url), song.title, this.widgetTrack.artist, song, "javascript:alert('Download Link unavailable');"); // Append to history
                    }
                } else {
                    this.history.push(song); // Push the track so it can be replayed from history. 
                    this.histContainer.innerHTML += HistItem((song.artwork_url === null ? song.user.avatar_url : song.artwork_url), (song.artwork_url === null ? rndImg : song.artwork_url), song.title, this.widgetTrack.artist, song, "javascript:alert('Download Link unavailable');"); // Append to history
                }

                // Async method to build waveform
                (async () => {
                    let req = new Request(); // Construct it
                    let data = await req.getJSON(song.waveform_url);

                    // Draw the waveform
                    const waveFormContainer = document.querySelector('.waveform');
                    if (!this.waveform) {
                        this.waveform = new WaveForm({
                        container: waveFormContainer,
                        audio: widget,
                        duration: song.duration,
                        data: data.samples,
                        peakWidth: 2,
                        peakSpace: 1,
                        responsive: true,
                        mouseOverEvents: true,
                        mouseClickEvents: true,
                        color: {
                            background: "#8C8C8C",
                            footer: "#B2B2B2",
                            footerPlayback: "#FFAA80",
                            hoverGradient: {
                                from: "#FF7200",
                                to: "#DA4218"
                            },
                            playbackGradient: {
                                from: "#FF7200",
                                to: "#DA4218"
                            },
                            hoverPlaybackGradient: {
                                from: "#AB5D20",
                                to: "#A84024"
                            }
                        }
                    });
                } else {
                    waveform.updateWaveformData(data.samples);
                }
                })();

                this.hasBeenFetched = false; // Reset

                console.log('getcurrentsound done');
            }, (err) => {
                console.log(err.message);
            });

            // Update the play state
            this.togglePlayState(true);
            return;
        } catch (ex) {
            console.log(ex.message);
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
                this.isPlaying = false;

                // Check if repeat is on first.
                if (this.isRepeating) {
                    this.restartSong();
                    this.togglePlay();
                    return;
                }
                
                // Check if the queue is not empty and play whatever song that is next in the queue
                if (this.queue.length > 0) {
                    let nextSong = this.queue.pop(); // Pop the next song

                    if (nextSong) { // If not null
                        this.history.push(nextSong); // Add it to history
                        this.curPlayer.load(nextSong.permalink_url);
                        setTimeout(() => this.loadWidgetSong(this.curPlayer), 2000); // Update player info
                    }
                } else if (!this.hasBeenFetched) { // If we have fetched a song already, do not fetch another one.
                    this.fetchNext();
                    this.hasBeenFetched = true;
                }
            });

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
     * Seek to next song in queue
     */
    seekForward() {
        let nextSong = this.queue.pop(); // Pop the next song

        if (nextSong) { // If not null
            this.history.push(nextSong); // Add it to history
            this.curPlayer.load(nextSong.permalink_url);
            setTimeout(() => this.loadWidgetSong(this.curPlayer), 2000); // Update player info
        }
    }

    /**
     * Rewind to previous song
     */
    seekBack() {
        // Pop current song and add it to queue so it is our next song
        this.queue.push(this.history.pop());
        let prevSong = this.history[this.history.length - 1];

        if (prevSong) { // If not null
            this.curPlayer.load(prevSong.permalink_url);
            setTimeout(() => this.loadWidgetSong(this.curPlayer), 2000); // Update player info
        }
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
        console.log('track fetch success ' + id);
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