'use strict';

var _ = require('lodash');

var afterHooksLoaded = require('./afterHooksLoaded');

module.exports = function ToInitialize(sails) {

    /**
     * List of hooks that required for adminpanel to work
     */
    var requiredHooks = [
        'blueprints',
        'controllers',
        'http',
        'orm',
        'policies',
        'views'
    ];

    return function initialize(cb) {
        // Set up listener to bind shadow routes when the time is right.
        //
        // Always wait until after router has bound static routes.
        // If policies hook is enabled, also wait until policies are bound.
        // If orm hook is enabled, also wait until models are known.
        // If controllers hook is enabled, also wait until controllers are known.
        var eventsToWaitFor = [];
        eventsToWaitFor.push('router:after');
        try {
            /**
             * Check hooks availability
             */
            _.forEach(requiredHooks, function (hook) {
                if (!sails.hooks[hook]) {
                    throw new Error('Cannot use `adminpanel` hook without the `' + hook + '` hook.');
                }
                //if (hook == 'policies') {
                //    eventsToWaitFor.push('hook:' + hook + ':bound');
                //} else {
                eventsToWaitFor.push('hook:' + hook + ':loaded');
                //}
            });
        } catch(err) {
            if (err) {
                return cb(err);
            }
        }

        //Check views engine
        if (!_.isObject(sails.config.views.engine) || sails.config.views.engine.name !== 'jade') {
            return cb(new Error('For now adminpanel hook could work only with Jade template engine.'));
        }

        sails.after(eventsToWaitFor, afterHooksLoaded(sails));
        cb();
    }
};
