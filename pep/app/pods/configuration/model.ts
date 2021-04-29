import DS from 'ember-data';
import attr from 'ember-data/attr';

import { alwaysSend } from 'pep/decorators/models';

export default class Configuration extends DS.Model {
    @attr('string') configName!: string;
    // Note: the shape of the data in configSettings will be very different
    // from model to model, but will be properly typed when specific configs
    // are retrieved via the `config` service. So, very rarely, if ever,
    // should this model's `configSettings` attr be directly accessed in
    // the rest of the application.
    @alwaysSend
    @attr
    configSettings!: any;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        configuration: Configuration;
    }
}
