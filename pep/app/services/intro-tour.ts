import { later } from '@ember/runloop';
import Service, { inject as service } from '@ember/service';

import IntlService from 'ember-intl/services/intl';
import MediaService from 'ember-responsive/services/media';
import TourService, { Step, StepButton } from 'ember-shepherd/services/tour';

import { PreferenceKey } from 'pep/constants/preferences';
import { DesktopTour, MobileTour } from 'pep/constants/tour';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import PepSessionService from 'pep/services/session';
import ThemeService from 'pep/services/theme';

export default class IntroTour extends Service {
    @service session!: PepSessionService;
    @service media!: MediaService;
    @service currentUser!: CurrentUserService;
    @service theme!: ThemeService;
    @service configuration!: ConfigurationService;
    @service tour!: TourService;
    @service intl!: IntlService;

    /**
     * Show the intro tour by building the options for either mobile or desktop depending on which one you are in
     *
     * @memberof IntroTour
     */
    async show() {
        const sizeClass = this.media.isMobile ? 'mobile-tour' : 'desktop-tour';
        this.tour.set('defaultStepOptions', {
            classes: `${sizeClass} ${this.theme.currentTheme.id}`,
            cancelIcon: {
                enabled: true
            },
            scrollTo: true,
            popperOptions: {
                modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
            },
            when: {
                cancel: () => {
                    if (this.session.isAuthenticated) {
                        this.currentUser.updatePrefs({ [PreferenceKey.TOUR_ENABLED]: false });
                    }
                }
            }
        });
        this.tour.set('disableScroll', true);
        this.tour.set('modal', true);
        this.tour.set('exitOnEsc', true);
        this.tour.set('keyboardNavigation', true);

        const partialSteps = this.media.isMobile ? MobileTour : DesktopTour;
        const steps: Step[] = partialSteps.map((partialStep, index) => {
            const tour = this.configuration.content.global.tour;
            const id = partialStep.id;
            const buttons: StepButton[] =
                partialStep.buttons?.map((button) => {
                    return {
                        ...button,
                        text:
                            index !== partialSteps.length - 1
                                ? this.intl.t('tour.leftSidebar.buttons.next')
                                : this.intl.t('tour.rightSidebar.buttons.cancel')
                    };
                }) ?? [];
            const step: Step = {
                ...partialStep,
                text: tour[id].text,
                title: tour[id].title,
                buttons
            };
            if (partialStep.beforeShow) {
                step.beforeShowPromise = () => {
                    return new Promise((resolve) => {
                        partialStep.beforeShow?.(this);
                        later(resolve, 1000);
                    });
                };
            }
            return step;
        });
        steps[steps.length - 1].when = {
            show: () => {
                if (this.session.isAuthenticated) {
                    this.currentUser.updatePrefs({ [PreferenceKey.TOUR_ENABLED]: false });
                }
            }
        };

        await this.tour.addSteps(steps);
        this.tour.start();
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        'intro-tour': IntroTour;
    }
}
