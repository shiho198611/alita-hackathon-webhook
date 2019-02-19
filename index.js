'use strict';

const express = require('express');
const http = require('https');
const bodyParser = require('body-parser');

var port = process.env.PORT || 8080;

const server = express();

server.use(bodyParser.json());

server.get('/getName',function (req,res){
    res.send('Swarup Bam');
});

server.post('/actalita', function(req, res) {
    console.log('Act webhook test');
    console.log('request response id: '+req.responseId);
    
    console.log('Req: '+req);
    console.log('Res: '+res);

    console.log('Req body: '+JSON.stringify(req.body));
    console.log('Res body: '+JSON.stringify(res.body));
    console.log('Get Act intent name: '+req.body.queryResult.intent.name);
});

server.listen(port, function () {
    console.log("Server is up and running...");
});