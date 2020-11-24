import Service from 'ember-can/services/can';

export default class CanService extends Service {
    /**
     * Parse abilityString into an object with extracted propertyName and abilityName
     *
     * @param {string} str
     * @returns {Object} extracted propertyName and abilityName
     * @memberof CanService
     */
    parse(str) {
        const [abilityName, propertyName] = str.split('.');
        return {
            propertyName,
            abilityName
        };
    }
}
