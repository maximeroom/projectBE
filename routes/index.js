var express=require('express');
var router=express.Router();

var User=require('../data/models/user');
var UsersRepo=require('../data/models/usersRepo');

router.get('/',function(req,res){
    if(req.session.signedin=="true"){
        res.redirect('/profile');
    }else{
        res.render('index');
    }
});

router.get('/register',function(req,res){
    res.render('register');
});

router.get('/signout',function(req,res){
    req.session.destroy();
    res.redirect('/');
});

router.post('/signin',function(req,res){
    var nn=req.body.nickname;
    var pw=req.body.password;
    UsersRepo.findUserByNickname(nn,function(error, data){
       if(error){
            console.log(error.message);
       } else{
           if(data!=null && data.password==pw){
               req.session.signedin="true";
               req.session.nickname=nn;
               req.session.user_id=data._id;
               res.redirect('/profile');
           }else{
               res.render('index',{
                   'error': 'Wrong credentials'
               });
           }
       }
    });
});

router.post('/signup',function(req,res){
    var nn=req.body.nickname;
    var pw=req.body.password;
    var error="";
    if(nn.length<8 || nn.length>20){
        error+="Nickname has to be between 5 and 20 characters<br />";
    }
    if(pw.length<8 || pw.length>20){
        error+="Password has to be between 8 and 20 characters<br />";
    }
    if(error==""){
        UsersRepo.findUserByNickname(nn,function(err, data){
           if(err){
               console.log(err.message);
           } else{
               if(data==null){
                   UsersRepo.createUser(nn,pw,function(err){
                       if(err){
                           console.log(err.message);
                           error+="An error has occurred. Please try again later";
                           res.render('register',{
                               'error': error
                           });
                       }else{
                           res.render('index',{
                               'success': 'Your account has been registered. You can now sign in'
                           });
                       }
                   })
               }else{
                   error+="That nickname is already used. Please pick another";
                   res.render('register',{
                       'error': error
                   });
               }
           }
        });
    }else{
        res.render('register',{
            'error': error
        });
    }


});

module.exports= router;