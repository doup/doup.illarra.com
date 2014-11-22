'use strict';

// Gulp
var gulp             = require('gulp');
var awspublish       = require('gulp-awspublish');
var awspublishRouter = require("gulp-awspublish-router");
var browserSync      = require('browser-sync');
var creds            = require('./s3.json');

// Metalsmith
var Metalsmith   = require('metalsmith');
var branch       = require('metalsmith-branch');
var collections  = require('metalsmith-collections');
var copy         = require('metalsmith-copy');
var drafts       = require('metalsmith-drafts');
var excerpts     = require('metalsmith-excerpts');
var feed         = require('metalsmith-feed');
var fileMetadata = require('metalsmith-filemetadata');
var fingerprint  = require('metalsmith-fingerprint');
var ignore       = require('metalsmith-ignore');
var markdown     = require('metalsmith-markdown');
var metallic     = require('metalsmith-metallic');
var permalinks   = require('metalsmith-permalinks');
var sass         = require('metalsmith-sass');
var templates    = require('metalsmith-templates');

function debug(files, ms, done) {
    /*
    for (var key in files) {
        console.log(key);
        console.log(files[key]);
        console.log();
    }
    */
    //console.log(files);
    console.log(ms);
    done();
}

gulp.task('build', function (done) {
    Metalsmith(__dirname)
        .metadata({
            site: {
                title:  'doup',
                url:    'http://doup.illarra.com',
                author: 'Asier Illarramendi'
            }
        })
        .use(drafts())
        .use(ignore(['.DS_Store', '*/.DS_Store']))
        .use(sass({
            outputDir:    'assets/',
            includePaths: ['bower_components/foundation/scss']
        }))
        .use(fingerprint({
            pattern: 'assets/main.css'
        }))
        .use(ignore(['assets/main.css']))
        .use(collections({
            posts: {
                pattern: 'post/*',
                sortBy:  'date',
                reverse: true
            }
        }))
        .use(metallic())
        .use(markdown())
        .use(fileMetadata([
            { pattern: 'post/*', preserve: true, metadata: { template: 'post.jade' } },
            { pattern: 'page/*', preserve: true, metadata: { template: 'page.jade' } }
        ]))
        .use(branch('post/*')
            .use(function (files, ms, done) {
                var months = {
                    0:  'Enero',
                    1:  'Febrero',
                    2:  'Marzo',
                    3:  'Abril',
                    4:  'Mayo',
                    5:  'Junio',
                    6:  'Julio',
                    7:  'Agosto',
                    8:  'Septiembre',
                    9:  'Octubre',
                    10: 'Noviembre',
                    11: 'Diciembre'
                };

                for (var file in files) {
                    files[file].prettyDate = months[files[file].date.getMonth()] +' '+ files[file].date.getFullYear();
                }

                done();
            })
            .use(permalinks({
                pattern: ':date/:title',
                date:    'YYYY/MM'
            }))
        )
        .use(branch('page/*')
            .use(permalinks({
                pattern: 'page/:title',
                date:    'YYYY/MM'
            }))
        )
        .use(excerpts())
        .use(templates('jade'))
        .use(feed({ collection: 'posts' }))
        .build(function (err, files) {
            if (err) {
                throw err;
            }

            done();
        });
});

gulp.task('deploy', ['build'], function () {
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

gulp.task('reload', ['build'], function () {
    browserSync.reload();
});

gulp.task('serve', function () {
    browserSync({
        notify: false,
        server: {
            baseDir: './build'
        }
    });
});

gulp.task('watch', function () {
    gulp.watch(['templates/**/*', 'src/**/*'], ['reload']);
});

gulp.task('default', ['build', 'serve', 'watch']);
