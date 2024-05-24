

'use strict'

GUY                       = require 'guy'
{ alert
  debug
  help
  info
  plain
  praise
  urge
  warn
  whisper }               = GUY.trm.get_loggers 'guy-test-NG'
{ rpr
  inspect
  echo
  reverse
  log     }               = GUY.trm
{ Intertype }             = require 'intertype'
_jkequals                 = require '../deps/jkroso-equals'
{ hide }                  = GUY.props
WG                        = require 'webguy'
{ nameit }                = WG.props
### TAINT these should become instance configuration ###
test_mode                 = 'throw_failures'
test_mode                 = 'throw_errors'
test_mode                 = 'failsafe'



#===========================================================================================================
{ isa, type_of, validate, create, } = new Intertype
  gt_stats:
    fields:
      runs:     'cardinal'
      checks:   'cardinal'
      passes:   'cardinal'
      fails:    'cardinal'
    template:
      runs:     0
      checks:   0
      passes:   0
      fails:    0
  gt_totals: ### TAINT use inheritance to derive shared fields ###
    fields:
      tests:    'cardinal'
      checks:   'cardinal'
      passes:   'cardinal'
      fails:    'cardinal'
    template:
      tests:    0
      checks:   0
      passes:   0
      fails:    0


#===========================================================================================================
class Test

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    @totals = create.gt_totals()
    hide @, 'test',         nameit 'test',          ( P... ) =>       @_test          P...
    hide @, 'eq',           nameit 'eq',            ( P... ) =>       @_eq            P...
    hide @, 'async_eq',     nameit 'async_eq',      ( P... ) =>       @_async_eq      P...
    hide @, 'throws',       nameit 'throws',        ( P... ) =>       @_throws        P...
    hide @, 'async_throws', nameit 'async_throws',  ( P... ) => await @_async_throws  P...
    hide @, 'equals',       nameit 'equals',        ( P... ) =>       @_equals        P...
    hide @, '_test_ref',                            null
    hide @, 'stats',                                { '*': @totals, }
    return undefined

  #---------------------------------------------------------------------------------------------------------
  _test: ( tests... ) ->
    @_test_inner tests...
    #.......................................................................................................
    color = if @totals.fails is 0 then 'lime' else 'red'
    for key, stats of @stats
      continue if key is '*'
      info 'Ωgt___3', ( key.padEnd 20 ), stats
    info 'Ωgt___4', GUY.trm.grey '-----------------------------------------------------------------'
    info 'Ωgt___5', reverse GUY.trm[ color ] ( '*'.padEnd 20 ), @totals
    #.......................................................................................................
    return @stats

  #---------------------------------------------------------------------------------------------------------
  _test_inner: ( tests... ) ->
    ### TAINT preliminary handling of arguments ###
    for candidate in tests then switch true
        #...................................................................................................
        when isa.function candidate
          @_test_ref = @_ref_from_function candidate
          @_increment_tests 'test', @_test_ref
          try candidate.call @ catch error then finally @_test_ref = null
        #...................................................................................................
        when isa.object candidate
          for key, property of candidate
            @_test_inner property
        #...................................................................................................
        else
          @_increment_fails 'test', 'Ωgt__10'
          warn 'Ωgt__11', reverse " expected a test, got a #{type_of candidate} "
    #.......................................................................................................
    return null

  #---------------------------------------------------------------------------------------------------------
  _test_async: ( tests... ) ->
    throw new Error "Ωgt__12 not implemented"
    for test in tests
      switch true
        when isa.function test
          @test test
        # when isa.object test then null
        ### TAINT record failure and move on ###
        else throw new Error "Ωgt__13 expected a test, got a #{type_of test}"
        # when isa.asyncfunction test then null

  #---------------------------------------------------------------------------------------------------------
  _increment_tests:   ( level, check_ref ) -> @_increment level, 'tests',  check_ref
  _increment_checks:  ( level, check_ref ) -> @_increment level, 'checks', check_ref
  _increment_passes:  ( level, check_ref ) -> @_increment level, 'passes', check_ref
  _increment_fails:   ( level, check_ref ) -> @_increment level, 'fails',  check_ref

  #---------------------------------------------------------------------------------------------------------
  _increment: ( level, key, check_ref ) ->
    ### TAINT get rid of `level` kludge ###
    @totals[ key ]++
    per_test_stats  = @stats[ "#{@_test_ref}.*"             ] ?= create.gt_stats()
    per_test_stats.runs++ if key is 'checks'
    if level is 'check'
      per_check_stats = @stats[ "#{@_test_ref}.#{check_ref}"  ] ?= create.gt_stats()
      per_check_stats.runs++ if key is 'checks'
      unless key is 'tests'
        per_test_stats[ key ]++
        per_check_stats[ key ]++
    return null

  #---------------------------------------------------------------------------------------------------------
  _ref_from_function: ( f ) ->
    R = 'anon' if ( R = f.name ) is ''
    # throw new Error "^992-1^ test method should be named, got #{rpr f}" if ( R = f.name ) is ''
    return R


  #=========================================================================================================
  _eq: ( f, matcher ) ->
    ref = @_ref_from_function f
    @_increment_checks 'check', ref
    #.......................................................................................................
    try ( result = f() ) catch error
      message = "`eq2()`: ^#{ref}^ expected a result but got an an error: #{error.message}"
      warn '^992-12^', reverse message
      @_increment_fails 'check', ref # T?.fail "^992-13^ #{message}"
      debug '^25235234^', { test_mode}
      if test_mode is 'throw_errors'
        throw new Error message
    #.......................................................................................................
    if @equals result, matcher
      help ref, "EQ OK"
      @_increment_passes 'check', ref
      # T?.ok true
    #.......................................................................................................
    else
      warn ref, ( reverse ' neq ' ), "result:     ", ( reverse ' ' + ( rpr result   ) + ' ' )
      warn ref, ( reverse ' neq ' ), "matcher:    ", ( reverse ' ' + ( rpr matcher  ) + ' ' )
      @_increment_fails 'check', ref
      # T?.ok false
    #.......................................................................................................
    return null

  #=========================================================================================================
  _match_error: ( error, matcher ) ->
    switch matcher_type = type_of matcher
      when 'text'
        return error.message is matcher
      when 'regex'
        matcher.lastIndex = 0
        return matcher.test error.message
    return matcher_type

  #---------------------------------------------------------------------------------------------------------
  _throws: ( T, f, matcher ) ->
    throw new Error "^992-1^ test method should be named, got #{rpr f}" if ( ref = f.name ) is ''
    error = null
    #.......................................................................................................
    try ( urge "^#{ref}^ `throws()` result of call:", f() ) catch error
      unless matcher?
        help "^#{ref} ◀ throws@1^ error        ", reverse error.message
        T?.ok true
        return null
      #.....................................................................................................
      switch matcher_type = @_match_error error, matcher
        when true
          help "^#{ref} ◀ throws@2^ OK           ", reverse error.message
          T?.ok true
        when false
          urge "^#{ref} ◀ throws@3^ error        ", reverse error.message
          warn "^#{ref} ◀ throws@4^ doesn't match", reverse rpr matcher
          T?.fail "^#{ref} ◀ throws@5^ error #{rpr error.message} doesn't match #{rpr matcher}"
        else
          message = "expected a regex or a text, got a #{matcher_type}"
          warn "^#{ref} ◀ throws@6^", reverse message
          T?.fail "^#{ref} ◀ throws@7^ #{message}"
    #.......................................................................................................
    unless error?
      message = "`throws()`: expected an error but none was thrown"
      warn "^#{ref} ◀ throws@8^", reverse message
      T?.fail "^#{ref} ◀ throws@9^ #{message}"
    #.......................................................................................................
    return null

  #---------------------------------------------------------------------------------------------------------
  _throws_async: ( T, f, matcher ) -> # new Promise ( resolve, reject ) =>
    ###

    * needs `f` to be an `asyncfunction` (although `function` will also work? better check anyway?)
    * uses `try` / `except` clause to `await` `result` of calling `f`
    * in case `result` is delivered, that's an error
    * otherwise an `error` will be caught;
      * success when `matcher` is missing, or else, when `matcher` describes `error.message`;
      * failure otherwise

    ###
    throw new Error "Ωgt__15 test method should be named, got #{rpr f}" if ( ref = f.name ) is ''
    ### TAINT check whether `f` is `asyncfunction`? ###
    error = null
    #.......................................................................................................
    try
      result = await f()
    #.......................................................................................................
    catch error
      #.....................................................................................................
      unless matcher?
        help "#{ref} ◀ Ωgt__16 error OK     ", reverse error.message
        T?.ok true
        return null
      #.....................................................................................................
      switch matcher_type = @_match_error error, matcher
        when true
          help "#{ref} ◀ Ωgt__17 error OK     ", reverse error.message
          T?.ok true
        when false
          urge "#{ref} ◀ Ωgt__18 error        ", reverse error.message
          warn "#{ref} ◀ Ωgt__19 doesn't match", reverse rpr matcher
          T?.fail "#{ref} ◀ Ωgt__20 error #{rpr error.message} doesn't match #{rpr matcher}"
        else
          message = "expected a regex or a text for matcher, got a #{matcher_type}"
          warn "#{ref} ◀ Ωgt__21", reverse message
          T?.fail "#{ref} ◀ Ωgt__22 #{message}"
    #.......................................................................................................
    unless error?
      message = "expected an error but none was thrown, instead got result #{rpr result}"
      warn "#{ref} ◀ Ωgt__23", reverse message
      T?.fail "#{ref} ◀ Ωgt__24 #{message}"
    #.......................................................................................................
    return null


  #=========================================================================================================
  # SET EQUALITY BY VALUE
  #---------------------------------------------------------------------------------------------------------
  _set_contains: ( set, value ) ->
    for element from set
      return true if @_equals element, value
    return false

  #---------------------------------------------------------------------------------------------------------
  _sets_are_equal: ( a, b ) ->
    return false unless isa.set b
    return false unless a.size is b.size
    for element from a
      return false unless @_set_contains b, element
    return true

  #---------------------------------------------------------------------------------------------------------
  _equals: ( a, b ) ->
    return false unless ( type_of a ) is ( type_of b )
    return @_sets_are_equal a, b if isa.set a
    return _jkequals a, b


#===========================================================================================================
t = new Test()
module.exports = {
  Test:         Test,
  _TMP_test:    t,
  test:         t.test,
  equals:       t.equals,
  eq:           t.eq,
  throws:       t.throws,
  throws_async: t.throws_async, }
