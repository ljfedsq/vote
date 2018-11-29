const http = require('http');
const cheerio = require('cheerio');
const request = require('request');
const iconv =  require('iconv-lite')
const schedule = require('node-schedule');

const rule = new schedule.RecurrenceRule();
//rule.second = [0,5,10,15,20,25,30,35,40,45,50,55];//隔5秒
let i = 0
let arr = []
while(i<60){
    i = i + 2
    arr.push(i)
}
rule.second = arr//隔2秒
// rule.hour =0;rule.minute =0;rule.second =0;//每天0点执行
//rule.minute = [0,20,40];//每小时的0分钟，20分钟，40分钟执行

const api = "http://www.51lecture.com/app/vote2018.php"; // 初始投票登录页面url
const url = "http://www.51lecture.com/util/postVote2018.php "; // 投票接口url
const checkUrl = "http://www.51lecture.com/util/postVoteFile.php" //获取Content
const uri = "http://www.51lecture.com/util/postVote.php"; //  投票、排名接口url

// const agent = "Mozilla/5.0 (Linux; Android 8.1; PBEM00 Build/OPM1.171019.026; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.132 MQQBrowser/6.2 TBS/044307 Mobile Safari/537.36 MicroMessenger/6.7.3.1360(0x26070333) NetType/WIFI Language/zh_CN Process/tools"
//const agent = "Mozilla/5.0 (Linux; Android 8.1; INE-TL00 Build/HUAWEIINE-TL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.132 MQQBrowser/6.2 TBS/044307 Mobile Safari/537.36 MMWEBID/4422 MicroMessenger/6.7.3.1360(0x2607033A) NetType/WIFI Language/zh_CN Process/tools"
const agent ="Mozilla/5.0 (Linux; Android 8.1; INE-TL00 Build/HUAWEIINE-TL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.132 MQQBrowser/6.2 TBS/044403 Mobile Safari/537.36 MMWEBID/4422 MicroMessenger/6.7.3.1360(0x2607033A) NetType/WIFI Language/zh_CN Process/tools"
let count = 0
let cookie = 'PHPSESSID=enab8fr8egf61qt4r9q6t6ir93' // 需要更新
//let cookie = ''
let token = ''
let key = ''
let userId = ''
let pid = ''
let rnd1 = ''
let voteDay = ''

function parseHtml(result) { 
    let $ = cheerio.load(iconv.decode(result, 'utf-8'),{decodeEntities: false});
    let pageHtml = $.html()
    //console.log(pageHtml)
    if(pageHtml.match(/var token = "\w+"/ig)) {
        token = pageHtml.match(/var token = "\w+"/ig)[0].split('"')[1]
        key = pageHtml.match(/var key = "\w+"/ig)[0].split('"')[1]
        userId = pageHtml.match(/var userId = "\w+"/ig)[0].split('"')[1].substr(0,6)
        pid = pageHtml.match(/var pid = "\w+"/ig)[0].split('"')[1]
        rnd1 = pageHtml.match(/var rnd1 = "\w+"/ig)[0].split('"')[1]
        // console.info('rnd1:' + rnd1+ ',voteDay:'+ voteDay)
        check()
    } else {
        console.log('cookie过期请更换cookie！')
    }
    
}
function login(res) {
    let loginUrl = res.match(/ '\.\.(.*)'/)[1]
    let urlStr = "http://www.51lecture.com" + loginUrl
   
    console.log(loginUrl)
    const options = { // 无cookie情况
        headers: {
            "Cookie": cookie,
            "User-Agent": agent,
        }
    };
    request.get(urlStr,options,(error, response, body) => {
        console.log(response.statusCode)
       //console.log(body+'')
       realLogin()
    })
}

function realLogin() {
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
        //console.log(body+'')
    })
}

function first() { // 登录获取token
    const options_empty = { // 无cookie情况
        encoding: null ,
        headers: {
            'User-Agent': agent
        }
    };
    request.get(api,options_empty,(error, response, body) => {
         cookie = response.headers["set-cookie"][0].split(';')[0]
         login(body+'')
         return
    })
}
function second(res) { // 投票
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Cookie": cookie,
        "User-Agent": agent,
        "X-Requested-With":"XMLHttpRequest"
    } 
    let content = {
        voteDay: res.voteDay,
        votetime: Math.round((new Date()).getTime()/1000),
        daycount: res.daycount + 1
    }
    const options = {
        form: {
            token: token,
            key: key,
            cmd: 'adduservote', 
            code: rnd1,
            session: '20181129', 
            uid: userId,
            pid: pid,
            ids:'MjAy',
            content: content
            // ids: '202'
        },
        headers: headers   
    }
    request.post(url,options,(error, response, body) => {
        // console.log(body)
        if(body == '1') {
            // check(headers)
            console.log('第'+ count + '次投票成功！')
            third()
        }
    })
}

function check() {
    const options = {      
        form: {
            cmd: 'get',
            token: token,
            key: key,
            path: pid,
            filePath: userId + '.js'
        },
        headers: {
            'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie':cookie,
            'User-Agent': agent,
            'X-Requested-With':'XMLHttpRequest'
        }      
    }
    request.post(checkUrl,options,(error, response, body) => {
        if(body){
            second(body)
        }
        // console.log(body)
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
    //realLogin()
    schedule.scheduleJob(rule, function(){
        console.log('现在时间：',new Date())
        count++
        realLogin()
    });
}

start()