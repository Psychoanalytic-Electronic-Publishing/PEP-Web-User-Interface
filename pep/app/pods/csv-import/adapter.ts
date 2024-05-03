import ENV from 'pep/config/environment';
import Application from 'pep/pods/application/adapter';

type DocumentType = 'Product-Table' | 'Document-References';

export default class CsvImportAdapter extends Application {
    async updateTable(file: File, documentType: DocumentType) {
        if (!file) {
            throw new Error('No file provided');
        }

        const formData = new FormData();
        formData.append('file', file);

        const url = `${ENV.apiBaseUrl}/v2/Admin/CsvImport?${new URLSearchParams({ document_type: documentType })}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: this.headers,
            body: formData
        });

        if (!response.ok) {
            const jsonResp = await response.json();
            throw new Error(jsonResp.detail || 'An error occurred while import the file');
        }

        await response.text();
        return response.ok;
    }
}

declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        'csv-import': CsvImportAdapter;
    }
}
