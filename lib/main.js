(function() {
  'use strict';
  /* TAINT these should become instance configuration */
  var GUY, Test, WG, _jkequals, _test, alert, debug, echo, help, hide, info, inspect, isa, log, nameit, plain, praise, reverse, rpr, t, test_mode, type_of, types, urge, validate, warn, whisper;

  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('guy-test-NG'));

  ({rpr, inspect, echo, reverse, log} = GUY.trm);

  _test = require('guy-test');

  types = new (require('intertype')).Intertype();

  ({isa, type_of, validate} = types);

  _jkequals = require('../deps/jkroso-equals');

  ({hide} = GUY.props);

  WG = require('webguy');

  ({nameit} = WG.props);

  test_mode = 'throw_failures';

  test_mode = 'throw_errors';

  test_mode = 'failsafe';

  //===========================================================================================================
  Test = class Test {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg) {
      hide(this, 'test', nameit('test', (...P) => {
        return _test(...P);
      }));
      hide(this, 'throws', nameit('throws', (...P) => {
        return this._throws(...P);
      }));
      hide(this, 'throws_async', nameit('throws_async', async(...P) => {
        return (await this._throws_async(...P));
      }));
      hide(this, 'equals', nameit('equals', (...P) => {
        return this._equals(...P);
      }));
      hide(this, 'eq', nameit('eq', (...P) => {
        return this._eq(...P);
      }));
      hide(this, 'test', nameit('test', (...P) => {
        return _test(...P);
      }));
      return void 0;
    }

    // #---------------------------------------------------------------------------------------------------------
    // _throws: ( T, matcher, f ) ->
    //   switch arity = arguments.length
    //     when 2 then [ T, matcher, f, ] = [ T, null, matcher, ]
    //     when 3 then null
    //     else throw new Error "`throws()` needs 2 or 3 arguments, got #{arity}"
    //   #.........................................................................................................
    //   error       = null
    //   is_matching = null
    //   #.........................................................................................................
    //   try ( urge '^992-1^', "`throws()` result of call:", f() ) catch error
    //     #.......................................................................................................
    //     if matcher?
    //       is_matching = false
    //       switch matcher_type = type_of matcher
    //         when 'text'
    //           is_matching = error.message is matcher
    //         when 'regex'
    //           matcher.lastIndex = 0
    //           is_matching = matcher.test error.message
    //         else
    //           throw new Error "^992-2^ expected a regex or a text, got a #{matcher_type}"
    //       if is_matching
    //         help '^992-3^', "OK           ", reverse error.message
    //       else
    //         urge '^992-4^', "error        ", reverse error.message
    //         warn '^992-5^', "doesn't match", reverse rpr matcher
    //         T?.fail "^992-6^ error #{rpr error.message} doesn't match #{rpr matcher}"
    //     #.......................................................................................................
    //     else
    //       help '^992-7^', "error        ", reverse error.message
    //   #.........................................................................................................
    //   unless error?
    //     warn '^992-8^', reverse message = "`throws()`: expected an error but none was thrown"
    //     T?.fail "^992-9^ `throws()`: expected an error but none was thrown"
    //   #.........................................................................................................
    //   return null

      //---------------------------------------------------------------------------------------------------------
    _match_error(error, matcher) {
      var matcher_type;
      switch (matcher_type = type_of(matcher)) {
        case 'text':
          return error.message === matcher;
        case 'regex':
          matcher.lastIndex = 0;
          return matcher.test(error.message);
      }
      return matcher_type;
    }

    //---------------------------------------------------------------------------------------------------------
    _throws(T, f, matcher) {
      var error, matcher_type, message, ref;
      if ((ref = f.name) === '') {
        throw new Error(`^992-1^ test method should be named, got ${rpr(f)}`);
      }
      error = null;
      try {
        //.......................................................................................................
        urge(`^${ref}^ \`throws()\` result of call:`, f());
      } catch (error1) {
        error = error1;
        if (matcher == null) {
          help(`^${ref} ◀ throws@1^ error        `, reverse(error.message));
          if (T != null) {
            T.ok(true);
          }
          return null;
        }
        //.....................................................................................................
        switch (matcher_type = this._match_error(error, matcher)) {
          case true:
            help(`^${ref} ◀ throws@2^ OK           `, reverse(error.message));
            if (T != null) {
              T.ok(true);
            }
            break;
          case false:
            urge(`^${ref} ◀ throws@3^ error        `, reverse(error.message));
            warn(`^${ref} ◀ throws@4^ doesn't match`, reverse(rpr(matcher)));
            if (T != null) {
              T.fail(`^${ref} ◀ throws@5^ error ${rpr(error.message)} doesn't match ${rpr(matcher)}`);
            }
            break;
          default:
            message = `expected a regex or a text, got a ${matcher_type}`;
            warn(`^${ref} ◀ throws@6^`, reverse(message));
            if (T != null) {
              T.fail(`^${ref} ◀ throws@7^ ${message}`);
            }
        }
      }
      //.......................................................................................................
      if (error == null) {
        message = "`throws()`: expected an error but none was thrown";
        warn(`^${ref} ◀ throws@8^`, reverse(message));
        if (T != null) {
          T.fail(`^${ref} ◀ throws@9^ ${message}`);
        }
      }
      //.......................................................................................................
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    async _throws_async(T, f, matcher) { // new Promise ( resolve, reject ) =>
      /* TAINT check whether `f` is `asyncfunction`? */
      var error, matcher_type, message, ref, result;
      if ((ref = f.name) === '') {
        /*

        * needs `f` to be an `asyncfunction` (although `function` will also work? better check anyway?)
        * uses `try` / `except` clause to `await` `result` of calling `f`
        * in case `result` is delivered, that's an error
        * otherwise an `error` will be caught;
          * success when `matcher` is missing, or else, when `matcher` describes `error.message`;
          * failure otherwise

         */
        throw new Error(`Ωgt___1 test method should be named, got ${rpr(f)}`);
      }
      error = null;
      try {
        //.......................................................................................................
        result = (await f());
      } catch (error1) {
        //.......................................................................................................
        error = error1;
        //.....................................................................................................
        if (matcher == null) {
          help(`${ref} ◀ Ωgt___2 error OK     `, reverse(error.message));
          if (T != null) {
            T.ok(true);
          }
          return null;
        }
        //.....................................................................................................
        switch (matcher_type = this._match_error(error, matcher)) {
          case true:
            help(`${ref} ◀ Ωgt___3 error OK     `, reverse(error.message));
            if (T != null) {
              T.ok(true);
            }
            break;
          case false:
            urge(`${ref} ◀ Ωgt___4 error        `, reverse(error.message));
            warn(`${ref} ◀ Ωgt___5 doesn't match`, reverse(rpr(matcher)));
            if (T != null) {
              T.fail(`${ref} ◀ Ωgt___6 error ${rpr(error.message)} doesn't match ${rpr(matcher)}`);
            }
            break;
          default:
            message = `expected a regex or a text for matcher, got a ${matcher_type}`;
            warn(`${ref} ◀ Ωgt___7`, reverse(message));
            if (T != null) {
              T.fail(`${ref} ◀ Ωgt___8 ${message}`);
            }
        }
      }
      //.......................................................................................................
      if (error == null) {
        message = `expected an error but none was thrown, instead got result ${rpr(result)}`;
        warn(`${ref} ◀ Ωgt___9`, reverse(message));
        if (T != null) {
          T.fail(`${ref} ◀ Ωgt__10 ${message}`);
        }
      }
      //.......................................................................................................
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    _eq(T, f, matcher) {
      var error, message, ref, result;
      if ((ref = f.name) === '') {
        throw new Error(`^992-1^ test method should be named, got ${rpr(f)}`);
      }
      ref = ref.padEnd(15);
      try {
        //.......................................................................................................
        (result = f());
      } catch (error1) {
        error = error1;
        message = `\`eq2()\`: ^${ref}^ expected a result but got an an error: ${error.message}`;
        warn('^992-12^', reverse(message));
        if (T != null) {
          T.fail(`^992-13^ ${message}`);
        }
        debug('^25235234^', {test_mode});
        if (test_mode === 'throw_errors') {
          throw new Error(message);
        }
      }
      //.......................................................................................................
      if (this.equals(result, matcher)) {
        help(ref, "EQ OK");
        if (T != null) {
          T.ok(true);
        }
      } else {
        //.......................................................................................................
        warn(ref, reverse(' neq '), "result:     ", reverse(' ' + (rpr(result)) + ' '));
        warn(ref, reverse(' neq '), "matcher:    ", reverse(' ' + (rpr(matcher)) + ' '));
        if (T != null) {
          T.ok(false);
        }
      }
      //.......................................................................................................
      return null;
    }

    //=========================================================================================================
    // SET EQUALITY BY VALUE
    //---------------------------------------------------------------------------------------------------------
    _set_contains(set, value) {
      var element;
      for (element of set) {
        if (this._equals(element, value)) {
          return true;
        }
      }
      return false;
    }

    //---------------------------------------------------------------------------------------------------------
    _sets_are_equal(a, b) {
      var element;
      if (!isa.set(b)) {
        return false;
      }
      if (a.size !== b.size) {
        return false;
      }
      for (element of a) {
        if (!this._set_contains(b, element)) {
          return false;
        }
      }
      return true;
    }

    //---------------------------------------------------------------------------------------------------------
    _equals(a, b) {
      if ((type_of(a)) !== (type_of(b))) {
        return false;
      }
      if (isa.set(a)) {
        return this._sets_are_equal(a, b);
      }
      return _jkequals(a, b);
    }

  };

  //===========================================================================================================
  t = new Test();

  module.exports = {
    Test: Test,
    test: t.test,
    equals: t.equals,
    eq: t.eq,
    throws: t.throws,
    throws_async: t.throws_async
  };

}).call(this);

//# sourceMappingURL=main.js.map