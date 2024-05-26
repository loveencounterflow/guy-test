(function() {
  'use strict';
  /* TAINT these should become instance configuration */
  var GUY, Intertype, Test, WG, _jkequals, alert, create, debug, echo, help, hide, info, inspect, isa, log, nameit, plain, praise, reverse, rpr, t, test_mode, type_of, urge, validate, warn, whisper;

  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('guy-test-NG'));

  ({rpr, inspect, echo, reverse, log} = GUY.trm);

  ({Intertype} = require('intertype'));

  _jkequals = require('../deps/jkroso-equals');

  ({hide} = GUY.props);

  WG = require('webguy');

  ({nameit} = WG.props);

  test_mode = 'throw_failures';

  test_mode = 'throw_errors';

  test_mode = 'failsafe';

  //===========================================================================================================
  ({isa, type_of, validate, create} = new Intertype({
    gt_stats: {
      fields: {
        passes: 'cardinal',
        fails: 'cardinal'
      },
      template: {
        passes: 0,
        fails: 0
      }
    },
    gt_totals: {
      /* TAINT use inheritance to derive shared fields */fields: {
        passes: 'cardinal',
        fails: 'cardinal'
      },
      template: {
        passes: 0,
        fails: 0
      }
    },
    gt_report_cfg: {
      fields: {
        prefix: 'text'
      },
      template: {
        prefix: ''
      }
    }
  }));

  //===========================================================================================================
  Test = class Test {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg) {
      this.totals = create.gt_totals();
      //.......................................................................................................
      hide(this, 'test', nameit('test', (...P) => {
        return this._test(...P);
      }));
      hide(this, 'report', nameit('report', (...P) => {
        return this._report(...P);
      }));
      hide(this, 'eq', nameit('eq', (...P) => {
        return this._eq(...P);
      }));
      hide(this, 'async_eq', nameit('async_eq', (...P) => {
        return this._async_eq(...P);
      }));
      hide(this, 'throws', nameit('throws', (...P) => {
        return this._throws(...P);
      }));
      hide(this, 'equals', nameit('equals', (...P) => {
        return this._equals(...P);
      }));
      //.......................................................................................................
      hide(this, 'async_test', nameit('async_test', async(...P) => {
        return (await this._async_test(...P));
      }));
      hide(this, 'async_throws', nameit('async_throws', async(...P) => {
        return (await this._async_throws(...P));
      }));
      //.......................................................................................................
      hide(this, '_test_ref', null);
      hide(this, 'stats', {
        '*': this.totals
      });
      hide(this, 'warnings', {});
      return void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    _test(...tests) {
      this._test_inner(...tests);
      this.report();
      return this.stats;
    }

    //---------------------------------------------------------------------------------------------------------
    _test_inner(...tests) {
      var candidate, error, i, key, len, property, ref;
/* TAINT preliminary handling of arguments */
      for (i = 0, len = tests.length; i < len; i++) {
        candidate = tests[i];
        switch (true) {
          //.....................................................................................................
          case isa.function(candidate):
            this._test_ref = ref = this._ref_from_function(candidate);
            try {
              // @_increment_tests 'test', ref
              candidate.call(this);
            } catch (error1) {
              error = error1;
              this.fail(ref, `an unexpected error occurred when calling task ${rpr(ref)}; ${rpr(error.message)}`);
            } finally {
              this._test_ref = null;
            }
            break;
          //.....................................................................................................
          case isa.object(candidate):
            for (key in candidate) {
              property = candidate[key];
              this._test_inner(property);
            }
            break;
          //.....................................................................................................
          case candidate == null:
            ref = 'Ωgt___1';
            this.fail(ref, `expected a test, got a ${type_of(candidate)}`);
            break;
          default:
            //.....................................................................................................
            ref = this._ref_from_function(candidate);
            if (ref === 'anon') {
              ref = 'Ωgt___2';
            }
            this.fail(ref, `expected a test, got a ${type_of(candidate)}`);
        }
      }
      //.......................................................................................................
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    async _async_test(...tests) {
      await this._async_test_inner(...tests);
      this.report();
      return this.stats;
    }

    //---------------------------------------------------------------------------------------------------------
    async _async_test_inner(...tests) {
      var candidate, error, i, key, len, property, ref;
      for (i = 0, len = tests.length; i < len; i++) {
        candidate = tests[i];
        switch (true) {
          //.....................................................................................................
          case isa.function(candidate):
            this._test_inner(candidate);
            break;
          //.....................................................................................................
          case isa.asyncfunction(candidate):
            this._test_ref = this._ref_from_function(candidate);
            try {
              // @_increment_tests 'test', @_test_ref
              await candidate.call(this);
            } catch (error1) {
              error = error1;
            } finally {
              this._test_ref = null;
            }
            break;
          //.....................................................................................................
          case isa.object(candidate):
            for (key in candidate) {
              property = candidate[key];
              await this._async_test_inner(property);
            }
            break;
          default:
            //.....................................................................................................
            ref = this._ref_from_function(candidate);
            if (ref === 'anon') {
              ref = 'Ωgt___3';
            }
            this.fail(ref, `expected a test, got a ${type_of(candidate)}`);
        }
      }
      //.......................................................................................................
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    _report(cfg) {
      var blue, color, gold, i, key, len, line, message, messages, prefix, red, ref1, ref2, repeat_totals, show_totals, stats, sub_ref;
      ({prefix} = create.gt_report_cfg(cfg != null ? cfg : {}));
      ({blue, red, gold} = GUY.trm);
      line = gold('—————————————————————————————————————————————————————————————————');
      //.......................................................................................................
      show_totals = () => {
        whisper('Ωgt___8', prefix, line);
        whisper('Ωgt___9', prefix, reverse(GUY.trm[color]('*'.padEnd(20), this.totals)));
        whisper('Ωgt__10', prefix, line);
        return null;
      };
      //.......................................................................................................
      whisper();
      whisper('Ωgt___4', prefix, line);
      whisper('Ωgt___5', prefix, gold('                        🙤 GUY TEST 🙦'));
      whisper('Ωgt___6', prefix, line);
      color = this.totals.fails === 0 ? 'lime' : 'red';
      ref1 = this.stats;
      for (key in ref1) {
        stats = ref1[key];
        if (key === '*') {
          continue;
        }
        whisper('Ωgt___7', prefix, blue(key.padEnd(20), stats));
      }
      show_totals();
      repeat_totals = false;
      ref2 = this.warnings;
      for (sub_ref in ref2) {
        messages = ref2[sub_ref];
        repeat_totals = true;
        for (i = 0, len = messages.length; i < len; i++) {
          message = messages[i];
          whisper('Ωgt__11', prefix, red(sub_ref), reverse(red(` ${message} `)));
        }
      }
      if (repeat_totals) {
        show_totals();
      }
      whisper();
      //.......................................................................................................
      return this.stats;
    }

    //---------------------------------------------------------------------------------------------------------
    _increment_passes(level, check_ref) {
      return this._increment(level, 'passes', check_ref);
    }

    _increment_fails(level, check_ref) {
      return this._increment(level, 'fails', check_ref);
    }

    //---------------------------------------------------------------------------------------------------------
    pass(ref, message = null) {
      if (message == null) {
        message = "(no message given)";
      }
      this._increment_passes('check', ref);
      help(ref, reverse(` ${message} `));
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    fail(ref, message = null) {
      if (message == null) {
        message = "(no message given)";
      }
      this._increment_fails('check', ref);
      this._warn(ref, message);
      warn(ref, reverse(` ${message} `));
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    _increment(level, key, check_ref) {
      var base, base1, name, name1, per_check_stats, per_test_stats;
      /* TAINT get rid of `level` kludge */
      this.totals[key]++;
      per_test_stats = (base = this.stats)[name = `${this._test_ref}.*`] != null ? base[name] : base[name] = create.gt_stats();
      if (level === 'check') {
        per_check_stats = (base1 = this.stats)[name1 = `${this._test_ref}.${check_ref}`] != null ? base1[name1] : base1[name1] = create.gt_stats();
        if (key !== 'tests') {
          per_test_stats[key]++;
          per_check_stats[key]++;
        }
      }
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    _warn(ref, message) {
      var base;
      ((base = this.warnings)[ref] != null ? base[ref] : base[ref] = []).push(message);
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    _ref_from_function(f) {
      var R;
      if ((R = f.name) === '') {
        R = 'anon';
      }
      // throw new Error "^992-1^ test method should be named, got #{rpr f}" if ( R = f.name ) is ''
      return R;
    }

    //=========================================================================================================
    _eq(f, matcher) {
      var error, message, ref, result;
      ref = this._ref_from_function(f);
      try {
        // @_increment_checks 'check', ref
        //.......................................................................................................
        (result = f());
      } catch (error1) {
        error = error1;
        message = `expected a result but got an an error: ${rpr(error.message)}`;
        this.fail(ref, message);
        if (test_mode === 'throw_errors') {
          throw new Error(message);
        }
      }
      //.......................................................................................................
      if (this.equals(result, matcher)) {
        this.pass(ref, "EQ OK");
      } else {
        //.......................................................................................................
        warn(ref, reverse(' neq '), "result:     ", reverse(' ' + (rpr(result)) + ' '));
        warn(ref, reverse(' neq '), "matcher:    ", reverse(' ' + (rpr(matcher)) + ' '));
        this.fail(ref, "NEQ");
      }
      //.......................................................................................................
      return null;
    }

    //=========================================================================================================
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
    async _async_throws(T, f, matcher) { // new Promise ( resolve, reject ) =>
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
        throw new Error(`Ωgt__14 test method should be named, got ${rpr(f)}`);
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
          help(`${ref} ◀ Ωgt__15 error OK     `, reverse(error.message));
          if (T != null) {
            T.ok(true);
          }
          return null;
        }
        //.....................................................................................................
        switch (matcher_type = this._match_error(error, matcher)) {
          case true:
            help(`${ref} ◀ Ωgt__16 error OK     `, reverse(error.message));
            if (T != null) {
              T.ok(true);
            }
            break;
          case false:
            urge(`${ref} ◀ Ωgt__17 error        `, reverse(error.message));
            warn(`${ref} ◀ Ωgt__18 doesn't match`, reverse(rpr(matcher)));
            if (T != null) {
              T.fail(`${ref} ◀ Ωgt__19 error ${rpr(error.message)} doesn't match ${rpr(matcher)}`);
            }
            break;
          default:
            message = `expected a regex or a text for matcher, got a ${matcher_type}`;
            warn(`${ref} ◀ Ωgt__20`, reverse(message));
            if (T != null) {
              T.fail(`${ref} ◀ Ωgt__21 ${message}`);
            }
        }
      }
      //.......................................................................................................
      if (error == null) {
        message = `expected an error but none was thrown, instead got result ${rpr(result)}`;
        warn(`${ref} ◀ Ωgt__22`, reverse(message));
        if (T != null) {
          T.fail(`${ref} ◀ Ωgt__23 ${message}`);
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
    _TMP_test: t,
    test: t.test,
    async_test: t.async_test,
    equals: t.equals,
    eq: t.eq,
    throws: t.throws,
    async_throws: t.async_throws
  };

}).call(this);

//# sourceMappingURL=main.js.map