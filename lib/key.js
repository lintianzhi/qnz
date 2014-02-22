var _ = require('underscore');
var formstream = require('formstream');
var fs = require('fs');
var mime = require('mime');
var querystring = require('querystring');
var Q = require('q');
var util = require('util');
var conf = require('./conf');
var rpc = require('./rpc');
var qutil = require('./util');

exports.Key = Key;
exports.key = key;
exports.genOp = genOp;

function key(bucket, name) {
  return new Key(bucket, name);
}

function Key(bucket, name) {
  this.bucket = bucket;
  this.conf = {keyName: name||''};
}

Key.prototype.attr = function(name) {
  return this.conf[name] || this.bucket.attr(name);
}

/*
 * io
* */
Key.prototype.upToken = function(expire, putPolicy) {

  switch (arguments.length) {
    case 0:
      expire = 3600;
      putPolicy = {};
      break;
    case 1:
      if (_.isNumber(expire)) {
        putPolicy = {}
      } else {
        putPolicy = expire;
        expire = 3600;
      }
  }

  var scope = this.attr('bucketName');
  if (this.attr('keyName')) {
    scope = scope + ':' + this.attr('keyName');
  }

  return qutil.upToken(scope, expire, this.attr('accessKey'), this.attr('secretKey'), putPolicy);
}

Key.prototype.put = function(body, extra, upToken, onret) {

  switch (arguments.length) {
    case 1:
      extra = {};
      upToken = this.upToken();
      onret = qutil.noop;
      break;
    case 2:
      if (_.isFunction(extra)) {
        onret = extra;
        extra = {};
        upToken = this.upToken();
      } else {
        onret = qutil.noop;
        if (_.isString(extra)) {
          upToken = extra;
          extra = {};
        } else {
          upToken = this.upToken();
        }
      }
      break;
    case 3:
      if (_.isFunction(upToken)) {
        onret = upToken;
        if (_.isString(extra)) {
          upToken = extra;
          extra = {};
        } else upToken = this.upToken();
      } else onret = qutil.noop;
      break;
  }

  key = this.attr('keyName') || null;
  form = getMultipart(upToken, key, body, extra);

  return rpc.postMultipart(this.attr('upHost'), form, onret);
}

function getMultipart(upToken, key, body, extra) {

  if (!extra) {
    extra = {};
  }
  var form = formstream();

  form.field('token', upToken);
  if (key) {
    form.field('key', key);
  }

  mimeType = extra.mimeType || 'application/octet-stream';
  var buf = Buffer.isBuffer(body) ? body : new Buffer(body);
  form.buffer('file', buf, key||'?', mimeType);

  for (var k in extra.params) {
    form.field(k, extra.params[k]);
  }

  return form;
}

Key.prototype.putFile = function(path, extra, upToken, onret) {

  var deferred = Q.defer();
  var self = this;
  switch (arguments.length) {
    case 1:
      extra = {};
      upToken = this.upToken();
      onret = qutil.noop;
      break;
    case 2:
      if (_.isFunction(extra)) {
        onret = extra;
        extra = {};
        upToken = this.upToken();
      } else {
        onret = qutil.noop;
        if (_.isString(extra)) {
          upToken = extra;
          extra = {};
        } else upToken = this.upToken();
      }
      break;
    case 3:
      if (_.isFunction(upToken)) {
        if (_.isString(extra)) {
          onret = upToken;
          upToken = extra;
          extra = {};
        } else {
          onret = upToken;
          upToken = this.upToken();
        }
      } else {
        onret = qutil.noop;
      }
      break;
  }

  fs.readFile(path, function (err, data) {
    if (err) {
      err.code = -1;
      deferred.reject(err);
      return;
    }
    extra.mimeType = extra.mimeType || mime.lookup(path);
    self.put(data, extra, upToken, function(err, ret) {
      if (err) deferred.reject(err);
      else deferred.resolve(ret);
    });
  });

  deferred.promise.nodeify(onret);
  return deferred.promise;
}

Key.prototype.url = function(expire) {
  if (this.attr('isPublic')) {
    return this.pubUrl();
  }

  var baseUrl = this.pubUrl();
  return this.access(baseUrl, expire);
}

Key.prototype.access = function(baseUrl, expire) {
  expire = expire || 3600;
  var deadline = expire + Math.floor(Date.now()/1000);

  if (baseUrl.indexOf('?') >= 0) {
    baseUrl += '&e=';
  } else {
    baseUrl += '?e=';
  }
  baseUrl += deadline;

  var signature = qutil.hmacSha1(baseUrl, this.attr('secretKey'));
  var encodedSign = qutil.base64ToUrlSafe(signature);
  var downloadToken = this.attr('accessKey') + ':' + encodedSign;

  return baseUrl + '&token=' + downloadToken;
}

Key.prototype.pubUrl = function(name) {
  name = name || this.attr('keyName');
  if (!_.isString(name)) {
    return '';
  }

  name = new Buffer(name);
  return this.attr('dnHost') + '/' + querystring.escape(name);
}

/* 
 * rs
 * */

Key.prototype.stat = function(onret) {
  return op('stat', this, onret);
}

Key.prototype.remove = function(onret) {
  return op('delete', this, onret);
}

Key.prototype.move = function(dstKey, onret) {
  return op('move', this, dstKey, onret);
}

Key.prototype.copy = function(dstKey, onret) {
  return op('copy', this, dstKey, onret);
}

function op(op, src, dst, onret) {

  var uri = conf.attr('rsHost') + genOp(op, src, dst);
  var auth = qutil.genAccessToken(uri, null, src.attr('accessKey'), src.attr('secretKey'));

  return  rpc.postWithoutForm(uri, {Authorization: auth}, onret);
}

function genOp(op, src, dst) {

  var encodedSrc = qutil.encodeEntry(src.attr('bucketName'), src.attr('keyName'));
  if (op === 'stat' || op === 'delete')
    return util.format('/%s/%s', op, encodedSrc);

  var encodedDst = qutil.encodeEntry(dst.attr('bucketName'), dst.attr('keyName'));
  if (op === 'move' || op === 'copy')
    return util.format('/%s/%s/%s', op, encodedSrc, encodedDst);
}

/*
 * fop
 * */

// imageInfo
Key.prototype.imageInfoUrl = function() {
  var uri = this.pubUrl() + '?imageInfo';
  return this.accessFop(uri);
}

Key.prototype.imageInfoCall = function(onret) {
  return rpc.get(this.imageInfoUrl(), onret);
}

// exif
Key.prototype.exifUrl = function() {
  var uri = this.pubUrl() + '?exif';
  return this.accessFop(uri);
}

Key.prototype.exifCall = function(onret) {
  return rpc.get(this.exifUrl(), onret);
}

// imageView
Key.prototype.imageViewUrl = function(opts) {
}

// imageMogr
Key.prototype.imageMogrUrl = function(opts) {
}

// qrcode
Key.prototype.qrcodeUrl = function() {
}

Key.prototype.accessFop = function(uri, expire) {
  if (this.attr('isPublic')) {
    return uri;
  }

  return this.access(uri, expire);
}

Key.prototype.pfop = function(fops, opts, onret) {
  if (_.isFunction(opts)) {
    opts = {};
    onret = opts;
  }
  opts = opts || {};
  opts.notifyUrl = opts.notifyUrl || 'www.test.com';
  var forceStr = opts.force && '&force=1' || '';

  var uri = this.attr('apiHost')+'/pfop/';
  var body = util.format("bucket=%s&key=%s&fops=%s&notifyURL=%s%s", this.attr('bucketName'), this.attr('keyName'), opts.fops, opts.notifyUrl, forceStr);
  var auth = qutil.genAccessToken(uri, body, this.attr('accessKey'), this.attr('secretKey'));
  return rpc.post(uri, body, {Authorization: auth, 'Content-Type': 'application/x-www-form-urlencoded'}, onret);
}
