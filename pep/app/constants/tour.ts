import { Step, StepButton } from 'ember-shepherd/services/tour';

type PartialTourButton = Omit<StepButton, 'text'>;
type ModifiedTourStep = Omit<Step, 'buttons' | 'id'> & { buttons?: PartialTourButton[]; id: TourStepId };
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
export const mobileTour: PartialTourStep[] = [
    {
        id: TourStepId.HOME,
        attachTo: {
            element: '.navbar .navbar-toggler',
            on: 'bottom'
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

export const desktopTour: PartialTourStep[] = [
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
