const ValidCssUnits = ['em', 'ex', 'ch', 'rem', 'vw', 'vh', 'vmin', 'vmax', 'cm', 'mm', 'in', 'px', 'pt', 'pc'] as const;
type CSSUnits = typeof ValidCssUnits[number];
type PropertyMap = Record<string, string | number>;
type PropertyInput = string | PropertyMap;
type PropertyOutput = string | number | PropertyMap;

/**
 * If a string ends with a given css unit then parse that string to a number.
 * @param {...any} String - Parse only given CSS units. Fallsback to all native unit types 
 * @returns {String}
 */
function parseCssUnits(value: string, units: readonly CSSUnits[] = ValidCssUnits): string | number {
  if (units.find(unit => value.endsWith(unit))) {
    return Number(parseFloat(value).toFixed(4));
  }
  return value;
}

/**
 * Assign a custom property
 * @param {HTMLElement | SVGElement} target
 * @param {Record<string, string> | string} properties - CSS property name that will be prefixed with a double hyphen.
 *                        An associated object where keys are properties and values are values
 *                        so you can add multiple custom properties in one go.
 * @param {string} value - CSS value
 * @example element.setCustomProperty('nav-bar-height', '200px')
 * @example element.setCustomProperty({nav-bar-height : '200px', 'nav-bar-width' : 100px})
 */
export function setCustomProperty(target: HTMLElement | SVGElement, properties: PropertyInput, value?: string | number): void {
  let propMap: PropertyMap;

  if (typeof properties === 'string') {
    if (value !== undefined) {
      propMap = { [properties]: value };
    } else {
      throw new Error('Value must be defined when properties is a string');
    }
  } else {
    propMap = properties;
  }

  if (target.style) {
    Object.entries(propMap).forEach(([property, value]) => {
      target.style.setProperty(`--${property.replace(/^--/g, '')}`, value as string);
    });
  }
}

/**
 * Get a custom property
 * @see https://stackoverflow.com/a/24457420/843131 - isNumeric
 * @param {HTMLElement | SVGElement} target
 * @param {...(string | boolean)} properties
 * * @option Passing in 'true' will parse any 'px' css units to numbers
 * * @option Passing in multiple string will return an object
 * @example element.getCustomProperty('nav-bar-height') // '200px'
 * @example element.getCustomProperty('nav-bar-height', true) // 200
 * @example element.getCustomProperty('nav-bar-height', 'side-bar-width', true) // { nav-bar-height : 200, side-bar-width : 233 }
 * @return {Record<string, string | number> | string | number}
 */
export function getCustomProperty(target: HTMLElement | SVGElement, ...properties: (string | boolean)[]): PropertyOutput {
  let shouldParseCssUnits = properties.includes(true);
  let propertyNames = properties.filter((e) => typeof e === 'string') as string[];
  let result: PropertyOutput = propertyNames.length === 1 ? '' : {};

  propertyNames.forEach(property => {
    let value: string | number = getComputedStyle(target).getPropertyValue(`--${property.replace(/^--/g, '')}`).trim();
    value = /^-?\d+$/.test(value) ? +value : value;
    if (shouldParseCssUnits && typeof value === 'string') {
      value = parseCssUnits(value);
    }
    if (typeof result === 'object' && result !== null) {
      result[property] = value;
    }
  });

  return result;
}

/**
 * Remove custom properties
 * @example element.removeCustomProperty(nav-bar-height)
 * @param {HTMLElement | SVGElement} target
 * @param {...string} properties
 */
export function removeCustomProperty(target: HTMLElement | SVGElement, ...properties: string[]): void {
  if (target.style) {
    properties.forEach(property => {
      target.style.removeProperty(`--${property.replace(/^--/g, '')}`);
    });
  }
}