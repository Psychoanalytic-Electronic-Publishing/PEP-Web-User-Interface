import CookiesService from 'ember-cookies/services/cookies';
import { isNone } from '@ember/utils';

export default class Cookies extends CookiesService.extend({
    // _decodeValue(value, raw) {
    //     if (isNone(value) || raw) {
    //         return value;
    //     } else {
    //         try {
    //             return decodeURIComponent(value);
    //         } catch (error) {
    //             return value;
    //         }
    //     }
    // }
}) {}
