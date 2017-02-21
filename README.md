<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [guy-test](#guy-test)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



- [guy-test](#guy-test)

> **Table of Contents**  *generated with [DocToc](http://doctoc.herokuapp.com/)*


# guy-test
testing module for guy, the build tool

<!--
GUY

good
go
great

utility
ursa

you
yearn
yellow
yarn
yet
why
yak

go-use-yak

great useful yak

 -->

## ToDo

* [ ] use JSON diffpatch to visualize failure of T.eq / CND.equals
* [ ] modify or remove use of CND.get_caller_info
* [ ] must honor callbacks, work not only from command line but also within setups where program continues
  when tests have finished
* [ ] i'm tired of having to include guy-test in each and every module; it really should be treated like
  `coffee`, `stylus`, `doctoc` etcpp. and indeed `node` itself, i.e. as a build dependency that
  has to be present per default.
* [ ] in order to avoid compulsory eternal backwards-compatibility, future versions of guy-test will
  be published **with version numbers or version names** within the package name for each new version
  with braking changes, e.g. guy-test-alpha

JSON DiffPatch:
* https://www.npmjs.com/package/js-schema-6901
* https://www.npmjs.com/package/rfc6902
* https://github.com/benjamine/JsonDiffPatch
* https://benjamine.github.io/jsondiffpatch/demo/index.html
* https://github.com/wbish/jsondiffpatch.net




