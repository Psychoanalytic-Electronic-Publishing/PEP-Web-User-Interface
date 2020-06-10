//https://github.com/ember-cli/ember-fetch#use-with-fastboot
export default {
    name: 'ajax-service',
    initialize() {
        // noop
        // This is to override Fastboot's initializer which prevents ember-fetch from working
        // https://github.com/ember-fastboot/ember-cli-fastboot/blob/master/fastboot/initializers/ajax.js
    }
};
