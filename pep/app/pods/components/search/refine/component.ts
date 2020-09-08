import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { capitalize } from '@ember/string';
import IntlService from 'ember-intl/services/intl';

import ConfigurationService from 'pep/services/configuration';
import { SEARCH_FACETS, SearchFacetValue } from 'pep/constants/search';
import { SearchMetadata } from 'pep/api';

export interface RefineOption {
    id: string;
    label: string;
    numResults: number;
}

export interface RefineGroup {
    id: string;
    label: string;
    optionsWithResults: RefineOption[];
    optionsWithoutResults: RefineOption[];
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

    get groups() {
        const cfg = this.configuration.base.search;
        const groups: RefineGroup[] = [];
        const fieldsMap = this.args.metadata?.facetCounts?.facet_fields ?? {};
        const incFields = Object.keys(fieldsMap);
        const displayedFacets = cfg.facets.defaultFields.map((id) => SEARCH_FACETS.findBy('id', id)!);

        displayedFacets.forEach((facetType) => {
            if (incFields.includes(facetType.id)) {
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

                //sort options w/no results at the bottom
                let optionsWithResults = allOptions.filter((opt) => opt.numResults > 0);
                let optionsWithoutResults = allOptions.filter((opt) => opt.numResults === 0);

                //only show facets that have at least one option
                if (!isEmpty(allOptions)) {
                    groups.push({
                        id: facetType.id,
                        label: this.intl.t(facetType.label),
                        optionsWithResults,
                        optionsWithoutResults
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
