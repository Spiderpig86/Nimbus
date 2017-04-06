"use strict"

import consts from '../consts.json';

var SC = require('soundcloud');

// Soundcloud Properties 
const RAND_COUNT = 300000000;
const OFFSET = 10000000;

class Player {

    initialize() {
        // Variables
        this.history = [];
        this.curTrackId = 0;
        this.isPlaying = false;

        // Current track properties
        this.title = '';
        this.curDuration = 0;
        this.description = '';
        this.url = '';
        this.artwork_url = '';
    }

    bindFunctions() {
        this.start = this.start.bind(this);
    }


    start() {
        try {
            SC.initalize({client_id: consts.client_id});
        } catch(e) {
            console.log('Error initializing SoundCloud API. Stack trace: ' + e.toString());
        }
        console.log('SoundCloud API initalized!');
    }

    /**
     * 
     */
    initializeObjects() {

    }

    /**
     * This function is designed to get a random track from SoundCloud
     */
    async getRandomTrack() {
        try {
            // Generate random value
            let id = (Math.floor((Math.random() * RAND_COUNT) + OFFSET));

            SC.get('/tracks/' + id).then((track) => {
                if (track.length > 0) {
                    this.history.push(track); // Push the track so it can be replayed from history.
                    getTrackProperties(track);
                } else {
                    // Find another track
                    getRandomTrack();
                }
            });
        } catch(e) {
            alert("error");
        }
    }

    /**
     * Extract properties of the track.
     */
    getTrackProperties(track) {
        // Refer to https://developers.soundcloud.com/docs/api/reference#tracks

        this.title = track.title;
        this.curDuration = track.duration; // Duration in ms
        this.description = track.description; // HTML description
        this.url = track.uri;
        this.artwork_url = track.artwork_url;

        // Get more info later...
    }
}

export default player;