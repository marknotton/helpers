/**
 * Copy attributes from a given node element to another
 * @param {Element} node - The element you want to clone attributes to 
 * @param {Array|String} exclusions - list of attributes you don't want to copy over
 */
export function cloneAttributes(fromNode: HTMLElement | SVGElement, toNode: HTMLElement | SVGElement, exclusions?: string | string[]): void {
  if (typeof exclusions === 'undefined') {
    exclusions = [];
  }

  if (typeof exclusions === 'string') {
    exclusions = [exclusions];
  }

  Array.from(fromNode.attributes).forEach((attr: Attr) => {
    if (!exclusions?.includes(attr.nodeName)) {
      const nodeValue: string = attr.nodeValue as string; // Type assertion

      if (attr.nodeName === 'class' && nodeValue !== null) {
        toNode.classList.add(...nodeValue.split(' '));
      } else if (nodeValue !== null) {
        toNode.setAttribute(attr.nodeName, nodeValue);
      }
    }
  });
}
