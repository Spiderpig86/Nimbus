"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _consts = require('../consts.json');

var _consts2 = _interopRequireDefault(_consts);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SC = require('soundcloud');

var Player = function () {
    function Player() {
        _classCallCheck(this, Player);
    }

    _createClass(Player, [{
        key: 'initialize',
        value: function initialize() {
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
    }, {
        key: 'bindFunctions',
        value: function bindFunctions() {
            this.start = this.start.bind(this);
        }
    }, {
        key: 'start',
        value: function start() {
            try {
                SC.initalize({ client_id: _consts2.default.client_id });
            } catch (e) {
                console.log('Error initializing SoundCloud API. Stack trace: ' + e.toString());
            }
            console.log('SoundCloud API initalized!');
        }

        /**
         * 
         */

    }, {
        key: 'initializeObjects',
        value: function initializeObjects() {}

        /**
         * This function is designed to get a random track from SoundCloud
         */

    }, {
        key: 'getRandomTrack',
        value: function (_getRandomTrack) {
            function getRandomTrack() {
                return _getRandomTrack.apply(this, arguments);
            }

            getRandomTrack.toString = function () {
                return _getRandomTrack.toString();
            };

            return getRandomTrack;
        }(async function () {
            var _this = this;

            try {
                // Generate random value
                var id = Math.floor(Math.random() * 300000000 + 10000000);

                SC.get('/tracks/' + id).then(function (track) {
                    if (track.length > 0) {
                        _this.history.push(track); // Push the track so it can be replayed from history.
                        getTrackProperties(track);
                    } else {
                        // Find another track
                        getRandomTrack();
                    }
                });
            } catch (e) {
                alert("error");
            }
        })

        /**
         * Extract properties of the track.
         */

    }, {
        key: 'getTrackProperties',
        value: function getTrackProperties(track) {
            // Refer to https://developers.soundcloud.com/docs/api/reference#tracks

            this.title = track.title;
            this.curDuration = track.duration; // Duration in ms
            this.description = track.description; // HTML description
            this.url = track.uri;
            this.artwork_url = track.artwork_url;

            // Get more info later...
        }
    }]);

    return Player;
}();

exports.default = player;