import DS from 'ember-data';

export default class StatusSerializer extends DS.JSONAPISerializer {
    keyForAttribute(attr: string) {
        return attr;
    }

    normalizeResponse(
        store: DS.Store,
        primaryModelClass: ModelWithName,
        payload: any,
        id: string | number,
        requestType: string
    ) {
        const data = {
            id: payload.dataSource, // Assuming dataSource is unique and can be used as ID
            type: primaryModelClass.modelName,
            attributes: {
                dbServerOk: payload.db_server_ok,
                dbServerVersion: payload.db_server_version,
                textServerOk: payload.text_server_ok,
                textServerVersion: payload.text_server_version,
                opasVersion: payload.opas_version,
                dataSource: payload.dataSource,
                timeStamp: payload.timeStamp,
                serverContent: payload.serverContent, // Assuming this matches the structure of ServerContent interface
                sessionId: payload.session_id,
                userIp: payload.user_ip,
                configName: payload.config_name,
                textServerUrl: payload.text_server_url,
                dbServerUrl: payload.db_server_url,
                sitemapPath: payload.sitemap_path,
                googleMetadataPath: payload.google_metadata_path,
                pdfOriginalsPath: payload.pdf_originals_path,
                imageSourcePath: payload.image_source_path,
                imageExpertPicksPath: payload.image_expert_picks_path,
                xmlOriginalsPath: payload.xml_originals_path
            }
        };

        return super.normalizeResponse(store, primaryModelClass, { data }, id, requestType);
    }
}
