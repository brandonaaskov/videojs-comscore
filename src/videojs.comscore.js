/*
 * comscore
 * https://github.com/brandonaaskov/videojs-comscore
 *
 * Copyright (c) 2014 Brandon Aaskov
 * Licensed under the MIT license.
 */

(function (vjs) {

  var extend = function (obj /*, arg1, arg2, ... */) {
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
  };

// define some reasonable defaults for this sweet plugin
  var defaults = {
    awesome: true
  };

  var comscoreBaseUrl = 'http://b.scorecardresearch.com/p';

  var comscoreAttributes = {
    ns_st_cn: 'clip number', // determines the order of clips in a playlist
    ns_st_ci: 'content id', // your internal unique identification of each content asset
    ns_st_pn: 'part number', // identifies a segment of the content (increment after mid-roll ad)
    ns_st_tp: 'total parts', // total segments (or 0 if no segments)
    ns_st_cl: 'clip length',
    ns_st_pu: 'publisher brand name', // consumer-facing brand name of the publisher that owns the content
    ns_st_pr: 'program name', // name of the overall program, show, or content series
    ns_st_ep: 'episode title',
    ns_st_cu: 'clip url', // URL of the content asset (or "none")
    ns_st_ad: 'advertisement flag', // identifies the clip as an ad
    ns_st_ct: 'classification type' // 4-character ID which distinguishes advertisement stream types from content stream types
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

      default: 'vc00'
    },

    ad: {
      preroll: 'va11',
      midroll: 'va12',
      postroll: 'va13',
      live: 'va21',
      default: 'va00'
    }
  };

  var isLongForm = function (videoLength) {
    return videoLength/1000/60 > 10;
  };

// plugin initializer
  var comscore = function (options) {
    var player = this; // save a reference to the player instance
    var settings = extend({}, defaults, options || {}); // merge options and defaults

    /**
     * todo
     * create a new object with the right base url and config id
     * set the current playlist with setPlaylist()
     * set the clip that's currently loaded
     * notify during state changes:
     *  starts buffering
     *  playback is paused or user starts seeking during playback
     *  playback starts or resumes or seeking is completed
     *  playback ends
     */

    /**
     * HTML EVENTS LIST (http://cl.ly/UEPc)
     * loadstart
     * emptied
     * canplaythrough
     * ended
     * ratechange
     * progress
     * playing
     * stalled
     * durationchange
     * resize
     * suspend
     * loadedmetadata
     * waiting
     * timeupadte
     * volumechange
     * abort
     * loadeddata
     * seeking
     * play
     * error
     * canplay
     * seeked
     * pause
     *
     * VIDEOJS EVENTS (listed in docs)
     * durationchange
     * ended
     * error
     * firstplay
     * fullscreenchange
     * loadedalldata
     * loadeddata
     * loadedmetadata
     * loadstart
     * pause
     * play
     * progress
     * timeupdate
     * volumechange
     * resize
     *
     * VIDEO JS METHODS (listed in docs)
     * buffered
     * bufferedPercent
     * cancelFullScreen
     * controls
     * currentTime
     * dispose
     * duration
     * init
     * isFullScreen
     * muted
     * pause
     * paused
     * play
     * poster
     * requestFullScreen
     * src
     * volume
     */

    player.on('play', function (event) {
      console.log('play', event);
    });

    player.on('loadeddata', function (event) {
      console.log('loadedtata', event)
    });

    player.on('loadedmetadata', function (event) {
      console.log('loadedmetadata', event)
    });

    // replace the initializer with the plugin functionality
    player.comscore = {
      setCurrentVideo: function (video) {
        console.log('setcurrentvideo', video);
      }
    };
  };

  // register the plugin with video.js
  vjs.plugin('comscore', comscore);

}(window.videojs));
