# vuex-sugar

一个帮助简化使用 Vuex 发起 HTTP(REST API)请求的工具。支持 [Vuex 2](https://vuex.vuejs.org/zh/)，默认使用流行的 HTTP 客户端[axios](https://github.com/mzabriskie/axios)发起请求。

`vuex-sugar`是一个旨在使应用程序副作用（即数据获取等异步事件和访问浏览器缓存等不正确的事物）更易于管理，执行效率更高的库，功能强大且完全可自定义。

如果你打算发起通过`vuex`来发起一个 HTTP API（尤其是 REST API）请求，你会发现这需要几个重复的步骤。你需要编写一个`action`来发起请求，然后编写一个`mutation`来改变`state`。或者你想要在一些地方集中处理请求，或者执行一些回调。本库能够帮助你生成一个 store，你只需按照简单的形式设置，它就会自动帮你生成 state、mutations、actions，然后自动处理请求并改变 state。

`vuex-sugar`并不是一个 Vuex plugin，仅仅只是一个帮助简化生成 Store 对象的工具，你可以对你任何不满意的地方进行重写。

[English Document](README.md)

## 用法

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

然后你可以在`vue`组件中 dispatch a action，并且获得 HTTP 请求返回的数据。

```
// dispatch action
this.listPosts() // with mapActions

// get state
...mapState(['posts'])
```

实际上，上面的代码自动生成了如下代码。

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

Oh, Yeah。更多用法参考[官方文档](https://Liaoct.github.io/vuex-sugar/)。

## 开发步骤

```bash
# install dependencies
yarn

# build for production with minification
yarn run build

# run eslint and fix code
npm run lint

# run all tests
yarn run test
```

## 修改历史

see [CHANGELOG.md](CHANGELOG.md)

## 致谢

本库的灵感来自于[redux-saga](https://github.com/redux-saga/redux-saga) 和 [vuex-rest-api](https://github.com/christianmalek/vuex-rest-api)。

For a detailed explanation on how things work, contact us <www.389055604@qq.com>.
