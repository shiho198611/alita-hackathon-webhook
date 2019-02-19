
exports.genResponseText = function(action, alitaRes) {

    var outputTxt = '';

    if(action == 'ta') {
        var outputTxt = "旅遊補助有"+alitaRes.body.employee.balance;
    }

    return outputTxt;
};