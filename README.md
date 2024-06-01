
# GuyTest

Unit Tests for NodeJS and the Browser


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [GuyTest](#guytest)
  - [██████████████](#%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88)
  - [Suggested Organization of Tests](#suggested-organization-of-tests)
  - [Public API](#public-api)
  - [Results and Stats](#results-and-stats)
  - [Proper Usage of Async Testing Methods](#proper-usage-of-async-testing-methods)
  - [Notes on Private API](#notes-on-private-api)
  - [To Do](#to-do)
  - [Is Done](#is-done)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


# GuyTest

## ██████████████

* a 'test' is a single run of one or more 'tasks'
* a 'task' is a named function with any number of named 'checks'
* each 'check' consists of an 'assumption', a named 'probing' function, and a number of matchers (depending
  on what the assumption method allows)
  * example:

    ```coffee
    my_task = ->
      @eq ( my_check_1 = -> FOO.multiply 2, 2 ), 4
      @eq ( my_check_2 = -> FOO.multiply 3, 9 ), 27
      ^^^            ^^^^^^^^^                   ^^
   assumption          check                   matcher
    ```

  * a probing function used in an `Test::eq()`uality assumption (or its asynchronous version,
    `Test::async_eq()`) should return a value or throw an error; a `pass` is counted if the return value
    equals the matcher; if the return value doesn't equal the matcher or an error is thrown, the check is
    considered a failure

  * a probing function used in an `Test::throws()` assumption (or its asynchronous version,
    `Test::async_throws()`) should throw an error; if no matcher is given, any exception thrown is regarded
    a success; otherwise, a `pass` is counted if the error either equals the matcher (if it is a string) or
    satisfies the regular expression, a `fail` is recorded if the probing function didn't throw an error or
    threw one that doesn't satisfy the matcher

* Assumptions (assumption methods) are
  * **`@eq:           ( check, matcher ) ->`**: (assumption of synchronous equality)
  * **`@throws:       ( check, matcher ) ->`**: (assumption of synchronous failure)
  * **`@async_eq:     ( check, matcher ) ->`**: (assumption of asynchronous equality)
  * **`@async_throws: ( check, matcher ) ->`**: (assumption of asynchronous failure)

* In addition, there's
  * **`@pass: ( ref, message )`**: to record a pass, and
  * **`@fail: ( ref, message )`**: to record a failure that may result from 'free-form' tests


* task and probing functions will called in the context of the `Test` instance to make the assumption
  methods available as properties of `@`/`this`

## Suggested Organization of Tests

* use simple objects whose properties are tasks
* properties can also recursively be objects with tasks, this allows for hierarchical structure that will be
  reflected in the names of tasks and checks in the result display
* start test by passing in your task objects, preferrably by wrapping the (outermost) task objects in an
  ad-hoc objects so you get meaningful names:

  ```coffee
  taskgroup_A =
    test_1: -> ...
    better_use_meaningful_names: ->
      @eq ( t__20 = -> my_math_lib.mul 3, 4 ), 12
      @eq ( t__21 = -> my_math_lib.add 3, 4 ), 7
    subgroup:
      foo: -> ...
      bar: -> ...

  taskgroup_B = ...

  ( new Test() ).test { taskgroup_A, taskgroup_B, }

  # or, as the case may be:

  await ( new Test() ).async_test { taskgroup_A, taskgroup_B, }
  ```

  The report will then show, among other things:

  ```
  —————————————————————————————————————————————————————————————————
                          🙤 GUY TEST 🙦
  —————————————————————————————————————————————————————————————————
  ...
  taskgroup_A.better_use_meaningful_names.t__20 { passes: 1, fails: 0 }
  taskgroup_A.better_use_meaningful_names.t__21 { passes: 1, fails: 0 }
  ...
  —————————————————————————————————————————————————————————————————
  *                    { passes: 298, fails: 2 }
  —————————————————————————————————————————————————————————————————
  ```



## Public API

* **`Test::test: ( tests... ) ->`**: Perform tests, return statistics including total counts and per-test
  counts

## Results and Stats

* for each check: count
  * how often it has been called (redundant, is sum of all passes and fails)
  * how many passes and fails occurred with this check
* for each task: count
  * how often it has been called (redundant, is sum of all passes and fails)
  * how many passes and fails occurred with this task
* for each test: count
  * how many passes and fails occurred

## Proper Usage of Async Testing Methods

```coffee
af1 = ->       after 0.1, ->       throw new Error 'oops' ### not OK ###
af2 = -> await after 0.1, ->       throw new Error 'oops' ### not OK ###
af3 = ->       after 0.1, -> await throw new Error 'oops' ### OK ###
af4 = -> await after 0.1, -> await throw new Error 'oops' ### OK ###
# debug 'Ω_101', validate.asyncfunction af
f1 = ->
  try
    result = await af2()
  catch error
    warn error.message
  help result
await f1()
```

## Notes on Private API

* **`Test::_on_task_not_called: ( ............... ) ->`**: Called when a task could not be run (e.g. because
  it was an async function when sync `Test::test()` was used, or because it was not a function or an object
  with properties)
* **`Test::_on_eq_passed: ( ............... ) ->`**: Called when `Test::eq()` or `Test::async_eq()` found
  that result equals matcher
* **`Test::_on_eq_failed: ( ............... ) ->`**: Called when `Test::eq()` or `Test::async_eq()` found
  that result doesn't equal matcher
* **`Test::_on_throws_passed: ( ............... ) ->`**: Called when `Test::throws()` or
  `Test::async_throws()` found that calling the check method did result in an error
* **`Test::_on_throws_didnt_throw: ( ............... ) ->`**:
* **`Test::_on_throws_mismatch: ( ............... ) ->`**:

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
* **[–]** use proper namespacing for types
* **[–]** make sure ref is available in warnings at least when iterating over object properties
* **[–]** confirm that running `Test::test()` and / or `Test::async_test()` repeatedly on same instance sums
  up all stats, introduce counter to count the times one of these methods is called; what about using only
  assumptions such as `test.eq()` on their own outside of a call to `Test::test()` and / or
  `Test::async_test()`?
* **[–]** rename `Test` class to something more meaningful(?)
* **[–]** rename parameter `f` in assumption methods to `check`
* **[–]** allow to pass in multiple matchers to `Test::throws()`, `Test::async_throws()` so we can check
  both class and error message
* **[–]** implement equality for `Map`s
* **[–]** methods `Types::pass()`, `Types::fail()` whould take three arguments `ref`, `cat` and `message`;
  there could be an additional method `Types::fail_eq()` to display two lines with first cat `result` or
  `error`, second cat with `doesn't match`
* **[–]** implement instance-level and check-level configuration:
  * `auto_reset: false,`
  * `show_report: true,`
  * `show_results: true,`
  * `show_fails: true,`
  * `show_passes: true,`
  * `throw_errors: false,`
* **[–]** check that three-argument style calling is used everywhere for `Test::pass()` and `Test::fail()`,
  including in tests, docs
* **[–]** use call to `Tests::_warn()` to also display warning when so configured
* **[–]** introduce methods to also display ongoing messages when so configured
* **[–]** use wrapping methods to set and reset task ref as state to consolidate internal formation of
  compound refs
* **[–]** standardize `cat`s, choose better name
* **[–]** replace `Tests::_test_ref` as it won't work in async tests
* **[–]** modify behavior of assumptions (`eq()`, `throws()`, `async_eq()`, `async_throws()`, `pass()`,
  `fail()`):
  <!-- * **[–]** when a function is passed in, it will be called in the context of an 'assumptor' -->
* **[–]** rename either `@_upref` or `upref`


## Is Done

* **[+]** <del>should an `asyncfunction` be required for check functions used with `async_eq()`,
  `async_throws()`?</del> <ins>doesn't work, cf. tests where timeout (`after()`) is used</ins>
* **[+]** include message with each fail
* **[+]** call check methods with single argument `@`/`this` (conventional parameter `t` or `me`) so as to
  allow bound check methods; also convenient for JavaScript where there are only fat-arrow functions
* **[+]** standardize handling and display of compound refs (using dot notation or slashes)
* **[+]** <del>implement a `Test::clear()` method to reset stats?</del>
* **[+]** use `_record_failure()` &c instead of `_increment_fails()` to do all the associated tasks in one
  step
  * **[+]** get rid of `level` kludge in `_increment()`, preferrably by using more specialized methods
* **[+]** list all the steps to be taken by `_record_failure()` and related methods, arguments needed
* **[+]** remove `? {}` in `create.gt_report_cfg cfg ? {}` in `_report()` after bug fixed in InterType
* **[+]** consolidate calls to `Test::_increment_fails()`, `warn()`, `Test::_warn()` into single call
* **[+]** avoid `null` as ref for test
* **[+]** use 'task' as a better synonym for the ubiquitous 'test'
* **[+]** restructure use of `t2` in tests to run inside of named functions
* **[+]** can tasks be nested? Does it make sense to have one task call one or more other tasks?
