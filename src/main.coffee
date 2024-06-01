

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
j                         = ( P... ) -> ( crumb for crumb in P when crumb? ).join '.'


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
      throw_on_error: 'boolean'
      throw_on_fail:  'boolean'
      message_width:  'gt_message_width'
      prefix:         'text'
    template:
      auto_reset:     false
      show_report:    true
      show_results:   true
      show_fails:     true
      show_passes:    true
      throw_on_error: false
      throw_on_fail:  false
      message_width:  300
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
class Assumptions

  #---------------------------------------------------------------------------------------------------------
  constructor: ( host, upref = null ) ->
    hide @, '_', host
    hide @, '_upref', upref
    # hide @, 'pass',         nameit 'pass',          ( P... ) =>       @_pass          P...
    # hide @, 'fail',         nameit 'fail',          ( P... ) =>       @_fail          P...
    # hide @, 'eq',           nameit 'eq',            ( P... ) =>       @_eq            P...
    # hide @, 'async_eq',     nameit 'async_eq',      ( P... ) =>       @_async_eq      P...
    # hide @, 'throws',       nameit 'throws',        ( P... ) =>       @_throws        P...
    # hide @, 'async_throws', nameit 'async_throws',  ( P... ) => await @_async_throws  P...
    return undefined

  #=========================================================================================================
  pass: ( upref, cat, message = null ) ->
    ref = ( j @_upref, upref )
    @_._increment_passes ref
    if @_.cfg.show_passes
      if message?
        message = @_to_message_width message
        help ref, cat, reverse " #{message} "
      else
        help ref, cat
    return null

  #---------------------------------------------------------------------------------------------------------
  fail: ( upref, cat, message = null ) ->
    ref = ( j @_upref, upref )
    @_._increment_fails ref
    @_._warn ref, if message? then "(#{cat}) #{message}" else cat
    if @_.cfg.show_fails
      if message?
        message = @_to_message_width message
        warn ref, cat, reverse " #{message} "
      else
        warn ref, cat
    return null

  #=========================================================================================================
  eq: ( f, matcher ) ->
    shortref  = @_._ref_from_function f
    ref       = ( j @_upref, shortref )
    #.......................................................................................................
    try ( result = f.call @, @ ) catch error
      message = "expected a result but got an an error: #{rpr error.message}"
      @fail shortref, 'error', message
      throw new Error message if @_.cfg.throw_on_error
      return null
    #.......................................................................................................
    return @pass shortref, 'eq' if @_.equals result, matcher
    #.......................................................................................................
    warn ref, ( reverse ' neq ' ), "result:     ", ( reverse ' ' + ( rpr result   ) + ' ' )
    warn ref, ( reverse ' neq ' ), "matcher:    ", ( reverse ' ' + ( rpr matcher  ) + ' ' )
    @fail shortref, 'neq'
    throw new Error "neq:\nresult:     #{rpr result}\nmatcher:    #{matcher}" if @_.cfg.throw_on_fail
    #.......................................................................................................
    return null

  #---------------------------------------------------------------------------------------------------------
  async_eq: ( f, matcher ) ->
    shortref  = @_._ref_from_function f
    ref       = ( j @_upref, shortref )
    #.......................................................................................................
    try ( result = await f.call @, @ ) catch error
      message = "expected a result but got an an error: #{rpr error.message}"
      @fail shortref, 'error', message
      throw new Error message if @_.cfg.throw_on_error
      return null
    #.......................................................................................................
    return @pass shortref, 'eq' if @_.equals result, matcher
    #.......................................................................................................
    warn ref, ( reverse ' neq ' ), "result:     ", ( reverse ' ' + ( rpr result   ) + ' ' )
    warn ref, ( reverse ' neq ' ), "matcher:    ", ( reverse ' ' + ( rpr matcher  ) + ' ' )
    @fail shortref, 'neq'
    throw new Error "neq:\nresult:     #{rpr result}\nmatcher:    #{matcher}" if @_.cfg.throw_on_fail
    #.......................................................................................................
    return null

  #=========================================================================================================
  throws: ( f, matcher ) ->
    shortref  = @_._ref_from_function f
    ref       = ( j @_upref, shortref )
    error     = null
    #.......................................................................................................
    try ( urge ( j @_upref, shortref, 'Ωgt___1' ), "`throws()` result of call:", rpr f.call @, @ ) catch error
      unless matcher?
        @pass shortref, 'error ok', error.message
        return null
      #.....................................................................................................
      switch matcher_type = @_._match_error error, matcher
        when true
          @pass shortref, 'error ok', error.message
        when false
          urge ( j @_upref, shortref, 'Ωgt___2' ), "error        ", reverse error.message  ### TAINT to be replaced ###
          warn ( j @_upref, shortref, 'Ωgt___3' ), "doesn't match", reverse rpr matcher    ### TAINT to be replaced ###
          @fail shortref, 'neq', "error #{rpr error.message} doesn't match #{rpr matcher}"
        else
          @fail shortref, 'type', "expected a regex or a text, got a #{matcher_type}"
    #.......................................................................................................
    unless error?
      @fail shortref, 'noerr', "expected an error but none was thrown"
    #.......................................................................................................
    return null

  #---------------------------------------------------------------------------------------------------------
  async_throws: ( f, matcher ) -> # new Promise ( resolve, reject ) =>
    ###

    * needs `f` to be an `asyncfunction` (although `function` will also work? better check anyway?)
    * uses `try` / `except` clause to `await` `result` of calling `f`
    * in case `result` is delivered, that's an error
    * otherwise an `error` will be caught;
      * success when `matcher` is missing, or else, when `matcher` describes `error.message`;
      * failure otherwise

    ###
    ### TAINT check whether `f` is `asyncfunction`? ###
    shortref  = @_._ref_from_function f
    ref       = ( j @_upref, shortref )
    error     = null
    #.......................................................................................................
    try
      result = await f.call @, @
    #.......................................................................................................
    catch error
      #.....................................................................................................
      unless matcher?
        @pass shortref, 'error ok', "did throw #{rpr error.message}"
        return null
      #.....................................................................................................
      switch matcher_type = @_._match_error error, matcher
        when true
          @pass shortref, 'error ok', "did throw #{rpr error.message}"
        when false
          urge "#{ref}.Ωgt___6 error        ", reverse error.message
          warn "#{ref}.Ωgt___7 doesn't match", reverse rpr matcher
          @fail shortref, 'error nok', "did throw but not match #{rpr error.message}"
        else
          @fail shortref, 'fail', "expected a regex or a text for matcher, got a #{matcher_type}"
    #.......................................................................................................
    unless error?
      @fail shortref, 'missing', "expected an error but none was thrown, instead got result #{rpr result}"
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
  _to_message_width: ( message ) -> ( to_width message, @_.cfg.message_width ).trimEnd()



#===========================================================================================================
class Test extends Assumptions

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    super null; @_ = @
    @cfg = Object.freeze create.gt_test_cfg cfg
    @totals = create.gt_totals()
    #.......................................................................................................
    hide @, 'test',         nameit 'test',          ( P... ) =>       @_test          P...
    hide @, 'async_test',   nameit 'async_test',    ( P... ) => await @_async_test    P...
    hide @, 'report',       nameit 'report',        ( P... ) =>       @_report        P...
    hide @, 'equals',       nameit 'equals',        ( P... ) =>       @_equals        P...
    #.......................................................................................................
    hide @, '_KW_test_ref',                            '██_KW_test_ref'
    hide @, 'stats',                                { '*': @totals, }
    hide @, 'warnings',                             {}
    return undefined

  #---------------------------------------------------------------------------------------------------------
  _test: ( tests... ) ->
    @_test_inner null, tests...
    @report() if @cfg.show_report
    return @stats

  #---------------------------------------------------------------------------------------------------------
  _async_test: ( tests... ) ->
    await @_async_test_inner null, tests...
    @report() if @cfg.show_report
    return @stats

  #---------------------------------------------------------------------------------------------------------
  _test_inner: ( upref, tests... ) ->
    ### TAINT preliminary handling of arguments ###
    for candidate in tests then switch true
      #.....................................................................................................
      when isa.function candidate
        try
          ctx = new Assumptions @, upref
          candidate.call ctx, ctx
        catch error
          ref     = ( j upref, 'Ωgt___8' )
          message = "an unexpected error occurred when calling task #{rpr ref}; #{rpr error.message}"
          @fail ref, 'error', message
          throw new Error message if @cfg.throw_on_error
      #.....................................................................................................
      when isa.object candidate
        for key, property of candidate
          @_test_inner ( j upref, key ), property
      #.....................................................................................................
      when not candidate?
        ref     = ( j upref, 'Ωgt___9' )
        @fail ref, 'missing', "expected a test, got a #{type_of candidate}"
      #.....................................................................................................
      else
        ref = ( j upref, @_ref_from_function candidate )
        @fail ref, 'type', "expected a test, got a #{type_of candidate}"
    #.......................................................................................................
    return null

  #---------------------------------------------------------------------------------------------------------
  _async_test_inner: ( upref, tests... ) ->
    for candidate in tests then switch true
      #.....................................................................................................
      when isa.function candidate
        await @_test_inner upref, candidate
      #.....................................................................................................
      when isa.asyncfunction candidate
        try
          ctx = new Assumptions @, upref
          await candidate.call ctx, ctx
        catch error
          ref     = ( j upref, 'Ωgt__11' )
          message = "an unexpected error occurred when calling task #{rpr ref}; #{rpr error.message}"
          @fail ref, 'error', message
          throw new Error message if @cfg.throw_on_error
      #.....................................................................................................
      when isa.object candidate
        for key, property of candidate
          await @_async_test_inner ( j upref, key ), property
      #.....................................................................................................
      else
        ref = ( j upref, @_ref_from_function candidate )
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
      whisper 'Ωgt__14 ' + @cfg.prefix, line
      whisper 'Ωgt__15 ' + @cfg.prefix, reverse GUY.trm[ color ] ( '*'.padEnd 20 ), @totals
      whisper 'Ωgt__16 ' + @cfg.prefix, line
      return null
    #.......................................................................................................
    whisper()
    whisper 'Ωgt__17 ' + @cfg.prefix, line
    whisper 'Ωgt__18 ' + @cfg.prefix, gold '                        🙤 GUY TEST 🙦'
    whisper 'Ωgt__19 ' + @cfg.prefix, line
    color = if @totals.fails is 0 then 'lime' else 'red'
    for key, stats of @stats
      continue if key is '*'
      whisper 'Ωgt__20 ' + @cfg.prefix, blue ( key.padEnd 20 ), stats
    show_totals()
    repeat_totals = false
    for sub_ref, messages of @warnings
      repeat_totals = true
      for message in messages
        whisper 'Ωgt__21 ' + @cfg.prefix, ( red sub_ref ), reverse red " #{message} "
    show_totals() if repeat_totals
    whisper()
    #.......................................................................................................
    return @stats

  #---------------------------------------------------------------------------------------------------------
  _increment_passes:  ( check_ref ) -> @_increment 'passes', check_ref
  _increment_fails:   ( check_ref ) -> @_increment 'fails',  check_ref

  #---------------------------------------------------------------------------------------------------------
  _increment: ( pass_or_fail, check_ref ) ->
    per_check_stats = @stats[ check_ref ] ?= create.gt_stats()
    per_check_stats[  pass_or_fail ]++
    @totals[          pass_or_fail ]++
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
