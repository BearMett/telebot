process.env.NTBA_FIX_319 = 1; 
const conf = require("./config.json")
const xml2js = require('xml-js')
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios').default;
const telebot_token = conf.telegram_bot_token;
const bot = new TelegramBot(telebot_token, {polling: true});

const API_HOME = 'http://ws.bus.go.kr/api/rest'
const getStationByName = ['/stationinfo/getStationByName', 'stSrch']
const getBusArrivalByArsID = ['/stationinfo/getStationByUid', 'arsId']
const getLowArrInfoByStId = ['/arrive/getLowArrInfoByStId', 'stId']
const getBusRouteList = '/busRouteInfo/getBusRouteList'

if (conf.debug == true)
{
	bot.on('message', (msg) => {
			const chatId = msg.chat.id;

			bot.sendMessage(chatId, 'Message Received');
			})
}

async function get_gov_api(command, payload){
    let command_send
    let json_obj
    command_send = API_HOME + 
    command[0] + '?' + encodeURIComponent('serviceKey') + conf.gov_api_token 
    + '&' + command[1] + '=' + encodeURIComponent(payload)
    console.log(command_send)
    const promise = axios.get(command_send)

    const dataPromise = await promise.then((res) => res.data).catch(err => console.log(err))
    //console.log(dataPromise)
    return JSON.parse(xml2js.xml2json(dataPromise, {compact: true, spaces: 4}))
}

async function get_gov_api_promise(command, payload){
    let command_send
    let json_obj
    command_send = API_HOME + 
    command[0] + '?' + encodeURIComponent('serviceKey') + conf.gov_api_token 
    + '&' + command[1] + '=' + encodeURIComponent(payload)
    console.log(command_send)
    const promise = axios.get(command_send)

    const dataPromise = await promise.then((res) => res.data).catch(err => console.log(err))
    //console.log(dataPromise)
    return dataPromise//JSON.parse(xml2js.xml2json(dataPromise, {compact: true, spaces: 4}))
}

async function wait_two_arrival(method, json_data)
{
    return Promise.all([
        get_gov_api_promise(method,json_data.ServiceResult.msgBody.itemList[0].arsId._text), 
        get_gov_api_promise(method,json_data.ServiceResult.msgBody.itemList[1].arsId._text)]
        )
    .then((result) => {
        //console.log(result)
        return result
    })
    .catch((error) => {
        console.error(error)
        return error
    });
}

async function onStation(msg, payload){
    var json_data
    var stn1_arrival_json
    var stn2_arrival_json
    json_data = await get_gov_api(getStationByName, payload).catch(err => console.log(err))
    
    if (json_data != undefined && json_data.ServiceResult.msgHeader.headerMsg._text != '결과가 없습니다.')
    {
        var msg_to_send
        let data_prom = await wait_two_arrival(getBusArrivalByArsID,json_data)
        stn1_arrival_json = JSON.parse(xml2js.xml2json(data_prom[0], {compact: true, spaces: 4}))
        stn2_arrival_json = JSON.parse(xml2js.xml2json(data_prom[1], {compact: true, spaces: 4}))
        msg_to_send = json_data.ServiceResult.msgBody.itemList[0].stNm._text
        msg_to_send = msg_to_send + '\n' + stn1_arrival_json.ServiceResult.msgBody.itemList[0].arsId._text + '(' + stn1_arrival_json.ServiceResult.msgBody.itemList[0].nxtStn._text + ' 방면)' + stn1_arrival_json.ServiceResult.msgBody.itemList[0].stId._text
        msg_to_send = msg_to_send + '\n' + stn2_arrival_json.ServiceResult.msgBody.itemList[1].arsId._text + '(' + stn2_arrival_json.ServiceResult.msgBody.itemList[1].nxtStn._text + ' 방면)' + stn1_arrival_json.ServiceResult.msgBody.itemList[1].stId._text
        bot.sendMessage(msg.chat.id, msg_to_send)
    }
    else
    {
        bot.sendMessage(msg.chat.id,'결과가 없습니다.')
        return undefined
    }
}
bot.onText(/\/(정류장|정류소) (.+)/, (msg, match) => {
    console.log(`receive "station ${match[1]}"`)
    onStation(msg, match[2]).catch(err => console.log(err))
})

bot.onText(/\/도착정보 (.+)/, (msg, match) => {
    let queryParam = API_HOME + getLowArrInfoByStId[0] + '?' + encodeURIComponent('serviceKey')+'=U2jgY1kbWBmo%2FCbqvulEPQ9lKWtx1HLx8wY94OmtfIM7ZCKjGAG%2BAiBEvID4BQ82x9QHacCIqZBXHoU9oOOWkQ%3D%3D'

    let route_end_url = queryParam + '&' + encodeURIComponent('stId') + '=' + encodeURIComponent(match[1])
    console.log(`station ${match[1]}`)
    console.log(route_end_url)
    axios.get(route_end_url)
    .then(function (response)
    {
		let out_message = ''
        console.log(response)
        const json_obj = JSON.parse(xml2js.xml2json(response.data, {compact: true, spaces: 4}))
        json_obj.ServiceResult.msgBody.itemList.forEach(element => {
            out_message = out_message + '\n' + element.rtNm._text + ' : ' + element.arrmsg1._text
        });
        console.log(out_message)
        bot.sendMessage(msg.chat.id, out_message)
    })
    .catch(function (error)
    {
        console.log(error)
         //bot.sendMessage(error)
    })
})

bot.onText(/\/노선 (.+)/, (msg, match) => {
    let queryParam = API_HOME + getLowArrInfoByStId + '?' + encodeURIComponent('serviceKey')+'=U2jgY1kbWBmo%2FCbqvulEPQ9lKWtx1HLx8wY94OmtfIM7ZCKjGAG%2BAiBEvID4BQ82x9QHacCIqZBXHoU9oOOWkQ%3D%3D'

    let route_end_url = queryParam + '&' + encodeURIComponent('stId') + '=' + encodeURIComponent(match[1])
    console.log(`station ${match[1]}`)
    console.log(route_end_url)
    axios.get(route_end_url)
    .then(function (response)
    {
		let out_message = ''
        console.log(response)
        const json_obj = JSON.parse(xml2js.xml2json(response.data, {compact: true, spaces: 4}))
        console.log(json_obj)
        json_obj.ServiceResult.msgBody.itemList.forEach(element => {
            out_message = out_message + '\n' + element.rtNm._text + ' : ' + element.arrmsg1._text
        });
        console.log(out_message)
        bot.sendMessage(msg.chat.id, out_message)
        // console.log('send message : ' + json_obj.ServiceResult.msgBody.itemList[1].stNm._text)
        // bot.sendMessage(msg.chat.id, json_obj.ServiceResult.msgBody.itemList[1].stNm._text)
    })
    .catch(function (error)
    {
        console.log(error)
         //bot.sendMessage(error)
    })
})

bot.onText(/\/calc (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    let res = match[1].match(/(\d*)([+-])(\d*)/)
    //const reg = new RegExp('(^\s*([-+]?)(\d+)(?:\s*([-+*\/])\s*((?:\s[-+])?\d+)\s*)+$')
    console.log(res);
    console.log(res[2]);
    const opr = res[2]
    
    //console.log('input %s ', match.);
    switch(opr){
        case '+':
            answer = parseInt(res[1]) + parseInt(res[3]);
            break;
        case '-':
            answer = parseInt(res[1]) - parseInt(res[3]);
            break;
        case '*':
            answer = parseInt(res[1]) * parseInt(res[3]);
            break;
        case '/':
            answer = parseInt(res[1]) / parseInt(res[3]);
            break;
        default:
            console.log('no_worked')
            break;
    }
    console.log('%d %s %d = %d', parseInt(res[1]), res[2], parseInt(res[3]), answer)
    bot.sendMessage(chatId, answer);
})

// bot.onText(/^\s*([-+]?)(\d+)(?:\s*([-+*\/])\s*((?:\s[-+])?\d+)\s*)+$/, (msg, match) => {
//     const chatId = msg.chat.id
//     const opr = match[2]
    
//     //console.log('input %s ', match.);
//     switch(opr){
//         case '+':
//             answer = match[1] + match[3];
//             break;
//         case '-':
//             answer = match[1] - match[3];
//             break;
//         default:
//             answer = 'No worked';
//             break;
//     }
//     bot.sendMessage(chatId, answer);
//     console.log('answer : %d', answer);
// })

bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];

    bot.sendMessage(chatId, resp);
})


// async function onTest(msg, payload){
//     var json_data
//     json_data = await get_gov_api(getStationByName, payload).catch(err => console.log(err))
//     if (json_data == undefined)
//     {
//         bot.sendMessage(msg.chat.id,'결과가 없습니다.')
//     }
//     else
//     {
//         bot.sendMessage(msg.chat.id,json_data.ServiceResult.msgBody.itemList[0].stNm._text)
//     }
// }
// bot.onText(/\/(테스트) (.+)/, (msg, match) => {
//     onTest(msg, getStationByName, match[2]).catch(err => console.log(err))
// })
