/**
 * Draws the waveform component of the player.
 */

class WaveForm {

    /**
     * Constructor for the waveform
     * @param {WaveFormConfig} - {
            container: HTMLElement,
            audio: Audio,
            data: Array,
            peakWidth: number,
            peakSpace: number,
            responsive: boolean,
            mouseOverEvents: boolean,
            color: {
                background: string,
                footer: string,
                footerPlayback: string,
                hoverGradient: {
                    from: string,
                    to: string
                },
                    playbackGradient: {
                    from: string,
                    to: string
                },
                    hoverPlaybackGradient: {
                    from: string,
                    to: string
                }
            }
        }
     */
    constructor(params) {
        this.curTime = 0;
        this.duration = 0;
        this.mouseOver = false;
        this.canvas = null;

        // Create the config file for the waveform settings
        this.config = {
            container: null,
            audio: null,
            data: null,
            peakWidth: 2, // ?
            peakSpace: 1, // ?
            responsive: true,
            mouseOverEvents: true,
            mouseClickEvents: true,
            // Color config
            color: {
                background: "#8C8C8C",
                footer: "#B2B2B2",
                footerPlayback: "#FFAA80",
                hoverGradient: {
                from: "#FF7200",
                to: "#DA4218"
                },
                playbackGradient: {
                from: "#FF7200",
                to: "#DA4218"
                },
                hoverPlaybackGradient: {
                from: "#AB5D20",
                to: "#A84024"
                }
            }
        }; // Conig object end

        if (params) // Check if not null
            Object.assign(this.config, params); // Enumerate through fields and assign them to corresponding fields in this.config (Similar to serializing)

        this.buildCanvas();
        this.bindEvents();
        this.drawWave(); // Draw the wave
    }

    /**
     * Create the canvas
     */
    buildCanvas() {
        this.canvas = document.createElement('canvas'); // Create the canvas element
        this.config.container.appendChild(this.canvas); // Update the container to the canvas object
        this.updateCanvasSize();
        this.ctx = this.canvas.getContext('2d');
        this.ctx.lineWidth = this.config.peakWidth; // Sets the width of each vertical line in the canvas.
    }

    bindEvents() {
        if (this.config.responsive) // If waveform is responsive, resize with parent.
            this.onResizeHandler();

        if (this.config.mouseOverEvents) {
            this.onMouseMoveHandler();
            this.onMouseLeaveHandler();
        }
    }
}