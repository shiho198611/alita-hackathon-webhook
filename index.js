'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const unirest = require('unirest');
const actionConst = require('./actionConst');
const dialogResGen = require('./dialogResponseText');

var port = process.env.PORT || 8080;
var timeout = require('connect-timeout');

const server = express();

server.use(bodyParser.json());

server.post('/actalita', function(req, res) {

    console.log('Dialogflow request body: '+JSON.stringify(req.body));

    var getIntent = req.body.queryResult.intent.displayName;
    var outputData;

    var telegramUserName = 'david198611' //Initial variable is for Dialogflow console testing.
    var requestTeleUserName = req.body.originalDetectIntentRequest.payload.data.message.chat.username;

    if(requestTeleUserName != null) {
        telegramUserName = requestTeleUserName;
        console.log("telegram username: "+telegramUserName);
    }

    if(getIntent == actionConst.actionAllowanceSearch) {
        queryApi(genRequestBody('ta', telegramUserName), res);
    }
    else if(getIntent == actionConst.actionAlitaAllowanceInit) {
        queryApi(genRequestBody('all_action', telegramUserName), res);
    }
    else if(getIntent == actionConst.actionDownloadBillingStatement) {
        queryApi(genRequestBody('df', telegramUserName, 'bls'), res);
    }
    else if(getIntent == actionConst.actionMeetingRoomBooking) {
        var timeStart = getApiUseTimeFormat(req.body.queryResult.parameters.time);
        var timeEnd = getApiUseTimeFormat(req.body.queryResult.parameters.time1);

        console.log("start time: "+timeStart);
        console.log("end time: "+timeEnd);
        
        queryApi(genRequestBody('mr', telegramUserName, 'ck', timeStart, timeEnd), res);

        
    }
    else {
        var outputTxt = "不好意思，這不是可接受的問題，請再問一次";
        var outputData = {
            fulfillmentText: outputTxt
        };

        res.send(outputData);
    }
});

var genOutputData = function(outputTxt) {
    var outputData = {
        fulfillmentText: outputTxt
    };
    return outputData;
};

var queryApi = function(reqBody, res) {

    unirest.post(actionConst.alitaApiUrl)
            .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
            .send(reqBody)
            .end(function (response) {
                console.log('alita api response: '+JSON.stringify(response.body));

                var outputTxt = dialogResGen.genResponseText(reqBody.action, response);
                res.send(genOutputData(outputTxt));

            });

}

var genRequestBody = function(action, telegramId) {
    var reqBody = {
        action : action,
        telegram_id : telegramId
    };
    return reqBody;
}

var genRequestBody = function(action, telegramId, fileType) {
    var reqBody = {
        action : action,
        telegram_id : telegramId,
        file_type: fileType
    };
    return reqBody;
}

var genRequestBody = function(action, telegramId, type, sDate, eDate) {
    var reqBody = {
        action : action,
        telegram_id : telegramId,
        sdate: sDate,
        edate: eDate,
        type: type
    };

    return reqBody;
}

var getApiUseTimeFormat = function(time) {
    var date = time.split("T")[0];
    var useTime = time.split("T")[1].split("+")[0];

    return date+" "+useTime;
}

server.use(timeout(5000));
server.use(haltOnTimedout);

function haltOnTimedout(req, res, next){
    if (!req.timedout) next();
}

server.listen(port, function () {
    console.log("Server is up and running...");
});