import OptionsComponent from 'ember-power-select/components/power-select/options';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface PowerSelectInfinityOptionsArgs {
    items: any[];
    extra: {
        estimateHeight: number;
        staticHeight: boolean;
        bufferSize: number;
        lastReached(): any;
        isSearching: boolean;
    };
    optionsClass?: string;
}

export default class PowerSelectInfinityOptions extends OptionsComponent<
    BaseGlimmerSignature<PowerSelectInfinityOptionsArgs>
> {}
