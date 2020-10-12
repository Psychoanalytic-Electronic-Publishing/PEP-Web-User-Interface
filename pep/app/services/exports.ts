import Service from '@ember/service';

import Papa from 'papaparse';

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
    constructor() {
        super();

        Object.keys(ExportType).forEach((key: ExportType) => {
            const mimetype = ExportMimeType[key]
            if (mimetype) {
                this.exports.set(key, {
                    id: key,
                    mimetype
                });
            }
        });
    }
    openSaveFileDialog(data: any, filename: string, mimetype?: ExportMimeType) {
        if (!data) return;

        const blob =
            data.constructor !== Blob ? new Blob([data], { type: mimetype || 'application/octet-stream' }) : data;

        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, filename);
            return;
        }

        const lnk = document.createElement('a'),
            url = window.URL;
        let objectURL = url.createObjectURL(blob);

        if (mimetype) {
            lnk.type = mimetype;
        }

        lnk.download = filename || 'untitled';
        lnk.href = objectURL;
        lnk.dispatchEvent(new MouseEvent('click'));
        setTimeout(url.revokeObjectURL.bind(url, objectURL));
    }

    export(type: ExportType, fileName: string, data: any[] | { fields: any[], data: any[] }) {
        const exportValue = this.exports.get(type);
        const method = `export${exportValue?.id}` as keyof this;
        const exportedData = ((this[method] as unknown) as Function)(data);
        this.openSaveFileDialog(exportedData, fileName, exportValue?.mimetype);
    }

    exportCSV(data: any[]) {
        return Papa.unparse(data);
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        exports: ExportsService;
    }
}
