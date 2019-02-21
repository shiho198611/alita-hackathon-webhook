'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const unirest = require('unirest');
const actionConst = require('./actionConst');
const dialogResGen = require('./dialogResponseText');
const roomSearchHandler = require('./roomSearchHandler');
// Import the appropriate class
// const { WebhookClient } = require('dialogflow-fulfillment');


var port = process.env.PORT || 8080;
var timeout = require('connect-timeout');

const server = express();

server.use(bodyParser.json());

server.post('/actalita', function (req, res) {

    //Create an instance
    // const agent = new WebhookClient({request: request, response: response});
    // console.log("agent--------", agent);

    console.log('Dialogflow request body: ' + JSON.stringify(req.body));

    var getIntent = req.body.queryResult.intent.displayName;
    var outputData;

    var telegramUserName = 'david198611' //Initial variable is for Dialogflow console testing.

    try {
        telegramUserName = req.body.originalDetectIntentRequest.payload.data.message.chat.username
    } catch (err) {
        console.log('Not run on telegram.');
    }

    console.log("telegram username: " + telegramUserName);

    if (getIntent === actionConst.actionAllowanceSearch) {
        queryApi(genRequestBody('ta', telegramUserName), res);
    }
    else if (getIntent === actionConst.actionAlitaAllowanceInit) {
        queryApi(genRequestBody('all_action', telegramUserName), res);
    }
    else if (getIntent === actionConst.actionDownloadBillingStatement) {
        queryApi(genBillingRequestBody('df', telegramUserName, 'bls'), res);
    }
    else if (getIntent === actionConst.actionMeetingRoomBooking) {
        // var timeStart = getApiUseTimeFormat(req.body.queryResult.parameters.time);
        // var timeStart = getApiUserDateFormat(req.body.queryResult.parameters.date)+getApiUseTimeFormat(req.body.queryResult.parameters.time);


        var timeStart = getApiUseTimeFormat(req, false);
        var timeEnd = getApiUseEndTimeFormat(req, false);
        // if(req.body.queryResult.parameters.time1 != null && req.body.queryResult.parameters.time1 != "") {
        //     var timeEnd = getApiUseTimeFormat(req.body.queryResult.parameters.time1);
        //     console.log("start time: "+timeStart);
        //     console.log("end time: "+timeEnd);

        //     queryApiRoomBooking(genRequestBody('mr', telegramUserName, 'ck', timeStart, timeEnd), res, req.body.session, "alita_meeting_room_booking-followup");
        // }
        // else {
        //     queryApiRoomBooking(genRequestBody('mr', telegramUserName, 'ck', timeStart), res, req.body.session, "alita_meeting_room_booking-followup");
        // }
        console.log("start time: " + timeStart);
        console.log("end time: " + timeEnd);

        // queryApiRoomBooking(genRequestBody('mr', telegramUserName, 'ck', timeStart), res, req.body.session, "alita_meeting_room_booking-followup");

        queryApiRoomBooking(genRequestBookingConfirmBody('mr', telegramUserName, 'ck', timeStart, timeEnd), res, req.body.session, "alita_meeting_room_booking-followup");
    }
    else if (getIntent === actionConst.actionMeetingRoomBookingConfirm) {
        // queryApi(genRequestBody('mr', ));

        var timeStart = getApiUseTimeFormat(req, true);
        var timeEnd = getApiUseEndTimeFormat(req, true);

        // if(req.body.queryResult.outputContexts[0].parameters.time1 != null && req.body.queryResult.outputContexts[0].parameters.time1 != "") {
        //     var timeEnd = getApiUseTimeFormat(req);
        // }

        console.log("booking start time: " + timeStart);
        console.log("booking end time: " + timeEnd);

        queryApiWithType(genRequestBookingConfirmBody('mr', telegramUserName, 'b', timeStart, timeEnd), res);
    }
    else if (getIntent === actionConst.actionMeetingRoomSearch) {
        roomSearchHandler.meetingRoomSearchViaDate(telegramUserName, req, res);
    }
    else if (getIntent === actionConst.actionMeetingRoomCancel) {

        // query first
        var timeStart = getApiUseTimeFormat(req, false);
        var timeEnd = getApiUseEndTimeFormat(req, false);

        let queryUserBody = genRequestCheckBookingByUserBody('mr', telegramUserName, 'ck', timeStart, timeEnd, telegramUserName);
        console.log('timeStart: ' + timeStart);
        console.log('timeEnd: ' + timeEnd);
        unirest.post(actionConst.alitaApiUrl)
            .headers({ 'Accept': 'application/json', 'Content-Type': 'application/json' })
            .send(queryUserBody)
            .end(function (response) {
                let jsonBody = response.body;

                console.log('alita api response: ' + JSON.stringify(jsonBody));

                if (jsonBody.data == null || jsonBody.data.length == 0) {
                    res.send(genOutputData("此時段無預約會議室"));
                } else {
                    let roomId = jsonBody.data[0].id;
                    console.log('room: ' + JSON.stringify(jsonBody.data));

                    unirest.post(actionConst.alitaApiUrl)
                        .headers({ 'Accept': 'application/json', 'Content-Type': 'application/json' })
                        .send(genRequestCancelBody('mr', telegramUserName, 'r', roomId), res)
                        .end(function (response) {
                            console.log('alita api response: ' + JSON.stringify(response.body));

                            let obj = {
                                bid: roomId
                            }
                            let json = (genMeetingRoomOutputContextWithParam(req.body.session, "alita_meeting_room_cancel-followup", obj));
                            console.log('room json: ' + JSON.stringify(json));
                            res.send(genOutputData(json));

                        });

                    // let obj = {
                    //     bid: roomId
                    // }
                    // let json = (genMeetingRoomOutputContextWithParam(req.body.session, "alita_meeting_room_cancel-followup", obj));
                    // console.log('room json: ' + JSON.stringify(json));
                    // res.send(genOutputData(json));
                }
            });
    }
    else if (getIntent === actionConst.actionMeetingRoomCancelConfirm) {
        let param = req.body.queryResult.outputContexts[0].parameters
        console.log('cancel body: ' + JSON.stringify(param));

        if (param.Confirm == actionConst.confirm_no) {
            res.send(genOutputData("好的，維持預約"));
        } else {
            res.send(genOutputData("Success."));
            // let roomId = '37';//param.bid;
            // console.log('cancel roomId: ' + roomId);
            // queryApiWithType(genRequestCancelBody('mr', telegramUserName, 'r', roomId), res);
        }
    }
    else {
        var outputTxt = "不好意思，這不是可接受的問題，請再問一次";
        var outputData = {
            fulfillmentText: outputTxt
        };

        res.send(outputData);
    }
});

var genOutputData = function (outputTxt) {
    var outputData = {
        fulfillmentText: outputTxt
    };
    return outputData;
};

var genMeetingRoomOutputContext = function (session, contextName) {
    var outputData = {
        outputContexts: [
            {
                name: session + contextName,
                lifespanCount: 1,
                parameters: {}
            }
        ]
    }
    return outputData;
}

var genMeetingRoomOutputContextWithParam = function (session, contextName, param) {
    var outputData = {
        outputContexts: [
            {
                name: session + contextName,
                lifespanCount: 1,
                parameters: param
            }
        ]
    }
    return outputData;
}

var genMeetingRoomOutputContextWithParam = function (session, contextName, param) {
    var outputData = {
        outputContexts: [
            {
                name: session + contextName,
                lifespanCount: 1,
                parameters: param
            }
        ]
    }
    return outputData;
}

var queryApi = function (reqBody, res) {

    unirest.post(actionConst.alitaApiUrl)
        .headers({ 'Accept': 'application/json', 'Content-Type': 'application/json' })
        .send(reqBody)
        .end(function (response) {
            console.log('alita api response: ' + JSON.stringify(response.body));

            var outputTxt = dialogResGen.genResponseText(reqBody.action, response);
            res.send(genOutputData(outputTxt));

        });

}

var queryApiWithType = function (reqBody, res) {

    console.log("request: " + JSON.stringify(reqBody));

    unirest.post(actionConst.alitaApiUrl)
        .headers({ 'Accept': 'application/json', 'Content-Type': 'application/json' })
        .send(reqBody)
        .end(function (response) {
            console.log('alita api response: ' + JSON.stringify(response.body));

            var outputTxt = dialogResGen.genResponseTextViaType(reqBody.action, reqBody.type, response);
            res.send(genOutputData(outputTxt));

        });
}

var queryApiRoomBooking = function (reqBody, res, session, contextName) {

    unirest.post(actionConst.alitaApiUrl)
        .headers({ 'Accept': 'application/json', 'Content-Type': 'application/json' })
        .send(reqBody)
        .end(function (response) {
            console.log('alita api response: ' + JSON.stringify(response.body));

            // var outputTxt = dialogResGen.genResponseText(reqBody.action, response);

            if (response.body.data.length == 0) {

                var outouptData = genMeetingRoomOutputContext(session, contextName);
                res.send(genOutputData(outouptData));
            }
            else {
                var outputTxt = dialogResGen.genResponseText(reqBody.action, response);
                res.send(genOutputData(outputTxt));
            }


        });

}

var queryApiRoomCancel = function (reqBody, res, session, contextName) {

    unirest.post(actionConst.alitaApiUrl)
        .headers({ 'Accept': 'application/json', 'Content-Type': 'application/json' })
        .send(reqBody)
        .end(function (response) {
            console.log('alita api response: ' + JSON.stringify(response.body));

            // var outputTxt = dialogResGen.genResponseText(reqBody.action, response);

            if (response.body.data.length == 0) {

                var outouptData = genMeetingRoomOutputContext(session, contextName);
                res.send(genOutputData(outouptData));
            }
            else {
                var outputTxt = dialogResGen.genResponseText(reqBody.action, response);
                res.send(genOutputData(outputTxt));
            }


        });

}

var genRequestBody = function (action, telegramId) {
    var reqBody = {
        action: action,
        telegram_id: telegramId
    };
    return reqBody;
}

var genBillingRequestBody = function (action, telegramId, fileType) {
    var reqBody = {
        action: action,
        telegram_id: telegramId,
        file_type: fileType
    };
    return reqBody;
}

var genRequestBody = function (action, telegramId, type, sDate, eDate) {
    var reqBody = {
        action: action,
        telegram_id: telegramId,
        sdate: sDate,
        edate: eDate,
        type: type
    };

    return reqBody;
}

var genRequestBookingConfirmBody = function (action, telegramId, type, sDate, eDate) {
    var reqBody = {
        action: action,
        telegram_id: telegramId,
        sdate: sDate,
        edate: eDate,
        type: type
    };

    return reqBody;
}

var genRequestBookingConfirmBody = function (action, telegramId, type, sDate, eDate) {
    var reqBody = {
        action: action,
        telegram_id: telegramId,
        sdate: sDate,
        edate: eDate,
        type: type,
        tid: telegramId
    };

    return reqBody;
}

var genRequestCheckBookingByUserBody = function (action, telegramId, type, sDate, eDate, tid) {
    var reqBody = {
        action: action,
        telegram_id: telegramId,
        sdate: sDate,
        edate: eDate,
        type: type,
        tid: tid
    };

    return reqBody;
}


var genRequestCancelBody = function (action, telegramId, type, bid) {
    var reqBody = {
        action: action,
        telegram_id: telegramId,
        bid: bid,
        type: type
    };

    return reqBody;
}

var genRequestBody = function (action, telegramId, type, sDate) {
    var reqBody = {
        action: action,
        telegram_id: telegramId,
        sdate: sDate,
        edate: eDate,
        type: type,
        tid: tid
    };

    return reqBody;
}

var genRequestCancelBody = function (action, telegramId, type, bid) {
    var reqBody = {
        action: action,
        telegram_id: telegramId,
        bid: bid,
        type: type
    };

    return reqBody;
}

var genRequestBody = function (action, telegramId, type, sDate) {
    var reqBody = {
        action: action,
        telegram_id: telegramId,
        sdate: sDate,
        type: type
    };

    return reqBody;
}

var getApiUseTimeFormat = function (dfReq, isFollow) {
    var dateTime;
    if (!isFollow) {
        dateTime = dfReq.body.queryResult.parameters.date_time;
    } else {
        dateTime = dfReq.body.queryResult.outputContexts[0].parameters.date_time;
    }
    if (dateTime.date_time != null && dateTime.date_time != "") {
        var dateTime = dateTime.date_time;
    }

    var date = dateTime.split("T")[0];
    var useTime = dateTime.split("T")[1].split("+")[0];

    return date + " " + useTime;
}

var getApiUseEndTimeFormat = function (dfReq, isFollow) {

    // var times = timeStart.split(" ")[1].split(":");

    // return timeStart.split(" ")[0]+" "+(parseInt(times[0])+1)+":"+times[1]+":"+times[2];

    if (!isFollow) {
        dateTime = dfReq.body.queryResult.parameters.date_time;
    } else {
        dateTime = dfReq.body.queryResult.outputContexts[0].parameters.date_time;
    }

    if (dateTime.date_time != null && dateTime.date_time != "") {
        var dateTime = dateTime.date_time;
    }

    var startDateString = getApiUseTimeFormatString(dateTime)
    let formateStyle = "yyyy-mm-dd hh:ii:ss";
    var startDate = startDateString.toDate(formateStyle);
    var endDate = new Date(startDate.setHours(startDate.getHours() + 1));
    var isoDateString = endDate.toISOString();
    let endTimeString = getApiUseTimeFormatString(isoDateString).split(".")[0];
    // var d = new Date(dateTime);
    // var newDate = d.toISOString();
    // var result = newDate.split("T")[0]+" "+newDate.split("T")[1].split(".")[0];

    console.log("end time: " + endTimeString);
    return endTimeString;
}

var getApiUseTimeFormatString = function (time) {
    var date = time.split("T")[0];
    var useTime = time.split("T")[1].split("+")[0];

    return date + " " + useTime;
}

// var getApiUseEndTimeFormat = function (time) {
//     var startDateString = getApiUseTimeFormat(time)

//     let formateStyle = "yyyy-mm-dd hh:ii:ss";
//     var startDate = startDateString.toDate(formateStyle);
//     var endDate = new Date(startDate.setHours(startDate.getHours() + 1));

//     console.log(endDate)
//     var isoDateString = endDate.toISOString();
//     return getApiUseTimeFormat(isoDateString).split(".")[0];
// }

String.prototype.toDate = function (format) {
    var normalized = this.replace(/[^a-zA-Z0-9]/g, '-');
    var normalizedFormat = format.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
    var formatItems = normalizedFormat.split('-');
    var dateItems = normalized.split('-');

    var monthIndex = formatItems.indexOf("mm");
    var dayIndex = formatItems.indexOf("dd");
    var yearIndex = formatItems.indexOf("yyyy");
    var hourIndex = formatItems.indexOf("hh");
    var minutesIndex = formatItems.indexOf("ii");
    var secondsIndex = formatItems.indexOf("ss");

    var today = new Date();

    var year = yearIndex > -1 ? dateItems[yearIndex] : today.getFullYear();
    var month = monthIndex > -1 ? dateItems[monthIndex] - 1 : today.getMonth() - 1;
    var day = dayIndex > -1 ? dateItems[dayIndex] : today.getDate();

    var hour = hourIndex > -1 ? dateItems[hourIndex] : today.getHours();
    var minute = minutesIndex > -1 ? dateItems[minutesIndex] : today.getMinutes();
    var second = secondsIndex > -1 ? dateItems[secondsIndex] : today.getSeconds();

    return new Date(year, month, day, hour, minute, second);
}

server.use(timeout(5000));
server.use(haltOnTimedout);

function haltOnTimedout(req, res, next) {
    if (!req.timedout) next();
}

server.listen(port, function () {
    console.log("Server is up and running...");
});