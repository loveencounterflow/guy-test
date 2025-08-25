
# GuyTest

Unit Tests for NodeJS and the Browser


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [GuyTest](#guytest)
  - [██████████████](#%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88%E2%96%88)
  - [Suggested Organization of Tests](#suggested-organization-of-tests)
  - [Public API](#public-api)
    - [Test Configuration](#test-configuration)
    - [Running Tests](#running-tests)
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

### Test Configuration

**NOTE** some of the below settings are not yet implemented

* **`new Test: ( cfg ) ->`**: Perform tests, return statistics including total counts and per-test

* **`auto_reset`**     (`false`): whether stats should be reset to zero whenever the `Test::test()` and
  `Test::async_test()` methods is called
* **`show_report`**    (`true`): whether to show totals when the `Test::test()` and `Test::async_test()`
  methods terminates
* **`report_checks`**  (`true`): whether to show an individual line for each check in the report even when
  the check was successful
* **`show_results`**   (`true`): whether the outcome of each check should be printed to the terminal as soon
  as it concludes
* **`show_fails`**     (`true`): whether failed checks should be printed to the terminal
* **`show_passes`**    (`true`): whether passed checks should be printed to the terminal
* **`throw_on_error`** (`false`): whether an exception that is thrown from a check should cause the
  `Test::test()` and `Test::async_test()` methods to throw that error; if set to `false`, such errors will
  be caught and reported as `fail`s
* **`throw_on_fail`**  (`false`): whether a `fail`ed assumption should cause the `Test::test()` and
  `Test::async_test()` methods to throw an exception
* **`message_width`**  (`300`): length limit on reported messages
* **`prefix`**         (`''`): string to prefix each reported line with

The settings below can also be used as third argument to the module-level `equals()` method:

* **`ordered_objects`**  (`false`): whether to consider two objects as equal even when their epynomous
  properties are not in the same order
* **`ordered_sets`**     (`false`): whether to consider two sets as equal even when their epynomous elements
  are not in the same order
* **`ordered_maps`**     (`false`): whether to consider two maps as equal even when their epynomous key /
  value pairs are not in the same order
* **`signed_zero`**      (`false`): whether `+0` and `-0` should be considered equal


### Running Tests

* **`Test::test: ( tests... ) ->`**: Perform tests, return statistics including total counts and per-test
  counts. Only synchronous tasks and checks will be run; when asynchronous tasks or checks are encountered,
  they will cause a `fail`

* **`await Test::async_test: ( tests... ) ->`**: Perform asynchronous and synchronous tests

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
  * `report_checks: true,`
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
* **[–]** provide a simple, configurable way to run all tests in a given location, matching a glob &c so it
  becomes easy to provide the code for a `test-all` module
* **[–]** provide a directory/project with aliased versions of projects to allow for testing of past
  versions; provide API to do that; PNPM CLI for this is `pnpm add
  ${my-name}@npm:${registered-name}@${version}`, e.g. `pnpm add foo-3.2.1@npm:foo@3.2.1`
* **[–]** use `dbay` to store results, calculate totals
* **[–]** provide hierarchical totals for each level
* **[–]** before calling a check function, print the current ref to the terminal; erase that line only when
  terminated without error and replace with success message

  ```bash
  print("\u1b[1F")
  #Moves cursor to beginning of the line n (default 1) lines up
  print(str)   #prints the new line
  print("\u1b[0K")
  # clears  part of the line.
  #If n is 0 (or missing), clear from cursor to the end of the line.
  #If n is 1, clear from cursor to beginning of the line.
  #If n is 2, clear entire line.
  #Cursor position does not change.
  ```

  * see https://discourse.julialang.org/t/how-clear-the-printed-content-in-terminal-and-print-to-the-same-line/19549/3
  * see https://stackoverflow.com/questions/1508490/erase-the-current-printed-console-line
  * see https://www.reddit.com/r/C_Programming/comments/502xun/how_do_i_clear_a_line_on_console_in_c/
  * see https://superuser.com/questions/1230544/is-there-any-way-to-clear-specific-number-of-lines-in-a-terminal

* **[–]** implement the ability to 'couple' a `Test` instance to another one such that past and future test
  results are transferred upstream; this will allow to perform different tests with different configurations
  and see all results in one summary nonetheless
* **[–]** implement benchmarking for Hengist-NG
* **[–]** implement remaining settings for `Test` CFG
* **[–]** implement possibility to run preparation and finalization tasks by defining specially names
  methods on test objects like `before_each_test()`, `after_each_test()`
* **[–]** implement a way to 'accept' particular checks when they fail to indicate that these are known bugs
  that are pending resolution in future releases
* **[–]** fix failing `@eq ( Ω__1 = -> { set: new Set(), } ), { set: new Set(), }`
* **[–]** return `true`, `false` from `@eq()`, `@throws()` indicating success or failure
  * **[–]** accept up to two results in `@eq()`, `@throws()`, one of which must be a wrapped `( @expect
    [$name1]: $boolean, [$name2]: $boolean, ..., )` to indicate preconditions for a test; all preconditions
    must evaluate to `true` or else the test is not run and fails


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
* **[+]** implement configuration to enable distinguishing positive and negative zero, key ordering in
  objects, sets and maps (call it 'strict' mode when all of the above are enabled)
