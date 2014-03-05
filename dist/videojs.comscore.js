/*! videojs-comscore - v0.1.0 - 2014-03-05
* Copyright (c) 2014 Brandon Aaskov; Licensed  */
(function (vjs) {

  //------------------------------------------------------------ private
  /**
   * This keymap defines how to map the internal keys (left-hand side) to the
   * user's key name (right-hand side).
   */
  var keymap = {
    ad: 'ad',
    duration: 'duration',
    index: 'index',
    id: 'id',
    name: 'name',
    publisher: 'publisher',
    show: 'show',
    url: 'url'
  };

  var comscoreClassificationTypes = {
    video: {
      shortform: {
        premium: 'vc11',
        ugc: 'vc21'
      },

      longform: {
        premium: 'vc12',
        ugc: 'vc22'
      },

      live: {
        premium: 'vc13',
        ugc: 'vc23'
      },

      audio: 'ac00',
      default: 'vc00'
    },

    ad: {
      preroll: 'va11',
      midroll: 'va12',
      postroll: 'va13',
      live: 'va21',
      audio: 'aa00',
      default: 'va00'
    }
  };

  function extend (obj /*, arg1, arg2, ... */) {
    var arg, i, k;
    for (i = 1; i < arguments.length; i++) {
      arg = arguments[i];
      for (k in arg) {
        if (arg.hasOwnProperty(k)) {
          obj[k] = arg[k];
        }
      }
    }
    return obj;
  }
  //------------------------------------------------------------





  //------------------------------------------------------------ Clip
  var Clip = (function() {
    Clip.name = 'Clip';

    /** todo support these as well
     * var ns_st_pn = 'part number'; // identifies a segment of the content (increment after mid-roll ad)
     * var ns_st_tp = 'total parts'; // total segments (or 0 if no segments)
     * var ns_st_ct = 'classification type'; // 4-character ID which distinguishes advertisement stream types from content stream types
     */

    function Clip(index, metadata) {
      this.ad(metadata[keymap.ad]);
      this.duration(metadata[keymap.duration]);
      this.index(index);
      this.id(metadata[keymap.id]);
      this.name(metadata[keymap.name]);
      this.publisher(metadata[keymap.publisher]);
      this.show(metadata[keymap.show]);
      this.url(metadata[keymap.url]);
    };

    Clip.prototype.ad = function (flag) {
      if (flag) this.ns_st_ad = flag;
      return this.ns_st_ad
    };

    Clip.prototype.duration = function (length, inSeconds) {
      if (length) this.ns_st_cl = (inSeconds) ? length * 1000 : length;
      return this.ns_st_cl;
    };

    Clip.prototype.index = function (index) {
      if (index) this.ns_st_cn = index;
      return this.ns_st_cn
    };

    Clip.prototype.id = function (id) {
      if (id) this.ns_st_ci = id;
      return this.ns_st_ci;
    };

    Clip.prototype.name = function (name) {
      if (name) this.ns_st_ep = name;
      return this.ns_st_ep;
    };

    Clip.prototype.publisher = function (name) {
      if (name) this.ns_st_pu = name;
      return this.ns_st_pu;
    };

    Clip.prototype.show = function (name) {
      if (name) this.ns_st_pr = name;
      return this.ns_st_pr;
    };

    Clip.prototype.url = function (url) {
      if (url) this.ns_st_cu = url;
      return this.ns_st_cu;
    };

    return Clip;
  })();
  //------------------------------------------------------------




  //------------------------------------------------------------ plugin
  var comscore = function (id, playlist, keymapOverride) {
    var events = {
      BUFFER: ns_.StreamSense.PlayerEvents.BUFFER,
      END: ns_.StreamSense.PlayerEvents.END,
      PLAY: ns_.StreamSense.PlayerEvents.PLAY,
      PAUSE: ns_.StreamSense.PlayerEvents.PAUSE
    };

    var player = this; // save a reference to the player instance
    var tracker = new ns_.StreamSense({}, 'http://b.scorecardresearch.com/p?c1=2&c2=' + id);
    var currentClip = null;

    // must happen before the clips get created
    if (keymapOverride) {
      keymap = extend({}, keymap, keymapOverride);
    }

    var clips = playlist.map(function (metadata, index) {
      return new Clip(index, metadata);
    });

    if (clips.length > 0) {
      tracker.setPlaylist(clips);
//      console.log('clips', clips);
    }

    /** http://cl.ly/UEPc
     * todo
     * create a new object with the right base url and config id
     * notify during state changes:
     *  starts buffering
     *  playback is paused or user starts seeking during playback
     *  playback ends
     */

    player.on('firstplay', function () {
//      console.log('first');
    });

    player.on('play', function () {
      tracker.notify(events.PLAY, {}, player.currentTime() * 1000);
    });

    player.on('loadeddata', function () {
      currentClip = clips[0];
      currentClip.url(player.currentSrc());
      tracker.setClip(currentClip);
    });

    player.on('ended', function () {
      tracker.notify(events.END, {}, player.currentTime() * 1000);
    });

    player.on('paused', function () {
      tracker.notify(events.PAUSE, {}, player.currentTime() * 1000);
    });

    // replace the initializer with the plugin functionality
    player.comscore = {};
  };
  //------------------------------------------------------------


  // register the plugin with video.js
  vjs.plugin('comscore', comscore);

}(window.videojs));
