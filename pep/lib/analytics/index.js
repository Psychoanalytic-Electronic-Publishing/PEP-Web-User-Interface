/* eslint-env node */
'use strict';

module.exports = {
    name: 'analytics',

    isDevelopingAddon() {
        return true;
    },

    contentFor: function (type, config) {
        if (type === 'analytics') {
            if (config.APP.googleAnalytics) {
                return `
            <!-- Google tag (gtag.js) -->
            <script async src="https://www.googletagmanager.com/gtag/js?id=${config.APP.googleAnalytics}"></script>
            <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());

                gtag('config', '${config.APP.googleAnalytics}', {
                  send_page_view: false
                });
            </script>
            `;
            }
        }

        return '';
    }
};
