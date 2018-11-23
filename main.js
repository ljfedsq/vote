const http = require('http');
const cheerio = require('cheerio');
const request = require('request');
const iconv =  require('iconv-lite')
const schedule = require('node-schedule');

const rule = new schedule.RecurrenceRule();
rule.second = [0,5,10,15,20,25,30,35,40,45,50,55];//隔5秒
// rule.hour =0;rule.minute =0;rule.second =0;//每天0点执行
//rule.minute = [0,20,40];//每小时的0分钟，20分钟，40分钟执行

const api = "http://www.51lecture.com/app/vote2018.php"; // 初始投票登录页面url
const url = "http://www.51lecture.com/util/fileUtil.php "; // 投票接口url
const uri = "http://www.51lecture.com/util/postVote.php"; //  投票、排名接口url

// const agent = "Mozilla/5.0 (Linux; Android 8.1; PBEM00 Build/OPM1.171019.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.132 MQQBrowser/6.2 TBS/044307 Mobile Safari/537.36 MicroMessenger/6.7.3.1360(0x26070333) NetType/WIFI Language/zh_CN Process/tools"
const agent = "Mozilla/5.0 (Linux; Android 8.1; INE-TL00 Build/HUAWEIINE-TL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.132 MQQBrowser/6.2 TBS/044307 Mobile Safari/537.36 MMWEBID/4422 MicroMessenger/6.7.3.1360(0x2607033A) NetType/WIFI Language/zh_CN Process/tools"

let count = 0
let cookie = 'PHPSESSID=m8phpli76h1dc28j68sgsfuo21' // 需要更新
let token = ''
let key = ''
let userId = ''
let pid = ''

function parseHtml(result) { 
    let $ = cheerio.load(iconv.decode(result, 'utf-8'),{decodeEntities: false});
    let pageHtml = $.html()
    //console.log(pageHtml)
    if(pageHtml.match(/var token = "\w+"/ig)) {
        token = pageHtml.match(/var token = "\w+"/ig)[0].split('"')[1]
        key = pageHtml.match(/var key = "\w+"/ig)[0].split('"')[1]
        userId = pageHtml.match(/var userId = "\w+"/ig)[0].split('"')[1].substr(0,6)
        pid = pageHtml.match(/var pid = "\w+"/ig)[0].split('"')[1]
        //console.info('pid:' + pid+ ',key:'+ key)
        second()
    } else {
        console.log('服务器出错')
    }
    
}

function first() { // 登录获取token
    const options_empty = { // 无cookie情况
        encoding: null ,
        headers: {
            'User-Agent': agent
        }
    };
    request.get(api,options_empty,(error, response, body) => {
         //cookie = response.headers["set-cookie"][0].split(';')[0]
        let options = {
            encoding: null ,
            headers: {
                'User-Agent': agent,
                "Cache-Control": "no-cache",
                "Cookie": cookie //  更新cookie
            }
        }
        request.get(api,options,(error, response, body) => {
            parseHtml(body)
        })
    })
}
function second() { // 投票
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Cookie": cookie,
        "User-Agent": agent,
        "X-Requested-With":"XMLHttpRequest"
    } 
    const options = {
        form: {
            token: token,
            key: key,
            cmd: 'addvote',  
            uid: userId,
            pid: pid,
            ids: '202'
        },
        headers: headers   
    }
    request.post(uri,options,(error, response, body) => {
        if(body == '1') {
            check(headers)
        }
    })
}

function check(headers) {
    let myDate = new Date()
    let content = {
        voteday: myDate.toLocaleDateString(),
        votetime: Math.floor(myDate.valueOf()/1000),
        daycount: 1
    }
    let contentStr = encodeURI(JSON.stringify(content))
    const options = {      
        form: {
            cmd: 'put',
            token: token,
            key: key,
            path: pid,
            filePath: userId + '.js',
            content: contentStr
        },
        headers: headers   
    }
    request.post(url,options,(error, response, body) => {
        if(body == '1') {
            console.log('第'+ count + '次投票成功！')
            third()
        }
    })  

}

function third() { // 获取排名信息
    const options = {      
        form: {   
            token: token,
            key: key,
            cmd: 'viewpoll',
            pid: '19',
            bolPublic:1
        },
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Cookie": cookie,
            "User-Agent": agent,
            "X-Requested-With":"XMLHttpRequest"
        }   
    }
    request.post(uri,options,(error, response, body) => {
        const result = JSON.parse(body)
        if(result && result.length > 0) {
            result.map(item=> {
                if(item.fullName === '徐毅林') {
                    console.log('徐毅林当前票数：'+ item.votecount)
                }
            })
        }
    })  

}

function start() {
    //first()
    schedule.scheduleJob(rule, function(){
        console.log('现在时间：',new Date())
        count++
        first()
    });
}

start()