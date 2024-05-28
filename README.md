
# GuyTest

Unit Tests for NodeJS and the Browser


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [GuyTest](#guytest)
  - [Public API](#public-api)
  - [Results and Stats](#results-and-stats)
  - [Notes on Private API](#notes-on-private-api)
  - [To Do](#to-do)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


# GuyTest

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


* task functions will called in the context of the `Test` instance to make the assumption methods available
  as properties of `@`/`this`

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
* **[–]** include message with each fail
* **[–]** use proper namespacing for types
* **[–]** remove `? {}` in `create.gt_report_cfg cfg ? {}` in `_report()` after bug fixed in InterType
* **[–]** consolidate calls to `Test::_increment_fails()`, `warn()`, `Test::_warn()` into single call
* **[–]** make sure ref is available in warnings at least when iterating over object properties
* **[–]** avoid `null` as ref for test
* **[–]** use 'task' as a better synonym for the ubiquitous 'test'
* **[–]** restructure use of `t2` in tests to run inside of named functions
* **[–]** use `_record_failure()` &c instead of `_increment_fails()` to do all the associated tasks in one
  step
  * **[–]** get rid of `level` kludge in `_increment()`, preferrably by using more specialized methods
* **[–]** list all the steps to be taken by `_record_failure()` and related methods, arguments needed
* **[–]** confirm that running `Test::test()` and / or `Test::async_test()` repeatedly on same instance sums
  up all stats, introduce counter to count the times one of these methods is called; what about using only
  assumptions such as `test.eq()` on their own outside of a call to `Test::test()` and / or
  `Test::async_test()`?
* **[–]** <del>implement a `Test::clear()` method to reset stats?</del>
* **[–]** rename `Test` class to something more meaningful(?)
* **[–]** rename parameter `f` in assumption methods to `check`
* **[–]** allow to pass in multiple matchers to `Test::throws()`, `Test::async_throws()` so we can check
  both class and error message
* **[–]** implement equality for `Map`s
* **[–]** methods `Types::pass()`, `Types::fail()` whould take three arguments `ref`, `cat` and `message`;
  there could be an additional method `Types::fail_eq()` to display two lines with first cat `result` or
  `error`, second cat with `doesn't match`
* **[–]** can tasks be nested? Does it make sense to have one task call one or more other tasks?
* **[–]** implement instance-level and check-level configuration:
  * `auto_reset: false,`
  * `show_report: true,`
  * `show_results: true,`
  * `show_fails: true,`
  * `show_passes: true,`
  * `throw_errors: false,`
* **[–]** check tha three-argument style calling is used everywhere for `Test::pass()` and `Test::fail()`,
  including in tests, docs
* **[–]** use call to `Tests::_warn()` to also display warning when so configured
* **[–]** introduce methods to also display ongoing messages when so configured
* **[–]** standardize handling and display of compound refs (using dot notation or slashes)
* **[–]** use wrapping methods to set and reset task ref as state to consolidate internal formation of
  compound refs

<!-- ## Is Done -->

<!-- * **[+]** ### -->
