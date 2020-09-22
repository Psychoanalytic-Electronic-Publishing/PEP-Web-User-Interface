import { SearchTermId, SearchFacetId } from 'pep/constants/search';

/**
 * Base admin configuration fields for the application
 * MUST NOT contain any configuration data/content that is language-dependent
 * (that should be stored in ContentConfiguration)
 * @export
 * @interface BaseConfiguration
 */
export interface BaseConfiguration {
    home: {
        expertPick: {
            articleId: string;
            imageId: string;
        };
    };
    search: {
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
            list: Array<{
                shortDescription: string;
                longDescription?: string;
            }>;
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
    search: {
        tooManyResults: {
            instructions: string;
        };
        smartSearch: {
            help?: string;
        };
        terms: {
            types: {
                [K in SearchTermId]?: {
                    prompt?: string;
                    help?: string;
                };
            };
        };
    };
}

export const BASE_CONFIG_NAME = 'pep-base';
export const CONTENT_CONFIG_NAME = 'pep-content';

export const DEFAULT_BASE_CONFIGURATION: BaseConfiguration = {
    home: {
        expertPick: {
            articleId: 'CJP.024A.0233A',
            imageId: 'CJP.024-025.0233A.FIG001'
        }
    },
    search: {
        tooManyResults: {
            threshold: 200
        },
        limitFields: {
            isShown: false
        },
        terms: {
            defaultFields: [SearchTermId.EVERYWHERE, SearchTermId.TITLE, SearchTermId.AUTHOR]
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
        }
    },
    home: {
        intro: {
            left: {
                heading: 'Your search starts here',
                subheading: 'Search all of the literature in PEP-WEB in seconds.',
                body:
                    '<p class="card-text"><strong>Smart Search</strong> takes all kinds of search inputs:</p><ul><li>Find terms or keywords - to get the best search results, <strong>enter at least two terms at a time.</strong> <br>This will make the search more precise, returning only the most relevant results.</li><li>Paste a reference from an article</li><li>Journal name or part of a journal name</li><li>Author name</li><li>Part of a title (two or more words)</li><li>Year / Vol / Page #</li></ul>'
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
        terms: {
            types: {
                everywhere: {
                    prompt: 'Terms or phrase',
                    help:
                        'Search for words in the same paragraph, or phrases of anywhere in the document, including abstracts and references. Surround phrases with quotes.'
                },
                author: {
                    prompt: "Author's name",
                    help: 'Search author names (e.g., Lastname, or Lastname, Firstname). Use * to search partial names.'
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
