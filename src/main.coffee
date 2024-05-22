
'use strict'


############################################################################################################
njs_domain                = require 'domain'
#...........................................................................................................
CND                       = require 'cnd'
# rpr                       = CND.rpr.bind CND
badge                     = 'TEST'
log                       = CND.get_logger 'plain',     badge
info                      = CND.get_logger 'info',      badge
whisper                   = CND.get_logger 'whisper',   badge
alert                     = CND.get_logger 'alert',     badge
debug                     = CND.get_logger 'debug',     badge
warn                      = CND.get_logger 'warn',      badge
help                      = CND.get_logger 'help',      badge
urge                      = CND.get_logger 'urge',      badge
echo                      = CND.echo.bind CND
#...........................................................................................................
ASYNC                     = require 'async'
# DIFF                      = require 'diff'
# { jr }                    = CND
#-----------------------------------------------------------------------------------------------------------
rpr = jr = ( P... ) ->
  return ( ( inspect x, rpr_settings ) for x in P ).join ' '
{ inspect }   = require 'util'
rpr_settings  = { depth: Infinity, maxArrayLength: Infinity, breakLength: Infinity, compact: true, }
#-----------------------------------------------------------------------------------------------------------
types                     = new ( require 'intertype' ).Intertype()
{ type_of
  equals      }           = types
is_callable               = ( x ) -> ( type_of x ) in [ 'function', 'asyncfunction', ]
xdebug                    = ( P... ) -> debug ( CND.reverse P[ 0 ] ), P[ 1 .. ]...
xdebug                    = ->

xdebug ('^guy-test@45648-1^')

#===========================================================================================================
# TEST RUNNER
#-----------------------------------------------------------------------------------------------------------
module.exports = ( x, settings = null ) ->
  xdebug ('^guy-test@45648-2^')
  ### TAINT should accept a handler in case testing contains asynchronous functions ###
  ### Timeout for asynchronous operations: ###
  settings               ?= {}
  settings[ 'timeout'   ]?= 10e3
  #.........................................................................................................
  stats =
    'test-count':   0
    'check-count':  0
    'meta-count':   0
    'pass-count':   0
    'fail-count':   0
    'failures':     {}
  xdebug ('^guy-test@45648-3^')


  #=========================================================================================================
  #
  #---------------------------------------------------------------------------------------------------------
  new_result_handler_and_tester = ( test_name ) ->
    RH        = { 'name': test_name, }
    T         = { 'name': test_name, _halt_on_error: false, }
    keeper_id = null

    #=======================================================================================================
    # TIMEOUT KEEPER
    #-------------------------------------------------------------------------------------------------------
    RH.call_with_timeout = ( timeout, method, P..., handler ) ->
      #.....................................................................................................
      keeper = =>
        # clearTimeout keeper_id
        keeper_id = null
        warn "(test: #{rpr test_name}) timeout reached; proceeding with error"
        handler new Error "µ65513 sorry, timeout reached (#{rpr timeout}ms) (#{rpr test_name})"
      #.....................................................................................................
      keeper_id = setTimeout keeper, timeout
      whisper "started:   #{rpr test_name}"
      #.....................................................................................................
      method P..., ( P1... ) =>
        if keeper_id?
          @clear_timeout()
          return handler P1...
        whisper "(test: #{rpr test_name}) timeout already reached; ignoring"

    #-------------------------------------------------------------------------------------------------------
    RH.clear_timeout = ->
      if keeper_id?
        # debug '©9XSyM', "clearing timeout for #{rpr test_name}"
        clearTimeout keeper_id
        keeper_id = null
        return true
      return false

    #-------------------------------------------------------------------------------------------------------
    # COMPLETION / SUCCESS / ERROR
    #-------------------------------------------------------------------------------------------------------
    RH.on_completion = ( handler ) ->
      @clear_timeout()
      whisper "completed: #{rpr test_name}"
      handler()

    #-------------------------------------------------------------------------------------------------------
    RH.on_success = ->
      stats[ 'pass-count' ] += 1
      return null

    #-------------------------------------------------------------------------------------------------------
    RH.on_error = ( delta, checked, error ) ->
      xdebug ('^guy-test@45648-4^')
      xdebug ('^guy-test@45648-5^'), T._halt_on_error
      # for line in error.stack.split /\n/
      #   warn '^guy-test@45648-6^', line if /intertype/.test line
      throw error if T._halt_on_error
      # @clear_timeout()
      stats[ 'fail-count' ]  += +1
      delta                  += +1 unless error?
      try
        entry = CND.get_caller_info delta, error, yes
      catch
        xdebug ('^guy-test@45648-7^'), T._halt_on_error
        throw error
      throw error unless entry?
      entry[ 'checked' ]      = checked
      entry[ 'message' ]      = error?[ 'message' ] ? "µ66278 Guy-test: received `null` as error"
      failures                = stats[ 'failures' ]
      ( failures[ test_name ]?= [] ).push entry
      return null

    #-------------------------------------------------------------------------------------------------------
    # CHECKS
    #-------------------------------------------------------------------------------------------------------
    T.eq = ( P... ) ->
      stats[ 'check-count' ] += 1
      if equals P...
        RH.on_success()
      else
        rpr_p = ( rpr p for p in P ).join '\n'
        message = "not equal:\n#{rpr_p}"
        RH.on_error   1, yes, new Error message

    #-------------------------------------------------------------------------------------------------------
    T.noteq = ( P... ) ->
      stats[ 'check-count' ] += 1
      unless equals P...
        RH.on_success()
      else
        rpr_p = ( rpr p for p in P ).join '\n'
        message = "not equal:\n#{rpr_p}"
        RH.on_error   1, yes, new Error message

    #-------------------------------------------------------------------------------------------------------
    T.ok = ( result ) ->
      ### Tests whether `result` is strictly `true` (not only true-ish). ###
      stats[ 'check-count' ] += 1
      if result is true then  RH.on_success()
      else                    RH.on_error   1, yes, new Error "µ67043 not OK: #{rpr result}"

    #-------------------------------------------------------------------------------------------------------
    T.rsvp_ok = ( callback ) ->
      return ( error, P... ) =>
        throw error if error?
        return callback P...

    #-------------------------------------------------------------------------------------------------------
    T.rsvp_error = ( test, callback ) ->
      return ( error, P... ) =>
        @test_error test, error
        return callback P...

    #-------------------------------------------------------------------------------------------------------
    T.fail = ( message ) ->
      ### Fail with message; do not terminate test execution. ###
      stats[ 'check-count' ] += 1
      RH.on_error 1, yes, new Error message

    #-------------------------------------------------------------------------------------------------------
    T.succeed = ( message ) ->
      ### Succeed with message; do not terminate test execution. ###
      stats[ 'check-count' ] += 1
      help "succeded: #{message}"
      RH.on_success message

    #-------------------------------------------------------------------------------------------------------
    T.test_error = ( test, error ) ->
      debug '^3234^', CND.reverse CND.steel rpr error.message
      switch type = type_of test
        when 'text'     then return @eq error?[ 'message' ], test
        when 'regex'    then return @ok test.test error?[ 'message' ]
        when 'function' then return @ok test error
      throw new Error "µ67808 expected a text, a RegEx or a function, got a #{type}"

    #-------------------------------------------------------------------------------------------------------
    T.throws = ( test, method ) ->
      # stats[ 'check-count' ] += 1
      try
        method()
      catch error
        xdebug ('^guy-test@45648-8^')
        return @test_error test, error
      throw new Error "µ68573 expected test to fail with exception, but none was thrown"

    #-------------------------------------------------------------------------------------------------------
    T.check = ( method, callback = null ) ->
      ### TAINT use `callback`? other handler? ###
      try
        method @
      catch error
        xdebug ('^guy-test@45648-9^')
        # debug '©x5edC', CND.get_caller_info_stack 0, error, 100, yes
        # debug '©x5edC', CND.get_caller_info 0, error, yes
        RH.on_error 0, no, error
        # debug '©X5qsy', stats[ 'failures' ][ test_name ]
      R =     stats[ 'failures' ][ test_name ] ? []
      delete  stats[ 'failures' ][ test_name ]
      stats[ 'fail-count' ] += -R.length
      stats[ 'meta-count' ] += +R.length
      return if callback? then callback R else R

    #-------------------------------------------------------------------------------------------------------
    T.perform = ( probe, matcher, error_pattern, method ) ->
      switch ( arity = arguments.length )
        when 3 then [ probe, matcher, error_pattern, method, ] = [ probe, matcher, null, error_pattern, ]
        when 4 then null
        else throw new Error "µ69338 expected 3 or 4 arguments, got #{arity}"
      throw new Error "µ70103 expected a function, got a #{type_of method}" unless is_callable method
      message_re  = new RegExp error_pattern if error_pattern?
      try
        result = await method()
      catch error
        xdebug ('^guy-test@45648-10^')
        # throw error
        if message_re? and ( message_re.test error.message )
          echo CND.green jr [ probe, null, error_pattern, ]
          @ok true
        else
          echo CND.indigo "µ70868 unexpected exception", ( jr [ probe, null, error.message, ] )
          stack = ( error.stack.split '\n' )[ 1 .. 5 ].join '\n'
          @fail "µ71633 unexpected exception for probe #{jr probe}:\n#{error.message}\n#{stack}"
          # whisper 'µ71634', ( error.stack.split '\n' )[ .. 10 ].join '\n'
          # return reject "µ72398 failed with #{error.message}"
        return null
      if error_pattern?
        echo CND.MAGENTA "#{jr [ probe, result, null, ]} #! expected error: #{jr error_pattern}"
        @fail "µ73163 expected error, obtained result #{jr result}"
      else
        xdebug ('^guy-test@45648-11^')
        xdebug ('^guy-test@45648-12^'), { result, matcher, }, equals result, matcher
        if equals result, matcher
          @ok true
          echo CND.lime jr [ probe, result, null, ]
        else
          # echo CND.red "#{jr [ probe, result, null, ]} #! expected result: #{jr matcher}"echo CND.red "#{jr [ probe, result, null, ]}"
          echo CND.red "#{jr [ probe, result, null, ]}"
          @fail """µ73773 neq:
            result:  #{jr result}
            matcher: #{jr matcher}"""
      return result

    #-------------------------------------------------------------------------------------------------------
    T.halt_on_error = -> @_halt_on_error = true

    #-------------------------------------------------------------------------------------------------------
    return [ RH, T, ]

  #=========================================================================================================
  # TEST EXECUTION
  #---------------------------------------------------------------------------------------------------------
  xdebug ('^guy-test@45648-13^')
  run = ->
    tasks = []
    x = { test: x, } if is_callable x
    xdebug ('^guy-test@45648-14^')
    #.......................................................................................................
    for test_name, test of x
      xdebug ('^guy-test@45648-15^'), test_name
      continue if test_name[ 0 ] is '_'
      stats[ 'test-count' ]  += 1
      test                    = test.bind x
      [ RH, T, ]              = new_result_handler_and_tester test_name
      #.....................................................................................................
      do ( test_name, test, RH, T ) =>
        #...................................................................................................
        switch arity = test.length

          #-------------------------------------------------------------------------------------------------
          # SYNCHRONOUS TESTS
          #-------------------------------------------------------------------------------------------------
          when 1
            #...............................................................................................
            tasks.push ( handler ) ->
              xdebug ('^guy-test@45648-16^')
              whisper "started:   #{rpr test_name}"
              try
                test T
              catch error
                xdebug ('^guy-test@45648-17^')
                RH.on_error 0, no, error
              whisper "completed: #{rpr test_name}"
              handler()

          #-------------------------------------------------------------------------------------------------
          # ASYNCHRONOUS TESTS
          #-------------------------------------------------------------------------------------------------
          when 2
            #...............................................................................................
            tasks.push ( handler ) ->
              domain = njs_domain.create()
              #.............................................................................................
              domain.on 'error', ( error ) ->
                xdebug ('^guy-test@45648-18^')
                RH.on_error 0, no, error
                RH.on_completion handler
              #.............................................................................................
              domain.run ->
                done = ( error ) ->
                  xdebug ('^guy-test@45648-19^')
                  if error?
                    xdebug ('^guy-test@45648-20^')
                    RH.on_error 0, no, error
                  RH.on_completion handler
                #...........................................................................................
                try
                  RH.call_with_timeout settings[ 'timeout' ], test, T, done
                #...........................................................................................
                catch error
                  xdebug ('^guy-test@45648-21^')
                  RH.on_error 0, no, error
                  RH.on_completion handler

          #-------------------------------------------------------------------------------------------------
          else throw new Error "µ73928 expected test with 1 or 2 arguments, got one with #{arity}"

    #-------------------------------------------------------------------------------------------------------
    ASYNC.series tasks, ( error ) =>
      throw error if error?
      report()

  #---------------------------------------------------------------------------------------------------------
  report = ->
    help "                             --=#=--"
    help "                         GUY TEST REPORT"
    help "                             --=#=--"
    #.......................................................................................................
    for test_name, entries of stats[ 'failures' ]
      help "test case: #{rpr test_name}"
      #.....................................................................................................
      for entry in entries
        warn entry[ 'message' ]
        warn '  checked:', entry[ 'checked' ]
        warn '  ' + entry[ 'route' ] + '#' + entry[ 'line-nr' ]
        warn '  ' + entry[ 'source' ]
    #.......................................................................................................
    pass_count = stats[ 'pass-count' ]
    fail_count = stats[ 'fail-count' ]
    info()
    info 'tests:   ',   stats[ 'test-count'  ]
    info 'checks:  ',   stats[ 'check-count' ]
    info 'metas:   ',   stats[ 'meta-count'  ]
    ( if fail_count > 0 then whisper  else help    ) 'passes:  ', stats[ 'pass-count'  ]
    ( if fail_count > 0 then warn     else whisper ) 'fails:   ', fail_count
    process.exit fail_count

  #---------------------------------------------------------------------------------------------------------
  xdebug ('^guy-test@45648-22^')
  run()


