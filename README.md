# PEP-Web User Interface (Client)
Single Page App Graphical User Interface for PEP-Web

This README outlines the details of collaborating on this Ember application.
A short introduction of this app could easily go here.

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/)
* [Yarn](https://yarnpkg.com/)
* [Ember CLI](https://ember-cli.com/)
* [Google Chrome](https://google.com/chrome/)
* [Font Awesome Pro Liscence](https://fontawesome.com/license)

## Installation

* `git clone <repository-url>` this repository
* `cd pep`
* `yarn install`

## SSL Certificate
By default we run this project with SSL. You will either need to run the server without SSL (see below) or generate a [self signed cert](https://devcenter.heroku.com/articles/ssl-certificate-sel). 

## Running / Development

* With SSL `yarn start`
* without SSL `ember serve –ssl=false`
* Visit your app at [http://localhost:4200](http://localhost:4200).
* Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Linting

* `yarn lint:hbs`
* `yarn lint:js`
* `yarn lint:js --fix`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

@TODO add some relevant info here about gavant's CI/deploy processes

## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
