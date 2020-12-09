import Service from '@ember/service';

import printJS from 'print-js';

export default class PrinterService extends Service {
    /**
     * Convert document data to a list of bibliographic items
     *
     * @param {Document[]} data
     * @return {*}
     * @memberof PrinterService
     */
    dataToBibliographicHTML(data: any[]) {
        const listItemsHtml = data.map((item) => {
            return `<li class="mb-3 print-item">${item.authorMast}, ${item.year}, ${item.title}, ${item.documentRef}</li>`;
        });
        const html = `<div><ul class="list-unstyled">${listItemsHtml.join('')}</ul></div>`;
        return html;
    }
    /**
     * Print data using [PrintJS](https://printjs.crabbly.com/)
     *
     * @template M
     * @param {M[]} data
     * @param {{ field: keyof M; displayName: string }[]} properties
     * @memberof PrinterService
     */
    printJSON<M>(data: M[], properties: { field: keyof M; displayName: string }[]) {
        printJS({
            printable: data,
            type: 'json',
            properties
        });
    }

    /**
     * Print data using [PrintJS](https://printjs.crabbly.com/)
     *
     * @param {string} data
     * @memberof PrinterService
     */
    printHTML(data: string) {
        printJS({
            printable: data,
            type: 'raw-html',
            style: `.list-unstyled { padding-left: 0; list-style: none; font-size: 12px; } .mb-3 { margin-bottom: 1rem !important; }`
        });
    }

    /**
     * Print contents of an html element
     *
     * @param {HTMLElement} element
     * @memberof PrinterService
     */
    printElement(element: string) {
        printJS({
            printable: element
        });
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        printer: PrinterService;
    }
}
