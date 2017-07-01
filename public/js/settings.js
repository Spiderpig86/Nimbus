class Settings {

    static loadPrefs() {
        this.batterySaverCSS = "<style id='batterySaver'>* {-webkit-filter: none !important;filter: none !important; transition: none !important; -webkit-transition: none; !important}#histItemBg {-webkit-filter: brightness(.5) !important;filter: brightness(.5) !important; }</style>";
        
        // Default settings object
        this._settings = {
            batterySaver: false
        }
        this._settings.batterySaver = this.getPref('batterySaver') || false;
    }

    static storePref(name, value) {
        localStorage.setItem(name, value);
    }

    static getPref(name) {
        return localStorage.getItem(name);
    }

}

export default Settings;