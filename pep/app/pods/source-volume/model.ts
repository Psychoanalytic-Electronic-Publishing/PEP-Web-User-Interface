import DS from 'ember-data';
import attr from 'ember-data/attr';

export default class SourceVolume extends DS.Model {
    @attr('string') authorMast!: string;
    @attr('string') documentID!: string;
    @attr('string') documentInfoXML!: string;
    @attr('string') documentRef!: string;
    @attr('string') documentRefHTML!: string;
    @attr('string') issue!: string;
    @attr('string') issueTitle!: string;
    @attr('string') newSectionName!: string;
    @attr('string') PEPCode!: string;
    @attr('string') pgEnd!: string;
    @attr('string') pgRg!: string;
    @attr('string') pgStart!: string;
    @attr('string') score!: string;
    @attr('string') title!: string;
    @attr('string') vol!: string;
    @attr('string') year!: string;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        'source-volume': SourceVolume;
    }
}
