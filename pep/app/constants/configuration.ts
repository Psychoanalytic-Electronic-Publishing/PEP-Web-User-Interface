import { WIDGET } from 'pep/constants/sidebar';

/**
 * Widget configuration - tells us which widget and whether its open
 *
 * @export
 * @interface WidgetConfiguration
 */
export interface WidgetConfiguration {
    widget: WIDGET;
    open: boolean;
}

export enum AspectRatio {
    TWENTY_ONE_BY_NINE = '21by9',
    SIXTEEN_BY_NINE = '16by9',
    FOUR_BY_THREE = '4by3'
}
/**
 * Base admin configuration fields for the application
 * MUST NOT contain any configuration data/content that is language-dependent
 * (that should be stored in ContentConfiguration)
 * @export
 * @interface BaseConfiguration
 */
export interface BaseConfiguration {
    global: {
        cards: {
            left: WidgetConfiguration[];
            right: WidgetConfiguration[];
        };
        video: {
            code: string;
            aspectRatio: AspectRatio;
        };
    };
    home: {
        expertPick: {
            articleId: string;
            imageId: string;
        };
    };
}

/**
 * Content admin configuration fields for the application
 * All language-dependent data/content should be stored here
 * @export
 * @interface ContentConfiguration
 */
export interface ContentConfiguration {
    global: {
        // [Rel.2] for future release
        tips: {
            isEnabled: boolean;
            list: {
                shortDescription: string;
                longDescription?: string;
            }[];
        };
    };
    home: {
        intro: {
            left: {
                heading: string;
                subheading?: string;
                body: string;
            };
            right: {
                heading: string;
                subheading?: string;
                body: string;
            };
        };
        newsAndInfo: {
            boxOne: {
                heading?: string;
                body: string;
            };
            boxTwo: {
                heading?: string;
                body: string;
            };
        };
    };
}

export const BASE_CONFIG_NAME = 'pep-base';
export const CONTENT_CONFIG_NAME = 'pep-content';

export const DEFAULT_BASE_CONFIGURATION: BaseConfiguration = {
    global: {
        cards: {
            left: [{ widget: WIDGET.VIDEO_PREVIEW, open: true }],
            right: [
                { widget: WIDGET.WHATS_NEW, open: true },
                { widget: WIDGET.MOST_CITED, open: true },
                { widget: WIDGET.MOST_VIEWED, open: true },
                { widget: WIDGET.EXPERT_PICKS, open: false },
                { widget: WIDGET.GLOSSARY_TERMS, open: false },
                { widget: WIDGET.MORE_LIKE_THESE, open: false },
                { widget: WIDGET.PAST_SEARCHES, open: false },
                { widget: WIDGET.RELEVANT_SEARCHES, open: false },
                { widget: WIDGET.SEMINAL_PAPERS, open: false },
                { widget: WIDGET.YOUR_INTERESTS, open: false }
            ]
        },
        video: {
            aspectRatio: AspectRatio.SIXTEEN_BY_NINE,
            code:
                '<iframe src="https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fpepweb%2Fvideos%2F1085606578152566%2F&show_text=0" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true" allowFullScreen="true"></iframe>'
        }
    },
    home: {
        expertPick: {
            articleId: 'CJP.024A.0233A',
            imageId: 'CJP.024-025.0233A.FIG001'
        }
    }
};

export const DEFAULT_CONTENT_CONFIGURATION: ContentConfiguration = {
    global: {
        // [Rel.2] for future release
        tips: {
            isEnabled: true,
            list: []
        }
    },
    home: {
        intro: {
            left: {
                heading: 'Your search starts here',
                subheading: 'Search all of the literature in PEP-WEB in seconds.',
                body:
                    '<p class="card-text"><strong>Smart Search</strong> taskes all kinds of search inputs:</p><ul><li>Find terms or keywords - to get the best search results, <strong>enter at least two terms at a time.</strong> <br>This will make the search more precise, returning only the most relevant results.</li><li>Paste a reference from an article</li><li>Journal name or part of a journal name</li><li>Author name</li><li>Part of a title (two or more words)</li><li>Year / Vol / Page #</li></ul>'
            },
            right: {
                heading: 'Let PEP be your guide',
                subheading:
                    'PEP-WEB helps to guide you to important source material in your research, and provides numerous tools.',
                body:
                    '<p class="card-text">While you <strong>research and explore</strong>, PEP:</p><ul><li>Helps find related publications</li><li>Expert guidance selects the most important related Psychoanalytic works</li><li>Find what\'s new and exciting in the field, what others are reading</li><li>What work is most cited by new publications</li><li>Links content to an integrated Psychoanalytic Glossary incluing Laplanche and Pontails</li></ul>'
            }
        },
        newsAndInfo: {
            boxOne: {
                heading: '59 Premier Psychoanalytic Journals',
                body:
                    'The PEP-Web Archive is the quintessential website for psychoanalytic scholarship, with the full text of 59 journals dating back to 1918, cross-linked to each other and full bibliographic references to external sources, and where a multi-source psychoanalytic glossary is a click away for any technical term.'
            },
            boxTwo: {
                heading: '96 Classic Psychoanalytic Books',
                body:
                    'The complete content of Sigmund Freud’s Standard Edition where each paragraph is cross-linked to the corresponding text in the German Freud Gesammelte Werke. Including 96 books from classic authors such as Bion, Bowlby, Klein, Meltzer, Winnicott, and many more.'
            }
        }
    }
};
