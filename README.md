#Init

Make sure you have [Bower](http://bower.io) and [Gulp](http://gulpjs.com) installed:

    $ npm install -g bower
    $ npm install -g gulp

Install dependencies:

    $ npm install
    $ bower install

Fill Amazon S3 configuration:

    $ cp s3.json.txt s3.json && subl s3.json

#Develop

Build static files and run dev server:

    $ gulp

Deploy to S3:

    $ gulp deploy

#Configure S3

Add `Bucket Policy` to enable public file access:

    {
      "Version":"2012-10-17",
      "Statement":[{
          "Sid":"PublicReadGetObject",
          "Effect":"Allow",
          "Principal": "*",
          "Action":["s3:GetObject"],
          "Resource":["arn:aws:s3:::doup.illarra.com/*"]
        }
      ]
    }

Add `User Policy`:

    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Sid": "Stmt1413656969000",
          "Effect": "Allow",
          "Action": [
            "s3:*"
          ],
          "Resource": [
            "arn:aws:s3:::doup.illarra.com",
            "arn:aws:s3:::doup.illarra.com/*"
          ]
        }
      ]
    }