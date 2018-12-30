


############################################################################################################
njs_domain                = require 'domain'
#...........................................................................................................
CND                       = require 'cnd'
rpr                       = CND.rpr.bind CND
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
DIFF                      = require 'diff'
is_callable               = ( x ) -> ( Object::toString.call x ) in [ '[object Function]', '[object AsyncFunction]', ]
{ jr }                    = CND

#-----------------------------------------------------------------------------------------------------------
diff = ( a, b ) ->
  parts = []
  for part in DIFF.diffChars a, b
    color = if part.added then 'green' else ( if part.removed then 'red' else 'white' )
    parts.push CND[ color ] part.value
  return parts.join ''



# #===========================================================================================================
# # TIMEOUT KEEPER
# #-----------------------------------------------------------------------------------------------------------
# call_with_timeout = ( timeout, test_name, method, P..., handler ) ->
#   keeper_id = null
#   #.........................................................................................................
#   keeper = ->
#     # clearTimeout keeper_id
#     keeper_id = null
#     warn "(test: #{rpr test_name}) timeout reached; proceeding with error"
#     handler new Error "µ64748 sorry, timeout reached (#{rpr timeout}ms)"
#   #.........................................................................................................
#   keeper_id = setTimeout keeper, timeout
#   #.........................................................................................................
#   method P..., ( P1... ) ->
#     if keeper_id?
#       clearTimeout keeper_id
#       keeper_id = null
#       # help "(test: #{rpr test_name}) timeout cancelled; proceeding as planned"
#       return handler P1...
#     whisper "(test: #{rpr test_name}) timeout already reached; ignoring"


#===========================================================================================================
# TEST RUNNER
#-----------------------------------------------------------------------------------------------------------
module.exports = ( x, settings = null ) ->
  ### TAINT should accept a handler in case testing contains asynchronous functions ###
  ### Timeout for asynchronous operations: ###
  settings               ?= {}
  settings[ 'timeout'   ]?= 1000
  #.........................................................................................................
  stats =
    'test-count':   0
    'check-count':  0
    'meta-count':   0
    'pass-count':   0
    'fail-count':   0
    'failures':     {}


  #=========================================================================================================
  #
  #---------------------------------------------------------------------------------------------------------
  new_result_handler_and_tester = ( test_name ) ->
    RH        = { 'name': test_name, }
    T         = { 'name': test_name, }
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
      # @clear_timeout()
      stats[ 'fail-count' ]  += +1
      delta                  += +1 unless error?
      try
        entry = CND.get_caller_info delta, error, yes
      catch
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
      ### Tests whether all arguments are pairwise and deeply equal. Uses CoffeeNode Bits'n'Pieces' `equal`
      for testing as (1) Node's `assert` distinguishes—unnecessarily—between shallow and deep equality, and,
      worse, [`assert.equal` and `assert.deepEqual` are broken](https://github.com/joyent/node/issues/7161),
      as they use JavaScript's broken `==` equality operator instead of `===`. ###
      stats[ 'check-count' ] += 1
      if CND.equals P...
        RH.on_success()
      else
        if P.length is 2 # and ( CND.isa_text p0 = P[ 0 ] ) and ( CND.isa_text p1 = P[ 1 ] )
          info "string diff:"
          info diff ( rpr P[ 0 ] ), ( rpr P[ 1 ] )
          message = """
          not equal:
          #{CND.white   rpr P[ 0 ]}
          #{CND.yellow  rpr P[ 1 ]}
          """
        else
          message = "not equal: #{( rpr p for p in P ).join ', '}"
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
      switch type = CND.type_of test
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
        return @test_error test, error
      throw new Error "µ68573 expected test to fail with exception, but none was thrown"

    #-------------------------------------------------------------------------------------------------------
    T.check = ( method, callback = null ) ->
      ### TAINT use `callback`? other handler? ###
      try
        method @
      catch error
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
      throw new Error "µ70103 expected a function, got a #{CND.type_of method}" unless is_callable method
      message_re = new RegExp error_pattern if error_pattern?
      try
        result = await method()
      catch error
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
      else if CND.equals result, matcher
        @ok true
        echo CND.lime jr [ probe, result, null, ]
      else
        @fail "µ73773 neq: result #{jr result}, matcher #{jr matcher}"
        echo CND.red "#{jr [ probe, result, null, ]} #! expected result: #{jr matcher}"
      return result

    #-------------------------------------------------------------------------------------------------------
    return [ RH, T, ]

  #=========================================================================================================
  # TEST EXECUTION
  #---------------------------------------------------------------------------------------------------------
  run = ->
    tasks = []
    x = { test: x, } if is_callable x
    #.......................................................................................................
    for test_name, test of x
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
              whisper "started:   #{rpr test_name}"
              try
                test T
              catch error
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
                RH.on_error 0, no, error
                RH.on_completion handler
              #.............................................................................................
              domain.run ->
                done = ( error ) ->
                  if error?
                    RH.on_error 0, no, error
                  RH.on_completion handler
                #...........................................................................................
                try
                  RH.call_with_timeout settings[ 'timeout' ], test, T, done
                #...........................................................................................
                catch error
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
  run()


