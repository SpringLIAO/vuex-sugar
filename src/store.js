/* eslint-disable no-param-reassign, no-unused-expressions, import/no-cycle */
import _ from 'lodash';
import Resource from './resource';
import { mergeAsArray } from './util';

/*
 * execute resolved or rejected。
 */
const execCallBack = ({ dispatch, callback, data, rest }) => {
    if (typeof callback === 'string') {
        dispatch(callback, { ...data, ...rest });
        return;
    }
    if (_.isFunction(callback)) {
        callback(data, rest);
        return;
    }
    if (_.isPlainObject(callback)) {
        const { action, root = false, ...callbackPayload } = callback;
        dispatch(action, { ...data, ...callbackPayload, ...rest }, { root });
        return;
    }
    if (_.isArray(callback)) {
        callback.forEach(item => execCallBack({ dispatch, callback: item, data, rest }));
    }
};

/*
 * execute hooks
 */
const execHook = (callback, error, data) => {
    if (_.isFunction(callback)) {
        callback(error, data);
    }
};

/*
 * common action
 * @see Vuex action
 * @return {Promise} axios Involved axios
 */
async function commonAction({ commit, dispatch }, payload) {
    const {
        _type,
        _types,
        _plain,
        _validateResponse,
        _requestFn,
        params = {},
        data = {},
        meta,
        before,
        after,
        resolved,
        rejected,
        ...rest
    } = payload;
    const [BEGIN, SUCCESS, FAILURE] = _types;
    try {
        if (_plain) {
            commit(_type, { data, ...rest });
            return Promise.resolve();
        }
        // if not a plain action (is a http request action.)
        before && execHook(before);
        BEGIN && commit(BEGIN);
        return _requestFn({ params, data, meta })
            .then(res => {
                const resValidate = _validateResponse(res);
                const { data: value } = res;
                if (!resValidate) return Promise.reject(value);
                after && execHook(after, undefined, value);
                commit(SUCCESS, { ...rest, data: value });
                execCallBack({ dispatch, data: value, callback: resolved, rest });
                return Promise.resolve(res);
            })
            .catch(e => {
                after && execHook(after, e);
                commit(FAILURE, { msg: `${e}` });
                execCallBack({ dispatch, callback: rejected, rest });
                return Promise.reject(e);
            });
    } catch (e) {
        return Promise.reject(e);
    }
}

class Store {
    /**
     * @private
     * @instance Resource
     */
    resource;

    /**
     * vuex mutation type for success suffix
     * @public
     * @default 'SUCCEEDED'
     */
    successSuffix;

    /**
     * vuex mutation type for error suffix
     * @public
     * @default 'FAILED'
     */
    errorSuffix;

    /**
     * whether create a vuex state wrapped with function.
     * @public
     * @default false
     */
    createStateFn;

    /**
     * whether init pending state and error state for request.
     * @public
     * @default false
     */
    courseState;

    /**
     * whether reset the state to default when request error.
     * @default false
     */
    resetToDefaultWhenError;

    /**
     * vuex store
     * @private
     */
    store;

    /**
     * @constructor
     * @param {typeof Resource} resource Resource instance
     * @param {Object} options Store options
     * @return {Object} Vuex store
     */
    constructor(resource, options = {}) {
        this.resource = resource;
        const {
            successSuffix = 'SUCCEEDED',
            errorSuffix = 'FAILED',
            createStateFn = false,
            courseState = true
        } = options;
        this.successSuffix = successSuffix;
        this.errorSuffix = errorSuffix;
        this.createStateFn = createStateFn;
        this.courseState = courseState;
        this.resource = resource;
        this.store = this.createStore();
        return this.store;
    }

    /**
     * @private
     * @return {Object} Vuex state
     */
    createState() {
        if (this.createStateFn) {
            return this.createFnState();
        }
        return this.createObjectState();
    }

    /**
     * @private
     * @return {Object} Vuex Object state
     */
    createObjectState() {
        const { resource, courseState } = this;
        let state = _.cloneDeep(resource.state);
        if (courseState) {
            state = Object.assign({ pending: {}, error: {} }, state);
        }
        const { actions } = resource;
        Object.keys(actions).forEach(action => {
            const { property, plain } = actions[action];
            // don't do anything if no property is set
            if (!property) return;
            // if state is undefined set default value to null
            if (state[property] === undefined) {
                state[property] = null;
            }
            if (courseState && !plain) {
                state.pending[property] = false;
                state.error[property] = null;
            }
        });
        return state;
    }

    /**
     * @private
     * @return {Function} Vuex function state
     */
    createFnState() {
        return () => this.createObjectState();
    }

    /**
     * @private
     * @param {Object} defaultState Vuex default state that pass into Resource
     * @return {Object} Vuex mutations
     */
    createMutations(defaultState) {
        const mutations = {};
        const { resource, courseState, successSuffix, errorSuffix } = this;
        const { actions } = resource;
        Object.keys(actions).forEach(action => {
            const { property, commitString, successHandler, errorHandler, plain } = actions[action];
            mutations[`${commitString}`] = (state, payload = {}) => {
                if (plain && property) {
                    // if a plain action, allow change state by set successHandler
                    if (successHandler) {
                        successHandler(state, payload);
                    } else if (property) {
                        state[property] = payload;
                    }
                    return;
                }
                if (courseState && property) {
                    state.pending[property] = true;
                    state.error[property] = null;
                }
            };
            if (plain) return;
            // if not a plain action(is a http request action), add success and error mutation
            mutations[`${commitString}_${successSuffix}`] = (state, payload = {}) => {
                if (courseState && property) {
                    state.pending[property] = false;
                    state.error[property] = null;
                }
                // if set successHandler, would not change state automatically
                if (successHandler) {
                    successHandler(state, payload);
                } else if (property) {
                    state[property] = payload.data;
                }
            };
            mutations[`${commitString}_${errorSuffix}`] = (state, payload = {}) => {
                if (courseState && property) {
                    state.pending[property] = false;
                    state.error[property] = payload;
                }
                // set errorHandler to change state by yourself
                if (errorHandler) {
                    errorHandler(state, payload);
                } else if (property && this.resetToDefaultWhenError) {
                    // or change to default state
                    state[property] = defaultState[property];
                }
            };
        });
        return mutations;
    }

    /**
     * @private
     * @return {Object} Vuex actions
     */
    createActions() {
        const storeActions = {};
        const { resource, successSuffix, errorSuffix } = this;
        const { actions, validateResponse } = resource;
        Object.keys(actions).forEach(action => {
            const { dispatchString, commitString, requestFn, resolved, rejected, plain } = actions[action];
            /**
             * @see vuex action
             */
            storeActions[dispatchString] = async (context, payload = {}) => {
                const { resolved: actionResolved, rejected: actionRejected, ...rest } = payload;
                // merge resolved and rejected from global, instance and action
                const mergedResolved = actionResolved ? mergeAsArray(resolved, actionResolved) : resolved;
                const mergedRejected = actionRejected ? mergeAsArray(rejected, actionRejected) : rejected;
                const actionPayload = {
                    _type: plain ? commitString : '',
                    _types: !plain
                        ? [commitString, `${commitString}_${successSuffix}`, `${commitString}_${errorSuffix}`]
                        : [],
                    _plain: plain,
                    _validateResponse: validateResponse,
                    _requestFn: requestFn,
                    resolved: mergedResolved,
                    rejected: mergedRejected,
                    ...rest
                };
                return commonAction(context, actionPayload);
            };
        });
        return storeActions;
    }

    /**
     * @private
     * @return {Object} Vuex Store
     */
    createStore() {
        if (this.resource instanceof Resource) {
            const state = this.createState();
            return {
                namespaced: this.resource.namespaced,
                state,
                mutations: this.createMutations(state),
                actions: this.createActions()
            };
        }
        return null;
    }
}

export function createStore(resource, options = {}) {
    return new Store(resource, options);
}

export default Store;
