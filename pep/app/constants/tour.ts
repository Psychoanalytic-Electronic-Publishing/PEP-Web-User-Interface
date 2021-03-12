import { Step, StepButton } from 'ember-shepherd/services/tour';

type PartialTourButton = Omit<StepButton, 'text'>;
type ModifiedTourStep = Omit<Step, 'buttons' | 'id'> & {
    buttons?: PartialTourButton[];
    id: TourStepId;
    beforeShow?: (context: any) => void;
};
export type PartialTourStep = Omit<ModifiedTourStep, 'text' | 'title'>;

export enum TourStepId {
    HOME = 'home',
    TOGGLE_LEFT = 'toggleLeft',
    TOGGLE_RIGHT = 'toggleRight',
    MAIN_NAVIGATION = 'mainNavigation',
    LOGO = 'logo'
}

export const LeftSidebarStep: PartialTourStep = {
    id: TourStepId.TOGGLE_LEFT,
    attachTo: {
        element: '.sidebar-left .sidebar-toggle-handle',
        on: 'auto'
    },
    classes: 'tour-left-sidebar-spacing',

    buttons: [
        {
            type: 'next'
        }
    ],
    scrollTo: true
};

export const RightSidebarStep: PartialTourStep = {
    id: TourStepId.TOGGLE_RIGHT,
    attachTo: {
        element: '.sidebar-right .sidebar-toggle-handle',
        on: 'left'
    },
    classes: 'tour-right-sidebar-spacing',

    buttons: [
        {
            type: 'cancel'
        }
    ]
};

export const MainNavigationStep: PartialTourStep = {
    id: TourStepId.MAIN_NAVIGATION,
    attachTo: {
        element: '.tour-step-navigation',
        on: 'left'
    },
    classes: 'tour-right-sidebar-spacing',

    buttons: [
        {
            type: 'next'
        }
    ]
};

export const LogoNavigationStep: PartialTourStep = {
    id: TourStepId.LOGO,
    attachTo: {
        element: '.navbar-brand',
        on: 'left'
    },
    classes: 'tour-right-sidebar-spacing',

    buttons: [
        {
            type: 'next'
        }
    ]
};
export const MobileTour: PartialTourStep[] = [
    LogoNavigationStep,
    {
        id: TourStepId.HOME,
        attachTo: {
            element: '.page-drawer .tour-step-home',
            on: 'bottom'
        },
        beforeShow: (context) => {
            context.drawer.toggle();
        },
        buttons: [
            {
                type: 'next'
            }
        ]
    },
    {
        ...MainNavigationStep,
        attachTo: {
            element: '.page-drawer .tour-step-navigation',
            on: 'bottom'
        }
    },
    {
        ...LeftSidebarStep,
        beforeShow: (context) => {
            context.drawer.toggle();
        }
    },
    RightSidebarStep
];

export const DesktopTour: PartialTourStep[] = [
    LogoNavigationStep,
    MainNavigationStep,
    {
        id: TourStepId.HOME,
        attachTo: {
            element: '.nav-item.home',
            on: 'auto'
        },

        buttons: [
            {
                type: 'next'
            }
        ]
    },
    LeftSidebarStep,
    RightSidebarStep
];
