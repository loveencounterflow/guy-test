(function() {
  'use strict';
  var GUY, Intertype, Test, WG, _Assumptions, _create_equals_cfg, _jkequals, _jktypeof, _known_equals_cfgs, _ordered_sets_or_maps_are_equal, _set_or_map_contains, _unordered_sets_or_maps_are_equal, alert, create, debug, echo, equals, help, hide, info, inspect, isa, j, log, nameit, plain, praise, reverse, rpr, to_width, type_of, types, urge, validate, warn, whisper;

  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('GT'));

  ({rpr, inspect, echo, reverse, log} = GUY.trm);

  ({Intertype} = require('intertype'));

  _jkequals = require('../deps/jkroso-equals');

  _jktypeof = require('../deps/jkroso-type');

  ({hide} = GUY.props);

  WG = require('webguy');

  ({nameit} = WG.props);

  ({to_width} = require('to-width'));

  j = function(...P) {
    var crumb;
    return ((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = P.length; i < len; i++) {
        crumb = P[i];
        if (crumb != null) {
          results.push(crumb);
        }
      }
      return results;
    })()).join('.');
  };

  //===========================================================================================================
  types = new Intertype();

  ({isa, type_of, validate, create} = types);

  //...........................................................................................................
  types.declare({
    gt_message_width: {
      test: function(x) {
        return (this.isa.cardinal(x)) && x > 2;
      }
    },
    gt_test_cfg: {
      fields: {
        auto_reset: 'boolean',
        show_report: 'boolean',
        show_results: 'boolean',
        show_fails: 'boolean',
        show_passes: 'boolean',
        throw_on_error: 'boolean',
        throw_on_fail: 'boolean',
        message_width: 'gt_message_width',
        prefix: 'text',
        //.....................................................................................................
        // these should be mixed-in from `equals_cfg`_
        ordered_objects: 'boolean',
        ordered_sets: 'boolean',
        ordered_maps: 'boolean',
        signed_zero: 'boolean'
      },
      template: {
        auto_reset: false,
        show_report: true,
        show_results: true,
        show_fails: true,
        show_passes: true,
        throw_on_error: false,
        throw_on_fail: false,
        message_width: 300,
        prefix: '',
        //.....................................................................................................
        // these should be mixed-in from `equals_cfg`_
        ordered_objects: false,
        ordered_sets: false,
        ordered_maps: false,
        signed_zero: false
      }
    },
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
    equals_cfg: {
      fields: {
        ordered_objects: 'boolean',
        ordered_sets: 'boolean',
        ordered_maps: 'boolean',
        signed_zero: 'boolean'
      },
      template: {
        ordered_objects: false,
        ordered_sets: false,
        ordered_maps: false,
        signed_zero: false
      }
    }
  });

  // gt_report_cfg:
  //   fields:
  //     prefix:   'text'
  //   template:
  //     prefix:   ''

    //===========================================================================================================
  _Assumptions = class _Assumptions {
    //---------------------------------------------------------------------------------------------------------
    constructor(host, upref = null) {
      hide(this, '_', host);
      hide(this, '_upref', upref);
      hide(this, 'equals', nameit('equals', (a, b) => {
        return equals(a, b, this._.cfg);
      }));
      // hide @, 'pass',         nameit 'pass',          ( P... ) =>       @_pass          P...
      // hide @, 'fail',         nameit 'fail',          ( P... ) =>       @_fail          P...
      // hide @, 'eq',           nameit 'eq',            ( P... ) =>       @_eq            P...
      // hide @, 'async_eq',     nameit 'async_eq',      ( P... ) =>       @_async_eq      P...
      // hide @, 'throws',       nameit 'throws',        ( P... ) =>       @_throws        P...
      // hide @, 'async_throws', nameit 'async_throws',  ( P... ) => await @_async_throws  P...
      return void 0;
    }

    //=========================================================================================================
    pass(upref, cat, message = null) {
      var ref;
      ref = j(this._upref, upref);
      this._._increment_passes(ref);
      if (this._.cfg.show_passes) {
        if (message != null) {
          message = this._to_message_width(message);
          help(ref, cat, reverse(` ${message} `));
        } else {
          help(ref, cat);
        }
      }
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    fail(upref, cat, message = null) {
      var ref;
      ref = j(this._upref, upref);
      this._._increment_fails(ref);
      this._._warn(ref, message != null ? `(${cat}) ${message}` : cat);
      if (this._.cfg.show_fails) {
        if (message != null) {
          message = this._to_message_width(message);
          warn(ref, cat, reverse(` ${message} `));
        } else {
          warn(ref, cat);
        }
      }
      return null;
    }

    //=========================================================================================================
    eq(f, matcher) {
      var error, message, ref, result, shortref;
      shortref = this._._ref_from_function(f);
      ref = j(this._upref, shortref);
      try {
        //.......................................................................................................
        (result = f.call(this, this));
      } catch (error1) {
        error = error1;
        message = `expected a result but got an an error: ${rpr(error.message)}`;
        this.fail(shortref, 'error', message);
        if (this._.cfg.throw_on_error) {
          error.message = message;
          throw error;
        }
        return null;
      }
      if (this.equals(result, matcher)) {
        //.......................................................................................................
        return this.pass(shortref, 'eq');
      }
      //.......................................................................................................
      warn(ref, reverse(' neq '), "result:     ", reverse(' ' + (rpr(result)) + ' '));
      warn(ref, reverse(' neq '), "matcher:    ", reverse(' ' + (rpr(matcher)) + ' '));
      this.fail(shortref, 'neq');
      if (this._.cfg.throw_on_fail) {
        throw new Error(`neq:\nresult:     ${rpr(result)}\nmatcher:    ${matcher}`);
      }
      //.......................................................................................................
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    async async_eq(f, matcher) {
      var error, message, ref, result, shortref;
      shortref = this._._ref_from_function(f);
      ref = j(this._upref, shortref);
      try {
        //.......................................................................................................
        (result = (await f.call(this, this)));
      } catch (error1) {
        error = error1;
        message = `expected a result but got an an error: ${rpr(error.message)}`;
        this.fail(shortref, 'error', message);
        if (this._.cfg.throw_on_error) {
          error.message = message;
          throw error;
        }
        return null;
      }
      if (this.equals(result, matcher)) {
        //.......................................................................................................
        return this.pass(shortref, 'eq');
      }
      //.......................................................................................................
      warn(ref, reverse(' neq '), "result:     ", reverse(' ' + (rpr(result)) + ' '));
      warn(ref, reverse(' neq '), "matcher:    ", reverse(' ' + (rpr(matcher)) + ' '));
      this.fail(shortref, 'neq');
      if (this._.cfg.throw_on_fail) {
        throw new Error(`neq:\nresult:     ${rpr(result)}\nmatcher:    ${matcher}`);
      }
      //.......................................................................................................
      return null;
    }

    //=========================================================================================================
    throws(f, matcher) {
      var error, matcher_type, ref, shortref;
      shortref = this._._ref_from_function(f);
      ref = j(this._upref, shortref);
      error = null;
      try {
        //.......................................................................................................
        urge(j(this._upref, shortref, 'Ωgt___1'), "`throws()` result of call:", rpr(f.call(this, this)));
      } catch (error1) {
        error = error1;
        if (matcher == null) {
          this.pass(shortref, 'error ok', error.message);
          return null;
        }
        //.....................................................................................................
        switch (matcher_type = this._._match_error(error, matcher)) {
          case true:
            this.pass(shortref, 'error ok', error.message);
            break;
          case false:
            urge(j(this._upref, shortref, 'Ωgt___2'), "error        ", reverse(error.message));
            /* TAINT to be replaced */            warn(j(this._upref, shortref, 'Ωgt___3'), "doesn't match", reverse(rpr(matcher)));
            this./* TAINT to be replaced */fail(shortref, 'neq', `error ${rpr(error.message)} doesn't match ${rpr(matcher)}`);
            break;
          default:
            this.fail(shortref, 'type', `expected a regex or a text, got a ${matcher_type}`);
        }
      }
      //.......................................................................................................
      if (error == null) {
        this.fail(shortref, 'noerr', "expected an error but none was thrown");
      }
      //.......................................................................................................
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    async async_throws(f, matcher) { // new Promise ( resolve, reject ) =>
      /*

      * needs `f` to be an `asyncfunction` (although `function` will also work? better check anyway?)
      * uses `try` / `except` clause to `await` `result` of calling `f`
      * in case `result` is delivered, that's an error
      * otherwise an `error` will be caught;
        * success when `matcher` is missing, or else, when `matcher` describes `error.message`;
        * failure otherwise

       */
      /* TAINT check whether `f` is `asyncfunction`? */
      var error, matcher_type, ref, result, shortref;
      shortref = this._._ref_from_function(f);
      ref = j(this._upref, shortref);
      error = null;
      try {
        //.......................................................................................................
        result = (await f.call(this, this));
      } catch (error1) {
        //.......................................................................................................
        error = error1;
        //.....................................................................................................
        if (matcher == null) {
          this.pass(shortref, 'error ok', `did throw ${rpr(error.message)}`);
          return null;
        }
        //.....................................................................................................
        switch (matcher_type = this._._match_error(error, matcher)) {
          case true:
            this.pass(shortref, 'error ok', `did throw ${rpr(error.message)}`);
            break;
          case false:
            urge(`${ref}.Ωgt___4 error        `, reverse(error.message));
            warn(`${ref}.Ωgt___5 doesn't match`, reverse(rpr(matcher)));
            this.fail(shortref, 'error nok', `did throw but not match ${rpr(error.message)}`);
            break;
          default:
            this.fail(shortref, 'fail', `expected a regex or a text for matcher, got a ${matcher_type}`);
        }
      }
      //.......................................................................................................
      if (error == null) {
        this.fail(shortref, 'missing', `expected an error but none was thrown, instead got result ${rpr(result)}`);
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
    _to_message_width(message) {
      return (to_width(message, this._.cfg.message_width)).trimEnd();
    }

  };

  //===========================================================================================================
  Test = class Test extends _Assumptions {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg) {
      super(null);
      this._ = this;
      this.cfg = Object.freeze(create.gt_test_cfg(cfg));
      this.totals = create.gt_totals();
      //.......................................................................................................
      hide(this, 'test', nameit('test', (...P) => {
        return this._test(...P);
      }));
      hide(this, 'async_test', nameit('async_test', async(...P) => {
        return (await this._async_test(...P));
      }));
      hide(this, 'report', nameit('report', (...P) => {
        return this._report(...P);
      }));
      //.......................................................................................................
      hide(this, '_KW_test_ref', '██_KW_test_ref');
      hide(this, 'stats', {
        '*': this.totals
      });
      hide(this, 'warnings', {});
      return void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    _test(...tests) {
      this._test_inner(null, ...tests);
      if (this.cfg.show_report) {
        this.report();
      }
      return this.stats;
    }

    //---------------------------------------------------------------------------------------------------------
    async _async_test(...tests) {
      await this._async_test_inner(null, ...tests);
      if (this.cfg.show_report) {
        this.report();
      }
      return this.stats;
    }

    //---------------------------------------------------------------------------------------------------------
    _test_inner(upref, ...tests) {
      var candidate, ctx, error, i, key, len, message, property, ref;
/* TAINT preliminary handling of arguments */
      for (i = 0, len = tests.length; i < len; i++) {
        candidate = tests[i];
        switch (true) {
          //.....................................................................................................
          case isa.function(candidate):
            try {
              ctx = new _Assumptions(this, upref);
              candidate.call(ctx, ctx);
            } catch (error1) {
              error = error1;
              ref = j(upref, 'Ωgt___6');
              message = `an unexpected error occurred when calling task ${rpr(ref)}; ${rpr(error.message)}`;
              this.fail(ref, 'error', message);
              if (this.cfg.throw_on_error) {
                error.message = message;
                throw error;
              }
            }
            break;
          //.....................................................................................................
          case isa.object(candidate):
            for (key in candidate) {
              property = candidate[key];
              this._test_inner(j(upref, key), property);
            }
            break;
          //.....................................................................................................
          case candidate == null:
            ref = j(upref, 'Ωgt___7');
            this.fail(ref, 'missing', `expected a test, got a ${type_of(candidate)}`);
            break;
          default:
            //.....................................................................................................
            ref = j(upref, this._ref_from_function(candidate));
            this.fail(ref, 'type', `expected a test, got a ${type_of(candidate)}`);
        }
      }
      //.......................................................................................................
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    async _async_test_inner(upref, ...tests) {
      var candidate, ctx, error, i, key, len, message, property, ref;
      for (i = 0, len = tests.length; i < len; i++) {
        candidate = tests[i];
        switch (true) {
          //.....................................................................................................
          case isa.function(candidate):
            await this._test_inner(upref, candidate);
            break;
          //.....................................................................................................
          case isa.asyncfunction(candidate):
            try {
              ctx = new _Assumptions(this, upref);
              await candidate.call(ctx, ctx);
            } catch (error1) {
              error = error1;
              ref = j(upref, 'Ωgt___8');
              message = `an unexpected error occurred when calling task ${rpr(ref)}; ${rpr(error.message)}`;
              this.fail(ref, 'error', message);
              if (this.cfg.throw_on_error) {
                error.message = message;
                throw error;
              }
            }
            break;
          //.....................................................................................................
          case isa.object(candidate):
            for (key in candidate) {
              property = candidate[key];
              await this._async_test_inner(j(upref, key), property);
            }
            break;
          default:
            //.....................................................................................................
            ref = j(upref, this._ref_from_function(candidate));
            this.fail(ref, 'type', `expected a test, got a ${type_of(candidate)}`);
        }
      }
      //.......................................................................................................
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    _report() {
      var blue, color, gold, i, key, len, line, message, messages, red, ref1, ref2, repeat_totals, show_totals, stats, sub_ref;
      ({blue, red, gold} = GUY.trm);
      line = gold('—————————————————————————————————————————————————————————————————');
      //.......................................................................................................
      show_totals = () => {
        whisper('Ωgt___9 ' + this.cfg.prefix, line);
        whisper('Ωgt__10 ' + this.cfg.prefix, reverse(GUY.trm[color]('*'.padEnd(20), this.totals)));
        whisper('Ωgt__11 ' + this.cfg.prefix, line);
        return null;
      };
      //.......................................................................................................
      whisper();
      whisper('Ωgt__12 ' + this.cfg.prefix, line);
      whisper('Ωgt__13 ' + this.cfg.prefix, gold('                        🙤 GUY TEST 🙦'));
      whisper('Ωgt__14 ' + this.cfg.prefix, line);
      color = this.totals.fails === 0 ? 'lime' : 'red';
      ref1 = this.stats;
      for (key in ref1) {
        stats = ref1[key];
        if (key === '*') {
          continue;
        }
        whisper('Ωgt__15 ' + this.cfg.prefix, blue(key.padEnd(20), stats));
      }
      show_totals();
      repeat_totals = false;
      ref2 = this.warnings;
      for (sub_ref in ref2) {
        messages = ref2[sub_ref];
        repeat_totals = true;
        for (i = 0, len = messages.length; i < len; i++) {
          message = messages[i];
          whisper('Ωgt__16 ' + this.cfg.prefix, red(sub_ref), reverse(red(` ${message} `)));
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
    _increment_passes(check_ref) {
      return this._increment('passes', check_ref);
    }

    _increment_fails(check_ref) {
      return this._increment('fails', check_ref);
    }

    //---------------------------------------------------------------------------------------------------------
    _increment(pass_or_fail, check_ref) {
      var base, per_check_stats;
      per_check_stats = (base = this.stats)[check_ref] != null ? base[check_ref] : base[check_ref] = create.gt_stats();
      per_check_stats[pass_or_fail]++;
      this.totals[pass_or_fail]++;
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    _warn(ref, message) {
      var base;
      ((base = this.warnings)[ref] != null ? base[ref] : base[ref] = []).push(message != null ? message : './.');
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

  };

  //===========================================================================================================
  // SET EQUALITY BY VALUE
  //-----------------------------------------------------------------------------------------------------------
  equals = function(a, b, cfg) {
    var R, k, type_of_a;
    cfg = _create_equals_cfg(cfg);
    if ((!cfg.signed_zero) && (a === 0) && (b === 0)) {
      /* NOTE these comparisons disregard sign of zero */
      return true;
    }
    if ((type_of_a = type_of(a)) !== (type_of(b))) {
      return false;
    }
    if (type_of_a === 'set') {
      if (cfg.ordered_sets) {
        return _ordered_sets_or_maps_are_equal(a, b, cfg);
      }
      return _unordered_sets_or_maps_are_equal(a, b, cfg);
    }
    if (type_of_a === 'map') {
      if (cfg.ordered_maps) {
        return _ordered_sets_or_maps_are_equal(a, b, cfg);
      }
      return _unordered_sets_or_maps_are_equal(a, b, cfg);
    }
    R = _jkequals(a, b);
    //.........................................................................................................
    /* TAINT this repeats work already done by _jkequals and should be implemented in that module */
    if (R && cfg.ordered_objects && (_jktypeof(a)) === 'object') {
      return _jkequals((function() {
        var results;
        results = [];
        for (k in a) {
          if (k !== 'constructor') {
            results.push(k);
          }
        }
        return results;
      })(), (function() {
        var results;
        results = [];
        for (k in b) {
          if (k !== 'constructor') {
            results.push(k);
          }
        }
        return results;
      })());
    }
    //.........................................................................................................
    return R;
  };

  //...........................................................................................................
  _set_or_map_contains = function(set_or_map, element, cfg) {
    var element_2;
    for (element_2 of set_or_map) {
      if (equals(element_2, element, cfg)) {
        return true;
      }
    }
    return false;
  };

  //...........................................................................................................
  _ordered_sets_or_maps_are_equal = function(a, b, cfg) {
    var element, entries_of_b, idx;
    if (a.size !== b.size) {
      /* TAINT only use if both a, b have same type and type is `set` or `map` */
      return false;
    }
    idx = -1;
    entries_of_b = [...b];
    for (element of a) {
      idx++;
      if (!equals(element, entries_of_b[idx], cfg)) {
        return false;
      }
    }
    return true;
  };

  //...........................................................................................................
  _unordered_sets_or_maps_are_equal = function(a, b, cfg) {
    var element;
    if (a.size !== b.size) {
      /* TAINT only use if both a, b have same type and type is `set` or `map` */
      return false;
    }
    for (element of a) {
      if (!_set_or_map_contains(b, element, cfg)) {
        return false;
      }
    }
    return true;
  };

  //...........................................................................................................
  _create_equals_cfg = function(cfg) {
    var R;
    if ((R = _known_equals_cfgs.get(cfg)) != null) {
      return R;
    }
    _known_equals_cfgs.set(cfg, R = create.equals_cfg(cfg));
    return R;
  };

  //...........................................................................................................
  _known_equals_cfgs = new Map();

  //===========================================================================================================
  module.exports = {
    Test,
    _Assumptions,
    equals,
    _types: types
  };

}).call(this);

//# sourceMappingURL=main.js.map