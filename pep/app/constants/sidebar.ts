export type PossiblePeriodValues = '5' | '10' | '20' | 'all';
export type Period = { translationKey: string; value: PossiblePeriodValues };
export const PERIOD_5_YEARS: Period = { translationKey: 'mostCited.fiveYears', value: '5' };
export const PERIOD_10_YEARS: Period = { translationKey: 'mostCited.tenYears', value: '10' };
export const PERIOD_20_YEARS: Period = { translationKey: 'mostCited.twentyYears', value: '20' };
export const PERIOD_ALL_YEARS: Period = { translationKey: 'mostCited.allYears', value: 'all' };

export const PERIODS = [PERIOD_5_YEARS, PERIOD_10_YEARS, PERIOD_20_YEARS, PERIOD_ALL_YEARS];

export type PossiblePubPeriodValues = '5' | '10' | '20' | '-1';
export type PubPeriod = { translationKey: string; value: PossiblePubPeriodValues };

export const PUBPERIOD_5_YEARS: PubPeriod = { translationKey: 'mostCited.fiveYears', value: '5' };
export const PUBPERIOD_10_YEARS: PubPeriod = { translationKey: 'mostCited.tenYears', value: '10' };
export const PUBPERIOD_20_YEARS: PubPeriod = { translationKey: 'mostCited.twentyYears', value: '20' };
export const PUBPERIOD_ALL_YEARS: PubPeriod = { translationKey: 'mostCited.allYears', value: '-1' };

export const PUBPERIODS = [PUBPERIOD_5_YEARS, PUBPERIOD_10_YEARS, PUBPERIOD_20_YEARS, PUBPERIOD_ALL_YEARS];

export enum WIDGET {
    EXPERT_PICKS = 'expertPicks',
    FAVORITES = 'favorites',
    GLOSSARY_TERMS = 'glossaryTerms',
    MORE_LIKE_THESE = 'moreLikeThese',
    MOST_CITED = 'mostCited',
    MOST_VIEWED = 'mostViewed',
    PAST_SEARCHES = 'pastSearches',
    READ_LATER = 'readLater',
    RELATED_DOCUMENTS = 'relatedDocuments',
    RELEVANT_SEARCHES = 'relevantSearches',
    SEMINAL_PAPERS = 'seminalPapers',
    TOPICAL_VIDEO_PREVIEW = 'topicalVideoPreview',
    VIDEO_PREVIEW = 'videoPreview',
    WHATS_NEW = 'whatsNew',
    YOUR_INTERESTS = 'yourInterests',
    PUBLISHER_INFO = 'publisherInfo'
}

export interface WidgetItem {
    id: WIDGET;
    label: string;
}

export const EXPERT_PICKS: WidgetItem = {
    id: WIDGET.EXPERT_PICKS,
    label: 'relatedInfo.widgets.expertPicks.title'
};

export const FAVORITES: WidgetItem = {
    id: WIDGET.FAVORITES,
    label: 'relatedInfo.widgets.favorites.title'
};

export const GLOSSARY_TERMS: WidgetItem = {
    id: WIDGET.GLOSSARY_TERMS,
    label: 'relatedInfo.widgets.glossaryTerms.title'
};

export const MORE_LIKE_THESE: WidgetItem = {
    id: WIDGET.MORE_LIKE_THESE,
    label: 'relatedInfo.widgets.moreLikeThese.title'
};

export const MOST_CITED: WidgetItem = {
    id: WIDGET.MOST_CITED,
    label: 'relatedInfo.widgets.mostCited.title'
};
export const MOST_VIEWED: WidgetItem = {
    id: WIDGET.MOST_VIEWED,
    label: 'relatedInfo.widgets.mostViewed.title'
};
export const PAST_SEARCHES: WidgetItem = {
    id: WIDGET.PAST_SEARCHES,
    label: 'relatedInfo.widgets.pastSearches.title'
};
export const READ_LATER: WidgetItem = {
    id: WIDGET.READ_LATER,
    label: 'relatedInfo.widgets.readLater.title'
};
export const RELATED_DOCUMENTS: WidgetItem = {
    id: WIDGET.RELATED_DOCUMENTS,
    label: 'relatedInfo.widgets.relatedDocuments.title'
};
export const RELEVANT_SEARCHES: WidgetItem = {
    id: WIDGET.RELEVANT_SEARCHES,
    label: 'relatedInfo.widgets.relevantSearches.title'
};
export const SEMINAL_PAPERS: WidgetItem = {
    id: WIDGET.SEMINAL_PAPERS,
    label: 'relatedInfo.widgets.seminalPapers.title'
};
export const VIDEO_PREVIEW: WidgetItem = {
    id: WIDGET.VIDEO_PREVIEW,
    label: 'relatedInfo.widgets.videoPreview.title'
};
export const WHATS_NEW: WidgetItem = {
    id: WIDGET.WHATS_NEW,
    label: 'relatedInfo.widgets.whatsNew.title'
};
export const YOUR_INTERESTS: WidgetItem = {
    id: WIDGET.YOUR_INTERESTS,
    label: 'relatedInfo.widgets.yourInterests.title'
};
export const PUBLISHER_INFO: WidgetItem = {
    id: WIDGET.PUBLISHER_INFO,
    label: 'relatedInfo.widgets.publisherInfo.title'
};
export const TOPICAL_VIDEO_PREVIEW: WidgetItem = {
    id: WIDGET.TOPICAL_VIDEO_PREVIEW,
    label: 'relatedInfo.widgets.topicalVideoPreview.title'
};

export const WIDGETS = [
    EXPERT_PICKS,
    FAVORITES,
    GLOSSARY_TERMS,
    VIDEO_PREVIEW,
    MORE_LIKE_THESE,
    MOST_CITED,
    MOST_VIEWED,
    PUBLISHER_INFO,
    READ_LATER,
    RELATED_DOCUMENTS,
    TOPICAL_VIDEO_PREVIEW,
    WHATS_NEW
];
export type WidgetData = Partial<Record<WIDGET, any>>;

export enum GlossaryWidgetLocation {
    SEARCH = 'search',
    READ = 'read'
}

export const GlossaryWidgetSearchLocation = {
    id: GlossaryWidgetLocation.SEARCH,
    value: 'searchLimit'
};

export const GlossaryWidgetReadLocation = {
    id: GlossaryWidgetLocation.READ,
    value: 'readLimit'
};

export const GlossaryWidgetLocations = [GlossaryWidgetSearchLocation, GlossaryWidgetReadLocation];
