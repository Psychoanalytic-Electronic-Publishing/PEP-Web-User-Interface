import Route from '@ember/routing/route';

import { PageNav, PageSidebar } from 'pep/mixins/page-layout';

export default class Admin extends PageSidebar(PageNav(Route)) {}
