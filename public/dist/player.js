'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _constsSec = require('../../consts-sec.1.json');

var _constsSec2 = _interopRequireDefault(_constsSec);

var _HistItem = require('../controls/HistItem');

var _HistItem2 = _interopRequireDefault(_HistItem);

var _songinfo = require('../controls/songinfo');

var _songinfo2 = _interopRequireDefault(_songinfo);

var _waveform = require('../controls/waveform');

var _waveform2 = _interopRequireDefault(_waveform);

var _request = require('./request');

var _request2 = _interopRequireDefault(_request);

var _search = require('../controls/search');

var _search2 = _interopRequireDefault(_search);

var _toast = require('../controls/toast');

var _toast2 = _interopRequireDefault(_toast);

var _dashboard = require('../controls/dashboard');

var _dashboard2 = _interopRequireDefault(_dashboard);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

var _charts = require('../controls/charts');

var _charts2 = _interopRequireDefault(_charts);

var _constants = require('./constants');

var _constants2 = _interopRequireDefault(_constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SC = require('soundcloud'); // Import node module

// Soundcloud Properties 

// Oldest range (around 2007 onward)
var RAND_COUNT = 90000;
var OFFSET = 0;

// Going from 2010
var RAND_COUNT_1 = 7000000;
var OFFSET_1 = 3000000;

// More Recent
var RAND_COUNT_2 = 90000000;
var OFFSET_2 = 10000000;

// The fresh stuff
var RAND_COUNT_3 = 750000000;
var OFFSET_3 = 100000000;

// Widget Parameters
//const WIDGET_PARAMS = '&liking=false&show_artwork=false&show_comments=false&show_playcount=false&visual=false';
var WIDGET_PARAMS = '';

var Player = function () {

    /**
     * Sets up the the application variables and hooking events to controls.
     */
    function Player() {
        _classCallCheck(this, Player);

        // Enum for different repeat modes
        this.repeatMode = {
            REPEAT_NONE: 0,
            REPEAT_ONCE: 1,
            REPEAT_ALL: 2
        };

        // Initialize variables
        this.history = [];
        this.queue = []; // For tracks playing next
        this.isPlaying = false;
        this.curPlayer = null;
        this.curPosition = 0;
        this.curTrack = null; // Store track data. Updated in loadWidgetSong()
        this.waveform = null;
        this.isRepeating = this.repeatMode.REPEAT_NONE; // For repeating songs
        this.hasBeenFetched = false; // Used to stop duplicates during recursion
        this.timerUpdate = 0;
        this.isPlaylist = false; // Check if we are loading a playlist.
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

        // Initialize the dashboard, also initializes settings
        this.dashboard = new _dashboard2.default(this);

        // Initialize Search dialog
        this.searchDialog = new _search2.default(this);

        // Initialize the charts
        this.chartsDialog = new _charts2.default(this);

        // Settings already Initialized
        if (JSON.parse(_settings2.default.getPref('disableAnimations'))) {
            $(_settings2.default.disableAnimationsCSS).appendTo("head");
        }
        if (JSON.parse(_settings2.default.getPref('disableBlur'))) {
            $(_settings2.default.disableBlurCSS).appendTo("head");
        }

        // Load a track when the app is loaded (take url param into account).
        document.getElementById('widgettest').setAttribute('src', 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/170202151' + WIDGET_PARAMS);
        var iframeID = document.getElementById('widgettest');
        this.curPlayer = SC.Widget(iframeID);
        // Update the player
        this.bindWidgetEvents(this.curPlayer); // Bind event handlers for widget.

        // Check for params and then decide what to play
        this.checkParamsAndFetch();

        _utils2.default.log('construct done');
    }

    /**
     * Binds the page elements to JS objects so we can access them in other functions.
     */


    _createClass(Player, [{
        key: 'bindControlElements',
        value: function bindControlElements() {
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

    }, {
        key: 'bindControlEvents',
        value: function bindControlEvents() {
            var _this = this;

            this.playBtn.onclick = function (e) {
                // if (this.curPlayer === null && !this.isPlaying)
                //     this.updateStream(this.getRandomTrack());
                _this.togglePlay();

                // Check if song title matches title in app
                if ($('#songTitle').value !== _this.curPlayer.title) {
                    _this.curPlayer.getCurrentSound(function (song) {
                        _this.updateSongInfo(song);
                    });
                }
            };

            // Event handler for seeking forward / fetch new song
            this.btnFf.onclick = function (e) {
                if (_this.queue.length > 0 || _this.isPlaylist) {
                    _this.seekForward(); // Seek forward in queue
                } else {
                    // Else just load another song
                    _this.fetchNext();
                }
            };

            // Event handler for seeking back
            this.btnBk.onclick = function (e) {
                if (_this.curPosition > 10000) {
                    // If the song is past 10 seconds, reset song back to beginning (like in Spotify)
                    _this.restartSong();
                } else {
                    // Else, go to the last song
                    _this.seekBack();
                }
            };

            // Event handler to play custom song
            this.btnSearch.onclick = function (e) {
                _this.searchDialog.toggleSearchDialog();
            };

            // Event handler for repeats
            this.btnRepeat.onclick = function (e) {
                _this.toggleRepeatMode(null); // Toggle the value
            };

            // Event handler to show dashboard
            this.btnDashboard.onclick = function (e) {
                _this.dashboard.toggleDashboard();
            };

            // Bind keyboard shortcuts
            document.onkeydown = function (e) {
                if (e.keyCode == 32) {
                    // space key to toggle playback
                    var tag = e.target.tagName.toLowerCase();
                    if (tag != 'input') // Ignore the search field
                        _this.togglePlay();
                } else if (e.shiftKey && e.keyCode == 38) {
                    // shift up
                    _this.volumeUp(10);
                } else if (e.shiftKey && e.keyCode == 40) {
                    // shift down
                    _this.volumeDown(10);
                } else if (e.shiftKey && e.keyCode == 37) {
                    // shift left
                    if (_this.curPosition > 10000) {
                        // If the song is past 10 seconds, reset song back to beginning (like in Spotify)
                        _this.restartSong();
                    } else {
                        // Else, go to the last song
                        _this.seekBack();
                    }
                } else if (e.shiftKey && e.keyCode == 39) {
                    // shift right
                    if (_this.queue.length > 0 || _this.isPlaylist) {
                        _this.seekForward(); // Seek forward in queue
                    } else {
                        // Else just load another song
                        _this.fetchNext();
                    }
                }
            };
        }

        /**
         * Attempts to load information associated to the widget to local vars and displays them
         * @param {SoundCloudWidget} widget - widget loaded by API
         */

    }, {
        key: 'loadWidgetSong',
        value: function loadWidgetSong(widget) {
            var _this2 = this;

            try {
                _utils2.default.log('loadwidgetsong called');
                this.waveform = null; // Reset the reference
                widget.getCurrentSound(function (song) {
                    //Utils.log(song);
                    var rndImg = _utils2.default.fetchRandomImage();
                    _this2.updateSongInfo(song);

                    // Set the volume (player always resets to 100 again)
                    _this2.setVolume(_settings2.default.getPref('playerVolume'));

                    var found = false; // Boolean to see if the song exists
                    if (_this2.history.length > 0 || _this2.queue.length > 0) {
                        var songList = _this2.history.concat(_this2.queue); // Use this to prevent adding any duplicates
                        for (var i = 0; i < songList.length; i++) {
                            if (songList[i].track.id === song.id) {
                                found = true;
                            }
                        };

                        if (!found) {
                            // Append the song if not found
                            _this2.history.push({ id: song.id, track: song }); // Push the track so it can be replayed from history. 
                            var h = new _HistItem2.default(song.artwork_url === null ? rndImg : song.artwork_url, song, _this2, "javascript:alert('Download link unavailable');");
                            _this2.histContainer.appendChild(h.render()); // Append to history

                            $('.action-bar-item').click(function (e) {
                                // Stop button clicks from triggering playing the song
                                e.stopPropagation();
                            });
                        }
                    } else {
                        _this2.history.push({ id: song.id, track: song }); // Push the track so it can be replayed from history. 
                        var _h = new _HistItem2.default(song.artwork_url === null ? rndImg : song.artwork_url, song, _this2, "javascript:alert('Download link unavailable');");
                        _this2.histContainer.appendChild(_h.render()); // Append to history
                        $('.action-bar-item').click(function (e) {
                            // Stop button clicks from triggering playing the song
                            e.stopPropagation();
                        });
                    }

                    _this2.hasBeenFetched = false; // Reset

                    _utils2.default.log('getcurrentsound done');
                }, function (err) {
                    _utils2.default.log(err.message);
                });

                // Update the play state
                this.togglePlayState(true);

                // Not sure if needed
                $('.g-box-full').css({
                    display: 'none'
                });
                return;
            } catch (ex) {
                _utils2.default.log(ex.message);
            }
        }
    }, {
        key: 'updateSongInfo',
        value: async function updateSongInfo(song) {
            var _this3 = this;

            _utils2.default.log('getcurrentsound start');
            //if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) { // Attempt to fix on mobile devices

            // Sorry cannot auto play on mobile =_(
            // https://stackoverflow.com/questions/26066062/autoplay-html5-audio-player-on-mobile-browsers
            // Need to use trick.
            // widget.play();
            // setTimeout(() => {
            //         $('#play-btn').trigger('click'); // Cannot fix autoplay issue, but now users can play the track with 1 tap of the play button instead o several (bug fix)
            //         Utils.log('test play')
            //     }, 2000);
            // this.togglePlayState(true);
            //this.curPlayer.play(); // Extra call for forcing auto playing in mobile

            // Android app workaround https://developer.android.com/reference/android/webkit/WebSettings.html
            //}
            this.curPlayer.play(); // Play normally on non mobile
            this.togglePlayState(true);

            this.curTrack = song;

            this.isPlaying = true;
            var rndImg = _utils2.default.fetchRandomImage();
            this.widgetTrack.cover = song.artwork_url;
            this.widgetTrack.title = song.title;
            this.widgetTrack.id = song.id;
            this.widgetTrack.artist = song.user.username || 'N/A'; // Some tracks don't have a usernme associated
            this.widgetTrack.permalink_url = song.permalink_url;
            this.widgetTrack.description = song.description || 'N/A';
            this.widgetTrack.created_at = song.created_at;
            this.widgetTrack.duration = song.duration || 'N/A';
            this.widgetTrack.currentPosition = 0;
            this.widgetTrack.song = song;

            document.title = '\u25B6   Nimbus - ' + this.widgetTrack.title;

            // Create tag list
            var tagBtns = '';
            var tagCollection = song.tag_list;

            // Get tags that are inside quotes already (treat multiple words as 1 tag)
            var quotedTags = song.tag_list.match(/(["'])(?:(?=(\\?))\2.)*?\1/g);

            // Clean the original list
            tagCollection = tagCollection.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, ''); // Remove all double quoted entries
            tagCollection = tagCollection.split(' ');
            tagCollection = tagCollection.concat(quotedTags);

            if (song.tag_list !== '') {
                for (var i = 0; i < tagCollection.length; i++) {
                    var tagName = tagCollection[i];
                    if (tagName !== '' && tagName !== null) {
                        tagName = tagName.replace(/\"/g, '');
                        tagBtns += '<a href="https://soundcloud.com/tags/' + tagName + '" target="_blank" rel="noopener noreferrer"><button class="btn-transparent">\n                        #' + tagName + '\n                    </button></a>\n                    ';
                    }
                }
            }

            this.mainPlayer.innerHTML = (0, _songinfo2.default)(song.artwork_url === null ? song.user.avatar_url : song.artwork_url.replace('large', 't500x500'), song, tagBtns, "javascript:alert('Purchase link unavailable');");
            document.getElementById('background').style.backgroundImage = 'url(' + (song.artwork_url === null ? rndImg : song.artwork_url.replace('large', 't500x500')) + ')';

            // Add listener for flipContainer
            this.flipContainer = document.getElementById('flipContainer');
            this.flipContainer.onclick = function (e) {
                $('#flipContainer').toggleClass('flipped');
            };

            this.volumeSlider = document.getElementById('volumeSlider');

            // Set up events to check if it is a mobile device or desktop
            var isTouchSupported = 'ontouchstart' in window;
            var startEvent = isTouchSupported ? 'touchstart' : 'mousedown';
            var moveEvent = isTouchSupported ? 'touchmove' : 'mousemove';
            var endEvent = isTouchSupported ? 'touchend' : 'mouseup';

            this.volumeSlider.addEventListener(startEvent, function () {
                _this3.setVolume(_this3.volumeSlider.value);
                _this3.volumeSlider.addEventListener(moveEvent, function () {
                    _this3.setVolume(_this3.volumeSlider.value);
                });
            }, false);

            this.volumeSlider.addEventListener(endEvent, function () {
                _this3.volumeSlider.addEventListener(moveEvent, function () {
                    _this3.setVolume(_this3.volumeSlider.value);
                });
            }, false);

            // Async method to build waveform
            //(async function() { // Changed syntax to fix issue on Safari
            var req = new _request2.default(); // Construct it
            var data = await req.getJSON(song.waveform_url);
            _utils2.default.log(song.waveform_url);

            // Draw the waveform
            var waveFormContainer = document.querySelector('.waveform');
            if (!this.waveform) {
                this.waveform = new _waveform2.default({
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
            //}).bind(this)();
        }

        /**
         * The starting point of the application called by app.js. This initalizes the SoundCloud API.
         */

    }, {
        key: 'start',
        value: function start() {
            try {
                SC.initialize({
                    client_id: _constsSec2.default.client_id
                });
            } catch (e) {
                _utils2.default.log('Error initializing SoundCloud API. Stack trace: ' + e.toString());
            }
            _utils2.default.log('SoundCloud API initalized!');
        }

        /**
         * Bind event handlers to the widget
         * @param {SoundCloudWidget} widget - widget loaded from API
         */

    }, {
        key: 'bindWidgetEvents',
        value: function bindWidgetEvents(widget) {
            var _this4 = this;

            this.curPlayer = widget;
            widget.bind(SC.Widget.Events.READY, function (e) {

                // Bind when the song is playing
                widget.bind(SC.Widget.Events.PLAY_PROGRESS, function (e) {
                    _this4.curPosition = e.currentPosition;
                    var curTimeStr = _utils2.default.convertMillisecondsToDigitalClock(e.currentPosition).clock;
                    var totalTimeStr = _utils2.default.convertMillisecondsToDigitalClock(_this4.widgetTrack.duration).clock;
                    document.getElementById('curTime').innerText = curTimeStr + ' / ' + totalTimeStr;

                    // For some reason FINISH event no longer fires when changing songs in playlist, manual override here
                    if (e.currentPosition === 0) {
                        if (_this4.isPlaylist && _this4.isRepeating === _this4.repeatMode.REPEAT_NONE && !_this4.seekingForward) {
                            _this4.loadWidgetSong(_this4.curPlayer); // Update track info to the next song in the playlist
                        } else if (_this4.isPlaylist && _this4.isRepeating !== _this4.repeatMode.REPEAT_NONE && !_this4.seekingForward) {
                            // Replay set
                            _this4.curPlayer.pause();
                            // Song already repeated once, change to no repeat and remove badge
                            if (_this4.isRepeating === _this4.repeatMode.REPEAT_ONCE) {
                                _this4.toggleRepeatMode(_this4.repeatMode.REPEAT_NONE); // Set the repeat mode to none
                            }
                            setTimeout(function () {
                                _this4.curPlayer.prev();
                                _this4.loadWidgetSong(_this4.curPlayer);
                            }, 500);
                        } else if (_this4.seekingForward) {
                            _this4.curPlayer.seekTo(1);
                            setTimeout(function () {
                                _this4.seekingForward = false, 500;
                            }); // Prevent this event from firing more than once.
                        }
                    }
                });

                // Bind when the song has finished
                widget.bind(SC.Widget.Events.FINISH, function (e) {
                    // When the song finishes, we need to find a new song to play.
                    _utils2.default.log('finished');
                    _this4.isPlaying = false;

                    // Check if user is playing a playlist and not repeating
                    if (_this4.isPlaylist && _this4.isRepeating === _this4.repeatMode.REPEAT_NONE) {
                        var oldSongID = _this4.widgetTrack.id;
                        _this4.togglePlay();
                        _this4.loadWidgetSong(_this4.curPlayer); // Update track info to the next song in the playlist
                        _this4.isPlaying = false;
                        setTimeout(function () {
                            // Check if we have reached the end of the playlist
                            if (oldSongID === _this4.widgetTrack.id) {
                                // If the last song we played has the same ID as the new one, fetch a new song. (SoundCloud ends up looping the last song again)
                                _this4.isPlaylist = false;
                                _this4.setCurIndex = 0;
                                _this4.setTrackCount = 0;
                                _this4.fetchNext();
                            } else {
                                _this4.restartSong();
                                _this4.togglePlay();
                                _this4.curPlayer.play();
                            }
                        }, 200);
                        return;
                    }

                    // Check if repeat is on first. TODO: Make it work with playlists
                    if (_this4.isRepeating !== _this4.repeatMode.REPEAT_NONE) {
                        if (_this4.isPlaylist) {
                            // If we are repeating in a playlist, we need to go back to previous song since the API preloads the next one
                            _this4.restartSong();
                            _this4.curPlayer.pause();
                            _this4.curPlayer.pause();
                            setTimeout(_this4.curPlayer.prev(), 200);
                        } else {
                            // Else we can just restart the song (API does not preload song)
                            _this4.restartSong();
                            _this4.togglePlay();
                        }
                        if (_this4.isRepeating === _this4.repeatMode.REPEAT_ONCE) {
                            _this4.toggleRepeatMode(_this4.repeatMode.REPEAT_NONE); // Set the repeat mode to none
                        }
                        return;
                    }

                    // Check if the queue is not empty and play whatever song that is next in the queue (for non-repeating modes)
                    if (_this4.queue.length > 0) {
                        var nextSong = _this4.queue.pop(); // Pop the next song

                        if (nextSong) {
                            // If not null
                            _this4.curPlayer.load(nextSong.track.permalink_url);
                            setTimeout(function () {
                                return _this4.loadWidgetSong(_this4.curPlayer);
                            }, 2000); // Update player info, song will be added to history here
                        }
                    } else if (!_this4.hasBeenFetched) {
                        // If we have fetched a song already, do not fetch another one.
                        _this4.fetchNext();
                        _this4.hasBeenFetched = true;
                    }
                });

                // Bind play state event
                widget.bind(SC.Widget.Events.PLAY, function (e) {
                    _this4.togglePlayState(true);
                });

                // Bind pause state event
                widget.bind(SC.Widget.Events.PAUSE, function (e) {
                    _this4.togglePlayState(false);
                });

                // Throw error in case user enters invalid URL
                widget.bind(SC.Widget.Events.ERROR, function (e) {
                    alert('Error, unable to load resource.');
                });
            });
        }

        /**
         * This function is designed to get a random track from SoundCloud
         */

    }, {
        key: 'getRandomTrack',
        value: function getRandomTrack() {
            try {
                // Choose to use old track ids or new track ids
                var chooseId = Math.floor(Math.random() * 10);
                var trackId = 0;

                // Generate random song id. Give slight preference to newer tracks 
                if (chooseId > 4) {
                    trackId = Math.floor(Math.random() * RAND_COUNT_3 + OFFSET_3);
                } else if (chooseId > 2) {
                    trackId = Math.floor(Math.random() * RAND_COUNT_2 + OFFSET_2);
                } else if (chooseId > 1) {
                    trackId = Math.floor(Math.random() * RAND_COUNT_1 + OFFSET_1);
                } else {
                    trackId = Math.floor(Math.random() * RAND_COUNT + OFFSET);
                }

                return trackId;
            } catch (e) {
                _utils2.default.log('getRandomTrack() - ' + e.toString());
            }
        }

        /**
         * Extracts address paramters by name and loads the appropriate content.
         * 
         * 
         * @memberof Player
         */

    }, {
        key: 'checkParamsAndFetch',
        value: function checkParamsAndFetch() {
            // Fetch param values if present
            var id = this.getURLParamsByName('id', window.location.href);
            var url = this.getURLParamsByName('url', window.location.href);

            // Do not fetch a random song if an id was already provided
            if (id) // id takes takes precedence
                this.streamSong(id);else if (url) this.curPlayer.load(url); // Load the song by url (Widget API takes care of the rest)
            else this.fetchNext();
        }

        /**
         * Update the UI controls for when the song is playing
         * @param {boolean} playing - if the song is playing or not
         */

    }, {
        key: 'togglePlayState',
        value: function togglePlayState(playing) {
            if (playing) {
                this.playBtn.innerHTML = '<i class="fa fa-pause" aria-hidden="true"></i>';
                document.title = '\u25B6   Nimbus - ' + this.widgetTrack.title;
            } else {
                this.playBtn.innerHTML = '<i class="fa fa-play" aria-hidden="true"></i>';
                document.title = '\u23F8   Nimbus - ' + this.widgetTrack.title;
            }
        }

        // UTIL functions
        /**
         * Seek to next song in queue
         */

    }, {
        key: 'seekForward',
        value: function seekForward() {
            var _this5 = this;

            // If we are in playlist mode, play the next song in the playlist and do not fetch a new song
            _utils2.default.log("seekForward() called");
            if (this.isPlaylist) {
                var nextSongID = this.widgetTrack.id;
                this.seekingForward = true;
                this.restartSong();
                this.curPlayer.pause();
                this.curPlayer.pause(); // Widget not really responsive when user goes back and forth quickly
                setTimeout(this.curPlayer.next(), 200);
                this.restartSong(); // Seems weird to call restartSong() so many times, but this is used to reset the songs and avoid the weird bug where the player plays 2 songs simulatenously.
                this.curPlayer.play();
                this.curPlayer.pause(); // Same interrupted Promise issue from API
                this.curPlayer.play();
                setTimeout(function () {
                    _this5.loadWidgetSong(_this5.curPlayer);
                    setTimeout(function () {
                        _utils2.default.log(_this5.widgetTrack.id + ' - ' + nextSongID);
                        if (_this5.widgetTrack.id === nextSongID) {
                            // If we have reached the end of the playlist
                            _this5.isPlaylist = false;
                            _this5.setCurIndex = 0;
                            _this5.setTrackCount = 0;
                            _this5.fetchNext();
                        }
                    }, 200);
                }, 200);
            } else {
                var nextSong = this.queue.pop(); // Pop the next song
                if (nextSong) {
                    // If not null
                    if (nextSong.track.kind === 'playlist') this.isPlaylist = true;
                    this.curPlayer.load(nextSong.track.permalink_url);
                    setTimeout(function () {
                        return _this5.loadWidgetSong(_this5.curPlayer);
                    }, 2000); // Update player info, will add song to history
                }
            }
        }

        /**
         * Rewind to previous song
         */

    }, {
        key: 'seekBack',
        value: function seekBack() {
            var _this6 = this;

            // this.isPlaylist = false; // Exit playlist mode so we don't end up stuck in a loop with songs
            // If we are in a playlist, simply move back to the previous song
            if (this.isPlaylist) {
                var lastSongID = this.widgetTrack.id;
                this.restartSong();
                this.curPlayer.pause();
                this.curPlayer.pause();
                setTimeout(this.curPlayer.prev(), 200); // Player not cooperating with async
                this.restartSong(); // Seems weird to call restartSong() so many times, but this is used to reset the songs and avoid the weird bug where the player plays 2 songs simulatenously.
                setTimeout(function () {
                    _this6.loadWidgetSong(_this6.curPlayer);
                    setTimeout(function () {
                        _utils2.default.log(_this6.widgetTrack.id + ' - ' + lastSongID);
                        if (_this6.widgetTrack.id === lastSongID) {
                            // If we have reached the beginning of the playlist
                            _this6.loadPreviousSong();
                        }
                    }, 200); // Needed to be done to allow time for async request to complete in loadWidgetSong()
                }, 200);
                this.curPlayer.play();
                this.curPlayer.pause(); // Same interrupted Promise issue from API
                this.curPlayer.play();
                return;
            }
            _utils2.default.log('not playlist');

            this.loadPreviousSong();
        }

        /**
         * Load the previous song from the history collection.
         * 
         * @memberof Player
         */

    }, {
        key: 'loadPreviousSong',
        value: function loadPreviousSong() {
            var _this7 = this;

            this.isPlaylist = false;

            if (this.history.length === 1) return;

            // Pop current song and add it to queue so it is our next song
            this.queue.push(this.history.pop());
            var prevSong = this.history[this.history.length - 1].track;

            if (prevSong) {
                // If not null
                this.curPlayer.load(prevSong.permalink_url);
                _utils2.default.log(prevSong.permalink_url);
                setTimeout(function () {
                    return _this7.loadWidgetSong(_this7.curPlayer);
                }, 2000); // Update player info
            }
        }

        /**
         * Resets the song back to 0
         */

    }, {
        key: 'restartSong',
        value: function restartSong() {
            this.curPlayer.seekTo(0);
        }

        /**
         * Increases the volume with the maximum bound being 100.
         * @param {float} offset - how much to increase the volume by
         */

    }, {
        key: 'volumeUp',
        value: function volumeUp(offset) {
            var _this8 = this;

            this.curPlayer.getVolume(function (vol) {
                var newVol = Math.min(100, vol + offset);
                _this8.setVolume(newVol);
            });
        }

        /**
         * Lowers the volume by offset with the minimum bound being 0.
         * @param {float} offset - how much to lower the volume by
         */

    }, {
        key: 'volumeDown',
        value: function volumeDown(offset) {
            var _this9 = this;

            this.curPlayer.getVolume(function (vol) {
                var newVol = Math.max(0, vol - offset);
                _this9.setVolume(newVol);
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

    }, {
        key: 'setVolume',
        value: function setVolume(vol) {
            this.curPlayer.setVolume(vol);
            this.volumeSlider.value = vol;
            _settings2.default.storePref('playerVolume', vol);
        }

        /**
         * Updates controls to show that the song is in progress.
         */

    }, {
        key: 'togglePlay',
        value: function togglePlay() {
            if (!this.isPlaying) {
                // Nuanced but adds that 'break' in the sound so you know it was pressed just in case isPlaying is the wrong value
                this.curPlayer.play();
                _utils2.default.log('isPlaying = true');
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

    }, {
        key: 'fetchNext',
        value: function fetchNext() {
            var _this10 = this;

            _utils2.default.log("fetchNext() called");
            try {
                _utils2.default.log('Queue length - ' + this.queue.length);
                if (this.queue.length > 0) {
                    // First check if the queue is non-empty
                    var nextSong = this.queue.pop(); // Pop the next song

                    _utils2.default.log(nextSong);

                    if (nextSong) {
                        // If not null
                        if (nextSong.track.kind === 'playlist') {
                            this.isPlaylist = true;
                            _utils2.default.log('is playlist');
                            this.history.push({ id: nextSong.id, track: nextSong.track }); // Add it to history
                            _utils2.default.log(nextSong.track.permalink_url);
                            this.curPlayer.load(nextSong.track.permalink_url);
                        } else {
                            this.history.push({ id: nextSong.id, track: nextSong }); // Add it to history
                            _utils2.default.log(nextSong.permalink_url);
                            this.curPlayer.load(nextSong.permalink_url);
                        }

                        setTimeout(function () {
                            return _this10.loadWidgetSong(_this10.curPlayer);
                        }, 2000); // Update player info
                        return;
                    }
                } else {
                    // If the queue is empty, fetch a new song
                    this.curPlayer.pause();
                    this.restartSong();
                }
            } catch (e) {
                _utils2.default.log('fetchNext' + e.toString());
            }

            if (this.isPlaylist) // If in a playlist, do not load more tracks from server
                return;

            if (_settings2.default.getPref('shuffleMode') === _constants2.default.getShuffleMode().RELATED && this.curTrack !== null && this.queue.length <= 0) this.getRelatedTracks(this.curTrack.id, 50);else // Make sure length of queue is empty before fetching again
                this.loadRandomTrack();
        }

        /**
         * Loads a random track by id and requests from API
         * 
         * @memberof Player
         */

    }, {
        key: 'loadRandomTrack',
        value: function loadRandomTrack() {
            var _this11 = this;

            var id = this.getRandomTrack(); // Works for tracks with 403 errors in other API

            SC.get('/tracks/' + id).then(function (track) {
                // Check if there are results
                // Really just designed to check if the song actually exists
                _this11.streamSong(id);
            }, function (err) {
                _utils2.default.log(err.status);
                // if (err.status === 0) { // Invalid API key
                //     Utils.log('0/401 Unauthorized. Possible Invalid SoundCloud key')
                //     throw '0/401 Unauthorized. Possible Invalid SoundCloud key'
                // }
                if (err.status === 403) {
                    // Play the song anyway even if this API requiest returns a forbidden request (Soundcloud problem)
                    _this11.streamSong(id);
                    return;
                }
                // If there is no song with the associated ID, fetch a new one.
                _utils2.default.log('track fetch fail' + id);
                _this11.fetchNext();
                _utils2.default.log('track fetch fail post' + id);
            }).catch(function (err) {
                _utils2.default.log(err.status);
                if (err.status === 0) {
                    // Invalid API key
                    _utils2.default.log('0/401 Unauthorized. Possible Invalid SoundCloud key');
                }
                if (err.status === 403) {
                    // Play the song anyway even if this API requiest returns a forbidden request (Soundcloud problem)
                    _this11.streamSong(id);
                    return;
                }
                // If there is no song with the associated ID, fetch a new one.
                _this11.fetchNext();
            });
        }

        /**
         * Stream the song when a valid id is found
         * @param {int} id - holds the song id
         */

    }, {
        key: 'streamSong',
        value: function streamSong(id) {
            var _this12 = this;

            _utils2.default.log('track fetch success ' + id);
            this.curPlayer.load('https%3A//api.soundcloud.com/tracks/' + id + WIDGET_PARAMS);
            this.togglePlayState(true);
            setTimeout(function () {
                return _this12.loadWidgetSong(_this12.curPlayer);
            }, 2000);
        }

        /**
         * Find the song based on user entered keywords, like 'I'm Feeling Lucky' on Google.
         * 
         * @param {String} query - search terms to find song
         * 
         * @memberof Player
         */

    }, {
        key: 'getTrackByKeyWord',
        value: function getTrackByKeyWord(query) {
            var _this13 = this;

            // Get a list of songs by the search query and play first choice
            try {
                var options = this.createOptionsWithDuration({ q: query }); // Build the options object
                SC.get('/tracks', options).then(function (tracks) {
                    if (tracks.length > 0) {
                        _utils2.default.log(tracks, 'keyword');
                        if (_this13.shuffleQueue) {
                            var randIndex = Math.floor(Math.random() * tracks.length);
                            // Pick a random song to play
                            _this13.queue.unshift({ id: tracks[randIndex].id, track: tracks[randIndex] });
                            _utils2.default.showToast('Added ' + tracks[randIndex].title + ' to the queue.');
                        } else {
                            // Load the first song
                            _this13.queue.unshift({ id: tracks[0].id, track: tracks[0] }); // The "I'm feeling lucky part of the search"
                            _utils2.default.showToast('Added ' + tracks[0].title + ' to the queue.');
                        }

                        // Load the song immediately if the user is not playing music
                        if (!_this13.isPlaying) _this13.seekForward();
                    }
                }).catch(function (e) {
                    // Testing
                    _utils2.default.log('getTrackByKeyWord (promise) Error - ' + e.message);
                });
            } catch (e) {
                _utils2.default.log('getTrackByKeyWord Error - ' + e.message);
            }
        }

        /**
         * Fetches tracks by a list of tags from the user separated by commas.
         * 
         * @param {string} tagList - a string with tags separated by commas
         * 
         * @memberof Player
         */

    }, {
        key: 'getTracksByTags',
        value: function getTracksByTags(tagList) {
            var _this14 = this;

            try {
                // Create options object to hold what we want to search for
                var options = this.createOptionsWithDuration({
                    tags: tagList,
                    limit: this.queueNum
                }); // Build the options object

                SC.get('/tracks', options).then(function (tracks) {
                    if (tracks.length > 0) {
                        _utils2.default.log(tracks, 'tags');

                        var trackCollection = null;
                        if (_this14.shuffleQueue) trackCollection = _this14.shuffleTracks(tracks);else trackCollection = tracks;
                        // Queue all tracks to the queue of the user's playlist. Note that queue is actually acting like a stack since we use push() and pop()
                        for (var i = 0; i < trackCollection.length; i++) {
                            // Skip the first one since we are already playing it at this point (need to subtract upper bound by 1 since we want to exclude the first track from the reversed array)
                            _this14.queue.unshift({ id: trackCollection[i].id, track: trackCollection[i] });
                            _utils2.default.log(tracks[i].title);
                        }

                        // Load the song immediately if the user is not playing music
                        if (!_this14.isPlaying) _this14.seekForward();
                        // this.curPlayer.load(trackCollection[trackCollection.length - 1].permalink_url);

                        // Display toast message when done
                        _utils2.default.showToast(tracks.length + ' tracks added to the queue.');
                    } else {
                        _utils2.default.showToast('Search returned no results. Please try again.');
                    }
                });
            } catch (e) {
                _utils2.default.log('getTracksByTags Error - ' + e.message);
            }
        }

        /**
         * Searches for a playlist by keyword.
         * 
         * @param {String} query - name of the playlist
         * 
         * @memberof Player
         */

    }, {
        key: 'getSetByKeyWord',
        value: function getSetByKeyWord(query) {
            var _this15 = this;

            try {
                SC.get('/playlists', { q: query }).then(function (sets) {
                    if (sets.length > 0) {
                        _utils2.default.log(query, 'playlist');
                        if (_this15.shuffleQueue) {
                            // If we want to shuffle the results
                            // Load the set
                            var resIndex = Math.floor(Math.random() * (sets.length + 1));
                            _this15.queue.unshift({ id: sets[resIndex].id, track: sets[resIndex] }); // The "I'm feeling lucky part of the search"
                            _this15.setTrackCount = sets[resIndex].track_count;
                            _utils2.default.showToast('Now playing ' + sets[resIndex].title + ' (' + _this15.setTrackCount + ' songs)');
                        } else {
                            // Load the set
                            _this15.queue.unshift({ id: sets[0].id, track: sets[0] }); // The "I'm feeling lucky part of the search"
                            _this15.setTrackCount = sets[0].track_count;
                            _utils2.default.log(sets[0]);
                            _utils2.default.showToast('Queued ' + sets[0].title + ' (' + _this15.setTrackCount + ' songs)');
                        }

                        // Load the song immediately if the user is not playing music
                        if (!_this15.isPlaying) _this15.seekForward();
                    }
                });
            } catch (e) {
                _utils2.default.log('getSetByKeyWord Error - ' + e.message);
            }
        }

        /**
         * Searches for the first queueNum songs by a user.
         * 
         * @param {String} user - username of the user
         * 
         * @memberof Player
         */

    }, {
        key: 'getTracksByUser',
        value: function getTracksByUser(user) {
            var _this16 = this;

            try {
                SC.resolve('https://soundcloud.com/' + user).then(function (response) {
                    try {
                        // Create options object to hold what we want to search for
                        var options = _this16.createOptionsWithDuration({ limit: _this16.queueNum });

                        SC.get('/users/' + response.id + '/tracks', options).then(function (tracks) {
                            _utils2.default.log(tracks, 'user');
                            if (tracks.length > 0) {

                                var trackCollection = null;
                                if (_this16.shuffleQueue) trackCollection = _this16.shuffleTracks(tracks);else trackCollection = tracks;

                                // Queue all tracks to the queue of the user's playlist. Note that queue is actually acting like a stack since we use push() and pop()
                                for (var i = 0; i < trackCollection.length; i++) {
                                    // Skip the first one since we are already playing it at this point (need to subtract upper bound by 1 since we want to exclude the first track from the reversed array)
                                    _this16.queue.unshift({ id: trackCollection[i].id, track: trackCollection[i] });
                                }

                                // Load the song immediately if the user is not playing music
                                if (!_this16.isPlaying) _this16.seekForward();
                                // this.curPlayer.load(trackCollection[trackCollection.length - 1].permalink_url); // Top of the result

                                // Display toast message when done
                                _utils2.default.showToast(tracks.length + ' tracks added to the queue.');
                            } else {
                                _utils2.default.showToast('Search returned no results. Please try again.');
                            }
                        });
                    } catch (e) {
                        _utils2.default.log('getSongsByUser Error - ' + e.message);
                    }
                });
            } catch (e) {
                _utils2.default.log(e);
            }
        }

        /**
         * Searches for songs by genres (string of genres separated by commas)
         * 
         * @param {String} genreList - comma separated list of genres
         * 
         * @memberof Player
         */

    }, {
        key: 'getTracksByGenres',
        value: function getTracksByGenres(genreList) {
            var _this17 = this;

            try {
                // Create options object to hold what we want to search for
                var options = this.createOptionsWithDuration({
                    genres: genreList,
                    limit: this.queueNum
                });

                SC.get('/tracks', options).then(function (tracks) {
                    _utils2.default.log(tracks, 'genre');
                    if (tracks.length > 0) {

                        var trackCollection = null;
                        if (_this17.shuffleQueue) trackCollection = _this17.shuffleTracks(tracks);else trackCollection = tracks;

                        // Queue all tracks to the queue of the user's playlist. Note that queue is actually acting like a stack since we use push() and pop()
                        for (var i = 0; i < trackCollection.length; i++) {
                            // Skip the first one since we are already playing it at this point (need to subtract upper bound by 1 since we want to exclude the first track from the reversed array)
                            _this17.queue.unshift({ id: trackCollection[i].id, track: trackCollection[i] });
                        }

                        // Load the song immediately if the user is not playing music
                        if (!_this17.isPlaying) _this17.seekForward();
                        // this.curPlayer.load(trackCollection[trackCollection.length - 1].permalink_url);

                        // Display toast message when done
                        _utils2.default.showToast(tracks.length + ' tracks added to the queue.');
                    } else {
                        _utils2.default.showToast('Search returned no results. Please try again.');
                    }
                });
            } catch (e) {
                _utils2.default.log('getSongsByGenres Error - ' + e.message);
            }
        }

        /**
         * Get songs from SoundCloud charts via API.
         * 
         * @param {any} _kind - whether if it is top songs or new songs
         * @param {any} _genres - genre of the chart
         * @param {any} _limit - how many songs to queue
         * @param {number} [$_partition=1] - page partitions
         * @memberof Player
         */

    }, {
        key: 'getTracksFromCharts',
        value: function getTracksFromCharts(_kind, _genres, _limit) {
            var _this18 = this;

            var $_partition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

            // kind=top&genre=soundcloud%3Agenres%3Aall-music&limit=50
            try {

                $.ajax({
                    url: _constants2.default.getChartsWaypoint(), //This is the current doc
                    type: "GET",
                    dataType: 'json', // add json datatype to get json
                    data: {
                        kind: _kind,
                        genre: _genres,
                        limit: _limit,
                        linked_partitioning: $_partition,
                        client_id: _constsSec2.default.client_id
                    },
                    success: function success(data) {
                        _utils2.default.log(data, 'charts');
                        var trackCollection = null;
                        if (_this18.shuffleQueue) trackCollection = _this18.shuffleTracks(data.collection);else trackCollection = data.collection;

                        for (var i = 0; i < trackCollection.length; i++) {
                            _this18.queue.unshift({ id: trackCollection[i].track.id, track: trackCollection[i].track }); // This needs the track identifier
                        }

                        _utils2.default.log(trackCollection);

                        // Load the song immediately if the user is not playing music
                        if (!_this18.isPlaying) _this18.seekForward();

                        // Display toast message when done
                        _utils2.default.showToast(trackCollection.length + ' tracks added to the queue.');
                    }
                });
            } catch (e) {
                _utils2.default.log('getTracksFromCharts Error - ' + e.message);
            }
        }

        /**
         * Get songs that are related to the one that is just played when the queue is empty.
         * 
         * @param {any} _id - the id of the song last played
         * @param {any} _limit - how many results to add
         * @memberof Player
         */

    }, {
        key: 'getRelatedTracks',
        value: function getRelatedTracks(_id, _limit) {
            var _this19 = this;

            try {

                $.ajax({
                    url: _constants2.default.getRelatedWaypoint(), //This is the current doc
                    type: "GET",
                    dataType: 'json', // add json datatype to get json
                    data: {
                        id: _id,
                        limit: _limit,
                        client_id: _constsSec2.default.client_id
                    },
                    success: function success(data) {
                        var trackCollection = null;
                        _utils2.default.log(data, 'related');
                        if (_this19.shuffleQueue) trackCollection = _this19.shuffleTracks(data.collection);else trackCollection = data.collection.reverse();

                        for (var i = 0; i < trackCollection.length; i++) {
                            _this19.queue.push({ id: trackCollection[i].id, track: trackCollection[i] }); // This needs the track identifier
                        }

                        _utils2.default.log(trackCollection);

                        // Display toast message when done
                        _utils2.default.showToast(trackCollection.length + ' tracks related to ' + _this19.curTrack.title + ' added to the queue.');

                        // Stream the song
                        var track = _this19.queue.pop();
                        _utils2.default.log('fetching first track from related ' + track.id);
                        _this19.curPlayer.load('https%3A//api.soundcloud.com/tracks/' + track.id + WIDGET_PARAMS);
                        _this19.togglePlayState(true);
                        setTimeout(function () {
                            return _this19.loadWidgetSong(_this19.curPlayer);
                        }, 1000);
                    }
                });
            } catch (e) {
                _utils2.default.log('getRelatedTracks Error - ' + e.message);
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

    }, {
        key: 'historyContainsId',
        value: function historyContainsId(id) {
            var found = false;
            for (var i = 0; i < this.history.length; i++) {
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

    }, {
        key: 'getURLParamsByName',
        value: function getURLParamsByName(name, url) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }

        /**
         * Helper method designed to shuffle a collection of tracks
         * 
         * @param {any} tracks - collection we want to shuffle
         * @returns - shuffled collection o songs
         * @memberof Player
         */

    }, {
        key: 'shuffleTracks',
        value: function shuffleTracks(tracks) {
            var temp = null;
            _utils2.default.log('shuffling tracks');
            // Using in place Durstenfeld shuffle
            for (var i = tracks.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1)); // Generate a random index [0...i]
                temp = tracks[i]; // Start swapping
                tracks[i] = tracks[j];
                tracks[j] = temp;
            }

            return tracks;
        }

        /**
         * Cycles through 3 different repeat modes.
         * 
         * @param {any} repeat - the repeat mode we want to switch to
         * @memberof Player
         */

    }, {
        key: 'toggleRepeatMode',
        value: function toggleRepeatMode(repeat) {
            if (repeat === null) // Shortcut syntax using || does not work
                repeat = (this.isRepeating + 1) % 3; // If the repeatMode passed in is null, just cycle through the modes
            switch (repeat) {
                case this.repeatMode.REPEAT_NONE:
                    this.isRepeating = this.repeatMode.REPEAT_NONE;
                    this.btnRepeat.style.color = 'inherit';
                    $('#repeat-btn').removeClass('badge');
                    break;
                case this.repeatMode.REPEAT_ONCE:
                    this.isRepeating = this.repeatMode.REPEAT_ONCE;
                    this.btnRepeat.style.color = '#ff2160';
                    $('#repeat-btn').addClass('badge'); // Show the 1 badge
                    break;
                default:
                    this.isRepeating = this.repeatMode.REPEAT_ALL;
                    this.btnRepeat.style.color = '#ff2160';
                    $('#repeat-btn').removeClass('badge');
            }
        }

        /**
         * Helper function to correctly build the durations entry when searching for songs in other functions
         * 
         * @param {any} options - the options object to inject duration to.
         * @returns - the options object with new entry for song duration 
         * @memberof Player
         */

    }, {
        key: 'createOptionsWithDuration',
        value: function createOptionsWithDuration(options) {

            // Set duration object props based on settings
            if (_settings2.default.getPref('durationFilter') === _constants2.default.getDurationFilter.EPIC) {
                var duration = {
                    from: _constants2.default.getDurationValues(_settings2.default.getPref('durationFilter')).from
                };
                options['duration'] = duration; // Add property to object
            } else if (_settings2.default.getPref('durationFilter') !== _constants2.default.getDurationFilter().ANY) {
                var _duration = {
                    from: _constants2.default.getDurationValues(_settings2.default.getPref('durationFilter')).from,
                    to: _constants2.default.getDurationValues(_settings2.default.getPref('durationFilter')).to
                };
                options['duration'] = _duration; // Add property to object
            }
            return options;
        }

        /**
         * Clears the history from the history list.
         * 
         * @memberof Player
         */

    }, {
        key: 'clearHistory',
        value: function clearHistory() {
            this.histContainer.innerHTML = '<div class="content">\n                                            <h6 class="text-center uppercase">History</h6>\n                                        </div>'; // Clear the UI elements
            this.history = []; // Set history to an empty list

            var rndImg = _utils2.default.fetchRandomImage();
            this.history.push({ id: this.widgetTrack.id, track: this.widgetTrack.song }); // Push the track so it can be replayed from history. 
            var h = new _HistItem2.default(this.widgetTrack.song.artwork_url === null ? rndImg : this.widgetTrack.song.artwork_url, this.widgetTrack.song, this, "javascript:alert('Download link unavailable');");
            this.histContainer.appendChild(h.render()); // Append to history

            _utils2.default.showToast('History cleared');
        }
    }]);

    return Player;
}();

exports.default = Player;