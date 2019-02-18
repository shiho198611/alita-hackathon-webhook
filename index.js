'use strict';

const express = require('express');
const http = require('https');
var port = process.env.PORT || 8080;

const server = express();

server.get('/getName',function (req,res){
    res.send('Swarup Bam');
});
