class Settings {

    static loadPrefs() {
        this.disableAnimationsCSS = "<style id='disableAnimations'>* {transition: none !important; -webkit-transition: none; !important}</style>";
        this.disableBlurCSS = "<style id='disableBlur'>#histItemBg {-webkit-filter: brightness(.5) !important;filter: brightness(.5) !important; } #background {-webkit-filter: brightness(.8) !important;filter: brightness(.8) !important; }</style>"
        
        // Default settings object
        this._settings = {
            disableAnimations: false,
            disableBlur: false,
            playerVolume: 100
        }
        this._settings.disableAnimations = this.getPref('disableAnimations') || false;
        this._settings.disableBlur = this.getPref('disableBlur') || (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? true : false); // Disable blur for mobile devices
        this._settings.playerVolume = this.getPref('playerVolume') || 100;
    }

    static storePref(name, value) {
        localStorage.setItem(name, value);
    }

    static getPref(name) {
        return localStorage.getItem(name);
    }

}

export default Settings;