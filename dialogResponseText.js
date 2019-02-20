
exports.genResponseText = function(action, alitaRes) {

    var outputTxt = '';

    if(action == 'ta') {
        outputTxt = "旅遊補助有"+alitaRes.body.employee.balance;
    }
    else if(action == 'all_action') {
        var data = alitaRes.body.data;
        var keys = [];
        for(var k in data) {
            keys.push(k);
        }
        
        for(var i=0;i<keys.length;i++) {
            outputTxt = outputTxt + data[keys[i]] + "\n";
        }
    }
    else if(action == 'bls') {
        outputTxt = "請款單連結如下："+"\n"+alitaRes.body.url;
    }

    return outputTxt;
};