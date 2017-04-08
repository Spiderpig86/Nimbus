import consts from '../../consts.json';
import histItem from '../controls/histItem';
import openExtBtn from '../controls/openExternalBtn';

let SC = require('soundcloud');

// Soundcloud Properties 
const RAND_COUNT = 4000000;
const OFFSET = 3000000;

class Player {

    constructor() {
        // Initialize variables
        this.history = [];
        this.isPlaying = false;
        this.curPlayer = null;
        this.curTrack = null;
        this.curTrackId = 0;

        // Current track properties
        this.title = '';
        this.curDuration = 0;
        this.description = '';
        this.url = '';
        this.artwork_url = '';
        this.artist = '';

        // Bind page elements 
        this.bindElements();

        this.playBtn.onclick = (e) => {
            if (this.curPlayer === null && !this.isPlaying)
                this.updateStream(this.getRandomTrack());

            try {
                if (!this.isPlaying) {
                    
                    this.curPlayer.play();
                    this.curPlayer.pause();
                    this.curPlayer.play();
                    console.log('isPlaying = true');
                    this.isPlaying = true;
                } else {
                    this.curPlayer.pause();
                    //this.curPlayer.play();
                    
                    // Give the timeout enough time to avoid the race conflict.
                    var waitTime = 150;
                    setTimeout(function () {      
                        // Resume play if the element if is paused.
                        this.curPlayer.play();
                        this.curPlayer.pause();
                    }, waitTime);
                    console.log('isPlaying = false');
                    this.isPlaying = false;
                }
            } catch(e) {
                this.updateStream(this.getRandomTrack());
            }
        }
    }

    bindFunctions() {
        this.start = this.start.bind(this);
    }

    bindElements() {
        this.mainPlayer = document.getElementById('mainPlayer');
        this.playBtn = document.getElementById('play-btn');
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
            // Generate random value
            let id = (Math.floor((Math.random() * RAND_COUNT) + OFFSET));
            //id = 5740357;

            SC.get('/tracks/' + id).then((tracks) => { // Check if there are results
                console.log(tracks + "ggu");
                if (tracks.length !== undefined) {
                    this.history.push(track); // Push the track so it can be replayed from history.
                    this.getTrackProperties(track);
                    
                    return id;
                } else {
                    // Find another track
                    this.getRandomTrack();
                    //console.log("no good");
                    console.log(tracks.length + " rg");
                }
            });
            return id;
        } catch(e) {
            alert("error");
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
        this.artwork_url = track.artwork_url;
        this.aritst = track.user.username;

        console.log(track);

        // Get more info later...
    }

    async startSong(id) {
        if (!this.isPlaying) {
            await this.updateStream(id);
            console.log('startSong');

            // Add event listeners to stream object.
            this.curPlayer.on('finish', () => {
                this.startSong(this.getRandomTrack());
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
        try {
            // Use await to obtain promise from server
            //let player = await SC.stream(`/tracks/${id}?client_id=${consts.client_id}`);

            await SC.stream(`/tracks/${id}?client_id=${consts.client_id}`).then((player) => {
                this.curPlayer = player;
                 // Add event listeners to stream object.
                this.curPlayer.on('finish', () => {
                    this.startSong(this.getRandomTrack);
                });
                this.curPlayer.play();
                this.isPlaying = true;
            });
            console.log('getTrackById');

            // rtmp fix on Chrome (Mar 24 2017)
            // Reference: http://stackoverflow.com/questions/34203097/soundcloud-api-v3-stream-not-working-in-chrome
            //if (this.curPlayer.options.protocols[0] === 'rtmp')
                this.curPlayer.options.protocols = this.curPlayer.options.protocols.reverse();
            return this.curPlayer;
        } catch (e) {
            console.log('Unable to play current song.' + e.toString());
        }
    }


}

export default Player;