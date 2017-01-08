var express=require('express');
var router=express.Router();

var User=require('../data/models/user');
var UsersRepo=require('../data/models/usersRepo');
var SkinsRepo=require('../data/models/skinsRepo');

router.get('/',function(req,res){
   if(req.session.signedin=="true"){
       UsersRepo.rankByNickname(req.session.nickname,function(err,data){
           if(err){
               console.log(err.message);
           }else{
               console.log(data);
               res.render('profile/index',data);
           }
       });
   }else{
       res.redirect('/');
   }


});

router.get('/ranking',function(req,res){
    if(req.session.signedin=="true"){
        UsersRepo.getAllusers(function(err,data){
            if(err){
                console.log(err.message);
            }else{
                res.render('profile/ranking',{
                    'users': data,
                    'nn': req.session.nickname
                });
            }
        });
    }else{
        res.redirect('/');
    }


});

router.get('/skins',function(req,res){
    if(req.session.signedin=="true"){
        UsersRepo.findUserByNickname(req.session.nickname,function(err,userdata){
            if(err){
                console.log(err.message);
            }else{
                SkinsRepo.getAllSkins(function(err,skinsdata){
                    if(err){
                        console.log(err.message);
                    }else{
                        res.render('profile/skins',{
                            'user' : userdata,
                            'skins' : skinsdata
                        });
                    }
                });
            }
        });
    }else{
        res.redirect('/');
    }
});

router.get('/skinupdate',function(req,res){
    if(req.session.signedin=="true"){
        UsersRepo.findUserByNickname(req.session.nickname,function(err,userdata){
            if(err){
                console.log(err.message);
            }else{
                SkinsRepo.getSkinByID(req.query.id, function(err,skin){
                    if(err){
                        console.log(err.message);
                    }else{
                        if(skin!=null && skin.points<=userdata.points){
                            UsersRepo.updateSkinId(req.session.user_id,skin._id,function(error){
                                if(error){
                                    console.log(error.message);
                                }else{
                                    res.redirect('/profile/skins');
                                }
                            });
                        }else{
                            res.redirect('/profile/skins');
                        }
                    }
                });
            }
        });
    }else{
        res.redirect('/');
    }
});

module.exports= router;
