(function() {
  "use strict";
  (function(vjs) {
    var isHtmlSupported;
    isHtmlSupported = void 0;
    module("videojs.comscore", {
      setup: function() {
        var video;
        video = document.querySelector("#qunit-fixture video");
        isHtmlSupported = videojs.Html5.isSupported;
        if (/phantomjs/g.test(window.navigator.userAgent)) {
          videojs.Html5.isSupported = function() {
            return true;
          };
        }
        this.playlist = _.cloneDeep(window.playlist);
        this.keymappedPlaylist = _.cloneDeep(window.keymappedPlaylist);
        return this.player = vjs(video);
      },
      teardown: function() {
        return videojs.Html5.isSupported = isHtmlSupported;
      }
    });
    test("plugin is registered", function() {
      var diff, methods, plugin;
      methods = ['play', 'pause', 'end', 'buffer', 'getClips', 'getCurrentClip', 'updateLoadedClip', 'classificationTypes'];
      ok(this.player.comscore, "the comscore plugin is present");
      equal(typeof this.player.comscore, 'function', "the comscore plugin reference is a function");
      plugin = this.player.comscore(1234567890, this.playlist);
      diff = _.difference(_.methods(plugin), methods);
      return ok(_.isEmpty(diff), 'all methods are accounted for');
    });
    test("arguments type checking works", function() {
      var plugin;
      throws((function() {
        return this.player.comscore();
      }), "no arguments");
      throws((function() {
        return this.player.comscore("", this.playlist);
      }), "empty string");
      throws((function() {
        return this.player.comscore([], this.playlist);
      }), "id as an empty array");
      throws((function() {
        return this.player.comscore({}, this.playlist);
      }), "id as an empty object");
      throws((function() {
        return this.player.comscore(true, this.playlist);
      }), "id as a boolean");
      plugin = this.player.comscore(1234567890, this.playlist);
      return ok(plugin, "valid args works");
    });
    test("getClips()", function() {
      var clips, plugin;
      plugin = this.player.comscore(1234567890, this.playlist);
      clips = plugin.getClips();
      return equal(clips.length, 2, "getClips() returns 2 clips");
    });
    test("using a keymap works for all properties", function() {
      var clip, clips, keymap, keymappedClip, plugin;
      keymap = {
        ad: 'advertisement',
        premium: 'exclusive',
        ugc: 'free',
        live: 'liveStream',
        duration: 'length',
        index: 'index',
        id: 'customId',
        name: 'displayName',
        publisher: 'brand',
        show: 'programme',
        url: 'fileLocation',
        classification: 'class'
      };
      plugin = this.player.comscore(1234567890, this.keymappedPlaylist, keymap);
      clips = plugin.getClips();
      clip = clips[1];
      keymappedClip = this.keymappedPlaylist[1];
      equal(clips.length, 2, "getClips() returns 2 clips");
      equal(clip.ad(), keymappedClip.advertisement, "keymap conversion for the ad property");
      equal(clip.premium(), keymappedClip.exclusive, "keymap conversion for the premium property");
      equal(clip.ugc(), keymappedClip.free, "keymap conversion for the ugc property");
      equal(clip.live(), keymappedClip.liveStream, "keymap conversion for the live property");
      equal(clip.duration(), keymappedClip.length, "keymap conversion for the duration property");
      equal(clip.index(), 1, "index should stay the same");
      equal(clip.id(), keymappedClip.customId, "keymap conversion for the id property");
      equal(clip.name(), keymappedClip.displayName, "keymap conversion for the name property");
      equal(clip.publisher(), keymappedClip.brand, "keymap conversion for the publisher property");
      equal(clip.show(), keymappedClip.programme, "keymap conversion for the show property");
      equal(clip.url(), keymappedClip.fileLocation, "keymap conversion for the url property");
      return equal(clip.classification(), keymappedClip["class"], "keymap conversion for the classification property");
    });
    return test("classifications", function() {
      var clip, plugin;
      plugin = this.player.comscore(1234567890, this.playlist);
      clip = plugin.getClips(0);
      clip.ad(false);
      clip.duration(900, true);
      clip.premium(true);
      clip.ugc(false);
      clip.live(false);
      equal(clip.classification(), clip.ns_st_ct, 'classification matches ns value');
      equal(clip.classification(), this.player.comscore.classificationTypes.video.longform.premium, 'video:longform:premium');
      clip.ad(false);
      clip.duration(599, true);
      clip.premium(true);
      clip.ugc(false);
      clip.live(false);
      equal(clip.classification(), clip.ns_st_ct, 'classification matches ns value');
      equal(clip.classification(), this.player.comscore.classificationTypes.video.shortform.premium, 'video:shortform:premium');
      clip.ad(false);
      clip.duration(900, true);
      clip.premium(false);
      clip.ugc(true);
      clip.live(false);
      equal(clip.classification(), clip.ns_st_ct, 'classification matches ns value');
      equal(clip.classification(), this.player.comscore.classificationTypes.video.longform.ugc, 'video:longform:ugc');
      clip.ad(false);
      clip.duration(100, true);
      clip.premium(false);
      clip.ugc(true);
      clip.live(false);
      equal(clip.classification(), clip.ns_st_ct, 'classification matches ns value');
      equal(clip.classification(), this.player.comscore.classificationTypes.video.shortform.ugc, 'video:shortform:ugc');
      clip.ad(false);
      clip.premium(true);
      clip.ugc(false);
      clip.live(true);
      equal(clip.classification(), clip.ns_st_ct, 'classification matches ns value');
      equal(clip.classification(), this.player.comscore.classificationTypes.video.live.premium, 'video:live:premium');
      clip.ad(false);
      clip.premium(false);
      clip.ugc(true);
      clip.live(true);
      equal(clip.classification(), clip.ns_st_ct, 'classification matches ns value');
      equal(clip.classification(), this.player.comscore.classificationTypes.video.live.ugc, 'video:live:ugc');
      clip.ad(true);
      clip.live(false);
      equal(clip.classification(), clip.ns_st_ct, 'classification matches ns value');
      equal(clip.classification(), this.player.comscore.classificationTypes.ad.preroll, 'ad.preroll');
      clip.ad(true);
      clip.live(true);
      equal(clip.classification(), clip.ns_st_ct, 'classification matches ns value');
      return equal(clip.classification(), this.player.comscore.classificationTypes.ad.preroll, 'ad.live (returns preroll value for now)');
    });
  })(window.videojs);

}).call(this);
