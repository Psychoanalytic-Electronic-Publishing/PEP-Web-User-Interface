declare module 'ember-can' {
    class Ability {
        model: any;

        /**
         * Parse propertyName into ability property
         * eg: `createProject` will be parsed to `canCreateProject` using default definition
         * @public
         * @param  {[String]} propertyName [description]
         * @return {[String]}              [description]
         */
        parseProperty(propertyName: string): string;

        /**
         * Get parsed ability value based on propertyName
         * eg: `createProject` will return a value for `canCreateProject`
         * using default `parseProperty` definition
         * @private
         * @param  {String} propertyName property name, eg. `createProject`
         * @return {*}                   value of parsed `propertyName` property
         */
        getAbility(propertyName: string): any;
    }
}
