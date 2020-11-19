import Controller from '@ember/controller';
import { cached } from '@glimmer/tracking';

import SourceVolume from 'pep/pods/source-volume/model';

interface Issue {
    title: string;
    models: SourceVolume[];
}

export default class BrowseJournalVolume extends Controller {
    /**
     * Organize the models by issue number
     *
     * @readonly
     * @memberof BrowseJournalVolume
     */
    @cached
    get sortedModels() {
        const model = this.model as SourceVolume[];

        const models = model.reduce<{ [key: string]: Issue }>((sortedModels, sourceVolume) => {
            const issue = sourceVolume.issue;
            if (issue) {
                if (!sortedModels[issue]) {
                    sortedModels[issue] = {
                        title: sourceVolume.issueTitle,
                        models: [sourceVolume]
                    };
                } else {
                    sortedModels[issue].models.push(sourceVolume);
                }
            }
            return sortedModels;
        }, {});
        const result = Object.keys(models).map((key) => {
            return models[key];
        });

        return result;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'browse/journal/volume': BrowseJournalVolume;
    }
}
