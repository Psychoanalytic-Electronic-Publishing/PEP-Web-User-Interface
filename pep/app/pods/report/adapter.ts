import ENV from 'pep/config/environment';
import Application from 'pep/pods/application/adapter';

export default class ReportAdapter extends Application {
    async downloadReport(reportType: string, limit: string, offset: string, matchstr: string = '') {
        let url = `${ENV.apiBaseUrl}/v2/Admin/Reports/${reportType}?`;
        const params = new URLSearchParams({
            download: 'true',
            sortorder: 'ASC',
            limit,
            offset,
            matchstr
        });

        const response = await fetch(url + params, {
            method: 'GET',
            headers: this.headers
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response.text();
    }
}

declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        report: ReportAdapter;
    }
}
