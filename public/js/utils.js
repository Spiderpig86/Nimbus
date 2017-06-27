class Utils {

     /**
     * Simple function to convert milliseconds to a string with minutes and seconds
     * @param {*int} millis - time in milliseconds
     */
    static millisToMinutesAndSeconds(millis) {
        let minutes = Math.floor(millis / 60000);
        let seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
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