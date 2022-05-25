import ContainerProxyMixin from '@ember/engine/-private/container-proxy-mixin';
import RegistryProxyMixin from '@ember/engine/-private/registry-proxy-mixin';

import { TemplateFactory } from 'htmlbars-inline-precompile';

// Types for compiled templates
declare module 'pep/templates/*' {
        const tmpl: TemplateFactory;
    export default tmpl;
}

export type EmberOwner = RegistryProxyMixin & ContainerProxyMixin;
