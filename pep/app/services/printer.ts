import Service from '@ember/service';

import printJS from 'print-js';

export default class PrinterService extends Service {
    /**
     * Print data using [PrintJS](https://printjs.crabbly.com/)
     *
     * @template M
     * @param {M[]} data
     * @param {{ field: keyof M; displayName: string }[]} properties
     * @memberof PrinterService
     */
    print<M>(data: M[], properties: { field: keyof M; displayName: string }[]) {
        printJS({
            printable: data,
            type: 'json',
            properties
        });
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        printer: PrinterService;
    }
}
