# vuex-sugar

A Helper utility to simplify the usage of REST APIs with Vuex 2. Uses the popular HTTP client [axios](https://github.com/mzabriskie/axios) for requests.

`vuex-sugar` is a library that aims to make application side effects (i.e. asynchronous things like data fetching and impure things like accessing the browser cache) easier to manage, more efficient to execute, powerful and customizable.

If you want to connect a http API (even REST API) with `Vuex` you'll find that there are a few repetitive steps. You need to make a `action` to request the data from the api and make a `mutation` to set the state. And you may want somewhere to centralized handle request, or simplify execute callback. This utility helps in creating the store by setting up the state, mutations and actions with a easy to follow pattern.

[中文文档](README.CN.md)

## Usage

```js
// step 1
import VuexSugar from 'vuex-sugar';

// step 2
const posts = VuexSugar({
    baseURL: '/v1/client',
    state: { posts: [] }
})
    // step 3
    .get({
        action: 'getPost', // action name
        property: 'post', // state property name
        path: ({ id }) => `/posts/${id}`
    })
    .get({
        action: 'listPosts',
        property: 'posts',
        path: '/posts'
    })
    .post({
        action: 'updatePost',
        property: 'post',
        path: ({ id }) => `/posts/${id}`
    })
    // step 4
    .getStore(); // create store object

// step 5
export const store = new Vuex.Store(posts);
```

Then you can dispatch a action and get data that from http response in \*.vue.

```
// dispatch action
this.listPosts() // with mapActions

// get state
...mapState(['posts'])
```

In fact, the above code will automatically generate the following code.

```
{
   namespaced: false,
   state: {
       pending: {
           posts: false,
           post: false
       },
       error: {
           posts: null,
           post: null
       },
       posts: [],
       post: null
   },
   mutations: {
       LIST_POSTS: Function,
       LIST_POSTS_SUCCEEDED: Function,
       LIST_POSTS_FAILED: Function,
       GET_POST: Function,
       GET_POST_SUCCEEDED: Function,
       GET_POST_FAILED: Function,
       UPDATE_POST: Function,
       UPDATE_POST_SUCCEEDED: Function,
       UPDATE_POST_FAILED: Function
   },

   actions: {
       listPosts: Function,
       getPost: Function,
       updatePost: Function
   }
}
```

See, all the work is so pleasant and convenient. More details visit [https://Liaoct.github.io/vuex-sugar/](https://Liaoct.github.io/vuex-sugar/).

## Dev Setup

```bash

# install dependencies
yarn

# build for production with minification
yarn run build

# run eslint and fix code style
npm run lint

# run all tests
yarn run test

```

## CHANGELOG

see [CHANGELOG.md](CHANGELOG.md)

## Thanks

Inspired by [redux-saga](https://github.com/redux-saga/redux-saga) and [vuex-rest-api](https://github.com/christianmalek/vuex-rest-api).

For a detailed explanation on how things work, contact us <www.389055604@qq.com>.
