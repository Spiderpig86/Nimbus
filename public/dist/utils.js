'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _toast = require('../controls/toast');

var _toast2 = _interopRequireDefault(_toast);

var _settings = require('./settings');

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Utils = function () {
    function Utils() {
        _classCallCheck(this, Utils);
    }

    _createClass(Utils, null, [{
        key: 'convertMillisecondsToDigitalClock',


        /**
        * Simple function to convert milliseconds to a string with minutes and seconds
        * @param {*int} millis - time in milliseconds
        */
        value: function convertMillisecondsToDigitalClock(ms) {
            var hours = Math.floor(ms / 3600000),
                // 1 Hour = 36000 Milliseconds
            minutes = Math.floor(ms % 3600000 / 60000),
                // 1 Minutes = 60000 Milliseconds
            seconds = Math.floor(ms % 360000 % 60000 / 1000); // 1 Second = 1000 Milliseconds
            return {
                hours: hours,
                minutes: minutes,
                seconds: seconds,
                clock: (hours === 0 ? '' : hours + ':') + (minutes < 10 && hours > 0 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds,
                clock_long: (hours === 0 ? '' : hours + ' hr ') + (minutes < 10 && hours > 0 ? '0' : '') + minutes + ' min'
            };
        }

        /**
         * Grab a random image when a song does not have cover art.
         */

    }, {
        key: 'fetchRandomImage',
        value: function fetchRandomImage() {
            var i = Math.floor(Math.random() * 4050) + 1;
            return 'http://img.infinitynewtab.com/wallpaper/' + i + '.jpg';
        }

        /**
         * Show a toast with a message as the param.
         * 
         * @static
         * @param {any} message - A message shown to the user
         * @memberof Utils
         */

    }, {
        key: 'showToast',
        value: function showToast(message) {
            this.toastContainer = document.getElementById('toastContainer');
            this.toastContainer.innerHTML = (0, _toast2.default)(message, '');
            setTimeout(function () {
                $('#toast').addClass('shown');
            }, 500);
            setTimeout(function () {
                // Hide toast
                $('#toast').removeClass('shown');
                $('#toast').html(''); // Empty out the toast
            }, 3000);
        }

        /**
         * Custom logging method that logs to the console only when debug mode is enabled.
         * 
         * @static
         * @param {any} message - the message we want to log
         * @param {any} [TAG=null] - the associated tag or source of where the log is from. Set to null by default.
         * @memberof Utils
         */

    }, {
        key: 'log',
        value: function log(message) {
            var TAG = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            if (_settings2.default.getPref('debug') === 'true') {
                if (TAG === null) console.log(message);else console.log(TAG, message);
            }
        }
    }]);

    return Utils;
}();

exports.default = Utils;