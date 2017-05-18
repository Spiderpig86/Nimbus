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
    constructor(params, duration) {
        this.currentPosition = 0;
        this.duration = 0;
        this.mouseOver = false;
        this.canvas = null;

        // Create the config file for the waveform settings
        this.config = {
            container: null,
            audio: null,
            duration: 0,
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
        }; // Config object end

        if (params) { // Check if not null
            Object.assign(this.config, params); // Enumerate through fields and assign them to corresponding fields in this.config (Similar to serializing)
        }

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
        this.config.audio.bind(SC.Widget.Events.READY, (e) => {
            this.currentPosition = this.config.audio.currentPosition;
            this.duration = this.config.duration;
            this.drawWaveForm();
            console.log('canplayhandler');
        });
    }

    /**
     * Event fired when time updates in the widget object
     */
    onTimeUpdateHandler() {
        this.config.audio.bind(SC.Widget.Events.PLAY_PROGRESS, (e) => {
            this.currentPosition = e.currentPosition;
            this.duration = this.config.duration;
            this.drawWaveForm();
        });
    }

    /**
     * Update waveform colors based on mouse location
     */
    onMouseMoveHandler() {
        this.canvas.addEventListener('mousemove', event => {
            this.mouseOver = this.getMousePosition(event); // Assign coords to mouseOver
            this.drawWaveForm(); // Update waveform
        });
    }

    /**
     * Handles when the mouse leaves the waveform area
     */
    onMouseLeaveHandler() {
        this.canvas.addEventListener('mouseleave', () => {
            this.mouseOver = null;
            this.drawWaveForm(); // Update waveform
        });
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

    /**
     * Handles when the window object resizes to redraw the waveform according to the container size. This is only redrawn when sizes are different.
     */
    onResizeHandler() {
        let oldWidth = this.config.container.clientWidth; // Get dimensions of the contaner that holds the canvas
        let oldHeight = this.config.container.clientHeight;

        window.addEventListener('resize', () => {
            if (oldWidth !== this.config.container.clientWidth || oldHeight !== this.container.clientHeight) { 

                // Update tracked previous dimensions on resize
                oldWidth = this.config.container.clientWidth;
                oldHeight = this.config.container.clientHeight;
                this.updateCanvasSize(); // Refresh the display
                this.drawWaveForm(); // Draw it
            }
        });
    }

    /**
     * Update the canvas size to match the container. (Probably could be replaced with CSS)
     */
    updateCanvasSize() {
        this.canvas.width = this.config.container.clientWidth;
        this.canvas.height = this.config.container.clientHeight;
    }

    /**
     * WAVEFORM COLORING
     */

     /**
      * Construct a linear gradient over the waveform
      * 
      * @param {number} x1
      * @param {number} y1 
      * @param {number} x2 
      * @param {number} y2 
      * @param {{from: string, to: string}} param - param object that holds the color values as strings.
      * @returns {CanvasGradient}
      *
      * @memberof WaveForm
      */
    getGradient(x1, y1, x2, y2, param) {
        let gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
        
        // Color sections of the gradient with colors in param.* where indexes indicate start and end positions.
        gradient.addColorStop(0, param.from);
        gradient.addColorStop(1, param.to);

        return gradient;
    }

    /**
     * Construct a linear gradient on mouse hover
     * 
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     * @returns {CanvasGradient}
     * 
     * @memberof WaveForm
     */
    getHoverGradient(x1, y1, x2, y2) {
        // Return gradient with hovered colors.
        return this.getGradient(x1, y1, x2, y2, {
            from: this.config.color.hoverGradient.from,
            to: this.config.color.hoverGradient.to
        });
    }

    /**
     * Construct a linear gradient for playback peak
     * 
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     * @returns {CanvasGradient}
     * 
     * @memberof WaveForm
     */
    getPlayBackGradient(x1, y1, x2, y2) {
        // Return gradient with playback colors (in progress colors)
        return this.getGradient(x1, y1, x2, y2, {
            from: this.config.color.playbackGradient.from,
            to: this.config.color.playbackGradient.to
        });
    }

    /**
     * Construct linear gradient for playback colors on mouse hover
     * 
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     * @returns {CanvasGradient}
     * 
     * @memberof WaveForm
     */
    getHoverPlayBackGradient(x1, y1, x2, y2) {
        return this.getGradient(x1, y1, x2, y2, {
            from: this.config.color.hoverPlaybackGradient.from,
            to: this.config.color.hoverPlaybackGradient.to 
        });
    }

    /**
     * Draw the stroke style according to the mouse position.
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} lineBreak 
     * @param {number} playback 
     * @returns {config}
     * 
     * @memberof WaveForm
     */
    getContextStrokeStyle(x, y, lineBreak, playback) {
        if (this.config.mouseOverEvents) { // Used to check if this is enabled in the configs
            if (this.mouseOver && this.mouseOver.x >= x) {
                return this.getHoverGradient(x, y, x, lineBreak); // Color until the line break.
            }
        }
        
        if (playback >= x) { // If the song progress is greater than the x value
            if (this.config.mouseOverEvents) {
                if (this.mouseOver) {
                    return this.getHoverPlayBackGradient(x, y, x, lineBreak);
                }
            }

            return this.getPlayBackGradient(x, y ,x, lineBreak);
        }

        return this.config.color.background;
    }

    /**
     * Draw the waveform canvas object.
     * 
     * @memberof WaveForm
     */
    drawWaveForm() {
        // Parse waveform from url, ex: https://wis.sndcdn.com/ivasij2DQoqz_m.json

        // We need to calculate the offset of how many peaks we can display. If the wavform is at 100% width, we can display all, but if not, we need to select every N peaks to draw.
        // data.length - number of peaks in the waveform
        // config.peakWidth - default set to 2px in constrctor (width if individual peak)
        // conig.peakSpace - default set to 1px in the constructor (space between peak)
        let N = this.config.data.length / this.config.container.clientWidth * (this.config.peakWidth + this.config.peakSpace);

        let count = Math.floor(this.config.data.length / N); // Count how many peaks we will display (total peaks / every Nth peak by the amount of pixels they use)

        let playback = 0;

        // Needs checking
        if (!!this.duration && this.currentPosition >= 0) {
            playback = this.canvas.width / this.duration * this.currentPosition;
        }

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        for (let i = 0, x = 0; i < count; i++, x += (this.config.peakWidth + this.config.peakSpace)) { // Iterate over all the peaks in the data and draw them. Increment by the amount of pixels they use (x).
            // Calculate the height of that peak so we can draw the line.
            let peakHeight = this.canvas.height / 140 * this.config.data[Math.round(i * N)];
            let y = (this.canvas.height / 2 - peakHeight / 2) * 1.5;

            // Calculate the line break which is the 2px line you see cutting across the waveform.
            let lineBreak = Math.floor(this.canvas.height / 1.33333) - 1;

            this.ctx.strokeStyle = this.getContextStrokeStyle(x, y, lineBreak, playback); // Get the gradient color to draw the line. Hovered events and other events already handled inside the method.

            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x, lineBreak); // Draw to break
            this.ctx.stroke();

            // Draw the peaks under the line break.
            if (playback >= x) {
                this.ctx.strokeStyle = this.config.color.footerPlayback; // Colored part of the playback
            } else {
                this.ctx.strokeStyle = this.config.color.footer; // Default color
            }

            this.ctx.beginPath();
            this.ctx.moveTo(x, lineBreak + 1);
            this.ctx.lineTo(x, peakHeight + y);
            this.ctx.stroke();
        }
    }

    /**
     * Set the current track time and redraw the waveform
     * 
     * @param {Number} currentPosition 
     * @param {Number} duration 
     * 
     * @memberof WaveForm
     */
    setPlayBack(currentPosition, duration) {
        this.currentPosition = currentPosition;
        this.duration = duration;
        this.drawWaveForm();
    }

    /**
     * Update the current data object.
     * 
     * @param {Data} data 
     * 
     * @memberof WaveForm
     */
    updateWaveformData(data) {
        this.config.data = data;
        this.drawWaveForm();
    }

}

export default WaveForm