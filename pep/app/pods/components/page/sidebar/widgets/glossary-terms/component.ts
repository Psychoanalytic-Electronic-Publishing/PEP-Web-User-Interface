import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import { WIDGET } from 'pep/constants/sidebar';
import DS from 'ember-data';
import Modal from '@gavant/ember-modals/services/modal';
import { htmlSafe } from '@ember/string';
import { shuffle } from 'pep/utils/array';
import LoadingBarService from 'pep/services/loading-bar';

interface PageSidebarWidgetsGlossaryTermsArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsGlossaryTerms extends Component<PageSidebarWidgetsGlossaryTermsArgs> {
    @service loadingBar!: LoadingBarService;
    @service store!: DS.Store;
    @service modal!: Modal;

    smallestFontSize = 0.5;
    fontMultiplier = 2;

    /**
     * This gets the data from the passed in data object and transforms it to the glossary terms
     *
     * @readonly
     * @memberof PageSidebarWidgetsGlossaryTerms
     */
    get data() {
        const data = this.args.data[this.widget] ?? {};
        //convert from an object with values to an array with label and values
        const glossaryGroupTerms = Object.entries(data).map((entry) => ({
            label: entry[0],
            count: entry[1] as number
        }));
        //find the max and min of the array
        const { max, min } = glossaryGroupTerms.reduce(
            (prev, next) => {
                prev.min = Math.min(prev.min, next.count);
                prev.max = Math.max(prev.max, next.count);
                return prev;
            },
            { min: glossaryGroupTerms[0]?.count, max: glossaryGroupTerms[0]?.count }
        );

        const clamp = (a: number, min = 0, max = 1) => Math.min(max, Math.max(min, a));
        const inverseLinearInterpolation = (x: number, y: number, a: number) =>
            x !== y ? clamp((a - x) / (y - x)) : 1;
        // build the mapped data by performing inverse linear interpolation to find the font size
        // using the min and max calculated before
        const mappedData = glossaryGroupTerms.map((item) => {
            return {
                label: item.label,
                fontStyle: htmlSafe(
                    `font-size: ${this.smallestFontSize +
                        this.fontMultiplier * inverseLinearInterpolation(min, max, item.count)};`
                )
            };
        });
        return shuffle(mappedData);
    }

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.GLOSSARY_TERMS;

    /**
     * Open the glossary modal to view the term definition and information
     *
     * @param {string} term
     * @memberof PageSidebarWidgetsGlossaryTerms
     */
    @action
    async viewGlossaryTerm(term: string) {
        try {
            this.loadingBar.show();
            const results = await this.store.query('glossary-term', {
                termidtype: 'Group',
                termIdentifier: term
            });
            this.modal.open('glossary', {
                results,
                term
            });
        } catch (error) {
            throw error;
        } finally {
            this.loadingBar.hide();
        }
    }
}
