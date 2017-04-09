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
            hasFinished: false
        };

        // Bind page elements 
        this.bindElements();
        this.bindEventHandlers();

        // Load a track 
        this.updateStream(this.getRandomTrack());

    }

    bindElements() {
        this.mainPlayer = document.getElementById('songContainer');
        this.playBtn = document.getElementById('play-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.histContainer = document.getElementById('histContainer');
    }

    bindEventHandlers() {

        // Bind the play button
        this.playBtn.onclick = (e) => {
            if (this.curPlayer === null && !this.isPlaying)
                this.updateStream(this.getRandomTrack());

            try {
                //if (curPlayer !== undefined) {
                    if (!this.isPlaying) {
                        // Nuanced but adds that 'break' in the sound so you know it was pressed just in case isPlaying is the wrong value
                        this.curPlayer.play();
                        this.curPlayer.pause();
                        this.curPlayer.play();
                        console.log('isPlaying = true');
                        this.isPlaying = true;
                    } else {
                        
                        this.curPlayer.pause();
                        this.curPlayer.play();
                        this.curPlayer.pause();
                        
                        // Give the timeout enough time to avoid the race conflict.
                        //var waitTime = 150;
                        // setTimeout(function () {      
                        //     // Resume play if the element if is paused.
                        //     this.curPlayer.play();
                        //     this.curPlayer.pause();
                        // }, waitTime);
                        console.log('isPlaying = false');
                        this.isPlaying = false;
                    }
                  //}
               
            } catch(e) {
                this.updateStream(this.getRandomTrack());
                console.log(e.toString());
            }
        }

        // Bind the skip button
         this.nextBtn.onclick = (e) => {
            try {
                this.curPlayer.pause();
                this.curPlayer.play();
                this.curPlayer.pause();
                this.updateStream(this.getRandomTrack());

            } catch(e) {
                // Shoddy way to catch error just buffer to next track
                this.updateStream(this.getRandomTrack());
            }
                // Autoplay
                this.curPlayer.play();
                this.curPlayer.pause();
                this.curPlayer.play();
            
        }
    }


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
            let chooseId = (Math.floor(Math.random() * 3));
            let id = 0;

            // Generate random song id
            switch (chooseId) {
                case 0:
                    id = Math.floor((Math.random() * RAND_COUNT) + OFFSET);
                    break;
                case 1:
                    id = Math.floor((Math.random() * RAND_COUNT_2) + OFFSET_2);
                    break;
                case 2:
                    id = Math.floor((Math.random() * RAND_COUNT_3) + OFFSET_3);
                    break;
            }
            //id = 5740357;
            console.log(id + 'test');

            SC.get('/tracks/' + id).then((track) => { // Check if there are results
                    this.history.push(track); // Push the track so it can be replayed from history.
                    this.getTrackProperties(track);
                    console.log(track);

                    // Error image in case artist has no cover art
                    if (this.artwork_url === null)
                        this.artwork_url = "../img/cd.png";
                    
                    if (track.genre === null)
                        track.genre === 'N/A';
                    
                    this.histContainer.innerHTML += HistItem(this.artwork_url, track.title, track.artist, track); // Append to history

                    // Update main player info
                    this.mainPlayer.innerHTML = SongInfo(this.artwork_url, track);
                    //console.log(HistItem(this.artwork_url, this.title, this.artist, tracks));
                    //return id;
            }, (err) => {
                // If there is no song with the associated ID, fetch a new one.
                console.log('getRandomTrack() - fetch');
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

        this.curTrack = track;
        this.curTrackId = track.id;
        this.title = track.title;
        this.curDuration = track.duration; // Duration in ms
        this.description = track.description; // HTML description
        this.url = track.permalink_url;
        this.artwork_url = track.artwork_url.replace('large', 't500x500');
        this.artist = track.user.username;

        console.log(track + "getTrackProperties");

        // Get more info later...
    }

    async startSong(id) {
        if (!this.isPlaying) {
            await this.updateStream(id);
            console.log('startSong');

            // Add event listeners to stream object.
            this.curPlayer.on('finish', () => {
                console.log('finished song');
                this.hasFinished = true;
                this.updateStream(this.getRandomTrack());
            });
        }
    }

    async updateStream(id) {
        let stream = this.getTrackById(id);
        console.log(id);
        this.curPlayer = stream;
        console.log('updateStream');
        // Other commands done later
    }

    /**
     * Returns track promise object given id.
     */
    async getTrackById(id) {
        // Create a stream call to the SoundCloud object.
            // Use await to obtain promise from server
            await SC.stream(`/tracks/${id}?client_id=${consts.client_id}`).then((player) => {
                this.curPlayer = player;
                 // Add event listeners to stream object.
                this.curPlayer.on('finish', () => {
                    this.updateStream(this.getRandomTrack());
                    console.log('finish event added');
                });
                try {
                    this.curPlayer.play();
                } catch (e) {
                    console.log('Unable to play current song.' + e.toString());
                }
                this.isPlaying = true;
                this.hasFinished = false;

                // rtmp fix on Chrome (Mar 24 2017)
                // Reference: http://stackoverflow.com/questions/34203097/soundcloud-api-v3-stream-not-working-in-chrome
                //if (this.curPlayer.options.protocols[0] === 'rtmp')
                this.curPlayer.options.protocols = this.curPlayer.options.protocols.reverse();
                return player;
            });
            
            //return this.curPlayer;
    }


}

export default Player;