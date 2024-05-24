
# GuyTest

Unit Tests for NodeJS and the Browser


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [GuyTest](#guytest)
  - [API](#api)
  - [To Do](#to-do)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


# GuyTest

* a 'test' is a function with...
* ... any number of 'checks';
* each 'check' consists of an 'assumption', a named 'probing' function, and a matcher (which in some cases
  can be optional)
* 'assumptions' are
  * `@eq()` (assumption of synchronous equality)
  * `@throws()` (assumption of synchronous failure)
  * `@async_eq()` (assumption of asynchronous equality)
  * `@async_throws()` (assumption of asynchronous failure)
* test functions will called in the context of the `Test` instance to make the assumption methods available
  as properties of `@`/`this`

## API

* **`Test::test: ( tests... ) ->`**: Perform tests, return statistics including total counts and per-test
  counts

<!--
## Browserify

```bash
browserify --require intertype --debug -o public/browserified/intertype.js
```
 -->

## To Do

* **[–]** docs
* **[–]** consider to move equality testing so its use doesn't depend on `Test` instance
* **[–]** custom error classes
* **[–]** provide stats per module, per method and totals
* **[–]** include message with each fail

<!-- ## Is Done -->

<!-- * **[+]** ### -->
