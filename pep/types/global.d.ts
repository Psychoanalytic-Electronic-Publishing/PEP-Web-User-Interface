// Types for compiled templates
declare module 'pep/templates/*' {
import { TemplateFactory } from 'htmlbars-inline-precompile';

        const tmpl: TemplateFactory;
    export default tmpl;
}
