var mongoose= require('mongoose');

var UsersRepo=(function(){
    var User=require("./user");

    var getAllUsers = function(callback){
        User.find().sort([['points', 'descending']]).exec(function(err, docs){
            if(err){
                console.log(err);
                callback(err,null);
            }else{
                callback(null, docs);
            }
        });
    };
    var findUserByNickname=function(nickname, callback){
        User.findOne({ nickname: nickname }, function(error, doc){
           if(error){
               console.log(error);
               callback(error, null);
           } else{
               callback(null, doc);
           }
        });
    };
    var rankByNickname=function(nickname, callback){
        User.findOne({ nickname: nickname }, function(error, doc){
            if(error){
                console.log(error);
                callback(error, null);
            } else{
                var mypoints=doc.points;
                User.find({ points: { $gt: mypoints } }).count().exec(function(error, nr){
                    if(error){
                        console.log(error);
                        callback(error,null);
                    }else{
                        var data={
                            nickname: doc.nickname,
                            password: doc.password,
                            points: doc.points,
                            skin_id: doc.skin_id,
                            rank: nr+1
                        };
                        callback(null,data);
                    }
                });

            }
        });
    };
    var createUser=function(nickname, password, callback){
        var user=new User({
            _id: nickname,
            nickname: nickname,
            password: password,
            points: 0,
            skin_id: 0
        });
        user.save(function(err){
            if(err){
                console.log(err.message);
                callback(err)
            }else{
                callback(null);
            }
        });
    };
    var updateSkinId=function(userid, skinid, callback){
        User.update({ _id: userid }, { $set: { skin_id: skinid }}, function(error){
            if(error){
                console.log(error);
                callback(error);
            }else{
                callback(null);
            }
        });
    };
    return {
        model: User,
        getAllusers: getAllUsers,
        findUserByNickname: findUserByNickname,
        rankByNickname: rankByNickname,
        createUser: createUser,
        updateSkinId: updateSkinId
    };

})();

module.exports=UsersRepo;
