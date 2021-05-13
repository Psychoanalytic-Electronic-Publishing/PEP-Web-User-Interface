import Controller from '@ember/controller';
import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import { WIDGET } from 'pep/constants/sidebar';
import SidebarService from 'pep/services/sidebar';

export interface BrowseJournalParams {
    pep_code: string;
}

export default class BrowseJournal extends Route {
    @service sidebar!: SidebarService;

    async model(params: BrowseJournalParams) {
        const journal = await this.store.query('journal', { sourcecode: params.pep_code });
        return journal.firstObject;
    }

    /**
     * Reset controller
     *
     * @param {BrowseJournalIndexController} controller
     * @param {boolean} isExiting
     * @param {Transition} transition
     * @memberof BrowseJournalIndex
     */
    resetController(controller: Controller, isExiting: boolean, transition: Transition) {
        super.resetController(controller, isExiting, transition);
        if (isExiting) {
            this.sidebar.update({
                [WIDGET.PUBLISHER_INFO]: null
            });
        }
    }
}
