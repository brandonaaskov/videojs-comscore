((vjs) ->

  #------------------------------------------------------------ private
  ###
  This keymap defines how to map the internal keys (left-hand side) to the
  user's key name (right-hand side).
  ###

  isArray = (obj) -> toString.call(obj) is "[object Array]"
  isNumber = (value) -> parseInt(value, 10) isnt NaN

  # supplied during the `$ grunt-init videojs` process
  extend = (obj) -> #, arg1, arg2, ...
    arg = undefined
    i = undefined
    k = undefined
    i = 1
    while i < arguments_.length
      arg = arguments_[i]
      for k of arg
        obj[k] = arg[k]  if arg.hasOwnProperty(k)
      i++
    obj

  keymap =
    ad: 'ad'
    duration: 'duration'
    index: 'index'
    id: 'id'
    name: 'name'
    publisher: 'publisher'
    show: 'show'
    url: 'url'

  # page 13 (http://cl.ly/UGkP)
  classificationTypes =
    video:
      shortform:
        premium: 'vc11'
        ugc: 'vc21'

      longform:
        premium: 'vc12'
        ugc: 'vc22'

      live:
        premium: 'vc13'
        ugc: 'vc23'

      audio: 'ac00'
      default: 'vc00'

    ad:
      preroll: 'va11'
      midroll: 'va12'
      postroll: 'va13'
      live: 'va21'
      audio: 'aa00'
      default: 'va00'


  #------------------------------------------------------------

  #------------------------------------------------------------ Clip
  class Clip
    ns_st_ad: null
    ns_st_cl: null
    ns_st_cn: null
    ns_st_ci: null
    ns_st_ep: null
    ns_st_pu: null
    ns_st_pr: null
    ns_st_cu: null

    getLengthInMs = (length, inSeconds) -> if inSeconds then length * 1000 else length

    constructor: (index, metadata) ->
      @ad metadata[keymap.ad]
      @duration metadata[keymap.duration]
      @index index
      @id metadata[keymap.id]
      @name metadata[keymap.name]
      @publisher metadata[keymap.publisher]
      @show metadata[keymap.show]
      @url metadata[keymap.url]

    # getters/setters (could be more DRY, but I'm leaving it this way for clarity)
    # -------------------------
    ad: (flag) -> @ns_st_ad = flag if flag

    duration: (length, in_seconds) ->
      @ns_st_cl = length

    index: (index) ->
      if index then @ns_st_cn = index
      return @ns_st_cn

    id: (id) ->
      if id then @ns_st_ci = id
      return @ns_st_ci

    name: (name) ->
      if name then @ns_st_ep = name
      return @ns_st_ep

    publisher: (name) ->
      if name then @ns_st_pu = name
      return @ns_st_pu

    show: (name) ->
      if name then @ns_st_pr = name
      return @ns_st_pr

    url: (url) ->
      if url then @ns_st_cu = url
      return @ns_st_cu

    ###
    todo support these as well
    var ns_st_pn = 'part number'; // identifies a segment of the content (increment after mid-roll ad)
    var ns_st_tp = 'total parts'; // total segments (or 0 if no segments)
    var ns_st_ct = 'classification type'; // 4-character ID which distinguishes advertisement stream types from content stream types
    ###

  #------------------------------------------------------------

  #------------------------------------------------------------ plugin
  comscore = (id, playlist, keymapOverride) ->
    throw new Error 'The first argument should be your comScore ID' unless isNumber(id)
    throw new Error 'The second argument should be an array (can be empty)' unless isArray(playlist)

    events =
      BUFFER: ns_.StreamSense.PlayerEvents.BUFFER
      END: ns_.StreamSense.PlayerEvents.END
      PLAY: ns_.StreamSense.PlayerEvents.PLAY
      PAUSE: ns_.StreamSense.PlayerEvents.PAUSE

    player = @ # save a reference to the player instance
    tracker = new ns_.StreamSense {}, "http://b.scorecardresearch.com/p?c1=2&c2=#{id}"
    currentClip = null
    clips = []
    keymap = extend {}, keymap, keymapOverride if keymapOverride

    initialize = ->
      clips = makeClips(playlist)
      tracker.setPlaylist clips if clips.length > 0

    makeClips = (playlist) -> playlist.map (metadata, index) -> new Clip(index, metadata)

    getClipByUrl = (url) ->
      for clip in clips
        return clip if url is clip.url()

    getCurrentClip = -> getClipByUrl(player.currentSrc())

    # listeners
    # -------------------------
    player.on 'firstplay', ->
      console.log 'first'
      
    player.on 'play', ->
      tracker.notify events.PLAY, {}, player.currentTime() * 1000

    player.on 'durationchange', ->
      currentClip = getCurrentClip()
      currentClip.url player.currentSrc()
      currentClip.duration player.duration()
      tracker.setClip currentClip

    player.on 'progress', ->
      console.log 'progress'

    player.on 'ended', ->
      tracker.notify events.END, {}, currentClip.duration()

    player.on 'pause', ->
      tracker.notify events.PAUSE, {}, player.currentTime() * 1000

    # replace the initializer with the plugin functionality
    player.comscore =
      getClips: -> clips
      getCurrentClip: -> getCurrentClip

    initialize()
  #------------------------------------------------------------ end plugin

  # register the plugin with video.js
  vjs.plugin "comscore", comscore
)(window.videojs)
