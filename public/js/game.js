console.log("game.js started");

//<editor-fold desc="socket.io">
var socket=io('http://localhost:8080');
socket.on("queued",function(){
    console.log("queued. Waiting for another player.");
});
socket.on("teamed",function(){
    console.log("teamed. A partner has been found.");
    teamed();
});
socket.on("preparedata",function(data){
    console.log("preparing data");
    preparedata(data)
});
socket.on("startcountdown",function(data){
    console.log("Start countdown: "+data.text);
    startCountdown(data.text);
});
socket.on("countdownupdate",function(data){
    console.log("countdown update: "+data.text);
    countdownUpdate(data.text);
});
socket.on("countdownfinal",function(data){
    console.log("countdown update: "+data.text);
    countdownFinal(data.text);
});

socket.on("gameupdate",function(data){
    gameupdateincomming(data);
});

function sendpuckwallcollision(bound){
    socket.emit("puckwallcollision",{
        bound: bound,
    })
}

function sendpusherpuckcollision(deltaX, deltaY, nospeed){
    socket.emit("pusherpuckcollision",{
        deltaX: deltaX,
        deltaY: deltaY,
        nospeed:nospeed
    })
}

//</editor-fold>

//<editor-fold desc="modulevars">
var c = document.getElementById("gamecanvas");
var textoverlay;
var ctx=c.getContext("2d");
var cwidth=800;
var cheight=800;
var interval;
var mousePos= {
    x: 0,
    y: 0
};
var opponentPos={
    x:0,
    y:0
};
var pusherradius=50;
var puckradius=40;
var pusherimg= new Image();
var puckimg=new Image();
var game;
var resetgame;
var player;

var lowerbound;
var upperbound;
var leftbound;
var rightbound;
var leftboundlimiter=0;
var rightboundlimiter=0;
var upperboundlimiter=0;
var lowerboundlimiter=0;
var pucklowerbound;
var puckupperbound;
var puckleftbound;
var puckrightbound;
var lenghtpusherpuck;
var positionHistory=new Array();
var puckXPrev;
var puckYPrev;


//</editor-fold>

//<editor-fold desc="drawing functions">
function drawMyPusher(){
    ctx.drawImage(pusherimg,mousePos.x-pusherradius,mousePos.y-pusherradius,pusherradius*2,pusherradius*2);
}
function drawOpponentPusher(){
    ctx.drawImage(pusherimg,opponentPos.x-pusherradius,opponentPos.y-pusherradius,pusherradius*2,pusherradius*2);
}
function drawPuck(){
    ctx.drawImage(puckimg,game.puckX-puckradius,game.puckY-puckradius,puckradius*2,puckradius*2);
}
function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    drawMyPusher();
    drawOpponentPusher();
    drawPuck();
}
//</editor-fold>

//<editor-fold desc="init">
textoverlay=document.getElementById("textoverlay");
pusherimg.src="/assets/img/pusher_11.png";
puckimg.src="/assets/img/puck.png";
pusherimg.onload=function(){
    drawMyPusher();
}
//</editor-fold>

//<editor-fold desc="helper functions">
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
}
//</editor-fold>

//<editor-fold desc="eventlisteners">

function eventFunction(evt){
    mousePos = getMousePos(c, evt);
    console.log(mousePos.x);
}
//</editor-fold>

//<editor-fold desc="main functions">

function teamed(){
    socket.emit('ready');
}

function start(){
    c.addEventListener('mousemove', eventFunction);
    interval=setInterval(gametick, 10);
}
function stop(){
    clearInterval(interval);
    c.removeEventListener('mousemove',eventFunction);
}

function pause(){
    stop();
    game=resetgame;
    if(player==2){
        mousePos.x=game.pusher2X;
        mousePos.y=game.pusher2Y;
    }else{
        mousePos.x=game.pusher1X;
        mousePos.y=game.pusher1Y;
    }
    if(player==1){
        opponentPos.x=game.pusher2X;
        opponentPos.y=game.pusher2Y;
    }else{
        opponentPos.x=game.pusher1X;
        opponentPos.y=game.pusher1Y;
    }
    draw();

}
function preparedata(data){
    player=data.player;
    game=data.game;
    resetgame=data.game;

    //setting bounds for own pusher wall detection
    leftbound=pusherradius;
    rightbound=cwidth-pusherradius;
    if(player==1){
        upperbound=pusherradius;
        lowerbound=(cheight/2)-pusherradius;
    }else{
        upperbound=(cheight/2)+pusherradius;
        lowerbound=cheight-pusherradius;
    }

    //setting bounds for puck wall detection
    puckleftbound=puckradius;
    puckrightbound=cwidth-puckradius;
    puckupperbound=puckradius;
    pucklowerbound=cheight-puckradius;
}
function startCountdown(text){

    countdownUpdate(text);

    if(player==2){
        mousePos.x=game.pusher2X;
        mousePos.y=game.pusher2Y;
    }else{
        mousePos.x=game.pusher1X;
        mousePos.y=game.pusher1Y;
    }
    if(player==1){
        opponentPos.x=game.pusher2X;
        opponentPos.y=game.pusher2Y;
    }else{
        opponentPos.x=game.pusher1X;
        opponentPos.y=game.pusher1Y;
    }
    draw();
}
function countdownFinal(text){
    countdownUpdate(text);
    setTimeout(function(){countdownUpdate("")},1000);
    start();
}
function countdownUpdate(text){
    textoverlay.innerHTML=text;
}

function gametick(){

    //walldetection for own pusher
    if(mousePos.y<upperbound){
        mousePos.y=upperbound;
    }else if(mousePos.y>lowerbound){
        mousePos.y=lowerbound;
    }
    if(mousePos.x<leftbound){
        mousePos.x=leftbound;
    }else if(mousePos.x>rightbound){
        mousePos.x=rightbound;
    }

    //fill history
    positionHistory.unshift(mousePos);

    if(positionHistory.length>10){
        positionHistory.pop();
    }

    //walldetection for puck
    if(player==1){
        if(game.puckDeltaX<0 && game.puckX<puckleftbound){
            if(leftboundlimiter<1){
                console.log("puck collision with left bound");
                sendpuckwallcollision("left");
                leftboundlimiter=3;
            }
        }
        if(game.puckDeltaY>0 && game.puckY>pucklowerbound){
            if(lowerboundlimiter<1){
                console.log("puck collision with lower bound");
                sendpuckwallcollision("lower");
                lowerboundlimiter=3;
            }
        }
        leftboundlimiter--;
        lowerboundlimiter--;
    }else{
        if(game.puckDeltaX>0 && game.puckX>puckrightbound){
            if(rightboundlimiter<1){
                console.log("puck collision with right bound");
                sendpuckwallcollision("right");
                rightboundlimiter=3;
            }
        }
        if(game.puckDeltaY<0 && game.puckY<puckupperbound){
            if(upperboundlimiter<1){
                console.log("puck collision with upper bound");
                sendpuckwallcollision("upper");
                upperboundlimiter=3;
            }
        }
        rightboundlimiter--;
        upperboundlimiter--;
    }

    //collisiondetection own pusher with puck
    if(Math.pow(mousePos.x-game.puckX,2)+Math.pow(mousePos.y-game.puckY,2)<=(Math.pow((puckradius+pusherradius),2))){

        var posprevious=positionHistory[1];
        var posprevious1=positionHistory[0];
        var width=Math.abs(mousePos.x-posprevious.x);
        var height=Math.abs(mousePos.y-posprevious.y);
        var distance=Math.sqrt(Math.pow(width,2)+Math.pow(height,2));
        var deltaX=game.puckX - posprevious1.x;
        var deltaY=game.puckY - posprevious1.y;
        var sum=Math.abs(deltaX)+Math.abs(deltaY);
        if(distance==0){
            sendpusherpuckcollision(deltaX,deltaY,true);
            
        }else{
            deltaX=(deltaX/sum)*(distance/2);
            deltaY=(deltaY/sum)*(distance/2);
            sendpusherpuckcollision(deltaX, deltaY, false);
        }

        console.log("collision with own pusher and puck, deltaX="+deltaX+" deltaY="+deltaY);
    }



    socket.emit("locationupdate",{
        mousePos: mousePos
    });
    draw();
}


function gameupdateincomming(data){
    //console.log(data);
    puckXPrev=game.puckX;
    puckYPrev=game.puckY;
    game=data.game;
    if(player==1){
        opponentPos.x=game.pusher2X;
        opponentPos.y=game.pusher2Y;
    }else{
        opponentPos.x=game.pusher1X;
        opponentPos.y=game.pusher1Y;
    }
}
//</editor-fold>