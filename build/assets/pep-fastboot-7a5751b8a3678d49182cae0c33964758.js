define("~fastboot/app-factory",["pep/app","pep/config/environment"],(function(e,t){return e=e.default,t=t.default,{default:function(){return e.create(t.APP)}}})),define("pep/initializers/ajax",["exports"],(function(e){"use strict"
Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0
e.default={name:"ajax-service",initialize:function(){}}})),define("pep/initializers/error-handler",["exports"],(function(e){"use strict"
Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0
var t={name:"error-handler",initialize:function(){Ember.onerror||(Ember.onerror=function(e){var t="There was an error running your app in fastboot. More info about the error: \n ".concat(e.stack||e)
console.error(t)})}}
e.default=t})),define("pep/instance-initializers/ember-data-storefront",["exports"],(function(e){"use strict"
function t(e){var t=e.lookup("service:fastboot").get("shoebox"),r=e.lookup("service:storefront")
t.put("ember-data-storefront",{get queries(){return r.get("fastbootDataRequests")}})}Object.defineProperty(e,"__esModule",{value:!0}),e.initialize=t,e.default=void 0
var r={name:"ember-data-storefront",initialize:t}
e.default=r})),define("pep/instance-initializers/setup-fetch",["exports","fetch"],(function(e,t){"use strict"
Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0
var r={name:"fetch",initialize:function(e){var r=e.lookup("service:fastboot");(0,t.setupFastboot)(r.get("request"))}}
e.default=r}))
