

############################################################################################################
TRM                       = require 'coffeenode-trm'
rpr                       = TRM.rpr.bind TRM
badge                     = 'GUY-TEST/tests'
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
test                      = require './main'


#-----------------------------------------------------------------------------------------------------------
read_file = ( route, handler ) ->
  ( require 'fs' ).readFile route, { encoding: 'utf-8' }, ( error, text ) ->
    return handler error, text

#-----------------------------------------------------------------------------------------------------------
fetch_data_from_network = ( url, handler ) ->
  setImmediate => handler null, 'the webpage you requested'

#-----------------------------------------------------------------------------------------------------------
fetch_data_from_unreachable_network = ( url, handler ) ->
  setImmediate => handler new Error "network unreachable"

#-----------------------------------------------------------------------------------------------------------
META = {}

#===========================================================================================================
# SYNCHRONOUS TESTS
#-----------------------------------------------------------------------------------------------------------
@[ "sync; checks fail" ] = ( T ) ->
  { name } = T
  checks = T.check META[ name ]
  T.eq checks.length, 2
  T.eq checks[ 0 ][ 'message' ], 'not equal: 42, 43'
  T.eq checks[ 1 ][ 'message' ], 'not OK: false'

#...........................................................................................................
META[ "sync; checks fail" ] = ( T ) ->
  T.eq 42, 43
  T.ok 'another test' == 'another spring'

#-----------------------------------------------------------------------------------------------------------
@[ "sync; fails because `xxx` is not recognized" ] = ( T ) ->
  { name } = T
  checks = T.check META[ name ]
  T.eq checks.length, 1
  T.eq checks[ 0 ][ 'message' ], 'xxx is not defined'

#...........................................................................................................
META[ "sync; fails because `xxx` is not recognized" ] = ( T ) ->
  xxx # variable is undefined

#-----------------------------------------------------------------------------------------------------------
@[ "sync; fails because argument to `T.ok` isn't `true`" ] = ( T ) ->
  { name } = T
  checks = T.check META[ name ]
  T.eq checks.length, 1
  T.eq checks[ 0 ][ 'message' ], 'not OK: false'

#...........................................................................................................
META[ "sync; fails because argument to `T.ok` isn't `true`" ] = ( T ) ->
  T.ok 123 == 456

#-----------------------------------------------------------------------------------------------------------
@[ "sync; calling `T.fail`, but proceeding with a successful test" ] = ( T ) ->
  { name } = T
  checks = T.check META[ name ]
  T.eq checks.length, 1
  T.eq checks[ 0 ][ 'message' ], 'this was not in my plan'

#...........................................................................................................
META[ "sync; calling `T.fail`, but proceeding with a successful test" ] = ( T ) ->
  T.fail "this was not in my plan"
  T.eq 108, 108

#-----------------------------------------------------------------------------------------------------------
@[ "sync; `done` can be used in synchronous tests" ] = ( T, done ) ->
  n = 0
  for idx in [ 0 ... 1e7 ]
    n = ( Math.sin idx ) * ( Math.cos idx + 0.3 )
  T.eq n, -0.41904553942341144
  done()

# #-----------------------------------------------------------------------------------------------------------
# @[ "sync; `throws` catches exception and tests against string" ] = ( T ) ->
#   T.throws 'foo', ( -> throw new Error 'foo' )

# #-----------------------------------------------------------------------------------------------------------
# @[ "sync; `throws` catches exception and tests against regex" ] = ( T ) ->
#   T.throws /expected!/, ( -> throw new Error 'now that was expected!' )

# #-----------------------------------------------------------------------------------------------------------
# @[ "sync; `throws` catches exception and rejects faulty matcher" ] = ( T ) ->
#   T.throws /^expected!/, ( -> throw new Error 'now that was expected!' )

# #-----------------------------------------------------------------------------------------------------------
# @[ "sync; `throws` catches exception, rejects matcher of illegal type" ] = ( T ) ->
#   T.throws true, ( -> throw new Error 'now that was expected!' )

# #-----------------------------------------------------------------------------------------------------------
# @[ "sync; `throws` catches exception and tests against callable matcher" ] = ( T ) ->
#   T.throws ( ( error ) -> T.eq error, 42 ), ( -> throw 42 )


# # #===========================================================================================================
# # # ASYNCHRONOUS TESTS
# # #-----------------------------------------------------------------------------------------------------------
# # @[ "async; fails erroneously in async call" ] = ( T, done ) ->
# #   ### Try to read contents of a non-existing file: ###
# #   read_file '/theres/almost/certainly/nosuchfile.txt', ( error, result ) ->
# #     return done error if error?
# #     ### You should never get an error from this line: ###
# #     this line is never reached

# # #-----------------------------------------------------------------------------------------------------------
# # @[ "async; fails erroneously in handler" ] = ( T, done ) ->
# #   fetch_data_from_network 'http://example.com', ( error, result ) ->
# #     qqq # variable is undefined
# #     done()

# # #-----------------------------------------------------------------------------------------------------------
# # @[ "async; check fails in synchronous part" ] = ( T, done ) ->
# #   ### This will fail, but not stop test case execution: ###
# #   T.eq 999, 444
# #   fetch_data_from_network 'http://example.com', ( error, result ) ->
# #     return done if error?
# #     ### This will succeed: ###
# #     T.eq 'the webpage you requested', result
# #     done()

# # #-----------------------------------------------------------------------------------------------------------
# # @[ "async; checks fail in handler" ] = ( T, done ) ->
# #   fetch_data_from_network 'http://example.com', ( error, result ) ->
# #     return done if error?
# #     ### An unreasonable combination of checks (always check your checks!): ###
# #     T.ok result.length > 1e6    # expecting a lot of data (fails)
# #     T.eq result, 'a short text' # expecting result to be some short text (fails as well)
# #     done()

# # #-----------------------------------------------------------------------------------------------------------
# # @[ "async; fails erroneously in synchronous part" ] = ( T, done ) ->
# #   yyy # variable is undefined
# #   fetch_data_from_network 'http://example.com', ( error, result ) ->
# #     return done error if error?
# #     done()

# #-----------------------------------------------------------------------------------------------------------
# @[ "async; `rsvp_ok` accepts callback without error" ] = ( T, done ) ->
#   fetch_data_from_network 'http://example.com', T.rsvp_ok ( result ) ->
#     T.eq result, 'the webpage you requested'
#     done()

# #-----------------------------------------------------------------------------------------------------------
# @[ "async; `rsvp_ok` complains on callback with error" ] = ( T, done ) ->
#   fetch_data_from_unreachable_network 'http://example.com', T.rsvp_ok ( result ) ->
#     T.eq result, 'the webpage you requested'
#     done()

# #-----------------------------------------------------------------------------------------------------------
# @[ "async; `rsvp_error` accepts callback with error" ] = ( T, done ) ->
#   fetch_data_from_unreachable_network 'http://example.com', T.rsvp_error /unreachable/, ->
#     done()

# # #-----------------------------------------------------------------------------------------------------------
# # @[ "async; `rsvp_error` complains on callback with error" ] = ( T, done ) ->
# #   fetch_data_from_unreachable_network 'http://example.com', T.rsvp_error ( result ) ->
# #     T.eq result, 'the webpage you requested'
# #     done()

# #-----------------------------------------------------------------------------------------------------------
# @[ "async; fails to call `done` at all" ] = ( T, done ) ->
#   fetch_data_from_network 'http://example.com', ( error, result ) ->
#     return done error if error?
#     ### there should be a call to `done` here at some point, but it's missing ###
#     # T.eq 22, 33
#     # done()

# #-----------------------------------------------------------------------------------------------------------
# @[ "async; fails to call `done` within timeout limits" ] = ( T, done ) ->
#   fetch_data_from_network 'http://example.com', ( error, result ) ->
#     return done error if error?
#     setTimeout done, 350

# # #-----------------------------------------------------------------------------------------------------------
# # @[ "async; calls `fail` in handler" ] = ( T, done ) ->
# #   fetch_data_from_network 'http://example.com', ( error, result ) ->
# #     return done error if error?
# #     ### fail because because: ###
# #     T.fail "i'm not pleased"
# #     ### must still call done at some point: ###
# #     done()

############################################################################################################
unless module.parent?
  settings = 'timeout': 250
  test @, settings



