var qiniu = require('../../');

qiniu.conf.ACCESS_KEY = 'nnwjTeUgpQdfZp9cb4-iHK0EUlebKCNk4kXwoStq'
qiniu.conf.SECRET_KEY = 'Ia9pXC-XEcGF6hvu1V5fdRhwFLpeUkCbt0Gxk5NW'

// @gist uploadFile
function uploadFile(localFile, key, uptoken) {
  var extra = new qiniu.io.PutExtra();
  //extra.params = params;
  //extra.mimeType = mimeType;
  //extra.crc32 = crc32;
  //extra.checkCrc = checkCrc;

  qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
    if(!err) {
      // 上传成功， 处理返回值
      console.log(ret.key, ret.hash);
      // ret.key & ret.hash
    } else {
      // 上传失败， 处理返回代码
      console.log(err);
      // http://docs.qiniu.com/api/put.html#error-code
    }
  });
}
// @endgist

// @gist uptoken
function uptoken(bucketname) {
  var putPolicy = new qiniu.rs.PutPolicy(bucketname);
  //putPolicy.callbackUrl = callbackUrl;
  //putPolicy.callbackBody = callbackBody;
  //putPolicy.returnUrl = returnUrl;
  //putPolicy.returnBody = returnBody;
  //putPolicy.asyncOps = asyncOps;
  //putPolicy.expires = expires;

  return putPolicy.token();
}
iconv = new require('iconv').Iconv('UTF-8', 'GBK');
var key = iconv.convert('你好');
token = uptoken('test741');
uploadFile('test.js', key, token);

var client = new qiniu.rs.Client();
client.stat('test741', key, function(err, ret) {
  if (!err) {
    console.log(ret)
    // ok 
    // ret has keys (hash, fsize, putTime, mimeType)
  } else {
    console.log(err);
    // http://docs.qiniu.com/api/file-handle.html#error-code
  }
});

qiniu.rsf.listPrefix('test741', '', '', 0, function(err, ret) {
  if (!err) {
    console.log(ret);
  } else {
    console.log(err);
  }
})
