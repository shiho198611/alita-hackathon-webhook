'use strict';

const express = require('express');
const http = require('https');
const bodyParser = require('body-parser');

const {WebhookClient} = require('dialogflow-fulfillment');


var port = process.env.PORT || 8080;

const server = express();

server.use(bodyParser.json());

server.get('/getName',function (req,res){
    res.send('Swarup Bam');
});

server.post('/actalita', function(req, res) {
    console.log('Act webhook test');

    console.log('Req body: '+JSON.stringify(req.body));
    
    // console.log('Get Act intent name: '+req.body.queryResult.intent.name);

    var getIntent = req.body.queryResult.intent.displayName;
    var outputData;

    if(getIntent == 'alita_webhook_test') {

        res.setHeader('Content-Type', 'application/json');
        outputData = {
            fulfillmentText: 'This is WebHook response via heroku.'
        };

        res.send(outputData);

    }
    else {
        var outputTxt = "Sorry, I don't know what you say.";
        outputData = {
            fulfillmentText: outputTxt
        };

        res.send(outputData);
    }
});

server.listen(port, function () {
    console.log("Server is up and running...");
});