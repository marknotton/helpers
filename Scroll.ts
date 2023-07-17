
let _y: number | boolean = false;
let _x: number | boolean = false;

class Scroll {

  // ---------------------------------------------------------------------------
  // Y Location
  // ---------------------------------------------------------------------------

  /**
  *  Returns the y location of window scroll bar
  * @method  y
  * @example Scroll.y
  * @return {Number} Y location in pixels, number will not be suffixed with 'px'
  */

  static get y(): number {
    return window.pageYOffset || document.documentElement.scrollTop;
  }

  // ---------------------------------------------------------------------------
  // X Location
  // ---------------------------------------------------------------------------

  /**
  * Returns the x location of window scroll bar
  * @method  x
  * @example Scroll.x
  * @return {Number} X location in pixels, number will not be suffixed with 'px'
  */

  static get x(): number {
    return window.pageXOffset || document.documentElement.scrollLeft;
  }

  // ---------------------------------------------------------------------------
  // Scroll bar width
  // ---------------------------------------------------------------------------

  /**
  * Returns width of the scroll bar
  * @method  width
  * @example Scroll.width
  * @see https://stackoverflow.com/a/13382873/843131
  * @return {Number} Width in pixels, number will not be suffixed with 'px'
  */

  static get width(): string {

    if (document.documentElement.scrollHeight <= document.documentElement.clientHeight) {
      return '0px';
    } else {
      const outer = document.createElement('div');
      outer.style.all = 'unset';
      outer.style.visibility = 'hidden';
      outer.style.overflow = 'scroll';
      document.body.appendChild(outer);

      const inner = document.createElement('div');
      outer.appendChild(inner);

      const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
      outer.parentNode?.removeChild(outer);

      return scrollbarWidth + 'px';
    }
  }

  // ---------------------------------------------------------------------------
  // Scroll bar height
  // ---------------------------------------------------------------------------

  /**
  * Returns height of the scroll bar
  * @method  height
  * @example Scroll.height
  * @see https://stackoverflow.com/a/13382873/843131
  * @return {Number} height in pixels, number will not be suffixed with 'px'
  */

  static get height(): string {
    return Scroll.width;
  }

  // ---------------------------------------------------------------------------
  // Y Position
  // ---------------------------------------------------------------------------

  /**
  * Returns vertical positioning of the scrollbar relative to the viewport in percent at 2 decimal places
  * @method  positionY
  * @example Scroll.positionY
  * @return {Number} Between 0 to 100, no '%' symbol will be suffixed.
  */

  static get positionY(): number {
    return Math.round(((document.documentElement.scrollTop + document.body.scrollTop) / (document.documentElement.scrollHeight - document.documentElement.clientHeight) * 100) * 100) / 100;
  }

  // ---------------------------------------------------------------------------
  // Scroll To Location
  // ---------------------------------------------------------------------------

  /**
  * Scrolls a given element to a specific position.
  * @see https://gist.github.com/felipenmoura/650e7e1292c1e7638bcf6c9f9aeb9dd5
  * @method to
  * @param {Object} target    The DOM element you want the window to scroll to
  * @param {Object} container The containing element is typically the document body,
  *                           but may different if the document is wrappers in a container.
  * @param {Object} duration  How long the duration of the scroll should take in seconds.
  * @param {Object} offset    Offset exactly where the end position will be. Can be negative.
  *                           By default, this is be the css defined gutter for the given viewport.
  * @param {Object} position  Instead of a dom element, you can explicitly define the
  *                           Y position you want to scroll to.
  * @param {Object} callback  Function callback after the transition has complete
  *
  * @example Scroll.to(document.querySelector('section'))
  * @return {Number} Y location in pixels, number will not be suffixed with 'px'
  */
  static to(target: HTMLElement | null, options: { container?: HTMLElement | null; duration?: number; offset?: number; position?: number; callback?: () => void } = {}): void | Promise<void> {
    if (!target) { return; }

    let container = options.container || document.scrollingElement;
    let duration = options.duration || 500;
    let offset = options.offset || false;
    let position = options.position || 0;
    let callback = options.callback || null;

    if (options.offset === 0) {
      offset = 0;
    } else if (offset === false) {
      // let gutter = ComputedUnits.vw((document.body as any).getCustomProperty('gutter', true));
      // offset = -Math.abs(gutter);
    }

    if (options.duration === 0) {
      duration = 0;
    }

    new Promise<void>((resolve) => {
      let endPosition = position || target.getBoundingClientRect().top + (container?.scrollTop || 0);
      let startPosition = container?.scrollTop || 0;
      let change = offset && typeof offset === 'number' ? endPosition - startPosition + offset : endPosition - startPosition;
      let currentTime = 0;
      let increment = 20;

      let easeInOutQuad = (t: number, b: number, c: number, d: number) => {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
      }

      const animateScroll = () => {
        currentTime += increment;
        let val = easeInOutQuad(currentTime, startPosition, change, duration);
        if (container) {
          container.scrollTop = val;
        }
        if (currentTime < duration) {
          setTimeout(animateScroll, increment);
        } else {
          resolve();
          if (callback) { callback.call(target); }
        }
      };
      animateScroll();
    });
  }


  // ---------------------------------------------------------------------------
  // Returns the last known direction the window had scrolled.
  // ---------------------------------------------------------------------------

  /**
  * Returns the last known direction the window had scrolled.
  * @method  direction
  * @example Scroll.direction
  * @return {Array} ['up' or 'down', 'left' or 'right']
  */
  static get direction(): string {
    let results = [];

    let y = window.pageYOffset || document.documentElement.scrollTop;
    let v = y < (_y as number) ? 'up' : (y > (_y as number) ? 'down' : false);
    if (v !== false) { results.push(v); }
    _y = y <= 0 ? 0 : y;

    let x = window.pageXOffset || document.documentElement.scrollLeft;
    let h = x < (_x as number) ? 'left' : (x > (_x as number) ? 'right' : false);
    if (h !== false) { results.push(h); }
    _x = x <= 0 ? 0 : x;

    return results.join(' ');
  }
}

export default Scroll;

// This is used throughout the CSS to omit the scroll-bar width when elements are
// using the vw units on nested elements.  
document.body.style.setProperty('--scroll-bar-width', Scroll.width);