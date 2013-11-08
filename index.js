
var libpath = process.env.QINIU_COV ? './lib-cov' : './lib';

module.exports = {
  bucket: require(libpath + '/bucket.js').bucket,
  conf: require(libpath + '/conf.js'),
  key: require(libpath + '/key.js'),
};
