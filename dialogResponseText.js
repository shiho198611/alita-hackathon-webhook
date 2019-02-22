
exports.genResponseText = function (action, alitaRes) {

    var outputTxt = '';

    if (action === 'ta') {
        if (alitaRes.body.data.length === 0) {
            outputTxt = "查無此人";
        } else {
            outputTxt = "2019 旅遊補助剩餘：" + alitaRes.body.data[0].balance;
        }
    }
    else if (action == 'all_action') {
        var data = alitaRes.body.data;
        var keys = [];
        for (var k in data) {
            keys.push(k);
        }

        for (var i = 0; i < keys.length; i++) {
            outputTxt = outputTxt + data[keys[i]] + "\n";
        }
    }
    else if (action == 'df') {
        outputTxt = "請款單連結如下：" + "\n" + alitaRes.body.url;
    }
    else if (action == 'mr') {
        if (alitaRes.body.data.length == 0) {
            outputTxt = "目前還沒人預定";
        }
        else {
            var resData = alitaRes.body.data;
            for (var i = 0; i < resData.length; i++) {
                outputTxt = outputTxt + resData[i].name + " " + resData[i].room_name + " " + resData[i].start_time + "~" + resData[i].end_time + "\n";
            }
        }
    }

    return outputTxt;
};

exports.genResponseTextViaType = function (action, type, alitaRes) {

    var outputTxt = '';

    if (action == 'mr') {
        if (type == 'b' || type == 'r') {
            // if(alitaRes.message == 'Success.') {
            //     outputTxt = "預定成功";
            // }
            outputTxt = alitaRes.body.message;
        }
    }

    console.log("genResponseTextViaType: " + outputTxt);

    return outputTxt;
}