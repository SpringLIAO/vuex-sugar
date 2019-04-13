---
home: true
actionText: 快速上手 →
actionLink: /guide/quick-start
features:
- title: 模板代码
  details: 只需简单的设置即可生成Vuex的模板代码，从此不再重复写constant、action、mutation。
- title: REST 支持
  details: 快捷发起REST请求，内置axios HTTP客户端。支持动态参数，自动设置state，请求集中处理。
- title: 强大能力
  details: 链式调用，自定义请求处理方法，钩子函数，回调处理，请求过程状态参数，朴素action。任何你不满意的地方均可自定义。
footer: MIT Licensed | Copyright © 2018-present Spring Liao
---

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
export const store = new Vuex.Store(posts)

// Then you can dispatch a action and get data that from http response in *.vue.
this.listPosts() // with mapActions
...mapState(['posts']) // get state
```
