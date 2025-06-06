

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
_jktypeof                 = require '../deps/jkroso-type'
{ hide }                  = GUY.props
WG                        = require 'webguy'
{ nameit }                = WG.props
{ to_width }              = require 'to-width'
j                         = ( P... ) -> ( crumb for crumb in P when crumb? ).join '.'


#===========================================================================================================
types                     = new Intertype
{ isa
  type_of
  validate
  create                } = types
#...........................................................................................................
types.declare
  gt_message_width:
    test:             ( x ) -> ( @isa.cardinal x ) and x > 2
  gt_test_cfg:
    fields:
      auto_reset:     'boolean'
      show_report:    'boolean'
      report_checks:  'boolean'
      show_results:   'boolean'
      show_fails:     'boolean'
      show_passes:    'boolean'
      throw_on_error: 'boolean'
      throw_on_fail:  'boolean'
      message_width:  'gt_message_width'
      prefix:         'text'
      #.....................................................................................................
      # these should be mixed-in from `equals_cfg`_
      ordered_objects:  'boolean'
      ordered_sets:     'boolean'
      ordered_maps:     'boolean'
      signed_zero:      'boolean'
    template:
      auto_reset:     false
      show_report:    true
      report_checks:  true
      show_results:   true
      show_fails:     true
      show_passes:    true
      throw_on_error: false
      throw_on_fail:  false
      message_width:  300
      prefix:         ''
      #.....................................................................................................
      # these should be mixed-in from `equals_cfg`_
      ordered_objects:  false
      ordered_sets:     false
      ordered_maps:     false
      signed_zero:      false
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
  equals_cfg:
    fields:
      ordered_objects:  'boolean'
      ordered_sets:     'boolean'
      ordered_maps:     'boolean'
      signed_zero:      'boolean'
    template:
      ordered_objects:  false
      ordered_sets:     false
      ordered_maps:     false
      signed_zero:      false
  # gt_report_cfg:
  #   fields:
  #     prefix:   'text'
  #   template:
  #     prefix:   ''

#===========================================================================================================
class _Assumptions

  #---------------------------------------------------------------------------------------------------------
  constructor: ( host, upref = null ) ->
    hide @, '_', host
    hide @, '_upref', upref
    hide @, 'equals', nameit 'equals', ( a, b ) => equals a, b, @_.cfg
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
      if @_.cfg.throw_on_error
        error.message = message; throw error
      return null
    #.......................................................................................................
    return @pass shortref, 'eq' if @equals result, matcher
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
      if @_.cfg.throw_on_error
        error.message = message; throw error
      return null
    #.......................................................................................................
    return @pass shortref, 'eq' if @equals result, matcher
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
          urge "#{ref}.Ωgt___4 error        ", reverse error.message
          warn "#{ref}.Ωgt___5 doesn't match", reverse rpr matcher
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
class Test extends _Assumptions

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    super null; @_ = @
    @cfg = Object.freeze create.gt_test_cfg cfg
    @totals = create.gt_totals()
    #.......................................................................................................
    hide @, 'test',         nameit 'test',          ( P... ) =>       @_test          P...
    hide @, 'async_test',   nameit 'async_test',    ( P... ) => await @_async_test    P...
    hide @, 'report',       nameit 'report',        ( P... ) =>       @_report        P...
    #.......................................................................................................
    hide @, '_KW_test_ref',                            '██_KW_test_ref'
    hide @, 'stats',                                { '*': @totals, }
    hide @, 'warnings',                             {}
    return undefined

  #---------------------------------------------------------------------------------------------------------
  _test: ( tests... ) ->
    @_test_inner null, tests...
    @report() if @cfg.show_report
    process.exitCode = 99 if @totals.fails isnt 0
    return @stats

  #---------------------------------------------------------------------------------------------------------
  _async_test: ( tests... ) ->
    await @_async_test_inner null, tests...
    @report() if @cfg.show_report
    process.exitCode = 99 if @totals.fails isnt 0
    return @stats

  #---------------------------------------------------------------------------------------------------------
  _test_inner: ( upref, tests... ) ->
    ### TAINT preliminary handling of arguments ###
    for candidate in tests then switch true
      #.....................................................................................................
      when isa.function candidate
        try
          ctx = new _Assumptions @, upref
          candidate.call ctx, ctx
        catch error
          # ref     = ( j upref, 'Ωgt___6' )
          ref     = upref
          message = "an unexpected error occurred when calling task #{rpr ref}; #{rpr error.message}"
          @fail ref, 'error', message
          if @cfg.throw_on_error
            error.message = message; throw error
      #.....................................................................................................
      when isa.object candidate
        for key, property of candidate
          @_test_inner ( j upref, key ), property
      #.....................................................................................................
      when not candidate?
        # ref     = ( j upref, 'Ωgt___7' )
        ref     = upref
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
          ctx = new _Assumptions @, upref
          await candidate.call ctx, ctx
        catch error
          ref     = ( j upref, 'Ωgt___8' )
          message = "an unexpected error occurred when calling task #{rpr ref}; #{rpr error.message}"
          @fail ref, 'error', message
          if @cfg.throw_on_error
            error.message = message; throw error
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
      whisper 'Ωgt___9 ' + @cfg.prefix, line
      whisper 'Ωgt__10 ' + @cfg.prefix, reverse GUY.trm[ color ] ( '*'.padEnd 20 ), @totals
      whisper 'Ωgt__11 ' + @cfg.prefix, line
      return null
    #.......................................................................................................
    whisper()
    whisper 'Ωgt__12 ' + @cfg.prefix, line
    whisper 'Ωgt__13 ' + @cfg.prefix, gold '                        🙤 GUY TEST 🙦'
    color = if @totals.fails is 0 then 'lime' else 'red'
    if @cfg.report_checks
      whisper 'Ωgt__14 ' + @cfg.prefix, line
      for key, stats of @stats
        continue if key is '*'
        whisper 'Ωgt__15 ' + @cfg.prefix, blue ( key.padEnd 20 ), stats
    show_totals()
    repeat_totals = false
    for sub_ref, messages of @warnings
      repeat_totals = true
      for message in messages
        whisper 'Ωgt__16 ' + @cfg.prefix, ( red sub_ref ), reverse red " #{message} "
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



#===========================================================================================================
# SET EQUALITY BY VALUE
#-----------------------------------------------------------------------------------------------------------
equals = ( a, b, cfg ) ->
  cfg = _create_equals_cfg cfg
  ### NOTE these comparisons disregard sign of zero ###
  return true if ( not cfg.signed_zero ) and ( a is 0 ) and ( b is 0 )
  return false unless ( type_of_a = type_of a ) is ( type_of b )
  if ( type_of_a is 'set' )
    return _ordered_sets_or_maps_are_equal    a, b, cfg if cfg.ordered_sets
    return _unordered_sets_or_maps_are_equal  a, b, cfg
  if ( type_of_a is 'map' )
    return _ordered_sets_or_maps_are_equal    a, b, cfg if cfg.ordered_maps
    return _unordered_sets_or_maps_are_equal  a, b, cfg
  R = _jkequals a, b
  #.........................................................................................................
  ### TAINT this repeats work already done by _jkequals and should be implemented in that module ###
  if R and cfg.ordered_objects and ( _jktypeof a ) is 'object'
    return _jkequals ( k for k of a when k isnt 'constructor' ), ( k for k of b when k isnt 'constructor' )
  #.........................................................................................................
  return R
#...........................................................................................................
_set_or_map_contains = ( set_or_map, element, cfg ) ->
  for element_2 from set_or_map
    if equals element_2, element, cfg
      return true
  return false
#...........................................................................................................
_ordered_sets_or_maps_are_equal = ( a, b, cfg ) ->
  ### TAINT only use if both a, b have same type and type is `set` or `map` ###
  return false unless a.size is b.size
  idx = -1
  entries_of_b = [ b..., ]
  for element from a
    idx++
    return false unless equals element, entries_of_b[ idx ], cfg
  return true
#...........................................................................................................
_unordered_sets_or_maps_are_equal = ( a, b, cfg ) ->
  ### TAINT only use if both a, b have same type and type is `set` or `map` ###
  return false unless a.size is b.size
  for element from a
    return false unless _set_or_map_contains b, element, cfg
  return true
#...........................................................................................................
_create_equals_cfg = ( cfg ) ->
  return R if ( R = _known_equals_cfgs.get cfg )?
  _known_equals_cfgs.set cfg, R = create.equals_cfg cfg
  return R
#...........................................................................................................
_known_equals_cfgs = new Map()


#===========================================================================================================
module.exports = { Test, _Assumptions, equals, _types: types, }
