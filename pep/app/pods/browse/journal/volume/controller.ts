import Controller from '@ember/controller';

import SourceVolume from 'pep/pods/source-volume/model';
import { parseXML } from 'pep/utils/dom';

interface SortedModel {
    issue: string;
    sections: {
        [key: string]: {
            title?: string;
            models: SourceVolume[];
        };
    };
}

export default class BrowseJournalVolume extends Controller {
    get sortedModels() {
        const model = this.model as SourceVolume[];

        const models = model.reduce<{ [key: string]: SortedModel }>((sortedModels, sourceVolume) => {
            if (issue && title) {
                if (!sortedModels[issue]) {
                    sortedModels[issue] = {
                        issue,
                        sections: {
                            [title]: {
                                title,
                                models: [sourceVolume]
                            }
                        }
                    };
                } else if (!sortedModels[issue].sections[title]) {
                    sortedModels[issue].sections[title] = {
                        title,
                        models: [sourceVolume]
                    };
                } else {
                    sortedModels[issue].sections[title].models.push(sourceVolume);
                }
            }
            return sortedModels;
        }, {});
        return models;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'browse/journal/volume': BrowseJournalVolume;
    }
}
