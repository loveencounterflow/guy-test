

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
  # setTimeout ( => handler null, 'the webpage you requested' ), 1000


#===========================================================================================================
# SYNCHRONOUS TESTS
#-----------------------------------------------------------------------------------------------------------
@[ "sync; checks fail" ] = ( T ) ->
  T.eq 42, 43
  T.ok 'another test' == 'another spring'

#-----------------------------------------------------------------------------------------------------------
@[ "sync; fails because `xxx` is not recognized" ] = ( T ) ->
  R = 40 + 2
  xxx # variable is undefined

#-----------------------------------------------------------------------------------------------------------
@[ "sync; fails because argument to `T.ok` isn't `true`" ] = ( T ) ->
  T.ok 123 == 456

#-----------------------------------------------------------------------------------------------------------
@[ "sync; calling `T.fail`, but proceeding with a successful test" ] = ( T ) ->
  T.fail "this was not in my plan"
  T.eq 108, 108



# #===========================================================================================================
# # ASYNCHRONOUS TESTS
# #-----------------------------------------------------------------------------------------------------------
# @[ "async; fails erroneously in async call" ] = ( T, done ) ->
#   ### Try to read contents of a non-existing file: ###
#   read_file '/theres/almost/certainly/nosuchfile.txt', ( error, result ) ->
#     return done error if error?
#     ### You should never get an error from this line: ###
#     this line is never reached

# #-----------------------------------------------------------------------------------------------------------
# @[ "async; fails erroneously in handler" ] = ( T, done ) ->
#   fetch_data_from_network 'http://example.com', ( error, result ) ->
#     qqq # variable is undefined
#     done()

# #-----------------------------------------------------------------------------------------------------------
# @[ "async; check fails in synchronous part" ] = ( T, done ) ->
#   ### This will fail, but not stop test case execution: ###
#   T.eq 999, 444
#   fetch_data_from_network 'http://example.com', ( error, result ) ->
#     return done if error?
#     ### This will succeed: ###
#     T.eq 'the webpage you requested', result
#     done()

# #-----------------------------------------------------------------------------------------------------------
# @[ "async; checks fail in handler" ] = ( T, done ) ->
#   fetch_data_from_network 'http://example.com', ( error, result ) ->
#     return done if error?
#     ### An unreasonable combination of checks (always check your checks!): ###
#     T.ok result.length > 1e6    # expecting a lot of data (fails)
#     T.eq result, 'a short text' # expecting result to be some short text (fails as well)
#     done()

# #-----------------------------------------------------------------------------------------------------------
# @[ "async; fails erroneously in synchronous part" ] = ( T, done ) ->
#   yyy # variable is undefined
#   fetch_data_from_network 'http://example.com', ( error, result ) ->
#     return done error if error?
#     done()

#-----------------------------------------------------------------------------------------------------------
@[ "async; fails to call `done` at all" ] = ( T, done ) ->
  fetch_data_from_network 'http://example.com', ( error, result ) ->
    return done error if error?
    ### there should be a call to `done` here at some point, but it's missing ###
    # T.eq 22, 33
    # done()

#-----------------------------------------------------------------------------------------------------------
@[ "async; fails to call `done` within timeout limits" ] = ( T, done ) ->
  fetch_data_from_network 'http://example.com', ( error, result ) ->
    return done error if error?
    setTimeout done, 350

# #-----------------------------------------------------------------------------------------------------------
# @[ "async; calls `fail` in handler" ] = ( T, done ) ->
#   fetch_data_from_network 'http://example.com', ( error, result ) ->
#     return done error if error?
#     ### fail because because: ###
#     T.fail "i'm not pleased"
#     ### must still call done at some point: ###
#     done()

# # # # #-----------------------------------------------------------------------------------------------------------
# # # # @[ 'testing an asynchronous method with automatic error check' ] = ( T, done ) ->
# # # #   read_file '/tmp/xy.txt', T.rsvp ( result ) ->
# # # #     T.ok result.length > 0
# # # #     done()

############################################################################################################
unless module.parent?
  settings = 'timeout': 250
  test @, settings



