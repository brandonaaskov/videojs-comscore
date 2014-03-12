(function() {
  (function(vjs) {

    /*
    This keymap defines how to map the internal keys (left-hand side) to the
    user's key name (right-hand side).
     */
    var Clip, classification_types, comscore, extend, isArray, isNumber, keymap;
    isArray = function(obj) {
      return toString.call(obj) === "[object Array]";
    };
    isNumber = function(value) {
      return parseInt(value, 10) !== NaN;
    };
    extend = function(obj) {
      var arg, i, k;
      arg = void 0;
      i = void 0;
      k = void 0;
      i = 1;
      while (i < arguments_.length) {
        arg = arguments_[i];
        for (k in arg) {
          if (arg.hasOwnProperty(k)) {
            obj[k] = arg[k];
          }
        }
        i++;
      }
      return obj;
    };
    keymap = {
      ad: 'ad',
      duration: 'duration',
      index: 'index',
      id: 'id',
      name: 'name',
      publisher: 'publisher',
      show: 'show',
      url: 'url'
    };
    classification_types = {
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
        "default": 'vc00'
      },
      ad: {
        preroll: 'va11',
        midroll: 'va12',
        postroll: 'va13',
        live: 'va21',
        audio: 'aa00',
        "default": 'va00'
      }
    };
    Clip = (function() {
      function Clip(index, metadata) {
        this.ad(metadata[keymap.ad]);
        this.duration(metadata[keymap.duration]);
        this.index(index);
        this.id(metadata[keymap.id]);
        this.name(metadata[keymap.name]);
        this.publisher(metadata[keymap.publisher]);
        this.show(metadata[keymap.show]);
        this.url(metadata[keymap.url]);
      }

      Clip.prototype.ad = function(flag) {
        if (flag) {
          this.ns_st_ad = flag;
        }
        return this.ns_st_ad;
      };

      Clip.prototype.duration = function(length, in_seconds) {
        if (length) {
          this.ns_st_cl = in_seconds ? length * 1000 : void 0;
        } else {
          length;
        }
        return this.ns_st_cl;
      };

      Clip.prototype.index = function(index) {
        if (index) {
          this.ns_st_cn = index;
        }
        return this.ns_st_cn;
      };

      Clip.prototype.id = function(id) {
        if (id) {
          this.ns_st_ci = id;
        }
        return this.ns_st_ci;
      };

      Clip.prototype.name = function(name) {
        if (name) {
          this.ns_st_ep = name;
        }
        return this.ns_st_ep;
      };

      Clip.prototype.publisher = function(name) {
        if (name) {
          this.ns_st_pu = name;
        }
        return this.ns_st_pu;
      };

      Clip.prototype.show = function(name) {
        if (name) {
          this.ns_st_pr = name;
        }
        return this.ns_st_pr;
      };

      Clip.prototype.url = function(url) {
        if (url) {
          this.ns_st_cu = url;
        }
        return this.ns_st_cu;
      };


      /*
      todo support these as well
      var ns_st_pn = 'part number'; // identifies a segment of the content (increment after mid-roll ad)
      var ns_st_tp = 'total parts'; // total segments (or 0 if no segments)
      var ns_st_ct = 'classification type'; // 4-character ID which distinguishes advertisement stream types from content stream types
       */

      return Clip;

    })();
    comscore = function(id, playlist, keymap_override) {
      var clips, current_clip, events, initialize, make_clips, player, set_playlist, tracker;
      if (!isNumber(id)) {
        throw new Error('The first argument should be your comScore ID');
      }
      if (!isArray(playlist)) {
        throw new Error('The second argument should be an array (can be empty)');
      }
      events = {
        BUFFER: ns_.StreamSense.PlayerEvents.BUFFER,
        END: ns_.StreamSense.PlayerEvents.END,
        PLAY: ns_.StreamSense.PlayerEvents.PLAY,
        PAUSE: ns_.StreamSense.PlayerEvents.PAUSE
      };
      player = this;
      tracker = new ns_.StreamSense({}, "http://b.scorecardresearch.com/p?c1=2&c2=" + id);
      current_clip = null;
      clips = [];
      if (keymap_override) {
        keymap = extend({}, keymap, keymap_override);
      }
      initialize = function() {
        return clips = make_clips(playlist);
      };
      make_clips = function(playlist) {
        return playlist.map(function(metadata, index) {
          return new Clip(index, metadata);
        });
      };
      set_playlist = function(clips) {
        var clip, _i, _len;
        for (_i = 0, _len = clips.length; _i < _len; _i++) {
          clip = clips[_i];
          if (typeof clip !== 'Clip') {
            throw new Error('expected an array of clips');
          }
        }
        if (clips.length > 0) {
          tracker.setPlaylist(clips);
        }
        return this;
      };
      player.on('play', function() {
        return tracker.notify(events.PLAY, {}, player.currentTime() * 1000);
      });
      player.on('loadeddata', function() {
        current_clip = clips[0];
        current_clip.url(player.currentSrc());
        current_clip.duration(player.duration());
        return tracker.setClip(current_clip);
      });
      player.on('ended', function() {
        return tracker.notify(events.END, {}, current_clip.duration());
      });
      player.on('paused', function() {
        console.log("paused", player.currentTime());
        return tracker.notify(events.PAUSE, {}, player.currentTime() * 1000);
      });
      player.comscore = {
        getClips: function() {
          return clips;
        }
      };
      return initialize();
    };
    return vjs.plugin("comscore", comscore);
  })(window.videojs);

}).call(this);
