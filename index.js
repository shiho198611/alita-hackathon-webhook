'use strict';

const express = require('express');
const http = require('https');
var port = process.env.PORT || 8080;

const server = express();

server.get('/getName',function (req,res){
    res.send('Swarup Bam');
});

server.post('/actalita', function(reqeust, response) {
    console.log('Act webhook test');
    console.log('request response id: '+reqeust.responseId);
    console.log('Req body: '+JSON.stringify(reqeust.body));
    console.log('Res body: '+JSON.stringify(response.body));
    console.log('Get Act intent name: '+reqeust.body.queryResult.intent.name);
});

server.listen(port, function () {
    console.log("Server is up and running...");
});