(function() {
  'use strict';
  var ASYNC, CND, alert, badge, debug, echo, equals, help, info, inspect, is_callable, jr, log, njs_domain, rpr, rpr_settings, type_of, types, urge, warn, whisper, xdebug,
    splice = [].splice;

  //###########################################################################################################
  njs_domain = require('domain');

  //...........................................................................................................
  CND = require('cnd');

  // rpr                       = CND.rpr.bind CND
  badge = 'TEST';

  log = CND.get_logger('plain', badge);

  info = CND.get_logger('info', badge);

  whisper = CND.get_logger('whisper', badge);

  alert = CND.get_logger('alert', badge);

  debug = CND.get_logger('debug', badge);

  warn = CND.get_logger('warn', badge);

  help = CND.get_logger('help', badge);

  urge = CND.get_logger('urge', badge);

  echo = CND.echo.bind(CND);

  //...........................................................................................................
  ASYNC = require('async');

  // DIFF                      = require 'diff'
  // { jr }                    = CND
  //-----------------------------------------------------------------------------------------------------------
  rpr = jr = function(...P) {
    var x;
    return ((function() {
      var i, len, results;
      results = [];
      for (i = 0, len = P.length; i < len; i++) {
        x = P[i];
        results.push(inspect(x, rpr_settings));
      }
      return results;
    })()).join(' ');
  };

  ({inspect} = require('util'));

  rpr_settings = {
    depth: 2e308,
    maxArrayLength: 2e308,
    breakLength: 2e308,
    compact: true
  };

  //-----------------------------------------------------------------------------------------------------------
  types = new (require('intertype')).Intertype();

  ({type_of, equals} = types);

  is_callable = function(x) {
    var ref;
    return (ref = type_of(x)) === 'function' || ref === 'asyncfunction';
  };

  xdebug = function(...P) {
    return debug(CND.reverse(P[0]), ...P.slice(1));
  };

  xdebug = function() {};

  xdebug('^guy-test@45648-1^');

  //===========================================================================================================
  // TEST RUNNER
  //-----------------------------------------------------------------------------------------------------------
  module.exports = function(x, settings = null) {
    var new_result_handler_and_tester, report, run, stats;
    xdebug('^guy-test@45648-2^');
    /* TAINT should accept a handler in case testing contains asynchronous functions */
    /* Timeout for asynchronous operations: */
    if (settings == null) {
      settings = {};
    }
    if (settings['timeout'] == null) {
      settings['timeout'] = 10e3;
    }
    //.........................................................................................................
    stats = {
      'test-count': 0,
      'check-count': 0,
      'meta-count': 0,
      'pass-count': 0,
      'fail-count': 0,
      'failures': {}
    };
    xdebug('^guy-test@45648-3^');
    //=========================================================================================================

    //---------------------------------------------------------------------------------------------------------
    new_result_handler_and_tester = function(test_name) {
      var RH, T, keeper_id;
      RH = {
        'name': test_name
      };
      T = {
        'name': test_name,
        _halt_on_error: false
      };
      keeper_id = null;
      //=======================================================================================================
      // TIMEOUT KEEPER
      //-------------------------------------------------------------------------------------------------------
      RH.call_with_timeout = function(timeout, method, ...P) {
        var handler, keeper, ref;
        ref = P, [...P] = ref, [handler] = splice.call(P, -1);
        //.....................................................................................................
        keeper = () => {
          // clearTimeout keeper_id
          keeper_id = null;
          warn(`(test: ${rpr(test_name)}) timeout reached; proceeding with error`);
          return handler(new Error(`µ65513 sorry, timeout reached (${rpr(timeout)}ms) (${rpr(test_name)})`));
        };
        //.....................................................................................................
        keeper_id = setTimeout(keeper, timeout);
        whisper(`started:   ${rpr(test_name)}`);
        //.....................................................................................................
        return method(...P, (...P1) => {
          if (keeper_id != null) {
            this.clear_timeout();
            return handler(...P1);
          }
          return whisper(`(test: ${rpr(test_name)}) timeout already reached; ignoring`);
        });
      };
      //-------------------------------------------------------------------------------------------------------
      RH.clear_timeout = function() {
        if (keeper_id != null) {
          // debug '©9XSyM', "clearing timeout for #{rpr test_name}"
          clearTimeout(keeper_id);
          keeper_id = null;
          return true;
        }
        return false;
      };
      //-------------------------------------------------------------------------------------------------------
      // COMPLETION / SUCCESS / ERROR
      //-------------------------------------------------------------------------------------------------------
      RH.on_completion = function(handler) {
        this.clear_timeout();
        whisper(`completed: ${rpr(test_name)}`);
        return handler();
      };
      //-------------------------------------------------------------------------------------------------------
      RH.on_success = function() {
        stats['pass-count'] += 1;
        return null;
      };
      //-------------------------------------------------------------------------------------------------------
      RH.on_error = function(delta, checked, error) {
        var entry, failures, ref;
        xdebug('^guy-test@45648-4^');
        xdebug('^guy-test@45648-5^', T._halt_on_error);
        if (T._halt_on_error) {
          throw error;
        }
        // @clear_timeout()
        stats['fail-count'] += +1;
        if (error == null) {
          delta += +1;
        }
        try {
          entry = CND.get_caller_info(delta, error, true);
        } catch (error1) {
          xdebug('^guy-test@45648-6^', T._halt_on_error);
          throw error;
        }
        if (entry == null) {
          throw error;
        }
        entry['checked'] = checked;
        entry['message'] = (ref = error != null ? error['message'] : void 0) != null ? ref : "µ66278 Guy-test: received `null` as error";
        failures = stats['failures'];
        (failures[test_name] != null ? failures[test_name] : failures[test_name] = []).push(entry);
        return null;
      };
      //-------------------------------------------------------------------------------------------------------
      // CHECKS
      //-------------------------------------------------------------------------------------------------------
      T.eq = function(...P) {
        var message, p, rpr_p;
        stats['check-count'] += 1;
        if (equals(...P)) {
          return RH.on_success();
        } else {
          rpr_p = ((function() {
            var i, len, results;
            results = [];
            for (i = 0, len = P.length; i < len; i++) {
              p = P[i];
              results.push(rpr(p));
            }
            return results;
          })()).join('\n');
          message = `not equal:\n${rpr_p}`;
          return RH.on_error(1, true, new Error(message));
        }
      };
      //-------------------------------------------------------------------------------------------------------
      T.noteq = function(...P) {
        var message, p, rpr_p;
        stats['check-count'] += 1;
        if (!equals(...P)) {
          return RH.on_success();
        } else {
          rpr_p = ((function() {
            var i, len, results;
            results = [];
            for (i = 0, len = P.length; i < len; i++) {
              p = P[i];
              results.push(rpr(p));
            }
            return results;
          })()).join('\n');
          message = `not equal:\n${rpr_p}`;
          return RH.on_error(1, true, new Error(message));
        }
      };
      //-------------------------------------------------------------------------------------------------------
      T.ok = function(result) {
        /* Tests whether `result` is strictly `true` (not only true-ish). */
        stats['check-count'] += 1;
        if (result === true) {
          return RH.on_success();
        } else {
          return RH.on_error(1, true, new Error(`µ67043 not OK: ${rpr(result)}`));
        }
      };
      //-------------------------------------------------------------------------------------------------------
      T.rsvp_ok = function(callback) {
        return (error, ...P) => {
          if (error != null) {
            throw error;
          }
          return callback(...P);
        };
      };
      //-------------------------------------------------------------------------------------------------------
      T.rsvp_error = function(test, callback) {
        return (error, ...P) => {
          this.test_error(test, error);
          return callback(...P);
        };
      };
      //-------------------------------------------------------------------------------------------------------
      T.fail = function(message) {
        /* Fail with message; do not terminate test execution. */
        stats['check-count'] += 1;
        return RH.on_error(1, true, new Error(message));
      };
      //-------------------------------------------------------------------------------------------------------
      T.succeed = function(message) {
        /* Succeed with message; do not terminate test execution. */
        stats['check-count'] += 1;
        help(`succeded: ${message}`);
        return RH.on_success(message);
      };
      //-------------------------------------------------------------------------------------------------------
      T.test_error = function(test, error) {
        var type;
        switch (type = type_of(test)) {
          case 'text':
            return this.eq(error != null ? error['message'] : void 0, test);
          case 'regex':
            return this.ok(test.test(error != null ? error['message'] : void 0));
          case 'function':
            return this.ok(test(error));
        }
        throw new Error(`µ67808 expected a text, a RegEx or a function, got a ${type}`);
      };
      //-------------------------------------------------------------------------------------------------------
      T.throws = function(test, method) {
        var error;
        try {
          // stats[ 'check-count' ] += 1
          method();
        } catch (error1) {
          error = error1;
          xdebug('^guy-test@45648-7^');
          return this.test_error(test, error);
        }
        throw new Error("µ68573 expected test to fail with exception, but none was thrown");
      };
      //-------------------------------------------------------------------------------------------------------
      T.check = function(method, callback = null) {
        var R, error, ref;
        try {
          /* TAINT use `callback`? other handler? */
          method(this);
        } catch (error1) {
          error = error1;
          xdebug('^guy-test@45648-8^');
          // debug '©x5edC', CND.get_caller_info_stack 0, error, 100, yes
          // debug '©x5edC', CND.get_caller_info 0, error, yes
          RH.on_error(0, false, error);
        }
        // debug '©X5qsy', stats[ 'failures' ][ test_name ]
        R = (ref = stats['failures'][test_name]) != null ? ref : [];
        delete stats['failures'][test_name];
        stats['fail-count'] += -R.length;
        stats['meta-count'] += +R.length;
        if (callback != null) {
          return callback(R);
        } else {
          return R;
        }
      };
      //-------------------------------------------------------------------------------------------------------
      T.perform = async function(probe, matcher, error_pattern, method) {
        var arity, error, message_re, result, stack;
        switch ((arity = arguments.length)) {
          case 3:
            [probe, matcher, error_pattern, method] = [probe, matcher, null, error_pattern];
            break;
          case 4:
            null;
            break;
          default:
            throw new Error(`µ69338 expected 3 or 4 arguments, got ${arity}`);
        }
        if (!is_callable(method)) {
          throw new Error(`µ70103 expected a function, got a ${type_of(method)}`);
        }
        if (error_pattern != null) {
          message_re = new RegExp(error_pattern);
        }
        try {
          result = (await method());
        } catch (error1) {
          error = error1;
          xdebug('^guy-test@45648-9^');
          // throw error
          if ((message_re != null) && (message_re.test(error.message))) {
            echo(CND.green(jr([probe, null, error_pattern])));
            this.ok(true);
          } else {
            echo(CND.indigo("µ70868 unexpected exception", jr([probe, null, error.message])));
            stack = (error.stack.split('\n')).slice(1, 6).join('\n');
            this.fail(`µ71633 unexpected exception for probe ${jr(probe)}:\n${error.message}\n${stack}`);
          }
          // whisper 'µ71634', ( error.stack.split '\n' )[ .. 10 ].join '\n'
          // return reject "µ72398 failed with #{error.message}"
          return null;
        }
        if (error_pattern != null) {
          echo(CND.MAGENTA(`${jr([probe, result, null])} #! expected error: ${jr(error_pattern)}`));
          this.fail(`µ73163 expected error, obtained result ${jr(result)}`);
        } else {
          xdebug('^guy-test@45648-10^');
          xdebug('^guy-test@45648-10^', {result, matcher}, equals(result, matcher));
          if (equals(result, matcher)) {
            this.ok(true);
            echo(CND.lime(jr([probe, result, null])));
          } else {
            // echo CND.red "#{jr [ probe, result, null, ]} #! expected result: #{jr matcher}"echo CND.red "#{jr [ probe, result, null, ]}"
            echo(CND.red(`${jr([probe, result, null])}`));
            this.fail(`µ73773 neq:
result:  ${jr(result)}
matcher: ${jr(matcher)}`);
          }
        }
        return result;
      };
      //-------------------------------------------------------------------------------------------------------
      T.halt_on_error = function() {
        return this._halt_on_error = true;
      };
      //-------------------------------------------------------------------------------------------------------
      return [RH, T];
    };
    //=========================================================================================================
    // TEST EXECUTION
    //---------------------------------------------------------------------------------------------------------
    xdebug('^guy-test@45648-11^');
    run = function() {
      var RH, T, tasks, test, test_name;
      tasks = [];
      if (is_callable(x)) {
        x = {
          test: x
        };
      }
      xdebug('^guy-test@45648-12^');
//.......................................................................................................
      for (test_name in x) {
        test = x[test_name];
        xdebug('^guy-test@45648-13^', test_name);
        if (test_name[0] === '_') {
          continue;
        }
        stats['test-count'] += 1;
        test = test.bind(x);
        [RH, T] = new_result_handler_and_tester(test_name);
        //.....................................................................................................
        ((test_name, test, RH, T) => {
          var arity;
          //...................................................................................................
          switch (arity = test.length) {
            //-------------------------------------------------------------------------------------------------
            // SYNCHRONOUS TESTS
            //-------------------------------------------------------------------------------------------------
            case 1:
              //...............................................................................................
              return tasks.push(function(handler) {
                var error;
                xdebug('^guy-test@45648-14^');
                whisper(`started:   ${rpr(test_name)}`);
                try {
                  test(T);
                } catch (error1) {
                  error = error1;
                  xdebug('^guy-test@45648-15^');
                  RH.on_error(0, false, error);
                }
                whisper(`completed: ${rpr(test_name)}`);
                return handler();
              });
            //-------------------------------------------------------------------------------------------------
            // ASYNCHRONOUS TESTS
            //-------------------------------------------------------------------------------------------------
            case 2:
              //...............................................................................................
              return tasks.push(function(handler) {
                var domain;
                domain = njs_domain.create();
                //.............................................................................................
                domain.on('error', function(error) {
                  xdebug('^guy-test@45648-16^');
                  RH.on_error(0, false, error);
                  return RH.on_completion(handler);
                });
                //.............................................................................................
                return domain.run(function() {
                  var done, error;
                  done = function(error) {
                    xdebug('^guy-test@45648-17^');
                    if (error != null) {
                      xdebug('^guy-test@45648-18^');
                      RH.on_error(0, false, error);
                    }
                    return RH.on_completion(handler);
                  };
                  try {
                    //...........................................................................................
                    return RH.call_with_timeout(settings['timeout'], test, T, done);
                  } catch (error1) {
                    //...........................................................................................
                    error = error1;
                    xdebug('^guy-test@45648-19^');
                    RH.on_error(0, false, error);
                    return RH.on_completion(handler);
                  }
                });
              });
            default:
              //-------------------------------------------------------------------------------------------------
              throw new Error(`µ73928 expected test with 1 or 2 arguments, got one with ${arity}`);
          }
        })(test_name, test, RH, T);
      }
      //-------------------------------------------------------------------------------------------------------
      return ASYNC.series(tasks, (error) => {
        if (error != null) {
          throw error;
        }
        return report();
      });
    };
    //---------------------------------------------------------------------------------------------------------
    report = function() {
      var entries, entry, fail_count, i, len, pass_count, ref, test_name;
      help("                             --=#=--");
      help("                         GUY TEST REPORT");
      help("                             --=#=--");
      ref = stats['failures'];
      //.......................................................................................................
      for (test_name in ref) {
        entries = ref[test_name];
        help(`test case: ${rpr(test_name)}`);
//.....................................................................................................
        for (i = 0, len = entries.length; i < len; i++) {
          entry = entries[i];
          warn(entry['message']);
          warn('  checked:', entry['checked']);
          warn('  ' + entry['route'] + '#' + entry['line-nr']);
          warn('  ' + entry['source']);
        }
      }
      //.......................................................................................................
      pass_count = stats['pass-count'];
      fail_count = stats['fail-count'];
      info();
      info('tests:   ', stats['test-count']);
      info('checks:  ', stats['check-count']);
      info('metas:   ', stats['meta-count']);
      (fail_count > 0 ? whisper : help)('passes:  ', stats['pass-count']);
      (fail_count > 0 ? warn : whisper)('fails:   ', fail_count);
      return process.exit(fail_count);
    };
    //---------------------------------------------------------------------------------------------------------
    xdebug('^guy-test@45648-20^');
    return run();
  };

}).call(this);

//# sourceMappingURL=main.js.map