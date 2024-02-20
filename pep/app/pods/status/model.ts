import Model, { attr } from '@ember-data/model';

// Define TypeScript interfaces for complex objects
interface ServerContent {
    article_count: number;
    journal_count: number;
    video_count: number;
    book_count: number;
    figure_count: number;
    year_count: number;
    year_first: number;
    year_last: number;
    vol_count: number;
    page_count: number;
    page_height_feet: number;
    page_weight_tons: number;
    source_count: Record<string, number>;
    description_html: string;
    source_count_html: string;
}

export default class Status extends Model {
    @attr('boolean') dbServerOk!: boolean;
    @attr('string') dbServerVersion!: string;
    @attr('boolean') textServerOk!: boolean;
    @attr('string') textServerVersion!: string;
    @attr('string') opasVersion!: string;
    @attr('string') dataSource!: string;
    @attr('string') timeStamp!: string;
    @attr() serverContent!: ServerContent;
    @attr('string') sessionId!: string;
    @attr('string') userIp!: string;
    @attr('string') configName!: string;
    @attr('string') textServerUrl!: string;
    @attr('string') dbServerUrl!: string;
    @attr('string') sitemapPath!: string;
    @attr('string') googleMetadataPath!: string;
    @attr('string') pdfOriginalsPath!: string;
    @attr('string') imageSourcePath!: string;
    @attr('string') imageExpertPicksPath!: string;
    @attr('string') xmlOriginalsPath!: string;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        status: Status;
    }
}
