# 快速上手

## 安装

推荐使用`yarn`安装。

```bash
yarn add vuex-sugar
```

## 使用步骤


1. Import `vuex-sugar`(我叫做`VuexSugar`)。

2. 创建一个`VuexSugar`实例。

    创建实例时，可以传入[实例选项](/api/#vuexsugar-实例选项)。建议你应该始终传入一个`baseUrl`来表示向哪里发起请求。另外，可选的传入`axios`实例，也可以初始化默认的`state`。如果没有设置默认的`state`，`vuex-sugar`会自动根据`property`设置为`null`。

3. 添加 actions。

    每个 action 都表示一个[vuex action 的定义](https://vuex.vuejs.org/zh/guide/actions.html)，通过传入[选项参数对象](/api/#action-选项)来定义。当该`action`被调用时（`action`属性指定的名称），会发起一个特定的请求(`path`属性指定的请求)，然后根据请求的返回值去设置对应的`state`（由`property`属性指定）。

4. 生成 store 对象。

    手动调用`VuexSugar`实例的[getStore](/api/#getstore)方法，或者将`VuexSugar`实例传入[createStore](/api/#creatstore)方法。

5. 将store对象传入 [Vuex.Store构建器](https://vuex.vuejs.org/zh/api/#vuex-store)，以进行注册。

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
```

## Store对象的结构

生成的 store 如下：

```js
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

## 使用Store

上面生成的`store`对象可直接作为[Vuex.store](https://vuex.vuejs.org/zh/api/#vuex-store-%E6%9E%84%E9%80%A0%E5%99%A8%E9%80%89%E9%A1%B9)的构建器选项，或者作为[module](https://vuex.vuejs.org/zh/api/#modules)使用。

当通过`Vuex.store`注册后，即可像`vuex`原有的`action`、`state`一样进行使用。

## 重要概念

在`vuex-sugar`中需要明白三个重要的概念`VuexSugar`实例、`action`、`store`。

-   `VuexSugar`实例：是通过`VuexSugar构造函数`与[选项参数](/api/#vuexsugar-实例选项)生成的对象，它主要包含了一些请求处理参数，默认的`state`，以及`action`的部分预定义参数。

-   `action`：通过[VuexSugar实例`add`方法](/api/#add)（或者其他快捷方法，如：`get`）方法添加的`action`。此处的`action`不同于 Vuex 中的`action`，这里仅仅只是包含`action`的一些预定义，并没有真正生成`action`函数。

    同样可以传入[action选项](/api/#action-选项)，每调用一次`add`方法，都会产生一个新的`action`。执行`action`时，可以传入提交参数。

-   `store`：这里的是`store`与 [Vuex store（module）](https://vuex.vuejs.org/zh/guide/modules.html)的概念是一致的。通过调用`VuexSugar.getStore()`产生真正的`action`、`mutation`等。
