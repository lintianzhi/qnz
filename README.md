# Qiniu Node.js SDK

[![Build Status](https://travis-ci.org/lintianzhi/qnz.png?branch=develop)](https://travis-ci.org/lintianzhi/qnz)

[![Qiniu Logo](http://qiniutek.com/images/logo-2.png)](http://qiniu.com/)

## 下载

```bash
$ npm install qnz
```

## API DOC
### 目录

- [bucket(bucketName, opts)](#bucket)
	- [bucket.key(keyName)](#bucket.key)
	- [bucket.upToken([expire], [putPolicy)]](#bucket.upToken)
	- [bucket.list([opts], [onret])](#bucket.list)
- [key](#key)
	- [key.upToken([expire], [putPolicy])](#key.upToken)
	- [key.put(body, [extra], [upToken], [onret])](#key.put)
	- [key.putFile(path, [extra], [upToken], [onret])](#key.putFile)
	- [key.url([expire])](#key.url)
	- [key.stat([onret])](#key.stat)
	- [key.remove([onret])](#key.remove)
	- [key.move(dstkey, [onret])](#key.move)
	- [key.copy(dstKey, [onret])](#key.copy)
	- [key.imageInfoUrl()](#key.imageInfoUrl)
	- [key.imageInfoCall([onret])](#key.imageInfoCall)
	- [key.exifUrl()](#key.exifUrl)
	- [key.exifCall[onret]](#key.exifCall)
	- [key.pfop(fops, [opts], [onret])](#key.pfop)
- [batch](#batch)
	- [batch.stat(keys, [onret])](#batch.stat)
	- [batch.remove(keys, [onret])](#batch.remove)
	- [batch.copy(keyPairs, [onret])](#batch.copy)
	- [batch.move(keyPairs, [onret])](#batch.move)

### 内容
<a name="bucket"></a>


### DEMO


## 许可证

基于 MIT 协议发布:

* [www.opensource.org/licenses/MIT](http://www.opensource.org/licenses/MIT)
