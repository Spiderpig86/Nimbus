/**
 * Draws the waveform component of the player.
 */

let SC = require('soundcloud');

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
        this.currentPosition = 0;
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
        this.drawWaveForm(); // Draw the waveform
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

    /**
     * Bind waveform events
     */
    bindEvents() {
        if (this.config.responsive) // If waveform is responsive, resize with parent.
            this.onResizeHandler();

        if (this.config.mouseOverEvents) { // Enable mouse over/leave events
            this.onMouseMoveHandler();
            this.onMouseLeaveHandler();
        }

        if (this.config.mouseClickEvents) // Enable mouse click handling
            this.onMouseClickHandler();
        
        if (this.config.audio) { // TODO: Need to figure out how to bind with widget API, not regular API.
            this.onTimeUpdateHandler();
            this.onCanPlayHandler();
        }
    }

    /**
     * EVENT HANDLERS
     */

     /**
      * This fires when the widget is ready and updates the waveform by duration and current time.
      */
    onCanPlayHandler() {
        // READY signal might not be needed
        this.config.audio.addEventListener(SC.Widget.Events.READY, () => {
            this.currentPosition = this.config.audio.currentPosition;
            this.duration = this.config.duration;
        });
    }

    /**
     * Event fired when time updates in the widget object
     */
    onTimeUpdate() {
        this.config.audio.addEventListener(SC.Widget.Events.PLAY_PROGRESS, () => {
            this.currentPosition = this.config.audio.currentPosition;
            this.duration = this.config.duration;
        });
    }

    /**
     * Update waveform colors based on mouse location
     */
    onMouseMove() {
        this.canvas.addEventListener('mousemove', event => {
            this.mouseOver = this.getMousePosition(event); // Assign coords to mouseOver
            this.drawWaveForm(); // Update waveform
        });
    }

    /**
     * Handles when the mouse leaves the waveform area
     */
    onMouseLeave() {
        this.canvas.addEventListener('mouseleave'), () => {
            this.mouseOver = null;
            this.drawWaveForm(); // Update waveform
        }
    }

    /**
     * Handles the mouse click
     */
    onMouseClickHandler() {
        this.canvas.addEventListener('click', event => {
            // Get left click and time > 0
            if (event.button === 0 && this.duration) {
                let x = event.offsetX || event.layerX;

                if (this.config.audio) { // Audio is not null
                    this.config.currentPosition = parseInt(this.duration / 100 * (x / (this.config.container.clientWidth / 100))); // Update the track position
                } else {
                    this.currentTime = parseInt(this.duration / 100 * (x / (this.config.container.clientWidth / 100)));
                }

                this.drawWaveForm();
            }
        });
    }

    /**
     * Get the mouse position relative to canvas location.
     * @param {MouseEvent} event
     * @return {{x: number, y: number}}
     */
    getMousePosition(e) {
        let rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left, // Get x position relative to canvas left border
            y: event.clientY - rect.top // Get y position relative to canvas top border
        };
    }
}