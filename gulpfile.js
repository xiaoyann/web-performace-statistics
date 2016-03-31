var gulp = require('gulp');
var gulpUtil = require('gulp-util');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var eslint = require('gulp-eslint');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var src = 'src/wps.js';


gulp.task('dev', function() {
	browserSync({
		server: {
			baseDir: './'
		}
	});
	gulp.watch([src, 'example/**'], reload);
});

gulp.task('lint', function() {
	return gulp.src(src)
	.pipe(eslint())
	.pipe(eslint.formatEach())
	.pipe(eslint.failAfterError());
});

gulp.task('build', ['lint'], function() {
	gulp.src(src)
	.pipe(gulp.dest('dist'))
	.pipe(uglify())
	.pipe(rename({extname: '.min.js'}))
	.pipe(gulp.dest('dist'));
});



