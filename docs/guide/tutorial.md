# 教程

## http 快捷方法

`add`方法用于添加一个`action`。对于任何合法的 HTTP methods，还提供了快捷方法。

```js
add(options: Object): VuexSugar
get(options: Object): VuexSugar
delete(options: Object): VuexSugar
head(options: Object): VuexSugar
options(options: Object): VuexSugar
post(options: Object): VuexSugar
put(options: Object): VuexSugar
patch(options: Object): VuexSugar
```

## 链式调用

如示例，`VuexSugar`可进行链式调用。

## 提交 action

通过action name(`action`字段)可以dispatch action。在HTTP中，`post`等请求使用`data`字段指定需要提交的数据，`get`请求使用`params`字段指定查询参数（与`axios`保持一致）。

```js
this.listPosts({
    params: {
        ...
    }
});
this.updatePost({
    data : {
        ...
    }
})
```

提交`action`时，除了可以传递请求参数以外，还可以传递其他提交参数，比如：`meta`、`resolved`、`rejected`、`after`、`before` 等。

```js
{
    params,
    data,
    meta,
    after,
    before,
    resolved,
    rejected,
    ...other
}
```

 除预留的提交参数之外，甚至可以提交其他任意的数据。这些数据将与请求结果一起被传递到`resolved/rejected`回调、`successHandler/errorHandler`等地方。但是这些数据并不会被`vuex-sugar`自动处理。

详情请参考[Api](/api)说明。


## 自定义请求处理方法

可以为`action`指定`successHandler`与`errorHandler`覆盖默认的自动改变`state`的行为。如果你想自己决定怎么改变`state`，那它很有用。

```js
add({
    action: 'listPosts',
    property: 'posts',
    path: '/posts',
    method: 'get',
    // successHandler or errorHandler的函数签名实际上与Vuex的mutation一样
    // 第一个参数仍然是store的state，第二个参数为commit载荷。这里为请求的返回结果。
    successHandler(state, payload) {
        state.posts = payload.data.list;
    }
});
```

此时，`VuexSugar`将不会自动改变`state`，而是使用指定的`successHandler`。

## 生成普通 action

`VuexSugar`不仅能添加 HTTP 请求`cation`，也能发起一个普通的`action`。

```js
add({
    action: 'changePageNum',
    property: 'page'
});
```

如果不指定`path`参数，则成为一个普通`action`（不需要发起请求），此时会自动将`changePageNum`的载荷赋值给`page`(dispatch `changePageNum`时，`data`字段指定的值)。

```js
this.changePageNum({
    data: { num: 1 }
}); // state.page = { num : 1}
```

此时，也可以指定`successHandler`来改变默认的赋值行为。注意：此处不能添加`errorHandler`，因为这里没有请求行为。之所以仍然使用`successHandler`，是以为我不想给你增加多记住一个参数的负担。

## 在`header`和`path`中使用参数

`VuexSugar`允许将`headers`和`path`指定为函数。

```js
get({
    action: 'getPost', // action name
    property: 'post', // state property name
    path: ({ id }) => `/posts/${id}`
});
```

`VuexSugar`使用`meta`参数为`headers`和`path`提供元数据。`meta`可以在提交`action`时指定，也可以在`action`定义时指定，还可以在`VuexSugar`实例上指定。

```js
const posts = VuexSugar({
    baseURL: '/v1/client',
    state: { posts: [] },
    meta: { userName: 'test' }
}).get({
    action: 'getPost', // action name
    property: 'post', // state property name
    meta: { queryAll: 1 },
    path: ({ id, queryAll }) => `/posts/${id}?queryAll=${queryAll}` // { userName: 'test', queryAll: 1, id: 123 }
});

// width mapActions
this.getPost({ meta: { id: 123 } });
```

`meta`会自动合并`VuexSugar`实例、`action`定义及`action`提交上的`meta`字段。

`headers`与`path`相同。

## 使用回调

`VuexSugar`允许使用`resovled`与`rejected`参数指定请求成功与失败时的回调。回调可以发起另一个`action`，也可以执行一个函数。

参数类型：`[String | Object | Function | Array: [String, Function, Object, Array]]`

-   **String 类型**： 回调执行`action`。表示回调执行指定`action`的name。
-   **Object 类型**： 回调执行`action`。该对象为`action`的提交选项，同`action`定义一样。其中`action`字段是必须的，可选的`root`字段表示是否进行全局提交。
-   **Function 类型**：回调执行函数。第一个参数为请求的返回结果，如果在提交`action`时，有传入非预留选项的数据，将作为第二个参数传入。
-   **Array 类型**： 回调执行集合，集合中的元素可以是以上任一合法的类型。`VuexSugar`将自动按顺序执行。

`resovled`与`rejected`参数可以分别在`VuexSugar`实例选项指定、`action`选项指定、`action`提交参数指定。`vuex-sugar`自动使用`contact`方法进行合并。

```js
const posts = VuexSugar({
    baseURL: '/v1/client',
    state: { posts: [] },
    // 每个action均会在请求失败时执行全局的message action。root参数表示该action为全局action。
    rejected: { action:'message', root: true }
})
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
        path: ({ id }) => `/posts/${id}`,
        // 更新成功则，执行全局的message action。并且重新刷新posts列表
        resolved: [{ action: 'message', root: true }, 'listPosts']
    })
    .getStore(); // create store object

// with mapActions
this.updatePost({
    resolved: () => this.btnEnable = true, // 执行成功按钮恢复可点击
    rejected: () => this.btnEnable = false // 执行过程中按钮不可点击
});

// updatePost 最终的resolved 和rejected
{
    ...
    resolved: [{ action: 'message', root: true }, 'listPosts', () => {}],
    rejected: [{ action:'message', root: true }, () => {}]
    ...
}
```

## 全局配置

`vuex-sugar`提供了一些全局配置，这些配置项被每个`vuex-sugar`实例使用。

使用`setGlobal`设置全局属性。

```
import { setGlobal } from 'vuex-sugar';
import { ApiBaseURL } from '@/config/system';
import { http } from '@/utils/request';

setGlobal({
    baseURL: ApiBaseURL,
    axios: options => http(options)
});
```

`vuex-sugar`的能力远不止于此，从[API](/api/)了解更多。
