//@ts-nocheck
import Controller from '@ember/controller';
import { computed } from '@ember/object';
import Route from '@ember/routing/route';

type Constructor<T = Route> = new (...args: any[]) => T;

export function PageHeader<TBase extends Constructor>(Base: TBase) {
    class PageHeaderClass extends Base {
        /**
         * The name/path of the controller that will be used as the context for the header template
         * that is rendered. Defaults to `'application'`
         * @type {string}
         * @memberof PageHeaderClass
         */
        headerController = 'application';

        /**
         * The name/path of the template to render into the header outlet. This will default to
         * `{this.routeName}/header` (e.g. `'application/header'` when applied to the application route)
         * @readonly
         * @type {string}
         * @memberof PageHeaderClass
         */
        @computed('routeName')
        get headerTemplate(): string {
            return `${this.routeName}/header`;
        }

        /**
         * Renders the default template for the route, and then also renders the header template
         * @param {Controller} controller
         * @param {{}} model
         * @memberof PageHeaderClass
         */
        renderTemplate(controller: Controller, model: {}): void {
            super.renderTemplate(controller, model);

            this.render(this.headerTemplate, {
                into: 'application',
                outlet: 'header',
                controller: this.headerController
            });
        }
    }

    return PageHeaderClass;
}

export function PageFooter<TBase extends Constructor>(Base: TBase) {
    class PageFooterClass extends Base {
        /**
         * The name/path of the controller that will be used as the context for the footer template
         * that is rendered. Defaults to `'application'`
         * @type {string}
         * @memberof PageHeaderClass
         */
        footerController = 'application';

        /**
         * The name/path of the template to render into the header outlet. This will default to
         * `{this.routeName}/footer` (e.g. `'application/footer'` when appled to application route)
         * @readonly
         * @type {string}
         * @memberof PageHeaderClass
         */
        @computed('routeName')
        get footerTemplate(): string {
            return `${this.routeName}/footer`;
        }

        /**
         * Renders the default template for the route, and then also renders the footer template
         * @param {Controller} controller
         * @param {{}} model
         * @memberof PageHeaderClass
         */
        renderTemplate(controller: Controller, model: {}): void {
            super.renderTemplate(controller, model);

            this.render(this.footerTemplate, {
                into: 'application',
                outlet: 'footer',
                controller: this.footerController
            });
        }
    }

    return PageFooterClass;
}

export function PageNav<TBase extends Constructor>(Base: TBase) {
    class PageNavClass extends Base {
        /**
         * The name/path of the controller that will be used as the context for the nav template
         * that is rendered. Defaults to `'application'`
         * @type {string}
         * @memberof PageHeaderClass
         */
        navController = 'application';

        /**
         * The name/path of the template to render into the header outlet. This will default to
         * `{this.routeName}/nav` (e.g. `'application/nav'` when appled to application route)
         * @readonly
         * @type {string}
         * @memberof PageHeaderClass
         */
        @computed('routeName')
        get navTemplate(): string {
            return `${this.routeName}/nav`;
        }

        /**
         * Renders the default template for the route, and then also renders the nav template
         * @param {Controller} controller
         * @param {{}} model
         * @memberof PageHeaderClass
         */
        renderTemplate(controller: Controller, model: {}): void {
            super.renderTemplate(controller, model);

            this.render(this.navTemplate, {
                into: 'application',
                outlet: 'nav',
                controller: this.navController
            });
        }
    }

    return PageNavClass;
}

export function PageSidebar<TBase extends Constructor>(Base: TBase) {
    class PageSidebarClass extends Base {
        /**
         * The name/path of the controller that will be used as the context for the sidebar template
         * that is rendered. Defaults to `'application'`
         * @type {string}
         * @memberof PageHeaderClass
         */
        sidebarController = 'application';

        /**
         * The name/path of the template to render into the header outlet. This will default to
         * `{this.routeName}/sidebar` (e.g. `'application/sidebar'` when appled to application route)
         * @readonly
         * @type {string}
         * @memberof PageHeaderClass
         */
        @computed('routeName')
        get sidebarTemplate(): string {
            return `${this.routeName}/sidebar`;
        }

        /**
         * Renders the default template for the route, and then also renders the sidebar template
         * @param {Controller} controller
         * @param {{}} model
         * @memberof PageHeaderClass
         */
        renderTemplate(controller: Controller, model: {}): void {
            super.renderTemplate(controller, model);

            this.render(this.sidebarTemplate, {
                into: 'application',
                outlet: 'sidebar',
                controller: this.sidebarController
            });
        }
    }

    return PageSidebarClass;
}

/**
 * A convenience mixin that applies the PageHeader, PageFooter, PageNav, PageSidebar mixins to the given class
 * In most cases you'll want to use this, e.g. for the application route where all 4 templates are needed
 * @export
 * @template TBase
 * @param {TBase} Base
 * @returns
 */
export default function PageLayout<TBase extends Constructor>(Base: TBase) {
    return class extends PageSidebar(PageNav(PageFooter(PageHeader(Base)))) {};
}
