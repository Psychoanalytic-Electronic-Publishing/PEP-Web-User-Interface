import CommonRoute from 'pep/pods/admin/common/route';
import Configuration from 'pep/pods/configuration/model';

export default class AdminFrFr extends CommonRoute {
    controllerName = 'admin.en-us';
    templateName = 'admin.en-us';

    /**
     * Load the french configuration
     *
     * @return {*}  {Promise<Configuration>}
     * @memberof AdminFrFr
     */
    model(): Promise<Configuration> {
        return this.store.queryRecord('configuration', { configname: 'fr-fr' });
    }
}
