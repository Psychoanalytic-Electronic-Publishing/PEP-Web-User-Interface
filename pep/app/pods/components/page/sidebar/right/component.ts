import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import { WidgetData } from 'pep/constants/sidebar';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import PepSessionService from 'pep/services/pep-session';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageSidebarRightArgs {
    data: WidgetData;
}

export default class PageSidebarRight extends Component<BaseGlimmerSignature<PageSidebarRightArgs>> {
    @service configuration!: ConfigurationService;
    @service('pep-session') session!: PepSessionService;
    @service currentUser!: CurrentUserService;

    get showPreviewsWidget() {
        if (this.args.data.publisherInfo && this.args.data.publisherInfo.accessClassification === 'preview') {
            return true;
        }

        if (window.location.href.includes('/browse/previews')) return true;

        return false;
    }

    get rightSidebarWidgets() {
        return this.configuration.base.global.cards.right;
    }

    get showLoginWidget(): boolean {
        return (!this.session.isAuthenticated || this.currentUser.user?.isGroup) ?? false;
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'Page::Sidebar::Right': typeof PageSidebarRight;
    }
}
