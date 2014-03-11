"use strict";

(function(vjs) {
  /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      throws(block, [expected], [message])
  */

  var isHtmlSupported;

  module('videojs.comscore', {
    // This will run before each test in this module.
    setup: function() {
      // grab a reference to the video
      var video = document.querySelector('#qunit-fixture video');
      isHtmlSupported = videojs.Html5.isSupported;

      if (/phantomjs/gi.test(window.navigator.userAgent)) {
        // PhantomJS doesn't have a video element implementation
        // force support here so that the HTML5 tech is still used during
        // command-line test runs
        videojs.Html5.isSupported = function() {
          return true;
        };

        // provide implementations for any video element functions that are
        // used in the tests
        video.load = function() {};
      }

      this.player = vjs(video);
    },

    teardown: function() {
      // restore the original html5 support test
      videojs.Html5.isSupported = isHtmlSupported;
    }
  });

  test('plugin is registered', function() {
    ok(this.player.comscore, 'the comscore plugin is present');
  });

  test('arguments type checking works', function() {
    var playlist = [];

    throws(function () {
      this.player.comscore();
    }, 'no arguments');

    throws(function () {
      this.player.comscore('', playlist);
    }, 'empty string');

    throws(function () {
      this.player.comscore([], playlist);
    }, 'id as an empty array');

    throws(function () {
      this.player.comscore({}, playlist);
    }, 'id as an empty object');

    throws(function () {
      this.player.comscore(true, playlist);
    }, 'id as a boolean');

    ok(function () {
      this.player.comscore(123456789, playlist);
    }, 'a number and empty array');
  });

  test('getters/setters work properly', function () {
    this.player.comscore(12354321, playlist);
    console.log('clips', this.player.comscore.getClips());
    var clips = this.player.comscore.getClips();
    console.log(clips);
  });

  /**
   * todo
   * keymap support
   * variable mapping support
   * getter/setters working
   *
   */

}(window.videojs));