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
              if (key.startsWith('_')) {
                this._warn('Ωgt___7', `skipped ${key}`);
                continue;
              }
              this._test_inner(j(upref, key), property);
            }
            break;
          //.....................................................................................................
          case candidate == null:
            // ref     = ( j upref, 'Ωgt___8' )
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
              ref = j(upref, 'Ωgt___9');
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
        whisper('Ωgt__10 ' + this.cfg.prefix, line);
        whisper('Ωgt__11 ' + this.cfg.prefix, reverse(GUY.trm[color]('*'.padEnd(20), this.totals)));
        whisper('Ωgt__12 ' + this.cfg.prefix, line);
        return null;
      };
      //.......................................................................................................
      whisper();
      whisper('Ωgt__13 ' + this.cfg.prefix, line);
      whisper('Ωgt__14 ' + this.cfg.prefix, gold('                        🙤  GUY TEST 🙦'));
      color = this.totals.fails === 0 ? 'lime' : 'red';
      if (this.cfg.report_checks) {
        whisper('Ωgt__15 ' + this.cfg.prefix, line);
        ref1 = this.stats;
        for (key in ref1) {
          stats = ref1[key];
          if (key === '*') {
            continue;
          }
          whisper('Ωgt__16 ' + this.cfg.prefix, blue(key.padEnd(20), stats));
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
          whisper('Ωgt__17 ' + this.cfg.prefix, red(sub_ref), reverse(red(` ${message} `)));
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

  // #===========================================================================================================
  // # SET EQUALITY BY VALUE
  // #-----------------------------------------------------------------------------------------------------------
  // _equals = ( require 'node:util' ).isDeepStrictEqual
  // equals = ( a, b, cfg ) ->
  //   cfg = _create_equals_cfg cfg
  //   ### NOTE these comparisons disregard sign of zero ###
  //   return true if ( not cfg.signed_zero ) and ( a is 0 ) and ( b is 0 )
  //   return false unless ( type_of_a = type_of a ) is ( type_of b )
  //   return _equals a, b

  //===========================================================================================================
  module.exports = {
    Test,
    _Assumptions,
    equals,
    _types: types
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLEdBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLEVBQUEsRUFBQSxZQUFBLEVBQUEsa0JBQUEsRUFBQSxTQUFBLEVBQUEsU0FBQSxFQUFBLGtCQUFBLEVBQUEsK0JBQUEsRUFBQSxvQkFBQSxFQUFBLGlDQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxRQUFBLEVBQUEsT0FBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLElBQUEsRUFBQTs7RUFFQSxHQUFBLEdBQTRCLE9BQUEsQ0FBUSxLQUFSOztFQUM1QixDQUFBLENBQUUsS0FBRixFQUNFLEtBREYsRUFFRSxJQUZGLEVBR0UsSUFIRixFQUlFLEtBSkYsRUFLRSxNQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxPQVJGLENBQUEsR0FRNEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFSLENBQW9CLElBQXBCLENBUjVCOztFQVNBLENBQUEsQ0FBRSxHQUFGLEVBQ0UsT0FERixFQUVFLElBRkYsRUFHRSxPQUhGLEVBSUUsR0FKRixDQUFBLEdBSTRCLEdBQUcsQ0FBQyxHQUpoQzs7RUFLQSxDQUFBLENBQUUsU0FBRixDQUFBLEdBQTRCLE9BQUEsQ0FBUSxXQUFSLENBQTVCOztFQUNBLFNBQUEsR0FBNEIsT0FBQSxDQUFRLHVCQUFSOztFQUM1QixTQUFBLEdBQTRCLE9BQUEsQ0FBUSxxQkFBUjs7RUFDNUIsQ0FBQSxDQUFFLElBQUYsQ0FBQSxHQUE0QixH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LEdBQWlCO0lBQUUsSUFBRjtJQUFRLFlBQVI7SUFBc0IsTUFBdEI7SUFBOEIsTUFBQSxFQUFRO0VBQXRDO0FBcGVqQiIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4ndXNlIHN0cmljdCdcblxuR1VZICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2d1eSdcbnsgYWxlcnRcbiAgZGVidWdcbiAgaGVscFxuICBpbmZvXG4gIHBsYWluXG4gIHByYWlzZVxuICB1cmdlXG4gIHdhcm5cbiAgd2hpc3BlciB9ICAgICAgICAgICAgICAgPSBHVVkudHJtLmdldF9sb2dnZXJzICdHVCdcbnsgcnByXG4gIGluc3BlY3RcbiAgZWNob1xuICByZXZlcnNlXG4gIGxvZyAgICAgfSAgICAgICAgICAgICAgID0gR1VZLnRybVxueyBJbnRlcnR5cGUgfSAgICAgICAgICAgICA9IHJlcXVpcmUgJ2ludGVydHlwZSdcbl9qa2VxdWFscyAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi9kZXBzL2prcm9zby1lcXVhbHMnXG5famt0eXBlb2YgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vZGVwcy9qa3Jvc28tdHlwZSdcbnsgaGlkZSB9ICAgICAgICAgICAgICAgICAgPSBHVVkucHJvcHNcbldHICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICd3ZWJndXknXG57IG5hbWVpdCB9ICAgICAgICAgICAgICAgID0gV0cucHJvcHNcbnsgdG9fd2lkdGggfSAgICAgICAgICAgICAgPSByZXF1aXJlICd0by13aWR0aCdcbmogICAgICAgICAgICAgICAgICAgICAgICAgPSAoIFAuLi4gKSAtPiAoIGNydW1iIGZvciBjcnVtYiBpbiBQIHdoZW4gY3J1bWI/ICkuam9pbiAnLidcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbnR5cGVzICAgICAgICAgICAgICAgICAgICAgPSBuZXcgSW50ZXJ0eXBlXG57IGlzYVxuICB0eXBlX29mXG4gIHZhbGlkYXRlXG4gIGNyZWF0ZSAgICAgICAgICAgICAgICB9ID0gdHlwZXNcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxudHlwZXMuZGVjbGFyZVxuICBndF9tZXNzYWdlX3dpZHRoOlxuICAgIHRlc3Q6ICAgICAgICAgICAgICggeCApIC0+ICggQGlzYS5jYXJkaW5hbCB4ICkgYW5kIHggPiAyXG4gIGd0X3Rlc3RfY2ZnOlxuICAgIGZpZWxkczpcbiAgICAgIGF1dG9fcmVzZXQ6ICAgICAnYm9vbGVhbidcbiAgICAgIHNob3dfcmVwb3J0OiAgICAnYm9vbGVhbidcbiAgICAgIHJlcG9ydF9jaGVja3M6ICAnYm9vbGVhbidcbiAgICAgIHNob3dfcmVzdWx0czogICAnYm9vbGVhbidcbiAgICAgIHNob3dfZmFpbHM6ICAgICAnYm9vbGVhbidcbiAgICAgIHNob3dfcGFzc2VzOiAgICAnYm9vbGVhbidcbiAgICAgIHRocm93X29uX2Vycm9yOiAnYm9vbGVhbidcbiAgICAgIHRocm93X29uX2ZhaWw6ICAnYm9vbGVhbidcbiAgICAgIG1lc3NhZ2Vfd2lkdGg6ICAnZ3RfbWVzc2FnZV93aWR0aCdcbiAgICAgIHByZWZpeDogICAgICAgICAndGV4dCdcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgIyB0aGVzZSBzaG91bGQgYmUgbWl4ZWQtaW4gZnJvbSBgZXF1YWxzX2NmZ2BfXG4gICAgICBvcmRlcmVkX29iamVjdHM6ICAnYm9vbGVhbidcbiAgICAgIG9yZGVyZWRfc2V0czogICAgICdib29sZWFuJ1xuICAgICAgb3JkZXJlZF9tYXBzOiAgICAgJ2Jvb2xlYW4nXG4gICAgICBzaWduZWRfemVybzogICAgICAnYm9vbGVhbidcbiAgICB0ZW1wbGF0ZTpcbiAgICAgIGF1dG9fcmVzZXQ6ICAgICBmYWxzZVxuICAgICAgc2hvd19yZXBvcnQ6ICAgIHRydWVcbiAgICAgIHJlcG9ydF9jaGVja3M6ICB0cnVlXG4gICAgICBzaG93X3Jlc3VsdHM6ICAgdHJ1ZVxuICAgICAgc2hvd19mYWlsczogICAgIHRydWVcbiAgICAgIHNob3dfcGFzc2VzOiAgICB0cnVlXG4gICAgICB0aHJvd19vbl9lcnJvcjogZmFsc2VcbiAgICAgIHRocm93X29uX2ZhaWw6ICBmYWxzZVxuICAgICAgbWVzc2FnZV93aWR0aDogIDMwMFxuICAgICAgcHJlZml4OiAgICAgICAgICcnXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICMgdGhlc2Ugc2hvdWxkIGJlIG1peGVkLWluIGZyb20gYGVxdWFsc19jZmdgX1xuICAgICAgb3JkZXJlZF9vYmplY3RzOiAgZmFsc2VcbiAgICAgIG9yZGVyZWRfc2V0czogICAgIGZhbHNlXG4gICAgICBvcmRlcmVkX21hcHM6ICAgICBmYWxzZVxuICAgICAgc2lnbmVkX3plcm86ICAgICAgZmFsc2VcbiAgZ3Rfc3RhdHM6XG4gICAgZmllbGRzOlxuICAgICAgcGFzc2VzOiAgICdjYXJkaW5hbCdcbiAgICAgIGZhaWxzOiAgICAnY2FyZGluYWwnXG4gICAgdGVtcGxhdGU6XG4gICAgICBwYXNzZXM6ICAgMFxuICAgICAgZmFpbHM6ICAgIDBcbiAgZ3RfdG90YWxzOiAjIyMgVEFJTlQgdXNlIGluaGVyaXRhbmNlIHRvIGRlcml2ZSBzaGFyZWQgZmllbGRzICMjI1xuICAgIGZpZWxkczpcbiAgICAgIHBhc3NlczogICAnY2FyZGluYWwnXG4gICAgICBmYWlsczogICAgJ2NhcmRpbmFsJ1xuICAgIHRlbXBsYXRlOlxuICAgICAgcGFzc2VzOiAgIDBcbiAgICAgIGZhaWxzOiAgICAwXG4gIGVxdWFsc19jZmc6XG4gICAgZmllbGRzOlxuICAgICAgb3JkZXJlZF9vYmplY3RzOiAgJ2Jvb2xlYW4nXG4gICAgICBvcmRlcmVkX3NldHM6ICAgICAnYm9vbGVhbidcbiAgICAgIG9yZGVyZWRfbWFwczogICAgICdib29sZWFuJ1xuICAgICAgc2lnbmVkX3plcm86ICAgICAgJ2Jvb2xlYW4nXG4gICAgdGVtcGxhdGU6XG4gICAgICBvcmRlcmVkX29iamVjdHM6ICBmYWxzZVxuICAgICAgb3JkZXJlZF9zZXRzOiAgICAgZmFsc2VcbiAgICAgIG9yZGVyZWRfbWFwczogICAgIGZhbHNlXG4gICAgICBzaWduZWRfemVybzogICAgICBmYWxzZVxuICAjIGd0X3JlcG9ydF9jZmc6XG4gICMgICBmaWVsZHM6XG4gICMgICAgIHByZWZpeDogICAndGV4dCdcbiAgIyAgIHRlbXBsYXRlOlxuICAjICAgICBwcmVmaXg6ICAgJydcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBfQXNzdW1wdGlvbnNcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0cnVjdG9yOiAoIGhvc3QsIHVwcmVmID0gbnVsbCApIC0+XG4gICAgaGlkZSBALCAnXycsIGhvc3RcbiAgICBoaWRlIEAsICdfdXByZWYnLCB1cHJlZlxuICAgIGhpZGUgQCwgJ2VxdWFscycsIG5hbWVpdCAnZXF1YWxzJywgKCBhLCBiICkgPT4gZXF1YWxzIGEsIGIsIEBfLmNmZ1xuICAgICMgaGlkZSBALCAncGFzcycsICAgICAgICAgbmFtZWl0ICdwYXNzJywgICAgICAgICAgKCBQLi4uICkgPT4gICAgICAgQF9wYXNzICAgICAgICAgIFAuLi5cbiAgICAjIGhpZGUgQCwgJ2ZhaWwnLCAgICAgICAgIG5hbWVpdCAnZmFpbCcsICAgICAgICAgICggUC4uLiApID0+ICAgICAgIEBfZmFpbCAgICAgICAgICBQLi4uXG4gICAgIyBoaWRlIEAsICdlcScsICAgICAgICAgICBuYW1laXQgJ2VxJywgICAgICAgICAgICAoIFAuLi4gKSA9PiAgICAgICBAX2VxICAgICAgICAgICAgUC4uLlxuICAgICMgaGlkZSBALCAnYXN5bmNfZXEnLCAgICAgbmFtZWl0ICdhc3luY19lcScsICAgICAgKCBQLi4uICkgPT4gICAgICAgQF9hc3luY19lcSAgICAgIFAuLi5cbiAgICAjIGhpZGUgQCwgJ3Rocm93cycsICAgICAgIG5hbWVpdCAndGhyb3dzJywgICAgICAgICggUC4uLiApID0+ICAgICAgIEBfdGhyb3dzICAgICAgICBQLi4uXG4gICAgIyBoaWRlIEAsICdhc3luY190aHJvd3MnLCBuYW1laXQgJ2FzeW5jX3Rocm93cycsICAoIFAuLi4gKSA9PiBhd2FpdCBAX2FzeW5jX3Rocm93cyAgUC4uLlxuICAgIHJldHVybiB1bmRlZmluZWRcblxuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIHBhc3M6ICggdXByZWYsIGNhdCwgbWVzc2FnZSA9IG51bGwgKSAtPlxuICAgIHJlZiA9ICggaiBAX3VwcmVmLCB1cHJlZiApXG4gICAgQF8uX2luY3JlbWVudF9wYXNzZXMgcmVmXG4gICAgaWYgQF8uY2ZnLnNob3dfcGFzc2VzXG4gICAgICBpZiBtZXNzYWdlP1xuICAgICAgICBtZXNzYWdlID0gQF90b19tZXNzYWdlX3dpZHRoIG1lc3NhZ2VcbiAgICAgICAgaGVscCByZWYsIGNhdCwgcmV2ZXJzZSBcIiAje21lc3NhZ2V9IFwiXG4gICAgICBlbHNlXG4gICAgICAgIGhlbHAgcmVmLCBjYXRcbiAgICByZXR1cm4gbnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZmFpbDogKCB1cHJlZiwgY2F0LCBtZXNzYWdlID0gbnVsbCApIC0+XG4gICAgcmVmID0gKCBqIEBfdXByZWYsIHVwcmVmIClcbiAgICBAXy5faW5jcmVtZW50X2ZhaWxzIHJlZlxuICAgIEBfLl93YXJuIHJlZiwgaWYgbWVzc2FnZT8gdGhlbiBcIigje2NhdH0pICN7bWVzc2FnZX1cIiBlbHNlIGNhdFxuICAgIGlmIEBfLmNmZy5zaG93X2ZhaWxzXG4gICAgICBpZiBtZXNzYWdlP1xuICAgICAgICBtZXNzYWdlID0gQF90b19tZXNzYWdlX3dpZHRoIG1lc3NhZ2VcbiAgICAgICAgd2FybiByZWYsIGNhdCwgcmV2ZXJzZSBcIiAje21lc3NhZ2V9IFwiXG4gICAgICBlbHNlXG4gICAgICAgIHdhcm4gcmVmLCBjYXRcbiAgICByZXR1cm4gbnVsbFxuXG4gICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgZXE6ICggZiwgbWF0Y2hlciApIC0+XG4gICAgc2hvcnRyZWYgID0gQF8uX3JlZl9mcm9tX2Z1bmN0aW9uIGZcbiAgICByZWYgICAgICAgPSAoIGogQF91cHJlZiwgc2hvcnRyZWYgKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgdHJ5ICggcmVzdWx0ID0gZi5jYWxsIEAsIEAgKSBjYXRjaCBlcnJvclxuICAgICAgbWVzc2FnZSA9IFwiZXhwZWN0ZWQgYSByZXN1bHQgYnV0IGdvdCBhbiBhbiBlcnJvcjogI3tycHIgZXJyb3IubWVzc2FnZX1cIlxuICAgICAgQGZhaWwgc2hvcnRyZWYsICdlcnJvcicsIG1lc3NhZ2VcbiAgICAgIGlmIEBfLmNmZy50aHJvd19vbl9lcnJvclxuICAgICAgICBlcnJvci5tZXNzYWdlID0gbWVzc2FnZTsgdGhyb3cgZXJyb3JcbiAgICAgIHJldHVybiBudWxsXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICByZXR1cm4gQHBhc3Mgc2hvcnRyZWYsICdlcScgaWYgQGVxdWFscyByZXN1bHQsIG1hdGNoZXJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHdhcm4gcmVmLCAoIHJldmVyc2UgJyBuZXEgJyApLCBcInJlc3VsdDogICAgIFwiLCAoIHJldmVyc2UgJyAnICsgKCBycHIgcmVzdWx0ICAgKSArICcgJyApXG4gICAgd2FybiByZWYsICggcmV2ZXJzZSAnIG5lcSAnICksIFwibWF0Y2hlcjogICAgXCIsICggcmV2ZXJzZSAnICcgKyAoIHJwciBtYXRjaGVyICApICsgJyAnIClcbiAgICBAZmFpbCBzaG9ydHJlZiwgJ25lcSdcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJuZXE6XFxucmVzdWx0OiAgICAgI3tycHIgcmVzdWx0fVxcbm1hdGNoZXI6ICAgICN7bWF0Y2hlcn1cIiBpZiBAXy5jZmcudGhyb3dfb25fZmFpbFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcmV0dXJuIG51bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGFzeW5jX2VxOiAoIGYsIG1hdGNoZXIgKSAtPlxuICAgIHNob3J0cmVmICA9IEBfLl9yZWZfZnJvbV9mdW5jdGlvbiBmXG4gICAgcmVmICAgICAgID0gKCBqIEBfdXByZWYsIHNob3J0cmVmIClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHRyeSAoIHJlc3VsdCA9IGF3YWl0IGYuY2FsbCBALCBAICkgY2F0Y2ggZXJyb3JcbiAgICAgIG1lc3NhZ2UgPSBcImV4cGVjdGVkIGEgcmVzdWx0IGJ1dCBnb3QgYW4gYW4gZXJyb3I6ICN7cnByIGVycm9yLm1lc3NhZ2V9XCJcbiAgICAgIEBmYWlsIHNob3J0cmVmLCAnZXJyb3InLCBtZXNzYWdlXG4gICAgICBpZiBAXy5jZmcudGhyb3dfb25fZXJyb3JcbiAgICAgICAgZXJyb3IubWVzc2FnZSA9IG1lc3NhZ2U7IHRocm93IGVycm9yXG4gICAgICByZXR1cm4gbnVsbFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcmV0dXJuIEBwYXNzIHNob3J0cmVmLCAnZXEnIGlmIEBlcXVhbHMgcmVzdWx0LCBtYXRjaGVyXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB3YXJuIHJlZiwgKCByZXZlcnNlICcgbmVxICcgKSwgXCJyZXN1bHQ6ICAgICBcIiwgKCByZXZlcnNlICcgJyArICggcnByIHJlc3VsdCAgICkgKyAnICcgKVxuICAgIHdhcm4gcmVmLCAoIHJldmVyc2UgJyBuZXEgJyApLCBcIm1hdGNoZXI6ICAgIFwiLCAoIHJldmVyc2UgJyAnICsgKCBycHIgbWF0Y2hlciAgKSArICcgJyApXG4gICAgQGZhaWwgc2hvcnRyZWYsICduZXEnXG4gICAgdGhyb3cgbmV3IEVycm9yIFwibmVxOlxcbnJlc3VsdDogICAgICN7cnByIHJlc3VsdH1cXG5tYXRjaGVyOiAgICAje21hdGNoZXJ9XCIgaWYgQF8uY2ZnLnRocm93X29uX2ZhaWxcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHJldHVybiBudWxsXG5cbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICB0aHJvd3M6ICggZiwgbWF0Y2hlciApIC0+XG4gICAgc2hvcnRyZWYgID0gQF8uX3JlZl9mcm9tX2Z1bmN0aW9uIGZcbiAgICByZWYgICAgICAgPSAoIGogQF91cHJlZiwgc2hvcnRyZWYgKVxuICAgIGVycm9yICAgICA9IG51bGxcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHRyeSAoIHVyZ2UgKCBqIEBfdXByZWYsIHNob3J0cmVmLCAnzqlndF9fXzEnICksIFwiYHRocm93cygpYCByZXN1bHQgb2YgY2FsbDpcIiwgcnByIGYuY2FsbCBALCBAICkgY2F0Y2ggZXJyb3JcbiAgICAgIHVubGVzcyBtYXRjaGVyP1xuICAgICAgICBAcGFzcyBzaG9ydHJlZiwgJ2Vycm9yIG9rJywgZXJyb3IubWVzc2FnZVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzd2l0Y2ggbWF0Y2hlcl90eXBlID0gQF8uX21hdGNoX2Vycm9yIGVycm9yLCBtYXRjaGVyXG4gICAgICAgIHdoZW4gdHJ1ZVxuICAgICAgICAgIEBwYXNzIHNob3J0cmVmLCAnZXJyb3Igb2snLCBlcnJvci5tZXNzYWdlXG4gICAgICAgIHdoZW4gZmFsc2VcbiAgICAgICAgICB1cmdlICggaiBAX3VwcmVmLCBzaG9ydHJlZiwgJ86pZ3RfX18yJyApLCBcImVycm9yICAgICAgICBcIiwgcmV2ZXJzZSBlcnJvci5tZXNzYWdlICAjIyMgVEFJTlQgdG8gYmUgcmVwbGFjZWQgIyMjXG4gICAgICAgICAgd2FybiAoIGogQF91cHJlZiwgc2hvcnRyZWYsICfOqWd0X19fMycgKSwgXCJkb2Vzbid0IG1hdGNoXCIsIHJldmVyc2UgcnByIG1hdGNoZXIgICAgIyMjIFRBSU5UIHRvIGJlIHJlcGxhY2VkICMjI1xuICAgICAgICAgIEBmYWlsIHNob3J0cmVmLCAnbmVxJywgXCJlcnJvciAje3JwciBlcnJvci5tZXNzYWdlfSBkb2Vzbid0IG1hdGNoICN7cnByIG1hdGNoZXJ9XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBmYWlsIHNob3J0cmVmLCAndHlwZScsIFwiZXhwZWN0ZWQgYSByZWdleCBvciBhIHRleHQsIGdvdCBhICN7bWF0Y2hlcl90eXBlfVwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB1bmxlc3MgZXJyb3I/XG4gICAgICBAZmFpbCBzaG9ydHJlZiwgJ25vZXJyJywgXCJleHBlY3RlZCBhbiBlcnJvciBidXQgbm9uZSB3YXMgdGhyb3duXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHJldHVybiBudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBhc3luY190aHJvd3M6ICggZiwgbWF0Y2hlciApIC0+ICMgbmV3IFByb21pc2UgKCByZXNvbHZlLCByZWplY3QgKSA9PlxuICAgICMjI1xuXG4gICAgKiBuZWVkcyBgZmAgdG8gYmUgYW4gYGFzeW5jZnVuY3Rpb25gIChhbHRob3VnaCBgZnVuY3Rpb25gIHdpbGwgYWxzbyB3b3JrPyBiZXR0ZXIgY2hlY2sgYW55d2F5PylcbiAgICAqIHVzZXMgYHRyeWAgLyBgZXhjZXB0YCBjbGF1c2UgdG8gYGF3YWl0YCBgcmVzdWx0YCBvZiBjYWxsaW5nIGBmYFxuICAgICogaW4gY2FzZSBgcmVzdWx0YCBpcyBkZWxpdmVyZWQsIHRoYXQncyBhbiBlcnJvclxuICAgICogb3RoZXJ3aXNlIGFuIGBlcnJvcmAgd2lsbCBiZSBjYXVnaHQ7XG4gICAgICAqIHN1Y2Nlc3Mgd2hlbiBgbWF0Y2hlcmAgaXMgbWlzc2luZywgb3IgZWxzZSwgd2hlbiBgbWF0Y2hlcmAgZGVzY3JpYmVzIGBlcnJvci5tZXNzYWdlYDtcbiAgICAgICogZmFpbHVyZSBvdGhlcndpc2VcblxuICAgICMjI1xuICAgICMjIyBUQUlOVCBjaGVjayB3aGV0aGVyIGBmYCBpcyBgYXN5bmNmdW5jdGlvbmA/ICMjI1xuICAgIHNob3J0cmVmICA9IEBfLl9yZWZfZnJvbV9mdW5jdGlvbiBmXG4gICAgcmVmICAgICAgID0gKCBqIEBfdXByZWYsIHNob3J0cmVmIClcbiAgICBlcnJvciAgICAgPSBudWxsXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB0cnlcbiAgICAgIHJlc3VsdCA9IGF3YWl0IGYuY2FsbCBALCBAXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBjYXRjaCBlcnJvclxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB1bmxlc3MgbWF0Y2hlcj9cbiAgICAgICAgQHBhc3Mgc2hvcnRyZWYsICdlcnJvciBvaycsIFwiZGlkIHRocm93ICN7cnByIGVycm9yLm1lc3NhZ2V9XCJcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc3dpdGNoIG1hdGNoZXJfdHlwZSA9IEBfLl9tYXRjaF9lcnJvciBlcnJvciwgbWF0Y2hlclxuICAgICAgICB3aGVuIHRydWVcbiAgICAgICAgICBAcGFzcyBzaG9ydHJlZiwgJ2Vycm9yIG9rJywgXCJkaWQgdGhyb3cgI3tycHIgZXJyb3IubWVzc2FnZX1cIlxuICAgICAgICB3aGVuIGZhbHNlXG4gICAgICAgICAgdXJnZSBcIiN7cmVmfS7OqWd0X19fNCBlcnJvciAgICAgICAgXCIsIHJldmVyc2UgZXJyb3IubWVzc2FnZVxuICAgICAgICAgIHdhcm4gXCIje3JlZn0uzqlndF9fXzUgZG9lc24ndCBtYXRjaFwiLCByZXZlcnNlIHJwciBtYXRjaGVyXG4gICAgICAgICAgQGZhaWwgc2hvcnRyZWYsICdlcnJvciBub2snLCBcImRpZCB0aHJvdyBidXQgbm90IG1hdGNoICN7cnByIGVycm9yLm1lc3NhZ2V9XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBmYWlsIHNob3J0cmVmLCAnZmFpbCcsIFwiZXhwZWN0ZWQgYSByZWdleCBvciBhIHRleHQgZm9yIG1hdGNoZXIsIGdvdCBhICN7bWF0Y2hlcl90eXBlfVwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB1bmxlc3MgZXJyb3I/XG4gICAgICBAZmFpbCBzaG9ydHJlZiwgJ21pc3NpbmcnLCBcImV4cGVjdGVkIGFuIGVycm9yIGJ1dCBub25lIHdhcyB0aHJvd24sIGluc3RlYWQgZ290IHJlc3VsdCAje3JwciByZXN1bHR9XCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHJldHVybiBudWxsXG5cbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBfbWF0Y2hfZXJyb3I6ICggZXJyb3IsIG1hdGNoZXIgKSAtPlxuICAgIHN3aXRjaCBtYXRjaGVyX3R5cGUgPSB0eXBlX29mIG1hdGNoZXJcbiAgICAgIHdoZW4gJ3RleHQnXG4gICAgICAgIHJldHVybiBlcnJvci5tZXNzYWdlIGlzIG1hdGNoZXJcbiAgICAgIHdoZW4gJ3JlZ2V4J1xuICAgICAgICBtYXRjaGVyLmxhc3RJbmRleCA9IDBcbiAgICAgICAgcmV0dXJuIG1hdGNoZXIudGVzdCBlcnJvci5tZXNzYWdlXG4gICAgcmV0dXJuIG1hdGNoZXJfdHlwZVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX3RvX21lc3NhZ2Vfd2lkdGg6ICggbWVzc2FnZSApIC0+ICggdG9fd2lkdGggbWVzc2FnZSwgQF8uY2ZnLm1lc3NhZ2Vfd2lkdGggKS50cmltRW5kKClcblxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgVGVzdCBleHRlbmRzIF9Bc3N1bXB0aW9uc1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY29uc3RydWN0b3I6ICggY2ZnICkgLT5cbiAgICBzdXBlciBudWxsOyBAXyA9IEBcbiAgICBAY2ZnID0gT2JqZWN0LmZyZWV6ZSBjcmVhdGUuZ3RfdGVzdF9jZmcgY2ZnXG4gICAgQHRvdGFscyA9IGNyZWF0ZS5ndF90b3RhbHMoKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaGlkZSBALCAndGVzdCcsICAgICAgICAgbmFtZWl0ICd0ZXN0JywgICAgICAgICAgKCBQLi4uICkgPT4gICAgICAgQF90ZXN0ICAgICAgICAgIFAuLi5cbiAgICBoaWRlIEAsICdhc3luY190ZXN0JywgICBuYW1laXQgJ2FzeW5jX3Rlc3QnLCAgICAoIFAuLi4gKSA9PiBhd2FpdCBAX2FzeW5jX3Rlc3QgICAgUC4uLlxuICAgIGhpZGUgQCwgJ3JlcG9ydCcsICAgICAgIG5hbWVpdCAncmVwb3J0JywgICAgICAgICggUC4uLiApID0+ICAgICAgIEBfcmVwb3J0ICAgICAgICBQLi4uXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBoaWRlIEAsICdfS1dfdGVzdF9yZWYnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAn4paI4paIX0tXX3Rlc3RfcmVmJ1xuICAgIGhpZGUgQCwgJ3N0YXRzJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgJyonOiBAdG90YWxzLCB9XG4gICAgaGlkZSBALCAnd2FybmluZ3MnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAge31cbiAgICByZXR1cm4gdW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfdGVzdDogKCB0ZXN0cy4uLiApIC0+XG4gICAgQF90ZXN0X2lubmVyIG51bGwsIHRlc3RzLi4uXG4gICAgQHJlcG9ydCgpIGlmIEBjZmcuc2hvd19yZXBvcnRcbiAgICBwcm9jZXNzLmV4aXRDb2RlID0gOTkgaWYgQHRvdGFscy5mYWlscyBpc250IDBcbiAgICByZXR1cm4gQHN0YXRzXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfYXN5bmNfdGVzdDogKCB0ZXN0cy4uLiApIC0+XG4gICAgYXdhaXQgQF9hc3luY190ZXN0X2lubmVyIG51bGwsIHRlc3RzLi4uXG4gICAgQHJlcG9ydCgpIGlmIEBjZmcuc2hvd19yZXBvcnRcbiAgICBwcm9jZXNzLmV4aXRDb2RlID0gOTkgaWYgQHRvdGFscy5mYWlscyBpc250IDBcbiAgICByZXR1cm4gQHN0YXRzXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfdGVzdF9pbm5lcjogKCB1cHJlZiwgdGVzdHMuLi4gKSAtPlxuICAgICMjIyBUQUlOVCBwcmVsaW1pbmFyeSBoYW5kbGluZyBvZiBhcmd1bWVudHMgIyMjXG4gICAgZm9yIGNhbmRpZGF0ZSBpbiB0ZXN0cyB0aGVuIHN3aXRjaCB0cnVlXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHdoZW4gaXNhLmZ1bmN0aW9uIGNhbmRpZGF0ZVxuICAgICAgICB0cnlcbiAgICAgICAgICBjdHggPSBuZXcgX0Fzc3VtcHRpb25zIEAsIHVwcmVmXG4gICAgICAgICAgY2FuZGlkYXRlLmNhbGwgY3R4LCBjdHhcbiAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICAjIHJlZiAgICAgPSAoIGogdXByZWYsICfOqWd0X19fNicgKVxuICAgICAgICAgIHJlZiAgICAgPSB1cHJlZlxuICAgICAgICAgIG1lc3NhZ2UgPSBcImFuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJyZWQgd2hlbiBjYWxsaW5nIHRhc2sgI3tycHIgcmVmfTsgI3tycHIgZXJyb3IubWVzc2FnZX1cIlxuICAgICAgICAgIEBmYWlsIHJlZiwgJ2Vycm9yJywgbWVzc2FnZVxuICAgICAgICAgIGlmIEBjZmcudGhyb3dfb25fZXJyb3JcbiAgICAgICAgICAgIGVycm9yLm1lc3NhZ2UgPSBtZXNzYWdlOyB0aHJvdyBlcnJvclxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB3aGVuIGlzYS5vYmplY3QgY2FuZGlkYXRlXG4gICAgICAgIGZvciBrZXksIHByb3BlcnR5IG9mIGNhbmRpZGF0ZVxuICAgICAgICAgIGlmIGtleS5zdGFydHNXaXRoICdfJ1xuICAgICAgICAgICAgQF93YXJuICfOqWd0X19fNycsIFwic2tpcHBlZCAje2tleX1cIlxuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICBAX3Rlc3RfaW5uZXIgKCBqIHVwcmVmLCBrZXkgKSwgcHJvcGVydHlcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgd2hlbiBub3QgY2FuZGlkYXRlP1xuICAgICAgICAjIHJlZiAgICAgPSAoIGogdXByZWYsICfOqWd0X19fOCcgKVxuICAgICAgICByZWYgICAgID0gdXByZWZcbiAgICAgICAgQGZhaWwgcmVmLCAnbWlzc2luZycsIFwiZXhwZWN0ZWQgYSB0ZXN0LCBnb3QgYSAje3R5cGVfb2YgY2FuZGlkYXRlfVwiXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIGVsc2VcbiAgICAgICAgcmVmID0gKCBqIHVwcmVmLCBAX3JlZl9mcm9tX2Z1bmN0aW9uIGNhbmRpZGF0ZSApXG4gICAgICAgIEBmYWlsIHJlZiwgJ3R5cGUnLCBcImV4cGVjdGVkIGEgdGVzdCwgZ290IGEgI3t0eXBlX29mIGNhbmRpZGF0ZX1cIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcmV0dXJuIG51bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9hc3luY190ZXN0X2lubmVyOiAoIHVwcmVmLCB0ZXN0cy4uLiApIC0+XG4gICAgZm9yIGNhbmRpZGF0ZSBpbiB0ZXN0cyB0aGVuIHN3aXRjaCB0cnVlXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHdoZW4gaXNhLmZ1bmN0aW9uIGNhbmRpZGF0ZVxuICAgICAgICBhd2FpdCBAX3Rlc3RfaW5uZXIgdXByZWYsIGNhbmRpZGF0ZVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB3aGVuIGlzYS5hc3luY2Z1bmN0aW9uIGNhbmRpZGF0ZVxuICAgICAgICB0cnlcbiAgICAgICAgICBjdHggPSBuZXcgX0Fzc3VtcHRpb25zIEAsIHVwcmVmXG4gICAgICAgICAgYXdhaXQgY2FuZGlkYXRlLmNhbGwgY3R4LCBjdHhcbiAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICByZWYgICAgID0gKCBqIHVwcmVmLCAnzqlndF9fXzknIClcbiAgICAgICAgICBtZXNzYWdlID0gXCJhbiB1bmV4cGVjdGVkIGVycm9yIG9jY3VycmVkIHdoZW4gY2FsbGluZyB0YXNrICN7cnByIHJlZn07ICN7cnByIGVycm9yLm1lc3NhZ2V9XCJcbiAgICAgICAgICBAZmFpbCByZWYsICdlcnJvcicsIG1lc3NhZ2VcbiAgICAgICAgICBpZiBAY2ZnLnRocm93X29uX2Vycm9yXG4gICAgICAgICAgICBlcnJvci5tZXNzYWdlID0gbWVzc2FnZTsgdGhyb3cgZXJyb3JcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgd2hlbiBpc2Eub2JqZWN0IGNhbmRpZGF0ZVxuICAgICAgICBmb3Iga2V5LCBwcm9wZXJ0eSBvZiBjYW5kaWRhdGVcbiAgICAgICAgICBhd2FpdCBAX2FzeW5jX3Rlc3RfaW5uZXIgKCBqIHVwcmVmLCBrZXkgKSwgcHJvcGVydHlcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgZWxzZVxuICAgICAgICByZWYgPSAoIGogdXByZWYsIEBfcmVmX2Zyb21fZnVuY3Rpb24gY2FuZGlkYXRlIClcbiAgICAgICAgQGZhaWwgcmVmLCAndHlwZScsIFwiZXhwZWN0ZWQgYSB0ZXN0LCBnb3QgYSAje3R5cGVfb2YgY2FuZGlkYXRlfVwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICByZXR1cm4gbnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX3JlcG9ydDogLT5cbiAgICB7IGJsdWVcbiAgICAgIHJlZFxuICAgICAgZ29sZCAgICB9ID0gR1VZLnRybVxuICAgIGxpbmUgICAgICAgID0gZ29sZCAn4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCU4oCUJ1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgc2hvd190b3RhbHMgPSA9PlxuICAgICAgd2hpc3BlciAnzqlndF9fMTAgJyArIEBjZmcucHJlZml4LCBsaW5lXG4gICAgICB3aGlzcGVyICfOqWd0X18xMSAnICsgQGNmZy5wcmVmaXgsIHJldmVyc2UgR1VZLnRybVsgY29sb3IgXSAoICcqJy5wYWRFbmQgMjAgKSwgQHRvdGFsc1xuICAgICAgd2hpc3BlciAnzqlndF9fMTIgJyArIEBjZmcucHJlZml4LCBsaW5lXG4gICAgICByZXR1cm4gbnVsbFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgd2hpc3BlcigpXG4gICAgd2hpc3BlciAnzqlndF9fMTMgJyArIEBjZmcucHJlZml4LCBsaW5lXG4gICAgd2hpc3BlciAnzqlndF9fMTQgJyArIEBjZmcucHJlZml4LCBnb2xkICcgICAgICAgICAgICAgICAgICAgICAgICDwn5mkICBHVVkgVEVTVCDwn5mmJ1xuICAgIGNvbG9yID0gaWYgQHRvdGFscy5mYWlscyBpcyAwIHRoZW4gJ2xpbWUnIGVsc2UgJ3JlZCdcbiAgICBpZiBAY2ZnLnJlcG9ydF9jaGVja3NcbiAgICAgIHdoaXNwZXIgJ86pZ3RfXzE1ICcgKyBAY2ZnLnByZWZpeCwgbGluZVxuICAgICAgZm9yIGtleSwgc3RhdHMgb2YgQHN0YXRzXG4gICAgICAgIGNvbnRpbnVlIGlmIGtleSBpcyAnKidcbiAgICAgICAgd2hpc3BlciAnzqlndF9fMTYgJyArIEBjZmcucHJlZml4LCBibHVlICgga2V5LnBhZEVuZCAyMCApLCBzdGF0c1xuICAgIHNob3dfdG90YWxzKClcbiAgICByZXBlYXRfdG90YWxzID0gZmFsc2VcbiAgICBmb3Igc3ViX3JlZiwgbWVzc2FnZXMgb2YgQHdhcm5pbmdzXG4gICAgICByZXBlYXRfdG90YWxzID0gdHJ1ZVxuICAgICAgZm9yIG1lc3NhZ2UgaW4gbWVzc2FnZXNcbiAgICAgICAgd2hpc3BlciAnzqlndF9fMTcgJyArIEBjZmcucHJlZml4LCAoIHJlZCBzdWJfcmVmICksIHJldmVyc2UgcmVkIFwiICN7bWVzc2FnZX0gXCJcbiAgICBzaG93X3RvdGFscygpIGlmIHJlcGVhdF90b3RhbHNcbiAgICB3aGlzcGVyKClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHJldHVybiBAc3RhdHNcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9pbmNyZW1lbnRfcGFzc2VzOiAgKCBjaGVja19yZWYgKSAtPiBAX2luY3JlbWVudCAncGFzc2VzJywgY2hlY2tfcmVmXG4gIF9pbmNyZW1lbnRfZmFpbHM6ICAgKCBjaGVja19yZWYgKSAtPiBAX2luY3JlbWVudCAnZmFpbHMnLCAgY2hlY2tfcmVmXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfaW5jcmVtZW50OiAoIHBhc3Nfb3JfZmFpbCwgY2hlY2tfcmVmICkgLT5cbiAgICBwZXJfY2hlY2tfc3RhdHMgPSBAc3RhdHNbIGNoZWNrX3JlZiBdID89IGNyZWF0ZS5ndF9zdGF0cygpXG4gICAgcGVyX2NoZWNrX3N0YXRzWyAgcGFzc19vcl9mYWlsIF0rK1xuICAgIEB0b3RhbHNbICAgICAgICAgIHBhc3Nfb3JfZmFpbCBdKytcbiAgICByZXR1cm4gbnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX3dhcm46ICggcmVmLCBtZXNzYWdlICkgLT5cbiAgICAoIEB3YXJuaW5nc1sgcmVmIF0gPz0gW10gKS5wdXNoICggbWVzc2FnZSA/ICcuLy4nIClcbiAgICByZXR1cm4gbnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX3JlZl9mcm9tX2Z1bmN0aW9uOiAoIGYgKSAtPlxuICAgIFIgPSAnYW5vbicgaWYgKCBSID0gZi5uYW1lICkgaXMgJydcbiAgICAjIHRocm93IG5ldyBFcnJvciBcIl45OTItMV4gdGVzdCBtZXRob2Qgc2hvdWxkIGJlIG5hbWVkLCBnb3QgI3tycHIgZn1cIiBpZiAoIFIgPSBmLm5hbWUgKSBpcyAnJ1xuICAgIHJldHVybiBSXG5cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgU0VUIEVRVUFMSVRZIEJZIFZBTFVFXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmVxdWFscyA9ICggYSwgYiwgY2ZnICkgLT5cbiAgY2ZnID0gX2NyZWF0ZV9lcXVhbHNfY2ZnIGNmZ1xuICAjIyMgTk9URSB0aGVzZSBjb21wYXJpc29ucyBkaXNyZWdhcmQgc2lnbiBvZiB6ZXJvICMjI1xuICByZXR1cm4gdHJ1ZSBpZiAoIG5vdCBjZmcuc2lnbmVkX3plcm8gKSBhbmQgKCBhIGlzIDAgKSBhbmQgKCBiIGlzIDAgKVxuICByZXR1cm4gZmFsc2UgdW5sZXNzICggdHlwZV9vZl9hID0gdHlwZV9vZiBhICkgaXMgKCB0eXBlX29mIGIgKVxuICBpZiAoIHR5cGVfb2ZfYSBpcyAnc2V0JyApXG4gICAgcmV0dXJuIF9vcmRlcmVkX3NldHNfb3JfbWFwc19hcmVfZXF1YWwgICAgYSwgYiwgY2ZnIGlmIGNmZy5vcmRlcmVkX3NldHNcbiAgICByZXR1cm4gX3Vub3JkZXJlZF9zZXRzX29yX21hcHNfYXJlX2VxdWFsICBhLCBiLCBjZmdcbiAgaWYgKCB0eXBlX29mX2EgaXMgJ21hcCcgKVxuICAgIHJldHVybiBfb3JkZXJlZF9zZXRzX29yX21hcHNfYXJlX2VxdWFsICAgIGEsIGIsIGNmZyBpZiBjZmcub3JkZXJlZF9tYXBzXG4gICAgcmV0dXJuIF91bm9yZGVyZWRfc2V0c19vcl9tYXBzX2FyZV9lcXVhbCAgYSwgYiwgY2ZnXG4gIFIgPSBfamtlcXVhbHMgYSwgYlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMjIyBUQUlOVCB0aGlzIHJlcGVhdHMgd29yayBhbHJlYWR5IGRvbmUgYnkgX2prZXF1YWxzIGFuZCBzaG91bGQgYmUgaW1wbGVtZW50ZWQgaW4gdGhhdCBtb2R1bGUgIyMjXG4gIGlmIFIgYW5kIGNmZy5vcmRlcmVkX29iamVjdHMgYW5kICggX2prdHlwZW9mIGEgKSBpcyAnb2JqZWN0J1xuICAgIHJldHVybiBfamtlcXVhbHMgKCBrIGZvciBrIG9mIGEgd2hlbiBrIGlzbnQgJ2NvbnN0cnVjdG9yJyApLCAoIGsgZm9yIGsgb2YgYiB3aGVuIGsgaXNudCAnY29uc3RydWN0b3InIClcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICByZXR1cm4gUlxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5fc2V0X29yX21hcF9jb250YWlucyA9ICggc2V0X29yX21hcCwgZWxlbWVudCwgY2ZnICkgLT5cbiAgZm9yIGVsZW1lbnRfMiBmcm9tIHNldF9vcl9tYXBcbiAgICBpZiBlcXVhbHMgZWxlbWVudF8yLCBlbGVtZW50LCBjZmdcbiAgICAgIHJldHVybiB0cnVlXG4gIHJldHVybiBmYWxzZVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5fb3JkZXJlZF9zZXRzX29yX21hcHNfYXJlX2VxdWFsID0gKCBhLCBiLCBjZmcgKSAtPlxuICAjIyMgVEFJTlQgb25seSB1c2UgaWYgYm90aCBhLCBiIGhhdmUgc2FtZSB0eXBlIGFuZCB0eXBlIGlzIGBzZXRgIG9yIGBtYXBgICMjI1xuICByZXR1cm4gZmFsc2UgdW5sZXNzIGEuc2l6ZSBpcyBiLnNpemVcbiAgaWR4ID0gLTFcbiAgZW50cmllc19vZl9iID0gWyBiLi4uLCBdXG4gIGZvciBlbGVtZW50IGZyb20gYVxuICAgIGlkeCsrXG4gICAgcmV0dXJuIGZhbHNlIHVubGVzcyBlcXVhbHMgZWxlbWVudCwgZW50cmllc19vZl9iWyBpZHggXSwgY2ZnXG4gIHJldHVybiB0cnVlXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbl91bm9yZGVyZWRfc2V0c19vcl9tYXBzX2FyZV9lcXVhbCA9ICggYSwgYiwgY2ZnICkgLT5cbiAgIyMjIFRBSU5UIG9ubHkgdXNlIGlmIGJvdGggYSwgYiBoYXZlIHNhbWUgdHlwZSBhbmQgdHlwZSBpcyBgc2V0YCBvciBgbWFwYCAjIyNcbiAgcmV0dXJuIGZhbHNlIHVubGVzcyBhLnNpemUgaXMgYi5zaXplXG4gIGZvciBlbGVtZW50IGZyb20gYVxuICAgIHJldHVybiBmYWxzZSB1bmxlc3MgX3NldF9vcl9tYXBfY29udGFpbnMgYiwgZWxlbWVudCwgY2ZnXG4gIHJldHVybiB0cnVlXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbl9jcmVhdGVfZXF1YWxzX2NmZyA9ICggY2ZnICkgLT5cbiAgcmV0dXJuIFIgaWYgKCBSID0gX2tub3duX2VxdWFsc19jZmdzLmdldCBjZmcgKT9cbiAgX2tub3duX2VxdWFsc19jZmdzLnNldCBjZmcsIFIgPSBjcmVhdGUuZXF1YWxzX2NmZyBjZmdcbiAgcmV0dXJuIFJcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuX2tub3duX2VxdWFsc19jZmdzID0gbmV3IE1hcCgpXG5cbiMgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jICMgU0VUIEVRVUFMSVRZIEJZIFZBTFVFXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBfZXF1YWxzID0gKCByZXF1aXJlICdub2RlOnV0aWwnICkuaXNEZWVwU3RyaWN0RXF1YWxcbiMgZXF1YWxzID0gKCBhLCBiLCBjZmcgKSAtPlxuIyAgIGNmZyA9IF9jcmVhdGVfZXF1YWxzX2NmZyBjZmdcbiMgICAjIyMgTk9URSB0aGVzZSBjb21wYXJpc29ucyBkaXNyZWdhcmQgc2lnbiBvZiB6ZXJvICMjI1xuIyAgIHJldHVybiB0cnVlIGlmICggbm90IGNmZy5zaWduZWRfemVybyApIGFuZCAoIGEgaXMgMCApIGFuZCAoIGIgaXMgMCApXG4jICAgcmV0dXJuIGZhbHNlIHVubGVzcyAoIHR5cGVfb2ZfYSA9IHR5cGVfb2YgYSApIGlzICggdHlwZV9vZiBiIClcbiMgICByZXR1cm4gX2VxdWFscyBhLCBiXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxubW9kdWxlLmV4cG9ydHMgPSB7IFRlc3QsIF9Bc3N1bXB0aW9ucywgZXF1YWxzLCBfdHlwZXM6IHR5cGVzLCB9XG4iXX0=
