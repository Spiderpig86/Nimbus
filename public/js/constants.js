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

    static getDurationValues(length) {
        switch (length) {
            case Constants.getDurationFilter().SHORT: 
                return {
                    from: 0,
                    to: 120000
                }
            case Constants.getDurationFilter().MEDIUM: 
                return {
                    from: 120000,
                    to: 600000
                }
            case Constants.getDurationFilter().LONG: 
                return {
                    from: 120000,
                    to: 1800000
                }
            case Constants.getDurationFilter().EPIC:
                return {
                    from: 1800000
                }
        }
    }

    static getRelatedWaypoint() {
        return 'http://nimbusmusic.000webhostapp.com/related.php';
    }

    static getChartsWaypoint() {
        return 'http://nimbusmusic.000webhostapp.com/charts.php';
    }

    static getChartsJSONWaypoint() {
        return 'http://nimbusmusic.000webhostapp.com/charts.json';
    }

    static getFeaturedJSONWaypoint() {
        return 'http://nimbusmusic.000webhostapp.com/featured.json';
    }
}

export default Constants;