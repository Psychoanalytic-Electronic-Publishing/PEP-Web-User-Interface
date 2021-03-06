import { isNone } from '@ember/utils';

import fetch from 'fetch';
import { DocumentLinkTypes } from 'pep/constants/documents';

export interface ElementOffset {
    top: number;
    left: number;
}

export enum PepXmlTagNames {
    ARTICLE_INFO = 'artinfo',
    BIBLIOGRAPHY = 'bib',
    BIBLIOGRAPHY_SOURCE = 'be',
    PAGE_BREAK = 'pb',
    NUMBER = 'n',
    FOOT_NOTE = 'ftn'
}

/**
 * Returns the top/left offset of an element relative to the entire document
 * @param {HTMLElement} el
 * @returns {ElementOffset}
 */
export function getElementOffset(el: HTMLElement): ElementOffset {
    const rect = el.getBoundingClientRect();
    const scrollLeft = window?.pageXOffset || document?.documentElement?.scrollLeft || 0;
    const scrollTop = window?.pageYOffset || document?.documentElement?.scrollTop || 0;
    return {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft
    };
}

/**
 * Returns the clientX/clientY offset values for a mouse or touch event
 * @param {(MouseEvent | TouchEvent)} event
 * @returns {ElementOffset}
 */
export function getEventOffset(event: MouseEvent | TouchEvent): ElementOffset {
    const touchData = (event as TouchEvent)?.touches?.[0];
    const mouseData = event as MouseEvent;
    return touchData
        ? { left: touchData.clientX, top: touchData.clientY }
        : { left: mouseData.clientX, top: mouseData.clientY };
}

/**
 * Returns the current text cursor/caret position for the given element
 * @param {HTMLInputElement | HTMLTextAreaElement} input
 * @returns {number}
 */
export function getCaretPosition(input: HTMLInputElement | HTMLTextAreaElement): number {
    let pos = 0;

    if (!isNone(input.selectionStart)) {
        pos = (input.selectionDirection === 'backward' ? input.selectionStart : input.selectionEnd) ?? 0;
    }

    return pos;
}

export function findElements(source: Element | XMLDocument, tagName: PepXmlTagNames): Element[] {
    const elements = Array.from(source.getElementsByTagName(tagName) ?? []);
    return elements;
}

export function findElement(source: Element | XMLDocument, tagName: PepXmlTagNames): Element {
    return source.getElementsByTagName(tagName)[0];
}

export function parseXML(input: string): XMLDocument | Error {
    if (window.DOMParser) {
        const parser = new DOMParser();
        return parser.parseFromString(input, 'text/xml');
    } else if (typeof window.ActiveXObject != 'undefined' && new window.ActiveXObject('Microsoft.XMLDOM')) {
        const xmlDoc = new window.ActiveXObject('Microsoft.XMLDOM');
        xmlDoc.async = 'false';
        xmlDoc.loadXML(input);
        return xmlDoc;
    } else {
        return new Error('Unable to parse xml');
    }
}

/**
 * Load the XSLT doc to do the parsing of the xml
 *
 * @return {XSLT}
 */
export async function loadXSLT(this: any): Promise<Document | null> {
    try {
        const response = await fetch('/xmlToHtml.xslt');
        const text = await response.text();
        if (text) {
            const xml = parseXML(text);
            return xml as Document;
        } else {
            return null;
        }
    } catch (errors) {
        return null;
    }
}

/**
 * Build the HTML to jump to search hits
 *
 * @export
 * @param {number} anchorCount
 * @return {object}
 */
export function buildJumpToHitsHTML(anchorCount: number): { previous: string; next: string } {
    const previous = `<button data-target-search-hit="${anchorCount}" data-type="${DocumentLinkTypes.SEARCH_HIT_ARROW}" class="btn btn-link py-0 pr-1 pl-0">&#171;&#171;</button>`;
    const next = `<button data-target-search-hit="${anchorCount + 1}" data-type="${
        DocumentLinkTypes.SEARCH_HIT_ARROW
    }" class="btn btn-link py-0 pl-1 pr-0">&#187;&#187;</button>`;
    return {
        previous,
        next
    };
}

// Hoisted from removeClass, doesn't need to be defined multiple times.
// Identifies the whitespace that should be used for replacement.
function replacer(_match: string, leading: string, trailing: string) {
    if (leading && trailing) {
        // We're in the middle of the class string.
        // The portions on either side of us still need space separation.
        return ' ';
    } else {
        return '';
    }
}

/**
 * Implements a simple class name removal algorithm.
 * Does not use built-ins to enable working in both FastBoot and older browsers.
 * Removes all copies of the class name from the element.
 *
 * @method removeClass
 * @param {Element} element A DOM element.
 * @param {String} className The className to add to the element.
 * @public
 */
export function removeClass(element: HTMLElement, className: string): void {
    const existingClass = element.getAttribute('class');

    if (existingClass) {
        const classNameRegExp = new RegExp(`(^|\\s+)${className}(?:\\s+${className})*(\\s+|$)`, 'g');
        const newClassName = existingClass.replace(classNameRegExp, replacer);
        element.setAttribute('class', newClassName);
    }
}

/**
 * Implements a simple class name addition algorithm.
 * Does not use built-ins to enable working in both FastBoot and older browsers.
 *
 * @method addClass
 * @param {Element} element A DOM element.
 * @param {String} className The className to add to the element.
 * @public
 */
export function addClass(element: HTMLElement, className: string): void {
    const existingClass = element.getAttribute('class');

    if (existingClass) {
        const classes = existingClass.split(' ');

        if (~classes.indexOf(className)) {
            return;
        }

        element.setAttribute('class', `${existingClass} ${className}`);
    } else {
        element.setAttribute('class', className);
    }
}
