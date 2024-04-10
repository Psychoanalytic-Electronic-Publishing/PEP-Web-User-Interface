import ENV from 'pep/config/environment';
import Application from 'pep/pods/application/adapter';

export default class ProductbaseAdapter extends Application {
    async updateTable(file: File) {
        if (!file) {
            throw new Error('No file provided');
        }

        const formData = new FormData();
        formData.append('file', file);

        const url = `${ENV.apiBaseUrl}/v2/Admin/UpdateProductbase/`;

        const response = await fetch(url, {
            method: 'POST',
            headers: this.headers,
            body: formData
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        await response.text();
        return response.ok;
    }
}

declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        productbase: ProductbaseAdapter;
    }
}
