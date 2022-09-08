import Application from 'pep/app';
import config from 'pep/config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import '@glimmer/component';
import 'qunit-dom';

setApplication(Application.create(config.APP));

start();
