const unirest = require('unirest');
const actionConst = require('./actionConst');

exports.meetingRoomSearchViaDate = function(teleId, dfReq, dfRes) {

    var date = getApiUseTimeFormat(dfReq);

    var body = {
        telegram_id: teleId,
        type: 'ck',
        action: 'mr',
        sdate: date+" 00:00:00",
        edate: date+" 24:00:00"
    };

    queryApi(body, dfRes);
};

var queryApi = function(reqBody, dfRes) {
    unirest.post(actionConst.alitaApiUrl)
            .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
            .send(reqBody)
            .end(function (response) {
                console.log('alita api response: '+JSON.stringify(response.body));

                // var outputTxt = dialogResGen.genResponseText(reqBody.action, response);
                // res.send(genOutputData(outputTxt));
                
                var datas = response.body.data;
                var outputTxt = '預訂情況如下:'+"\n";

                if(datas.length == 0) {
                    outputTxt = '目前無人預定';
                }
                else {
                    for(var i=0;i<datas.length;i++) {
                        outputTxt = outputTxt+datas[i].name+" "+datas[i].room_name+" "+datas[i].start_time+" "+datas[i].end_time+"\n";
                    }
                }
                console.log('yoyoyoyoyoyowtf: '+JSON.stringify(response.body));
                dfRes.send(genOutputData(outputTxt));

            });
}

// var getApiUseTimeFormat = function(time) {
//     var date = time.split("T")[0];
//     return date;
// }

var getApiUseTimeFormat = function(dfReq) {
    var dateTime = dfReq.body.queryResult.parameters.date_time;
    if(dateTime.date_time != null && dateTime.date_time != "") {
        var dateTime = dateTime.date_time;        
    }
    
    var date = dateTime.split("T")[0];
    // var useTime = dateTime.split("T")[1].split("+")[0];

    return date;
}

var genOutputData = function (outputTxt) {
    var outputData = {
        fulfillmentText: outputTxt
    };
    return outputData;
};