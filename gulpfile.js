var _ = require('lodash'),
  gulp = require('gulp'),
  coffee = require('gulp-coffee'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  http = require('http'),
  connect = require('connect'),
  paths = {
    scripts: ['src/**/*.coffee'],
    compiled: ['src/**/*.js'],
    tests: ['tests/**/*.coffee', 'tests/**/*.html'],
    demo: ['demo/*.html']
  };

function create_static_server () {
  var app = connect()
    .use(connect.static(__dirname));

  http.createServer(app).listen(3000);
}

//compiles coffee script files
gulp.task('compile', function () {
  gulp.src(paths.scripts)
    .pipe(coffee())
    .pipe(gulp.dest('src'));
});

// uglify (aka minify)
gulp.task('compress', function() {
  gulp.src(paths.compiled)
    .pipe(uglify({outSourceMap: true}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('copy', function () {
  gulp.src(paths.compiled)
    .pipe(gulp.dest('dist'));
});

// recompile coffeescript files on change
gulp.task('watch', function () {
  gulp.watch(paths.scripts, ['compile']);
});

// launch this repo as a server (port 3000)
gulp.task('serve', create_static_server);

// builds everything to the `dist` directory
gulp.task('build', ['compile', 'copy', 'compress']);

// runs a build and launches a server
gulp.task('demo', ['build', 'serve']);

// runs a build and launches a server
gulp.task('default', ['build', 'watch', 'serve']);
