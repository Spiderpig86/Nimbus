import Toast from '../controls/toast';
import Settings from './settings';

class Utils {

     /**
     * Simple function to convert milliseconds to a string with minutes and seconds
     * @param {*int} millis - time in milliseconds
     */
    static convertMillisecondsToDigitalClock(ms) {
        let hours = Math.floor(ms / 3600000), // 1 Hour = 36000 Milliseconds
        minutes = Math.floor((ms % 3600000) / 60000), // 1 Minutes = 60000 Milliseconds
        seconds = Math.floor(((ms % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds
        return {
            hours : hours,
            minutes : minutes,
            seconds : seconds,
            clock : ((hours === 0) ? '' : hours + ':') + (minutes < 10 && hours > 0 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds,
            clock_long: ((hours === 0) ? '' : hours + ' hr ') + (minutes < 10 && hours > 0 ? '0' : '') + minutes + ' min'
        };
    }

    /**
     * Grab a random image when a song does not have cover art.
     */
    static fetchRandomImage() {
        let i = Math.floor(Math.random() * 4050) + 1;
        return `http://img.infinitynewtab.com/wallpaper/${i}.jpg`;
    }

    /**
     * Show a toast with a message as the param.
     * 
     * @static
     * @param {any} message - A message shown to the user
     * @memberof Utils
     */
    static showToast(message) {
        this.toastContainer = document.getElementById('toastContainer');
        this.toastContainer.innerHTML = Toast(message, '');
        setTimeout(function() { 
            $('#toast').addClass('shown');
        }, 500);
        setTimeout(function() { // Hide toast
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
    static log(message, TAG = null) {
        if (Settings.getPref('debug') === 'true') {
            if (TAG === null)
                console.log(message);
            else
                console.log(TAG, message);
        }
    }
}

export default Utils;