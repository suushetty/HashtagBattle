// This is the index file that manages the routing of the incoming client's get and post requests

var express = require('express');
var router = express.Router();
var requestHandler = require('../server/requestHandler.js');

router.get('/', function (req, res) {
  res.render('index', { title: 'HashtagBattle' });
});

module.exports = router;

router.post('/startBattle', function (req, res) {
    res.send(requestHandler.startBattleRequest(req));
});

router.get('/getHashtagCount', function (req, res) {
    res.send(requestHandler.getHashtagCountRequest(req));
});

router.get('/stopBattle', function (req, res) {
    res.send(requestHandler.stopBattleRequest(req));
});


