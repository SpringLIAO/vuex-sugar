/* eslint-disable no-param-reassign, no-unused-expressions, import/no-cycle */
import Axios from 'axios';
import _ from 'lodash';
import { mergeAsArray } from './util';
import { createStore } from './store';

function validateRes(res) {
    if (!res) return false;
    const { status, data } = res;
    const isServerOk = !data || (data.code ? parseInt(data.code, 10) === 200 : true);
    return status === 200 && isServerOk;
}

function wrapWithFn(fn) {
    if (fn) {
        if (typeof fn === 'function') {
            const headersFunction = fn;
            return params => headersFunction(params);
        }
        return () => fn;
    }
    return null;
}

function getDispatchString(action) {
    return action;
}

function getCommitString(action) {
    const capitalizedAction = action.replace(/([A-Z])/g, '_$1').toUpperCase();
    return capitalizedAction;
}

class Resource {
    /**
     * http method collection
     * @private
     * @type {string[]}
     */
    static HTTPMethod = ['get', 'delete', 'head', 'options', 'post', 'put', 'patch'];

    /**
     * baseURL for axios,`baseURL` will be prepended to `url` unless `url` is absolute.
     * @public
     */
    baseURL;

    /**
     * axios instance.
     * @public
     */
    axios;

    /**
     * @public
     */
    namespaced;

    /**
     * validate a request should resolve or reject from the response
     * @public
     */
    validateResponse;

    /**
     * header(fn) or path(fn) will access the meta data
     * @public
     */
    meta;

    /**
     * request resolved callback
     * @public
     */
    resolved;

    /**
     * request rejected callback
     * @public
     */
    rejected;

    /**
     * Vuex initial state
     * @public
     */
    state;

    /**
     * action collection
     * @private
     */
    actions;

    /**
     * @constructor
     * @param {Object} options Instance options.
     * @returns {Resource} return a new Resource instance.
     */
    constructor(options = {}) {
        const {
            baseURL,
            axios = Axios,
            namespaced = false,
            validateResponse = validateRes,
            meta,
            resolved,
            rejected,
            state = {}
        } = options;
        this.baseURL = baseURL;
        this.axios = axios;
        this.namespaced = namespaced;
        this.validateResponse = validateResponse;
        this.meta = meta;
        this.resolved = resolved;
        this.rejected = rejected;
        this.state = _.isFunction(state) ? state() : state;
        this.actions = {};
        return this;
    }

    /**
     * add a Vuex action.
     * @public
     * @param {Object} options
     * @param {Object|Symbol} [options.action] Action name
     * @param {String|function} [options.path] Request url path, will access meta if it is a function.
     * ...
     * @returns {Resource} return this
     */
    add(options = {}) {
        // allow add multi action with array.
        if (_.isArray(options)) {
            options.forEach(option => this.add(option));
            return this;
        }

        const {
            action,
            path,
            method = 'get',
            requestConfig = {},
            property = null,
            meta,
            resolved,
            rejected,
            before,
            after,
            successHandler,
            errorHandler,
            headers
        } = options;
        // action name must be set.
        if (!action) {
            throw new Error('[vuex-sugar]: "action" property must be set.');
        }
        // action name should be unique
        if (this.actions[action]) {
            throw new Error(`[vuex-sugar]: Illegal action set. "${action}" has been used.`);
        }
        // if set path, http method should right.
        if (path && Resource.HTTPMethod.indexOf(method) === -1) {
            const methods = Resource.HTTPMethod.join(', ');
            throw new Error(
                `[vuex-sugar]: Illegal HTTP method set. Following methods are allowed: ${methods}. You chose "${
                    options.method
                }".`
            );
        }
        const headersFn = wrapWithFn(headers);
        const urlFn = wrapWithFn(path);
        const actionResolved = mergeAsArray(this.resolved, resolved);
        const actionRejected = mergeAsArray(this.rejected, rejected);
        const requestFn = (payload = {}) => {
            const { params, data, meta: actionMeta = {} } = payload;
            // This is assignment is made to respect the priority of the base URL
            // It is as following: request config base URL > baseURL > axios instance base URL
            const requestConfigWithProperBaseURL = Object.assign(
                {
                    baseURL: this.normalizedBaseURL,
                    method
                },
                requestConfig
            );
            const dispatchMeta = Object.assign({}, this.meta, meta, actionMeta);
            if (headersFn) {
                if (requestConfig.headers) {
                    // merge requestConfig headers, options.headers would override requestConfig headers.
                    requestConfigWithProperBaseURL.headers = Object.assign(
                        {},
                        requestConfig.headers,
                        headersFn(dispatchMeta)
                    );
                } else {
                    requestConfigWithProperBaseURL.headers = headersFn(dispatchMeta);
                }
            }

            // assign requestConfig params and data into axios options.
            let requestParams = params;
            let requestData = data;
            if (requestConfigWithProperBaseURL.params) {
                requestParams = Object.assign({}, requestConfigWithProperBaseURL.params, params);
            }

            if (requestConfigWithProperBaseURL.data) {
                requestData = Object.assign({}, requestConfigWithProperBaseURL.data, data);
            }

            return this.axios({
                ...requestConfigWithProperBaseURL,
                url: urlFn(dispatchMeta),
                params: requestParams,
                data: requestData
            });
        };
        this.actions[action] = {
            requestFn: path ? requestFn : null,
            property,
            successHandler,
            errorHandler,
            resolved: actionResolved,
            rejected: actionRejected,
            before,
            after,
            axios: this.axios,
            dispatchString: getDispatchString(action),
            commitString: getCommitString(action),
            plain: !path
        };
        return this;
    }

    /**
     * @public
     * @see add
     * @param options
     * @returns {Resource}
     */
    get(options = {}) {
        return this.add(Object.assign(options, { method: 'get' }));
    }

    /**
     * @public
     * @see add
     * @param options
     * @returns {Resource}
     */
    delete(options) {
        return this.add(Object.assign(options, { method: 'delete' }));
    }

    /**
     * @public
     * @see add
     * @param options
     * @returns {Resource}
     */
    head(options = {}) {
        return this.add(Object.assign(options, { method: 'head' }));
    }

    /**
     * @public
     * @see add
     * @param options
     * @returns {Resource}
     */
    options(options = {}) {
        return this.add(Object.assign(options, { method: 'options' }));
    }

    /**
     * @public
     * @see add
     * @param options
     * @returns {Resource}
     */
    post(options) {
        return this.add(Object.assign(options, { method: 'post' }));
    }

    /**
     * @public
     * @see add
     * @param options
     * @returns {Resource}
     */
    put(options = {}) {
        return this.add(Object.assign(options, { method: 'put' }));
    }

    /**
     * @public
     * @see add
     * @param options
     * @returns {Resource}
     */
    patch(options) {
        return this.add(Object.assign(options, { method: 'patch' }));
    }

    /**
     * @private
     * @returns {string}
     */
    get normalizedBaseURL() {
        return this.baseURL || this.axios.defaults.baseURL || '';
    }

    /**
     * @public
     * @param {Object} options Store options.
     * @return {Object} Vuex store
     */
    getStore(options) {
        return createStore(this, options);
    }
}

export default Resource;
