
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
        
        for(var key in keys) {
            outputTxt  = outputTxt + key + "\n";
        }
    }

    return outputTxt;
};