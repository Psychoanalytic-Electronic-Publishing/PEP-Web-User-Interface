import attr from 'ember-data/attr';

import Document from 'pep/pods/document/model';

export default class GlossaryTerm extends Document {
    @attr('string') coreName!: string;
    @attr('string') documentId!: string;
    @attr('string') groupName!: string;
    @attr('string') groupTermCount!: string;
    @attr('string') referenceCount!: string;
    @attr('string') term!: string;
    @attr('string') termCount!: number;
    @attr('string') termDefPartXML!: string;
    @attr('string') termDefRefXML!: string;
    @attr('string') termID!: string;
    @attr('string') termSource!: string;
    @attr('string') termType!: string;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your models.
declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        'glossary-term': GlossaryTerm;
    }
}
