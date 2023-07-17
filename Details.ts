interface CustomDetailsElement extends HTMLDetailsElement {
  expand?: (instant?: boolean) => void;
  shrink?: (instant?: boolean) => void;
}

interface CustomHTMLElement extends HTMLElement {
  shrink?: (instant?: boolean) => void;
}

class Details {
  el: CustomDetailsElement;
  summary: HTMLElement;
  content: HTMLElement;
  animation: Animation | null;
  isClosing: boolean;
  isExpanding: boolean;
  siblings: Array<CustomHTMLElement>;

  constructor(el: CustomDetailsElement) {
    this.el = el;
    this.summary = el.querySelector('summary') as HTMLElement;
    this.content = el.querySelector('.content') as HTMLElement || el.querySelector('.tab-content') as HTMLElement;

    this.animation = null;
    this.isClosing = false;
    this.isExpanding = false;
    this.siblings = [];

    this.summary.addEventListener('click', (e) => this.onClick(e));

    this.el.expand = (instant = false) => { this.open(instant); }
    this.el.shrink = (instant = false) => { this.shrink(instant); }

    setTimeout(() => {
      this.siblings = Array.from(this.el.parentElement?.children || []).filter(c => c != this.el && this.el.tagName == c.tagName) as Array<CustomHTMLElement>;
    }, 100)
  }

  onClick(e: MouseEvent) {
    e.preventDefault();
    this.el.style.overflow = 'hidden';

    if (this.isClosing || !this.el.open) {
      this.open();
    } else if (this.isExpanding || this.el.open) {
      this.shrink();
    }
  }

  shrink(instant = false) {
    this.isClosing = true;
    
    const startHeight = `${this.el.offsetHeight}px`;
    const endHeight = `${this.summary.offsetHeight}px`;

    if (this.animation) {
      this.animation.cancel();
    }

    this.animation = this.el.animate({
      height: [startHeight, endHeight]
    }, {
      duration: instant ? 0 : 300,
      easing: 'ease-in-out'
    });

    this.animation.onfinish = () => this.onAnimationFinish(false);
    this.animation.oncancel = () => this.isClosing = false;
  }

  open(instant = false) {
    this.el.style.height = `${this.el.offsetHeight}px`;
    this.el.open = true;
    window.requestAnimationFrame(() => this.expand(instant));

    if (this.el.classList.contains('singleton') && this.siblings.length) {
      this.siblings.forEach(details => details.shrink?.(instant))
    }
  }

  expand(instant = false) {
    this.isExpanding = true;
    const startHeight = `${this.el.offsetHeight}px`;
    const endHeight = `${this.summary.offsetHeight + this.content.offsetHeight}px`;
    
    if (this.animation) {
      this.animation.cancel();
    }
    
    this.animation = this.el.animate({
      height: [startHeight, endHeight]
    }, {
      duration: instant ? 0 : 300,
      easing: 'ease-in-out'
    });

    this.animation.onfinish = () => {
      this.content.querySelectorAll('table-container').forEach(table => {
        (table as any).scroll.updateMetrics()
      });
      this.onAnimationFinish(true);
    };
    
    this.animation.oncancel = () => this.isExpanding = false;
  }

  onAnimationFinish(open: boolean) {
    this.el.open = open;
    this.animation = null;
    this.isClosing = false;
    this.isExpanding = false;
    this.el.classList.toggle('visible', open);
    this.el.style.height = this.el.style.overflow = '';
  }
}

export default Details;

document.body.querySelectorAll('details.accordion').forEach(detail => new Details(detail as HTMLDetailsElement))
