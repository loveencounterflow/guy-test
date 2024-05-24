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
        runs: 'cardinal',
        checks: 'cardinal',
        passes: 'cardinal',
        fails: 'cardinal'
      },
      template: {
        runs: 0,
        checks: 0,
        passes: 0,
        fails: 0
      }
    },
    gt_totals: {
      /* TAINT use inheritance to derive shared fields */fields: {
        tests: 'cardinal',
        checks: 'cardinal',
        passes: 'cardinal',
        fails: 'cardinal'
      },
      template: {
        tests: 0,
        checks: 0,
        passes: 0,
        fails: 0
      }
    }
  }));

  //===========================================================================================================
  Test = class Test {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg) {
      this.totals = create.gt_totals();
      hide(this, 'test', nameit('test', (...P) => {
        return this._test(...P);
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
      hide(this, 'async_throws', nameit('async_throws', async(...P) => {
        return (await this._async_throws(...P));
      }));
      hide(this, 'equals', nameit('equals', (...P) => {
        return this._equals(...P);
      }));
      hide(this, '_test_ref', null);
      hide(this, 'stats', {
        '*': this.totals
      });
      return void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    _test(...tests) {
      var color, key, ref1, stats;
      this._test_inner(...tests);
      //.......................................................................................................
      color = this.totals.fails === 0 ? 'lime' : 'red';
      ref1 = this.stats;
      for (key in ref1) {
        stats = ref1[key];
        if (key === '*') {
          continue;
        }
        info('Ωgt___3', key.padEnd(20), stats);
      }
      info('Ωgt___4', GUY.trm.grey('-----------------------------------------------------------------'));
      info('Ωgt___5', reverse(GUY.trm[color]('*'.padEnd(20), this.totals)));
      //.......................................................................................................
      return this.stats;
    }

    //---------------------------------------------------------------------------------------------------------
    _test_inner(...tests) {
      var candidate, error, i, key, len, property;
/* TAINT preliminary handling of arguments */
      for (i = 0, len = tests.length; i < len; i++) {
        candidate = tests[i];
        switch (true) {
          //...................................................................................................
          case isa.function(candidate):
            this._test_ref = this._ref_from_function(candidate);
            this._increment_tests('test', this._test_ref);
            try {
              candidate.call(this);
            } catch (error1) {
              error = error1;
            } finally {
              this._test_ref = null;
            }
            break;
          //...................................................................................................
          case isa.object(candidate):
            for (key in candidate) {
              property = candidate[key];
              this._test_inner(property);
            }
            break;
          default:
            //...................................................................................................
            this._increment_fails('test', 'Ωgt___1');
            warn('Ωgt___2', reverse(` expected a test, got a ${type_of(candidate)} `));
        }
      }
      //.......................................................................................................
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    _test_async(...tests) {
      var i, len, results, test;
      throw new Error("Ωgt___6 not implemented");
      results = [];
      for (i = 0, len = tests.length; i < len; i++) {
        test = tests[i];
        switch (true) {
          case isa.function(test):
            results.push(this.test(test));
            break;
          default:
            // when isa.object test then null
            /* TAINT record failure and move on */
            throw new Error(`Ωgt___7 expected a test, got a ${type_of(test)}`);
        }
      }
      return results;
    }

    // when isa.asyncfunction test then null

      //---------------------------------------------------------------------------------------------------------
    _increment_tests(level, check_ref) {
      return this._increment(level, 'tests', check_ref);
    }

    _increment_checks(level, check_ref) {
      return this._increment(level, 'checks', check_ref);
    }

    _increment_passes(level, check_ref) {
      return this._increment(level, 'passes', check_ref);
    }

    _increment_fails(level, check_ref) {
      return this._increment(level, 'fails', check_ref);
    }

    //---------------------------------------------------------------------------------------------------------
    _increment(level, key, check_ref) {
      var base, base1, name, name1, per_check_stats, per_test_stats;
      /* TAINT get rid of `level` kludge */
      this.totals[key]++;
      per_test_stats = (base = this.stats)[name = `${this._test_ref}.*`] != null ? base[name] : base[name] = create.gt_stats();
      if (key === 'checks') {
        per_test_stats.runs++;
      }
      if (level === 'check') {
        per_check_stats = (base1 = this.stats)[name1 = `${this._test_ref}.${check_ref}`] != null ? base1[name1] : base1[name1] = create.gt_stats();
        if (key === 'checks') {
          per_check_stats.runs++;
        }
        if (key !== 'tests') {
          per_test_stats[key]++;
          per_check_stats[key]++;
        }
      }
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
      this._increment_checks('check', ref);
      try {
        //.......................................................................................................
        (result = f());
      } catch (error1) {
        error = error1;
        message = `\`eq2()\`: ^${ref}^ expected a result but got an an error: ${error.message}`;
        warn('^992-12^', reverse(message));
        this._increment_fails('check', ref); // T?.fail "^992-13^ #{message}"
        debug('^25235234^', {test_mode});
        if (test_mode === 'throw_errors') {
          throw new Error(message);
        }
      }
      //.......................................................................................................
      if (this.equals(result, matcher)) {
        help(ref, "EQ OK");
        this._increment_passes('check', ref);
      } else {
        // T?.ok true
        //.......................................................................................................
        warn(ref, reverse(' neq '), "result:     ", reverse(' ' + (rpr(result)) + ' '));
        warn(ref, reverse(' neq '), "matcher:    ", reverse(' ' + (rpr(matcher)) + ' '));
        this._increment_fails('check', ref);
      }
      // T?.ok false
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
        throw new Error(`Ωgt___8 test method should be named, got ${rpr(f)}`);
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
          help(`${ref} ◀ Ωgt___9 error OK     `, reverse(error.message));
          if (T != null) {
            T.ok(true);
          }
          return null;
        }
        //.....................................................................................................
        switch (matcher_type = this._match_error(error, matcher)) {
          case true:
            help(`${ref} ◀ Ωgt__10 error OK     `, reverse(error.message));
            if (T != null) {
              T.ok(true);
            }
            break;
          case false:
            urge(`${ref} ◀ Ωgt__11 error        `, reverse(error.message));
            warn(`${ref} ◀ Ωgt__12 doesn't match`, reverse(rpr(matcher)));
            if (T != null) {
              T.fail(`${ref} ◀ Ωgt__13 error ${rpr(error.message)} doesn't match ${rpr(matcher)}`);
            }
            break;
          default:
            message = `expected a regex or a text for matcher, got a ${matcher_type}`;
            warn(`${ref} ◀ Ωgt__14`, reverse(message));
            if (T != null) {
              T.fail(`${ref} ◀ Ωgt__15 ${message}`);
            }
        }
      }
      //.......................................................................................................
      if (error == null) {
        message = `expected an error but none was thrown, instead got result ${rpr(result)}`;
        warn(`${ref} ◀ Ωgt__16`, reverse(message));
        if (T != null) {
          T.fail(`${ref} ◀ Ωgt__17 ${message}`);
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
    equals: t.equals,
    eq: t.eq,
    throws: t.throws,
    throws_async: t.throws_async
  };

}).call(this);

//# sourceMappingURL=main.js.map