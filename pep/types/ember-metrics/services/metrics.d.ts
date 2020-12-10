declare module 'ember-metrics/services/metrics' {
    import Service from '@ember/service';

    export interface Adapter {
        metrics: null;
        config: null;
        init(): void;
        willDestroy(): void;
        identify(): void;
        trackEvent(): void;
        trackPage(): void;
        alias(): void;
    }
    export interface Adapters {
        [x: string]: Adapter;
    }

    export default class Metrics extends Service {
        /**
         * Cached adapters to reduce multiple expensive lookups.
         *
         * @property _adapters
         * @private
         * @type Object
         * @default null
         */
        _adapters: Adapters;

        /**
         * Contextual information attached to each call to an adapter. Often you'll
         * want to include things like `currentUser.name` with every event or page
         * view  that's tracked. Any properties that you bind to `metrics.context`
         * will be merged into the options for every service call.
         *
         * @property context
         * @type Object
         * @default null
         */
        context: {};

        /**
         * Indicates whether calls to the service will be forwarded to the adapters
         *
         * @property enabled
         * @type Boolean
         * @default true
         */
        enabled: boolean;

        identify(...args: any[]): void;

        alias(...args: any[]): void;

        trackEvent(...args: any[]): void;

        trackPage(...args: any[]): void;

        /**
         * Instantiates the adapters specified in the configuration and caches them
         * for future retrieval.
         *
         * @method activateAdapters
         * @param {Array} adapterOptions
         * @return {Object} instantiated adapters
         */
        activateAdapters(adapterOptions: []): Adapters;

        /**
         * Invokes a method on the passed adapter, or across all activated adapters if not passed.
         *
         * @method invoke
         * @param {String} methodName
         * @param {Rest} args
         * @return {Void}
         */
        invoke(methodName: string, ...args: any[]): void;

        /**
         * Instantiates an adapter.
         *
         * @method _activateAdapter
         * @param {Object}
         * @private
         * @return {Adapter}
         */
        _activateAdapter({ adapterClass, config }: { adapterClass: any; config: {} }): Adapter;

        /**
         * Looks up the adapter from the container. Prioritizes the consuming app's
         * adapters over the addon's adapters.
         *
         * @method _lookupAdapter
         * @param {String} adapterName
         * @private
         * @return {Adapter} a local adapter or an adapter from the addon
         */
        _lookupAdapter(adapterName: string): Adapter;

        /**
         * Predicate that Filters out adapters that should not be activated in the
         * current application environment. Defaults to all environments if the option
         * is `all` or undefined.
         *
         * @method _filterEnvironments
         * @param {Object} adapterOption
         * @param {String} appEnvironment
         * @private
         * @return {Boolean} should an adapter be activated
         */
        _filterEnvironments(adapterOption: {}, appEnvironment: string): boolean;
    }
}
