import { QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';

import { SearchTermId } from 'pep/constants/search';
import { buildSearchQueryParams } from 'pep/utils/search';
import { module, test } from 'qunit';

module('Unit | Utility | search', function(hooks) {
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

    test('Search Facets works', function(assert) {
        const singleAuthorFacet = buildSearchQueryParams({
            facetValues: [
                {
                    id: 'art_authors',
                    value: 'Baker, E'
                }
            ]
        });
        assertBuildQueryParamsResults(assert, {
            message: 'Single Author facet works',
            result: singleAuthorFacet,
            expected: {
                facetquery: 'art_authors:("Baker, E")'
            }
        });

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
