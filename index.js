const conf = require("./config.json")
const express = require("express");
const xml2js = require('xml-js')
const bodyParser = require("body-parser");
const cors = require("cors");
const { application, text } = require("express");
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios').default;
const telebot_token = conf.telegram_bot_token;
const bot = new TelegramBot(telebot_token, {polling: true});

const getStationByName = 'http://ws.bus.go.kr/api/rest/stationinfo/getStationByName'
const getLowArrInfoByStId = 'http://ws.bus.go.kr/api/rest/arrive/getLowArrInfoByStId'

if (conf.debug == true)
{
	bot.on('message', (msg) => {
			const chatId = msg.chat.id;

			bot.sendMessage(chatId, 'Message Received');
			})
}

bot.onText(/\/정류장 (.+)/, (msg, match) => {
    let queryParam = getStationByName + '?' + encodeURIComponent('serviceKey')+ conf.gov_api_token

    let station_end_url = queryParam + '&' + encodeURIComponent('stSrch') + '=' + encodeURIComponent(match[1])
    let route_end_url = queryParam + '&' + encodeURIComponent('stSrch') + '=' + encodeURIComponent(match[1])
    console.log(`station ${match[1]}`)
    console.log(station_end_url)
    axios.get(station_end_url)
    .then(function (response)
    {
        console.log(response)
        const json_obj = JSON.parse(xml2js.xml2json(response.data, {compact: true, spaces: 4}))
        console.log('parse done!!')
        console.log(json_obj)
        console.log('send message : ' + json_obj.ServiceResult.msgBody.itemList[0].stNm._text)
        bot.sendMessage(msg.chat.id, json_obj.ServiceResult.msgBody.itemList[0].stNm._text + ' : ' +
        json_obj.ServiceResult.msgBody.itemList[0].stId._text + ', ' + json_obj.ServiceResult.msgBody.itemList[1].stId._text)
    })
    .catch(function (error)
    {
        console.log(error)
         //bot.sendMessage(error)
    })
    // station_name = bus_url+svc_key+match[1]
    // axios.get(bus_url+svc_key+station_name)
    // .then(function (response)
    // {
    //     console.log(response)
    //     bot.sendMessage(response)
    // })
    // .catch(function (error)
    // {
    //     console.log(error)
    //     bot.sendMessage(error)
    // })
})

bot.onText(/\/도착정보 (.+)/, (msg, match) => {
    let queryParam = getLowArrInfoByStId + '?' + encodeURIComponent('serviceKey')+'=U2jgY1kbWBmo%2FCbqvulEPQ9lKWtx1HLx8wY94OmtfIM7ZCKjGAG%2BAiBEvID4BQ82x9QHacCIqZBXHoU9oOOWkQ%3D%3D'

    let route_end_url = queryParam + '&' + encodeURIComponent('stId') + '=' + encodeURIComponent(match[1])
    console.log(`station ${match[1]}`)
    console.log(route_end_url)
    axios.get(route_end_url)
    .then(function (response)
    {
		let out_message = ''
        console.log(response)
        const json_obj = JSON.parse(xml2js.xml2json(response.data, {compact: true, spaces: 4}))
        console.log('parse done!!')
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
            answer = 'No worked';
            break;
    }
    console.log('%d %s %d', parseInt(res[1]), res[2], parseInt(res[3]))
    bot.sendMessage(chatId, answer);
})

bot.onText(/^\s*([-+]?)(\d+)(?:\s*([-+*\/])\s*((?:\s[-+])?\d+)\s*)+$/, (msg, match) => {
    const chatId = msg.chat.id
    const opr = match[2]
    
    //console.log('input %s ', match.);
    switch(opr){
        case '+':
            answer = match[1] + match[3];
            break;
        case '-':
            answer = match[1] - match[3];
            break;
        default:
            answer = 'No worked';
            break;
    }
    bot.sendMessage(chatId, answer);
    console.log('answer : %d', answer);
})

bot.onText(/\/echo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];

    bot.sendMessage(chatId, resp);
})

