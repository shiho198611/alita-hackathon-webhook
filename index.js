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

    if(getIntent == actionConst.actionTravelAllowance) {
        queryApi('ta', 'david.huang@skylinetw.com', res);
    }
    else if(getIntent == actionConst.actionAlitaAllowanceInit) {
        queryApi('all_action', 'david.huang@skylinetw.com', res);
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

var queryApi = function(action, email, res) {
    var reqBody = {
        action : action,
        email : email
    };

    unirest.post(actionConst.alitaApiUrl)
            .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
            .send(reqBody)
            .end(function (response) {
                console.log('alita api response: '+JSON.stringify(response.body));

                var outputTxt = dialogResGen.genResponseText(action, response);
                res.send(genOutputData(outputTxt));

            });

}

server.use(timeout(5000));
server.use(haltOnTimedout);

function haltOnTimedout(req, res, next){
    if (!req.timedout) next();
}

server.listen(port, function () {
    console.log("Server is up and running...");
});