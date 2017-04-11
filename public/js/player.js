import consts from '../../consts.json';
import HistItem from '../controls/HistItem';
import SongInfo from '../controls/songinfo';

let SC = require('soundcloud');

// Soundcloud Properties 
const RAND_COUNT = 4000000;
const OFFSET = 3000000;

// IDs to get to get newer tracks
const RAND_COUNT_2 = 30000000;
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

        // Track object
        this.curTrack = {
            id: 0,
            title: '',
            duration: 0,
            description: '',
            url: '',
            artwork_url: '',
            artist: '',
            hasFinished: false,
            track: null
        };

        // Bind page elements 
        this.bindElements();
        this.bindEventHandlers();

        // Load a track when the app is laded.
        this.updateStream(this.getRandomTrack());

    }

    /**
     * Binds the page elements to JS objects so we can access them in other functions.
     */
    bindElements() {
        this.mainPlayer = document.getElementById('songContainer');
        this.playBtn = document.getElementById('play-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.histContainer = document.getElementById('histContainer');
        this.btnFf = document.getElementById('seek-fw-btn');
        this.btnBk = document.getElementById('seek-bk-btn');
    }

    /**
     * Binds components on the page to commands on action.
     */
    bindEventHandlers() {
        this.playBtn.onclick = (e) => {
            if (this.curPlayer === null && !this.isPlaying)
                this.updateStream(this.getRandomTrack());
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
            }
        }
    }

    /**
     * The starting point of the application called by app.js. This initalizes the SoundCloud API.
     */
    start() {
        try {
            SC.initialize({client_id: consts.client_id});
        } catch(e) {
            console.log('Error initializing SoundCloud API. Stack trace: ' + e.toString());
        }
        console.log('SoundCloud API initalized!');
    }

    /**
     * This function is designed to get a random track from SoundCloud
     */
    getRandomTrack() {
        try {
            // Choose to use old track ids or new track ids
            let chooseId = (Math.floor(Math.random() * 10));
            let id = 0;

            // Generate random song id. Give slight preference to newer tracks
            switch (chooseId) {
                case 0:
                case 1:
                    id = Math.floor((Math.random() * RAND_COUNT) + OFFSET);
                    break;
                case 2:
                case 3:
                case 4:
                    id = Math.floor((Math.random() * RAND_COUNT_2) + OFFSET_2);
                    break;
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                    id = Math.floor((Math.random() * RAND_COUNT_3) + OFFSET_3);
                    break;
            }
            //id = 5740357;

            SC.get('/tracks/' + id).then((track) => { // Check if there are results
                    // this.history.push(track);
                    //console.log('SC.get()');
                    this.history.push(track); // Push the track so it can be replayed from history. 

                    // Update main player info
                    this.mainPlayer.innerHTML = SongInfo((track.artwork_url === null ? '../img/cd.png' : track.artwork_url.replace('large', 't500x500')), track);
                    this.histContainer.innerHTML += HistItem((track.artwork_url === null ? '../img/cd.png' : track.artwork_url), track.title, track.user.username === undefined ? 'N/A' : track.user.username, track); // Append to history
                    this.curTrack.track = track;
                     if (track.genre === null)
                        track.genre === 'N/A';

                    this.getTrackProperties(track); // This is a trouble spot
                   
                    //console.log(HistItem(this.artwork_url, this.title, this.artist, tracks));
                    //return id;
            }, (err) => {
                // If there is no song with the associated ID, fetch a new one.
                //console.log('getRandomTrack() - (err)');
                this.updateStream(this.getRandomTrack());
            });
            return id;
        } catch(e) {
            console.log('getRandomTrack() - ' + e.toString());
        }
    }

    /**
     * Extract properties of the track.
     * @param 
     */
    getTrackProperties(track) {
        // Refer to https://developers.soundcloud.com/docs/api/reference#tracks

        this.curTrack.track = track;
        console.log('getTrackProperties');
        this.curTrackId = track.id;
        this.title = track.title;
        this.curDuration = track.duration; // Duration in ms
        this.description = track.description; // HTML description
        this.url = track.permalink_url;
        this.artwork_url = track.artwork_url.replace('large', 't500x500');
        this.artist = track.user.username;
        // Get more info later...
    }

    async updateStream(id) {
        let stream = this.getTrackById(id);
        this.curPlayer = stream;
        // Other commands done later
    }

    /**
     * Returns track promise object given id.
     */
    async getTrackById(id) {
        // Create a stream call to the SoundCloud object.
            // Use await to obtain promise from server
            return await SC.stream(`/tracks/${id}?client_id=${consts.client_id}`).then((player) => {
                this.curPlayer = player;

                 // Add event listeners to stream object.
                this.curPlayer.on('finish', () => {
                    this.updateStream(this.getRandomTrack());
                    //console.log('finish event added');
                });

                // Add event listener for updating time
                this.curPlayer.on('time', () => {
                    try {
                        let curTimeStr = this.millisToMinutesAndSeconds(this.curPlayer.currentTime());
                        let totalTimeStr = this.millisToMinutesAndSeconds(this.curTrack.track.duration);
                        document.getElementById('curTime').innerText = `${curTimeStr} / ${totalTimeStr}`;
                    } catch(e) {
                        // Usually error is thrown when skipping tracks.
                    }
                });
                
                try {
                    this.curPlayer.play();
                    document.title = `\u25B6   Nimbus - ${this.curTrack.track.title}`;
                } catch (e) {
                    console.log('Unable to play current song.' + e.toString());
                }
                this.isPlaying = true;
                this.hasFinished = false;

                // rtmp fix on Chrome (Mar 24 2017)
                // Reference: http://stackoverflow.com/questions/34203097/soundcloud-api-v3-stream-not-working-in-chrome
                //if (this.curPlayer.options.protocols[0] === 'rtmp')
                this.curPlayer.options.protocols = this.curPlayer.options.protocols.reverse();
                //return player;
            }).catch(e => {
                // Handle 404 responses
                console.log(e.message);
            });
    }

    /**
     * Simple function to convert milliseconds to a string with minutes and seconds
     * @param {*} millis - time in milliseconds
     */
    millisToMinutesAndSeconds(millis) {
        let minutes = Math.floor(millis / 60000);
        let seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }

    togglePlayState(playing) {
        if (playing) {
            this.playBtn.innerHTML = '<i class="fa fa-pause" aria-hidden="true"></i>';
            document.title = `\u25B6   Nimbus - ${this.curTrack.track.title}`;
        } else {
            this.playBtn.innerHTML = '<i class="fa fa-play" aria-hidden="true"></i>';
            document.title = `\u23F8   Nimbus - ${this.curTrack.track.title}`;
        }
    }

    // UTIL functions
    seekForward(seconds) {
        this.curPlayer.seek(this.curPlayer.currentTime() + (1000 * seconds));
    }

    seekBack(seconds) {
        this.curPlayer.seek(this.curPlayer.currentTime() - (1000 * seconds));
    }

    volumeUp(offset) {
        this.curPlayer.setVolume(Math.min(100, this.curPlayer.getVolume() + offset));
    }

    volumeDown(offset) {
        this.curPlayer.setVolume(Math.max(0, this.curPlayer.getVolume() - offset));
    }

    togglePlay() {
        if (!this.isPlaying) {
            // Nuanced but adds that 'break' in the sound so you know it was pressed just in case isPlaying is the wrong value
            this.curPlayer.play();
            this.curPlayer.pause();
            this.curPlayer.play();
            console.log('isPlaying = true');
            this.isPlaying = true;
            this.mainPlayer.innerHTML = SongInfo((this.curTrack.track.artwork_url === null ? '../img/cd.png' : this.curTrack.track.artwork_url.replace('large', 't500x500')), this.curTrack.track);
            if (!this.history.includes(this.curTrack.track)) {
                this.histContainer.innerHTML += HistItem((this.curTrack.track.artwork_url === null ? '../img/cd.png' : this.curTrack.track.artwork_url), this.curTrack.track.title, this.curTrack.track.artist, this.curTrack.track); // Append to history
                this.history.push(this.curTrack.track); // This adds it to the history so we don't add more song cards thant needed
            }
                // Update play state
            this.togglePlayState(true);
        } else {    
            this.curPlayer.pause();
            this.curPlayer.play();
            this.curPlayer.pause();

            // Update play state
            this.togglePlayState(false);
            
            // Give the timeout enough time to avoid the race conflict.
            //var waitTime = 150;
            // setTimeout(function () {      
            //     // Resume play if the element if is paused.
            //     this.curPlayer.play();
            //     this.curPlayer.pause();
            // }, waitTime);
            //console.log('isPlaying = false');
            this.isPlaying = false;
        }
    }

    fetchNext() {
        try {
            this.curPlayer.pause();
            this.curPlayer.play();
            this.curPlayer.pause();
            this.updateStream(this.getRandomTrack());
        } catch(e) {
            // Shoddy way to catch error just buffer to next track
            this.updateStream(this.getRandomTrack());
        }
    }


}

export default Player;