var qiniu = require('../');
var _ = require('underscore');
var should = require('should');
var path = require('path');

qiniu.conf.setConf({accessKey:process.env.QINIU_ACCESS_KEY,
                    secretKey:process.env.QINIU_SECRET_KEY});

var imgFile = path.join(__dirname, 'gogopher.jpg');
var bucket1 = qiniu.bucket(process.env.QINIU_TEST_BUCKET, {dnHost: process.env.QINIU_TEST_DOMAIN, isPublic: false});
var prefix = '';

before(function(done) {
  if (!process.env.QINIU_ACCESS_KEY) {
    console.log('should run command `source test-env.sh` first\n');
    process.exit(0);
  }
  done();
});

describe('test start', function() {
  var keys = [];

  after(function(done) {
    var batch = qiniu.batch();
    batch.remove(keys, function(err, ret) {
      should.not.exist(err);
      done();
    });
  });

  describe('test key', function() {
    var rskey;
    it('upload file', function(done) {
      var key = bucket1.key(r());
      key.putFile(imgFile, function(err, ret) {
        should.not.exist(err);
        rskey = key;
        keys.push(key);
        done();
      });
    });

    it('upload file(no such file)', function(done) {
      var key = bucket1.key(r());
      key.putFile('no such file', function(err, ret) {
        err.code.should.equal(-1);
        done();
      });
    });

    it('upload', function(done) {
      var key = bucket1.key(r());
      key.put(r(), function(err, ret) {
        should.not.exist(err);
        keys.push(key);
        done();
      });
    });

    it('upload with bucket token', function(done) {
      var key = bucket1.key(r());
      var token = bucket1.upToken(1800);
      key.put(r(), token)
        .then(function() {
          keys.push(key);
          done();
        }, should.not.exist);
    });
    
    it('rs stat&move&copy&remove', function(done) {
      var rskey1 = bucket1.key(r());
      rskey.stat()
        .then(function(ret) {
          ret.should.have.keys('putTime', 'hash', 'mimeType', 'fsize');
          return rskey.move(rskey1);
        })
        .then(function(ret) {
          return rskey1.copy(rskey);
        })
        .then(function(ret) {
          return rskey1.remove();
        })
        .then(function() {
          done();
        }, function(err) {
          should.not.exist(err);
          done();
        });
    });
  });

  describe('test batch', function() {
    var batch = qiniu.batch();
    it('stat', function(done) {
      batch.stat(keys, function(err, ret) {
        should.not.exist(err);
        ret.length.should.be.above(0);
        done();
      });
    });

    it('move&copy', function(done) {
      var keys1 = [];
      for (var i in keys) {
        keys1.push(bucket1.key(r()));
      }
      var keyPairs0 = _.zip(keys, keys1);
      var keyPairs1 = _.zip(keys1, keys);
      batch.move(keyPairs0)
        .then(function() {
          return batch.copy(keyPairs1);
        })
        .then(function() {
          keys = _.union(keys, keys1);
          done();
        }, should.not.exist);
    });
  });

  describe('test fop', function() {
    var imgKey = bucket1.key(r());
    before(function(done) {
      imgKey.putFile(imgFile, function(err, ret) {
        should.not.exist(err);
        done();
      });
    });
    after(function(done) {
      keys.push(imgKey);
      done();
    });

    it('imageInfo', function(done) {
      imgKey.imageInfoCall(function(err, ret) {
        should.not.exist(err);
        ret.should.have.keys('width', 'height', 'format', 'colorModel');
        done();
      });
    });

    it('exif', function(done) {
      imgKey.exifCall(function(err, ret) {
        should.not.exist(err);
        ret.should.be.type('object');
        done();
      });
    });
  });

  describe('test bucket', function() {
    it('list all', function(done) {
      var items = [];
      var callback = function(err, ret) {
        should.not.exist(err);
        items = _.union(items, ret.items);
        if (ret.marker) {
          bucket1.list({prefix: prefix}, callback);
        } else {
          items.length.should.equal(keys.length);
          done();
        };
      }
      bucket1.list({prefix: prefix}, callback);
    });
  });

});

function r() {
  if (prefix == '') {
    prefix = Math.floor(Math.random(1000)*10000) + '';
  }
  return prefix + Math.random(1000);
}
