import { modifier } from 'ember-modifier';
import { debounce as runDebounce } from '@ember/runloop';

type DidWindowResizePosArgs = [(windowWidth: number, windowHeight: number) => void];

type DidWindowResizeNamedArgs = {
    debounce?: number;
};

/**
 * Modifier that attaches a debounced function callback to window resize events
 * and passes the current window width and height to the callback.
 *
 * NOTE: This modifier should only be used if you need to capture specifically
 * when the window itself is resized. If you want to capture when an element is
 * resized, use {{did-resize}}.
 *
 * @param {Element} element
 * @param {DidWindowResizePosArgs}
 * @param {DidWindowResizeNamedArgs}
 */
export default modifier((_element, [handler]: DidWindowResizePosArgs, { debounce = 250 }: DidWindowResizeNamedArgs) => {
    const handlerWithDimensions = () => handler(document.body.offsetWidth, document.body.offsetHeight);
    const listener = () => runDebounce(handlerWithDimensions, debounce);
    window.addEventListener('resize', listener);

    // destroy callback
    return () => {
        window.removeEventListener('resize', listener);
    };
});
