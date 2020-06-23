import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { SEARCH_FACETS } from 'pep/constants/search';
import { capitalize } from '@ember/string';

interface SearchRefineArgs {
    //TODO
    metadata: any;
    selection: any;
    updateSelection: (newSelection: any) => void;
}

export default class SearchRefine extends Component<SearchRefineArgs> {
    @tracked expandedGroups = [];

    get groups() {
        const groups = [];
        const fieldsMap = this.args.metadata?.facetCounts?.facet_fields ?? {};
        const incFields = Object.keys(fieldsMap);

        SEARCH_FACETS.forEach((facetType) => {
            if (incFields.includes(facetType.id)) {
                let fieldCountsMap = fieldsMap[facetType.id];
                let fieldCountIds = Object.keys(fieldCountsMap);
                //TODO should non-dynamic facet options be sorted by constant's array order?
                let allOptions = fieldCountIds.map((optId) => ({
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

    @action
    onFacetChange(facetId, optionValue) {
        const newSelection = this.args.selection.concat([]);
        const existingFacet = newSelection.find((f) => f.id === facetId && f.value === optionValue);
        if (existingFacet) {
            newSelection.removeObject(existingFacet);
        } else {
            newSelection.pushObject({ id: facetId, value: optionValue });
        }

        this.args.updateSelection(newSelection);
    }

    @action
    toggleGroup(groupId) {
        return this.expandedGroups.includes(groupId)
            ? this.expandedGroups.removeObject(groupId)
            : this.expandedGroups.pushObject(groupId);
    }
}
