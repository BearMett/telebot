# telebot

telebot은 가칭입니다.

아침에 출근하는데 도착시간이 자꾸 널뛰기하는 버스가 보기 싫어서 버스 도착 시간을 알려주고, 그 도착시간에 변동이 생기면 또다시 알려주게끔 하여 배차간격 20분짜리 버스를 놓치지 않기 위해 작업을 시작했습니다.

정부 API 키와 텔레그램 API 키가 있으면 소스를 직접 내려받아서 동작할 수 있을정도의 동작을 상정하고 있습니다.

아직 배포 가능한 수준은 아니며 자바스크립트로 하는 첫번째 작업인 만큼 시간은.. 오래걸릴듯 합니다.

## 설정 방법(config.json)

```json
{
    "telegram_bot_token" : "텔레그램 BOT ID",
    "gov_api_token" : "정부 API 키",
    "debug" : "false"
}

```

debug는 이후 로그레벨이나 테스트 서버에서 유용한 동작을 추가하면 사용하려고 미리 만든 플래그 입니다. 현재 없어도 상관없으며 주 동작은 [telegram bot](https://core.telegram.org/bots/api), [공공데이터포털](https://www.data.go.kr/) 두가지 API 키를 발급받으면 동작합니다.

## 사용 프레임워크

nodejs

## 사용 패키지

- RestAPI: Axios
- xml-js
- node-telegram-bot-api
- pg (예정)

## 완성률

- [ ] 도움말
- [ ] 정보 수집 동의 받기(telegram chat id)
- [x] 정류장 정보 획득 명령 (/정류소 /정류장)
- [ ] 정류장의 버스 도착정보 획득 명령(/도착정보)
- [ ] 정류장의 버스 도착정보 알림 명령(/도착알림)
- [ ] 정류장의 버스 도착정보 반복 알림 등록 명령(/알림등록)
- [ ] 정류장의 버스 도착정보 반복 알림 제거 명령(/알림제거)

## 도움 요청

초기 기획에는 프론트엔드 동작을 상정하였으나 시간적인 문제로 telegram bot을 프론트로 사용하게 되었습니다.

React Native와 같은 프론트엔드의 사이드 프로젝트를 찾는분이 있으시다면 도움을 요청드리고자 합니다.



*라이센스는 [GPL-3.0 License](https://github.com/BearMett/telebot/blob/main/LICENSE)을 따릅니다.*
