import CommonRoute from 'pep/pods/admin/common/route';
import Configuration from 'pep/pods/configuration/model';

export default class AdminEsEs extends CommonRoute {
    controllerName = 'admin.en-us';
    templateName = 'admin.en-us';

    /**
     * Load the Spanish configuration
     *
     * @return {*}  {Promise<Configuration>}
     * @memberof AdminEsEs
     */
    model(): Promise<Configuration> {
        return this.store.queryRecord('configuration', { configname: 'es-es' });
    }
}
