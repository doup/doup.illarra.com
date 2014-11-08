'use strict';

var level    = require('level');
var s3sync   = require('s3-sync');
var readdirp = require('readdirp');
var creds    = require('./s3.json');

var db = level(__dirname + '/.cache');

var files = readdirp({
    root: __dirname + '/build'
});

var uploader = s3sync(db, {
    key:         creds.access,
    secret:      creds.secret,
    bucket:      creds.bucket,
    region:      creds.region,
    concurrency: 16
}).on('data', function (file) {
    console.log(file.fullPath.replace(__dirname, '') +' -> '+ file.url);
}).on('fail', function (file) {
    console.log('Failed to upload: '+ file.fullPath);
}).on('error', function (err) {
    console.error(err.toString());
});

files.pipe(uploader);
