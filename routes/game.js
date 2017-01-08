var express=require('express');
var router=express.Router();

router.post('/',function(req,res){
   if(req.session.signedin=="true"){
       res.redirect("/game/play");
   } else{
       if(req.body['nickname'].length>4 && req.body['nickname'].length<21){
           req.session.nickname=req.body['nickname'];
           res.redirect("/game/play");
       }else{
           var error='Nickname has to be between 5 and 20 characters';
           res.render('index',{
               error: error
           });
       }
   }
});

router.get('/play',function(req,res){
    if(req.session.signedin=="true" || req.session.nickname != null){
        res.render('game/gamescreen');
    }else{
        res.redirect("/");
    }

});

module.exports= router;
