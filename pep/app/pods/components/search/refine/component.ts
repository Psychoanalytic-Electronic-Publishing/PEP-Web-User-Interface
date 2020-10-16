import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { capitalize } from '@ember/string';
import { isEmpty } from '@ember/utils';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import IntlService from 'ember-intl/services/intl';

import { SearchMetadata } from 'pep/api';
import { SEARCH_FACETS, SearchFacetValue } from 'pep/constants/search';
import ConfigurationService from 'pep/services/configuration';

export interface RefineOption {
    id: string;
    label: string;
    numResults: number;
}

export interface RefineGroup {
    id: string;
    label: string;
    visibleOptions: RefineOption[];
    hiddenOptions: RefineOption[];
}

interface SearchRefineArgs {
    metadata?: SearchMetadata;
    selection: SearchFacetValue[];
    updateSelection: (newSelection: SearchFacetValue[]) => void;
}

export default class SearchRefine extends Component<SearchRefineArgs> {
    @service intl!: IntlService;
    @service configuration!: ConfigurationService;

    @tracked expandedGroups: string[] = [];
    visibleOptionsCount = 10;

    get groups() {
        const cfg = this.configuration.base.search;
        const groups: RefineGroup[] = [];
        const fieldsMap = this.args.metadata?.facetCounts?.facet_fields ?? {};
        const incFields = Object.keys(fieldsMap);
        const displayedFacets = cfg.facets.defaultFields.map((id) => SEARCH_FACETS.find((f) => f.id === id));

        displayedFacets.forEach((facetType) => {
            if (facetType && incFields.includes(facetType.id)) {
                let fieldCountsMap = facetType.formatCounts
                    ? facetType.formatCounts(fieldsMap[facetType.id])
                    : fieldsMap[facetType.id];
                let fieldCountIds = Object.keys(fieldCountsMap);
                let allOptIds = facetType.dynamicValues ? fieldCountIds : facetType.values.map((v) => v.id);
                let allOptions: RefineOption[] = allOptIds.map((optId) => {
                    let label;
                    if (facetType.dynamicValues) {
                        label = facetType.formatOption ? facetType.formatOption(optId, this.intl) : capitalize(optId);
                    } else {
                        const valLabel = facetType.values.findBy('id', optId)?.label;
                        label = valLabel ? this.intl.t(facetType.values.findBy('id', optId)!.label) : optId;
                    }

                    return {
                        id: optId,
                        label,
                        numResults: fieldCountsMap[optId] ?? 0
                    };
                });

                // Use all options to build the visible and hidden options.
                // The option is visible if there are results and we are showing less than the visibleOptionsCount options already, otherwise its hidden
                const options = allOptions.reduce<Pick<RefineGroup, 'visibleOptions' | 'hiddenOptions'>>(
                    (options, option) => {
                        const hasResults = option.numResults > 0;
                        if (options.visibleOptions.length < this.visibleOptionsCount && hasResults) {
                            options.visibleOptions.push(option);
                        } else {
                            options.hiddenOptions.push(option);
                        }
                        return options;
                    },
                    {
                        visibleOptions: [],
                        hiddenOptions: []
                    }
                );

                //only show facets that have at least one option
                if (options.visibleOptions?.length > 1) {
                    groups.push({
                        id: facetType.id,
                        label: this.intl.t(facetType.label),
                        visibleOptions: options.visibleOptions,
                        hiddenOptions: options.hiddenOptions
                    });
                }
            }
        });

        return groups;
    }

    /**
     * Updates the refine selection when a facet option is toggled
     * @param {String} facetId
     * @param {String} optionValue
     */
    @action
    onFacetChange(facetId: string, optionValue: string) {
        const newSelection = this.args.selection.concat([]);
        const existingFacet = newSelection.find((f) => f.id === facetId && f.value === optionValue);
        if (existingFacet) {
            newSelection.removeObject(existingFacet);
        } else {
            newSelection.pushObject({ id: facetId, value: optionValue });
        }

        this.args.updateSelection(newSelection);
    }

    /**
     * Toggles the expanded/collapsed state of a group
     * @param {String} groupId
     */
    @action
    toggleGroup(groupId: string) {
        return this.expandedGroups.includes(groupId)
            ? this.expandedGroups.removeObject(groupId)
            : this.expandedGroups.pushObject(groupId);
    }
}
