"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _constants = require("./constants");

var _constants2 = _interopRequireDefault(_constants);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Settings = function () {
    function Settings() {
        _classCallCheck(this, Settings);
    }

    _createClass(Settings, null, [{
        key: "loadPrefs",
        value: function loadPrefs() {
            this.disableAnimationsCSS = "<style id='disableAnimations'>* {transition: none !important; -webkit-transition: none; !important}</style>";
            this.disableBlurCSS = "<style id='disableBlur'>#histItemBg {-webkit-filter: brightness(.5) !important;filter: brightness(.5) !important; } #background {-webkit-filter: brightness(.8) !important;filter: brightness(.8) !important; }</style>";

            // Default settings object
            this._settings = {
                disableAnimations: false,
                disableBlur: false,
                playerVolume: 100,
                debug: false,
                shuffleMode: _constants2.default.getShuffleMode().RANDOM,
                durationFilter: _constants2.default.getDurationFilter().ANY
            };

            this.updateSettings();
        }
    }, {
        key: "storePref",
        value: function storePref(name, value) {
            localStorage.setItem(name, value);
            this.updateSettings(); // Refresh values in _settings object
        }
    }, {
        key: "getPref",
        value: function getPref(name) {
            switch (name) {
                case 'disableAnimations':
                    return this._settings.disableAnimations;
                case 'disableBlur':
                    return this._settings.disableBlur;
                case 'playerVolume':
                    return this._settings.playerVolume;
                case 'debug':
                    return this._settings.debug;
                case 'shuffleMode':
                    return this._settings.shuffleMode;
                case 'durationFilter':
                    return this._settings.durationFilter;
            }
        }
    }, {
        key: "updateSettings",
        value: function updateSettings() {
            this._settings.disableAnimations = localStorage.getItem('disableAnimations') || false;
            this._settings.disableBlur = localStorage.getItem('disableBlur') || (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? true : false); // Disable blur for mobile devices
            this._settings.playerVolume = localStorage.getItem('playerVolume') || 100;
            this._settings.debug = localStorage.getItem('debug') || false;
            this._settings.shuffleMode = localStorage.getItem('shuffleMode') || _constants2.default.getShuffleMode().RANDOM;
            this._settings.durationFilter = localStorage.getItem('durationFilter') || _constants2.default.getDurationFilter().ANY;
        }
    }]);

    return Settings;
}();

exports.default = Settings;