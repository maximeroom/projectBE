var mongoose=require("mongoose");

var SkinsRepo=(function(){
    var Skin= require("./skin");
    
    var getAllSkins= function(callback){
        Skin.find().sort('points').exec(function(error, docs){
           if(error){
               console.log(error.message);
               callback(error,null);
           } else{
               callback(null,docs);
           }
        });
    };
    var getSkinByID= function(skinid, callback){
        Skin.findOne({ _id: skinid }, function (err, doc) {
            if(err){
                console.log(err.message);
                callback(err,null);
            }else{
                callback(null,doc);
            }
        });
    };
    return {
        model: Skin,
        getAllSkins: getAllSkins,
        getSkinByID: getSkinByID
    };
})();

module.exports= SkinsRepo;