'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Designed to fetch data using XMLHttp.
 */
var Request = function () {

    /**
     * Creates an instance of Request.
     * 
     * @memberof Request
     */
    function Request() {
        _classCallCheck(this, Request);

        _utils2.default.log('Init Request service');
    }

    _createClass(Request, [{
        key: 'get',
        value: function get(url) {
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.addEventListener("load", function () {
                    if (this.status >= 200 && this.status < 300) {
                        resolve(this.responseText); // Resolve on valid response
                    } else {
                        reject(this);
                    }
                });

                xhr.addEventListener("error", function () {
                    reject(this); // Reject on error
                });

                xhr.open('GET', url, true);
                xhr.send();
            });
        }

        /**
         * Get the JSON data for the waveform
         * 
         * @param {string} url 
         * @returns - WaveForm JSON object
         */

    }, {
        key: 'getJSON',
        value: async function getJSON(url) {
            try {
                return JSON.parse((await this.get(url)));
            } catch (e) {
                console.log(e);
                return []; // Return null
            }
        }
    }]);

    return Request;
}();

exports.default = Request;