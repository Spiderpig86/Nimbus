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
        this.btnCustom.onclick = (e) => {
            let url = prompt("Enter song/playlist url, id, or artist/song.");
            if (url == null)
                return;
            
            // If the queue is not empty, shift everything to the history so that the order of the songs occur in the same order as shown
            if (this.queue.length > 0) {
                let originalQueueLength = this.queue.length;
                for (let i = 0; i < originalQueueLength; i++) 
                    this.history.push(this.queue.pop());
            }

            let iframeID = document.getElementById('widgettest');
            this.curPlayer = SC.Widget(iframeID);

            // Determine input type
            if (url.startsWith('http') && isNaN(url)) { // Check if this is a url
                this.isPlaylist = false; // Reset
                if (url.includes('sets')) {
                    this.isPlaylist = true;
                }                    
                this.curPlayer.load(`${url}`);
            } else if (isNaN(url)) { // Check if this is a string query
                // Check tags
                console.log(url.startsWith('set:'));
                if (url.startsWith('playlist:') || url.startsWith('set:')) {
                    this.getSetByKeyWord(url.split(':')[1]);
                    this.isPlaylist = true;
                } else if (url.startsWith('tag:')) {
                    this.getTracksByTag(url.split(':')[1]);
                    this.isPlaylist = false;
                } else {
                    this.getTrackByKeyWord(url);
                    this.isPlaylist = false;
                }
            } else { // Must be a song ID
                console.log(url);
                this.curPlayer.load(`https%3A//api.soundcloud.com/tracks/${url}`); // For id
                this.isPlaylist = false;
            }

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
                console.log('getcurrentsound start');
                widget.play();
                this.isPlaying = true;
                let rndImg = this.fetchRandomImage();
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

                let found = false; // Boolean to see if the song exists
                if (this.history.length > 0 || this.queue.length > 0) {
                    let songList = this.history.concat(this.queue); // Use this to prevent adding any duplicates
                    for (let i = 0; i < songList.length; i++) {
                        if (songList[i]._resource_id === song._resource_id) {
                            found = true;
                        }
                    };

                    if (!found) { // Append the song if not found
                        this.history.push(song); // Push the track so it can be replayed from history. 
                        this.histContainer.innerHTML += HistItem((song.artwork_url === null ? song.user.avatar_url : song.artwork_url), (song.artwork_url === null ? rndImg : song.artwork_url), song.title, this.widgetTrack.artist, song, "javascript:alert('Download link unavailable');"); // Append to history
                    }
                } else {
                    this.history.push(song); // Push the track so it can be replayed from history. 
                    this.histContainer.innerHTML += HistItem((song.artwork_url === null ? song.user.avatar_url : song.artwork_url), (song.artwork_url === null ? rndImg : song.artwork_url), song.title, this.widgetTrack.artist, song, "javascript:alert('Download link unavailable');"); // Append to history
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
                        this.history.push(nextSong); // Add it to history
                        this.curPlayer.load(nextSong.permalink_url);
                        setTimeout(() => this.loadWidgetSong(this.curPlayer), 2000); // Update player info
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
            } else if (chooseId > 1) {
                trackId = Math.floor((Math.random() * RAND_COUNT_2) + OFFSET_2);
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
        // If we are in playlist mode, play the next song in the playlist and do not fetch a new song
        console.log(this.isPlaylist);
        if (this.isPlaylist) {
            let nextSongID = this.widgetTrack.id;
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
                this.history.push(nextSong); // Add it to history
                this.curPlayer.load(nextSong.permalink_url);
                setTimeout(() => this.loadWidgetSong(this.curPlayer), 2000); // Update player info
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
        setTimeout(() => this.loadWidgetSong(this.curPlayer), 2000);
    }

    /**
     * Grab a random image when a song does not have cover art.
     */
    fetchRandomImage() {
        let i = Math.floor(Math.random() * 4050) + 1;
        return `http://img.infinitynewtab.com/wallpaper/${i}.jpg`;
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
                    // Load the first song
                    this.curPlayer.load(tracks[0].permalink_url); // The "I'm feeling lucky part of the search"
                }
            });
        } catch (e) {
            console.log('getTrackByKeyWord Error - ' + e.message);
        }
    }

    getTracksByTag(tag) {
        try {
            // Create options object to hold what we want to search for
            let options = {
                tags: tag,
                limit: 120
            } // TODO: Allow to modify limit later

            SC.get('/tracks', options).then((tracks) => {
                if (tracks.length > 0) {

                    // Reverse the tracks so the first result shown is the next song, not the opposite
                    tracks = tracks.reverse();

                    // Queue all tracks to the queue of the user's playlist
                    for (let i = 0; i < tracks.length; i++) {
                        this.queue.push(tracks[i]);
                        //console.log(tracks[i].title);
                    }
                    
                    // Load the song
                    this.curPlayer.load(tracks[0].permalink_url);
                    // Display toast message when done?
                }
            });
        } catch (e) {
            console.log('getTrackByKeyWord Error - ' + e.message);
        }
    }

    getSetByKeyWord(query) {
        try {
            SC.get('/playlists', {q: query}).then((sets) => {
                if (sets.length > 0) {
                    // Load the set
                    this.curPlayer.load(sets[0].permalink_url); // The "I'm feeling lucky part of the search"
                    this.setTrackCount = sets[0].track_count;
                }
            });
        } catch (e) {
            console.log('getSetByKeyWord Error - ' + e.message);
        }
    }

    historyContainsId(id) {
        let found = false;
        for (let i = 0; i < this.history.length; i++) {
            if (this.history[i].id === id) {
                found = true;
            }
        };
        return found;
    }

}

export default Player;