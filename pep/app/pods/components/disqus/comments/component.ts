import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import Component from '@glimmer/component';

import ENV from 'pep/config/environment';

interface DisqusCommentsArgs {
    identifier: string;
    title?: string;
    url?: string;
}

interface DisqusCommentsSignature {
    Args: DisqusCommentsArgs;
}

type WindowWithDisqus = Window &
    typeof globalThis & {
        DISQUS: any;
    };

export default class DisqusComments extends Component<DisqusCommentsSignature> {
    /**
     * Set up disqus. Loads the API if needed - otherwise just calls reset with the new identifier.
     *
     * @memberof DisqusComments
     */
    @action
    setup() {
        if (!(window as WindowWithDisqus).DISQUS) {
            this.loadDisqusApi('embed');
        } else {
            this.reset();
        }
    }

    /**
     * Public reset method to call manually if needed (shouldn't be needed directly in most cases)
     *
     * @memberof DisqusComments
     */
    reset() {
        debounce(this, this.resetDisqus, 100);
    }

    /**
     * Private reset method Sets the identifier, url and title
     *
     * @private
     * @memberof DisqusComments
     */
    private resetDisqus() {
        const id = this.args.identifier.toLowerCase() ?? undefined;

        // Always use the first version of an article to persist comments across versions
        // We could slice off the version entirely, but we need to maintain backawrds compatibiltiy for existing Disqus thread IDs
        const identifier = !this.args.url && id.slice(0, -1) + 'a';

        const url = this.args.url || window.location.href;
        const title = this.args.title ?? undefined;

        /** @ref https://help.disqus.com/customer/portal/articles/472107-using-disqus-on-ajax-sites */

        (window as WindowWithDisqus).DISQUS.reset({
            reload: true,
            config() {
                this.page.identifier = identifier;
                this.page.url = url;
                this.page.title = title;
            }
        });
    }

    /**
     * Private method to load the api
     *
     * @private
     * @param {string} fileName
     * @memberof DisqusComments
     */
    private loadDisqusApi(fileName: string) {
        const shortname = ENV.disqus.shortname;
        const head = document.getElementsByTagName('head')[0];
        const disqusEmbed = document.createElement('script');
        disqusEmbed.setAttribute('type', 'text/javascript');
        disqusEmbed.setAttribute('async', 'true');
        disqusEmbed.setAttribute('src', `https://${shortname}.disqus.com/${fileName}.js`);
        disqusEmbed.setAttribute('data-timestamp', new Date().toString());
        disqusEmbed.onload = () => {
            this.reset();
        };
        head.appendChild(disqusEmbed);
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'Disqus::Comments': typeof DisqusComments;
    }
}
