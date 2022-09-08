import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import ENV from 'pep/config/environment';
import PepSessionService from 'pep/services/pep-session';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface ImageArgs {
    source: string;
}

export default class Image extends Component<BaseGlimmerSignature<ImageArgs>> {
    @service('pep-session') session!: PepSessionService;

    get source(): string {
        let src = `${this.args.source}?client-id=${ENV.clientId}`;
        if (this.session.isAuthenticated && this.session.data?.authenticated.SessionId) {
            src += `&client-session=${this.session.data.authenticated.SessionId}`;
        }
        return src;
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        Image: typeof Image;
    }
}
