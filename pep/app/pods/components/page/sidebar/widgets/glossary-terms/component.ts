import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';

import Component from '@glint/environment-ember-loose/glimmer-component';
import DS from 'ember-data';
import IntlService from 'ember-intl/services/intl';

import Modal from '@gavant/ember-modals/services/modal';

import { GlossaryWidgetLocation, WIDGET } from 'pep/constants/sidebar';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import ConfigurationService from 'pep/services/configuration';
import LoadingBarService from 'pep/services/loading-bar';
import NotificationsService from 'pep/services/notifications';
import { shuffle } from 'pep/utils/array';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageSidebarWidgetsGlossaryTermsArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsGlossaryTerms extends Component<
    BaseGlimmerSignature<PageSidebarWidgetsGlossaryTermsArgs>
> {
    @service loadingBar!: LoadingBarService;
    @service store!: DS.Store;
    @service modal!: Modal;
    @service notifications!: NotificationsService;
    @service intl!: IntlService;
    @service configuration!: ConfigurationService;

    smallestFontSize = 0.6;
    fontMultiplier = 1.1;

    /**
     * This gets the data from the passed in data object and transforms it to the glossary terms
     *
     * @readonly
     * @memberof PageSidebarWidgetsGlossaryTerms
     */
    get data() {
        const model: { terms: object; location: GlossaryWidgetLocation } = this.args.data[this.widget] ?? {};
        const size = this.configuration.base.global.cards.glossary.limit[model.location];
        const data = model.terms ?? {};
        //convert from an object with values to an array with label and values
        const allGlossaryGroupTerms = Object.entries(data).map((entry) => ({
            label: entry[0],
            count: entry[1] as number
        }));
        const glossaryGroupTerms = allGlossaryGroupTerms.slice(0, size);
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
            const size =
                min !== max
                    ? this.smallestFontSize + this.fontMultiplier * inverseLinearInterpolation(min, max, item.count)
                    : 1;
            return {
                label: item.label,
                fontStyle: htmlSafe(`font-size: ${size}rem;`)
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
            this.notifications.error(this.intl.t('serverErrors.unknown.unexpected'));
            throw error;
        } finally {
            this.loadingBar.hide();
        }
    }
}
