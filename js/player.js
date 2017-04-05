"use strict"

import consts from './consts.json';


var SC = require('soundcloud');

class Player {

    // Variables
    queue = [];

    start() {
        try {
            SC.initalize({
                client_id: consts.client_id
            });
        } catch(e) {
            console.log('Error initializing SoundCloud API. Stack trace: ' + e.toString());
        }
        console.log('SoundCloud API initalized!');
    }

    /*
        Bind HTML elements to JS objects
    */
    initializeObjects() {

    }
}

export default player;