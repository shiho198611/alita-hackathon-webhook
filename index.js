'use strict';

const express = require('express');
const http = require('https');
const bodyParser = require('body-parser');
const unirest = require('unirest');

var port = process.env.PORT || 8080;
var timeout = require('connect-timeout');

const alitaApiUrl = 'https://protected-lowlands-62741.herokuapp.com/api/alita';

const server = express();
const mRequest = require('request');

var dialogFlowRes;

server.use(bodyParser.json());

server.get('/getName',function (req,res){
    res.send('Swarup Bam');
});

server.post('/actalita', function(req, res) {

    console.log('Dialogflow request body: '+JSON.stringify(req.body));

    var getIntent = req.body.queryResult.intent.displayName;
    var outputData;

    if(getIntent == 'alita_webhook_test') {
        res.setHeader('Content-Type', 'application/json');
        outputData = {
            fulfillmentText: 'This is WebHook response via heroku.'
        };
        res.send(outputData);
    }
    else if(getIntent == 'alita_travel_allowance') {
        
        dialogFlowRes = res;

        var reqBody = {
            action : 'ta',
            email : 'david.huang@skylinetw.com'
        };

        var promise = new Promise((resolve, reject) => {
            unirest.post(alitaApiUrl)
            .headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
            .send(reqBody)
            .end(function (response) {
                console.log('alita api response: '+JSON.stringify(response.body));

                outputTxt = "旅遊補助有"+response.body.employee.balance;
                res.send(genOutputData(outputTxt));

                resolve(response);
            });
        });

    }
    else {
        var outputTxt = "Sorry, I don't know what you say.";
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

server.use(timeout(5000));
server.use(haltOnTimedout);

function haltOnTimedout(req, res, next){
    if (!req.timedout) next();
}


server.listen(port, function () {
    console.log("Server is up and running...");
});