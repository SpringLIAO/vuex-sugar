import _ from 'lodash';
import Resource from './resource';
import { mergeAsArray, mergeStore } from './util';
import { createStore } from './store';

const Vapi = function(options = {}) {
    if (!_.isPlainObject(Vapi.defaults)) Vapi.defaults = {};
    const { resolved, rejected, meta, ...rest } = options;
    if (meta) {
        rest.meta = Object.assign({}, Vapi.defaults.meta, meta);
    }
    if (resolved) {
        rest.resolved = mergeAsArray(Vapi.defaults.resolved, resolved);
    }
    if (rejected) {
        rest.rejected = mergeAsArray(Vapi.defaults.rejected, rejected);
    }
    return new Resource(Object.assign({}, Vapi.defaults, rest));
};

/**
 * Vapi global options.
 * @type {Object}
 */
Vapi.defaults = {};

export { createStore, mergeStore };

export default Vapi;
