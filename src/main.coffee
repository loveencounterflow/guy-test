

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
test                      = require 'guy-test'
types                     = new ( require 'intertype' ).Intertype()
_equals                   = require '../deps/jkroso-equals'
# equals                    = require '/home/flow/jzr/intertype-legacy/deps/jkroso-equals.js'
# equals                    = require '/home/flow/jzr/hengist/dev/intertype-2024-04-15/src/basics.test.coffee'
# equals                    = require ( require 'util' ).isDeepStrictEqual
### TAINT these should become instance configuration ###
test_mode                 = 'throw_failures'
test_mode                 = 'throw_errors'
test_mode                 = 'failsafe'


#===========================================================================================================
# IMPLEMENT SET EQUALITY
#-----------------------------------------------------------------------------------------------------------
_set_contains = ( set, value ) ->
  for element from set
    return true if equals element, value
  return false

#-----------------------------------------------------------------------------------------------------------
equals = ( a, b ) ->
  switch true
    when types.isa.set a
      return false unless types.isa.set b
      return false unless a.size is b.size
      for element from a
        return false unless _set_contains b, element
      return true
  return _equals a, b

#-----------------------------------------------------------------------------------------------------------
test_set_equality_by_value = ->
  echo()
  result    = [ 1, [ 2 ], ]
  matcher1  = [ 1, [ 2 ], ]
  matcher2  = [ 1, [ 3 ], ]
  debug '^810-1^', equals result, matcher1
  debug '^810-2^', equals result, matcher2
  echo()
  result    = new Set [ 1, 2, ]
  matcher1  = new Set [ 1, 2, ]
  matcher2  = new Set [ 1, 3, ]
  debug '^810-3^', equals result, matcher1
  debug '^810-4^', equals result, matcher2
  echo()
  result    = new Set [ 1, [ 2 ], ]
  matcher1  = new Set [ 1, [ 2 ], ]
  matcher2  = new Set [ 1, [ 3 ], ]
  debug '^810-5^', equals result, matcher1
  debug '^810-6^', equals result, matcher2


#===========================================================================================================
###

Method to replace `T.throws()` and `try_and_show()`; takes 2, 3, or 4 arguments; with 4 arguments, second
argument should be error class

###
throws = ( T, matcher, f ) ->
  switch arity = arguments.length
    when 2 then [ T, matcher, f, ] = [ T, null, matcher, ]
    when 3 then null
    else throw new Error "`throws()` needs 2 or 3 arguments, got #{arity}"
  #.........................................................................................................
  error       = null
  is_matching = null
  #.........................................................................................................
  try ( urge '^992-1^', "`throws()` result of call:", f() ) catch error
    #.......................................................................................................
    if matcher?
      is_matching = false
      switch matcher_type = types.type_of matcher
        when 'text'
          is_matching = error.message is matcher
        when 'regex'
          matcher.lastIndex = 0
          is_matching = matcher.test error.message
        else
          throw new Error "^992-2^ expected a regex or a text, got a #{matcher_type}"
      if is_matching
        help '^992-3^', "OK           ", reverse error.message
      else
        urge '^992-4^', "error        ", reverse error.message
        warn '^992-5^', "doesn't match", reverse rpr matcher
        T?.fail "^992-6^ error #{rpr error.message} doesn't match #{rpr matcher}"
    #.......................................................................................................
    else
      help '^992-7^', "error        ", reverse error.message
  #.........................................................................................................
  unless error?
    warn '^992-8^', reverse message = "`throws()`: expected an error but none was thrown"
    T?.fail "^992-9^ `throws()`: expected an error but none was thrown"
  #.........................................................................................................
  return null

#-----------------------------------------------------------------------------------------------------------
_match_error = ( error, matcher ) ->
  switch matcher_type = types.type_of matcher
    when 'text'
      return error.message is matcher
    when 'regex'
      matcher.lastIndex = 0
      return matcher.test error.message
  return matcher_type

#-----------------------------------------------------------------------------------------------------------
throws2 = ( T, f, matcher ) ->
  throw new Error "^992-1^ test method should be named, got #{rpr f}" if ( ref = f.name ) is ''
  error = null
  #.........................................................................................................
  try ( urge "^#{ref}^ `throws()` result of call:", f() ) catch error
    unless matcher?
      help "^#{ref} ◀ throw2@1^ error        ", reverse error.message
      T?.ok true
      return null
    #.......................................................................................................
    switch matcher_type = _match_error error, matcher
      when true
        help "^#{ref} ◀ throw2@2^ OK           ", reverse error.message
        T?.ok true
      when false
        urge "^#{ref} ◀ throw2@3^ error        ", reverse error.message
        warn "^#{ref} ◀ throw2@4^ doesn't match", reverse rpr matcher
        T?.fail "^#{ref} ◀ throw2@5^ error #{rpr error.message} doesn't match #{rpr matcher}"
      else
        message = "expected a regex or a text, got a #{matcher_type}"
        warn "^#{ref} ◀ throw2@6^", reverse message
        T?.fail "^#{ref} ◀ throw2@7^ #{message}"
  #.........................................................................................................
  unless error?
    message = "`throws()`: expected an error but none was thrown"
    warn "^#{ref} ◀ throw2@8^", reverse message
    T?.fail "^#{ref} ◀ throw2@9^ #{message}"
  #.........................................................................................................
  return null


#===========================================================================================================
eq = ( ref, T, result, matcher ) ->
  ref = ref.padEnd 15
  if equals result, matcher
    help ref, "EQ OK"
    T?.ok true
  else
    warn ref, ( reverse ' neq ' ), "result:     ", ( reverse ' ' + ( rpr result   ) + ' ' )
    warn ref, ( reverse ' neq ' ), "matcher:    ", ( reverse ' ' + ( rpr matcher  ) + ' ' )
    T?.ok false
  return null

#-----------------------------------------------------------------------------------------------------------
eq2 = ( T, f, matcher ) ->
  throw new Error "^992-1^ test method should be named, got #{rpr f}" if ( ref = f.name ) is ''
  try ( result = f() ) catch error
    message = "`eq2()`: ^#{ref}^ expected a result but got an an error: #{error.message}"
    warn '^992-12^', reverse message
    T?.fail "^992-13^ #{message}"
    debug '^25235234^', { test_mode}
    if test_mode is 'throw_errors'
      throw new Error message
  return eq ref, T, result, matcher

#===========================================================================================================
try_and_show = ( T, f ) ->
  error = null
  try ( urge '^992-10^', "`try_and_show():` result of call:", f() ) catch error
    help '^992-11^', reverse "`try_and_show()`: #{rpr error.message}"
  unless error?
    warn '^992-12^', reverse message = "`try_and_show()`: expected an error but none was thrown"
    T?.fail "^992-13^ `try_and_show()`: expected an error but none was thrown"
  return null

#===========================================================================================================
safeguard = ( T, f ) ->
  error = null
  try f() catch error
    # throw error unless T?
    warn '^992-14^', reverse message = "`safeguard()`: #{rpr error.message}"
    T?.fail message
  return null


module.exports = { equals, eq2, throws2, }

