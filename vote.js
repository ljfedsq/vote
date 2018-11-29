const http = require('http');
const cheerio = require('cheerio');
const request = require('request');
const iconv =  require('iconv-lite')
const schedule = require('node-schedule');

const fs = require('fs');
// var ak = '004d98fc88fe4667ac541f1d3eb228ad';
// var sk = '2b74ec37aa954e089200905e18c2dd8e';
// var ocr = require('baidu-ocr-api').create(ak,sk);
// // 外部图片
// ocr.scan({
//   url:'https://cdn.bdstatic.com/portal/img/logo/logo.2x_5d8bc201.png', // 支持本地路径
//   type:'text',
// }).then(function (result) {
//   return console.log(result)
// }).catch(function (err) {
//   console.log('err', err);
// })

var ocr = require('baidu-ocr').create( 'bF8rgNo49WDngybiqprDSQ9M' ),
//image = fs.readFileSync( './images/letter.jpg' );
 image = fs.createReadStream( __dirname + '/images/letter.jpg' );
// detectType: `LocateRecognize`代表整图文字检测、识别,以行为单位（默认）  
// languageType: `CHN_ENG`(中英)（默认）  
// imageType: `2`代表图片原文件（只支持JPG，大小不能超过300K）
// image: 图片流对象 或 base64 编码的字符串  
ocr.scan( 'LocateRecognize', 'CHN_ENG', 2, image, function( err, data ) {
  if ( err ) {
    return console.error( err );
  }

  console.log( 'words:' );
  console.log( data.word );
});
