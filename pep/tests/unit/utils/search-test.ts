import { QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';

import { SEARCH_FACETS, SearchFacetId, SearchTermId } from 'pep/constants/search';
import { buildSearchQueryParams } from 'pep/utils/search';
import { module, test } from 'qunit';

module('Unit | Utility | search', function() {
    const defaultSearchQueryParamsReturn = {
        abstract: true,
        synonyms: false
    };

    const assertBuildQueryParamsResults = (
        assert: Assert,
        assertObject: {
            message?: string;
            result: QueryParamsObj;
            expected: any;
        }
    ) => {
        assert.deepEqual(
            assertObject.result,
            Object.assign({}, defaultSearchQueryParamsReturn, assertObject.expected),
            assertObject.message
        );
    };

    test('Empty object returns abstract true and synonyms false', function(assert) {
        const result = buildSearchQueryParams({});

        assert.deepEqual(result, defaultSearchQueryParamsReturn);
    });

    test('Single search facets works', function(assert) {
        const allFacets = SEARCH_FACETS;
        assert.expect(allFacets.length);

        const results = new Map();
        allFacets.forEach((facet) => {
            results.set(
                facet.id,
                buildSearchQueryParams({
                    facetValues: [
                        {
                            id: facet.id,
                            value: 'Baker, E'
                        }
                    ]
                })
            );
        });

        assertBuildQueryParamsResults(assert, {
            message: 'Source Type Facet works',
            result: results.get(SearchFacetId.ART_SOURCETYPE),
            expected: {
                facetquery: 'art_sourcetype:(Baker, E)'
            }
        });

        assertBuildQueryParamsResults(assert, {
            message: 'ID Facet works',
            result: results.get(SearchFacetId.ART_ID),
            expected: {
                facetquery: 'art_id:(Baker, E)'
            }
        });

        assertBuildQueryParamsResults(assert, {
            message: 'Source title abbr Facet works',
            result: results.get(SearchFacetId.ART_SOURCETITLEABBR),
            expected: {
                facetquery: 'art_sourcetitleabbr:("Baker, E")'
            }
        });

        assertBuildQueryParamsResults(assert, {
            message: 'Type Facet works',
            result: results.get(SearchFacetId.ART_TYPE),
            expected: {
                facetquery: 'art_type:(Baker, E)'
            }
        });

        assertBuildQueryParamsResults(assert, {
            message: 'Language Facet works',
            result: results.get(SearchFacetId.ART_LANG),
            expected: {
                facetquery: 'art_lang:(Baker, E)'
            }
        });

        assertBuildQueryParamsResults(assert, {
            message: 'Source Code Facet works',
            result: results.get(SearchFacetId.ART_SOURCECODE),
            expected: {
                facetquery: 'art_sourcecode:(Baker, E)'
            }
        });

        assertBuildQueryParamsResults(assert, {
            message: 'Vol Facet works',
            result: results.get(SearchFacetId.ART_VOL),
            expected: {
                facetquery: 'art_vol:(Baker, E)'
            }
        });

        assertBuildQueryParamsResults(assert, {
            message: 'Glossary group terms Facet works',
            result: results.get(SearchFacetId.GLOSSARY_GROUP_TERMS),
            expected: {
                facetquery: 'glossary_group_terms:(Baker, E)'
            }
        });

        assertBuildQueryParamsResults(assert, {
            message: 'Keywords string Facet works',
            result: results.get(SearchFacetId.ART_KWDS_STR),
            expected: {
                facetquery: 'art_kwds_str:("Baker, E")'
            }
        });

        assertBuildQueryParamsResults(assert, {
            message: 'Year int Facet works',
            result: results.get(SearchFacetId.ART_YEAR_INT),
            expected: {
                facetquery: 'art_year_int:([Baker, E])'
            }
        });

        assertBuildQueryParamsResults(assert, {
            message: 'Cited 5 Facet works',
            result: results.get(SearchFacetId.ART_CITED_5),
            expected: {
                facetquery: 'art_cited_5:([Baker, E])'
            }
        });

        assertBuildQueryParamsResults(assert, {
            message: 'Views last 12 months Facet works',
            result: results.get(SearchFacetId.ART_VIEWS_LAST12MOS),
            expected: {
                facetquery: 'art_views_last12mos:([Baker, E])'
            }
        });

        assertBuildQueryParamsResults(assert, {
            message: 'Author facet works',
            result: results.get(SearchFacetId.ART_AUTHORS),
            expected: {
                facetquery: 'art_authors:("Baker, E")'
            }
        });
        assertBuildQueryParamsResults(assert, {
            message: 'Qual facet works',
            result: results.get(SearchFacetId.ART_QUAL),
            expected: {
                facetquery: 'art_qual:("Baker, E")'
            }
        });
    });

    test('Multiple search facets works', function(assert) {
        const multipleAuthorFacets = buildSearchQueryParams({
            facetValues: [
                {
                    id: 'art_authors',
                    value: 'Baker, E'
                },
                {
                    id: 'art_authors',
                    value: 'Baker, A'
                }
            ]
        });

        assertBuildQueryParamsResults(assert, {
            message: 'Multiple Author facets works',
            result: multipleAuthorFacets,
            expected: {
                facetquery: 'art_authors:("Baker, E" OR "Baker, A")'
            }
        });

        const authorsAndSourceTitle = buildSearchQueryParams({
            facetValues: [
                {
                    id: 'art_authors',
                    value: 'Baker, E'
                },
                {
                    id: 'art_authors',
                    value: 'Baker, A'
                },
                {
                    id: 'art_sourcetitleabbr',
                    value: 'test'
                }
            ]
        });

        assertBuildQueryParamsResults(assert, {
            message: 'Multiple Author facets and single source title works',
            result: authorsAndSourceTitle,
            expected: {
                facetquery: 'art_authors:("Baker, E" OR "Baker, A") AND art_sourcetitleabbr:("test")'
            }
        });
    });

    test('Article search works', function(assert) {
        const result = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.ARTICLE, term: 'test' }]
        });

        assertBuildQueryParamsResults(assert, {
            result,
            expected: {
                abstract: true,
                fulltext1: 'body_xml:(test)',
                parascope: 'doc',
                synonyms: false
            }
        });
    });

    test('Author search works', function(assert) {
        const singleAuthorSearch = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.AUTHOR, term: 'Freud' }]
        });

        assertBuildQueryParamsResults(assert, {
            message: 'Single author search works',
            result: singleAuthorSearch,
            expected: {
                author: '"Freud"'
            }
        });

        const multipleAuthorSearch = buildSearchQueryParams({
            searchTerms: [
                { type: SearchTermId.AUTHOR, term: 'Freud' },
                { type: SearchTermId.AUTHOR, term: 'Test' }
            ]
        });

        assertBuildQueryParamsResults(assert, {
            message: 'Multiple author search works',
            result: multipleAuthorSearch,
            expected: {
                author: '(Freud) AND (Test)'
            }
        });

        const orAuthorSearch = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.AUTHOR, term: 'Freud OR Test' }]
        });

        assertBuildQueryParamsResults(assert, {
            message: 'OR author search works',
            result: orAuthorSearch,
            expected: {
                author: '(Freud OR Test)'
            }
        });

        const orAuthorSearchWithInitials = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.AUTHOR, term: 'Freud, J OR Test, M' }]
        });

        assertBuildQueryParamsResults(assert, {
            message: 'OR author search works with initials',
            result: orAuthorSearchWithInitials,
            expected: {
                author: '(Freud, J OR Test, M)'
            }
        });
    });

    test('Cited search works', function(assert) {
        const result = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.CITED, term: 'test' }]
        });

        assertBuildQueryParamsResults(assert, {
            result,
            expected: {
                abstract: true,
                citecount: 'test',
                synonyms: false
            }
        });
    });

    test('Dialog search works', function(assert) {
        const result = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.DIALOG, term: 'test' }]
        });

        assertBuildQueryParamsResults(assert, {
            result,
            expected: {
                abstract: true,
                fulltext1: 'dialogs_xml:(test)',
                parascope: 'dialogs',
                synonyms: false
            }
        });
    });

    test('Dream search works', function(assert) {
        const result = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.DREAM, term: 'test' }]
        });

        assertBuildQueryParamsResults(assert, {
            result,
            expected: {
                abstract: true,
                fulltext1: 'dreams_xml:(test)',
                parascope: 'dreams',
                synonyms: false
            }
        });
    });

    test('End Year search works', function(assert) {
        const result = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.END_YEAR, term: 'test' }]
        });

        assertBuildQueryParamsResults(assert, {
            result,
            expected: {
                abstract: true,
                synonyms: false
            }
        });
    });

    test('Everywhere search works', function(assert) {
        const result = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.EVERYWHERE, term: 'test' }]
        });

        assertBuildQueryParamsResults(assert, {
            result,
            expected: {
                abstract: true,
                fulltext1: 'text:(test)',
                synonyms: false
            }
        });
    });

    test('Quote search works', function(assert) {
        const result = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.QUOTE, term: 'test' }]
        });

        assertBuildQueryParamsResults(assert, {
            result,
            expected: {
                abstract: true,
                fulltext1: 'quotes_xml:(test)',
                synonyms: false
            }
        });
    });

    test('Reference search works', function(assert) {
        const result = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.REFERENCE, term: 'test' }]
        });

        assertBuildQueryParamsResults(assert, {
            result,
            expected: {
                abstract: true,
                fulltext1: 'references_xml:(test)',
                parascope: 'biblios',
                synonyms: false
            }
        });
    });

    test('Start year search works', function(assert) {
        const result = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.START_YEAR, term: 'test' }]
        });

        assertBuildQueryParamsResults(assert, {
            result,
            expected: {
                abstract: true,
                startyear: 'test',
                synonyms: false
            }
        });
    });

    test('Title search works', function(assert) {
        const result = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.TITLE, term: 'test' }]
        });

        assertBuildQueryParamsResults(assert, {
            result,
            expected: {
                abstract: true,
                synonyms: false,
                title: 'test'
            }
        });
    });

    test('Viewed search works', function(assert) {
        const result = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.VIEWED, term: 'test' }]
        });

        assertBuildQueryParamsResults(assert, {
            result,
            expected: {
                abstract: true,
                synonyms: false,
                viewcount: 'test'
            }
        });
    });
});
