'use strict';

var _player = require('./player');

var _player2 = _interopRequireDefault(_player);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.onload = function () {
    var sc_player = new _player2.default();
    sc_player.start();

    var myTabs = tabs({
        el: '#tabs',
        tabNavigationLinks: '.tab-item',
        tabContentContainers: '.tabpage'
    });
    myTabs.init();
}; // Initialize the SoundCloud Player object