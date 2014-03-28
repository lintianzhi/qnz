
var libpath = process.env.QINIU_COV ? './lib-cov' : './lib';

module.exports = {
  batch: require(libpath + '/batch.js').batch,
  bucket: require(libpath + '/bucket.js').bucket,
  conf: require(libpath + '/conf.js'),
  key: require(libpath + '/key.js'),
  rpc: require(libpath + '/rpc.js'),
  util: require(libpath + '/util.js')
};
