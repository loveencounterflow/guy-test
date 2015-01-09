


############################################################################################################
njs_domain                = require 'domain'
#...........................................................................................................
TRM                       = require 'coffeenode-trm'
rpr                       = TRM.rpr.bind TRM
badge                     = 'TEST'
log                       = TRM.get_logger 'plain',     badge
info                      = TRM.get_logger 'info',      badge
whisper                   = TRM.get_logger 'whisper',   badge
alert                     = TRM.get_logger 'alert',     badge
debug                     = TRM.get_logger 'debug',     badge
warn                      = TRM.get_logger 'warn',      badge
help                      = TRM.get_logger 'help',      badge
urge                      = TRM.get_logger 'urge',      badge
echo                      = TRM.echo.bind TRM
#...........................................................................................................
BNP                       = require 'coffeenode-bitsnpieces'
ASYNC                     = require 'async'



#===========================================================================================================
# TIMEOUT KEEPER
#-----------------------------------------------------------------------------------------------------------
call_with_timeout = ( timeout, test_name, method, P..., handler ) ->
  keeper_id = null
  #.........................................................................................................
  keeper = ->
    # clearTimeout keeper_id
    keeper_id = null
    warn "(test: #{rpr test_name}) timeout reached; proceeding with error"
    handler new Error "sorry, timeout reached (#{rpr timeout}ms)"
  #.........................................................................................................
  keeper_id = setTimeout keeper, timeout
  #.........................................................................................................
  method P..., ( P1... ) ->
    if keeper_id?
      clearTimeout keeper_id
      keeper_id = null
      # help "(test: #{rpr test_name}) timeout cancelled; proceeding as planned"
      return handler P1...
    whisper "(test: #{rpr test_name}) timeout already reached; ignoring"


#===========================================================================================================
# TEST RUNNER
#-----------------------------------------------------------------------------------------------------------
module.exports = ( x, settings = null ) ->
  ### Timeout for asynchronous operations: ###
  settings               ?= {}
  settings[ 'timeout'   ]?= 1000
  #.........................................................................................................
  stats =
    'test-count':   0
    'check-count':  0
    'pass-count':   0
    'fail-count':   0
    'failures':     {}


  #=========================================================================================================
  # RESULT HANDLING
  #---------------------------------------------------------------------------------------------------------
  new_result_handler_and_tester = ( test_name ) ->
    RH  = {}
    T   = {}

    #=========================================================================================================
    # SUCCESS HANDLING
    #---------------------------------------------------------------------------------------------------------
    RH.success_handler = ( test_name, delta ) ->

    #=========================================================================================================
    # ERROR HANDLING
    #---------------------------------------------------------------------------------------------------------
    RH.error_handler = ( delta, checked, error ) ->
      stats[ 'fail-count' ]  += +1
      delta                  += +1 unless error?
      entry                   = BNP.get_caller_info delta, error, yes
      entry[ 'checked' ]      = checked
      entry[ 'message' ]      = error[ 'message' ]
      failures                = stats[ 'failures' ]
      ( failures[ test_name ]?= [] ).push entry
      return null

    #-------------------------------------------------------------------------------------------------------
    T.eq = ( P... ) ->
      ### Tests whether all arguments are pairwise and deeply equal. Uses CoffeeNode Bits'n'Pieces' `equal`
      for testing as (1) Node's `assert` distinguishes—unnecessarily—between shallow and deep equality, and,
      worse, [`assert.equal` and `assert.deepEqual` are broken](https://github.com/joyent/node/issues/7161),
      as they use JavaScript's broken `==` equality operator instead of `===`. ###
      stats[ 'check-count' ] += 1
      if BNP.equals P...
        stats[ 'pass-count' ] += 1
      else
        RH.error_handler 1, yes, new Error "not equal: #{rpr P}"

    #-------------------------------------------------------------------------------------------------------
    T.ok = ( result ) ->
      ### Tests whether `result` is strictly `true` (not only true-ish). ###
      stats[ 'check-count' ] += 1
      if result is true
        stats[ 'pass-count' ] += 1
      else
        RH.error_handler 1, yes, new Error "not OK: #{rpr result}"

    #-------------------------------------------------------------------------------------------------------
    T.rsvp = ( callback ) ->
      return ( error, P... ) =>
        ### TAINT need better error handling ###
        throw error if error?
        return callback P...

    #-------------------------------------------------------------------------------------------------------
    T.fail = ( message ) ->
      ### Fail with message; do not terminate test execution. ###
      stats[ 'check-count' ] += 1
      RH.error_handler 1, yes, new Error message

    #-------------------------------------------------------------------------------------------------------
    return [ RH, T, ]

  #=========================================================================================================
  # TEST EXECUTION
  #---------------------------------------------------------------------------------------------------------
  run = ->
    tasks = []
    #.......................................................................................................
    for test_name, test of x
      stats[ 'test-count' ]  += 1
      test                    = test.bind x
      [ RH, T, ]              = new_result_handler_and_tester test_name
      #.....................................................................................................
      do ( test_name, test, T ) =>
        #...................................................................................................
        switch arity = test.length

          #-------------------------------------------------------------------------------------------------
          # SYNCHRONOUS TESTS
          #-------------------------------------------------------------------------------------------------
          when 1
            #...............................................................................................
            tasks.push ( handler ) ->
              try
                test T
              catch error
                RH.error_handler 0, no, error
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
                RH.error_handler 0, no, error
                whisper "completed: #{rpr test_name}"
                handler()
                return null
              #.............................................................................................
              domain.run ->
                done = ( error ) ->
                  if error?
                    RH.error_handler 0, no, error
                    whisper "completed: #{rpr test_name}"
                  handler()
                #...........................................................................................
                try
                  call_with_timeout settings[ 'timeout' ], test_name, test, T, done
                #...........................................................................................
                catch error
                  RH.error_handler 0, no, error
                  whisper "completed: #{rpr test_name}"
                  handler()

          #-------------------------------------------------------------------------------------------------
          else throw new Error "expected test with 1 or 2 arguments, got one with #{arity}"

    #-------------------------------------------------------------------------------------------------------
    ASYNC.series tasks, ( error ) =>
      throw error if error?
      # clearInterval keeper_id
      report()

  #---------------------------------------------------------------------------------------------------------
  report = ->
    info 'tests:   ',   stats[ 'test-count'  ]
    info 'checks:  ',   stats[ 'check-count' ]
    info 'passes:  ',   stats[ 'pass-count'  ]
    info 'fails:   ',   stats[ 'fail-count'  ]
    #.......................................................................................................
    for test_name, entries of stats[ 'failures' ]
      help "test case: #{rpr test_name}"
      #.....................................................................................................
      for entry in entries
        warn entry[ 'message' ]
        warn '  checked:', entry[ 'checked' ]
        warn '  ' + entry[ 'route' ] + '#' + entry[ 'line-nr' ]
        warn '  ' + entry[ 'source' ]

  #---------------------------------------------------------------------------------------------------------
  run()


