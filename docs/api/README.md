---
sidebarDepth: 2
---
# API参考

## 构造函数

### VuexSugar

-   **函数签名**: `constructor(options:Object):VuexSugar`
-   **用法**:

    ```js
    const VuexSugar = VuexSugar({ baseURL: '' });

    // 等效
    const VuexSugar = new VuexSugar({ baseURL: '' });
    ```

    `VuexSugar`方法内部会隐式的使用`new`创建一个对象。可以传入一个[实例选项对象](#vuexsugar-实例选项)。

## VuexSugar 实例选项

实例选项对象在初始化`VuexSugar`实例时传入。

### axios

-   **类型**: `axios` (instance)
-   **默认值**: `axios` (instance)
-   **用法**:

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

    `axios`可以是任何有效的`axios`实例。可以自定义`axios`实例，或者其他能够返回 Promise 的 Http 请求工具。默认使用`axios`。

### baseUrl

-   **类型**: `string`
-   **用法**:

    ```
    VuexSugar({
        baseURL: '/v1/client'
    })
    ```

    `baseURL`将传入`axios`实例。除了实例选项可以设置`baseURL`，[action 选项](#action-选项)的`requestConfig`参数也可以指定请求的`baseURL`。

    如果这两个地方都没有设置，将使用`axios`默认的`baseURL`。优先权：`request config base URL > baseURL > axios instance base URL`

### namespaced

-   **类型**: `boolean`
-   **默认值**: `false`
-   **用法**:

    ```
    VuexSugar({
        namespaced: true
    })
    ```

    指定该实例下的`store`是否具有命名空间，与 Vuex `namespaced`意义相同。

### validateResponse

-   **类型**: `function`
-   **函数签名**: `validateResponse(res: Response): boolean`
-   **默认值**:
    ```js
    function validateResponse(res) {
        if (!res) return false;
        const { status, data } = res;
        const isServerOk = !data || (data.code ? parseInt(data.code, 10) === 200 : true);
        return status === 200 && isServerOk;
    }
    ```
-   **详细**: `vuex-sugar`假定服务端 REST API 返回的结果形式如下：
    ```js
    {
        code: number,
        data: any,
        msg: string
    }
    ```
    其中`code`与 HTTP `status`意义相同，`data`为实际返回的结果，`msg`为额外的信息。REST 采用此设计，主要在于服务端能够返回更多信息给前端，方便前端灵活处理。如果你的项目中，采用其他的结构，可以重写`validateResponse`以便决定请求成功或者失败。
-   **用法**:

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

### meta

-   **类型**: `object`
-   **用法**:

    ```
    VuexSugar({
        meta: { username: 'test' }
    })
    ```

    添加实例元数据，函数类型的`headers`与`path`能够访问它，被该实例的所有`action`共享。将与[action 选项](#action-选项)的`meta`、[action 提交参数](#action-提交参数)中的`meta`进行合并。

### resolved

-   **类型**: `String|Object|Function|Array`
-   **用法**:

    ```js
    const posts = VuexSugar({
        baseURL: '/v1/client',
        state: { posts: [] },
        // 该实例每个action均会在请求成功时执行全局的message action。root参数表示该action为全局action。
        resolved: { action: 'message', root: true }
    });
    ```

    设置实例的`resolved`，用于设置请求成功的回调，被该实例的所有`action`共享，最终会被合并到`action`中。

    -   `String` 类型：表示回调执行一个`action`。该`action`只能是本实例`store`的`action`。如果需要向全局提交`action`，或者为`action`传递参数，则使用对象形式。

    -   `Object` 类型：用于回调执行`action`。格式同[action 提交参数](#action-提交参数):

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

    -   `Function` 类型：回调执行函数。函数参数为`(Response, rest)`。`response`为请求返回结果，`rest`为`action`提交时除提交参数以外的数据。

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

    -   `Array` 类型：可包含以上任一类型，甚至嵌套的数组。

### rejected

-   **类型**: `String|Object|Function|Array`
-   **用法**:

    与`resolved`相同，用于设置请求失败的回调。

### state

-   **类型**: `Object|Function`
-   **默认值**: `{}`
-   **用法**:

    ```js
    const posts = VuexSugar({
        baseURL: '/v1/client',
        state: { posts: [] }
    });
    ```

    设置 store 的默认`state`，`state`应该与`action`中的`property`对应。如果没有指定默认的`state`，则默认为`null`。

    如果`state`为函数形式，则在实例初始化时被执行。函数应该返回一个纯对象。

    ```js
    const posts = VuexSugar({
        baseURL: '/v1/client',
        state: () => {
            return { posts: [] };
        } // 返回纯对象
    });
    ```

    注意：该函数并不是最终生成的`state`，如果需要最终生成的`state`为函数，请在[store选项](#store-选项)中指定。

    当请求成功时，将自动更新`property`对应的`state`。

## VuexSugar 实例方法

调用实例方法添加`action`，并生成`store`。

### add

-   **函数签名**: `(options: Object): VuexSugar`
-   **用法**:

    ```js
    add({
        action: 'listPosts',
        property: 'posts',
        path: '/posts',
        method: 'get'
    });
    ```

    在`VuexSugar`实例上添加一个`action`，返回该实例。添加`action`并不是真正的`Vuex action`，这里只是添加了`Vuex action`的定义。可以通过[选项对象](#action-options)设置`action`。

    选项对象中`action`为必须字段。更多选项，请参考[action 选项](#action-options)。

### get

-   **函数签名**: `(options: Object): VuexSugar`
-   **用法**:

    ```js
    get({
        action: 'listPosts',
        property: 'posts',
        path: '/posts'
    });
    // 等同于
    add({
        action: 'listPosts',
        property: 'posts',
        path: '/posts',
        method: 'get'
    });
    ```

    `add`方法的别名，`get`请求的快捷方法。

### delete

-   **函数签名**: `(options: Object): VuexSugar`
-   **用法**:

    `add`方法的别名，`delete`请求的快捷方法。

### head

-   **函数签名**: `(options: Object): VuexSugar`
-   **用法**:

    `add`方法的别名，`head`请求的快捷方法。

### options

-   **函数签名**: `(options: Object): VuexSugar`
-   **用法**:

    `add`方法的别名，`options`请求的快捷方法。

### post

-   **函数签名**: `(options: Object): VuexSugar`
-   **用法**:

    `add`方法的别名，`post`请求的快捷方法。

### put

-   **函数签名**: `(options: Object): VuexSugar`
-   **用法**:

    `add`方法的别名，`put`请求的快捷方法。

### patch

-   **函数签名**: `(options: Object): VuexSugar`
-   **用法**:

    `add`方法的别名，`patch`请求的快捷方法。

### getStore

-   **函数签名**: `(options: Object): Store`
-   **用法**:

    ```js
    VuexSugar().getStore({
        courseState: true, // 自动生成pending与error数据
        createStateFn: true // 返回的state为函数形式
    });
    ```

    可以传入[store选项参数](#store-选项)，用于生成 Vuex store 对象。

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

## action 选项

定义`action`属性。

### action

-   **类型**: `String`
-   **用法**:

    ```js
    get({
        action: 'listPosts',
        property: 'posts',
        path: '/posts'
    });
    ```

    指定`action`的 name，可通过 Vuex store 的`dispatch`进行提交。

    ```js
    // direct via store
    this.$store.dispatch('listPosts', { params: {}, data: {} });

    // or with mapActions
    this.listPosts({ params: {}, data: {} });
    ```

### property

-   **类型**: `String`
-   **用法**:

    ```js
    get({
        action: 'listPosts',
        property: 'posts',
        path: '/posts'
    });
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

    当不需要`state`存储数据，例如某些全局提交，或者普通的`action`，则可省略`property`，这很有必要。

### path

-   **类型**: `String|Function`
-   **用法**:

    Api 请求的路径，如果`path`为相对路径，则会自动使用`baseURL`作为前缀。

    如果`path`为函数，则可使用`meta`元数据，`path`在发起请求前会自动执行。`path`应该返回字符串路径。

    详细使用方法参考[在 headers 和 path 中使用参数](/guide/tutorial.html#在header和path中使用参数)。

### headers

-   **类型**: `Object|Function`
-   **用法**:

    Api 请求头部，该选项的值将与[requestConfig](#requestconfig)属性中的`headers`合并。

    ```js
    get({
        action: 'getPost', // action name
        property: 'post', // state property name
        headers: { userName: 'test' }
    });
    ```

    如果`headers`为函数，则可使用`meta`元数据，`headers`在发起请求前会自动执行。`headers`应该返回对象数据。

    详细使用方法参考[在 headers 和 path 中使用参数](/guide/tutorial.html#在header和path中使用参数)

### method

-   **类型**: `String`
-   **用法**:

    Http 请求的`method`字段。允许的值为：`['get', 'delete', 'head', 'options', 'post', 'put', 'patch']`。

    当使用[HTTP快捷方法](/guide/tutorial.html#http-快捷方法)时，不需要指定该字段。

### requestConfig

-   **类型**: `Object`
-   **用法**:

    `Axios`的请求选项参数。该选项中指定的属性具有最高优先权（`params`、`data`除外）。

### meta

-   **类型**: `object`
-   **用法**:

    添加`action`元数据，将与[action 选项](#action-选项)的`meta`、[action 提交参数](#action-提交参数)中的`meta`进行合并。

### resolved

-   **类型**: `String|Object|Funtion|Array`
-   **用法**:

    设置当前`action`的`resolved`，用于设置请求成功的回调。将与[action 选项](#action-选项)的`resolved`、[action 提交参数](#action-提交参数)中的`resolved`进行合并。

### rejected

-   **类型**: `String|Object|Funtion|Array`
-   **用法**:

    与`resolved`相同，用于设置请求失败的回调。

### successHandler

-   **类型**: `Function`
-   **参数**: `(state, { data, other })`
-   **用法**:

    用于设置请求成功时，覆盖默认的改变`state`的行为。见[自定义请求处理方法](/guide/tutorial.html#自定义请求处理方法)。

    第二个参数包含了接口的返回结果。如果在[action提交参数](#action-提交参数)中，添加了其他额外数据，也会被合并传入进来。

### errorHandler

-   **类型**: `Function`
-   **参数**: `(state, payload)`
-   **用法**:


    第二个参数为错误信息。

### before

-   **类型**: `Function`
-   **参数**: `(error, data: any, context: { dispatch, commit, state, rootState })` 第三个参数为`Vuex action`参数
-   **用法**:

    在 `action` 执行（发起请求）之前执行钩子函数。注意：普通 `action` 也会执行 `before` 钩子函数。

    ```js
    get({
        action: 'getPost', // action name
        property: 'post', // state property name
        headers: { userName: 'test' },
        before: (undefined, undefined, { dispatch }) => dispatch('action name', {})
    )
    ```

    在`action`执行之前还没有任何数据参数，因此第二个参数始终为空，与`node`接口保持一致。

### after

-   **类型**: `Function`
-   **参数**: `(error, data: any, context: { dispatch, commit, state, rootState })` 第三个参数为`Vuex action`的第一个参数

    在 action 执行（发起请求）之后执行钩子函数。用法同`before`一致。

    第一个参数为错误对象，第二个参数为请求结果。普通 `action` 的前两个参数都为空。

## store 选项

控制生成的`store`的结构。

### createStateFn

-   **类型**: `boolean`
-   **默认值**: `false`
-   **用法**:

    设置返回的`state`是否为函数形式。

    ```js
    VuexSugar().getStore({
        courseState: true, // 自动生成pending与error数据
        createStateFn: true // 返回的state为函数形式
    });
    ```

    返回的 store 为:

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

### courseState

-   **类型**: `boolean`
-   **默认值**: `true`
-   **用法**:

    设置是否默认生成`pending`与`error`等数据。

    ```js
    VuexSugar().getStore({
        courseState: false, // 不自动生成pending与error数据
        createStateFn: true // 返回的state为函数形式
    });
    ```

    返回的 store 为:

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

### successSuffix

-   **类型**: `String`
-   **默认值**: `SUCCEEDED`
-   **用法**:

    ```js
    VuexSugar().getStore({
        successSuffix: 'REQUEST_OK'
    });
    ```

    设置`mutations type`的后缀。请求成功时，将与[action name](#action)一起作为`mutation`的 type。这在手动触发`mutation`时，很有用。

### errorSuffix

-   **类型**: `String`
-   **默认值**: `FAILED`
-   **用法**:

    设置`mutations type`的后缀。请求失败时，将与[action name](#action)一起作为`mutation`的 type。同`successSuffix`。

## action 提交参数

dispatch action时可以附带一些提交参数。

-   **类型**: `{ [params: Object], [data: Object], [meta: OBject], [after: Funtion], [before: Funciton], [resolved:String|Object|Function|Array], [rejected:String|Object|Function|Array], [...any] }`
-   **用法**

    ```js
    this.updatePost({
        resolved: () => (this.btnEnable = true), // 执行成功按钮恢复可点击
        rejected: () => (this.btnEnable = false), // 执行过程中按钮不可点击
        meta: { id: 123 }
    });
    ```

    提交`action`时，可以指定请求参数，或者传入来自页面的元数据，或者页面组件的回调等内容。

    这里可以传入`after`、`before`钩子函数，分别在请求发起之前与请求发起之后调用。函数签名为`(error, data: any, context: { dispatch, commit, state, rootState })`。

    其中第一个参数为`error`对象，第二个在`after`中是请求的返回结果。注意：这里请求成功或者失败都会被调用，同[action选项before与after](#before)。

    注意`after`区别于`resolved`与`rejected`，虽然他们都能完成绝大部分相同的工作。但是`after`不管成功或失败都会调用，`resolved`与`rejected`只有在确定成功或失败才会分别调用。

    添加`after`、`before`钩子函数的好处在于，可以在请求开始前后做一些额外的操作，比如：更改页面的状态。

    ```js
    {
        params, // 请求参数对象，将被传入axios
        data, // 提交的数据队形，将被传入axios
        meta, // 提交的元数据，会被action的header或者path函数使用
        after, // action的前置钩子函数
        before, // action的后置钩子函数，注意：普通action也会执行before与after
        resolved, // 请求成功的回调，详细使用方式将`Vuex实例选项`
        rejected, // 请求失败的回调，实际上：普通action也会执行resolved与rejected
        ...other // 提交action时，传递的额外数据。这些数据会传入successHandler，或者传入resolved（rejected）中规定的下一个action
    }
    ```

## 全局属性

`Vuex-Sugar`拥有一些全局属性，他们会被每个`Vuex-Sugar`实例使用。

全局属性对象`VuexSugar.defaults`：

```js
{
    baseURL,
    axios,
    namespaced,
    validateResponse,
    meta, // 全局元数据，将与action定义、action提交参数进行合并。{ ...GlobalDefaults.meta, ...ActionOptions.meta, ...ActionPayload.meta }
    resolved, // 全局回调，将与action定义、action提交参数进行合并。[ ...GlobalDefaults.resolved, ...ActionOptions.resolved, ...ActionPayload.resolved ]
    rejected; // 全局回调，将与action定义、action提交参数进行合并。[ ...GlobalDefaults.rejected, ...ActionOptions.rejected, ...ActionPayload.rejected ]
}
```

可以使用全局方法`setGlobal`设置[全局属性](/guide/tutorial.html#使用回调)，默认全局属性为空。

## 全局方法

`Vuex-Sugar`导出了一些辅助方法，便于使用`Store`。

### creatStore

-   **函数签名**: `(VuexSugar, options: Object): store`
-   **用法**

    ```js
    import VuexSugar, { createStore } from 'vuex-sugar';

    const store = VuexSugar();
    createStore(store, { createStateFn: true });
    ```

    `VuexSugar`实例的[getStore](#getstore)调用了该方法，根据`VuexSugar`实例创建一个 [Store对象](/guide/quick-start.html#store对象的结构)。

### mergeStore

-   **函数签名**: `(store, [store]): store`
-   **用法**

    ```js
    import VuexSugar, { mergeStore } from 'vuex-sugar';

    const store = VuexSugar().getStore();
    mergeStore(store, { state: {}, mutations: {}, getters: {}, actions: {} });
    ```

    允许混入其他自定义的 store。

### setGlobal

-   **函数签名**: `(defaultOptions): VuexSugar`
-   **用法**

    ```js
    import VuexSugar, { mergeStore, setGlobal } from 'vuex-sugar';

    // 设置全局属性
    setGlobal({ baseURL, axios });
    // or 也可以这样设置
    VuexSugar.setGlobal({ baseURL, axios });
    ```

    允许设置全局属性，每个`VuexSugar`实例都会拥有这些属性。这里设置的属性会根据其属性类型，与`action选项`或者`action提交参数`进行合并，或被覆盖。
