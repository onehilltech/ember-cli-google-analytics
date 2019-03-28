/* global ga */

import Ember from 'ember';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export function initialize (app) {
  // Create the one and only tracker need for the application.
  let ENV = app.resolveRegistration ('config:environment');
  let trackerId = Ember.get (ENV, 'ember-cli-google.analytics.trackerId');

  Ember.assert ('Missing ember-cli-google.analytics.trackerId in config/environment.', !!trackerId);

  let cookieDomain = Ember.getWithDefault (ENV, 'ember-cli-google.analytics.cookieDomain', 'auto');
  let trackerName = Ember.get (ENV, 'ember-cli-google.analytics.trackerName');

  // We only apply Google Analytics in the production environment. Otherwise, we run
  // the risk of collecting analytics of the application while it is in development,
  // testing, or any non-production environment.
  let {environment} = ENV;
  let isProductionEnv = environment === 'production';

  if (isProductionEnv) {
    window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
    ga ('create', trackerId, cookieDomain, trackerName);
  }

  // We still go through the steps so we ensure the behavior is the same in all
  // environments and we do not run into any surprises.

  Route.reopen({
    router: service('router'),

    init() {
      this._super(...arguments);
      if (isProductionEnv) {
        this.router.on('routeDidChange', (transition) => {
          if (transition.intent.name && window.ga) {
            window.ga(
              'send', 'pageview', this.router.urlFor(transition.intent.name)
            );
          }
        });
      }
    }
  });
}

export default {
  initialize
};
