import Constants from './constants';

class Settings {

    static loadPrefs() {
        this.disableAnimationsCSS = "<style id='disableAnimations'>* {transition: none !important; -webkit-transition: none; !important}</style>";
        this.disableBlurCSS = "<style id='disableBlur'>#histItemBg {-webkit-filter: brightness(.5) !important;filter: brightness(.5) !important; } #background {-webkit-filter: brightness(.8) !important;filter: brightness(.8) !important; }</style>"
        
        // Default settings object
        this._settings = {
            disableAnimations: false,
            disableBlur: false,
            playerVolume: 100,
            debug: false,
            shuffleMode: Constants.getShuffleMode().RANDOM,
            durationFilter: Constants.getDurationFilter().ANY
        }

        this.updateSettings();
        
    }

    static storePref(name, value) {
        localStorage.setItem(name, value);
        this.updateSettings(); // Refresh values in _settings object
    }

    static getPref(name) {
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

    static updateSettings() {
        this._settings.disableAnimations = localStorage.getItem('disableAnimations') || false;
        this._settings.disableBlur = localStorage.getItem('disableBlur') || (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? true : false); // Disable blur for mobile devices
        this._settings.playerVolume = localStorage.getItem('playerVolume') || 100;
        this._settings.debug = localStorage.getItem('debug') || false;
        this._settings.shuffleMode = localStorage.getItem('shuffleMode') || Constants.getShuffleMode().RANDOM;
        this._settings.durationFilter = localStorage.getItem('durationFilter') || Constants.getDurationFilter().ANY;
    }

}

export default Settings;