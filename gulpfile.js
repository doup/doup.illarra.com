'use strict';

var gulp             = require('gulp');
var awspublish       = require('gulp-awspublish');
var awspublishRouter = require("gulp-awspublish-router");
var creds            = require('./s3.json');

gulp.task('deploy', function() {

    // create a new publisher
    var publisher = awspublish.create({
        key:    creds.access,
        secret: creds.secret,
        bucket: creds.bucket,
        region: creds.region
    });

    return gulp.src('**/*', { cwd: './build/' })
        .pipe(awspublishRouter({
            cache: {
                cacheTime: 300 // cache for 5 minutes by default
            },

            routes: {
                "^assets/(?:.+)\\.(?:js|css|svg|ttf)$": {
                    key: "$&",           // don't modify original key. this is the default
                    gzip: true,          // use gzip for assets that benefit from it
                    cacheTime: 630720000 // cache static assets for 2 years
                },

                "^assets/.+$": {
                    cacheTime: 630720000 // cache static assets for 2 years
                },

                "^.+\\.html": {
                    gzip: true
                },

                // pass-through for anything that wasn't matched by routes above, to be uploaded with default options
                "^.+$": "$&"
            }
        }))
        .pipe(publisher.publish())
        .pipe(publisher.sync())
        .pipe(publisher.cache())
        .pipe(awspublish.reporter());
});
