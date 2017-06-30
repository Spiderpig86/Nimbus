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
            clock : ((hours === 0) ? '' : hours + ':') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds
        };
    }

    /**
     * Grab a random image when a song does not have cover art.
     */
    static fetchRandomImage() {
        let i = Math.floor(Math.random() * 4050) + 1;
        return `http://img.infinitynewtab.com/wallpaper/${i}.jpg`;
    }

}

export default Utils;