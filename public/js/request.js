/**
 * Designed to fetch data using XMLHttp.
 */
class Request {

    /**
     * Creates an instance of Request.
     * 
     * @memberof Request
     */
    constructor() {
        console.log('Init Request service');
    }

    get(url) {
         return new Promise(function (resolve, reject) {
            const xhr = new XMLHttpRequest();
            xhr.addEventListener("load", function() {
                if (this.status >= 200 && this.status < 300) {
                    resolve(this.responseText); // Resolve on valid response
                } else {
                    reject(this);
                }
            });

            xhr.addEventListener("error", function() {
                reject(this); // Reject on error
            });

            xhr.open('GET', url, true);
            xhr.send();
        });
    }

    /**
     * Get the JSON data for the waveform
     * 
     * @param {string} url 
     * @returns - WaveForm JSON object
     */
    async getJSON(url) {
        try {
            return JSON.parse(await this.get(url));
        } catch (e) {
            console.log(e);
            return []; // Return null
        }
    }
}

export default Request