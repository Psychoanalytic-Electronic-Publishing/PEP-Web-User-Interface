import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { SEARCH_FACETS, SearchFacetValue } from 'pep/constants/search';
import { capitalize } from '@ember/string';

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

export interface SearchMetadata {
    facetCounts: {
        facet_fields: {
            [x: string]: {
                [x: string]: number;
            };
        };
    };
}

interface SearchRefineArgs {
    metadata?: SearchMetadata;
    selection: SearchFacetValue[];
    updateSelection: (newSelection: SearchFacetValue[]) => void;
}

export default class SearchRefine extends Component<SearchRefineArgs> {
    @tracked expandedGroups: string[] = [];

    get groups() {
        const groups: RefineGroup[] = [];
        const fieldsMap = this.args.metadata?.facetCounts?.facet_fields ?? {};
        const incFields = Object.keys(fieldsMap);

        SEARCH_FACETS.forEach((facetType) => {
            if (incFields.includes(facetType.id)) {
                let fieldCountsMap = fieldsMap[facetType.id];
                let fieldCountIds = Object.keys(fieldCountsMap);
                let allOptions: RefineOption[] = fieldCountIds.map((optId) => ({
                    id: optId,
                    label: facetType.dynamicValues
                        ? capitalize(optId)
                        : facetType.values.findBy('id', optId)?.label ?? optId,
                    numResults: fieldCountsMap[optId]
                }));

                //sort options w/no results at the bottom
                let optionsWithResults = allOptions.filter((opt) => opt.numResults > 0);
                let optionsWithoutResults = allOptions.filter((opt) => opt.numResults === 0);

                //only show facets that have at least one option
                if (!isEmpty(allOptions)) {
                    groups.push({
                        id: facetType.id,
                        label: facetType.label,
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
