import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import { WIDGET } from 'pep/constants/sidebar';
import DS from 'ember-data';
import Modal from '@gavant/ember-modals/services/modal';
import { htmlSafe } from '@ember/string';

interface PageSidebarWidgetsGlossaryTermsArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsGlossaryTerms extends Component<PageSidebarWidgetsGlossaryTermsArgs> {
    @service store!: DS.Store;
    @service modal!: Modal;

    smallestFontSize = 0.5;
    fontMultiplier = 2;

    shuffle(array: any[]) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    get data() {
        const data = this.args.data[this.widget] ?? {};
        const glossaryGroupTerms = Object.entries(data).map((entry) => ({
            label: entry[0],
            count: entry[1] as number
        }));
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
        const mappedData = glossaryGroupTerms.map((item) => {
            return {
                label: item.label,
                // font-size: {{html-safe item.fontSize}}em;
                fontStyle: htmlSafe(
                    `font-size: ${this.smallestFontSize +
                        this.fontMultiplier * inverseLinearInterpolation(min, max, item.count)};`
                )
            };
        });
        return this.shuffle(mappedData);
    }

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.GLOSSARY_TERMS;

    @action
    async viewGlossaryTerm(term: string) {
        console.log('test');
        try {
            const results = await this.store.query('glossary-term', {
                termidtype: 'Group',
                termIdentifier: term
            });
            this.modal.open('glossary', {
                results,
                term
            });
        } catch (error) {
            console.log(error);
        }
    }
}
