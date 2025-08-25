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
        report_checks: 'boolean',
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
        report_checks: true,
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
      if (this.totals.fails !== 0) {
        process.exitCode = 99;
      }
      return this.stats;
    }

    //---------------------------------------------------------------------------------------------------------
    async _async_test(...tests) {
      await this._async_test_inner(null, ...tests);
      if (this.cfg.show_report) {
        this.report();
      }
      if (this.totals.fails !== 0) {
        process.exitCode = 99;
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
              // ref     = ( j upref, 'Ωgt___6' )
              ref = upref;
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
            // ref     = ( j upref, 'Ωgt___7' )
            ref = upref;
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
      whisper('Ωgt__13 ' + this.cfg.prefix, gold('                        🙤  GUY TEST 🙦'));
      color = this.totals.fails === 0 ? 'lime' : 'red';
      if (this.cfg.report_checks) {
        whisper('Ωgt__14 ' + this.cfg.prefix, line);
        ref1 = this.stats;
        for (key in ref1) {
          stats = ref1[key];
          if (key === '*') {
            continue;
          }
          whisper('Ωgt__15 ' + this.cfg.prefix, blue(key.padEnd(20), stats));
        }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLEdBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLEVBQUEsRUFBQSxZQUFBLEVBQUEsa0JBQUEsRUFBQSxTQUFBLEVBQUEsU0FBQSxFQUFBLGtCQUFBLEVBQUEsK0JBQUEsRUFBQSxvQkFBQSxFQUFBLGlDQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxRQUFBLEVBQUEsT0FBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLElBQUEsRUFBQTs7RUFFQSxHQUFBLEdBQTRCLE9BQUEsQ0FBUSxLQUFSOztFQUM1QixDQUFBLENBQUUsS0FBRixFQUNFLEtBREYsRUFFRSxJQUZGLEVBR0UsSUFIRixFQUlFLEtBSkYsRUFLRSxNQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxPQVJGLENBQUEsR0FRNEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFSLENBQW9CLElBQXBCLENBUjVCOztFQVNBLENBQUEsQ0FBRSxHQUFGLEVBQ0UsT0FERixFQUVFLElBRkYsRUFHRSxPQUhGLEVBSUUsR0FKRixDQUFBLEdBSTRCLEdBQUcsQ0FBQyxHQUpoQzs7RUFLQSxDQUFBLENBQUUsU0FBRixDQUFBLEdBQTRCLE9BQUEsQ0FBUSxXQUFSLENBQTVCOztFQUNBLFNBQUEsR0FBNEIsT0FBQSxDQUFRLHVCQUFSOztFQUM1QixTQUFBLEdBQTRCLE9BQUEsQ0FBUSxxQkFBUjs7RUFDNUIsQ0FBQSxDQUFFLElBQUYsQ0FBQSxHQUE0QixH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QUFBO0lBQ0UsSUFBb0IsQ0FBQyxDQUFDLElBQUYsS0FBVSxDQUFDLENBQUMsSUFBaEM7O0FBQUEsYUFBTyxNQUFQOztJQUNBLEdBQUEsR0FBTSxDQUFDO0lBQ1AsWUFBQSxHQUFlLENBQUUsR0FBQSxDQUFGO0lBQ2YsS0FBQSxZQUFBO01BQ0UsR0FBQTtNQUNBLEtBQW9CLE1BQUEsQ0FBTyxPQUFQLEVBQWdCLFlBQVksQ0FBRSxHQUFGLENBQTVCLEVBQXFDLEdBQXJDLENBQXBCO0FBQUEsZUFBTyxNQUFQOztJQUZGO0FBR0EsV0FBTztFQVJ5QixFQTdibEM7OztFQXVjQSxpQ0FBQSxHQUFvQyxRQUFBLENBQUUsQ0FBRixFQUFLLENBQUwsRUFBUSxHQUFSLENBQUE7QUFDcEMsUUFBQTtJQUNFLElBQW9CLENBQUMsQ0FBQyxJQUFGLEtBQVUsQ0FBQyxDQUFDLElBQWhDOztBQUFBLGFBQU8sTUFBUDs7SUFDQSxLQUFBLFlBQUE7TUFDRSxLQUFvQixvQkFBQSxDQUFxQixDQUFyQixFQUF3QixPQUF4QixFQUFpQyxHQUFqQyxDQUFwQjtBQUFBLGVBQU8sTUFBUDs7SUFERjtBQUVBLFdBQU87RUFMMkIsRUF2Y3BDOzs7RUE4Y0Esa0JBQUEsR0FBcUIsUUFBQSxDQUFFLEdBQUYsQ0FBQTtBQUNyQixRQUFBO0lBQUUsSUFBWSx5Q0FBWjtBQUFBLGFBQU8sRUFBUDs7SUFDQSxrQkFBa0IsQ0FBQyxHQUFuQixDQUF1QixHQUF2QixFQUE0QixDQUFBLEdBQUksTUFBTSxDQUFDLFVBQVAsQ0FBa0IsR0FBbEIsQ0FBaEM7QUFDQSxXQUFPO0VBSFksRUE5Y3JCOzs7RUFtZEEsa0JBQUEsR0FBcUIsSUFBSSxHQUFKLENBQUEsRUFuZHJCOzs7RUF1ZEEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFBRSxJQUFGO0lBQVEsWUFBUjtJQUFzQixNQUF0QjtJQUE4QixNQUFBLEVBQVE7RUFBdEM7QUF2ZGpCIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbid1c2Ugc3RyaWN0J1xuXG5HVVkgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZ3V5J1xueyBhbGVydFxuICBkZWJ1Z1xuICBoZWxwXG4gIGluZm9cbiAgcGxhaW5cbiAgcHJhaXNlXG4gIHVyZ2VcbiAgd2FyblxuICB3aGlzcGVyIH0gICAgICAgICAgICAgICA9IEdVWS50cm0uZ2V0X2xvZ2dlcnMgJ0dUJ1xueyBycHJcbiAgaW5zcGVjdFxuICBlY2hvXG4gIHJldmVyc2VcbiAgbG9nICAgICB9ICAgICAgICAgICAgICAgPSBHVVkudHJtXG57IEludGVydHlwZSB9ICAgICAgICAgICAgID0gcmVxdWlyZSAnaW50ZXJ0eXBlJ1xuX2prZXF1YWxzICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uL2RlcHMvamtyb3NvLWVxdWFscydcbl9qa3R5cGVvZiAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi9kZXBzL2prcm9zby10eXBlJ1xueyBoaWRlIH0gICAgICAgICAgICAgICAgICA9IEdVWS5wcm9wc1xuV0cgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3dlYmd1eSdcbnsgbmFtZWl0IH0gICAgICAgICAgICAgICAgPSBXRy5wcm9wc1xueyB0b193aWR0aCB9ICAgICAgICAgICAgICA9IHJlcXVpcmUgJ3RvLXdpZHRoJ1xuaiAgICAgICAgICAgICAgICAgICAgICAgICA9ICggUC4uLiApIC0+ICggY3J1bWIgZm9yIGNydW1iIGluIFAgd2hlbiBjcnVtYj8gKS5qb2luICcuJ1xuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxudHlwZXMgICAgICAgICAgICAgICAgICAgICA9IG5ldyBJbnRlcnR5cGVcbnsgaXNhXG4gIHR5cGVfb2ZcbiAgdmFsaWRhdGVcbiAgY3JlYXRlICAgICAgICAgICAgICAgIH0gPSB0eXBlc1xuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG50eXBlcy5kZWNsYXJlXG4gIGd0X21lc3NhZ2Vfd2lkdGg6XG4gICAgdGVzdDogICAgICAgICAgICAgKCB4ICkgLT4gKCBAaXNhLmNhcmRpbmFsIHggKSBhbmQgeCA+IDJcbiAgZ3RfdGVzdF9jZmc6XG4gICAgZmllbGRzOlxuICAgICAgYXV0b19yZXNldDogICAgICdib29sZWFuJ1xuICAgICAgc2hvd19yZXBvcnQ6ICAgICdib29sZWFuJ1xuICAgICAgcmVwb3J0X2NoZWNrczogICdib29sZWFuJ1xuICAgICAgc2hvd19yZXN1bHRzOiAgICdib29sZWFuJ1xuICAgICAgc2hvd19mYWlsczogICAgICdib29sZWFuJ1xuICAgICAgc2hvd19wYXNzZXM6ICAgICdib29sZWFuJ1xuICAgICAgdGhyb3dfb25fZXJyb3I6ICdib29sZWFuJ1xuICAgICAgdGhyb3dfb25fZmFpbDogICdib29sZWFuJ1xuICAgICAgbWVzc2FnZV93aWR0aDogICdndF9tZXNzYWdlX3dpZHRoJ1xuICAgICAgcHJlZml4OiAgICAgICAgICd0ZXh0J1xuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAjIHRoZXNlIHNob3VsZCBiZSBtaXhlZC1pbiBmcm9tIGBlcXVhbHNfY2ZnYF9cbiAgICAgIG9yZGVyZWRfb2JqZWN0czogICdib29sZWFuJ1xuICAgICAgb3JkZXJlZF9zZXRzOiAgICAgJ2Jvb2xlYW4nXG4gICAgICBvcmRlcmVkX21hcHM6ICAgICAnYm9vbGVhbidcbiAgICAgIHNpZ25lZF96ZXJvOiAgICAgICdib29sZWFuJ1xuICAgIHRlbXBsYXRlOlxuICAgICAgYXV0b19yZXNldDogICAgIGZhbHNlXG4gICAgICBzaG93X3JlcG9ydDogICAgdHJ1ZVxuICAgICAgcmVwb3J0X2NoZWNrczogIHRydWVcbiAgICAgIHNob3dfcmVzdWx0czogICB0cnVlXG4gICAgICBzaG93X2ZhaWxzOiAgICAgdHJ1ZVxuICAgICAgc2hvd19wYXNzZXM6ICAgIHRydWVcbiAgICAgIHRocm93X29uX2Vycm9yOiBmYWxzZVxuICAgICAgdGhyb3dfb25fZmFpbDogIGZhbHNlXG4gICAgICBtZXNzYWdlX3dpZHRoOiAgMzAwXG4gICAgICBwcmVmaXg6ICAgICAgICAgJydcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgIyB0aGVzZSBzaG91bGQgYmUgbWl4ZWQtaW4gZnJvbSBgZXF1YWxzX2NmZ2BfXG4gICAgICBvcmRlcmVkX29iamVjdHM6ICBmYWxzZVxuICAgICAgb3JkZXJlZF9zZXRzOiAgICAgZmFsc2VcbiAgICAgIG9yZGVyZWRfbWFwczogICAgIGZhbHNlXG4gICAgICBzaWduZWRfemVybzogICAgICBmYWxzZVxuICBndF9zdGF0czpcbiAgICBmaWVsZHM6XG4gICAgICBwYXNzZXM6ICAgJ2NhcmRpbmFsJ1xuICAgICAgZmFpbHM6ICAgICdjYXJkaW5hbCdcbiAgICB0ZW1wbGF0ZTpcbiAgICAgIHBhc3NlczogICAwXG4gICAgICBmYWlsczogICAgMFxuICBndF90b3RhbHM6ICMjIyBUQUlOVCB1c2UgaW5oZXJpdGFuY2UgdG8gZGVyaXZlIHNoYXJlZCBmaWVsZHMgIyMjXG4gICAgZmllbGRzOlxuICAgICAgcGFzc2VzOiAgICdjYXJkaW5hbCdcbiAgICAgIGZhaWxzOiAgICAnY2FyZGluYWwnXG4gICAgdGVtcGxhdGU6XG4gICAgICBwYXNzZXM6ICAgMFxuICAgICAgZmFpbHM6ICAgIDBcbiAgZXF1YWxzX2NmZzpcbiAgICBmaWVsZHM6XG4gICAgICBvcmRlcmVkX29iamVjdHM6ICAnYm9vbGVhbidcbiAgICAgIG9yZGVyZWRfc2V0czogICAgICdib29sZWFuJ1xuICAgICAgb3JkZXJlZF9tYXBzOiAgICAgJ2Jvb2xlYW4nXG4gICAgICBzaWduZWRfemVybzogICAgICAnYm9vbGVhbidcbiAgICB0ZW1wbGF0ZTpcbiAgICAgIG9yZGVyZWRfb2JqZWN0czogIGZhbHNlXG4gICAgICBvcmRlcmVkX3NldHM6ICAgICBmYWxzZVxuICAgICAgb3JkZXJlZF9tYXBzOiAgICAgZmFsc2VcbiAgICAgIHNpZ25lZF96ZXJvOiAgICAgIGZhbHNlXG4gICMgZ3RfcmVwb3J0X2NmZzpcbiAgIyAgIGZpZWxkczpcbiAgIyAgICAgcHJlZml4OiAgICd0ZXh0J1xuICAjICAgdGVtcGxhdGU6XG4gICMgICAgIHByZWZpeDogICAnJ1xuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIF9Bc3N1bXB0aW9uc1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY29uc3RydWN0b3I6ICggaG9zdCwgdXByZWYgPSBudWxsICkgLT5cbiAgICBoaWRlIEAsICdfJywgaG9zdFxuICAgIGhpZGUgQCwgJ191cHJlZicsIHVwcmVmXG4gICAgaGlkZSBALCAnZXF1YWxzJywgbmFtZWl0ICdlcXVhbHMnLCAoIGEsIGIgKSA9PiBlcXVhbHMgYSwgYiwgQF8uY2ZnXG4gICAgIyBoaWRlIEAsICdwYXNzJywgICAgICAgICBuYW1laXQgJ3Bhc3MnLCAgICAgICAgICAoIFAuLi4gKSA9PiAgICAgICBAX3Bhc3MgICAgICAgICAgUC4uLlxuICAgICMgaGlkZSBALCAnZmFpbCcsICAgICAgICAgbmFtZWl0ICdmYWlsJywgICAgICAgICAgKCBQLi4uICkgPT4gICAgICAgQF9mYWlsICAgICAgICAgIFAuLi5cbiAgICAjIGhpZGUgQCwgJ2VxJywgICAgICAgICAgIG5hbWVpdCAnZXEnLCAgICAgICAgICAgICggUC4uLiApID0+ICAgICAgIEBfZXEgICAgICAgICAgICBQLi4uXG4gICAgIyBoaWRlIEAsICdhc3luY19lcScsICAgICBuYW1laXQgJ2FzeW5jX2VxJywgICAgICAoIFAuLi4gKSA9PiAgICAgICBAX2FzeW5jX2VxICAgICAgUC4uLlxuICAgICMgaGlkZSBALCAndGhyb3dzJywgICAgICAgbmFtZWl0ICd0aHJvd3MnLCAgICAgICAgKCBQLi4uICkgPT4gICAgICAgQF90aHJvd3MgICAgICAgIFAuLi5cbiAgICAjIGhpZGUgQCwgJ2FzeW5jX3Rocm93cycsIG5hbWVpdCAnYXN5bmNfdGhyb3dzJywgICggUC4uLiApID0+IGF3YWl0IEBfYXN5bmNfdGhyb3dzICBQLi4uXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuXG4gICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgcGFzczogKCB1cHJlZiwgY2F0LCBtZXNzYWdlID0gbnVsbCApIC0+XG4gICAgcmVmID0gKCBqIEBfdXByZWYsIHVwcmVmIClcbiAgICBAXy5faW5jcmVtZW50X3Bhc3NlcyByZWZcbiAgICBpZiBAXy5jZmcuc2hvd19wYXNzZXNcbiAgICAgIGlmIG1lc3NhZ2U/XG4gICAgICAgIG1lc3NhZ2UgPSBAX3RvX21lc3NhZ2Vfd2lkdGggbWVzc2FnZVxuICAgICAgICBoZWxwIHJlZiwgY2F0LCByZXZlcnNlIFwiICN7bWVzc2FnZX0gXCJcbiAgICAgIGVsc2VcbiAgICAgICAgaGVscCByZWYsIGNhdFxuICAgIHJldHVybiBudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBmYWlsOiAoIHVwcmVmLCBjYXQsIG1lc3NhZ2UgPSBudWxsICkgLT5cbiAgICByZWYgPSAoIGogQF91cHJlZiwgdXByZWYgKVxuICAgIEBfLl9pbmNyZW1lbnRfZmFpbHMgcmVmXG4gICAgQF8uX3dhcm4gcmVmLCBpZiBtZXNzYWdlPyB0aGVuIFwiKCN7Y2F0fSkgI3ttZXNzYWdlfVwiIGVsc2UgY2F0XG4gICAgaWYgQF8uY2ZnLnNob3dfZmFpbHNcbiAgICAgIGlmIG1lc3NhZ2U/XG4gICAgICAgIG1lc3NhZ2UgPSBAX3RvX21lc3NhZ2Vfd2lkdGggbWVzc2FnZVxuICAgICAgICB3YXJuIHJlZiwgY2F0LCByZXZlcnNlIFwiICN7bWVzc2FnZX0gXCJcbiAgICAgIGVsc2VcbiAgICAgICAgd2FybiByZWYsIGNhdFxuICAgIHJldHVybiBudWxsXG5cbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBlcTogKCBmLCBtYXRjaGVyICkgLT5cbiAgICBzaG9ydHJlZiAgPSBAXy5fcmVmX2Zyb21fZnVuY3Rpb24gZlxuICAgIHJlZiAgICAgICA9ICggaiBAX3VwcmVmLCBzaG9ydHJlZiApXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB0cnkgKCByZXN1bHQgPSBmLmNhbGwgQCwgQCApIGNhdGNoIGVycm9yXG4gICAgICBtZXNzYWdlID0gXCJleHBlY3RlZCBhIHJlc3VsdCBidXQgZ290IGFuIGFuIGVycm9yOiAje3JwciBlcnJvci5tZXNzYWdlfVwiXG4gICAgICBAZmFpbCBzaG9ydHJlZiwgJ2Vycm9yJywgbWVzc2FnZVxuICAgICAgaWYgQF8uY2ZnLnRocm93X29uX2Vycm9yXG4gICAgICAgIGVycm9yLm1lc3NhZ2UgPSBtZXNzYWdlOyB0aHJvdyBlcnJvclxuICAgICAgcmV0dXJuIG51bGxcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHJldHVybiBAcGFzcyBzaG9ydHJlZiwgJ2VxJyBpZiBAZXF1YWxzIHJlc3VsdCwgbWF0Y2hlclxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgd2FybiByZWYsICggcmV2ZXJzZSAnIG5lcSAnICksIFwicmVzdWx0OiAgICAgXCIsICggcmV2ZXJzZSAnICcgKyAoIHJwciByZXN1bHQgICApICsgJyAnIClcbiAgICB3YXJuIHJlZiwgKCByZXZlcnNlICcgbmVxICcgKSwgXCJtYXRjaGVyOiAgICBcIiwgKCByZXZlcnNlICcgJyArICggcnByIG1hdGNoZXIgICkgKyAnICcgKVxuICAgIEBmYWlsIHNob3J0cmVmLCAnbmVxJ1xuICAgIHRocm93IG5ldyBFcnJvciBcIm5lcTpcXG5yZXN1bHQ6ICAgICAje3JwciByZXN1bHR9XFxubWF0Y2hlcjogICAgI3ttYXRjaGVyfVwiIGlmIEBfLmNmZy50aHJvd19vbl9mYWlsXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICByZXR1cm4gbnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgYXN5bmNfZXE6ICggZiwgbWF0Y2hlciApIC0+XG4gICAgc2hvcnRyZWYgID0gQF8uX3JlZl9mcm9tX2Z1bmN0aW9uIGZcbiAgICByZWYgICAgICAgPSAoIGogQF91cHJlZiwgc2hvcnRyZWYgKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgdHJ5ICggcmVzdWx0ID0gYXdhaXQgZi5jYWxsIEAsIEAgKSBjYXRjaCBlcnJvclxuICAgICAgbWVzc2FnZSA9IFwiZXhwZWN0ZWQgYSByZXN1bHQgYnV0IGdvdCBhbiBhbiBlcnJvcjogI3tycHIgZXJyb3IubWVzc2FnZX1cIlxuICAgICAgQGZhaWwgc2hvcnRyZWYsICdlcnJvcicsIG1lc3NhZ2VcbiAgICAgIGlmIEBfLmNmZy50aHJvd19vbl9lcnJvclxuICAgICAgICBlcnJvci5tZXNzYWdlID0gbWVzc2FnZTsgdGhyb3cgZXJyb3JcbiAgICAgIHJldHVybiBudWxsXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICByZXR1cm4gQHBhc3Mgc2hvcnRyZWYsICdlcScgaWYgQGVxdWFscyByZXN1bHQsIG1hdGNoZXJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHdhcm4gcmVmLCAoIHJldmVyc2UgJyBuZXEgJyApLCBcInJlc3VsdDogICAgIFwiLCAoIHJldmVyc2UgJyAnICsgKCBycHIgcmVzdWx0ICAgKSArICcgJyApXG4gICAgd2FybiByZWYsICggcmV2ZXJzZSAnIG5lcSAnICksIFwibWF0Y2hlcjogICAgXCIsICggcmV2ZXJzZSAnICcgKyAoIHJwciBtYXRjaGVyICApICsgJyAnIClcbiAgICBAZmFpbCBzaG9ydHJlZiwgJ25lcSdcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJuZXE6XFxucmVzdWx0OiAgICAgI3tycHIgcmVzdWx0fVxcbm1hdGNoZXI6ICAgICN7bWF0Y2hlcn1cIiBpZiBAXy5jZmcudGhyb3dfb25fZmFpbFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcmV0dXJuIG51bGxcblxuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIHRocm93czogKCBmLCBtYXRjaGVyICkgLT5cbiAgICBzaG9ydHJlZiAgPSBAXy5fcmVmX2Zyb21fZnVuY3Rpb24gZlxuICAgIHJlZiAgICAgICA9ICggaiBAX3VwcmVmLCBzaG9ydHJlZiApXG4gICAgZXJyb3IgICAgID0gbnVsbFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgdHJ5ICggdXJnZSAoIGogQF91cHJlZiwgc2hvcnRyZWYsICfOqWd0X19fMScgKSwgXCJgdGhyb3dzKClgIHJlc3VsdCBvZiBjYWxsOlwiLCBycHIgZi5jYWxsIEAsIEAgKSBjYXRjaCBlcnJvclxuICAgICAgdW5sZXNzIG1hdGNoZXI/XG4gICAgICAgIEBwYXNzIHNob3J0cmVmLCAnZXJyb3Igb2snLCBlcnJvci5tZXNzYWdlXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHN3aXRjaCBtYXRjaGVyX3R5cGUgPSBAXy5fbWF0Y2hfZXJyb3IgZXJyb3IsIG1hdGNoZXJcbiAgICAgICAgd2hlbiB0cnVlXG4gICAgICAgICAgQHBhc3Mgc2hvcnRyZWYsICdlcnJvciBvaycsIGVycm9yLm1lc3NhZ2VcbiAgICAgICAgd2hlbiBmYWxzZVxuICAgICAgICAgIHVyZ2UgKCBqIEBfdXByZWYsIHNob3J0cmVmLCAnzqlndF9fXzInICksIFwiZXJyb3IgICAgICAgIFwiLCByZXZlcnNlIGVycm9yLm1lc3NhZ2UgICMjIyBUQUlOVCB0byBiZSByZXBsYWNlZCAjIyNcbiAgICAgICAgICB3YXJuICggaiBAX3VwcmVmLCBzaG9ydHJlZiwgJ86pZ3RfX18zJyApLCBcImRvZXNuJ3QgbWF0Y2hcIiwgcmV2ZXJzZSBycHIgbWF0Y2hlciAgICAjIyMgVEFJTlQgdG8gYmUgcmVwbGFjZWQgIyMjXG4gICAgICAgICAgQGZhaWwgc2hvcnRyZWYsICduZXEnLCBcImVycm9yICN7cnByIGVycm9yLm1lc3NhZ2V9IGRvZXNuJ3QgbWF0Y2ggI3tycHIgbWF0Y2hlcn1cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGZhaWwgc2hvcnRyZWYsICd0eXBlJywgXCJleHBlY3RlZCBhIHJlZ2V4IG9yIGEgdGV4dCwgZ290IGEgI3ttYXRjaGVyX3R5cGV9XCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHVubGVzcyBlcnJvcj9cbiAgICAgIEBmYWlsIHNob3J0cmVmLCAnbm9lcnInLCBcImV4cGVjdGVkIGFuIGVycm9yIGJ1dCBub25lIHdhcyB0aHJvd25cIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcmV0dXJuIG51bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGFzeW5jX3Rocm93czogKCBmLCBtYXRjaGVyICkgLT4gIyBuZXcgUHJvbWlzZSAoIHJlc29sdmUsIHJlamVjdCApID0+XG4gICAgIyMjXG5cbiAgICAqIG5lZWRzIGBmYCB0byBiZSBhbiBgYXN5bmNmdW5jdGlvbmAgKGFsdGhvdWdoIGBmdW5jdGlvbmAgd2lsbCBhbHNvIHdvcms/IGJldHRlciBjaGVjayBhbnl3YXk/KVxuICAgICogdXNlcyBgdHJ5YCAvIGBleGNlcHRgIGNsYXVzZSB0byBgYXdhaXRgIGByZXN1bHRgIG9mIGNhbGxpbmcgYGZgXG4gICAgKiBpbiBjYXNlIGByZXN1bHRgIGlzIGRlbGl2ZXJlZCwgdGhhdCdzIGFuIGVycm9yXG4gICAgKiBvdGhlcndpc2UgYW4gYGVycm9yYCB3aWxsIGJlIGNhdWdodDtcbiAgICAgICogc3VjY2VzcyB3aGVuIGBtYXRjaGVyYCBpcyBtaXNzaW5nLCBvciBlbHNlLCB3aGVuIGBtYXRjaGVyYCBkZXNjcmliZXMgYGVycm9yLm1lc3NhZ2VgO1xuICAgICAgKiBmYWlsdXJlIG90aGVyd2lzZVxuXG4gICAgIyMjXG4gICAgIyMjIFRBSU5UIGNoZWNrIHdoZXRoZXIgYGZgIGlzIGBhc3luY2Z1bmN0aW9uYD8gIyMjXG4gICAgc2hvcnRyZWYgID0gQF8uX3JlZl9mcm9tX2Z1bmN0aW9uIGZcbiAgICByZWYgICAgICAgPSAoIGogQF91cHJlZiwgc2hvcnRyZWYgKVxuICAgIGVycm9yICAgICA9IG51bGxcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHRyeVxuICAgICAgcmVzdWx0ID0gYXdhaXQgZi5jYWxsIEAsIEBcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGNhdGNoIGVycm9yXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHVubGVzcyBtYXRjaGVyP1xuICAgICAgICBAcGFzcyBzaG9ydHJlZiwgJ2Vycm9yIG9rJywgXCJkaWQgdGhyb3cgI3tycHIgZXJyb3IubWVzc2FnZX1cIlxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzd2l0Y2ggbWF0Y2hlcl90eXBlID0gQF8uX21hdGNoX2Vycm9yIGVycm9yLCBtYXRjaGVyXG4gICAgICAgIHdoZW4gdHJ1ZVxuICAgICAgICAgIEBwYXNzIHNob3J0cmVmLCAnZXJyb3Igb2snLCBcImRpZCB0aHJvdyAje3JwciBlcnJvci5tZXNzYWdlfVwiXG4gICAgICAgIHdoZW4gZmFsc2VcbiAgICAgICAgICB1cmdlIFwiI3tyZWZ9Ls6pZ3RfX180IGVycm9yICAgICAgICBcIiwgcmV2ZXJzZSBlcnJvci5tZXNzYWdlXG4gICAgICAgICAgd2FybiBcIiN7cmVmfS7OqWd0X19fNSBkb2Vzbid0IG1hdGNoXCIsIHJldmVyc2UgcnByIG1hdGNoZXJcbiAgICAgICAgICBAZmFpbCBzaG9ydHJlZiwgJ2Vycm9yIG5vaycsIFwiZGlkIHRocm93IGJ1dCBub3QgbWF0Y2ggI3tycHIgZXJyb3IubWVzc2FnZX1cIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGZhaWwgc2hvcnRyZWYsICdmYWlsJywgXCJleHBlY3RlZCBhIHJlZ2V4IG9yIGEgdGV4dCBmb3IgbWF0Y2hlciwgZ290IGEgI3ttYXRjaGVyX3R5cGV9XCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHVubGVzcyBlcnJvcj9cbiAgICAgIEBmYWlsIHNob3J0cmVmLCAnbWlzc2luZycsIFwiZXhwZWN0ZWQgYW4gZXJyb3IgYnV0IG5vbmUgd2FzIHRocm93biwgaW5zdGVhZCBnb3QgcmVzdWx0ICN7cnByIHJlc3VsdH1cIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcmV0dXJuIG51bGxcblxuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIF9tYXRjaF9lcnJvcjogKCBlcnJvciwgbWF0Y2hlciApIC0+XG4gICAgc3dpdGNoIG1hdGNoZXJfdHlwZSA9IHR5cGVfb2YgbWF0Y2hlclxuICAgICAgd2hlbiAndGV4dCdcbiAgICAgICAgcmV0dXJuIGVycm9yLm1lc3NhZ2UgaXMgbWF0Y2hlclxuICAgICAgd2hlbiAncmVnZXgnXG4gICAgICAgIG1hdGNoZXIubGFzdEluZGV4ID0gMFxuICAgICAgICByZXR1cm4gbWF0Y2hlci50ZXN0IGVycm9yLm1lc3NhZ2VcbiAgICByZXR1cm4gbWF0Y2hlcl90eXBlXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfdG9fbWVzc2FnZV93aWR0aDogKCBtZXNzYWdlICkgLT4gKCB0b193aWR0aCBtZXNzYWdlLCBAXy5jZmcubWVzc2FnZV93aWR0aCApLnRyaW1FbmQoKVxuXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBUZXN0IGV4dGVuZHMgX0Fzc3VtcHRpb25zXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdHJ1Y3RvcjogKCBjZmcgKSAtPlxuICAgIHN1cGVyIG51bGw7IEBfID0gQFxuICAgIEBjZmcgPSBPYmplY3QuZnJlZXplIGNyZWF0ZS5ndF90ZXN0X2NmZyBjZmdcbiAgICBAdG90YWxzID0gY3JlYXRlLmd0X3RvdGFscygpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBoaWRlIEAsICd0ZXN0JywgICAgICAgICBuYW1laXQgJ3Rlc3QnLCAgICAgICAgICAoIFAuLi4gKSA9PiAgICAgICBAX3Rlc3QgICAgICAgICAgUC4uLlxuICAgIGhpZGUgQCwgJ2FzeW5jX3Rlc3QnLCAgIG5hbWVpdCAnYXN5bmNfdGVzdCcsICAgICggUC4uLiApID0+IGF3YWl0IEBfYXN5bmNfdGVzdCAgICBQLi4uXG4gICAgaGlkZSBALCAncmVwb3J0JywgICAgICAgbmFtZWl0ICdyZXBvcnQnLCAgICAgICAgKCBQLi4uICkgPT4gICAgICAgQF9yZXBvcnQgICAgICAgIFAuLi5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGhpZGUgQCwgJ19LV190ZXN0X3JlZicsICAgICAgICAgICAgICAgICAgICAgICAgICAgICfilojilohfS1dfdGVzdF9yZWYnXG4gICAgaGlkZSBALCAnc3RhdHMnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyAnKic6IEB0b3RhbHMsIH1cbiAgICBoaWRlIEAsICd3YXJuaW5ncycsICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7fVxuICAgIHJldHVybiB1bmRlZmluZWRcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF90ZXN0OiAoIHRlc3RzLi4uICkgLT5cbiAgICBAX3Rlc3RfaW5uZXIgbnVsbCwgdGVzdHMuLi5cbiAgICBAcmVwb3J0KCkgaWYgQGNmZy5zaG93X3JlcG9ydFxuICAgIHByb2Nlc3MuZXhpdENvZGUgPSA5OSBpZiBAdG90YWxzLmZhaWxzIGlzbnQgMFxuICAgIHJldHVybiBAc3RhdHNcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9hc3luY190ZXN0OiAoIHRlc3RzLi4uICkgLT5cbiAgICBhd2FpdCBAX2FzeW5jX3Rlc3RfaW5uZXIgbnVsbCwgdGVzdHMuLi5cbiAgICBAcmVwb3J0KCkgaWYgQGNmZy5zaG93X3JlcG9ydFxuICAgIHByb2Nlc3MuZXhpdENvZGUgPSA5OSBpZiBAdG90YWxzLmZhaWxzIGlzbnQgMFxuICAgIHJldHVybiBAc3RhdHNcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF90ZXN0X2lubmVyOiAoIHVwcmVmLCB0ZXN0cy4uLiApIC0+XG4gICAgIyMjIFRBSU5UIHByZWxpbWluYXJ5IGhhbmRsaW5nIG9mIGFyZ3VtZW50cyAjIyNcbiAgICBmb3IgY2FuZGlkYXRlIGluIHRlc3RzIHRoZW4gc3dpdGNoIHRydWVcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgd2hlbiBpc2EuZnVuY3Rpb24gY2FuZGlkYXRlXG4gICAgICAgIHRyeVxuICAgICAgICAgIGN0eCA9IG5ldyBfQXNzdW1wdGlvbnMgQCwgdXByZWZcbiAgICAgICAgICBjYW5kaWRhdGUuY2FsbCBjdHgsIGN0eFxuICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgICMgcmVmICAgICA9ICggaiB1cHJlZiwgJ86pZ3RfX182JyApXG4gICAgICAgICAgcmVmICAgICA9IHVwcmVmXG4gICAgICAgICAgbWVzc2FnZSA9IFwiYW4gdW5leHBlY3RlZCBlcnJvciBvY2N1cnJlZCB3aGVuIGNhbGxpbmcgdGFzayAje3JwciByZWZ9OyAje3JwciBlcnJvci5tZXNzYWdlfVwiXG4gICAgICAgICAgQGZhaWwgcmVmLCAnZXJyb3InLCBtZXNzYWdlXG4gICAgICAgICAgaWYgQGNmZy50aHJvd19vbl9lcnJvclxuICAgICAgICAgICAgZXJyb3IubWVzc2FnZSA9IG1lc3NhZ2U7IHRocm93IGVycm9yXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHdoZW4gaXNhLm9iamVjdCBjYW5kaWRhdGVcbiAgICAgICAgZm9yIGtleSwgcHJvcGVydHkgb2YgY2FuZGlkYXRlXG4gICAgICAgICAgQF90ZXN0X2lubmVyICggaiB1cHJlZiwga2V5ICksIHByb3BlcnR5XG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHdoZW4gbm90IGNhbmRpZGF0ZT9cbiAgICAgICAgIyByZWYgICAgID0gKCBqIHVwcmVmLCAnzqlndF9fXzcnIClcbiAgICAgICAgcmVmICAgICA9IHVwcmVmXG4gICAgICAgIEBmYWlsIHJlZiwgJ21pc3NpbmcnLCBcImV4cGVjdGVkIGEgdGVzdCwgZ290IGEgI3t0eXBlX29mIGNhbmRpZGF0ZX1cIlxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBlbHNlXG4gICAgICAgIHJlZiA9ICggaiB1cHJlZiwgQF9yZWZfZnJvbV9mdW5jdGlvbiBjYW5kaWRhdGUgKVxuICAgICAgICBAZmFpbCByZWYsICd0eXBlJywgXCJleHBlY3RlZCBhIHRlc3QsIGdvdCBhICN7dHlwZV9vZiBjYW5kaWRhdGV9XCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHJldHVybiBudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfYXN5bmNfdGVzdF9pbm5lcjogKCB1cHJlZiwgdGVzdHMuLi4gKSAtPlxuICAgIGZvciBjYW5kaWRhdGUgaW4gdGVzdHMgdGhlbiBzd2l0Y2ggdHJ1ZVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB3aGVuIGlzYS5mdW5jdGlvbiBjYW5kaWRhdGVcbiAgICAgICAgYXdhaXQgQF90ZXN0X2lubmVyIHVwcmVmLCBjYW5kaWRhdGVcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgd2hlbiBpc2EuYXN5bmNmdW5jdGlvbiBjYW5kaWRhdGVcbiAgICAgICAgdHJ5XG4gICAgICAgICAgY3R4ID0gbmV3IF9Bc3N1bXB0aW9ucyBALCB1cHJlZlxuICAgICAgICAgIGF3YWl0IGNhbmRpZGF0ZS5jYWxsIGN0eCwgY3R4XG4gICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgcmVmICAgICA9ICggaiB1cHJlZiwgJ86pZ3RfX184JyApXG4gICAgICAgICAgbWVzc2FnZSA9IFwiYW4gdW5leHBlY3RlZCBlcnJvciBvY2N1cnJlZCB3aGVuIGNhbGxpbmcgdGFzayAje3JwciByZWZ9OyAje3JwciBlcnJvci5tZXNzYWdlfVwiXG4gICAgICAgICAgQGZhaWwgcmVmLCAnZXJyb3InLCBtZXNzYWdlXG4gICAgICAgICAgaWYgQGNmZy50aHJvd19vbl9lcnJvclxuICAgICAgICAgICAgZXJyb3IubWVzc2FnZSA9IG1lc3NhZ2U7IHRocm93IGVycm9yXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHdoZW4gaXNhLm9iamVjdCBjYW5kaWRhdGVcbiAgICAgICAgZm9yIGtleSwgcHJvcGVydHkgb2YgY2FuZGlkYXRlXG4gICAgICAgICAgYXdhaXQgQF9hc3luY190ZXN0X2lubmVyICggaiB1cHJlZiwga2V5ICksIHByb3BlcnR5XG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIGVsc2VcbiAgICAgICAgcmVmID0gKCBqIHVwcmVmLCBAX3JlZl9mcm9tX2Z1bmN0aW9uIGNhbmRpZGF0ZSApXG4gICAgICAgIEBmYWlsIHJlZiwgJ3R5cGUnLCBcImV4cGVjdGVkIGEgdGVzdCwgZ290IGEgI3t0eXBlX29mIGNhbmRpZGF0ZX1cIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcmV0dXJuIG51bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9yZXBvcnQ6IC0+XG4gICAgeyBibHVlXG4gICAgICByZWRcbiAgICAgIGdvbGQgICAgfSA9IEdVWS50cm1cbiAgICBsaW5lICAgICAgICA9IGdvbGQgJ+KAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlOKAlCdcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHNob3dfdG90YWxzID0gPT5cbiAgICAgIHdoaXNwZXIgJ86pZ3RfX185ICcgKyBAY2ZnLnByZWZpeCwgbGluZVxuICAgICAgd2hpc3BlciAnzqlndF9fMTAgJyArIEBjZmcucHJlZml4LCByZXZlcnNlIEdVWS50cm1bIGNvbG9yIF0gKCAnKicucGFkRW5kIDIwICksIEB0b3RhbHNcbiAgICAgIHdoaXNwZXIgJ86pZ3RfXzExICcgKyBAY2ZnLnByZWZpeCwgbGluZVxuICAgICAgcmV0dXJuIG51bGxcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHdoaXNwZXIoKVxuICAgIHdoaXNwZXIgJ86pZ3RfXzEyICcgKyBAY2ZnLnByZWZpeCwgbGluZVxuICAgIHdoaXNwZXIgJ86pZ3RfXzEzICcgKyBAY2ZnLnByZWZpeCwgZ29sZCAnICAgICAgICAgICAgICAgICAgICAgICAg8J+ZpCAgR1VZIFRFU1Qg8J+ZpidcbiAgICBjb2xvciA9IGlmIEB0b3RhbHMuZmFpbHMgaXMgMCB0aGVuICdsaW1lJyBlbHNlICdyZWQnXG4gICAgaWYgQGNmZy5yZXBvcnRfY2hlY2tzXG4gICAgICB3aGlzcGVyICfOqWd0X18xNCAnICsgQGNmZy5wcmVmaXgsIGxpbmVcbiAgICAgIGZvciBrZXksIHN0YXRzIG9mIEBzdGF0c1xuICAgICAgICBjb250aW51ZSBpZiBrZXkgaXMgJyonXG4gICAgICAgIHdoaXNwZXIgJ86pZ3RfXzE1ICcgKyBAY2ZnLnByZWZpeCwgYmx1ZSAoIGtleS5wYWRFbmQgMjAgKSwgc3RhdHNcbiAgICBzaG93X3RvdGFscygpXG4gICAgcmVwZWF0X3RvdGFscyA9IGZhbHNlXG4gICAgZm9yIHN1Yl9yZWYsIG1lc3NhZ2VzIG9mIEB3YXJuaW5nc1xuICAgICAgcmVwZWF0X3RvdGFscyA9IHRydWVcbiAgICAgIGZvciBtZXNzYWdlIGluIG1lc3NhZ2VzXG4gICAgICAgIHdoaXNwZXIgJ86pZ3RfXzE2ICcgKyBAY2ZnLnByZWZpeCwgKCByZWQgc3ViX3JlZiApLCByZXZlcnNlIHJlZCBcIiAje21lc3NhZ2V9IFwiXG4gICAgc2hvd190b3RhbHMoKSBpZiByZXBlYXRfdG90YWxzXG4gICAgd2hpc3BlcigpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICByZXR1cm4gQHN0YXRzXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfaW5jcmVtZW50X3Bhc3NlczogICggY2hlY2tfcmVmICkgLT4gQF9pbmNyZW1lbnQgJ3Bhc3NlcycsIGNoZWNrX3JlZlxuICBfaW5jcmVtZW50X2ZhaWxzOiAgICggY2hlY2tfcmVmICkgLT4gQF9pbmNyZW1lbnQgJ2ZhaWxzJywgIGNoZWNrX3JlZlxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX2luY3JlbWVudDogKCBwYXNzX29yX2ZhaWwsIGNoZWNrX3JlZiApIC0+XG4gICAgcGVyX2NoZWNrX3N0YXRzID0gQHN0YXRzWyBjaGVja19yZWYgXSA/PSBjcmVhdGUuZ3Rfc3RhdHMoKVxuICAgIHBlcl9jaGVja19zdGF0c1sgIHBhc3Nfb3JfZmFpbCBdKytcbiAgICBAdG90YWxzWyAgICAgICAgICBwYXNzX29yX2ZhaWwgXSsrXG4gICAgcmV0dXJuIG51bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF93YXJuOiAoIHJlZiwgbWVzc2FnZSApIC0+XG4gICAgKCBAd2FybmluZ3NbIHJlZiBdID89IFtdICkucHVzaCAoIG1lc3NhZ2UgPyAnLi8uJyApXG4gICAgcmV0dXJuIG51bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9yZWZfZnJvbV9mdW5jdGlvbjogKCBmICkgLT5cbiAgICBSID0gJ2Fub24nIGlmICggUiA9IGYubmFtZSApIGlzICcnXG4gICAgIyB0aHJvdyBuZXcgRXJyb3IgXCJeOTkyLTFeIHRlc3QgbWV0aG9kIHNob3VsZCBiZSBuYW1lZCwgZ290ICN7cnByIGZ9XCIgaWYgKCBSID0gZi5uYW1lICkgaXMgJydcbiAgICByZXR1cm4gUlxuXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIFNFVCBFUVVBTElUWSBCWSBWQUxVRVxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5lcXVhbHMgPSAoIGEsIGIsIGNmZyApIC0+XG4gIGNmZyA9IF9jcmVhdGVfZXF1YWxzX2NmZyBjZmdcbiAgIyMjIE5PVEUgdGhlc2UgY29tcGFyaXNvbnMgZGlzcmVnYXJkIHNpZ24gb2YgemVybyAjIyNcbiAgcmV0dXJuIHRydWUgaWYgKCBub3QgY2ZnLnNpZ25lZF96ZXJvICkgYW5kICggYSBpcyAwICkgYW5kICggYiBpcyAwIClcbiAgcmV0dXJuIGZhbHNlIHVubGVzcyAoIHR5cGVfb2ZfYSA9IHR5cGVfb2YgYSApIGlzICggdHlwZV9vZiBiIClcbiAgaWYgKCB0eXBlX29mX2EgaXMgJ3NldCcgKVxuICAgIHJldHVybiBfb3JkZXJlZF9zZXRzX29yX21hcHNfYXJlX2VxdWFsICAgIGEsIGIsIGNmZyBpZiBjZmcub3JkZXJlZF9zZXRzXG4gICAgcmV0dXJuIF91bm9yZGVyZWRfc2V0c19vcl9tYXBzX2FyZV9lcXVhbCAgYSwgYiwgY2ZnXG4gIGlmICggdHlwZV9vZl9hIGlzICdtYXAnIClcbiAgICByZXR1cm4gX29yZGVyZWRfc2V0c19vcl9tYXBzX2FyZV9lcXVhbCAgICBhLCBiLCBjZmcgaWYgY2ZnLm9yZGVyZWRfbWFwc1xuICAgIHJldHVybiBfdW5vcmRlcmVkX3NldHNfb3JfbWFwc19hcmVfZXF1YWwgIGEsIGIsIGNmZ1xuICBSID0gX2prZXF1YWxzIGEsIGJcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjIyMgVEFJTlQgdGhpcyByZXBlYXRzIHdvcmsgYWxyZWFkeSBkb25lIGJ5IF9qa2VxdWFscyBhbmQgc2hvdWxkIGJlIGltcGxlbWVudGVkIGluIHRoYXQgbW9kdWxlICMjI1xuICBpZiBSIGFuZCBjZmcub3JkZXJlZF9vYmplY3RzIGFuZCAoIF9qa3R5cGVvZiBhICkgaXMgJ29iamVjdCdcbiAgICByZXR1cm4gX2prZXF1YWxzICggayBmb3IgayBvZiBhIHdoZW4gayBpc250ICdjb25zdHJ1Y3RvcicgKSwgKCBrIGZvciBrIG9mIGIgd2hlbiBrIGlzbnQgJ2NvbnN0cnVjdG9yJyApXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuIFJcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuX3NldF9vcl9tYXBfY29udGFpbnMgPSAoIHNldF9vcl9tYXAsIGVsZW1lbnQsIGNmZyApIC0+XG4gIGZvciBlbGVtZW50XzIgZnJvbSBzZXRfb3JfbWFwXG4gICAgaWYgZXF1YWxzIGVsZW1lbnRfMiwgZWxlbWVudCwgY2ZnXG4gICAgICByZXR1cm4gdHJ1ZVxuICByZXR1cm4gZmFsc2VcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuX29yZGVyZWRfc2V0c19vcl9tYXBzX2FyZV9lcXVhbCA9ICggYSwgYiwgY2ZnICkgLT5cbiAgIyMjIFRBSU5UIG9ubHkgdXNlIGlmIGJvdGggYSwgYiBoYXZlIHNhbWUgdHlwZSBhbmQgdHlwZSBpcyBgc2V0YCBvciBgbWFwYCAjIyNcbiAgcmV0dXJuIGZhbHNlIHVubGVzcyBhLnNpemUgaXMgYi5zaXplXG4gIGlkeCA9IC0xXG4gIGVudHJpZXNfb2ZfYiA9IFsgYi4uLiwgXVxuICBmb3IgZWxlbWVudCBmcm9tIGFcbiAgICBpZHgrK1xuICAgIHJldHVybiBmYWxzZSB1bmxlc3MgZXF1YWxzIGVsZW1lbnQsIGVudHJpZXNfb2ZfYlsgaWR4IF0sIGNmZ1xuICByZXR1cm4gdHJ1ZVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5fdW5vcmRlcmVkX3NldHNfb3JfbWFwc19hcmVfZXF1YWwgPSAoIGEsIGIsIGNmZyApIC0+XG4gICMjIyBUQUlOVCBvbmx5IHVzZSBpZiBib3RoIGEsIGIgaGF2ZSBzYW1lIHR5cGUgYW5kIHR5cGUgaXMgYHNldGAgb3IgYG1hcGAgIyMjXG4gIHJldHVybiBmYWxzZSB1bmxlc3MgYS5zaXplIGlzIGIuc2l6ZVxuICBmb3IgZWxlbWVudCBmcm9tIGFcbiAgICByZXR1cm4gZmFsc2UgdW5sZXNzIF9zZXRfb3JfbWFwX2NvbnRhaW5zIGIsIGVsZW1lbnQsIGNmZ1xuICByZXR1cm4gdHJ1ZVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5fY3JlYXRlX2VxdWFsc19jZmcgPSAoIGNmZyApIC0+XG4gIHJldHVybiBSIGlmICggUiA9IF9rbm93bl9lcXVhbHNfY2Zncy5nZXQgY2ZnICk/XG4gIF9rbm93bl9lcXVhbHNfY2Zncy5zZXQgY2ZnLCBSID0gY3JlYXRlLmVxdWFsc19jZmcgY2ZnXG4gIHJldHVybiBSXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbl9rbm93bl9lcXVhbHNfY2ZncyA9IG5ldyBNYXAoKVxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxubW9kdWxlLmV4cG9ydHMgPSB7IFRlc3QsIF9Bc3N1bXB0aW9ucywgZXF1YWxzLCBfdHlwZXM6IHR5cGVzLCB9XG4iXX0=
//# sourceURL=../src/main.coffee