import Inflector from 'ember-inflector';

export function initialize() {
    //@ts-ignore
    const inflector = Inflector.inflector;

    //define all custom/irregular inflection rules (for model names, etc) here
    inflector.uncountable('whats-new');
    inflector.uncountable('whatsNew');
}

export default {
    name: 'inflector-rules',
    initialize
};
