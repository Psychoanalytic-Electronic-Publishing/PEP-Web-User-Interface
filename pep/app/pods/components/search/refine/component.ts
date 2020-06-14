import Component from '@glimmer/component';

interface SearchRefineArgs {}

export default class SearchRefine extends Component<SearchRefineArgs> {
    //TODO placeholder data
    groups = [
        {
            label: 'Keywords',
            options: [
                { label: 'Sexuality', numResults: 3 },
                { label: 'Gender', numResults: 2 },
                { label: 'Lacan', numResults: 8 },
                { label: 'Metapsychology', numResults: 1 }
            ]
        },
        {
            label: 'Language',
            options: [
                { label: 'English', numResults: 20 },
                { label: 'German', numResults: 12 }
            ]
        },
        {
            label: 'Article Type',
            options: [
                { label: 'Article', numResults: 104 },
                { label: 'Review', numResults: 13 },
                { label: 'Commentary', numResults: 10 },
                { label: 'Abstract', numResults: 4 },
                { label: 'Report', numResults: 1 }
            ]
        },
        {
            label: 'View Periods',
            options: [
                { label: 'Last 5 years', numResults: 85 },
                { label: 'Last 10 years', numResults: 12 },
                { label: 'Last 15 years', numResults: 3 },
                { label: 'Last 20 years', numResults: 27 },
                { label: 'All years', numResults: 104 }
            ]
        },
        {
            label: 'Source Type',
            options: [
                { label: 'Journal', numResults: 126 },
                { label: 'Book', numResults: 1 },
                { label: 'Video', numResults: 1 }
            ]
        }
    ];
}
