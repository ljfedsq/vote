// var https = require('https');
// var qs = require('querystring');
// const request = require('request');

// const fs = require('fs');
// const param = qs.stringify({
//     'access_token': '24.7c817cf740e7f1429ffa7da0ccb3ca70.2592000.1546000998.282335-10688510'
// });
// var image = fs.readFileSync( './images/letter.jpg' );
// var base64Img = new Buffer.from(image).toString('base64');

// request.post(
//     {
//         hostname: 'aip.baidubce.com',
//         path: '/rest/2.0/ocr/v1/general_basic?' + param,
//         form: {
//             image:'./images/letter.jpg'
//         },
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded'
//         }
//     },
//     function (res,data) {
//         // 在标准输出中查看运行结果
//         console.log(res)
//     }
// );

// const headers = {
//     "Content-Type": "application/x-www-form-urlencoded;",
// } 
// const options = {
//     form: {
//         image: encodeURI(base64Img)
//     },
//     headers: headers   
// }
// const uri = 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic'+ param
// request.post(uri,options,(error, response, body) => {
//     console.log(response,body)
// })
var AipOcrClient = require("baidu-aip-sdk").ocr;

// 设置APPID/AK/SK
var APP_ID = "10688510";
var API_KEY = "bF8rgNo49WDngybiqprDSQ9M";
var SECRET_KEY = "8R0LSsWL51RxOdM5Iz7gaB7oR8x1r6dD";

// 新建一个对象，建议只保存一个对象调用服务接口
var client = new AipOcrClient(APP_ID, API_KEY, SECRET_KEY);
var fs = require('fs');

var image = fs.readFileSync("assets/example.jpg").toString("base64");

// 调用通用文字识别（高精度版）
client.accurateBasic(image).then(function(result) {
    console.log(JSON.stringify(result));
}).catch(function(err) {
    // 如果发生网络错误
    console.log(err);
});

// 如果有可选参数
var options = {};
options["detect_direction"] = "true";
options["probability"] = "true";

// 带参数调用通用文字识别（高精度版）
client.accurateBasic(image, options).then(function(result) {
    console.log(JSON.stringify(result));
}).catch(function(err) {
    // 如果发生网络错误
    console.log(err);
});;