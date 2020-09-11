import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import { WIDGET } from 'pep/constants/sidebar';
import { buildSearchQueryParams } from 'pep/utils/search';
import { SearchFacetId } from 'pep/constants/search';
import { tracked } from '@glimmer/tracking';
import DS from 'ember-data';

interface PageSidebarWidgetsGlossaryTermsArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsGlossaryTerms extends Component<PageSidebarWidgetsGlossaryTermsArgs> {
    @service store!: DS.Store;

    @tracked tooltipData?: any = null;

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
            { min: glossaryGroupTerms[0].count, max: glossaryGroupTerms[0].count }
        );

        const clamp = (a: number, min = 0, max = 1) => Math.min(max, Math.max(min, a));
        const inverseLinearInterpolation = (x: number, y: number, a: number) => clamp((a - x) / (y - x));
        const mappedData = glossaryGroupTerms.map((item) => {
            return {
                label: item.label,
                fontSize: this.smallestFontSize + this.fontMultiplier * inverseLinearInterpolation(min, max, item.count)
            };
        });
        return this.shuffle(mappedData);
    }

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.GLOSSARY_TERMS;

    @action
    async onTooltipShow(term: string) {
        try {
            const results = await this.store.query('document', {});
            this.tooltipData = results.toArray();
        } catch (err) {}
    }
}
