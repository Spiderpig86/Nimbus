"use strict"

import consts from '../consts.json';

let SC = require('soundcloud');

// Soundcloud Properties 
const RAND_COUNT = 300000000;
const OFFSET = 10000000;

class Player {

    initialize() {
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
        bindElements();
    }

    bindFunctions() {
        this.start = this.start.bind(this);
    }

    bindElements() {
        this.mainPlayer = document.getElementById('mainPlayer');
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
                    this.cur
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

        // Get more info later...
    }

    async startSong(id) {
        if (!this.isPlaying) {
            await this.updateStream(id);
        }
    }

    async updateStream(id) {
        let stream = await this.getTrackById(id);
        this.curPlayer = stream;
    }

    /**
     * Returns track promise object given id.
     */
    async getTrackById(id) {
        // Create a stream call to the SoundCloud object.
        try {
            // Use await to obtain promise from server
            let player = await SC.get(`/tracks/${id}?client_id=${consts.client_id}`);

            // rtmp fix on Chrome (Mar 24 2017)
            // Reference: http://stackoverflow.com/questions/34203097/soundcloud-api-v3-stream-not-working-in-chrome
            if (player.options.protocols[0] === 'rtmp')
                player.options.protocols = player.options.protocols.reverse();

        } catch (e) {
            console.log('Unable to play current song.');
        }
    }


}

export default player;