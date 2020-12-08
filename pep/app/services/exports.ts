import Service from '@ember/service';

import Papa from 'papaparse';
import { guard } from 'pep/utils/types';

export enum ExportType {
    CSV = 'CSV',
    RTF = 'RTF'
}

export enum ExportMimeType {
    CSV = 'text/csv;charset=utf-8;',
    RTF = 'text/rtf;charset=utf-8;'
}

export interface Export {
    id: ExportType;
    mimetype: ExportMimeType;
}

export const CSVExport: Export = {
    id: ExportType.CSV,
    mimetype: ExportMimeType.CSV
};

export default class ExportsService extends Service {
    exports: Map<ExportType, Export> = new Map();
    /**
     * Creates an instance of ExportsService. Also sets up the exports map that has all the possible exports
     * @memberof ExportsService
     */
    constructor() {
        super();

        Object.keys(ExportType).forEach((key: ExportType) => {
            const mimetype = ExportMimeType[key];
            if (mimetype) {
                this.exports.set(key, {
                    id: key,
                    mimetype
                });
            }
        });
    }

    /**
     * Main method to export data into a multitude of different formats
     *
     * @param {ExportType} type
     * @param {string} fileName
     * @param {(any[] | { fields: any[]; data: any[] })} data
     * @memberof ExportsService
     */
    export(type: ExportType, fileName: string, data: any[] | { fields: any[]; data: any[] }) {
        const exportValue = this.exports.get(type);
        const method = `_export${exportValue?.id}` as keyof this;
        const exportedData = ((this[method] as unknown) as Function)(data);
        this._openSaveFileDialog(exportedData, fileName, exportValue?.mimetype);
    }

    /**
     * Private method to export CSV
     *
     * @param {any[]} data
     * @returns
     * @memberof ExportsService
     */
    _exportCSV(data: any[]) {
        return Papa.unparse(data);
    }

    /**
     * Private method that creates the file and downloads it
     *
     * @param {*} data
     * @param {string} filename
     * @param {ExportMimeType} [mimetype]
     * @returns
     * @memberof ExportsService
     */
    _openSaveFileDialog(data: any, filename: string, mimetype?: ExportMimeType) {
        if (!data) return;

        const blob =
            data.constructor !== Blob ? new Blob([data], { type: mimetype || 'application/octet-stream' }) : data;

        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, filename);
            return;
        }
        this._downloadItem(blob, filename, mimetype);
    }

    _downloadItem(urlOrBlob: string | Blob, filename: string, mimetype?: string) {
        const lnk = document.createElement('a'),
            url = window.URL;

        let objectURL = urlOrBlob;
        if (guard<Blob>(urlOrBlob, 'size')) {
            objectURL = url.createObjectURL(urlOrBlob);
        }

        if (mimetype) {
            lnk.type = mimetype;
        }

        lnk.download = filename || 'untitled';
        lnk.href = objectURL as string;
        lnk.dispatchEvent(new MouseEvent('click'));
        setTimeout(url.revokeObjectURL.bind(url, objectURL));
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        exports: ExportsService;
    }
}
