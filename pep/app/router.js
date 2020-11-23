import EmberRouter from '@ember/routing/router';

import config from 'pep/config/environment';

export default class Router extends EmberRouter {
    location = config.locationType;
    //@see https://blog.emberjs.com/2016/04/28/baseurl ("Configuring the Router" section)
    rootURL = config.routerRootURL;
}

Router.map(function() {
    this.route('login');
    this.route('search', function() {});
    this.route('browse', function() {
        this.route('videos');
        this.route('journal', { path: '/:pep_code/volumes' }, function() {
            this.route('volume', { path: '/:volume_number' });
        });
        this.route('journal-loading');

        this.route('book', function() {
            this.route('gw');
            this.route('se');
        });
    });
    this.route('read', function() {
        this.route('document', { path: '/:document_id' });
    });

    this.route('most-cited');
    this.route('most-viewed');

    //make sure these routes are always defined last!
    this.route('five-hundred', { path: '/500' });
    this.route('four-oh-three', { path: '/403' });
    this.route('four-oh-four', { path: '/*path' });
});
