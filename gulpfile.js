'use strict';

const gulp = require('gulp');
const globby = require('globby');
const del = require('del');

gulp.task('prepublish', () => {
    const readme = gulp.src('./README.md');
    return Promise.all(
        globby.sync('./packages/okwolo*')
            .map((path) => readme.pipe(gulp.dest(path)))
    );
});

gulp.task('clean', () => {
    return del([
        './packages/okwolo*/README.md',
        './packages/okwolo/okwolo.js',
        './packages/okwolo/okwolo.min.js',
        './coverage',
        './npm-debug.log',
    ]);
});
