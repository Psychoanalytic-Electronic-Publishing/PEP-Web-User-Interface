import { QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';

import { SearchTermId } from 'pep/constants/search';
import { buildSearchQueryParams } from 'pep/utils/search';
import { module, test } from 'qunit';

module('Unit | Utility | search', function(hooks) {
    const defaultSearchQueryParamsReturn = {
        abstract: true,
        synonyms: false
    };

    const assertBuildQueryParamsResults = (assert: Assert, result: QueryParamsObj, expected: any) => {
        assert.deepEqual(result, Object.assign({}, defaultSearchQueryParamsReturn, expected));
    };

    test('Empty object returns abstract true and synonyms false', function(assert) {
        const result = buildSearchQueryParams({});

        assert.deepEqual(result, defaultSearchQueryParamsReturn);
    });

    test('Single author facets works', function(assert) {
        const result = buildSearchQueryParams({
            facetValues: [
                {
                    id: 'art_authors',
                    value: 'Baker, E'
                }
            ]
        });
        assertBuildQueryParamsResults(assert, result, {
            facetquery: 'art_authors:("Baker, E")'
        });
    });

    test('Multiple author facets works', function(assert) {
        const result = buildSearchQueryParams({
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
        assertBuildQueryParamsResults(assert, result, {
            facetquery: 'art_authors:("Baker, E" OR "Baker, A")'
        });
    });

    test('Multiple author facets + source title', function(assert) {
        const result = buildSearchQueryParams({
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

        assertBuildQueryParamsResults(assert, result, {
            facetquery: 'art_authors:("Baker, E" OR "Baker, A") AND art_sourcetitleabbr:("test")'
        });
    });

    test('Multiple author facets + multiple author search', function(assert) {
        const result = buildSearchQueryParams({
            searchTerms: [
                { type: SearchTermId.AUTHOR, term: 'Freud' },
                { type: SearchTermId.AUTHOR, term: 'Test' }
            ],
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

        assertBuildQueryParamsResults(assert, result, {
            author: '(Freud) AND (Test)',
            facetquery: 'art_authors:("Baker, E" OR "Baker, A") AND art_sourcetitleabbr:("test")'
        });
    });

    test('Article search works', function(assert) {
        const result = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.ARTICLE, term: 'test' }]
        });

        assertBuildQueryParamsResults(assert, result, {
            abstract: true,
            fulltext1: 'body_xml:(test)',
            parascope: 'doc',
            synonyms: false
        });
    });

    test('Cited search works', function(assert) {
        const result = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.CITED, term: 'test' }]
        });

        assertBuildQueryParamsResults(assert, result, {
            abstract: true,
            citecount: 'test',
            synonyms: false
        });
    });

    test('Dialog search works', function(assert) {
        const result = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.DIALOG, term: 'test' }]
        });

        assertBuildQueryParamsResults(assert, result, {
            abstract: true,
            fulltext1: 'dialogs_xml:(test)',
            parascope: 'dialogs',
            synonyms: false
        });
    });

    test('Dream search works', function(assert) {
        const result = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.DREAM, term: 'test' }]
        });

        assertBuildQueryParamsResults(assert, result, {
            abstract: true,
            fulltext1: 'dreams_xml:(test)',
            parascope: 'dreams',
            synonyms: false
        });
    });

    test('End Year search works', function(assert) {
        const result = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.END_YEAR, term: 'test' }]
        });

        assertBuildQueryParamsResults(assert, result, {
            abstract: true,
            synonyms: false
        });
    });

    test('Everywhere search works', function(assert) {
        const result = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.EVERYWHERE, term: 'test' }]
        });

        assertBuildQueryParamsResults(assert, result, {
            abstract: true,
            fulltext1: 'text:(test)',
            synonyms: false
        });
    });

    test('Quote search works', function(assert) {
        const result = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.QUOTE, term: 'test' }]
        });

        assertBuildQueryParamsResults(assert, result, {
            abstract: true,
            fulltext1: 'quotes_xml:(test)',
            synonyms: false
        });
    });

    test('Reference search works', function(assert) {
        const result = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.REFERENCE, term: 'test' }]
        });

        assertBuildQueryParamsResults(assert, result, {
            abstract: true,
            fulltext1: 'references_xml:(test)',
            parascope: 'biblios',
            synonyms: false
        });
    });

    test('Start year search works', function(assert) {
        const result = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.START_YEAR, term: 'test' }]
        });

        assertBuildQueryParamsResults(assert, result, {
            abstract: true,
            startyear: 'test',
            synonyms: false
        });
    });

    test('Title search works', function(assert) {
        const result = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.TITLE, term: 'test' }]
        });

        assertBuildQueryParamsResults(assert, result, {
            abstract: true,
            synonyms: false,
            title: 'test'
        });
    });

    test('Viewed search works', function(assert) {
        const result = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.VIEWED, term: 'test' }]
        });

        assertBuildQueryParamsResults(assert, result, {
            abstract: true,
            synonyms: false,
            viewcount: 'test'
        });
    });
});
