export type PossiblePeriodValues = '5' | '10' | '20' | 'all';
export type Period = { translationKey: string; value: PossiblePeriodValues };
export const PERIOD_5_YEARS: Period = { translationKey: 'mostCited.fiveYears', value: '5' };
export const PERIOD_10_YEARS: Period = { translationKey: 'mostCited.tenYears', value: '10' };
export const PERIOD_20_YEARS: Period = { translationKey: 'mostCited.twentyYears', value: '20' };
export const PERIOD_ALL_YEARS: Period = { translationKey: 'mostCited.allYears', value: 'all' };

export const PERIODS = [PERIOD_5_YEARS, PERIOD_10_YEARS, PERIOD_20_YEARS, PERIOD_ALL_YEARS];

export enum WIDGET {
    ACCOLADES,
    EXPERT_PICKS,
    GLOSSARY_TERMS,
    MORE_LIKE_THESE,
    MOST_CITED,
    MOST_VIEWED,
    PAST_SEARCHES,
    RELEVANT_SEARCHES,
    SEMINAL_PAPERS,
    WHATS_NEW,
    YOUR_INTERESTS
}
