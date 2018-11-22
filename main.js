const http = require('http');
const cheerio = require('cheerio');
const request = require('request');
const iconv =  require('iconv-lite')
const schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();
rule.second = [0,10,20,30,40,50];//隔十秒
// rule.hour =0;rule.minute =0;rule.second =0;//每天0点执行
//rule.minute = [0,20,40];//每小时的0分钟，20分钟，40分钟执行

const api = "http://www.51lecture.com/app/vote2018.php"; // 初始投票页面url
const url = "http://www.51lecture.com/util/fileUtil.php "; // 投票接口

let count = 0

function parseHtml(result) { 
    let $ = cheerio.load(iconv.decode(result, 'utf-8'),{decodeEntities: false});
    let pageHtml = $.html()
    let token = pageHtml.match(/var token = "\w+"/ig)[0].split('"')[1]
    let key = pageHtml.match(/var key = "\w+"/ig)[0].split('"')[1];
    // console.info('token:' + token+ ',key:'+ key)
    second(token,key)
}

function first() {
    const options = {
        encoding: null ,
		headers: {
			'User-Agent': "Mozilla/5.0Mozilla/5.0 (Linux; Android 8.1; PBEM00 Build/OPM1.171019.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.132 MQQBrowser/6.2 TBS/044307 Mobile Safari/537.36 MicroMessenger/6.7.3.1360(0x26070333) NetType/WIFI Language/zh_CN Process/tools (Linux; Android 8.1; PBEM00 Build/OPM1.171019.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.132 MQQBrowser/6.2 TBS/044307 Mobile Safari/537.36 MicroMessenger/6.7.3.1360(0x26070333) NetType/WIFI Language/zh_CN Process/tools",
			"Cache-Control": "no-cache",
			"Cookie": "PHPSESSID=7vua1i3mecbto1rt4u0pnqk760" //  会更新
		}
    };
    request.get(api,options,(error, response, body) => {
        parseHtml(body)
    })
}

function second(token,key) {
    
    let myDate = new Date()
    let content = {
        voteday: myDate.toLocaleDateString(),
        votetime: Math.floor(myDate.valueOf()/1000),
        daycount: 8
    }
    let contentStr = encodeURI(JSON.stringify(content))
    const options = {
        
        form: {
            cmd: 'put',
            token: token,
            key: key,
            paht: '19',
            filePath:'28f79a.js',
            content: contentStr
        },
        heasers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Cookie": "PHPSESSID=54rpe99i20bg5pf3hus7ntrnv3",
            'User-Agent': 'Mozilla/5.0 (Linux; Android 8.1; PBEM00 Build/OPM1.171019.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.132 MQQBrowser/6.2 TBS/044307 Mobile Safari/537.36 MicroMessenger/6.7.3.1360(0x26070333) NetType/WIFI Language/zh_CN Process/tools',
        }   
    }
    request.post(url,options,(error, response, body) => {
        if(body == '1') {
            console.log('第'+ count + '次投票成功！')
        }
    })  
}

function start() {
    schedule.scheduleJob(rule, function(){
        console.log('现在时间：',new Date())
        count++
        first()
    });
}

start()