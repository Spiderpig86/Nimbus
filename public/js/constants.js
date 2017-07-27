// File to hold constants used across the browser

class Constants {

    static getShuffleMode() {
         return {
            RANDOM: 'RANDOM',
            RELATED: 'RELATED'
        };
    }

    static getDurationFilter() {
        return {
            SHORT: 'SHORT',
            MEDIUM: 'MEDIUM',
            LONG: 'LONG',
            EPIC: 'EPIC',
            ANY: 'ANY'
        };
    }
}

export default Constants;