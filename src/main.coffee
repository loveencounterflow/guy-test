


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


#-----------------------------------------------------------------------------------------------------------
ME = @

#-----------------------------------------------------------------------------------------------------------
@get_caller_description = ( delta = 1 ) ->
  locator = ( BNP.get_caller_locators delta + 1 )[ 0 ]
  return BNP.caller_description_from_locator locator

#-----------------------------------------------------------------------------------------------------------
module.exports = run = ( x ) ->
  test_count    = 0
  check_count   = 0
  pass_count    = 0
  fail_count    = 0
  failures      = {}

  #=========================================================================================================
  # ERROR HANDLING
  #---------------------------------------------------------------------------------------------------------
  error_handler = ( test_name, error ) =>
    debug '©oSiUR', '===='
    fail_count         += 1
    debug '©oSiUR', '1'
    entry               = error[ 'caller'  ]
    debug '©oSiUR', '2'
    entry[ 'message' ]  = error[ 'message' ]
    debug '©oSiUR', '3'
    target              = failures[ test_name ]?= []
    debug '©oSiUR', '4'
    target.push entry

  #---------------------------------------------------------------------------------------------------------
  supply_caller_to_error = ( delta, checked, error ) =>
    delta                += +1 unless error?
    caller                = BNP.get_caller_info delta, error, yes
    debug '©TCbe7', '%%%%'
    debug '©bRf8c', '!!!!'
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
        # throw supply_caller_to_error 1, yes, new Error "not equal: #{rpr P}"
        error_handler test_name, supply_caller_to_error 1, yes, new Error "not equal: #{rpr P}"

    #-------------------------------------------------------------------------------------------------------
    R.ok = ( result ) ->
      ### Tests whether `result` is strictly `true` (not only true-ish). ###
      check_count += 1
      if result is true
        pass_count       += 1
      else
        # throw supply_caller_to_error 1, yes, new Error "not OK: #{rpr result}"
        error_handler test_name, supply_caller_to_error 1, yes, new Error "not OK: #{rpr result}"

    #-------------------------------------------------------------------------------------------------------
    R.rsvp = ( callback ) ->
      return ( error, P... ) =>
        ### TAINT need better error handling ###
        throw error if error?
        return callback P...

    #-------------------------------------------------------------------------------------------------------
    R.fail = ( message ) ->
      throw new Error message

    #-------------------------------------------------------------------------------------------------------
    return R

  #=========================================================================================================
  # TEST EXECUTION
  #---------------------------------------------------------------------------------------------------------
  run = ( settings = null ) ->
    settings               ?= {}
    ### Timeout for asynchronous operations: ###
    settings[ 'timeout'   ]?= 1000
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
            tasks.push ( handler ) =>
              try
                test T
              catch error
                ### TAINT code duplication ###
                supply_caller_to_error 0, no, error unless error[ 'caller' ]?
                error_handler test_name, error
              handler()

          #-------------------------------------------------------------------------------------------------
          # ASYNCHRONOUS TESTS
          #-------------------------------------------------------------------------------------------------
          when 2
            #...............................................................................................
            tasks.push ( handler ) =>
              domain = njs_domain.create()
              domain.on 'error', ( error ) ->
                debug '©w2yhy', 'BBBB'
                ### TAINT code duplication ###
                supply_caller_to_error 0, no, error unless error[ 'caller' ]?
                error_handler test_name, error
                handler()
                return null
              #.............................................................................................
              domain.run ->
                #...........................................................................................
                try
                  test T, =>
                    debug '©ILYFS', '### handler finished ok. ###'
                    handler()
                #...........................................................................................
                catch error
                  debug '©4wx9Q', 'AAAA'
                  ### TAINT code duplication ###
                  supply_caller_to_error 0, no, error # unless error[ 'caller' ]?
                  error_handler test_name, error
                  handler()

          #-------------------------------------------------------------------------------------------------
          else throw new Error "expected test with 1 or 2 arguments, got one with #{arity}"

    #-------------------------------------------------------------------------------------------------------
    ASYNC.series tasks, ( error ) =>
      throw error if error?
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


