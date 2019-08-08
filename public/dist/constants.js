'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// File to hold constants used across the browser

var Constants = function () {
    function Constants() {
        _classCallCheck(this, Constants);
    }

    _createClass(Constants, null, [{
        key: 'getShuffleMode',
        value: function getShuffleMode() {
            return {
                RANDOM: 'RANDOM',
                RELATED: 'RELATED'
            };
        }
    }, {
        key: 'getDurationFilter',
        value: function getDurationFilter() {
            return {
                SHORT: 'SHORT',
                MEDIUM: 'MEDIUM',
                LONG: 'LONG',
                EPIC: 'EPIC',
                ANY: 'ANY'
            };
        }
    }, {
        key: 'getDurationValues',
        value: function getDurationValues(length) {
            switch (length) {
                case Constants.getDurationFilter().SHORT:
                    return {
                        from: 0,
                        to: 120000
                    };
                case Constants.getDurationFilter().MEDIUM:
                    return {
                        from: 120000,
                        to: 600000
                    };
                case Constants.getDurationFilter().LONG:
                    return {
                        from: 120000,
                        to: 1800000
                    };
                case Constants.getDurationFilter().EPIC:
                    return {
                        from: 1800000
                    };
            }
        }
    }, {
        key: 'getRelatedWaypoint',
        value: function getRelatedWaypoint() {
            return 'https://app-1501965358.000webhostapp.com/related.php';
        }
    }, {
        key: 'getChartsWaypoint',
        value: function getChartsWaypoint() {
            return 'https://app-1501965358.000webhostapp.com/charts.php';
        }
    }, {
        key: 'getChartsJSONWaypoint',
        value: function getChartsJSONWaypoint() {
            return 'https://app-1501965358.000webhostapp.com/charts.json';
        }
    }, {
        key: 'getFeaturedJSONWaypoint',
        value: function getFeaturedJSONWaypoint() {
            return 'https://app-1501965358.000webhostapp.com/featured.json';
        }
    }]);

    return Constants;
}();

exports.default = Constants;