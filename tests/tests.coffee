"use strict"
((vjs) ->
  #    ======== A Handy Little QUnit Reference ========
  #    http://api.qunitjs.com/
  #
  #    Test methods:
  #      module(name, {[setup][ ,teardown]})
  #      test(name, callback)
  #      expect(numberOfAssertions)
  #      stop(increment)
  #      start(decrement)
  #    Test assertions:
  #      ok(value, [message])
  #      equal(actual, expected, [message])
  #      notEqual(actual, expected, [message])
  #      deepEqual(actual, expected, [message])
  #      notDeepEqual(actual, expected, [message])
  #      strictEqual(actual, expected, [message])
  #      notStrictEqual(actual, expected, [message])
  #      throws(block, [expected], [message])
  #
  isHtmlSupported = undefined
  module "videojs.comscore",
    setup: ->
      video = document.querySelector("#qunit-fixture video") # grab a reference to the video
      isHtmlSupported = videojs.Html5.isSupported
      if /phantomjs/g.test(window.navigator.userAgent)
        # PhantomJS doesn't have a video element implementation
        # force support here so that the HTML5 tech is still used during
        # command-line test runs
        videojs.Html5.isSupported = -> true

        # provide implementations for any video element functions that are
        # used in the tests
#        video.load = -> ()
      @playlist = _.cloneDeep(window.playlist)
      @keymappedPlaylist = _.cloneDeep(window.keymappedPlaylist)
      @player = vjs(video)

    teardown: -> videojs.Html5.isSupported = isHtmlSupported # restore the original html5 support test

  test "plugin is registered", ->
    methods = [
      'end',
      'getClips',
      'getCurrentClip',
      'pause',
      'play',
      'progress',
      'updateLoadedClip'
    ]
    ok @player.comscore, "the comscore plugin is present"
    equal typeof @player.comscore, 'function', "the comscore plugin reference is a function"

    plugin = @player.comscore(1234567890, @playlist)
    diff = _.difference methods, _.methods(plugin)
    ok _.isEmpty(diff), 'all methods are accounted for'

  test "arguments type checking works", ->
    throws (-> @player.comscore()), "no arguments"
    throws (-> @player.comscore("", @playlist)), "empty string"
    throws (-> @player.comscore([], @playlist)), "id as an empty array"
    throws (-> @player.comscore({}, @playlist)), "id as an empty object"
    throws (-> @player.comscore(true, @playlist)), "id as a boolean"

    plugin = @player.comscore(1234567890, @playlist)
    ok plugin, "valid args works"

  test "getClips()", ->
    plugin = @player.comscore(1234567890, @playlist)
    clips = plugin.getClips()
    equal clips.length, 2, "getClips() returns 2 clips"

  test "using a keymap works for all properties", ->
    keymap =
      ad: 'advertisement'
      premium: 'exclusive'
      ugc: 'free'
      live: 'liveStream'
      duration: 'length'
      index: 'index'
      id: 'customId'
      name: 'displayName'
      publisher: 'brand'
      show: 'programme'
      url: 'fileLocation'
      classification: 'class'

    plugin = @player.comscore(1234567890, @keymappedPlaylist, keymap)
    clips = plugin.getClips()
    clip = clips[1]
    keymappedClip = @keymappedPlaylist[1]

    equal clips.length, 2, "getClips() returns 2 clips"
    equal clip.ad(), keymappedClip.advertisement, "keymap conversion for the ad property"
    equal clip.premium(), keymappedClip.exclusive, "keymap conversion for the premium property"
    equal clip.ugc(), keymappedClip.free, "keymap conversion for the ugc property"
    equal clip.live(), keymappedClip.liveStream, "keymap conversion for the live property"
    equal clip.duration(), keymappedClip.length, "keymap conversion for the duration property"
    equal clip.index(), 1, "index should stay the same"
    equal clip.id(), keymappedClip.customId, "keymap conversion for the id property"
    equal clip.name(), keymappedClip.displayName, "keymap conversion for the name property"
    equal clip.publisher(), keymappedClip.brand, "keymap conversion for the publisher property"
    equal clip.show(), keymappedClip.programme, "keymap conversion for the show property"
    equal clip.url(), keymappedClip.fileLocation, "keymap conversion for the url property"
    equal clip.classification(), keymappedClip.class, "keymap conversion for the classification property"

  test "classifications", ->
    plugin = @player.comscore(1234567890, @playlist)
    clip = plugin.getClips(0)

    #video:longform:premium
    clip.ad false
    clip.duration 900, true
    clip.premium true
    clip.ugc false
    clip.live false
    equal clip.classification(), clip.ns_st_ct, 'classification matches ns value'
    equal clip.classification(), @player.comscore.classificationTypes.video.longform.premium, 'video:longform:premium'

    #video:shortform:premium
    clip.ad false
    clip.duration 599, true
    clip.premium true
    clip.ugc false
    clip.live false
    equal clip.classification(), clip.ns_st_ct, 'classification matches ns value'
    equal clip.classification(), @player.comscore.classificationTypes.video.shortform.premium, 'video:shortform:premium'

    #video:longform:ugc
    clip.ad false
    clip.duration 900, true
    clip.premium false
    clip.ugc true
    clip.live false
    equal clip.classification(), clip.ns_st_ct, 'classification matches ns value'
    equal clip.classification(), @player.comscore.classificationTypes.video.longform.ugc, 'video:longform:ugc'

    #video:shortform:ugc
    clip.ad false
    clip.duration 100, true
    clip.premium false
    clip.ugc true
    clip.live false
    equal clip.classification(), clip.ns_st_ct, 'classification matches ns value'
    equal clip.classification(), @player.comscore.classificationTypes.video.shortform.ugc, 'video:shortform:ugc'

    #video:live:premium
    clip.ad false
    clip.premium true
    clip.ugc false
    clip.live true
    equal clip.classification(), clip.ns_st_ct, 'classification matches ns value'
    equal clip.classification(), @player.comscore.classificationTypes.video.live.premium, 'video:live:premium'

    #video:live:ugc
    clip.ad false
    clip.premium false
    clip.ugc true
    clip.live true
    equal clip.classification(), clip.ns_st_ct, 'classification matches ns value'
    equal clip.classification(), @player.comscore.classificationTypes.video.live.ugc, 'video:live:ugc'

    #ad:preroll
    clip.ad true
    clip.live false
    equal clip.classification(), clip.ns_st_ct, 'classification matches ns value'
    equal clip.classification(), @player.comscore.classificationTypes.ad.preroll, 'ad.preroll'

    #ad:live
    clip.ad true
    clip.live true
    equal clip.classification(), clip.ns_st_ct, 'classification matches ns value'
    equal clip.classification(), @player.comscore.classificationTypes.ad.preroll, 'ad.live (returns preroll value for now)'

) window.videojs
