const gulp = require('gulp');

gulp.task('bootstrap', () =>
{
	gulp.src('./node_modules/bootstrap/dist/**')
		.pipe(gulp.dest('./static/vendor/bootstrap'));
});

gulp.task('jquery', () =>
{
	gulp.src('./node_modules/jquery/dist/**')
		.pipe(gulp.dest('./static/vendor/jquery'));
});

gulp.task('default', ['bootstrap', 'jquery']);