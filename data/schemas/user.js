var mongoose = require("mongoose");
var SkinSchema=require("../schemas/skin");

var UserSchema= new mongoose.Schema({
    _id: { type: String },
    nickname: { type: String },
    password: { type: String },
    points: { type: Number },
    skin_id: { type: Number }
});

module.exports = UserSchema;
