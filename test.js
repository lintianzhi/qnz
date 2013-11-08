var qiniu = require('./');

qiniu.conf.setConf({accessKey: '8Y7uZY0cqHxAyGK27V_B2Bxf8IhAkqEPOHr6iwwc',
                    secretKey: '1uvFVvk9IqFRQ6t4TCr-DdeXybTbSS0gauJrYiJN'});


                    
var bucket = qiniu.bucket('test963', {isPublic: false, dnHost: 'http://test963.qiniudn.com'});
var key = bucket.key('你好');

console.log(key.attr('bucketName'));

uri = key.url();
console.log(uri);

//key.putFile('test.js', function(err, ret) {
//  console.log('putFile:', err, ret);
//
//  key.copy(bucket.key('阿阿'), function(err, ret) {
//    console.log(err, ret);
//
//    bucket.key('阿阿').remove(function(err, ret) {
//      console.log(err, ret);
//    })
//  });
//
//});

//key.stat(function(err, ret) {
//  console.log(err, ret);
//});


var key1 = bucket.key('q');
key1.putFile('1')
  .then(function(){return key1.stat()})
  .then(console.log, console.log);

