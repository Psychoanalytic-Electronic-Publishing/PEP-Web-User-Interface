import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import ENV from 'pep/config/environment';
import PepSessionService from 'pep/services/pep-session';

interface ImageArgs {
    source: string;
}

export default class Image extends Component<ImageArgs> {
    @service('pep-session') session!: PepSessionService;

    get source(): string {
        let src = `${this.args.source}?client-id=${ENV.clientId}`;
        if (this.session.isAuthenticated && this.session.data.authenticated.SessionId) {
            src += `&client-session=${this.session.data.authenticated.SessionId}`;
        }
        return src;
    }
}
