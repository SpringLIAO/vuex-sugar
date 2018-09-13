import _ from 'lodash';
import Resource from './resource';
import { mergeAsArray, mergeStore } from './util';
import { createStore } from './store';

const VuexSugar = function(options = {}) {
    if (!_.isPlainObject(VuexSugar.defaults)) VuexSugar.defaults = {};
    const { resolved, rejected, meta, ...rest } = options;
    if (meta) {
        rest.meta = Object.assign({}, VuexSugar.defaults.meta, meta);
    }
    if (resolved) {
        rest.resolved = mergeAsArray(VuexSugar.defaults.resolved, resolved);
    }
    if (rejected) {
        rest.rejected = mergeAsArray(VuexSugar.defaults.rejected, rejected);
    }
    return new Resource(Object.assign({}, VuexSugar.defaults, rest));
};

/**
 * VuexSugar global options.
 * @type {Object}
 */
VuexSugar.defaults = {};

export { createStore, mergeStore };

export default VuexSugar;
