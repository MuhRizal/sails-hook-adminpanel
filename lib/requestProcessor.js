'use strict';

var _ = require('lodash');
var async = require('async');
var queryString = require('querystring');

/**
 * Default helper that will contain all methods
 * that should help with processing request details and bind
 *
 * @type {*}
 */
module.exports = {

    /**
     * Will add new HTTP GET params to current params and will return a new string of GET query params.
     *
     * @param {Request} req
     * @param {Object} params
     * @returns {String}
     */
    addGetParams: function(req, params) {
        if (!req || !_.isPlainObject(req.query)) throw new Error('Wrong request given !');
        if (!_.isPlainObject(params)) {
            params = {};
        }
        var query = _.merge(req.query, params);
        return queryString.stringify(query);
    },

    /**
     * upload file to server
     *
     * @param {string} key
     * @param {*} val
     * @param {Object} field
     * @param {Function=} [cb]
     * @returns {?string}
     */
    uploadFile: function(key, val, field, cb) {
        if (!key || !val || !field) {
            return null;
        }
        if (!req.file || !_.isFunction(req.file)) {
            return null;
        }
        var options = {};
        if (field.config.uploadPath) {
            options.dirname = field.config.uploadPath;
        }
        req.file(key).upload(options, cb);
    },

    /**
     * Will fetch all files from request. That should be stored
     *
     * @param {Request} req
     * @param {Object} fields List of fileds config
     * @param {Function=} [cb]
     */
    processFiles: function(req, fields, cb) {
        var fileFieldKeys = [];
        _.forIn(fields, function(field, key) {
            if (field.config && field.config.file) {
                fileFieldKeys.push(key);
            }
        });
        if (fileFieldKeys.length == 0) {
            return cb();
        }
        var files = {};
        async.eachLimit(fileFieldKeys, 10, function(key, done) {
            req.file(key).upload(function(err, file) {
                if (err) {
                    return done(err);
                }
                files[key] = file;
                done();
            });
        }, function(err, result) {
            cb(err, files);
        });
    },

    /**
     * Will try to find all fields that should be used in model
     *
     * @param {Request} req
     * @param {Object} fields
     * @param {Function=} [cb]
     * @see AdminUtil#getFields to know what data should be passed into fields
     * @returns {Object} List of processed values from request
     */
    processRequest: function(req, fields, cb) {
        var that = this;
        //that.processFiles(req, fields, function(err, result) {
        //    console.log(result);
        //
        //});
        var data = req.allParams();
        var result = _.pick(data, function(value, key) {
            return Boolean(fields[key]);
        });
        _.forIn(result, function(val, key) {
            var field = fields[key];
            if (field.model.type == 'boolean') {
                result[key] = Boolean(val);
            }
            //if (field.config.file) {
            //    //need to upload file
            //    that.uploadFile(key, val, field, function(err, file) {
            //        console.log(file);
            //    });
            //}
        });
        //Check or fields that was not passed
        _.forIn(fields, function(field, key) {
            if (!result[key] && field.model.type == 'boolean') {
                result[key] = false;
            }
        });
        //return cb(null, result);
        return result;
    }
};