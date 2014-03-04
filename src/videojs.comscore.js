/*
 * comscore
 * https://github.com/brandonaaskov/videojs-comscore
 *
 * Copyright (c) 2014 Brandon Aaskov
 * Licensed under the MIT license.
 */

(function(vjs) {

  var
    /**
     * Copies properties from one or more objects onto an original.
     */
    extend = function(obj /*, arg1, arg2, ... */) {
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
    },

    // define some reasonable defaults for this sweet plugin
    defaults = {
      awesome: true
    },

    // plugin initializer
    comscore = function(options) {
      var player = this; // save a reference to the player instance
      var settings = extend({}, defaults, options || {}); // merge options and defaults

      // replace the initializer with the plugin functionality
      player.comscore = {
        go: function() {
          if (settings.awesome) {
            return 'awesome.';
          }
          return ':(';
        },
        extreme: function() {
          return 'awesome!';
        }
      };
    };
  
  // register the plugin with video.js
  vjs.plugin('comscore', comscore);

}(window.videojs));
