# 介绍

一个帮助简化使用 Vuex 发起 HTTP(REST API)请求的工具。支持 [Vuex 2](https://vuex.vuejs.org/zh/)，默认使用流行的 HTTP 客户端[axios](https://github.com/mzabriskie/axios)发起请求。

`vuex-sugar`是一个旨在使应用程序副作用（即数据获取等异步事件和访问浏览器缓存等不正确的事物）更易于管理，执行效率更高的库，功能强大且完全可自定义。

如果你打算发起通过`vuex`来发起一个HTTP API（尤其是REST API）请求，你会发现这需要几个重复的步骤。你需要编写一个`action`来发起请求，然后编写一个`mutation`来改变`state`。或者你想要在一些地方集中处理请求，或者执行一些回调。本库能够帮助你生成一个store，你只需按照简单的形式设置，它就会自动帮你生成 state、mutations、actions，然后自动处理请求并改变 state。

`vuex-sugar`并不是一个 Vuex plugin，仅仅只是一个帮助简化生成 Store 对象的工具，你可以对你任何不满意的地方进行重写。

本库的灵感来自于[redux-saga](https://github.com/redux-saga/redux-saga) 和 [vuex-rest-api](https://github.com/christianmalek/vuex-rest-api)。
