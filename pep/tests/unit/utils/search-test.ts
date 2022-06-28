import { QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';

import { OpenUrlSearchKey } from 'pep/constants/open-url';
import { SEARCH_FACETS, SearchFacetId, SearchTermId } from 'pep/constants/search';
import { buildSearchQueryParams, convertOpenURLToSearchParams, groupCountsByRanges } from 'pep/utils/search';
import { module, test } from 'qunit';

module('Unit | Utility | search', function () {
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

    test('Empty object returns abstract true and synonyms false', function (assert) {
        const result = buildSearchQueryParams({});

        assert.deepEqual(result, defaultSearchQueryParamsReturn);
    });

    test('Single search facets works', function (assert) {
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

    test('Multiple search facets works', function (assert) {
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

    test('Article search works', function (assert) {
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

    test('Author search works', function (assert) {
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

    test('Cited search works', function (assert) {
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

    test('Dialog search works', function (assert) {
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

    test('Dream search works', function (assert) {
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

    test('End Year search works', function (assert) {
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

    test('Everywhere search works', function (assert) {
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

    test('Quote search works', function (assert) {
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

    test('Reference search works', function (assert) {
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

    test('Start year search works', function (assert) {
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

    test('Title search works', function (assert) {
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

    test('Viewed search works', function (assert) {
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

    test('Article search removes colons', function (assert) {
        const result = buildSearchQueryParams({
            searchTerms: [{ type: SearchTermId.ARTICLE, term: 'test:two' }]
        });

        assertBuildQueryParamsResults(assert, {
            result,
            expected: {
                abstract: true,
                fulltext1: 'body_xml:("test two"~25)',
                parascope: 'doc',
                synonyms: false
            }
        });
    });

    test('groupCountsByRanges works', function (assert) {
        const counts = {
            '0': 20,
            '1': 1,
            '4': 1
        };

        const groups = [0, [1, 5], [6, 9], [10, 25], [26, Infinity]];

        const result = groupCountsByRanges(counts, groups, ' TO ');

        assert.deepEqual(result, {
            '0': 20,
            '1 TO 5': 2,
            '10 TO 25': 0,
            '26  TO  *': 0,
            '6 TO 9': 0
        });
    });

    test('OpenURL conversion works', function (assert) {
        const artnumResult = convertOpenURLToSearchParams({ [OpenUrlSearchKey.ART_NUM]: 'test' });

        assert.deepEqual(
            artnumResult,
            {
                q: 'adv::art_id:test',
                searchTerms: null
            },
            'artnum works'
        );

        const auFirstResult = convertOpenURLToSearchParams({ [OpenUrlSearchKey.AU_FIRST]: 'test' });

        assert.deepEqual(
            auFirstResult,
            {
                q: '',
                searchTerms: '[{"type":"author","term":"test"}]'
            },
            'aufirst works'
        );

        const auLastResult = convertOpenURLToSearchParams({ [OpenUrlSearchKey.AU_LAST]: 'test' });

        assert.deepEqual(
            auLastResult,
            {
                q: '',
                searchTerms: '[{"type":"author","term":"test"}]'
            },
            'aulast works'
        );

        const aTitleResult = convertOpenURLToSearchParams({ [OpenUrlSearchKey.A_TITLE]: 'test' });

        assert.deepEqual(
            aTitleResult,
            {
                q: '',
                searchTerms: '[{"type":"title","term":"test"}]'
            },
            'atitle works'
        );

        const dateResult = convertOpenURLToSearchParams({ [OpenUrlSearchKey.DATE]: '1987-1989' });

        assert.deepEqual(
            dateResult,
            {
                q: '',
                searchTerms: '[{"type":"startYear","term":"1987-1989"}]'
            },
            'date works'
        );

        const eISSNResult = convertOpenURLToSearchParams({ [OpenUrlSearchKey.E_ISSN]: '2' });

        assert.deepEqual(
            eISSNResult,
            {
                q: 'adv::art_eissn:2',
                searchTerms: null
            },
            'eissn works'
        );

        const ePageResult = convertOpenURLToSearchParams({ [OpenUrlSearchKey.E_PAGE]: '2' });

        assert.deepEqual(
            ePageResult,

            {
                q: 'adv::art_pgrg:*-2',
                searchTerms: null
            },
            'epage works'
        );

        const isbnResult = convertOpenURLToSearchParams({ [OpenUrlSearchKey.ISBN]: '2' });

        assert.deepEqual(
            isbnResult,
            {
                q: 'adv::art_isbn:2',
                searchTerms: null
            },
            'isbn works'
        );

        const issnResult = convertOpenURLToSearchParams({ [OpenUrlSearchKey.ISSN]: '2' });

        assert.deepEqual(
            issnResult,
            {
                q: 'adv::art_issn:2',
                searchTerms: null
            },
            'issn works'
        );

        const issueResult = convertOpenURLToSearchParams({ [OpenUrlSearchKey.ISSUE]: '2' });

        assert.deepEqual(
            issueResult,
            {
                q: '',
                searchTerms: '[{"type":"issue","term":"2"}]'
            },
            'issue works'
        );

        const pagesResult = convertOpenURLToSearchParams({ [OpenUrlSearchKey.PAGES]: '2-4' });

        assert.deepEqual(
            pagesResult,
            {
                q: 'adv::art_pgrg:2-4',
                searchTerms: null
            },
            'pages works'
        );

        const spageResult = convertOpenURLToSearchParams({ [OpenUrlSearchKey.S_PAGE]: '2' });

        assert.deepEqual(
            spageResult,
            {
                q: 'adv::art_pgrg:2-*',
                searchTerms: null
            },
            'spage works'
        );

        const stitleResult = convertOpenURLToSearchParams({ [OpenUrlSearchKey.S_TITLE]: 'test' });

        assert.deepEqual(
            stitleResult,
            {
                q: '',
                searchTerms: '[{"type":"sourcename","term":"test"}]'
            },
            'stitle works'
        );

        const titleResult = convertOpenURLToSearchParams({ [OpenUrlSearchKey.TITLE]: 'test' });

        assert.deepEqual(
            titleResult,
            {
                q: '',
                searchTerms: '[{"type":"sourcename","term":"test"}]'
            },
            'title works'
        );

        const volumeResult = convertOpenURLToSearchParams({ [OpenUrlSearchKey.VOLUME]: '2' });

        assert.deepEqual(
            volumeResult,
            {
                q: '',
                searchTerms: '[{"type":"volume","term":"2"}]'
            },
            'volume works'
        );

        const multipleResult = convertOpenURLToSearchParams({
            [OpenUrlSearchKey.VOLUME]: '2',
            [OpenUrlSearchKey.ISSN]: '2',
            [OpenUrlSearchKey.PAGES]: '2-4',
            [OpenUrlSearchKey.AU_FIRST]: 'test'
        });

        assert.deepEqual(
            multipleResult,
            {
                q: 'adv::art_issn:2 AND art_pgrg:2-4',
                searchTerms: '[{"type":"author","term":"test"},{"type":"volume","term":"2"}]'
            },
            'multiple params works'
        );
    });
});
