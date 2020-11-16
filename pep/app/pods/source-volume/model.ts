import DS from 'ember-data';
import attr from 'ember-data/attr';

export default class SourceVolume extends DS.Model {
    @attr('string') documentID!: string;
    @attr('string') documentRef!: string;
    @attr('string') documentRefHTML!: string;
    @attr('string') documentInfoXML!: string;
    @attr('string') authorMast!: string;
    @attr('string') PEPCode!: string;
    @attr('string') vol!: string;
    @attr('string') year!: string;
    @attr('string') pgRg!: string;
    @attr('string') pgStart!: string;
    @attr('string') pgEnd!: string;
    @attr('string') score!: string;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        'source-volume': SourceVolume;
    }
}
