/** */

'use strict';

var livereload = require('connect-livereload')();

module.exports = function (grunt) {

// Project configuration.
  grunt.initConfig({
// Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
// Task configuration.
    clean: {
      files: ['dist']
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['src/videojs.comscore.js'],
        dest: 'dist/videojs.comscore.js'
      },
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/videojs.comscore.min.js'
      },
    },

    qunit: {
      files: ['test/**/*.html']
    },

    watch: {
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: ['default'],
        options: {
          livereload: true
        }
      },
      src: {
        files: 'src/**/*.js',
        tasks: ['build', 'test'],
        options: {
          livereload: true
        }
      },
      test: {
        files: 'test/**/*.js',
        tasks: ['test'],
        options: {
          livereload: true
        }
      }
    },

    connect: {
      server: {
        options: {
          hostname: '127.0.0.1',
          port: 1337,
          keepalive: true,
          protocol: 'http',
          debug: true
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // Default task.
  grunt.registerTask('default', ['qunit', 'clean', 'concat', 'uglify', 'connect:server']);
  grunt.registerTask('build', ['clean', 'concat', 'uglify']);
  grunt.registerTask('test', ['qunit']);
  grunt.registerTask('watch', ['clean', 'concat', 'uglify']);
};
