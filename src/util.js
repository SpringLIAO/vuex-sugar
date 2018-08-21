import _ from 'lodash';

export const mergeAsArray = (target, ...source) => _.compact([].concat(target, ...source));
// TODO: target or source can be a Vapi instance
export const mergeStore = (target, ...source) => _.merge(target, ...source);

export default { mergeAsArray, mergeStore };
