var _ = require('lodash'),
  gulp = require('gulp'),
  coffee = require('gulp-coffee'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  http = require('http'),
  connect = require('connect'),
  qunit = require('gulp-qunit'),
  paths = {
    scripts: ['src/**/*.coffee'],
    compiled: ['src/**/*.js'],
    tests: ['tests/**/*.coffee'],
    qunitHtml: ['tests/index.html'],
    demo: ['demo/*.html']
  };

function create_static_server () {
  var app = connect()
    .use(connect.static(__dirname));

  http.createServer(app).listen(3000);
  console.log('server running on localhost:3000');
}

//compiles coffee script files
gulp.task('compile', function () {
  gulp.src(paths.scripts)
    .pipe(coffee())
    .pipe(gulp.dest('src'));

  gulp.on('error', function () {
    console.log('error');
  });

  gulp.src(paths.tests)
    .pipe(coffee())
    .pipe(gulp.dest('tests'));
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

  gulp.src('src/index.html')
    .pipe(gulp.dest('dist'));
});

gulp.task('qunit', function () {
  return gulp.src(paths.qunitHtml).pipe(qunit());
});

// recompile coffeescript files on change
gulp.task('watch', function () {
  gulp.watch(paths.scripts, ['test']);
  gulp.watch(paths.tests, ['test']);
});

// launch this repo as a server (port 3000)
gulp.task('serve', create_static_server);

// builds everything to the `dist` directory
gulp.task('build', ['compile', 'copy', 'compress']);

// does a build and runs the qunit tests
gulp.task('test', ['build', 'qunit']);

// runs a build and launches a server
gulp.task('default', ['build', 'test', 'watch', 'serve']);