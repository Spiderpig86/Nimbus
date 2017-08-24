// Automate my builds

var gulp = require('gulp');
var prop = require('./package.json');
var minify = require('gulp-clean-css');
var $ = require('gulp-load-plugins')();

gulp.task('compile', function() {
    return gulp.src([
        './public/css/app.css',
        './public/css/scrollbar.css',
        './public/css/controls/dashboard.css',
        './public/css/controls/radiobutton.css',
        './public/css/controls/search.css',
        './public/css/controls/toast.css',
        './public/css/controls/toggle.css',
        './public/css/controls/volume.css'
    ])
        .pipe($.concat('dist.css'))
        .pipe($.size())
        .pipe(gulp.dest('./public/css/'));
});

gulp.task('minify', ['compile'], function() {
    return gulp.src(['./public/css/dist.css'])
        .pipe(minify())
        .pipe($.size())
        .pipe($.concat('dist.min.css'))
        .pipe(gulp.dest('./public/css/'));
});