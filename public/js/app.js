// Initialize the SoundCloud Player object
import Player from './player'

window.onload = () => {
    const sc_player = new Player();
    sc_player.start();

    const myTabs = tabs({
        el: '#tabs',
        tabNavigationLinks: '.tab-item',
        tabContentContainers: '.tabpage'
    });
    myTabs.init();
}
