export type PossiblePeriodValues = '5' | '10' | '20' | '';
export type Period = { translationKey: string; value: PossiblePeriodValues };
export const PERIOD_5_YEARS: Period = { translationKey: 'mostCited.fiveYears', value: '5' };
export const PERIOD_10_YEARS: Period = { translationKey: 'mostCited.tenYears', value: '10' };
export const PERIOD_20_YEARS: Period = { translationKey: 'mostCited.twentyYears', value: '20' };
export const PERIOD_ALL_YEARS: Period = { translationKey: 'mostCited.allYears', value: '' };

export const PERIODS = [PERIOD_5_YEARS, PERIOD_10_YEARS, PERIOD_20_YEARS, PERIOD_ALL_YEARS];

export type PossiblePubPeriodValues = '5' | '10' | '20' | '-1';
export type PubPeriod = { translationKey: string; value: PossiblePubPeriodValues };

export const PUBPERIOD_5_YEARS: PubPeriod = { translationKey: 'mostCited.fiveYears', value: '5' };
export const PUBPERIOD_10_YEARS: PubPeriod = { translationKey: 'mostCited.tenYears', value: '10' };
export const PUBPERIOD_20_YEARS: PubPeriod = { translationKey: 'mostCited.twentyYears', value: '20' };
export const PUBPERIOD_ALL_YEARS: PubPeriod = { translationKey: 'mostCited.allYears', value: '-1' };

export const PUBPERIODS = [PUBPERIOD_5_YEARS, PUBPERIOD_10_YEARS, PUBPERIOD_20_YEARS, PUBPERIOD_ALL_YEARS];

export enum WIDGET {
    EXPERT_PICKS = 'expert-picks',
    FAVORITES = 'favorites',
    GLOSSARY_TERMS = 'glossary-terms',
    MORE_LIKE_THESE = 'more-like-these',
    MOST_CITED = 'most-cited',
    MOST_VIEWED = 'most-viewed',
    PAST_SEARCHES = 'past-searches',
    READ_LATER = 'read-later',
    RELATED_DOCUMENTS = 'related-documents',
    RELEVANT_SEARCHES = 'relevant-searches',
    SEMINAL_PAPERS = 'seminal-papers',
    VIDEO_PREVIEW = 'video-preview',
    WHATS_NEW = 'whats-new',
    YOUR_INTERESTS = 'your-interests',
    PUBLISHER_INFO = 'publisher-info'
}

export type WidgetData = Partial<Record<WIDGET, any>>;
