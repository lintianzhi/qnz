var crypto = require('crypto');
var url = require('url');

exports.hmacSha1 = hmacSha1;
exports.base64ToUrlSafe = base64ToUrlSafe;
exports.urlsafeBase64Encode = urlsafeBase64Encode;
exports.genAccessToken = genAccessToken;

exports.upToken = function(scope, expire, accessKey, secretKey, putPolicy) {
  putPolicy = putPolicy || {}

  expire = expire || 3600;
  putPolicy.deadline = expire + Math.floor(Date.now() / 1000);
  putPolicy.scope = scope;

  var encodedFlags = urlsafeBase64Encode(JSON.stringify(putPolicy));
  var signature = hmacSha1(encodedFlags, secretKey);
  var encodedSign =  base64ToUrlSafe(signature);

  return accessKey + ':' + encodedSign + ':' + encodedFlags;
}

function urlsafeBase64Encode(str) {
  var encoded = new Buffer(str).toString('base64');
  return base64ToUrlSafe(encoded);
}

function base64ToUrlSafe(v) {
  return v.replace(/\//g, '_').replace(/\+/g, '-');
}

function hmacSha1(str, secretKey) {
  /*
   *
   * */
  var hmac = crypto.createHmac('sha1', secretKey);
  hmac.update(str);
  return hmac.digest('base64');
}

function genAccessToken(uri, body, acc, sec) {

  var u = url.parse(uri)
  var path = u.path;
  var access = path + '\n';

  if (body) {
    access += body;
  }

  var digest = hmacSha1(access, sec);
  var safeDigest = base64ToUrlSafe(digest);
  return 'QBox ' + acc + ':' + safeDigest;
}

exports.encodeEntry = function(bucket, key) {
  return urlsafeBase64Encode(bucket + ':' + key);
}

exports.noop = function() {}
