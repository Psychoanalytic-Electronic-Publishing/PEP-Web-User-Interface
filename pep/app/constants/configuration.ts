import { SearchFacetId, SearchTermId } from 'pep/constants/search';
import { WIDGET } from 'pep/constants/sidebar';
import { TourStepId } from 'pep/constants/tour';
import { WordWheelSearchType } from 'pep/pods/components/word-wheel/component';

import { GlossaryWidgetLocation } from './sidebar';

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

export interface Publisher {
    embargoYears: string;
    sourceCode: string;
    previewHTML: string;
    fullHTML: string;
    url: string;
}

export interface ExpertPick {
    articleId: string;
    imageId: string;
}

export interface VideoConfiguration {
    url: string;
    aspectRatio: AspectRatio;
}

export interface TourConfiguration {
    title: string;
    text: string;
}

export interface AdminSpecifiedInformation {
    id: string;
    value: string;
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
            whatsNew: {
                limit: number;
            };
            mostCited: {
                limit: number;
            };
            mostViewed: {
                limit: number;
            };
            glossary: {
                limit: {
                    [L in GlossaryWidgetLocation]: number;
                };
            };
            videoPreviews: VideoConfiguration[];
            topicalVideoPreviews: VideoConfiguration[];
            left: WidgetConfiguration[];
            right: WidgetConfiguration[];
        };
        searchHelpVideoUrl: string;
        notificationMessage?: string;
    };
    home: {
        expertPicksStartDate: string;
        expertPicks: ExpertPick[];
    };
    search: {
        hitsInContext: {
            limit: number;
        };
        tooManyResults: {
            threshold: number;
        };
        limitFields: {
            isShown: boolean;
        };
        terms: {
            defaultFields: SearchTermId[];
        };
        facets: {
            valueLimit: number;
            valueMinCount: number;
            defaultFields: SearchFacetId[];
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
        publishers: Publisher[];
        tour: {
            [K in TourStepId]: TourConfiguration;
        };
        cards: {
            [K in WIDGET]?: {
                help: string;
            };
        };
        signInCard: {
            groupInformation: string;
            body: string;
        };
        adminSpecifiedInformationItems: AdminSpecifiedInformation[];
        notificationMessage?: string;
        access: {
            print: {
                help: string;
            };
            download: {
                help: string;
            };
        };
    };
    home: {
        intro: {
            left: string;
            right: string;
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
        expertPickOfTheDay: {
            help: string;
        };
    };
    search: {
        tooManyResults: {
            instructions: string;
        };
        smartSearch: {
            help?: string;
        };
        matchSynonyms: {
            help?: string;
        };
        limitTo: {
            help?: string;
        };
        hitsInContext: {
            help: string;
        };
        terms: {
            types: {
                [K in SearchTermId]?: {
                    prompt?: string;
                    help?: string;
                    wordWheelSearchType?: WordWheelSearchType;
                };
            };
        };
    };
}

export const BASE_CONFIG_NAME = 'common';

export const DEFAULT_BASE_CONFIGURATION: BaseConfiguration = {
    global: {
        cards: {
            glossary: {
                limit: {
                    [GlossaryWidgetLocation.SEARCH]: 15,
                    [GlossaryWidgetLocation.READ]: 15
                }
            },
            whatsNew: {
                limit: 10
            },
            mostCited: {
                limit: 10
            },
            mostViewed: {
                limit: 10
            },
            videoPreviews: [
                {
                    aspectRatio: AspectRatio.SIXTEEN_BY_NINE,
                    url: 'https://pep-web-video-previews.s3.amazonaws.com/peptopauthvs.001.0027a.preview.mp4'
                }
            ],
            topicalVideoPreviews: [
                {
                    aspectRatio: AspectRatio.SIXTEEN_BY_NINE,
                    url: 'https://pep-web-video-previews.s3.amazonaws.com/peptopauthvs.001.0027a.preview.mp4'
                }
            ],
            left: [
                { widget: WIDGET.VIDEO_PREVIEW, open: true },
                { widget: WIDGET.TOPICAL_VIDEO_PREVIEW, open: true }
            ],
            right: [
                { widget: WIDGET.WHATS_NEW, open: true },
                { widget: WIDGET.MOST_CITED, open: true },
                { widget: WIDGET.MOST_VIEWED, open: true },
                { widget: WIDGET.RELATED_DOCUMENTS, open: false },
                { widget: WIDGET.EXPERT_PICKS, open: false },
                { widget: WIDGET.GLOSSARY_TERMS, open: false },
                { widget: WIDGET.MORE_LIKE_THESE, open: false },
                { widget: WIDGET.READ_LATER, open: false },
                { widget: WIDGET.FAVORITES, open: false },
                { widget: WIDGET.PUBLISHER_INFO, open: false }
            ]
        },
        searchHelpVideoUrl: 'https://fb.watch/4634xBWSZF/'
    },
    home: {
        expertPicksStartDate: '2019-01-07T15:14:29-0500',
        expertPicks: [
            {
                articleId: 'IJP.027.0099A',
                imageId: 'CJP.024-025.0233A.FIG001'
            }
        ]
    },
    search: {
        hitsInContext: {
            limit: 3
        },
        tooManyResults: {
            threshold: 200
        },
        limitFields: {
            isShown: false
        },
        terms: {
            defaultFields: [SearchTermId.ARTICLE, SearchTermId.TITLE, SearchTermId.AUTHOR]
        },
        facets: {
            valueLimit: 15,
            valueMinCount: 1,
            defaultFields: [
                SearchFacetId.ART_YEAR_INT,
                SearchFacetId.ART_VIEWS_LAST12MOS,
                SearchFacetId.ART_CITED_5,
                SearchFacetId.ART_AUTHORS,
                SearchFacetId.ART_LANG,
                SearchFacetId.ART_TYPE,
                SearchFacetId.ART_SOURCETYPE,
                SearchFacetId.ART_SOURCETITLEABBR,
                SearchFacetId.GLOSSARY_GROUP_TERMS,
                SearchFacetId.ART_KWDS_STR
            ]
        }
    }
};

export const DEFAULT_CONTENT_CONFIGURATION: ContentConfiguration = {
    global: {
        // [Rel.2] for future release
        tips: {
            isEnabled: true,
            list: []
        },
        publishers: [
            {
                sourceCode: 'IJP',
                previewHTML: 'Preview HTML',
                fullHTML: 'Full HTML',
                embargoYears: '5',
                url: 'https://www.palgrave.com/us/journal/11231'
            },
            {
                sourceCode: 'AIM',
                previewHTML: 'Preview HTML',
                embargoYears: '3',
                fullHTML:
                    "<p>American Imago was founded by Sigmund Freud and Hanns Sachs in the U.S. in 1939 as the successor to Imago, founded by Freud, Sachs, and Otto Rank in Vienna in 1912. Having celebrated its centenary anniversary in 2012, the journal retains its luster as the leading scholarly journal of psychoanalysis. Each issue features cutting-edge articles that explore the enduring relevance of Freud's legacy across the humanities, arts, and social sciences.</p><p>Editor<br>Murray M. Schwartz</p><p>Associate Editor for Film<br>Catherine Portuges</p><p>Associate Editors<br>Vera J. Camden</p><p>David Willbern</p><p>Managing Editor<br>Melissa Skepko</p><p>PUBLISHED BY Johns Hopkins University Press</p>",
                url: 'https://www.google.com'
            },
            {
                sourceCode: 'FD',
                previewHTML: 'Preview HTML',
                embargoYears: '5',
                fullHTML:
                    '<p>A Regional Affiliate of the Division of Psychoanalysis (39), American Psychological Association</p><p>fort da is a psychoanalytic journal that provides a forum for San Francisco Bay Area professionals as well as national and international thinkers and clinicians. fort da publishes work on psychoanalytic theory, practice, research, and applied psychoanalysis -- in the form of articles, reviews, interviews, essays, commentary, and poetry.</p><p>fort da encourages writers to present their ideas and views on psychoanalysis, both inside and outside the consulting room, giving voice to the multiple ways in which psychoanalytic thinking enriches life. We support creative, evocative, and associational styles rather than a strictly academic format, encouraging material that is at once accessible, lively and of a high intellectual standard.</p>',
                url: 'https://www.google.com'
            },
            {
                sourceCode: 'RFP',
                previewHTML: 'Preview HTML',
                embargoYears: '8',
                fullHTML:
                    '<p>The leading French Journal since 1927 and a repository of many of the most important articles in our discipline. Check out the articles by Freud, Lacan, Green, Chasseguet-Smirgel, McDougall, Viderman and many many more. Thanks are due to Denys Ribas (Former editor and President SPP), the Paris Psychoanalytic Society and their library and librarians (SPP), Christine Mique-Bez and Charles Ruelle (Presses Universitaires de France).</p>',
                url: 'https://www.google.com'
            },
            {
                sourceCode: 'PPSY',
                previewHTML: 'Preview HTML',
                embargoYears: '8',
                fullHTML:
                    '<p>Psychoanalytic Psychology serves as a resource for original contributions that reflect and broaden the interaction between psychoanalysis and psychology. Manuscripts that involve issues in psychology raised by psychoanalysis and issues in psychoanalysis raised by psychology are welcome.</p><p>The journal, a quarterly, publishes research papers, clinical papers, literature reviews, clinical notes, brief reports, commentary and book reviews.</p><p>Editor: Elliot L. Jurist<br>Publisher: APA PsycNET</p>',
                url: 'https://www.google.com'
            },
            {
                sourceCode: 'DR',
                previewHTML: 'Preview HTML',
                embargoYears: '8',
                fullHTML:
                    '<p>DIVISION/Review is a forum for review essays, commentary, interviews and discussion in the field of psychoanalysis. It is open to viewpoints from across the spectrum of psychoanalytic schools and disciplines. DIVISION/Review primarily addresses topics related to clinical psychoanalysis but also cultural and intellectual fields beyond that focus.</p><p>The full text of this journal is available up through the current issue for all PEP Archive subscribers.</p>',
                url: 'https://www.google.com'
            },
            {
                sourceCode: 'PB',
                previewHTML: 'Preview HTML',
                embargoYears: '8',
                fullHTML:
                    '<p>Joseph Reppen’s journal, Psychoanalytic Books, is a compendium of reviews of the important books of its era, the 1990’s, written by many of the best scholars in our field.</p>',
                url: 'https://www.google.com'
            }
        ],
        tour: {
            [TourStepId.HOME]: {
                title: 'Home',
                text: 'This button takes you home'
            },
            [TourStepId.TOGGLE_LEFT]: {
                title: 'Search',
                text: 'This button shows/hides the search'
            },
            [TourStepId.TOGGLE_RIGHT]: {
                title: 'Widgets',
                text: 'This button shows/hides the widgets'
            },
            [TourStepId.MAIN_NAVIGATION]: {
                title: 'Navigation',
                text: 'These buttons are your main navigation'
            },
            [TourStepId.LOGO]: {
                title: 'Logo',
                text: 'This is our logo'
            }
        },
        cards: {
            [WIDGET.VIDEO_PREVIEW]: {
                help: 'Check out the latest video in our system here.'
            },
            [WIDGET.TOPICAL_VIDEO_PREVIEW]: {
                help: 'Check out the latest topical video in our system here.'
            },
            [WIDGET.WHATS_NEW]: {
                help: 'The newest additions to our system can be viewed here.'
            },
            [WIDGET.MOST_CITED]: {
                help: 'The most cited documents throughout our system can be viewed here.'
            },
            [WIDGET.MOST_VIEWED]: {
                help: 'The most viewed documents throughout our system can be viewed here.'
            },
            [WIDGET.RELATED_DOCUMENTS]: {
                help:
                    'For documents which have related articles, the {faIcon} icon will show up next to listing, indicating that the article is part of a series or has follow up commentary in the journal.'
            },
            [WIDGET.EXPERT_PICKS]: {
                help: 'Expert picks ...picked expertly for you.'
            },
            [WIDGET.GLOSSARY_TERMS]: {
                help: 'When reading a document, a word cloud of glossary terms will appear here.'
            },
            [WIDGET.MORE_LIKE_THESE]: {
                help: 'Using AI, we recommend documents that we think are similar to the current document your reading.'
            },
            [WIDGET.READ_LATER]: {
                help: 'Save items you want to read later and view them here.'
            },
            [WIDGET.FAVORITES]: {
                help: 'You can save your favorite documents for easy access here.'
            },
            [WIDGET.PUBLISHER_INFO]: {
                help: 'Publisher information for the current document your viewing will appear here.'
            }
        },
        signInCard: {
            groupInformation:
                'You have been granted full archive access to PEP because your institution has a valid subscription based on what is called a “Referral/Federated-OpenAthens/IP Address” logon. But to be able to alter the look and feel of the site, save papers, searches and favorites and many other things, you need to become a registered user (which is free). You do that once, then access this site direct using the personal login you create. (Every 90 days you need to come in via your university/institute to re-validate). If you already have a log-in on the PaDS system, use that.  Click <a href="http://support.pep-web.org/login-help" target="_blank">here</a> for more details.',
            body:
                'This is the Psychoanalytic Electronic Publishing Archive full text database. It is freely available for everyone to search, view tables of contents, and view abstracts and summaries. However you will need a paid subscription in order to view the full text of articles.<br><br>All users can register to get a username and access password that will let you save your application preferences, customize the information displayed by the interface, and save bookmarks and favorites. University, group, and federation users need to register to get an individual login to save their preferences as well.'
        },
        adminSpecifiedInformationItems: [],
        access: {
            print: {
                help: 'Printing is not available for the current document due to copyright security'
            },
            download: {
                help: 'Downloading is not available for the current document due to copyright security'
            }
        }
    },
    home: {
        intro: {
            left:
                '<p>Your search starts here</p><p>Search all of the literature in PEP-WEB in seconds.</p><p class="card-text"><strong>Smart Search</strong> takes all kinds of search inputs:</p><ul><li>Find terms or keywords - to get the best search results, <strong>enter at least two terms at a time.</strong> <br>This will make the search more precise, returning only the most relevant results.</li><li>Paste a reference from an article</li><li>Journal name or part of a journal name</li><li>Author name</li><li>A title or part of a title (five or more words)</li><li>Year / Vol / Page #</li></ul>',
            right:
                '<p>Let PEP be your guide</p><p>PEP-WEB helps to guide you to important source material in your research, and provides numerous tools.</p><p class="card-text">While you <strong>research and explore</strong>, PEP:</p><ul><li>Helps find related publications</li><li>Expert guidance selects the most important related Psychoanalytic works</li><li>Find what\'s new and exciting in the field, what others are reading</li><li>What work is most cited by new publications</li><li>Links content to an integrated Psychoanalytic Glossary incluing Laplanche and Pontails</li></ul>'
        },
        newsAndInfo: {
            boxOne: {
                heading: '77 Premier Psychoanalytic Journals',
                body:
                    'PEP-Web is the quintessential archive of psychoanalytic scholarship, with the full text of 77 premier journals dating back to 1912, cross-linked to each other, and where a multi-source psychoanalytic glossary is a click away for any psychoanalytic term. There are over 122 thousand articles totaling over one million printed pages.'
            },
            boxTwo: {
                heading: '100 Classic Psychoanalytic Books',
                body:
                    'The PEP-Web Archive has the complete content of the Standard Edition of the Complete Psychological Works of Sigmund Freud and the 19 volume German Freud Standard Edition Gesammelte Werke, and includes a concordance between editions where corresponding paragraphs are cross-linked. The Archive also contains 100 classic psychoanalytic books, including classic authors such as Bion, Bowlby, Klein, Meltzer, Winnicott, and many more.'
            }
        },
        expertPickOfTheDay: {
            help: 'This article is picked by us due to it being interesting'
        }
    },
    search: {
        tooManyResults: {
            instructions:
                "Enter at least two terms, additional criteria, and/or use the 'Refine' form below to increase search precision."
        },
        smartSearch: {
            help:
                'This field performs a SmartSearch, a search based on the semantics of what you enter. It can recognize an article citation (author and year) or a reference in APA standard form, a DOI, a year or volume and page number, or a PEP Article ID (Locator). Or if you enter words or phrases, it performs a words within paragraph or phrase search anywhere in the document, other than in abstracts and references (equivalent to an Article search).'
        },
        matchSynonyms: {
            help: 'Return results that contain synonyms or similar words for the entered search terms'
        },
        limitTo: {
            help: 'Restrict the search results to documents with a specific number of citations or views'
        },
        hitsInContext: {
            help: 'Hits in context help text'
        },
        terms: {
            types: {
                everywhere: {
                    prompt: 'Terms or phrase',
                    help:
                        'Search for words in the same paragraph, or phrases of anywhere in the document, including abstracts and references. Surround phrases with quotes.'
                },
                author: {
                    prompt: "Author's name",
                    help:
                        'Search author names (e.g., Lastname, or Lastname, Firstname). Use * to search partial names.',
                    wordWheelSearchType: WordWheelSearchType.TEXT
                },
                title: {
                    prompt: 'Document title',
                    help: 'Search for words or phrases within document titles. Surround phrases with quotes.'
                },
                dream: {
                    prompt: 'Terms or phrase',
                    help:
                        'Search for words in the same paragraph, or phrases, in areas of documents which are descriptions of dreams. Surround phrases with quotes.'
                },
                quote: {
                    prompt: 'Terms or phrase',
                    help:
                        'Search for words in the same paragraph, or phrases, in areas of documents which are quoted passages. Surround phrases with quotes.'
                },
                reference: {
                    prompt: 'Terms or phrase',
                    help:
                        'Search for words in the same reference, or phrases, in the reference section (bibliographies) of documents. Surround phrases with quotes.'
                },
                dialog: {
                    prompt: 'Terms or phrase',
                    help:
                        'Search for words in the same paragraph, or phrases, in areas of documents which are dialogs between people. Surround phrases with quotes.'
                },
                article: {
                    prompt: 'Terms or phrase',
                    help:
                        'Search for words in the same paragraph, or phrases, anywhere in the document EXCEPT in abstracts and references. Surround phrases with quotes.'
                },
                startYear: {
                    prompt: 'Publication year',
                    help:
                        'Find documents published on or before/after a year, or within a range of years (e.g, "1999", "<1999", ">1999", "1999-2010")'
                },
                endYear: {
                    prompt: 'Publication year',
                    help:
                        'Find documents published on or before/after a year, or within a range of years (e.g, "1999", "<1999", ">1999", "1999-2010")'
                }
            }
        }
    }
};
