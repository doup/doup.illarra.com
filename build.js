'use strict';

var Metalsmith  = require('metalsmith');
var branch      = require('metalsmith-branch');
var collections = require('metalsmith-collections');
var copy        = require('metalsmith-copy');
var drafts      = require('metalsmith-drafts');
var excerpts    = require('metalsmith-excerpts');
var feed        = require('metalsmith-feed');
var fingerprint = require('metalsmith-fingerprint');
var ignore      = require('metalsmith-ignore');
var markdown    = require('metalsmith-markdown');
var metallic    = require('metalsmith-metallic');
var permalinks  = require('metalsmith-permalinks');
var sass        = require('metalsmith-sass');
var serve       = require('metalsmith-serve');
var templates   = require('metalsmith-templates');
var watch       = require('metalsmith-watch');

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
    .use(branch('post/*')
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
    .use(serve({ port: 1337 }))
    .use(watch())
    .build(function (err, files) {
        if (err) {
            throw err;
        }
    });
