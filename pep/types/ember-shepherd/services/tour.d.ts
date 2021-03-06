import Evented from '@ember/object/evented';
import Service from '@ember/service';

declare module 'ember-shepherd/services/tour' {
    export interface StepButton {
        classes?: string;
        text: string;
        type: 'cancel' | 'back' | 'next';
    }
    export interface Step {
        attachTo?: {
            element: string;
            on:
                | 'auto'
                | 'auto-start'
                | 'auto-end'
                | 'top'
                | 'top-start'
                | 'top-end'
                | 'bottom'
                | 'bottom-start'
                | 'bottom-end'
                | 'left'
                | 'left-start'
                | 'left-end'
                | 'right'
                | 'right-start'
                | 'right-end';
        };
        beforeShowPromise?: () => Promise<void>;
        buttons?: StepButton[];
        cancelIcon?: {
            enabled: boolean;
        };
        classes?: string;
        highlightClass?: string;
        id: string;
        scrollTo?: boolean;
        title: string;
        text: string;
        when?: {
            show?: () => void;
            hide?: () => void;
        };
        popperOptions?: {
            modifiers?: {
                name: string;
                options: { offset: [number, number] };
            }[];
        };
    }
    export default class TourService extends Service.extend(Evented) {
        /**
         * The prefix to add to all the `shepherd-*` class names.
         *
         * @default undefined
         * @property classPrefix
         * @type String
         */
        classPrefix: string;

        /**
         * `confirmCancel` is a boolean flag, when set to `true` it will pop up a native browser
         * confirm window on cancel, to ensure you want to cancel.
         *
         * @default false
         * @property confirmCancel
         * @type Boolean
         */
        confirmCancel: boolean;

        /**
         * `confirmCancelMessage` is a string to display in the confirm dialog when `confirmCancel`
         * is set to true.
         *
         * @default null
         * @property confirmCancelMessage
         * @type String
         */
        confirmCancelMessage: boolean;

        /**
         * @default null
         * @property errorTitle
         * @type String
         */
        errorTitle: string;

        /**
         * Exiting the tour with the escape key will be enabled unless this is explicitly set to false.
         *
         * @default undefined
         * @property exitOnEsc
         * @type Boolean
         */
        exitOnEsc: boolean;

        /**
         * @default false
         * @property isActive
         * @type Boolean
         */
        isActive: boolean;

        /**
         * Navigating the tour via left and right arrow keys will be enabled unless this is explicitly set to false.
         *
         * @default undefined
         * @property keyboardNavigation
         * @type Boolean
         */
        keyboardNavigation: boolean;

        /**
         * @default null
         * @property messageForUser
         * @type String
         */
        messageForUser: string;
        /**
         * `modal` is a boolean, that should be set to true, if you would like the rest of the screen, other than the current element, greyed out, and the current element highlighted. If you do not need modal functionality, you can remove this option or set it to false.
         *
         * > **default value:** `false`
         *
         * @default false
         * @property modal
         * @type Boolean
         */
        modal: boolean;

        disableScroll: boolean;

        defaultStepOptions: Step;

        /**
         * An optional container element for the modal. If not set, the modal will be appended to `document.body`.
         * @default undefined
         * @property modalContainer
         * @type HTMLElement
         */
        modalContainer: HTMLElement;

        /**
         * `requiredElements` is an array of objects that indicate DOM elements that are **REQUIRED** by your tour and must
         * exist and be visible for the tour to start. If any elements are not present, it will keep the tour from starting.
         *
         * You can also specify a message, which will tell the user what they need to do to make the tour work.
         *
         * **⚠️ You must set `requiredElements` *BEFORE* calling `addSteps` to set the steps.**
         *
         * _Example_
         * ```js
         * this.get('tour').set('requiredElements', [
         *   {
         *     selector: '.search-result-element',
         *     message: 'No search results found. Please execute another search, and try to start the tour again.',
         *     title: 'No results'
         *   },
         *   {
         *     selector: '.username-element',
         *     message: 'User not logged in, please log in to start this tour.',
         *     title: 'Please login'
         *   },
         * ]);
         * ```
         * > **default value:** `[]`
         *
         * @default []
         * @property requiredElements
         * @type Array
         */
        requiredElements: [];
        steps: [];
        /**
         * Take a set of steps, create a tour object based on the current configuration and load the shepherd.js dependency.
         * This method returns a promise which resolves when the shepherd.js dependency has been loaded and shepherd is ready to use.
         *
         * You must pass an array of steps to `addSteps`, something like this:
         *
         * ```js
         * this.get('tour').addSteps([
         *   {
         *     attachTo: {
         *       element:'.first-element',
         *       on: 'bottom'
         *     },
         *     beforeShowPromise: function() {
         *       return new Promise(function(resolve) {
         *         Ember.run.scheduleOnce('afterRender', this, function() {
         *           window.scrollTo(0, 0);
         *           this.get('documents.firstObject').set('isSelected', true);
         *           resolve();
         *         });
         *       });
         *     },
         *     buttons: [
         *       {
         *         classes: 'shepherd-button-secondary',
         *         text: 'Exit',
         *         type: 'cancel'
         *       },
         *       {
         *         classes: 'shepherd-button-primary',
         *         text: 'Back',
         *         type: 'back'
         *       },
         *       {
         *         classes: 'shepherd-button-primary',
         *         text: 'Next',
         *         type: 'next'
         *       }
         *     ],
         *     cancelIcon: {
         *       enabled: true
         *     },
         *     classes: 'custom-class-name-1 custom-class-name-2',
         *     highlightClass: 'highlight',
         *     id: 'intro',
         *     scrollTo: false,
         *     title: 'Welcome to Ember-Shepherd!',
         *     text: 'Ember-Shepherd is a JavaScript library for guiding users through your Ember app.',
         *     when: {
         *       show: () => {
         *         console.log('show step');
         *       },
         *       hide: () => {
         *         console.log('hide step');
         *       }
         *     }
         *   },
         * ...
         * ]);
         * ```
         *
         * @method addSteps
         * @param {array} steps An array of steps
         * @returns {Promise} Promise that resolves when everything has been set up and shepherd is ready to use
         * @public
         */
        addSteps(steps: Step[]): Promise<Step[]>;
        /**
         * Get the tour object and call back
         *
         * @method back
         * @public
         */
        back(): void;

        /**
         * Cancel the tour
         *
         * @method cancel
         * @public
         */
        cancel(): void;

        /**
         * Complete the tour
         *
         * @method complete
         * @public
         */
        complete(): void;

        /**
         * Hides the current step
         *
         * @method hide
         * @public
         */
        hide(): void;

        /**
         * Advance the tour to the next step and trigger next
         *
         * @method next
         * @public
         */
        next(): void;

        /**
         * Show a specific step, by passing its id
         *
         * @param {string} [id] The id of the step you want to show
         * @method show
         * @public
         */
        show(id: string): void;

        /**
         * Start the tour. The Promise from addSteps() must be in a resolved state prior to starting the tour!
         *
         * @method start
         * @public
         */
        start(): void;

        /**
         * When the tour starts, setup the step event listeners
         *
         * @method _onTourStart
         * @private
         */
        _onTourStart(): void;

        /**
         * This function is called when a tour is completed or cancelled to initiate cleanup.
         *
         * @method _onTourFinish
         * @param {string} [completeOrCancel] 'complete' or 'cancel'
         * @private
         */
        _onTourFinish(completeOrCancel: string): void;

        /**
         * Initializes the tour, creates a new Shepherd.Tour. sets options, and binds events
         *
         * @method _initialize
         * @private
         */
        _initialize(): void;

        /**
         * Observes the array of requiredElements, which are the elements that must be present at the start of the tour,
         * and determines if they exist, and are visible, if either is false, it will stop the tour from executing.
         *
         * @method _requiredElementsPresent
         * @private
         */
        _requiredElementsPresent(): void;
    }
}
