(function() {
  'use strict';
  var GUY, Intertype, Test, WG, _Assumptions, _create_equals_cfg, _equals, _jkequals, _jktypeof, _known_equals_cfgs, alert, create, debug, echo, equals, help, hide, info, inspect, isa, j, log, nameit, plain, praise, reverse, rpr, to_width, type_of, types, urge, validate, warn, whisper;

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

  // #===========================================================================================================
  // # SET EQUALITY BY VALUE
  // #-----------------------------------------------------------------------------------------------------------
  // equals = ( a, b, cfg ) ->
  //   cfg = _create_equals_cfg cfg
  //   ### NOTE these comparisons disregard sign of zero ###
  //   return true if ( not cfg.signed_zero ) and ( a is 0 ) and ( b is 0 )
  //   return false unless ( type_of_a = type_of a ) is ( type_of b )
  //   if ( type_of_a is 'set' )
  //     return _ordered_sets_or_maps_are_equal    a, b, cfg if cfg.ordered_sets
  //     return _unordered_sets_or_maps_are_equal  a, b, cfg
  //   if ( type_of_a is 'map' )
  //     return _ordered_sets_or_maps_are_equal    a, b, cfg if cfg.ordered_maps
  //     return _unordered_sets_or_maps_are_equal  a, b, cfg
  //   R = _jkequals a, b
  //   #.........................................................................................................
  //   ### TAINT this repeats work already done by _jkequals and should be implemented in that module ###
  //   if R and cfg.ordered_objects and ( _jktypeof a ) is 'object'
  //     return _jkequals ( k for k of a when k isnt 'constructor' ), ( k for k of b when k isnt 'constructor' )
  //   #.........................................................................................................
  //   return R
  // #...........................................................................................................
  // _set_or_map_contains = ( set_or_map, element, cfg ) ->
  //   for element_2 from set_or_map
  //     if equals element_2, element, cfg
  //       return true
  //   return false
  // #...........................................................................................................
  // _ordered_sets_or_maps_are_equal = ( a, b, cfg ) ->
  //   ### TAINT only use if both a, b have same type and type is `set` or `map` ###
  //   return false unless a.size is b.size
  //   idx = -1
  //   entries_of_b = [ b..., ]
  //   for element from a
  //     idx++
  //     return false unless equals element, entries_of_b[ idx ], cfg
  //   return true
  // #...........................................................................................................
  // _unordered_sets_or_maps_are_equal = ( a, b, cfg ) ->
  //   ### TAINT only use if both a, b have same type and type is `set` or `map` ###
  //   return false unless a.size is b.size
  //   for element from a
  //     return false unless _set_or_map_contains b, element, cfg
  //   return true
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
  // SET EQUALITY BY VALUE
  //-----------------------------------------------------------------------------------------------------------
  _equals = (require('node:util')).isDeepStrictEqual;

  equals = function(a, b, cfg) {
    var type_of_a;
    cfg = _create_equals_cfg(cfg);
    if ((!cfg.signed_zero) && (a === 0) && (b === 0)) {
      /* NOTE these comparisons disregard sign of zero */
      return true;
    }
    if ((type_of_a = type_of(a)) !== (type_of(b))) {
      return false;
    }
    return _equals(a, b);
  };

  //===========================================================================================================
  module.exports = {
    Test,
    _Assumptions,
    equals,
    _types: types
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLEdBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLEVBQUEsRUFBQSxZQUFBLEVBQUEsa0JBQUEsRUFBQSxPQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxrQkFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLE9BQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQSxJQUFBLEVBQUE7O0VBRUEsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUjs7RUFDNUIsQ0FBQSxDQUFFLEtBQUYsRUFDRSxLQURGLEVBRUUsSUFGRixFQUdFLElBSEYsRUFJRSxLQUpGLEVBS0UsTUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsT0FSRixDQUFBLEdBUTRCLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBUixDQUFvQixJQUFwQixDQVI1Qjs7RUFTQSxDQUFBLENBQUUsR0FBRixFQUNFLE9BREYsRUFFRSxJQUZGLEVBR0UsT0FIRixFQUlFLEdBSkYsQ0FBQSxHQUk0QixHQUFHLENBQUMsR0FKaEM7O0VBS0EsQ0FBQSxDQUFFLFNBQUYsQ0FBQSxHQUE0QixPQUFBLENBQVEsV0FBUixDQUE1Qjs7RUFDQSxTQUFBLEdBQTRCLE9BQUEsQ0FBUSx1QkFBUjs7RUFDNUIsU0FBQSxHQUE0QixPQUFBLENBQVEscUJBQVI7O0VBQzVCLENBQUEsQ0FBRSxJQUFGLENBQUEsR0FBNEIsR0FBRyxDQUFDLEtBQWhDOztFQUNBLEVB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QUE7QUFDVCxRQUFBO0lBQUUsR0FBQSxHQUFNLGtCQUFBLENBQW1CLEdBQW5CO0lBRU4sSUFBZSxDQUFFLENBQUksR0FBRyxDQUFDLFdBQVYsQ0FBQSxJQUE0QixDQUFFLENBQUEsS0FBSyxDQUFQLENBQTVCLElBQTJDLENBQUUsQ0FBQSxLQUFLLENBQVAsQ0FBMUQ7O0FBQUEsYUFBTyxLQUFQOztJQUNBLElBQW9CLENBQUUsU0FBQSxHQUFZLE9BQUEsQ0FBUSxDQUFSLENBQWQsQ0FBQSxLQUE2QixDQUFFLE9BQUEsQ0FBUSxDQUFSLENBQUYsQ0FBakQ7QUFBQSxhQUFPLE1BQVA7O0FBQ0EsV0FBTyxPQUFBLENBQVEsQ0FBUixFQUFXLENBQVg7RUFMQSxFQXhkVDs7O0VBZ2VBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBQUUsSUFBRjtJQUFRLFlBQVI7SUFBc0IsTUFBdEI7SUFBOEIsTUFBQSxFQUFRO0VBQXRDO0FBaGVqQiIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4ndXNlIHN0cmljdCdcblxuR1VZICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2d1eSdcbnsgYWxlcnRcbiAgZGVidWdcbiAgaGVscFxuICBpbmZvXG4gIHBsYWluXG4gIHByYWlzZVxuICB1cmdlXG4gIHdhcm5cbiAgd2hpc3BlciB9ICAgICAgICAgICAgICAgPSBHVVkudHJtLmdldF9sb2dnZXJzICdHVCdcbnsgcnByXG4gIGluc3BlY3RcbiAgZWNob1xuICByZXZlcnNlXG4gIGxvZyAgICAgfSAgICAgICAgICAgICAgID0gR1VZLnRybVxueyBJbnRlcnR5cGUgfSAgICAgICAgICAgICA9IHJlcXVpcmUgJ2ludGVydHlwZSdcbl9qa2VxdWFscyAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi9kZXBzL2prcm9zby1lcXVhbHMnXG5famt0eXBlb2YgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vZGVwcy9qa3Jvc28tdHlwZSdcbnsgaGlkZSB9ICAgICAgICAgICAgICAgICAgPSBHVVkucHJvcHNcbldHICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICd3ZWJndXknXG57IG5hbWVpdCB9ICAgICAgICAgICAgICAgID0gV0cucHJvcHNcbnsgdG9fd2lkdGggfSAgICAgICAgICAgICAgPSByZXF1aXJlICd0by13aWR0aCdcbmogICAgICAgICAgICAgICAgICAgICAgICAgPSAoIFAuLi4gKSAtPiAoIGNydW1iIGZvciBjcnVtYiBpbiBQIHdoZW4gY3J1bWI/ICkuam9pbiAnLidcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbnR5cGVzICAgICAgICAgICAgICAgICAgICAgPSBuZXcgSW50ZXJ0eXBlXG57IGlzYVxuICB0eXBlX29mXG4gIHZhbGlkYXRlXG4gIGNyZWF0ZSAgICAgICAgICAgICAgICB9ID0gdHlwZXNcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxudHlwZXMuZGVjbGFyZVxuICBndF9tZXNzYWdlX3dpZHRoOlxuICAgIHRlc3Q6ICAgICAgICAgICAgICggeCApIC0+ICggQGlzYS5jYXJkaW5hbCB4ICkgYW5kIHggPiAyXG4gIGd0X3Rlc3RfY2ZnOlxuICAgIGZpZWxkczpcbiAgICAgIGF1dG9fcmVzZXQ6ICAgICAnYm9vbGVhbidcbiAgICAgIHNob3dfcmVwb3J0OiAgICAnYm9vbGVhbidcbiAgICAgIHJlcG9ydF9jaGVja3M6ICAnYm9vbGVhbidcbiAgICAgIHNob3dfcmVzdWx0czogICAnYm9vbGVhbidcbiAgICAgIHNob3dfZmFpbHM6ICAgICAnYm9vbGVhbidcbiAgICAgIHNob3dfcGFzc2VzOiAgICAnYm9vbGVhbidcbiAgICAgIHRocm93X29uX2Vycm9yOiAnYm9vbGVhbidcbiAgICAgIHRocm93X29uX2ZhaWw6ICAnYm9vbGVhbidcbiAgICAgIG1lc3NhZ2Vfd2lkdGg6ICAnZ3RfbWVzc2FnZV93aWR0aCdcbiAgICAgIHByZWZpeDogICAgICAgICAndGV4dCdcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgIyB0aGVzZSBzaG91bGQgYmUgbWl4ZWQtaW4gZnJvbSBgZXF1YWxzX2NmZ2BfXG4gICAgICBvcmRlcmVkX29iamVjdHM6ICAnYm9vbGVhbidcbiAgICAgIG9yZGVyZWRfc2V0czogICAgICdib29sZWFuJ1xuICAgICAgb3JkZXJlZF9tYXBzOiAgICAgJ2Jvb2xlYW4nXG4gICAgICBzaWduZWRfemVybzogICAgICAnYm9vbGVhbidcbiAgICB0ZW1wbGF0ZTpcbiAgICAgIGF1dG9fcmVzZXQ6ICAgICBmYWxzZVxuICAgICAgc2hvd19yZXBvcnQ6ICAgIHRydWVcbiAgICAgIHJlcG9ydF9jaGVja3M6ICB0cnVlXG4gICAgICBzaG93X3Jlc3VsdHM6ICAgdHJ1ZVxuICAgICAgc2hvd19mYWlsczogICAgIHRydWVcbiAgICAgIHNob3dfcGFzc2VzOiAgICB0cnVlXG4gICAgICB0aHJvd19vbl9lcnJvcjogZmFsc2VcbiAgICAgIHRocm93X29uX2ZhaWw6ICBmYWxzZVxuICAgICAgbWVzc2FnZV93aWR0aDogIDMwMFxuICAgICAgcHJlZml4OiAgICAgICAgICcnXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICMgdGhlc2Ugc2hvdWxkIGJlIG1peGVkLWluIGZyb20gYGVxdWFsc19jZmdgX1xuICAgICAgb3JkZXJlZF9vYmplY3RzOiAgZmFsc2VcbiAgICAgIG9yZGVyZWRfc2V0czogICAgIGZhbHNlXG4gICAgICBvcmRlcmVkX21hcHM6ICAgICBmYWxzZVxuICAgICAgc2lnbmVkX3plcm86ICAgICAgZmFsc2VcbiAgZ3Rfc3RhdHM6XG4gICAgZmllbGRzOlxuICAgICAgcGFzc2VzOiAgICdjYXJkaW5hbCdcbiAgICAgIGZhaWxzOiAgICAnY2FyZGluYWwnXG4gICAgdGVtcGxhdGU6XG4gICAgICBwYXNzZXM6ICAgMFxuICAgICAgZmFpbHM6ICAgIDBcbiAgZ3RfdG90YWxzOiAjIyMgVEFJTlQgdXNlIGluaGVyaXRhbmNlIHRvIGRlcml2ZSBzaGFyZWQgZmllbGRzICMjI1xuICAgIGZpZWxkczpcbiAgICAgIHBhc3NlczogICAnY2FyZGluYWwnXG4gICAgICBmYWlsczogICAgJ2NhcmRpbmFsJ1xuICAgIHRlbXBsYXRlOlxuICAgICAgcGFzc2VzOiAgIDBcbiAgICAgIGZhaWxzOiAgICAwXG4gIGVxdWFsc19jZmc6XG4gICAgZmllbGRzOlxuICAgICAgb3JkZXJlZF9vYmplY3RzOiAgJ2Jvb2xlYW4nXG4gICAgICBvcmRlcmVkX3NldHM6ICAgICAnYm9vbGVhbidcbiAgICAgIG9yZGVyZWRfbWFwczogICAgICdib29sZWFuJ1xuICAgICAgc2lnbmVkX3plcm86ICAgICAgJ2Jvb2xlYW4nXG4gICAgdGVtcGxhdGU6XG4gICAgICBvcmRlcmVkX29iamVjdHM6ICBmYWxzZVxuICAgICAgb3JkZXJlZF9zZXRzOiAgICAgZmFsc2VcbiAgICAgIG9yZGVyZWRfbWFwczogICAgIGZhbHNlXG4gICAgICBzaWduZWRfemVybzogICAgICBmYWxzZVxuICAjIGd0X3JlcG9ydF9jZmc6XG4gICMgICBmaWVsZHM6XG4gICMgICAgIHByZWZpeDogICAndGV4dCdcbiAgIyAgIHRlbXBsYXRlOlxuICAjICAgICBwcmVmaXg6ICAgJydcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBfQXNzdW1wdGlvbnNcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0cnVjdG9yOiAoIGhvc3QsIHVwcmVmID0gbnVsbCApIC0+XG4gICAgaGlkZSBALCAnXycsIGhvc3RcbiAgICBoaWRlIEAsICdfdXByZWYnLCB1cHJlZlxuICAgIGhpZGUgQCwgJ2VxdWFscycsIG5hbWVpdCAnZXF1YWxzJywgKCBhLCBiICkgPT4gZXF1YWxzIGEsIGIsIEBfLmNmZ1xuICAgICMgaGlkZSBALCAncGFzcycsICAgICAgICAgbmFtZWl0ICdwYXNzJywgICAgICAgICAgKCBQLi4uICkgPT4gICAgICAgQF9wYXNzICAgICAgICAgIFAuLi5cbiAgICAjIGhpZGUgQCwgJ2ZhaWwnLCAgICAgICAgIG5hbWVpdCAnZmFpbCcsICAgICAgICAgICggUC4uLiApID0+ICAgICAgIEBfZmFpbCAgICAgICAgICBQLi4uXG4gICAgIyBoaWRlIEAsICdlcScsICAgICAgICAgICBuYW1laXQgJ2VxJywgICAgICAgICAgICAoIFAuLi4gKSA9PiAgICAgICBAX2VxICAgICAgICAgICAgUC4uLlxuICAgICMgaGlkZSBALCAnYXN5bmNfZXEnLCAgICAgbmFtZWl0ICdhc3luY19lcScsICAgICAgKCBQLi4uICkgPT4gICAgICAgQF9hc3luY19lcSAgICAgIFAuLi5cbiAgICAjIGhpZGUgQCwgJ3Rocm93cycsICAgICAgIG5hbWVpdCAndGhyb3dzJywgICAgICAgICggUC4uLiApID0+ICAgICAgIEBfdGhyb3dzICAgICAgICBQLi4uXG4gICAgIyBoaWRlIEAsICdhc3luY190aHJvd3MnLCBuYW1laXQgJ2FzeW5jX3Rocm93cycsICAoIFAuLi4gKSA9PiBhd2FpdCBAX2FzeW5jX3Rocm93cyAgUC4uLlxuICAgIHJldHVybiB1bmRlZmluZWRcblxuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIHBhc3M6ICggdXByZWYsIGNhdCwgbWVzc2FnZSA9IG51bGwgKSAtPlxuICAgIHJlZiA9ICggaiBAX3VwcmVmLCB1cHJlZiApXG4gICAgQF8uX2luY3JlbWVudF9wYXNzZXMgcmVmXG4gICAgaWYgQF8uY2ZnLnNob3dfcGFzc2VzXG4gICAgICBpZiBtZXNzYWdlP1xuICAgICAgICBtZXNzYWdlID0gQF90b19tZXNzYWdlX3dpZHRoIG1lc3NhZ2VcbiAgICAgICAgaGVscCByZWYsIGNhdCwgcmV2ZXJzZSBcIiAje21lc3NhZ2V9IFwiXG4gICAgICBlbHNlXG4gICAgICAgIGhlbHAgcmVmLCBjYXRcbiAgICByZXR1cm4gbnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZmFpbDogKCB1cHJlZiwgY2F0LCBtZXNzYWdlID0gbnVsbCApIC0+XG4gICAgcmVmID0gKCBqIEBfdXByZWYsIHVwcmVmIClcbiAgICBAXy5faW5jcmVtZW50X2ZhaWxzIHJlZlxuICAgIEBfLl93YXJuIHJlZiwgaWYgbWVzc2FnZT8gdGhlbiBcIigje2NhdH0pICN7bWVzc2FnZX1cIiBlbHNlIGNhdFxuICAgIGlmIEBfLmNmZy5zaG93X2ZhaWxzXG4gICAgICBpZiBtZXNzYWdlP1xuICAgICAgICBtZXNzYWdlID0gQF90b19tZXNzYWdlX3dpZHRoIG1lc3NhZ2VcbiAgICAgICAgd2FybiByZWYsIGNhdCwgcmV2ZXJzZSBcIiAje21lc3NhZ2V9IFwiXG4gICAgICBlbHNlXG4gICAgICAgIHdhcm4gcmVmLCBjYXRcbiAgICByZXR1cm4gbnVsbFxuXG4gICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgZXE6ICggZiwgbWF0Y2hlciApIC0+XG4gICAgc2hvcnRyZWYgID0gQF8uX3JlZl9mcm9tX2Z1bmN0aW9uIGZcbiAgICByZWYgICAgICAgPSAoIGogQF91cHJlZiwgc2hvcnRyZWYgKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgdHJ5ICggcmVzdWx0ID0gZi5jYWxsIEAsIEAgKSBjYXRjaCBlcnJvclxuICAgICAgbWVzc2FnZSA9IFwiZXhwZWN0ZWQgYSByZXN1bHQgYnV0IGdvdCBhbiBhbiBlcnJvcjogI3tycHIgZXJyb3IubWVzc2FnZX1cIlxuICAgICAgQGZhaWwgc2hvcnRyZWYsICdlcnJvcicsIG1lc3NhZ2VcbiAgICAgIGlmIEBfLmNmZy50aHJvd19vbl9lcnJvclxuICAgICAgICBlcnJvci5tZXNzYWdlID0gbWVzc2FnZTsgdGhyb3cgZXJyb3JcbiAgICAgIHJldHVybiBudWxsXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICByZXR1cm4gQHBhc3Mgc2hvcnRyZWYsICdlcScgaWYgQGVxdWFscyByZXN1bHQsIG1hdGNoZXJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHdhcm4gcmVmLCAoIHJldmVyc2UgJyBuZXEgJyApLCBcInJlc3VsdDogICAgIFwiLCAoIHJldmVyc2UgJyAnICsgKCBycHIgcmVzdWx0ICAgKSArICcgJyApXG4gICAgd2FybiByZWYsICggcmV2ZXJzZSAnIG5lcSAnICksIFwibWF0Y2hlcjogICAgXCIsICggcmV2ZXJzZSAnICcgKyAoIHJwciBtYXRjaGVyICApICsgJyAnIClcbiAgICBAZmFpbCBzaG9ydHJlZiwgJ25lcSdcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJuZXE6XFxucmVzdWx0OiAgICAgI3tycHIgcmVzdWx0fVxcbm1hdGNoZXI6ICAgICN7bWF0Y2hlcn1cIiBpZiBAXy5jZmcudGhyb3dfb25fZmFpbFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcmV0dXJuIG51bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGFzeW5jX2VxOiAoIGYsIG1hdGNoZXIgKSAtPlxuICAgIHNob3J0cmVmICA9IEBfLl9yZWZfZnJvbV9mdW5jdGlvbiBmXG4gICAgcmVmICAgICAgID0gKCBqIEBfdXByZWYsIHNob3J0cmVmIClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHRyeSAoIHJlc3VsdCA9IGF3YWl0IGYuY2FsbCBALCBAICkgY2F0Y2ggZXJyb3JcbiAgICAgIG1lc3NhZ2UgPSBcImV4cGVjdGVkIGEgcmVzdWx0IGJ1dCBnb3QgYW4gYW4gZXJyb3I6ICN7cnByIGVycm9yLm1lc3NhZ2V9XCJcbiAgICAgIEBmYWlsIHNob3J0cmVmLCAnZXJyb3InLCBtZXNzYWdlXG4gICAgICBpZiBAXy5jZmcudGhyb3dfb25fZXJyb3JcbiAgICAgICAgZXJyb3IubWVzc2FnZSA9IG1lc3NhZ2U7IHRocm93IGVycm9yXG4gICAgICByZXR1cm4gbnVsbFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcmV0dXJuIEBwYXNzIHNob3J0cmVmLCAnZXEnIGlmIEBlcXVhbHMgcmVzdWx0LCBtYXRjaGVyXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB3YXJuIHJlZiwgKCByZXZlcnNlICcgbmVxICcgKSwgXCJyZXN1bHQ6ICAgICBcIiwgKCByZXZlcnNlICcgJyArICggcnByIHJlc3VsdCAgICkgKyAnICcgKVxuICAgIHdhcm4gcmVmLCAoIHJldmVyc2UgJyBuZXEgJyApLCBcIm1hdGNoZXI6ICAgIFwiLCAoIHJldmVyc2UgJyAnICsgKCBycHIgbWF0Y2hlciAgKSArICcgJyApXG4gICAgQGZhaWwgc2hvcnRyZWYsICduZXEnXG4gICAgdGhyb3cgbmV3IEVycm9yIFwibmVxOlxcbnJlc3VsdDogICAgICN7cnByIHJlc3VsdH1cXG5tYXRjaGVyOiAgICAje21hdGNoZXJ9XCIgaWYgQF8uY2ZnLnRocm93X29uX2ZhaWxcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHJldHVybiBudWxsXG5cbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICB0aHJvd3M6ICggZiwgbWF0Y2hlciApIC0+XG4gICAgc2hvcnRyZWYgID0gQF8uX3JlZl9mcm9tX2Z1bmN0aW9uIGZcbiAgICByZWYgICAgICAgPSAoIGogQF91cHJlZiwgc2hvcnRyZWYgKVxuICAgIGVycm9yICAgICA9IG51bGxcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHRyeSAoIHVyZ2UgKCBqIEBfdXByZWYsIHNob3J0cmVmLCAnzqlndF9fXzEnICksIFwiYHRocm93cygpYCByZXN1bHQgb2YgY2FsbDpcIiwgcnByIGYuY2FsbCBALCBAICkgY2F0Y2ggZXJyb3JcbiAgICAgIHVubGVzcyBtYXRjaGVyP1xuICAgICAgICBAcGFzcyBzaG9ydHJlZiwgJ2Vycm9yIG9rJywgZXJyb3IubWVzc2FnZVxuICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzd2l0Y2ggbWF0Y2hlcl90eXBlID0gQF8uX21hdGNoX2Vycm9yIGVycm9yLCBtYXRjaGVyXG4gICAgICAgIHdoZW4gdHJ1ZVxuICAgICAgICAgIEBwYXNzIHNob3J0cmVmLCAnZXJyb3Igb2snLCBlcnJvci5tZXNzYWdlXG4gICAgICAgIHdoZW4gZmFsc2VcbiAgICAgICAgICB1cmdlICggaiBAX3VwcmVmLCBzaG9ydHJlZiwgJ86pZ3RfX18yJyApLCBcImVycm9yICAgICAgICBcIiwgcmV2ZXJzZSBlcnJvci5tZXNzYWdlICAjIyMgVEFJTlQgdG8gYmUgcmVwbGFjZWQgIyMjXG4gICAgICAgICAgd2FybiAoIGogQF91cHJlZiwgc2hvcnRyZWYsICfOqWd0X19fMycgKSwgXCJkb2Vzbid0IG1hdGNoXCIsIHJldmVyc2UgcnByIG1hdGNoZXIgICAgIyMjIFRBSU5UIHRvIGJlIHJlcGxhY2VkICMjI1xuICAgICAgICAgIEBmYWlsIHNob3J0cmVmLCAnbmVxJywgXCJlcnJvciAje3JwciBlcnJvci5tZXNzYWdlfSBkb2Vzbid0IG1hdGNoICN7cnByIG1hdGNoZXJ9XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBmYWlsIHNob3J0cmVmLCAndHlwZScsIFwiZXhwZWN0ZWQgYSByZWdleCBvciBhIHRleHQsIGdvdCBhICN7bWF0Y2hlcl90eXBlfVwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB1bmxlc3MgZXJyb3I/XG4gICAgICBAZmFpbCBzaG9ydHJlZiwgJ25vZXJyJywgXCJleHBlY3RlZCBhbiBlcnJvciBidXQgbm9uZSB3YXMgdGhyb3duXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHJldHVybiBudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBhc3luY190aHJvd3M6ICggZiwgbWF0Y2hlciApIC0+ICMgbmV3IFByb21pc2UgKCByZXNvbHZlLCByZWplY3QgKSA9PlxuICAgICMjI1xuXG4gICAgKiBuZWVkcyBgZmAgdG8gYmUgYW4gYGFzeW5jZnVuY3Rpb25gIChhbHRob3VnaCBgZnVuY3Rpb25gIHdpbGwgYWxzbyB3b3JrPyBiZXR0ZXIgY2hlY2sgYW55d2F5PylcbiAgICAqIHVzZXMgYHRyeWAgLyBgZXhjZXB0YCBjbGF1c2UgdG8gYGF3YWl0YCBgcmVzdWx0YCBvZiBjYWxsaW5nIGBmYFxuICAgICogaW4gY2FzZSBgcmVzdWx0YCBpcyBkZWxpdmVyZWQsIHRoYXQncyBhbiBlcnJvclxuICAgICogb3RoZXJ3aXNlIGFuIGBlcnJvcmAgd2lsbCBiZSBjYXVnaHQ7XG4gICAgICAqIHN1Y2Nlc3Mgd2hlbiBgbWF0Y2hlcmAgaXMgbWlzc2luZywgb3IgZWxzZSwgd2hlbiBgbWF0Y2hlcmAgZGVzY3JpYmVzIGBlcnJvci5tZXNzYWdlYDtcbiAgICAgICogZmFpbHVyZSBvdGhlcndpc2VcblxuICAgICMjI1xuICAgICMjIyBUQUlOVCBjaGVjayB3aGV0aGVyIGBmYCBpcyBgYXN5bmNmdW5jdGlvbmA/ICMjI1xuICAgIHNob3J0cmVmICA9IEBfLl9yZWZfZnJvbV9mdW5jdGlvbiBmXG4gICAgcmVmICAgICAgID0gKCBqIEBfdXByZWYsIHNob3J0cmVmIClcbiAgICBlcnJvciAgICAgPSBudWxsXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB0cnlcbiAgICAgIHJlc3VsdCA9IGF3YWl0IGYuY2FsbCBALCBAXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBjYXRjaCBlcnJvclxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB1bmxlc3MgbWF0Y2hlcj9cbiAgICAgICAgQHBhc3Mgc2hvcnRyZWYsICdlcnJvciBvaycsIFwiZGlkIHRocm93ICN7cnByIGVycm9yLm1lc3NhZ2V9XCJcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc3dpdGNoIG1hdGNoZXJfdHlwZSA9IEBfLl9tYXRjaF9lcnJvciBlcnJvciwgbWF0Y2hlclxuICAgICAgICB3aGVuIHRydWVcbiAgICAgICAgICBAcGFzcyBzaG9ydHJlZiwgJ2Vycm9yIG9rJywgXCJkaWQgdGhyb3cgI3tycHIgZXJyb3IubWVzc2FnZX1cIlxuICAgICAgICB3aGVuIGZhbHNlXG4gICAgICAgICAgdXJnZSBcIiN7cmVmfS7OqWd0X19fNCBlcnJvciAgICAgICAgXCIsIHJldmVyc2UgZXJyb3IubWVzc2FnZVxuICAgICAgICAgIHdhcm4gXCIje3JlZn0uzqlndF9fXzUgZG9lc24ndCBtYXRjaFwiLCByZXZlcnNlIHJwciBtYXRjaGVyXG4gICAgICAgICAgQGZhaWwgc2hvcnRyZWYsICdlcnJvciBub2snLCBcImRpZCB0aHJvdyBidXQgbm90IG1hdGNoICN7cnByIGVycm9yLm1lc3NhZ2V9XCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIEBmYWlsIHNob3J0cmVmLCAnZmFpbCcsIFwiZXhwZWN0ZWQgYSByZWdleCBvciBhIHRleHQgZm9yIG1hdGNoZXIsIGdvdCBhICN7bWF0Y2hlcl90eXBlfVwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB1bmxlc3MgZXJyb3I/XG4gICAgICBAZmFpbCBzaG9ydHJlZiwgJ21pc3NpbmcnLCBcImV4cGVjdGVkIGFuIGVycm9yIGJ1dCBub25lIHdhcyB0aHJvd24sIGluc3RlYWQgZ290IHJlc3VsdCAje3JwciByZXN1bHR9XCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHJldHVybiBudWxsXG5cbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBfbWF0Y2hfZXJyb3I6ICggZXJyb3IsIG1hdGNoZXIgKSAtPlxuICAgIHN3aXRjaCBtYXRjaGVyX3R5cGUgPSB0eXBlX29mIG1hdGNoZXJcbiAgICAgIHdoZW4gJ3RleHQnXG4gICAgICAgIHJldHVybiBlcnJvci5tZXNzYWdlIGlzIG1hdGNoZXJcbiAgICAgIHdoZW4gJ3JlZ2V4J1xuICAgICAgICBtYXRjaGVyLmxhc3RJbmRleCA9IDBcbiAgICAgICAgcmV0dXJuIG1hdGNoZXIudGVzdCBlcnJvci5tZXNzYWdlXG4gICAgcmV0dXJuIG1hdGNoZXJfdHlwZVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX3RvX21lc3NhZ2Vfd2lkdGg6ICggbWVzc2FnZSApIC0+ICggdG9fd2lkdGggbWVzc2FnZSwgQF8uY2ZnLm1lc3NhZ2Vfd2lkdGggKS50cmltRW5kKClcblxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgVGVzdCBleHRlbmRzIF9Bc3N1bXB0aW9uc1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY29uc3RydWN0b3I6ICggY2ZnICkgLT5cbiAgICBzdXBlciBudWxsOyBAXyA9IEBcbiAgICBAY2ZnID0gT2JqZWN0LmZyZWV6ZSBjcmVhdGUuZ3RfdGVzdF9jZmcgY2ZnXG4gICAgQHRvdGFscyA9IGNyZWF0ZS5ndF90b3RhbHMoKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaGlkZSBALCAndGVzdCcsICAgICAgICAgbmFtZWl0ICd0ZXN0JywgICAgICAgICAgKCBQLi4uICkgPT4gICAgICAgQF90ZXN0ICAgICAgICAgIFAuLi5cbiAgICBoaWRlIEAsICdhc3luY190ZXN0JywgICBuYW1laXQgJ2FzeW5jX3Rlc3QnLCAgICAoIFAuLi4gKSA9PiBhd2FpdCBAX2FzeW5jX3Rlc3QgICAgUC4uLlxuICAgIGhpZGUgQCwgJ3JlcG9ydCcsICAgICAgIG5hbWVpdCAncmVwb3J0JywgICAgICAgICggUC4uLiApID0+ICAgICAgIEBfcmVwb3J0ICAgICAgICBQLi4uXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBoaWRlIEAsICdfS1dfdGVzdF9yZWYnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAn4paI4paIX0tXX3Rlc3RfcmVmJ1xuICAgIGhpZGUgQCwgJ3N0YXRzJywgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgJyonOiBAdG90YWxzLCB9XG4gICAgaGlkZSBALCAnd2FybmluZ3MnLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAge31cbiAgICByZXR1cm4gdW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfdGVzdDogKCB0ZXN0cy4uLiApIC0+XG4gICAgQF90ZXN0X2lubmVyIG51bGwsIHRlc3RzLi4uXG4gICAgQHJlcG9ydCgpIGlmIEBjZmcuc2hvd19yZXBvcnRcbiAgICBwcm9jZXNzLmV4aXRDb2RlID0gOTkgaWYgQHRvdGFscy5mYWlscyBpc250IDBcbiAgICByZXR1cm4gQHN0YXRzXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfYXN5bmNfdGVzdDogKCB0ZXN0cy4uLiApIC0+XG4gICAgYXdhaXQgQF9hc3luY190ZXN0X2lubmVyIG51bGwsIHRlc3RzLi4uXG4gICAgQHJlcG9ydCgpIGlmIEBjZmcuc2hvd19yZXBvcnRcbiAgICBwcm9jZXNzLmV4aXRDb2RlID0gOTkgaWYgQHRvdGFscy5mYWlscyBpc250IDBcbiAgICByZXR1cm4gQHN0YXRzXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfdGVzdF9pbm5lcjogKCB1cHJlZiwgdGVzdHMuLi4gKSAtPlxuICAgICMjIyBUQUlOVCBwcmVsaW1pbmFyeSBoYW5kbGluZyBvZiBhcmd1bWVudHMgIyMjXG4gICAgZm9yIGNhbmRpZGF0ZSBpbiB0ZXN0cyB0aGVuIHN3aXRjaCB0cnVlXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHdoZW4gaXNhLmZ1bmN0aW9uIGNhbmRpZGF0ZVxuICAgICAgICB0cnlcbiAgICAgICAgICBjdHggPSBuZXcgX0Fzc3VtcHRpb25zIEAsIHVwcmVmXG4gICAgICAgICAgY2FuZGlkYXRlLmNhbGwgY3R4LCBjdHhcbiAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICAjIHJlZiAgICAgPSAoIGogdXByZWYsICfOqWd0X19fNicgKVxuICAgICAgICAgIHJlZiAgICAgPSB1cHJlZlxuICAgICAgICAgIG1lc3NhZ2UgPSBcImFuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJyZWQgd2hlbiBjYWxsaW5nIHRhc2sgI3tycHIgcmVmfTsgI3tycHIgZXJyb3IubWVzc2FnZX1cIlxuICAgICAgICAgIEBmYWlsIHJlZiwgJ2Vycm9yJywgbWVzc2FnZVxuICAgICAgICAgIGlmIEBjZmcudGhyb3dfb25fZXJyb3JcbiAgICAgICAgICAgIGVycm9yLm1lc3NhZ2UgPSBtZXNzYWdlOyB0aHJvdyBlcnJvclxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB3aGVuIGlzYS5vYmplY3QgY2FuZGlkYXRlXG4gICAgICAgIGZvciBrZXksIHByb3BlcnR5IG9mIGNhbmRpZGF0ZVxuICAgICAgICAgIEBfdGVzdF9pbm5lciAoIGogdXByZWYsIGtleSApLCBwcm9wZXJ0eVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB3aGVuIG5vdCBjYW5kaWRhdGU/XG4gICAgICAgICMgcmVmICAgICA9ICggaiB1cHJlZiwgJ86pZ3RfX183JyApXG4gICAgICAgIHJlZiAgICAgPSB1cHJlZlxuICAgICAgICBAZmFpbCByZWYsICdtaXNzaW5nJywgXCJleHBlY3RlZCBhIHRlc3QsIGdvdCBhICN7dHlwZV9vZiBjYW5kaWRhdGV9XCJcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgZWxzZVxuICAgICAgICByZWYgPSAoIGogdXByZWYsIEBfcmVmX2Zyb21fZnVuY3Rpb24gY2FuZGlkYXRlIClcbiAgICAgICAgQGZhaWwgcmVmLCAndHlwZScsIFwiZXhwZWN0ZWQgYSB0ZXN0LCBnb3QgYSAje3R5cGVfb2YgY2FuZGlkYXRlfVwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICByZXR1cm4gbnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX2FzeW5jX3Rlc3RfaW5uZXI6ICggdXByZWYsIHRlc3RzLi4uICkgLT5cbiAgICBmb3IgY2FuZGlkYXRlIGluIHRlc3RzIHRoZW4gc3dpdGNoIHRydWVcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgd2hlbiBpc2EuZnVuY3Rpb24gY2FuZGlkYXRlXG4gICAgICAgIGF3YWl0IEBfdGVzdF9pbm5lciB1cHJlZiwgY2FuZGlkYXRlXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHdoZW4gaXNhLmFzeW5jZnVuY3Rpb24gY2FuZGlkYXRlXG4gICAgICAgIHRyeVxuICAgICAgICAgIGN0eCA9IG5ldyBfQXNzdW1wdGlvbnMgQCwgdXByZWZcbiAgICAgICAgICBhd2FpdCBjYW5kaWRhdGUuY2FsbCBjdHgsIGN0eFxuICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgIHJlZiAgICAgPSAoIGogdXByZWYsICfOqWd0X19fOCcgKVxuICAgICAgICAgIG1lc3NhZ2UgPSBcImFuIHVuZXhwZWN0ZWQgZXJyb3Igb2NjdXJyZWQgd2hlbiBjYWxsaW5nIHRhc2sgI3tycHIgcmVmfTsgI3tycHIgZXJyb3IubWVzc2FnZX1cIlxuICAgICAgICAgIEBmYWlsIHJlZiwgJ2Vycm9yJywgbWVzc2FnZVxuICAgICAgICAgIGlmIEBjZmcudGhyb3dfb25fZXJyb3JcbiAgICAgICAgICAgIGVycm9yLm1lc3NhZ2UgPSBtZXNzYWdlOyB0aHJvdyBlcnJvclxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB3aGVuIGlzYS5vYmplY3QgY2FuZGlkYXRlXG4gICAgICAgIGZvciBrZXksIHByb3BlcnR5IG9mIGNhbmRpZGF0ZVxuICAgICAgICAgIGF3YWl0IEBfYXN5bmNfdGVzdF9pbm5lciAoIGogdXByZWYsIGtleSApLCBwcm9wZXJ0eVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBlbHNlXG4gICAgICAgIHJlZiA9ICggaiB1cHJlZiwgQF9yZWZfZnJvbV9mdW5jdGlvbiBjYW5kaWRhdGUgKVxuICAgICAgICBAZmFpbCByZWYsICd0eXBlJywgXCJleHBlY3RlZCBhIHRlc3QsIGdvdCBhICN7dHlwZV9vZiBjYW5kaWRhdGV9XCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHJldHVybiBudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfcmVwb3J0OiAtPlxuICAgIHsgYmx1ZVxuICAgICAgcmVkXG4gICAgICBnb2xkICAgIH0gPSBHVVkudHJtXG4gICAgbGluZSAgICAgICAgPSBnb2xkICfigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJTigJQnXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBzaG93X3RvdGFscyA9ID0+XG4gICAgICB3aGlzcGVyICfOqWd0X19fOSAnICsgQGNmZy5wcmVmaXgsIGxpbmVcbiAgICAgIHdoaXNwZXIgJ86pZ3RfXzEwICcgKyBAY2ZnLnByZWZpeCwgcmV2ZXJzZSBHVVkudHJtWyBjb2xvciBdICggJyonLnBhZEVuZCAyMCApLCBAdG90YWxzXG4gICAgICB3aGlzcGVyICfOqWd0X18xMSAnICsgQGNmZy5wcmVmaXgsIGxpbmVcbiAgICAgIHJldHVybiBudWxsXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB3aGlzcGVyKClcbiAgICB3aGlzcGVyICfOqWd0X18xMiAnICsgQGNmZy5wcmVmaXgsIGxpbmVcbiAgICB3aGlzcGVyICfOqWd0X18xMyAnICsgQGNmZy5wcmVmaXgsIGdvbGQgJyAgICAgICAgICAgICAgICAgICAgICAgIPCfmaQgIEdVWSBURVNUIPCfmaYnXG4gICAgY29sb3IgPSBpZiBAdG90YWxzLmZhaWxzIGlzIDAgdGhlbiAnbGltZScgZWxzZSAncmVkJ1xuICAgIGlmIEBjZmcucmVwb3J0X2NoZWNrc1xuICAgICAgd2hpc3BlciAnzqlndF9fMTQgJyArIEBjZmcucHJlZml4LCBsaW5lXG4gICAgICBmb3Iga2V5LCBzdGF0cyBvZiBAc3RhdHNcbiAgICAgICAgY29udGludWUgaWYga2V5IGlzICcqJ1xuICAgICAgICB3aGlzcGVyICfOqWd0X18xNSAnICsgQGNmZy5wcmVmaXgsIGJsdWUgKCBrZXkucGFkRW5kIDIwICksIHN0YXRzXG4gICAgc2hvd190b3RhbHMoKVxuICAgIHJlcGVhdF90b3RhbHMgPSBmYWxzZVxuICAgIGZvciBzdWJfcmVmLCBtZXNzYWdlcyBvZiBAd2FybmluZ3NcbiAgICAgIHJlcGVhdF90b3RhbHMgPSB0cnVlXG4gICAgICBmb3IgbWVzc2FnZSBpbiBtZXNzYWdlc1xuICAgICAgICB3aGlzcGVyICfOqWd0X18xNiAnICsgQGNmZy5wcmVmaXgsICggcmVkIHN1Yl9yZWYgKSwgcmV2ZXJzZSByZWQgXCIgI3ttZXNzYWdlfSBcIlxuICAgIHNob3dfdG90YWxzKCkgaWYgcmVwZWF0X3RvdGFsc1xuICAgIHdoaXNwZXIoKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcmV0dXJuIEBzdGF0c1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX2luY3JlbWVudF9wYXNzZXM6ICAoIGNoZWNrX3JlZiApIC0+IEBfaW5jcmVtZW50ICdwYXNzZXMnLCBjaGVja19yZWZcbiAgX2luY3JlbWVudF9mYWlsczogICAoIGNoZWNrX3JlZiApIC0+IEBfaW5jcmVtZW50ICdmYWlscycsICBjaGVja19yZWZcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9pbmNyZW1lbnQ6ICggcGFzc19vcl9mYWlsLCBjaGVja19yZWYgKSAtPlxuICAgIHBlcl9jaGVja19zdGF0cyA9IEBzdGF0c1sgY2hlY2tfcmVmIF0gPz0gY3JlYXRlLmd0X3N0YXRzKClcbiAgICBwZXJfY2hlY2tfc3RhdHNbICBwYXNzX29yX2ZhaWwgXSsrXG4gICAgQHRvdGFsc1sgICAgICAgICAgcGFzc19vcl9mYWlsIF0rK1xuICAgIHJldHVybiBudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfd2FybjogKCByZWYsIG1lc3NhZ2UgKSAtPlxuICAgICggQHdhcm5pbmdzWyByZWYgXSA/PSBbXSApLnB1c2ggKCBtZXNzYWdlID8gJy4vLicgKVxuICAgIHJldHVybiBudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfcmVmX2Zyb21fZnVuY3Rpb246ICggZiApIC0+XG4gICAgUiA9ICdhbm9uJyBpZiAoIFIgPSBmLm5hbWUgKSBpcyAnJ1xuICAgICMgdGhyb3cgbmV3IEVycm9yIFwiXjk5Mi0xXiB0ZXN0IG1ldGhvZCBzaG91bGQgYmUgbmFtZWQsIGdvdCAje3JwciBmfVwiIGlmICggUiA9IGYubmFtZSApIGlzICcnXG4gICAgcmV0dXJuIFJcblxuXG5cbiMgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jICMgU0VUIEVRVUFMSVRZIEJZIFZBTFVFXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBlcXVhbHMgPSAoIGEsIGIsIGNmZyApIC0+XG4jICAgY2ZnID0gX2NyZWF0ZV9lcXVhbHNfY2ZnIGNmZ1xuIyAgICMjIyBOT1RFIHRoZXNlIGNvbXBhcmlzb25zIGRpc3JlZ2FyZCBzaWduIG9mIHplcm8gIyMjXG4jICAgcmV0dXJuIHRydWUgaWYgKCBub3QgY2ZnLnNpZ25lZF96ZXJvICkgYW5kICggYSBpcyAwICkgYW5kICggYiBpcyAwIClcbiMgICByZXR1cm4gZmFsc2UgdW5sZXNzICggdHlwZV9vZl9hID0gdHlwZV9vZiBhICkgaXMgKCB0eXBlX29mIGIgKVxuIyAgIGlmICggdHlwZV9vZl9hIGlzICdzZXQnIClcbiMgICAgIHJldHVybiBfb3JkZXJlZF9zZXRzX29yX21hcHNfYXJlX2VxdWFsICAgIGEsIGIsIGNmZyBpZiBjZmcub3JkZXJlZF9zZXRzXG4jICAgICByZXR1cm4gX3Vub3JkZXJlZF9zZXRzX29yX21hcHNfYXJlX2VxdWFsICBhLCBiLCBjZmdcbiMgICBpZiAoIHR5cGVfb2ZfYSBpcyAnbWFwJyApXG4jICAgICByZXR1cm4gX29yZGVyZWRfc2V0c19vcl9tYXBzX2FyZV9lcXVhbCAgICBhLCBiLCBjZmcgaWYgY2ZnLm9yZGVyZWRfbWFwc1xuIyAgICAgcmV0dXJuIF91bm9yZGVyZWRfc2V0c19vcl9tYXBzX2FyZV9lcXVhbCAgYSwgYiwgY2ZnXG4jICAgUiA9IF9qa2VxdWFscyBhLCBiXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICMjIyBUQUlOVCB0aGlzIHJlcGVhdHMgd29yayBhbHJlYWR5IGRvbmUgYnkgX2prZXF1YWxzIGFuZCBzaG91bGQgYmUgaW1wbGVtZW50ZWQgaW4gdGhhdCBtb2R1bGUgIyMjXG4jICAgaWYgUiBhbmQgY2ZnLm9yZGVyZWRfb2JqZWN0cyBhbmQgKCBfamt0eXBlb2YgYSApIGlzICdvYmplY3QnXG4jICAgICByZXR1cm4gX2prZXF1YWxzICggayBmb3IgayBvZiBhIHdoZW4gayBpc250ICdjb25zdHJ1Y3RvcicgKSwgKCBrIGZvciBrIG9mIGIgd2hlbiBrIGlzbnQgJ2NvbnN0cnVjdG9yJyApXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgIHJldHVybiBSXG4jICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyBfc2V0X29yX21hcF9jb250YWlucyA9ICggc2V0X29yX21hcCwgZWxlbWVudCwgY2ZnICkgLT5cbiMgICBmb3IgZWxlbWVudF8yIGZyb20gc2V0X29yX21hcFxuIyAgICAgaWYgZXF1YWxzIGVsZW1lbnRfMiwgZWxlbWVudCwgY2ZnXG4jICAgICAgIHJldHVybiB0cnVlXG4jICAgcmV0dXJuIGZhbHNlXG4jICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyBfb3JkZXJlZF9zZXRzX29yX21hcHNfYXJlX2VxdWFsID0gKCBhLCBiLCBjZmcgKSAtPlxuIyAgICMjIyBUQUlOVCBvbmx5IHVzZSBpZiBib3RoIGEsIGIgaGF2ZSBzYW1lIHR5cGUgYW5kIHR5cGUgaXMgYHNldGAgb3IgYG1hcGAgIyMjXG4jICAgcmV0dXJuIGZhbHNlIHVubGVzcyBhLnNpemUgaXMgYi5zaXplXG4jICAgaWR4ID0gLTFcbiMgICBlbnRyaWVzX29mX2IgPSBbIGIuLi4sIF1cbiMgICBmb3IgZWxlbWVudCBmcm9tIGFcbiMgICAgIGlkeCsrXG4jICAgICByZXR1cm4gZmFsc2UgdW5sZXNzIGVxdWFscyBlbGVtZW50LCBlbnRyaWVzX29mX2JbIGlkeCBdLCBjZmdcbiMgICByZXR1cm4gdHJ1ZVxuIyAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgX3Vub3JkZXJlZF9zZXRzX29yX21hcHNfYXJlX2VxdWFsID0gKCBhLCBiLCBjZmcgKSAtPlxuIyAgICMjIyBUQUlOVCBvbmx5IHVzZSBpZiBib3RoIGEsIGIgaGF2ZSBzYW1lIHR5cGUgYW5kIHR5cGUgaXMgYHNldGAgb3IgYG1hcGAgIyMjXG4jICAgcmV0dXJuIGZhbHNlIHVubGVzcyBhLnNpemUgaXMgYi5zaXplXG4jICAgZm9yIGVsZW1lbnQgZnJvbSBhXG4jICAgICByZXR1cm4gZmFsc2UgdW5sZXNzIF9zZXRfb3JfbWFwX2NvbnRhaW5zIGIsIGVsZW1lbnQsIGNmZ1xuIyAgIHJldHVybiB0cnVlXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbl9jcmVhdGVfZXF1YWxzX2NmZyA9ICggY2ZnICkgLT5cbiAgcmV0dXJuIFIgaWYgKCBSID0gX2tub3duX2VxdWFsc19jZmdzLmdldCBjZmcgKT9cbiAgX2tub3duX2VxdWFsc19jZmdzLnNldCBjZmcsIFIgPSBjcmVhdGUuZXF1YWxzX2NmZyBjZmdcbiAgcmV0dXJuIFJcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuX2tub3duX2VxdWFsc19jZmdzID0gbmV3IE1hcCgpXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgU0VUIEVRVUFMSVRZIEJZIFZBTFVFXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbl9lcXVhbHMgPSAoIHJlcXVpcmUgJ25vZGU6dXRpbCcgKS5pc0RlZXBTdHJpY3RFcXVhbFxuZXF1YWxzID0gKCBhLCBiLCBjZmcgKSAtPlxuICBjZmcgPSBfY3JlYXRlX2VxdWFsc19jZmcgY2ZnXG4gICMjIyBOT1RFIHRoZXNlIGNvbXBhcmlzb25zIGRpc3JlZ2FyZCBzaWduIG9mIHplcm8gIyMjXG4gIHJldHVybiB0cnVlIGlmICggbm90IGNmZy5zaWduZWRfemVybyApIGFuZCAoIGEgaXMgMCApIGFuZCAoIGIgaXMgMCApXG4gIHJldHVybiBmYWxzZSB1bmxlc3MgKCB0eXBlX29mX2EgPSB0eXBlX29mIGEgKSBpcyAoIHR5cGVfb2YgYiApXG4gIHJldHVybiBfZXF1YWxzIGEsIGJcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5tb2R1bGUuZXhwb3J0cyA9IHsgVGVzdCwgX0Fzc3VtcHRpb25zLCBlcXVhbHMsIF90eXBlczogdHlwZXMsIH1cbiJdfQ==
//# sourceURL=../src/main.coffee