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
  classification_types =
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
    ad: (flag) ->
      if flag then @ns_st_ad = flag
      return @ns_st_ad

    duration: (length, in_seconds) ->
      if length then @ns_st_cl = if in_seconds then length * 1000 else length
      return @ns_st_cl

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
  comscore = (id, playlist, keymap_override) ->
    throw new Error 'The first argument should be your comScore ID' unless isNumber(id)
    throw new Error 'The second argument should be an array (can be empty)' unless isArray(playlist)

    events =
      BUFFER: ns_.StreamSense.PlayerEvents.BUFFER
      END: ns_.StreamSense.PlayerEvents.END
      PLAY: ns_.StreamSense.PlayerEvents.PLAY
      PAUSE: ns_.StreamSense.PlayerEvents.PAUSE

    player = @ # save a reference to the player instance
    tracker = new ns_.StreamSense {}, "http://b.scorecardresearch.com/p?c1=2&c2=#{id}"
    current_clip = null
    clips = []
    keymap = extend {}, keymap, keymap_override if keymap_override

    initialize = -> clips = make_clips(playlist)

    make_clips = (playlist) -> playlist.map (metadata, index) -> new Clip(index, metadata)

    set_playlist = (clips) ->
      for clip in clips
        throw new Error 'expected an array of clips' unless typeof clip is 'Clip'

      tracker.setPlaylist clips if clips.length > 0
      return @

    # listeners
    # -------------------------
    player.on 'play', ->
      tracker.notify events.PLAY, {}, player.currentTime() * 1000

    player.on 'loadeddata', ->
      current_clip = clips[0]
      current_clip.url player.currentSrc()
      current_clip.duration player.duration()
      tracker.setClip current_clip

    player.on 'ended', ->
      tracker.notify events.END, {}, current_clip.duration()

    player.on 'paused', ->
      console.log "paused", player.currentTime()
      tracker.notify events.PAUSE, {}, player.currentTime() * 1000


    # replace the initializer with the plugin functionality
    player.comscore =
      getClips: -> clips

    initialize()
  #------------------------------------------------------------ end plugin

  # register the plugin with video.js
  vjs.plugin "comscore", comscore
)(window.videojs)
