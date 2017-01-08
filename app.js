"use strict";
var express=require('express');
var socketio= require('socket.io');
var http=require('http');
var path=require('path');
var bodyParser=require('body-parser');
var cookieParser=require('cookie-parser');
var mongoose=require('mongoose');
var fs=require('fs');
var routes=require('./routes/index');
var profile=require('./routes/profile');
var game=require('./routes/game');
var DBService=require('./data/connectDBService');

var connectDB =  DBService ('mongodb://localhost/project',require('mongoose') );
var session = require("express-session")({
    secret: "blabla",
    resave: true,
    saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");
var app=express();
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(session);

app.use(express.static(path.join(__dirname,"public")));
app.use('/', routes);
app.use('/profile', profile);
app.use('/game', game);


var server=http.Server(app);
var io=socketio(server);
io.use(sharedsession(session,{
    autoSave:true
}));
server.listen(8080, function(err){
    console.log('running server on port 8080');
});



var socketqueue=[];

io.on('connection', function(socket){
    console.log('new connectione  made. Nickname: '+socket.handshake.session.nickname);
    if(socketqueue.length==0){
        socketqueue.push(socket);
        socket.emit('queued');
    }else{
        let socket2=socketqueue.pop();
        let socket1ready=false;
        let socket2ready=false;
        console.log("want to start");
        socket.on("ready",function(){
            if(socket2ready==true){
                startgame(socket,socket2);
            }
            socket1ready=true;
        });
        socket2.on("ready",function(){
            if(socket1ready==true){
                startgame(socket,socket2);
            }
            socket2ready=true
        });
        socket.emit('teamed');
        socket2.emit('teamed');
    }
});



function startgame(socket1, socket2){
    console.log("game started");
    var paused=true;
    var game={
        puckX:400,
        puckY:400,
        puckSpeed:0,
        puckDeltaX:0,
        puckDeltaY:0,
        pusher1X:400,
        pusher2X:400,
        pusher1Y:200,
        pusher2Y:600,
        points1:0,
        points2:0
    };
    function startCountdown(){
        socket1.emit('startcountdown',{
            text: "3"
        });
        socket2.emit('startcountdown',{
            text: "3"
        });
    }
    function updateCountdown1(){
        socket1.emit('countdownupdate',{
            text: "2"
        });
        socket2.emit('countdownupdate',{
            text: "2"
        });
    }
    function updateCountdown2(){
        socket1.emit('countdownupdate',{
            text: "1"
        });
        socket2.emit('countdownupdate',{
            text: "1"
        });
    }
    function finalCountdown(){
        socket1.emit('countdownfinal',{
            text: "Go"
        });
        socket2.emit('countdownfinal',{
            text: "Go"
        });
        gametick();
    }
    function fullCountdown(){
        startCountdown();
        setTimeout(function(){updateCountdown1();},1000);
        setTimeout(function(){updateCountdown2();},2000);
        setTimeout(function(){finalCountdown();},3000);
    }
    function initializeGame(){
        socket1.emit('preparedata',{
            game:game,
            player:1
        });
        socket2.emit('preparedata',{
            game:game,
            player:2
        });
    }
    initializeGame();
    fullCountdown();
        

    socket1.on('locationupdate',function(data){
        game.pusher1X=data.mousePos.x;
        game.pusher1Y=data.mousePos.y;
    });
    socket2.on('locationupdate',function(data){
        game.pusher2X=data.mousePos.x;
        game.pusher2Y=data.mousePos.y;
    });
    socket1.on('puckwallcollision', function(data){
        puckwallcollision(data.bound);
    });
    socket2.on('puckwallcollision', function(data){
        puckwallcollision(data.bound);
    });
    socket1.on('pusherpuckcollision', function(data){
        pusherpuckcollision(1,data.deltaX,data.deltaY,data.nospeed);
    });
    socket2.on('pusherpuckcollision', function(data){
        pusherpuckcollision(2,data.deltaX,data.deltaY,data.nospeed);
    });
    function puckwallcollision(bound){
        if(bound=="left"){
            game.puckDeltaX=game.puckDeltaX*(-1)
        }
        if(bound=="right"){
            game.puckDeltaX=game.puckDeltaX*(-1)
        }
        if(bound=="upper"){
            game.puckDeltaY=game.puckDeltaY*(-1)
        }
        if(bound=="lower"){
            game.puckDeltaY=game.puckDeltaY*(-1)
        }
    }
    function pusherpuckcollision(player, deltaX, deltaY, nospeed){
        let speedserver=Math.abs(game.puckDeltaX)+Math.abs(game.puckDeltaY);
        let speedclient=Math.abs(deltaX)+Math.abs(deltaY);

        if(nospeed || (nospeed==false && speedserver>speedclient)){
            let speedchange=speedserver/speedclient;
            game.puckDeltaX=deltaX*speedchange*1.05;
            game.puckDeltaY=deltaY*speedchange*1.05;

        }else{
            game.puckDeltaX=deltaX*1.05;
            game.puckDeltaY=deltaY*1.05;
            movepuck();
            movepuck();

        }

    }

    function movepuck(){
        game.puckDeltaX=game.puckDeltaX*.99;
        game.puckDeltaY=game.puckDeltaY*.99;
        game.puckY=game.puckY+game.puckDeltaY;
        game.puckX=game.puckX+game.puckDeltaX;
    }
    
    function gametick(){
        if(!paused){
            movepuck();


            socket1.emit('gameupdate',{
                game: game
            });
            socket2.emit('gameupdate',{
                game: game
            });
            if(!paused){
                setTimeout(function(){gametick();},10);
            }
        }
    }
    function pause(){
        paused=true
    }
    function resume(){
        paused=false;
        gametick();
    }
}