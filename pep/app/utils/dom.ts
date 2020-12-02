import { isNone } from '@ember/utils';

import fetch from 'fetch';

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
export function getCaretPosition(input: HTMLInputElement | HTMLTextAreaElement) {
    let pos = 0;

    if (!isNone(input.selectionStart)) {
        pos = (input.selectionDirection === 'backward' ? input.selectionStart : input.selectionEnd) ?? 0;
    }

    return pos;
}

export function findElements(source: Element | XMLDocument, tagName: PepXmlTagNames) {
    const elements = Array.from(source.getElementsByTagName(tagName) ?? []);
    return elements;
}

export function findElement(source: Element | XMLDocument, tagName: PepXmlTagNames) {
    return source.getElementsByTagName(tagName)[0];
}

export function parseXML(input: string): XMLDocument | Error {
    if (window.DOMParser) {
        const parser = new DOMParser();
        return parser.parseFromString(input, 'text/xml');
    } else if (typeof window.ActiveXObject != 'undefined' && new window.ActiveXObject('Microsoft.XMLDOM')) {
        var xmlDoc = new window.ActiveXObject('Microsoft.XMLDOM');
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
 * Convert object to browser encoded string
 *
 * @export
 * @param {*} object
 * @return {*}
 */
export function convertToBrowserQueryParamString(object: any) {
    return Object.keys(object)
        .reduce<string[]>(function(a, k) {
            a.push(k + '=' + encodeURIComponent(object[k]));
            return a;
        }, [])
        .join('&');
}
