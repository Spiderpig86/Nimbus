/**
 * Created by Profesor08 on 11.04.2017.
 */


class Waveform
{

  /**
   * Waveform constructor
   * @param {{
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
    }} params
   */
  constructor(params)
  {
    this.currentTime = 0;
    this.duration = 0;
    this.mouseOver = false;
    this.canvas = null;

    this.config = {
      container: null,
      audio: null,
      data: null,
      peakWidth: 2,
      peakSpace: 1,
      responsive: true,
      mouseOverEvents: true,
      mouseClickEvents: true,
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
    };

    if (params)
    {
      Object.assign(this.config, params);
    }

    this._initCanvas();
    this._initEvents();
    this.drawWaveform();
  }

  /**
   * Initialize waveform canvas
   * @private
   */
  _initCanvas()
  {
    this.canvas = document.createElement("canvas");
    this.config.container.appendChild(this.canvas);
    this._updateCanvasSize();
    this.ctx = this.canvas.getContext("2d");
    this.ctx.lineWidth = this.config.peakWidth;
  }

  /**
   * Initializing basic events according to configs
   * @private
   */
  _initEvents()
  {
    if (this.config.responsive)
    {
      this._onResize();
    }

    if (this.config.mouseOverEvents)
    {
      this._onMouseMove();
      this._onMouseLeave();
    }

    if (this.config.mouseClickEvents)
    {
      this._onMouseClick();
    }

    if (this.config.audio)
    {
      this._onTimeUpdate();
      this._onCanPlay();
    }
  }

  /**
   * Initialize event if audio is ready to play
   * Will update current time and duration time, and redraw waveform
   * @private
   */
  _onCanPlay()
  {
    this.config.audio.addEventListener("canplay", () =>
    {
      this.currentTime = this.config.audio.currentTime;
      this.duration = this.config.audio.duration;
      this.drawWaveform();
    });
  }

  /**
   * Initialize event on audio time update
   * Will update current time and duration time, and redraw waveform
   * @private
   */
  _onTimeUpdate()
  {
    this.config.audio.addEventListener("timeupdate", () =>
    {
      this.currentTime = this.config.audio.currentTime;
      this.duration = this.config.audio.duration;
      this.drawWaveform();
    });
  }

  /**
   * Initialize mouse move event
   * @private
   */
  _onMouseMove()
  {
    this.canvas.addEventListener("mousemove", event =>
    {
      this.mouseOver = this._getMousePosition(event);
      this.drawWaveform();
    });
  }

  /**
   * Initialize mouse leave event
   * @private
   */
  _onMouseLeave()
  {
    this.canvas.addEventListener("mouseleave", () =>
    {
      this.mouseOver = null;
      this.drawWaveform();
    });
  }

  /**
   * Initialize mouse click event
   * @private
   */
  _onMouseClick()
  {
    this.canvas.addEventListener("click", event =>
    {
      if (event.button === 0 && this.duration)
      {
        let x = event.layerX;

        if (this.config.audio)
        {
          this.config.audio.currentTime = parseInt(this.duration / 100 * (x / (this.config.container.clientWidth / 100)));
        }
        else
        {
          this.currentTime = parseInt(this.duration / 100 * (x / (this.config.container.clientWidth / 100)));
        }

        this.drawWaveform();
      }
    });
  }

  /**
   * Calculate mouse position on canvas
   * @param {MouseEvent} event
   * @returns {{x: number, y: number}}
   * @private
   */
  _getMousePosition(event)
  {
    let rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  /**
   * Init window.onResize event, to redraw waveform depending on container size.
   * Waveform will redraw only if container size changed
   * @private
   */
  _onResize()
  {
    let oldWidth = this.config.container.clientWidth;
    let oldHeight = this.config.container.clientHeight;

    window.addEventListener("resize", () =>
    {
      if (oldWidth !== this.config.container.clientWidth || oldHeight !== this.config.container.clientHeight)
      {
        oldWidth = this.config.container.clientWidth;
        oldHeight = this.config.container.clientHeight;
        this._updateCanvasSize();
        this.drawWaveform();
      }
    });
  }

  /**
   * Update canvas size to size of container
   * @private
   */
  _updateCanvasSize()
  {
    this.canvas.width = this.config.container.clientWidth;
    this.canvas.height = this.config.container.clientHeight;
  }

  /**
   * Construct linear gradient
   * @param x1
   * @param y1
   * @param x2
   * @param y2
   * @param {{from: string, to: string}} param
   * @returns {CanvasGradient}
   * @private
   */
  _getGradient(x1, y1, x2, y2, param)
  {
    let gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, param.from);
    gradient.addColorStop(1, param.to);

    return gradient;
  }

  /**
   * Construct linear gradient fo peak if mouse is over canvas
   * @param x1
   * @param y1
   * @param x2
   * @param y2
   * @returns {CanvasGradient}
   * @private
   */
  _getHoverGradient(x1, y1, x2, y2)
  {
    return this._getGradient(x1, y1, x2, y2, {
      from: this.config.color.hoverGradient.from,
      to: this.config.color.hoverGradient.to
    })
  }

  /**
   * Construct linear gradient for playback peak
   * @param x1
   * @param y1
   * @param x2
   * @param y2
   * @returns {CanvasGradient}
   * @private
   */
  _getPlaybackGradient(x1, y1, x2, y2)
  {
    return this._getGradient(x1, y1, x2, y2, {
      from: this.config.color.playbackGradient.from,
      to: this.config.color.playbackGradient.to
    })
  }

  /**
   *  Construct linear gradient for playback peak if mouse is over canvas
   * @param x1
   * @param y1
   * @param x2
   * @param y2
   * @returns {CanvasGradient}
   * @private
   */
  _getHoverPlaybackGradient(x1, y1, x2, y2)
  {
    return this._getGradient(x1, y1, x2, y2, {
      from: this.config.color.hoverPlaybackGradient.from,
      to: this.config.color.hoverPlaybackGradient.to
    })
  }

  /**
   * Get stroke style depending on mouse position, playback position
   * @param x
   * @param y
   * @param lineBreak
   * @param playback
   * @returns {*}
   * @private
   */
  _getContextStrokeStyle(x, y, lineBreak, playback)
  {
    if (this.config.mouseOverEvents)
    {
      if (this.mouseOver && this.mouseOver.x >= x)
      {
        return this._getHoverGradient(x, y, x, lineBreak);
      }
    }

    if (playback >= x)
    {
      if (this.config.mouseOverEvents)
      {
        if (this.mouseOver)
        {
          return this._getHoverPlaybackGradient(x, y, x, lineBreak);
        }
      }

      return this._getPlaybackGradient(x, y, x, lineBreak);
    }

    return this.config.color.background;
  }

  /**
   * Drawing waveform
   */
  drawWaveform()
  {
    /**
     * To draw will be selected every N element from data array
     * @type {number}
     */
    let N = this.config.data.length / this.config.container.clientWidth * (this.config.peakWidth + this.config.peakSpace);

    /**
     * Count of peaks
     * @type {number}
     */
    let count = Math.floor(this.config.data.length / N);

    /**
     * Current position of playback depending of canvas width
     * @type {number}
     */
    let playback = 0;

    if (!!this.duration && this.currentTime >= 0)
    {
      playback = this.canvas.width / this.duration * this.currentTime;
    }

    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    for (let i = 0, x = 0; i < count; i++, x += (this.config.peakWidth + this.config.peakSpace))
    {
      let peakHeight = this.canvas.height / 140 * this.config.data[Math.round(i * N)];
      let y = (this.canvas.height / 2 - peakHeight / 2) * 1.5;

      /**
       * Break position of top and bottom peaks
       * @type {number}
       */
      let lineBreak = Math.floor(this.canvas.height / 1.33333) - 1;

      /**
       * Top part peak style
       */
      this.ctx.strokeStyle = this._getContextStrokeStyle(x, y, lineBreak, playback);

      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x, lineBreak);
      this.ctx.stroke();

      /**
       * Bottom part peak style
       */
      if (playback >= x)
      {
        this.ctx.strokeStyle = this.config.color.footerPlayback;
      }
      else
      {
        this.ctx.strokeStyle = this.config.color.footer;
      }

      this.ctx.beginPath();
      this.ctx.moveTo(x, lineBreak + 1);
      this.ctx.lineTo(x, peakHeight + y);
      this.ctx.stroke();
    }
  }

  /**
   * Set current playback manually and redraw it
   * @param currentTime
   * @param duration
   */
  setPlayback(currentTime, duration)
  {
    this.currentTime = currentTime;
    this.duration = duration;
    this.drawWaveform();
  }

  /**
   * Update waveform data and redraw
   * @param data
   */
  updateWaveformData(data)
  {
    this.config.data = data;
    this.drawWaveform();
  }
}