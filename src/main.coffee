


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


# #-----------------------------------------------------------------------------------------------------------
# ME = @

# #-----------------------------------------------------------------------------------------------------------
# @get_caller_description = ( delta = 1 ) ->
#   locator = ( BNP.get_caller_locators delta + 1 )[ 0 ]
#   return BNP.caller_description_from_locator locator


#===========================================================================================================
# TIMEOUT KEEPER API
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
  test_count    = 0
  check_count   = 0
  pass_count    = 0
  fail_count    = 0
  failures      = {}


  #=========================================================================================================
  # ERROR HANDLING
  #---------------------------------------------------------------------------------------------------------
  error_handler = ( test_name, error ) ->
    fail_count         += 1
    entry               = error[ 'caller'  ]
    entry[ 'message' ]  = error[ 'message' ]
    target              = failures[ test_name ]?= []
    target.push entry

  #---------------------------------------------------------------------------------------------------------
  supply_caller_to_error = ( delta, checked, error ) ->
    delta                += +1 unless error?
    caller                = BNP.get_caller_info delta, error, yes
    caller[ 'checked'   ] = checked
    error[  'caller'    ] = caller
    return error


  #=========================================================================================================
  # TEST METHODS
  #---------------------------------------------------------------------------------------------------------
  new_tester = ( test_name ) ->
    R = {}

    #-------------------------------------------------------------------------------------------------------
    R.eq = ( P... ) ->
      ### Tests whether all arguments are pairwise and deeply equal. Uses CoffeeNode Bits'n'Pieces' `equal`
      for testing as (1) Node's `assert` distinguishes—unnecessarily—between shallow and deep equality, and,
      worse, [`assert.equal` and `assert.deepEqual` are broken](https://github.com/joyent/node/issues/7161),
      as they use JavaScript's broken `==` equality operator instead of `===`. ###
      check_count += 1
      if BNP.equals P...
        pass_count       += 1
      else
        error_handler test_name, supply_caller_to_error 1, yes, new Error "not equal: #{rpr P}"

    #-------------------------------------------------------------------------------------------------------
    R.ok = ( result ) ->
      ### Tests whether `result` is strictly `true` (not only true-ish). ###
      check_count += 1
      if result is true
        pass_count       += 1
      else
        error_handler test_name, supply_caller_to_error 1, yes, new Error "not OK: #{rpr result}"

    #-------------------------------------------------------------------------------------------------------
    R.rsvp = ( callback ) ->
      return ( error, P... ) =>
        ### TAINT need better error handling ###
        throw error if error?
        return callback P...

    #-------------------------------------------------------------------------------------------------------
    R.fail = ( message ) ->
      ### Fail with message; do not terminate test execution. ###
      error_handler test_name, supply_caller_to_error 1, yes, new Error message

    #-------------------------------------------------------------------------------------------------------
    return R

  #=========================================================================================================
  # TEST EXECUTION
  #---------------------------------------------------------------------------------------------------------
  run = ->
    settings               ?= {}
    # keeper_id               = setInterval ( -> ), 1000
    #.......................................................................................................
    tasks = []
    #-------------------------------------------------------------------------------------------------------
    for test_name, test of x
      test        = test.bind x
      test_count += 1
      T           = new_tester test_name
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
                ### TAINT code duplication ###
                supply_caller_to_error 0, no, error # unless error[ 'caller' ]?
                error_handler test_name, error
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
                ### TAINT code duplication ###
                supply_caller_to_error 0, no, error unless error[ 'caller' ]?
                error_handler test_name, error
                whisper "completed: #{rpr test_name}"
                handler()
                return null
              #.............................................................................................
              domain.run ->
                done = ( error ) ->
                  if error?
                    ### TAINT code duplication ###
                    supply_caller_to_error 0, no, error # unless error[ 'caller' ]?
                    error_handler test_name, error
                    whisper "completed: #{rpr test_name}"
                  handler()
                #...........................................................................................
                try
                  call_with_timeout settings[ 'timeout' ], test_name, test, T, done
                  # test T, done
                #...........................................................................................
                catch error
                  ### TAINT code duplication ###
                  supply_caller_to_error 0, no, error # unless error[ 'caller' ]?
                  error_handler test_name, error
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
    info 'test_count:   ',   test_count
    info 'check_count:  ',   check_count
    info 'pass_count:   ',   pass_count
    info 'fail_count:   ',   fail_count
    #.......................................................................................................
    for test_name, entries of failures
      help "test case: #{rpr test_name}"
      #.....................................................................................................
      for entry in entries
        warn entry[ 'message' ]
        warn '  checked:', entry[ 'checked' ]
        warn '  ' + entry[ 'route' ] + '#' + entry[ 'line-nr' ]
        warn '  ' + entry[ 'source' ]

  #---------------------------------------------------------------------------------------------------------
  run()


