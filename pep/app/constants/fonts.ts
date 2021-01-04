export enum FontSizes {
    XS = 'xs',
    SMALL = 'small',
    DEFAULT = 'default',
    LARGE = 'large',
    XLARGE = 'xlarge'
}

export interface FontSize {
    id: FontSizes;
    label: string;
    class: string;
}

export const FONT_SIZE_XS: FontSize = {
    id: FontSizes.XS,
    label: 'fonts.sizes.xs',
    class: 'font-xs'
};

export const FONT_SIZE_SMALL: FontSize = {
    id: FontSizes.SMALL,
    label: 'fonts.sizes.sm',
    class: 'font-sm'
};

export const FONT_SIZE_DEFAULT: FontSize = {
    id: FontSizes.DEFAULT,
    label: 'fonts.sizes.default',
    class: ''
};

export const FONT_SIZE_LARGE: FontSize = {
    id: FontSizes.LARGE,
    label: 'fonts.sizes.lg',
    class: 'font-lg'
};

export const FONT_SIZE_XLARGE: FontSize = {
    id: FontSizes.XLARGE,
    label: 'fonts.sizes.xlarge',
    class: 'font-xlarge'
};

export const AvailableFontSizes = [FONT_SIZE_XS, FONT_SIZE_SMALL, FONT_SIZE_DEFAULT, FONT_SIZE_LARGE, FONT_SIZE_XLARGE];
