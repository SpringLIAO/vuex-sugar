# vuex-sugar

> 一个帮助简化使用Vuex发起HTTP(REST API)请求的工具。支持Vuex 2，默认使用流行的HTTP客户端[axios](https://github.com/mzabriskie/axios)发起请求。

## 目录

* [解决什么问题？](#what-is-the-good-for)
* [简单的示例](#simple-example)
* [安装](#install)
* [用法](#usages)
    * [使用步骤](#steps)
    * [重要概念](#concepts)
    * [链式调用](#call-chaining)
    * [http快捷方法](#http-shortcut)
    * [提交action](#dispatch-action)
    * [自定义请求处理方法](#custom-request-handler)
    * [生成普通action](#plain-action)
    * [在headers和path中使用参数](#header-path-config)
    * [使用回调](#callback)
* [API](#api)
    * [构造函数](#constructor)
    * [VuexSugar实例选项](#instance-options)
    * [VuexSugar实例方法](#instance-methods)
    * [action选项](#action-options)
    * [store选项](#store-options)
    * [action提交参数](#dispatch-options)
    * [全局方法](#global-methods)
* [开发步骤](#dev)
* [致谢](#thanks)
* [修改历史](#changelog)

## <a id="what-is-the-good-for">解决什么问题？</a>

如果你使用Vuex来发起REST API请求，你会发现需要几个重复的步骤。你需要通过一个api请求来获得数据（通过action），然后设置state（通过mutation）。这个工具可以帮助你生成一个store，只需按照简单的形式设置，它就会自动帮你生成state、mutations、actions，然后自动处理请求并改变state。

它并不是一个Vuex plugin，仅仅只是一个帮助简化生成Store对象的工具，你可以对你任何不满意的地方进行重写。

## <a id="simple-example">简单的示例</a>

```vuejs
import VuexSugar from 'vuex-sugar';

const posts = VuexSugar({
    baseURL: '/v1/client',
    state: { posts: [] }
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
        path: ({ id }) => `/posts/${id}`
    })
    .getStore(); // create store object

Vuex.Store(posts);

// 然后正常发起action
this.listPosts() // with mapActions
```

## <a id="install">安装</a>

```bash
yarn add vuex-sugar
```

## <a id="usages">用法</a>

### <a id="steps">使用步骤</a>

1. Import `vuex-sugar`(我叫做`VuexSugar`)。

2. 创建一个`VuexSugar`实例。

    创建实例时，可以传入实例选项。建议你应该始终传入一个`baseUrl`来表示向哪里发起请求。另外，可选的传入`axios`实例，也可以初始化默认的`state`。如果没有设置默认的`state`，`vuex-sugar`会自动根据`property`设置为`null`。

3. 添加actions。

    每个action都表示一个vuex action。当它被调用时（`action`属性），会发起一个特定的请求(`path`属性)，然后会根据请求的返回值去设置对应的`property`。

4. 生成store对象。

    手动调用`VuexSugar`实例的`getStore`方法，或者将`VuexSugar`实例传入`createStore`方法。

5. 将它传入Vuex。

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
Vuex.Store(posts);

```

生成的store如下：

 ```js
// will got this
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

### <a id="concepts">重要概念</a>

在`vuex-sugar`中需要明白三个重要的概念`VuexSugar`实例、`action`、`store`。

- `VuexSugar`实例：是通过`VuexSugar`构造函数与选项参数生成的对象，它主要包含了一些请求处理参数，默认的`state`，以及`action`的部分预定义参数。

- `action`：通过`VuexSugar`实例的`add`（或者其他快捷方法，如：get）方法添加的`action`。此处的`action`不同于Vuex中的`action`，这里仅仅只是包含`action`的一些预定义，并没有真正生成`action`函数。

    同样可以传入`action选项`，每调用一次`add`方法，都会产生一个新的`action`。执行`action`时，可以传入提交参数。

- `store`：这里的是`store`与Vuex store（module）的概念是一致的。通过调用`VuexSugar.getStore()`产生真正的`action`、`mutation`等。

### <a id="call-chaining">链式调用</a>

如示例，`VuexSugar`可进行链式调用

### <a id="http-shorcut">http快捷方法</a>

`add`方法用于添加一个`action`。对于任何合法的HTTP methods，还提供了快捷方法。

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

### <a id="dispatch-action">提交action</a>

`post`等请求使用`data`字段指定需要提交的数据，`get`请求使用`params`字段指定查询参数（与`axios`保持一致）。

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

提交`action`时，除了可以传递请求参数以外，还可以传递其他提交参数，比如：meta、resolved、rejected、after、before等。

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

> 除预留的提交参数之外，甚至可以提交其他任意的数据。这些数据将与请求结果一起被传递到`resolved/rejected`回调、`successHandler/errorHandler`等地方。但是这些数据并不会被`vuex-sugar`自动处理。
>
> 详情请参考[Api](#api)说明。

### <a id="custom-request-handler">自定义请求处理方法</a>

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
})
```

此时，`VuexSugar`将不会自动改变`state`，而是使用指定的`successHandler`。

### <a id="plain-action">生成普通action</a>

`VuexSugar`不仅能添加HTTP请求`cation`，也能发起一个普通的`action`。

```js
add({
    action: 'changePageNum',
    property: 'page'
})
```

如果不指定`path`参数，则成为一个普通`action`（不需要发起请求），此时会自动将`changePageNum`的载荷赋值给`page`。

```js
this.changePageNum({
    num: 1
}); // state.page = { num : 1}
```
此时，也可以指定`successHandler`来改变默认的赋值行为。注意：此处不能添加`errorHandler`，因为这里没有请求行为。之所以仍然使用`successHandler`，是以为我不想给你增加多记住一个参数的负担。

### <a id="header-path-config">在`header`和`path`中使用参数</a>

`VuexSugar`允许将`headers`和`path`指定为函数。

```js
get({
    action: 'getPost', // action name
    property: 'post', // state property name
    path: ({ id }) => `/posts/${id}`
})
```

`VuexSugar`使用`meta`参数为`headers`和`path`提供元数据。`meta`可以在提交`action`时指定，也可以在`action`定义时指定，还可以在`VuexSugar`实例上指定。

```js
const posts = VuexSugar({
    baseURL: '/v1/client',
    state: { posts: [] },
    meta: { userName: 'test' }
})
    .get({
        action: 'getPost', // action name
        property: 'post', // state property name
        meta: { queryAll: 1 },
        path: ({ id, queryAll }) => `/posts/${id}?queryAll=${queryAll}` // { userName: 'test', queryAll: 1, id: 123 }
    })

// width mapActions
this.getPost({ meta: { id : 123 } });
```

`meta`会自动合并`VuexSugar`实例、`action`定义及`action`提交上的`meta`字段。

`headers`与`path`相同。

### <a id="callback">使用回调</a>

`VuexSugar`允许使用`resovled`与`rejected`参数指定请求成功与失败时的回调。回调可以发起另一个`action`，也可以执行一个函数。

参数类型：`[String | Object | Function | Array: [String, Function, Object, Array]]`

- **String类型**： 回调执行`action`。表示回调执行指定name的`action`。
- **Object类型**： 回调执行`action`。该对象为`action`的提交选项。其中需要指定`action`字段，可选的`root`字段表示是否进行全局提交，其他字段为合法的提交选项。
- **Function类型**：回调执行函数。第一个参数为请求的返回结果。
- **Array类型**： 回调执行集合，集合中的元素可以是以上任一合法的类型。`VuexSugar`将自动按顺序执行。

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

`vuex-sugar`的能力远不止于此，从[API](#api)了解更多。

## <a id="api">API</a>

### <a id="constructor">构造函数</a>

#### `# VuexSugar`

- **函数签名**: `constructor(options:Object):VuexSugar`
- **用法**:

    ```js
    const VuexSugar = VuexSugar({ baseURL: '' })

    // 等效
    const VuexSugar = new VuexSugar({ baseURL: '' })
    ```

    `VuexSugar`方法内部会隐式的使用`new`创建一个对象。可以传入一个实例选项对象。

### <a id="instance-options">VuexSugar实例选项</a>

#### `# axios`

- **类型**: `axios` (instance)
- **默认值**: `axios` (instance)
- **用法**:

    ```
    import Axios from 'axios'
    import VuexSugar from 'vuex-sugar';

    const service = Axios.create({
        withCredentials: true,
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });

    VuexSugar({
        axios: service
    })

    ```

    `axios`可以是任何有效的`axios`实例。可以自定义axios实例，或者其他能够返回Promise的Http请求工具。默认使用`axios`。

#### `# baseUrl`

- **类型**: `string`
- **用法**:

    ```
    VuexSugar({
        baseURL: '/v1/client'
    })
    ```

    `baseURL`将传入`axios`实例。除了实例选项可以设置`baseURL`，`action`选项`requestCongi`也可以指定请求的`baseURL`。

    如果这两个地方都没有设置，将使用`axios`默认的`baseURL`。优先权：`request config base URL > baseURL > axios instance base URL`

#### `# namespaced`

- **类型**: `boolean`
- **默认值**: `false`
- **用法**:

    ```
    VuexSugar({
        namespaced: true
    })
    ```

    指定该实例下的`store`是否具有命名空间，与Vuex `namespaced`意义相同。

#### `# validateResponse`

- **类型**: `function`
- **函数签名**: `validateResponse(res: Response): boolean`
- **默认值**:
    ```js
    function validateResponse(res) {
        if (!res) return false;
        const { status, data } = res;
        const isServerOk = !data || (data.code ? parseInt(data.code, 10) === 200 : true);
        return status === 200 && isServerOk;
    }
    ```
- **详细**: `vuex-sugar`默认服务端REST API返回的结果形式如下：
    ```js
    {
        code: number,
        data: any,
        msg: string
    }
    ```
    其中`code`与HTTP `status`意义相同，`data`为实际返回的结果，`msg`为额外的信息。REST采用此设计，主要在于服务端能够返回更多信息给前端，方便前端灵活处理。如果你的项目中，采用其他的结构，可以重写`validateResponse`以便决定请求成功或者失败。
- **用法**:

    ```
    function validateResponse(res) {
        if (!res) return false;
        const { status } = res;
        return status >= 200 && status < 300 ;
    }

    VuexSugar({
        validateResponse
    })
    ```
    `vuex-sugar`将使用新的方法来判断请求结果。

#### `# meta`

- **类型**: `object`
- **用法**:

    ```
    VuexSugar({
        namespaced: true
    })
    ```

    添加实例元数据，函数类型的`headers`与`path`能够访问它，被该实例的所有`action`共享。将与`action`选项中的`meta`、`action`提交参数中的`meta`进行合并。

#### `# resolved`

- **类型**: `String|Object|Funtion|Array`
- **用法**:

    ```js
    const posts = VuexSugar({
        baseURL: '/v1/client',
        state: { posts: [] },
        // 每个action均会在请求成功时执行全局的message action。root参数表示该action为全局action。
        Resolved: { action:'message', root: true }
    })
    ```

    设置实例的`resolved`，用于设置请求成功的回调。被该实例的所有`action`共享，最终会被合并到`action`中。

    - String类型：表示回调执行一个`action`。该`action`只能是本实例`store`的`action`。如果需要向全局提交`action`，或者为`action`传递参数，则使用对象形式。

    - Object类型：也用于回调执行`action`。形式如下:

    ```js
    {
        // 只有action属性是必须的
        action: String, // action name
        [root]: boolean, // global dispatch
        // 可以添加其他任何action提交参数
        [data]: Object, // http data
        [params]: Object,// http params
        [... other action dispatch options]
        // 也可以添加除action提交参数以外的数据
        [.. other payload]
    }
    ```

    - Function类型：回调执行函数。函数参数为`(Response, rest)`。`response`为请求返回结果，`rest`为`action`提交时除提交参数以外的数据。

    ```js
    this.updatePost({
        data : {
            ...
        },
        data1, // data1不属于action提交参数，将会被原样传送给回调函数
        data2,
        ...,
        resolved: (res, { data1, data2, ... }) => {} // 剩余数据将会被传递给回调函数
    })
    ```

    - Array类型：可包含以上任一类型，甚至嵌套的数组。

#### `# rejected`

- **类型**: `String|Object|Funtion|Array`
- **用法**:

    与`resolved`相同，用于设置请求失败的回调。

#### `# state`

- **类型**: `Object|Function`
- **默认值**: `{}`
- **用法**:

    ```js
    const posts = VuexSugar({
        baseURL: '/v1/client',
        state: { posts: [] }
    })
    ```

    设置store的默认`state`，`state`应该与`action`中的`property`对应。如果没有指定默认的`state`，则默认为`null`。

    如果`state`为函数形式，则在实例初始化时被执行。函数应该返回一个纯对象。

    ```js
    const posts = VuexSugar({
        baseURL: '/v1/client',
        state: () => { return { posts: [] } } // 返回纯对象
    })
    ```

    注意：该函数并不是最终生成的`state`，如果需要最终生成的`state`为函数，请在`store`选项中指定。

    当请求成功时，将自动更新`property`对应的`state`。

### <a id="instance-methods">VuexSugar实例方法</a>

#### `# add`

- **函数签名**: `(options: Object): VuexSugar`
- **用法**:

    ```js
    add({
        action: 'listPosts',
        property: 'posts',
        path: '/posts',
        method: 'get'
    })
    ```

    在`VuexSugar`实例上添加一个`action`，返回该实例。添加`action`并不是真正的Vuex action，这里添加了`action`的定义。可以通过选项对象设置`action`。

    选项对象中`action`为必须字段。更多选项，请参考[action选项](#action-options)。

#### `# get`

- **函数签名**: `(options: Object): VuexSugar`
- **用法**:

    ```js
    get({
        action: 'listPosts',
        property: 'posts',
        path: '/posts'
    })
    // 等同于
    add({
        action: 'listPosts',
        property: 'posts',
        path: '/posts',
        method: 'get'
    })
    ```

   `add`方法的别名，`get`请求的快捷方法。

#### `# delete`

- **函数签名**: `(options: Object): VuexSugar`
- **用法**:

   `add`方法的别名，`delete`请求的快捷方法。

#### `# head`

- **函数签名**: `(options: Object): VuexSugar`
- **用法**:

   `add`方法的别名，`head`请求的快捷方法。

#### `# options`

- **函数签名**: `(options: Object): VuexSugar`
- **用法**:

   `add`方法的别名，`options`请求的快捷方法。

#### `# post`

- **函数签名**: `(options: Object): VuexSugar`
- **用法**:

   `add`方法的别名，`post`请求的快捷方法。

#### `# put`

- **函数签名**: `(options: Object): VuexSugar`
- **用法**:

   `add`方法的别名，`put`请求的快捷方法。

#### `# patch`

- **函数签名**: `(options: Object): VuexSugar`
- **用法**:

   `add`方法的别名，`patch`请求的快捷方法。

#### `# getStore`

- **函数签名**: `(options: Object): Store`
- **用法**:

    ```js
    VuexSugar().getStore({
        courseState: true, // 自动生成pending与error数据
        createStateFn: true // 返回的state为函数形式
    })
    ```
   用于生成Vuex store对象。

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

### <a id="action-options">action选项</a>

#### `# action`

- **类型**: `String`
- **用法**:

   ```js
    get({
        action: 'listPosts',
        property: 'posts',
        path: '/posts'
    })
    ```
    指定`action`的name，可通过Vuex store的`dispatch`进行提交。

    ```js
    // direct via store
    this.$store.dispatch("actionName", { params: {}, data: {} })

    // or with mapActions
    this.actionName({ params: {}, data: {} })
    ```

#### `# property`

- **类型**: `String`
- **用法**:
    ```js
    get({
        action: 'listPosts',
        property: 'posts',
        path: '/posts'
    })
    ```

    指定`action`对应的`state`字段。如果没有指定该字段，则不会自动更改`state`，即使指定了默认的`state`。

    ```js
    const posts = VuexSugar({
        baseURL: '/v1/client',
        state: { posts: [] }
    })
        .get({
            action: 'getPost', // action name
            property: 'post', // state property name
            path: ({ id }) => `/posts/${id}`
        })
        .get({
            action: 'listPosts',
            // property: 'posts', // 没有指定property
            path: '/posts'
        })
        .post({
            action: 'updatePost',
            property: 'post',
            path: ({ id }) => `/posts/${id}`
        })
        .getStore(); // create store object

    // post默认值为null，会自动设置post。
    // posts虽然设置了默认值，但是没有对应的property，因此不会自动改变。
    ```

    当仅仅需要添加一个普通的`action`，在此Store下并不需要`state`（如：全局提交），则可省略`property`，这很有必要。

#### `# path`

- **类型**: `String|Function`
- **用法**:

    Api请求的路径，如果`path`为相对路径，则会自动使用`baseURL`作为前缀。

    如果`path`为函数，则可使用`meta`元数据，`path`在发起请求前会自动执行。`path`应该返回字符串路径。

    详细使用方法参考[在headers和path中使用参数](#header-path-config)

#### `# headers`

- **类型**: `Object|Function`
- **用法**:

    Api请求头部，该选项的值将于`requestConfig`选项中的`headers`合并。

    ```js
    get({
            action: 'getPost', // action name
            property: 'post', // state property name
            headers: { userName: 'test' }
        })
    ```

    如果`headers`为函数，则可使用`meta`元数据，`headers`在发起请求前会自动执行。`headers`应该返回对象数据。

    详细使用方法参考[在headers和path中使用参数](#header-path-config)

#### `# method`

- **类型**: `String`
- **用法**:

    Http请求的`method`字段。允许的值为：`['get', 'delete', 'head', 'options', 'post', 'put', 'patch']`

#### `# requestConfig`

- **类型**: `Object`
- **用法**:

    `Axios`的请求参数。该选项中指定的属性具有最高优先权。

#### `# meta`

- **类型**: `object`
- **用法**:

    添加`action`元数据，与`VuexSugar实例选项`用法一致，将与实例选项进行合并。


#### `# resolved`

- **类型**: `String|Object|Funtion|Array`
- **用法**:

    设置当前`action`的`resolved`，用于设置请求成功的回调。与`VuexSugar实例选项`用法一致，将与实例选项进行合并。

#### `# rejected`

- **类型**: `String|Object|Funtion|Array`
- **用法**:

    与`resolved`相同，用于设置请求失败的回调。

#### `# successHandler`

- **类型**: `Function`
- **参数**: `(state, payload)`
- **用法**:

    用于设置请求成功时，覆盖默认的改变`state`的行为。见[自定义请求处理方法](#custom-request-handler)。

    第二个参数包含了接口的返回结果。如果在`action`提交时，添加了其他额外数据，这里也会被合并传入进来。

#### `# errorHandler`

- **类型**: `Function`
- **参数**: `(state, payload)`
- **用法**:


    第二个参数包含了接口的返回结果。如果在`action`提交时，添加了其他额外数据，这里也会被合并传入进来。

### <a id="store-options">store选项</a>

#### `# createStateFn`

- **类型**: `boolean`
- **默认值**: `false`
- **用法**:

    设置返回的`state`是否为函数形式。

    ```js
    VuexSugar().getStore({
        courseState: true, // 自动生成pending与error数据
        createStateFn: true // 返回的state为函数形式
    })
    ```

    返回的store 为:

    ```js
    {
        namespaced: false,
        state: function(){
            return {
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
            };
        }
        ...
    }
    ```

    默认返回的`state`不被函数包裹。

#### `# courseState`

- **类型**: `boolean`
- **默认值**: `true`
- **用法**:

    设置是否默认生成`pending`与`error`等数据。

    ```js
    VuexSugar().getStore({
        courseState: false, // 不自动生成pending与error数据
        createStateFn: true// 返回的state为函数形式
    })
    ```

    返回的store 为:

    ```js
    {
        namespaced: false,
        state: function(){
            return {
                posts: [],
                post: null
            };
        }
        ...
    }
    ```

#### `# successSuffix`

- **类型**: `String`
- **默认值**: `SUCCEEDED`
- **用法**:

    ```js
    VuexSugar().getStore({
        successSuffix: 'REQUEST_OK'
    })
    ```

    设置`mutations type`的后缀。请求成功时，将于`actionName`一起作为`mutation`的type。这在手动触发`mutation`时，很有用。

#### `# errorSuffix`

- **类型**: `String`
- **默认值**: `FAILED`
- **用法**:

    设置`mutations type`的后缀。请求失败时，将于`actionName`一起作为`mutation`的type。同`successSuffix`。


### <a id="dispatch-options">action提交参数</a>

- **类型**: `{ [params: Object], [data: Object], [meta: OBject], [after: Funtion], [before: Funciton], [resolved:String|Object|Function|Array], [rejected:String|Object|Function|Array], [...any] }`
- **用法**

    ```js
    this.updatePost({
        resolved: () => this.btnEnable = true, // 执行成功按钮恢复可点击
        rejected: () => this.btnEnable = false, // 执行过程中按钮不可点击
        meta: { id : 123 }
    });
    ```
    提交`action`时，可以指定请求参数，或者传入来自页面的元数据，或者页面组件的回调等内容。

    这里可以传入`after`、`before`钩子函数，分别在请求发起之前与请求发起之后调用。函数签名为`(error, data: any)`

    其中第一个参数为`error`对象，第二个在`after`中是请求的返回结果。注意：这里请求成功或者失败都会被调用。

    注意`after`区别于`resolved`与`rejected`，虽然他们都能完成绝大部分相同的工作。但是`after`不管成功或失败都会调用，`resolved`与`rejected`只有在确定成功或失败才会分别调用。

    添加`after`、`before`钩子函数的好处在于，可以在请求开始前后做一些额外的操作，比如：更改页面的状态。

### <a id="global-methods">全局方法</a>

#### `# creatStore`

- **函数签名**: `(VuexSugar, options: Object): store`
- **用法**

    ```js
    import VuexSugar, { createStore } from 'vuex-sugar';

    const store = VuexSugar();
    createStore(store, {  createStateFn: true });
    ```

    `VuexSugar`实例的`getStore`调用了该方法，从`VuexSugar`实例创建一个store对象。

#### `# mergeStore`

- **函数签名**: `(store, [store]): store`
- **用法**

    ```js
    import VuexSugar, { mergeStore } from 'vuex-sugar';

    const store = VuexSugar().getStore();
    mergeStore(store, { state:{}, mutations:{}, getters:{}, actions:{} });
    ```
    允许混入其他自定义的store。

## <a id="dev">开发步骤</a>

``` bash
# install dependencies
yarn

# build for production with minification
yarn run build

# run eslint and fix code
npm run lint

# run all tests
yarn run test

```

## <a id="changelog">修改历史</a>

see [CHANGELOG.md](CHANGELOG.md)

## <a id="thanks">致谢</a>

thanks for ...

For a detailed explanation on how things work, contact us <www.389055604@qq.com>.
