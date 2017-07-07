class Settings {

    static loadPrefs() {
        this.disableAnimationsCSS = "<style id='disableAnimations'>* {transition: none !important; -webkit-transition: none; !important}</style>";
        this.disableBlurCSS = "<style id='disableBlur'>#histItemBg {-webkit-filter: brightness(.5) !important;filter: brightness(.5) !important; } #background {-webkit-filter: brightness(.5) !important;filter: brightness(.5) !important; }</style>"
        
        // Default settings object
        this._settings = {
            disableAnimations: false,
            disableBlur: false
        }
        this._settings.disableAnimations = this.getPref('disableAnimations') || false;
        this._settings.disableBlur = this.getPref('disableBlur') || false;
    }

    static storePref(name, value) {
        localStorage.setItem(name, value);
    }

    static getPref(name) {
        return localStorage.getItem(name);
    }

}

export default Settings;