import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class HeadDataService extends Service {
    @tracked themePath?: string;
    @tracked linkColors?: string;
}
