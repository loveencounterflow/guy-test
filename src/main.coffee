

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
  whisper }               = GUY.trm.get_loggers 'GT'
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
{ to_width }              = require 'to-width'
### TAINT these should become instance configuration ###
test_mode                 = 'throw_failures'
test_mode                 = 'throw_errors'
test_mode                 = 'failsafe'


#===========================================================================================================
{ isa, type_of, validate, create, } = new Intertype
  gt_message_width:
    test:             ( x ) -> ( @isa.cardinal x ) and x > 2
  gt_test_cfg:
    fields:
      auto_reset:     'boolean'
      show_report:    'boolean'
      show_results:   'boolean'
      show_fails:     'boolean'
      show_passes:    'boolean'
      throw_errors:   'boolean'
      message_width:  'gt_message_width'
      prefix:         'text'
    template:
      auto_reset:     false
      show_report:    true
      show_results:   true
      show_fails:     true
      show_passes:    true
      throw_errors:   false
      message_width:  50
      prefix:         ''
  gt_stats:
    fields:
      passes:   'cardinal'
      fails:    'cardinal'
    template:
      passes:   0
      fails:    0
  gt_totals: ### TAINT use inheritance to derive shared fields ###
    fields:
      passes:   'cardinal'
      fails:    'cardinal'
    template:
      passes:   0
      fails:    0
  # gt_report_cfg:
  #   fields:
  #     prefix:   'text'
  #   template:
  #     prefix:   ''


#===========================================================================================================
class Test

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    @cfg = Object.freeze create.gt_test_cfg cfg
    @totals = create.gt_totals()
    #.......................................................................................................
    hide @, 'pass',         nameit 'pass',          ( P... ) =>       @_pass          P...
    hide @, 'fail',         nameit 'fail',          ( P... ) =>       @_fail          P...
    hide @, 'test',         nameit 'test',          ( P... ) =>       @_test          P...
    hide @, 'report',       nameit 'report',        ( P... ) =>       @_report        P...
    hide @, 'eq',           nameit 'eq',            ( P... ) =>       @_eq            P...
    hide @, 'async_eq',     nameit 'async_eq',      ( P... ) =>       @_async_eq      P...
    hide @, 'throws',       nameit 'throws',        ( P... ) =>       @_throws        P...
    hide @, 'equals',       nameit 'equals',        ( P... ) =>       @_equals        P...
    #.......................................................................................................
    hide @, 'async_test',   nameit 'async_test',    ( P... ) => await @_async_test    P...
    hide @, 'async_throws', nameit 'async_throws',  ( P... ) => await @_async_throws  P...
    #.......................................................................................................
    hide @, '_test_ref',                            null
    hide @, 'stats',                                { '*': @totals, }
    hide @, 'warnings',                             {}
    return undefined

  #---------------------------------------------------------------------------------------------------------
  _test: ( tests... ) ->
    @_test_inner tests...
    @report() if @cfg.show_report
    return @stats

  #---------------------------------------------------------------------------------------------------------
  _async_test: ( tests... ) ->
    await @_async_test_inner tests...
    @report() if @cfg.show_report
    return @stats

  #---------------------------------------------------------------------------------------------------------
  _test_inner: ( tests... ) ->
    ### TAINT preliminary handling of arguments ###
    for candidate in tests then switch true
      #.....................................................................................................
      when isa.function candidate
        @_test_ref = ref = @_ref_from_function candidate
        # @_increment_tests 'test', ref
        try
          candidate.call @
        catch error
          @fail ref, 'error', "an unexpected error occurred when calling task #{rpr ref}; #{rpr error.message}"
        finally @_test_ref = null
      #.....................................................................................................
      when isa.object candidate
        for key, property of candidate
          @_test_inner property
      #.....................................................................................................
      when not candidate?
        ref     = 'Ωgt___1'
        @fail ref, 'missing', "expected a test, got a #{type_of candidate}"
      #.....................................................................................................
      else
        ref     = @_ref_from_function candidate
        ref     = 'Ωgt___2' if ref is 'anon'
        @fail ref, 'type', "expected a test, got a #{type_of candidate}"
    #.......................................................................................................
    return null

  #---------------------------------------------------------------------------------------------------------
  _async_test_inner: ( tests... ) ->
    for candidate in tests then switch true
      #.....................................................................................................
      when isa.function candidate
        @_test_inner candidate
      #.....................................................................................................
      when isa.asyncfunction candidate
        @_test_ref = @_ref_from_function candidate
        # @_increment_tests 'test', @_test_ref
        try await candidate.call @ catch error then finally @_test_ref = null
      #.....................................................................................................
      when isa.object candidate
        for key, property of candidate
          await @_async_test_inner property
      #.....................................................................................................
      else
        ref     = @_ref_from_function candidate
        ref     = 'Ωgt__30' if ref is 'anon'
        @fail ref, 'type', "expected a test, got a #{type_of candidate}"
    #.......................................................................................................
    return null

  #---------------------------------------------------------------------------------------------------------
  _report: ->
    { blue
      red
      gold    } = GUY.trm
    line        = gold '—————————————————————————————————————————————————————————————————'
    #.......................................................................................................
    show_totals = =>
      whisper 'Ωgt__31 ' + @cfg.prefix, line
      whisper 'Ωgt__32 ' + @cfg.prefix, reverse GUY.trm[ color ] ( '*'.padEnd 20 ), @totals
      whisper 'Ωgt__33 ' + @cfg.prefix, line
      return null
    #.......................................................................................................
    whisper()
    whisper 'Ωgt__34 ' + @cfg.prefix, line
    whisper 'Ωgt__35 ' + @cfg.prefix, gold '                        🙤 GUY TEST 🙦'
    whisper 'Ωgt__36 ' + @cfg.prefix, line
    color = if @totals.fails is 0 then 'lime' else 'red'
    for key, stats of @stats
      continue if key is '*'
      whisper 'Ωgt__37 ' + @cfg.prefix, blue ( key.padEnd 20 ), stats
    show_totals()
    repeat_totals = false
    for sub_ref, messages of @warnings
      repeat_totals = true
      for message in messages
        whisper 'Ωgt__38 ' + @cfg.prefix, ( red sub_ref ), reverse red " #{message} "
    show_totals() if repeat_totals
    whisper()
    #.......................................................................................................
    return @stats

  #---------------------------------------------------------------------------------------------------------
  _increment_passes:  ( level, check_ref ) -> @_increment level, 'passes', check_ref
  _increment_fails:   ( level, check_ref ) -> @_increment level, 'fails',  check_ref

  #---------------------------------------------------------------------------------------------------------
  _pass: ( ref, cat, message = null ) ->
    message ?= "(no message given)"
    @_increment_passes 'check', ref
    if @cfg.show_passes
      if message?
        message = to_width message, @cfg.message_width
        help ref, cat, reverse " #{message} "
      else
        help ref, cat
    return null

  #---------------------------------------------------------------------------------------------------------
  _fail: ( ref, cat, message = null ) ->
    @_increment_fails 'check', ref
    ref = "#{@_test_ref}.#{ref}"
    @_warn ref, if message? then "(#{cat}) #{message}" else cat
    if @cfg.show_fails
      if message?
        message = to_width message, @cfg.message_width
        warn ref, cat, reverse " #{message} "
      else
        warn ref, cat
    return null

  #---------------------------------------------------------------------------------------------------------
  _increment: ( level, key, check_ref ) ->
    ### TAINT get rid of `level` kludge ###
    @totals[ key ]++
    per_test_stats  = @stats[ "#{@_KW_test_ref}.*"             ] ?= create.gt_stats()
    if level is 'check'
      per_check_stats = @stats[ "#{@_KW_test_ref}.#{check_ref}"  ] ?= create.gt_stats()
      unless key is 'tests'
        per_test_stats[ key ]++
        per_check_stats[ key ]++
    return null

  #---------------------------------------------------------------------------------------------------------
  _warn: ( ref, message ) ->
    ( @warnings[ ref ] ?= [] ).push ( message ? './.' )
    return null

  #---------------------------------------------------------------------------------------------------------
  _ref_from_function: ( f ) ->
    R = 'anon' if ( R = f.name ) is ''
    # throw new Error "^992-1^ test method should be named, got #{rpr f}" if ( R = f.name ) is ''
    return R


  #=========================================================================================================
  _eq: ( f, matcher ) ->
    ref = @_ref_from_function f
    #.......................................................................................................
    try ( result = f() ) catch error
      message = "expected a result but got an an error: #{rpr error.message}"
      @fail "#{ref}.Ωgt__12", 'error', message
      throw new Error message if test_mode is 'throw_errors'
      return null
    #.......................................................................................................
    return @pass "#{ref}.Ωgt__13", 'eq' if @equals result, matcher
    #.......................................................................................................
    warn "#{ref}.Ωgt__14", ( reverse ' neq ' ), "result:     ", ( reverse ' ' + ( rpr result   ) + ' ' )
    warn "#{ref}.Ωgt__15", ( reverse ' neq ' ), "matcher:    ", ( reverse ' ' + ( rpr matcher  ) + ' ' )
    @fail "#{ref}.Ωgt__16", 'neq'
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
  _throws: ( f, matcher ) ->
    ref   = @_ref_from_function f
    error = null
    #.......................................................................................................
    try ( urge "^#{ref}^ `throws()` result of call:", f() ) catch error
      unless matcher?
        @pass "#{ref}.Ωgt__17", 'error ok', error.message
        return null
      #.....................................................................................................
      switch matcher_type = @_match_error error, matcher
        when true
          @pass "#{ref}.Ωgt__18", 'error ok', error.message
        when false
          urge "^#{ref}.Ωgt__19^ error        ", reverse error.message  ### TAINT to be replaced ###
          warn "^#{ref}.Ωgt__20^ doesn't match", reverse rpr matcher    ### TAINT to be replaced ###
          @fail "#{ref}.Ωgt__21", 'neq', "error #{rpr error.message} doesn't match #{rpr matcher}"
        else
          @fail "#{ref}.Ωgt__22", 'type', "expected a regex or a text, got a #{matcher_type}"
    #.......................................................................................................
    unless error?
      @fail "#{ref}.Ωgt__23", 'noerr', "expected an error but none was thrown"
    #.......................................................................................................
    return null

  #---------------------------------------------------------------------------------------------------------
  _async_throws: ( f, matcher ) -> # new Promise ( resolve, reject ) =>
    ###

    * needs `f` to be an `asyncfunction` (although `function` will also work? better check anyway?)
    * uses `try` / `except` clause to `await` `result` of calling `f`
    * in case `result` is delivered, that's an error
    * otherwise an `error` will be caught;
      * success when `matcher` is missing, or else, when `matcher` describes `error.message`;
      * failure otherwise

    ###
    ### TAINT check whether `f` is `asyncfunction`? ###
    ref   = @_ref_from_function f
    error = null
    #.......................................................................................................
    try
      result = await f()
    #.......................................................................................................
    catch error
      #.....................................................................................................
      unless matcher?
        @pass "#{ref}.Ωgt__24", 'error ok', "did throw #{rpr error.message}"
        return null
      #.....................................................................................................
      switch matcher_type = @_match_error error, matcher
        when true
          @pass "#{ref}.Ωgt__25", 'error ok', "did throw #{rpr error.message}"
        when false
          urge "#{ref}.Ωgt__26 error        ", reverse error.message
          warn "#{ref}.Ωgt__27 doesn't match", reverse rpr matcher
          @fail "#{ref}.Ωgt__28", 'error nok', "did throw but not match #{rpr error.message}"
        else
          @fail "#{ref}.Ωgt__29", 'fail', "expected a regex or a text for matcher, got a #{matcher_type}"
    #.......................................................................................................
    unless error?
      @fail "#{ref}.Ωgt__30", 'missing', "expected an error but none was thrown, instead got result #{rpr result}"
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
  async_test:   t.async_test,
  equals:       t.equals,
  eq:           t.eq,
  throws:       t.throws,
  async_throws: t.async_throws, }
