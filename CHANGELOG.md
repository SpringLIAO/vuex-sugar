# Change Log

All notable changes to this project will be documented in this file.

<a name="0.1.1"></a>
## 0.1.2 (2019-01-14) 

### Bugs

* fix `requestConfig` option not apply into axios.
* fix shorthand method (eg: delete、post) or `method` option for `add` did not apply into axios.

<a name="0.1.1"></a>
## 0.1.1 (2018-10-22) 

### Features

* add global method `setGlobal`
* add action option `before`、`after`
* plain action would exec `before`、`after` hooks
* plain action would exec `resolved`、`rejected` hooks
* plain action (not set property) would exec `successhandler`
* add `action context` as `before`、`after`  3th arguments

### Bugs

* fix `resolved`、`rejected` hooks

<a name="0.1.0"></a>
## 0.1.0 (2018-08-17) 

### Features

* initial code
