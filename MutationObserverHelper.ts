/**
 * The type definition for a callback function that can be used to handle added or deleted elements.
 * @param {HTMLElement | SVGElement} element - The HTML or SVG element to be handled.
 */
type CustomCallback = (element: HTMLElement | SVGElement, cb: (el: HTMLElement | SVGElement) => void) => void;

/**
 * The type definition for a callback function that can be used to handle custom mutation events.
 * @param {Object} event - The custom event object. Includes the type of mutation ('added' or 'deleted').
 * @param {HTMLElement | SVGElement} element - The HTML or SVG element that was added or deleted.
 */
type ChangeCallback = (event: {type: 'added' | 'deleted'}, element: HTMLElement | SVGElement) => void;

interface ObserverInfo {
  confirmedElements: Set<HTMLElement | SVGElement>;
  observer: MutationObserver;
}

/**
 * A map of MutationObservers. Each entry in the map represents an ObserverInfo object associated with an observed element.
 */
const observers: Map<Element, ObserverInfo> = new Map();

/**
 * The options that can be passed into the MutationObserverHelper function.
 * @typedef {Object} Options
 * @property {Element} [observeElement = document.documentElement] - The element to observe for mutations. Defaults to the document's root element.
 * @property {boolean} [autoUnobserve = true] - Whether to automatically stop observing an element when it is deleted. Defaults to true.
 */
interface Options {
  observeElement?: Element;
  autoUnobserve?: boolean;
}

/**
 * The MutationObserverHelper function. This function creates and manages a MutationObserver for the given element and callback.
 * @param {CustomCallback} callback - The callback function to be executed when an element is added or deleted.
 * @param {Options} [options] - An optional options object. Can be used to specify the element to observe and whether to automatically stop observing an element when it is deleted.
 * @returns {Object} An object with two methods: unobserve and onChange. The unobserve method can be used to stop observing the element(s). The onChange method can be used to add an event listener for custom mutation events.
 */
export default function MutationObserverHelper(
  callback: CustomCallback, 
  options: Options = {}
): {
  unobserve: (element?: HTMLElement | SVGElement) => void,
  onChange: (cb: ChangeCallback) => void
} {
  // Default options
  const observeElement = options.observeElement || document.documentElement;
  const autoUnobserve = options.autoUnobserve ?? false;

  // Retrieve or create the ObserverInfo for the given element
  let observerInfo = observers.get(observeElement);
  if (!observerInfo) {
    observerInfo = {
      confirmedElements: new Set(),
      observer: new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node instanceof HTMLElement || node instanceof SVGElement) {
                if (observerInfo && !observerInfo.confirmedElements.has(node)) {
                  callback(node, (el: HTMLElement | SVGElement) => {
                    observerInfo?.confirmedElements.add(el);
                    triggerEvent('added', el);
                  });
                }
              }
            });
        
            mutation.removedNodes.forEach((node) => {
              if (node instanceof HTMLElement || node instanceof SVGElement) {
                if (observerInfo && observerInfo.confirmedElements.has(node)) {
                  observerInfo.confirmedElements.delete(node);
                  triggerEvent('deleted', node);
                  if (autoUnobserve) {
                    observerInfo.observer.disconnect();
                  }
                }
              }
            });
          }
        }
      })
    };

    observers.set(observeElement, observerInfo);
    observerInfo.observer.observe(observeElement, { childList: true, subtree: true });
  }

  /**
   * A helper function that dispatches a custom event with the given type and node.
   * @param {('added' | 'deleted')} type - The type of mutation.
   * @param {HTMLElement | SVGElement} node - The node that was added or deleted.
   */
  const triggerEvent = (type: 'added' | 'deleted', node: HTMLElement | SVGElement) => {
    const event = new CustomEvent('mutation', { 
      detail: { 
        type, 
        element: node 
      } 
    });
    observeElement?.dispatchEvent(event);
  }

  return {
    /**
     * The unobserve method. Can be used to stop observing the specified element. If no element is specified, all elements are unobserved.
     * @param {HTMLElement | SVGElement} [element] - The element to stop observing. If not specified, all elements are unobserved.
     */
    unobserve: (element?: HTMLElement | SVGElement) => {
      if (element) {
        observerInfo?.confirmedElements.delete(element);
      } else {
        observerInfo?.observer.disconnect();
        observers.delete(observeElement);
      }
    },
    /**
     * The onChange method. Adds an event listener for custom mutation events.
     * @param {ChangeCallback} cb - The callback function to be executed when a custom mutation event occurs.
     */
    onChange: (cb: ChangeCallback) => {
      if ( observeElement ) {
        observeElement.addEventListener('mutation', (e: Event) => {
          cb((e as CustomEvent).detail, (e as CustomEvent).detail.element);
        });
      }
    }
  }
}
