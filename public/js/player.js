import consts from '../../consts-sec.json';
import HistItem from '../controls/HistItem';
import SongInfo from '../controls/songinfo';
import WaveForm from '../controls/waveform';
import Request from './request';
import SearchDialog from '../controls/search';
import Toast from '../controls/toast';
import Dashboard from '../controls/dashboard';
import Utils from './utils';
import Settings from './settings';
import Charts from '../controls/charts'

const SC = require('soundcloud'); // Import node module

// Soundcloud Properties 

// Oldest range (around 2007 onward)
const RAND_COUNT = 90000;
const OFFSET = 0;

// Going from 2010
const RAND_COUNT_1 = 7000000;
const OFFSET_1 = 3000000;

// More Recent
const RAND_COUNT_2 = 90000000;
const OFFSET_2 = 10000000;

// The fresh stuff
const RAND_COUNT_3 = 300000000;
const OFFSET_3 = 100000000;

// Widget Parameters
//const WIDGET_PARAMS = '&liking=false&show_artwork=false&show_comments=false&show_playcount=false&visual=false';
const WIDGET_PARAMS = '';

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
        this.hasBeenFetched = false; // Used to stop duplicates during recursion
        this.timerUpdate = 0;
        this.isPlaylist = false; // Check if we are playing a playlist.
        this.setCurIndex = 0; // The current index of the song in the playlist
        this.setTrackCount = 0; // This holds the number of tracks in the playlist so we can tell when we have reached the end.
        this.shuffleQueue = false; // Should the queue be shuffled when we get a list of tracks;
        this.queueNum = 120; // How many results to add to the queue

        this.seekingForward = false; // Work around for the bug in PROGRESS event

        // Experimental API v2 Endpoint
        this.SOUNDCLOUD_API_V2 = 'https://api-v2.soundcloud.com/';

        // Widget Props
        this.widgetTrack = {
            cover: '',
            title: '',
            id: 0,
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

        // Initialize Search dialog
        this.searchDialog = new SearchDialog(this);
        
        // Initialize the dashboard, also initializes settings
        this.dashboard = new Dashboard(this);

        // Initialize the charts
        this.chartsDialog = new Charts(this);

        // Settings already Initialized
        if (JSON.parse(Settings.getPref('disableAnimations'))) {
            $(Settings.disableAnimationsCSS).appendTo("head");
        }
        if (JSON.parse(Settings.getPref('disableBlur'))) {
            $(Settings.disableBlurCSS).appendTo("head");
        }

        // Load a track when the app is loaded (take url param into account).
        document.getElementById('widgettest').setAttribute('src', 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/170202151' + WIDGET_PARAMS);
        let iframeID = document.getElementById('widgettest');
        this.curPlayer = SC.Widget(iframeID);
        // Update the player
        this.bindWidgetEvents(this.curPlayer); // Bind event handlers for widget.
        
        // Check for params and then decide what to play
        this.checkParamsAndFetch();

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
        this.btnSearch = document.getElementById('custom-btn');
        this.btnRepeat = document.getElementById('repeat-btn');
        this.btnDashboard = document.getElementById('dashboard-btn');
    }

    /**
     * Binds components on the page to commands on action.
     */
    bindControlEvents() {
        this.playBtn.onclick = (e) => {
            // if (this.curPlayer === null && !this.isPlaying)
            //     this.updateStream(this.getRandomTrack());
            this.togglePlay();

            // Check if song title matches title in app
            if ($('#songTitle').value !== this.curPlayer.title) {
                this.curPlayer.getCurrentSound((song) => {
                    this.updateSongInfo(song);
                });
            }
        }

        // Event handler for seeking forward / fetch new song
        this.btnFf.onclick = (e) => {
            if (this.queue.length > 0 || this.isPlaylist) {
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
        this.btnSearch.onclick = (e) => {
            this.searchDialog.toggleSearchDialog();
        }
        
        // Event handler for repeats
        this.btnRepeat.onclick = (e) => {
            this.isRepeating = !this.isRepeating; // Toggle the value
            if (this.isRepeating) {
                this.btnRepeat.style.color = '#ff2160';
            } else {
                this.btnRepeat.style.color = 'inherit';
            }
        }

        // Event handler to show dashboard
        this.btnDashboard.onclick = (e) => {
            this.dashboard.toggleDashboard();
        }

        // Bind keyboard shortcuts
        document.onkeydown = (e) => {
            if (e.keyCode == 32) {
                // space key to toggle playback
                var tag = e.target.tagName.toLowerCase();
                if (tag != 'input') // Ignore the search field
                    this.togglePlay();

            } else if (e.shiftKey && e.keyCode == 38) {
                // shift up
                this.volumeUp(10);
            } else if (e.shiftKey && e.keyCode == 40) {
                // shift down
                this.volumeDown(10);

            } else if (e.shiftKey && e.keyCode == 66) {
                let id = prompt("Enter song id.");
                if (id == null)
                    return;

                document.getElementById('widgettest').setAttribute('src', `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${id}` + WIDGET_PARAMS);
                let iframeID = document.getElementById('widgettest');
                this.curPlayer = SC.Widget(iframeID);
                this.curPlayer.load(`https%3A//api.soundcloud.com/tracks/${id}` + WIDGET_PARAMS);
                // Update the player
                this.bindWidgetEvents(this.curPlayer); // Bind event handlers for widget.
                this.togglePlay();
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
                //console.log(song);
                let rndImg = Utils.fetchRandomImage();
                this.updateSongInfo(song);

                // Set the volume (player always resets to 100 again)
                this.setVolume(Settings.getPref('playerVolume'));

                let found = false; // Boolean to see if the song exists
                if (this.history.length > 0 || this.queue.length > 0) {
                    let songList = this.history.concat(this.queue); // Use this to prevent adding any duplicates
                    for (let i = 0; i < songList.length; i++) {
                        if (songList[i].track.id === song.id) {
                            found = true;
                        }
                    };

                    if (!found) { // Append the song if not found
                        this.history.push({id: song.id, track: song}); // Push the track so it can be replayed from history. 
                        let h = new HistItem((song.artwork_url === null ? rndImg : song.artwork_url), song, this, "javascript:alert('Download link unavailable');");
                        this.histContainer.appendChild(h.render()); // Append to history

                        $('.action-bar-item').click((e) => { // Stop button clicks from triggering playing the song
                            e.stopPropagation();
                        });
                    }
                } else {
                    this.history.push({id: song.id, track: song}); // Push the track so it can be replayed from history. 
                    let h = new HistItem((song.artwork_url === null ? rndImg : song.artwork_url), song, this, "javascript:alert('Download link unavailable');");
                    this.histContainer.appendChild(h.render()); // Append to history
                    $('.action-bar-item').click((e) => { // Stop button clicks from triggering playing the song
                        e.stopPropagation();
                    });
                }

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

    updateSongInfo(song) {
        console.log('getcurrentsound start');
        //if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) { // Attempt to fix on mobile devices
            
            // Sorry cannot auto play on mobile =_(
            // https://stackoverflow.com/questions/26066062/autoplay-html5-audio-player-on-mobile-browsers
            // Need to use trick.
            // widget.play();
            // setTimeout(() => {
            //         $('#play-btn').trigger('click'); // Cannot fix autoplay issue, but now users can play the track with 1 tap of the play button instead o several (bug fix)
            //         console.log('test play')
            //     }, 2000);
            // this.togglePlayState(true);
            //this.curPlayer.play(); // Extra call for forcing auto playing in mobile

            // Android app workaround https://developer.android.com/reference/android/webkit/WebSettings.html
        //}
        this.curPlayer.play(); // Play normally on non mobile
        this.togglePlayState(true);

        this.isPlaying = true;
        let rndImg = Utils.fetchRandomImage();
        this.widgetTrack.cover = song.artwork_url;
        this.widgetTrack.title = song.title;
        this.widgetTrack.id = song.id;
        this.widgetTrack.artist = song.user.username || 'N/A'; // Some tracks don't have a usernme associated
        this.widgetTrack.permalink_url = song.permalink_url;
        this.widgetTrack.description = song.description || 'N/A';
        this.widgetTrack.created_at = song.created_at;
        this.widgetTrack.duration = song.duration || 'N/A';
        this.widgetTrack.currentPosition = 0;

        document.title = `\u25B6   Nimbus - ${this.widgetTrack.title}`;

        // Create tag list
        let tagBtns = ``;
        let tagCollection = song.tag_list;
        
        // Get tags that are inside quotes already (treat multiple words as 1 tag)
        let quotedTags = song.tag_list.match(/(["'])(?:(?=(\\?))\2.)*?\1/g);

        // Clean the original list
        tagCollection = tagCollection.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, ''); // Remove all double quoted entries
        tagCollection = tagCollection.split(' ');
        tagCollection = tagCollection.concat(quotedTags);

        if (song.tag_list !== '') {
            for (let i = 0; i < tagCollection.length; i++) {
                let tagName = tagCollection[i];
                if (tagName !== '' && tagName !== null) {
                    tagName = tagName.replace(/\"/g, '');
                    tagBtns += `<a href="https://soundcloud.com/tags/${tagName}" target="_blank"><button class="btn-transparent">
                        #${tagName}
                    </button></a>
                    `;
                }
            }
        }

        this.mainPlayer.innerHTML = SongInfo((song.artwork_url === null ? song.user.avatar_url : song.artwork_url.replace('large', 't500x500')), song, tagBtns, "javascript:alert('Purchase link unavailable');");
        //this.curTrack.track = track;
        document.getElementById('background').style.backgroundImage = 'url(' + (song.artwork_url === null ? rndImg : song.artwork_url.replace('large', 't500x500')) + ')';

        // Add listener for flipContainer
        this.flipContainer = document.getElementById('flipContainer');
        this.flipContainer.onclick = (e) => {
            $('#flipContainer').toggleClass('flipped');
        }

        this.volumeSlider = document.getElementById('volumeSlider');

        this.volumeSlider.addEventListener('change', () => {
            this.setVolume(this.volumeSlider.value);
        }, false);

        // Async method to build waveform
        (async function() { // Changed syntax to fix issue on Safari
            let req = new Request(); // Construct it
            let data = await req.getJSON(song.waveform_url);
            console.log(song.waveform_url);

            // Draw the waveform
            const waveFormContainer = document.querySelector('.waveform');
            if (!this.waveform) {
                this.waveform = new WaveForm({
                container: waveFormContainer,
                audio: this.curPlayer,
                duration: song.duration,
                data: data.samples,
                peakWidth: 2,
                peakSpace: 1,
                responsive: true,
                mouseOverEvents: true,
                mouseClickEvents: true,
                color: {
                    background: "rgba(140, 140, 140, 0.7)",
                    footer: "rgba(90, 90, 90, 0.6)",
                    footerPlayback: "#5d1835",
                    hoverGradient: {
                        from: "#d91e53",
                        to: "#d91e53"
                    },
                    playbackGradient: {
                        from: "#d91e53",
                        to: "#d91e53"
                    },
                    hoverPlaybackGradient: {
                        from: "#ff2160",
                        to: "#ff2160"
                    }
                }
            });
        } else {
            await waveform.updateWaveformData(data.samples);
        }
        }).bind(this)();

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
        this.curPlayer = widget;
        widget.bind(SC.Widget.Events.READY, (e) => {

            // Bind when the song is playing
            widget.bind(SC.Widget.Events.PLAY_PROGRESS, (e) => {
                this.curPosition = e.currentPosition;
                let curTimeStr = Utils.convertMillisecondsToDigitalClock(e.currentPosition).clock;
                let totalTimeStr = Utils.convertMillisecondsToDigitalClock(this.widgetTrack.duration).clock;
                document.getElementById('curTime').innerText = `${curTimeStr} / ${totalTimeStr}`;
                
                // For some reason FINISH event no longer fires when changing songs in playlist, manual override here
                if (e.currentPosition === 0) {
                    if (this.isPlaylist && !this.isRepeating && !this.seekingForward) {
                        this.loadWidgetSong(this.curPlayer); // Update track info to the next song in the playlist
                    } else if (this.isPlaylist && this.isRepeating && !this.seekingForward) { // Replay set
                        this.curPlayer.pause();
                        setTimeout(() => {
                            this.curPlayer.prev();
                            this.loadWidgetSong(this.curPlayer);
                        }, 500);
                    } else if (this.seekingForward) {
                        this.curPlayer.seekTo(1);
                        setTimeout(() => {this.seekingForward = false, 500}); // Prevent this event from firing more than once.
                    }
                }
            });

            // Bind when the song has finished
            widget.bind(SC.Widget.Events.FINISH, (e) => {
                // When the song finishes, we need to find a new song to play.
                console.log('finished');
                this.isPlaying = false;

                // Check if user is playing a playlist
                if (this.isPlaylist && !this.isRepeating) {
                    let oldSongID = this.widgetTrack.id;
                    this.togglePlay();
                    this.loadWidgetSong(this.curPlayer); // Update track info to the next song in the playlist
                    this.isPlaying = false;
                    setTimeout(() => {
                        // Check if we have reached the end of the playlist
                        if (oldSongID === this.widgetTrack.id) { // If the last song we played has the same ID as the new one, fetch a new song. (SoundCloud ends up looping the last song again)
                            this.isPlaylist = false;
                            this.setCurIndex = 0;
                            this.setTrackCount = 0;
                            this.fetchNext();
                        } else {
                            this.restartSong();
                            this.togglePlay();
                            this.curPlayer.play();
                        }
                    }, 200);
                    return;
                }

                // Check if repeat is on first. TODO: Make it work with playlists
                if (this.isRepeating) {
                    if (this.isPlaylist) { // If we are repeating in a playlist, we need to go back to previous song since the API preloads the next one
                        this.restartSong();
                        this.curPlayer.pause();
                        this.curPlayer.pause();
                        setTimeout(this.curPlayer.prev(), 200);
                        return;
                    } else {
                        // Else we can just restart the song (API does not preload song)
                        this.restartSong();
                        this.togglePlay();
                        return;
                    }
                }
                
                // Check if the queue is not empty and play whatever song that is next in the queue
                if (this.queue.length > 0) {
                    let nextSong = this.queue.pop(); // Pop the next song

                    if (nextSong) { // If not null
                        this.curPlayer.load(nextSong.track.permalink_url);
                        setTimeout(() => this.loadWidgetSong(this.curPlayer), 2000); // Update player info, song will be added to history here
                    }
                } else if (!this.hasBeenFetched) { // If we have fetched a song already, do not fetch another one.
                    this.fetchNext();
                    this.hasBeenFetched = true;
                }
            });

            // Bind play state event
            widget.bind(SC.Widget.Events.PLAY, (e) => {
                this.togglePlayState(true);
            });

            // Bind pause state event
            widget.bind(SC.Widget.Events.PAUSE, (e) => {
                this.togglePlayState(false);
            });

            // Throw error in case user enters invalid URL
            widget.bind(SC.Widget.Events.ERROR, (e) => {
                alert('Error, unable to load resource.');
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
            if (chooseId > 4) {
                trackId = Math.floor((Math.random() * RAND_COUNT_3) + OFFSET_3);
            } else if (chooseId > 2) {
                trackId = Math.floor((Math.random() * RAND_COUNT_2) + OFFSET_2);
            } else if (chooseId > 1) {
                trackId = Math.floor((Math.random() * RAND_COUNT_1) + OFFSET_1);
            } else {
                trackId = Math.floor((Math.random() * RAND_COUNT) + OFFSET);
            }

            console.log('in id');

            return trackId;
        } catch (e) {
            console.log('getRandomTrack() - ' + e.toString());
        }
    }

    /**
     * Extracts address paramters by name and loads the appropriate content.
     * 
     * 
     * @memberof Player
     */
    checkParamsAndFetch() {
        // Fetch param values if present
        let id = this.getURLParamsByName('id', window.location.href);
        let url = this.getURLParamsByName('url', window.location.href);

        // Do not fetch a random song if an id was already provided
        if (id) // id takes takes precedence
            this.streamSong(id);
        else if (url)
            this.curPlayer.load(url); // Load the song by url (Widget API takes care of the rest)
        else
            this.fetchNext();
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
        // If we are in playlist mode, play the next song in the playlist and do not fetch a new song
        if (this.isPlaylist) {
            let nextSongID = this.widgetTrack.id;
            this.seekingForward = true;
            this.restartSong();
            this.curPlayer.pause();
            this.curPlayer.pause(); // Widget not really responsive when user goes back and forth quickly
            setTimeout(this.curPlayer.next(), 200);
            this.restartSong(); // Seems weird to call restartSong() so many times, but this is used to reset the songs and avoid the weird bug where the player plays 2 songs simulatenously.
            this.curPlayer.play();
            this.curPlayer.pause(); // Same interrupted Promise issue from API
            this.curPlayer.play();
            setTimeout(() => {
                this.loadWidgetSong(this.curPlayer);
                setTimeout(() => {
                    console.log(this.widgetTrack.id + ' - ' + nextSongID);
                    if (this.widgetTrack.id === nextSongID) { // If we have reached the end of the playlist
                        this.isPlaylist = false;
                        this.setCurIndex = 0;
                        this.setTrackCount = 0;
                        this.fetchNext();
                    }
                }, 200);

            }, 200);
        } else {
            let nextSong = this.queue.pop(); // Pop the next song

            if (nextSong) { // If not null
                this.curPlayer.load(nextSong.track.permalink_url);
                setTimeout(() => this.loadWidgetSong(this.curPlayer), 2000); // Update player info, will add song to history
            }
        }
    }

    /**
     * Rewind to previous song
     */
    seekBack() {
        // this.isPlaylist = false; // Exit playlist mode so we don't end up stuck in a loop with songs
        // If we are in a playlist, simply move back to the previous song
        if (this.isPlaylist) {
            let lastSongID = this.widgetTrack.id;
            this.restartSong();
            this.curPlayer.pause();
            this.curPlayer.pause();
            setTimeout(this.curPlayer.prev(), 200); // Player not cooperating with async
            this.restartSong(); // Seems weird to call restartSong() so many times, but this is used to reset the songs and avoid the weird bug where the player plays 2 songs simulatenously.
            setTimeout(() => {
                this.loadWidgetSong(this.curPlayer);
                setTimeout(() => {
                    console.log(this.widgetTrack.id + ' - ' + lastSongID);
                    if (this.widgetTrack.id === lastSongID) { // If we have reached the beginning of the playlist
                        this.loadPreviousSong();
                    }
                }, 200); // Needed to be done to allow time for async request to complete in loadWidgetSong()
                
            }, 200);
            this.curPlayer.play();
            this.curPlayer.pause(); // Same interrupted Promise issue from API
            this.curPlayer.play();
            return;
        }
        console.log('not playlist');

        this.loadPreviousSong();
    }

    loadPreviousSong() {
        this.isPlaylist = false;

         // Pop current song and add it to queue so it is our next song
        this.queue.push(this.history.pop());
        let prevSong = this.history[this.history.length - 1].track;

        if (prevSong) { // If not null
            this.curPlayer.load(prevSong.permalink_url);
            console.log(prevSong.permalink_url);
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
     * Increases the volume with the maximum bound being 100.
     * @param {float} offset - how much to increase the volume by
     */
    volumeUp(offset) {
        this.curPlayer.getVolume((vol) => {
            let newVol = Math.min(100, vol + offset);
            this.setVolume(newVol);
        });
    }

    /**
     * Lowers the volume by offset with the minimum bound being 0.
     * @param {float} offset - how much to lower the volume by
     */
    volumeDown(offset) {
        this.curPlayer.getVolume((vol) => {
            let newVol = Math.max(0, vol - offset);
            this.setVolume(newVol);
        });
    }

    /**
     * Sets the volume of the player while updating UI components and user setting.
     * 
     * @param {Number} vol - volume level
     * 
     * @memberof Player
     * 
     */
    setVolume(vol) {
        this.curPlayer.setVolume(vol);
        this.volumeSlider.value = vol;
        Settings.storePref('playerVolume', vol);
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
            let isSet = false;
            console.log('Queue length - ' + this.queue.length);
            if (this.queue.length > 0) { // First check if the queue is non-empty
                let nextSong = this.queue.pop(); // Pop the next song

                if (nextSong) { // If not null
                    this.history.push({id: nextSong.id, track: nextSong}); // Add it to history
                    this.curPlayer.load(nextSong.permalink_url);
                    setTimeout(() => this.loadWidgetSong(this.curPlayer), 2000); // Update player info
                    return; // Exit method
                }
            } else { // If the queue is empty, fetch a new song
                this.curPlayer.pause();
                this.restartSong();
            }
        } catch (e) {
            console.log('fetchNext' + e.toString());
        }
        let id = this.getRandomTrack(); // Works for tracks with 403 errors in other API

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
        }).catch((err) => {
            console.log(err.status);
            if (err.status === 0) { // Invalid API key
                console.log('0/401 Unauthorized. Possible Invalid SoundCloud key')
                throw '0/401 Unauthorized. Possible Invalid SoundCloud key';
            }
            if (err.status === 403) { // Play the song anyway even if this API requiest returns a forbidden request (Soundcloud problem)
                this.streamSong(id);
                return;
            }
            // If there is no song with the associated ID, fetch a new one.
            this.fetchNext();
        });
    }

    /**
     * Stream the song when a valid id is found
     * @param {int} id - holds the song id
     */
    streamSong(id) {
        console.log('track fetch success ' + id);
        this.curPlayer.load(`https%3A//api.soundcloud.com/tracks/${id}` + WIDGET_PARAMS);
        this.togglePlayState(true);
        setTimeout(() => this.loadWidgetSong(this.curPlayer), 2000);
    }

    /**
     * Find the song based on user entered keywords, like 'I'm Feeling Lucky' on Google.
     * 
     * @param {String} query - search terms to find song
     * 
     * @memberof Player
     */
    getTrackByKeyWord(query) {
        // Get a list of songs by the search query and play first choice
        try {
            SC.get('/tracks', {q: query}).then((tracks) => {
                if (tracks.length > 0) {

                    if (this.shuffleQueue) {
                        let randIndex = Math.floor(Math.random() * tracks.length);
                        // Pick a random song to play
                        this.queue.push({ id: tracks[randIndex].id, track: tracks[randIndex]});
                        Utils.showToast(`Added ${tracks[randIndex].title} to the queue.`)
                    } else {
                        // Load the first song
                        this.queue.push({ id: tracks[0].id, track: tracks[0]}); // The "I'm feeling lucky part of the search"
                        Utils.showToast(`Added ${tracks[0].title} to the queue.`)
                    }
                }
            });
        } catch (e) {
            console.log('getTrackByKeyWord Error - ' + e.message);
        }
    }

    /**
     * Fetches tracks by a list of tags from the user separated by commas.
     * 
     * @param {string} tagList - a string with tags separated by commas
     * 
     * @memberof Player
     */
    getTracksByTags(tagList) {
        try {
            // Create options object to hold what we want to search for
            let options = {
                tags: tagList,
                limit: this.queueNum
            } // TODO: Allow to modify limit later

            SC.get('/tracks', options).then((tracks) => {
                if (tracks.length > 0) {
                    console.log(tracks);

                    let trackCollection = null;
                    if (this.shuffleQueue)
                        trackCollection = this.shuffleTracks(tracks);
                    else
                        trackCollection = tracks.reverse();

                    // Queue all tracks to the queue of the user's playlist. Note that queue is actually acting like a stack since we use push() and pop()
                    for (let i = 0; i < trackCollection.length; i++) { // Skip the first one since we are already playing it at this point (need to subtract upper bound by 1 since we want to exclude the first track from the reversed array)
                        this.queue.push({id: trackCollection[i].id, track: trackCollection[i]});
                        console.log(tracks[i].title);
                    }

                    // // Load the song
                    // this.curPlayer.load(trackCollection[trackCollection.length - 1].permalink_url);
                
                    // Display toast message when done
                    Utils.showToast(`${tracks.length} tracks added to the queue.`);
                } else {
                    Utils.showToast('Search returned no results. Please try again.');
                }
            });
        } catch (e) {
            console.log('getTracksByTags Error - ' + e.message);
        }
    }

    /**
     * Searches for a playlist by keyword.
     * 
     * @param {String} query - name of the playlist
     * 
     * @memberof Player
     */
    getSetByKeyWord(query) {
        try {
            SC.get('/playlists', {q: query}).then((sets) => {
                if (sets.length > 0) {
                    if (this.shuffleQueue) { // If we want to shuffle the results
                        // Load the set
                        let resIndex = Math.floor(Math.random() * (sets.length + 1));
                        this.queue.push({id: sets[resIndex].id, track: sets[resIndex]}); // The "I'm feeling lucky part of the search"
                        this.setTrackCount = sets[resIndex].track_count;
                        Utils.showToast(`Now playing ${sets[resIndex].title} (${this.setTrackCount} songs)`)
                    } else {
                        // Load the set
                        this.queue.push({id: sets[0].id, track: sets[0]}); // The "I'm feeling lucky part of the search"
                        this.setTrackCount = sets[0].track_count;
                        console.log(sets[0]);
                        Utils.showToast(`Queued ${sets[0].title} (${this.setTrackCount} songs)`)
                    }
                }
            });
        } catch (e) {
            console.log('getSetByKeyWord Error - ' + e.message);
        }
    }

    /**
     * Searches for the first queueNum songs by a user.
     * 
     * @param {String} user - username of the user
     * 
     * @memberof Player
     */
    getTracksByUser(user) {
        try {
            SC.resolve(`https://soundcloud.com/${user}`).then((response) => {
                try {
                    // Create options object to hold what we want to search for
                    let options = {
                        limit: this.queueNum
                    }

                    SC.get(`/users/${response.id}/tracks`, options).then((tracks) => {
                        console.log(tracks);
                        if (tracks.length > 0) {

                            let trackCollection = null;
                            if (this.shuffleQueue)
                                trackCollection = this.shuffleTracks(tracks);
                            else
                                trackCollection = tracks.reverse();

                            // Queue all tracks to the queue of the user's playlist. Note that queue is actually acting like a stack since we use push() and pop()
                            for (let i = 0; i < trackCollection.length; i++) { // Skip the first one since we are already playing it at this point (need to subtract upper bound by 1 since we want to exclude the first track from the reversed array)
                                this.queue.push({id: trackCollection[i].id, track: trackCollection[i]});
                            }
                            
                            // // Load the song
                            // this.curPlayer.load(trackCollection[trackCollection.length - 1].permalink_url); // Top of the result
                        
                            // Display toast message when done
                            Utils.showToast(`${tracks.length} tracks added to the queue.`);
                        } else {
                            Utils.showToast('Search returned no results. Please try again.');
                        }
                    });
                } catch (e) {
                    console.log('getSongsByUser Error - ' + e.message);
                }
            });
        } catch (e) {
            console.log(e);
        }
    }

    /**
     * Searches for songs by genres (string of genres separated by commas)
     * 
     * @param {String} genreList - comma separated list of genres
     * 
     * @memberof Player
     */
    getTracksByGenres(genreList) {
        try {
            // Create options object to hold what we want to search for
            let options = {
                genres: genreList,
                limit: this.queueNum
            } // TODO: Allow to modify limit later

            SC.get('/tracks', options).then((tracks) => {
                if (tracks.length > 0) {

                    let trackCollection = null;
                    if (this.shuffleQueue)
                        trackCollection = this.shuffleTracks(tracks);
                    else
                        trackCollection = tracks.reverse();

                    // Queue all tracks to the queue of the user's playlist. Note that queue is actually acting like a stack since we use push() and pop()
                    for (let i = 0; i < trackCollection.length; i++) { // Skip the first one since we are already playing it at this point (need to subtract upper bound by 1 since we want to exclude the first track from the reversed array)
                        this.queue.push({id: trackCollection[i].id, track: trackCollection[i]});
                    }

                    // // Load the song
                    // this.curPlayer.load(trackCollection[trackCollection.length - 1].permalink_url);
                
                    // Display toast message when done
                    Utils.showToast(`${tracks.length} tracks added to the queue.`);
                } else {
                    Utils.showToast('Search returned no results. Please try again.');
                }
            });
        } catch (e) {
            console.log('getSongsByGenres Error - ' + e.message);
        }
    }

    /**
     * Checks if song history contains a song by id.
     * 
     * @param {Number} id - id of the song we are looking for.
     * @returns {Boolean}
     * 
     * @memberof Player
     */
    historyContainsId(id) {
        let found = false;
        for (let i = 0; i < this.history.length; i++) {
            if (this.history[i].id === id) {
                found = true;
            }
        };
        return found;
    }

    /**
     * Extracts the url params to play specific tracks on load.
     * 
     * @param {String} name - name of the param
     * @param {String} url - current address loaded by the user
     * @returns 
     * 
     * @memberof Player
     */
    getURLParamsByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    shuffleTracks(tracks) {
        let temp = null;
        console.log('shuffling tracks');
        // Using in place Durstenfeld shuffle
        for (let i = tracks.length - 1; i > 0; i --) {
            let j = Math.floor(Math.random() * (i+1)); // Generate a random index [0...i]
            temp = tracks[i]; // Start swapping
            tracks[i] = tracks[j];
            tracks[j] = temp;
        }

        return tracks;
    }

    getTracksFromCharts(_kind, _genres, _limit, $_partition = 1) {
        // kind=top&genre=soundcloud%3Agenres%3Aall-music&limit=50
        try {
            // let oReq = new XMLHttpRequest(); //New request object
            // oReq.onload = function() {
            //     // Callback
            //     let songs = JSON.parse(this.responseText);
            //     console.log(songs);
            //     console.log(this.queue);
            // };
            // oReq.open("get", `http://polarity.x10.mx/test.php?kind=${_kind}&genre=${_genres}&limit=${_limit}&linked_partitioning=${$_partition}&client_id=${consts.client_id}`, true);
            // //                               ^ Don't block the rest of the execution.
            // //                                 Don't wait until the request finishes to 
            // //                                 continue.
            // oReq.send();
            // // console.log(`https://api-v2.soundcloud.com/charts?kind=${_kind}&genre=${_genres}&limit=${_limit}&linked_partitioning=${$_partition}&client_id=${consts.client_id}`);
            // // let req = new Request(); // Construct it
            // // let tracks = await req.getJSON(`https://api-v2.soundcloud.com/charts?kind=${_kind}&genre=${_genres}&limit=${_limit}&linked_partitioning=${$_partition}&client_id=${consts.client_id}`);

            $.ajax({
                url: 'http://polarity.x10.mx/nimbus/charts.php', //This is the current doc
                type: "GET",
                dataType:'json', // add json datatype to get json
                data: ({
                    kind: _kind,
                    genre: _genres,
                    limit: _limit,
                    linked_partitioning: $_partition,
                    client_id: consts.client_id
                }),
                success: (data) => {
                    let trackCollection = null;
                    if (this.shuffleQueue)
                        trackCollection = this.shuffleTracks(data.collection);
                    else
                        trackCollection = data.collection.reverse();

                    for (let i = 0; i < trackCollection.length; i++) {
                        this.queue.push({id: trackCollection[i].track.id, track: trackCollection[i].track}); // This needs the track identifier
                    }

                    console.log(trackCollection);

                    //  // Load the song
                    // this.curPlayer.load(trackCollection[trackCollection.length - 1].track.permalink_url);
                    // setTimeout(() => this.loadWidgetSong(this.curPlayer), 1000);
                    
                    // Display toast message when done
                    Utils.showToast(`${trackCollection.length} tracks added to the queue.`);
                }
            });  
        } catch (e) {
            console.log('getTracksFromCharts Error - ' + e.message); 
        }
    }
}

export default Player;