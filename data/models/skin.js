var mongoose= require("mongoose");
var SkinSchema= require("../schemas/skin");

var Skin= mongoose.model("Skin",SkinSchema,"skins");

module.exports= Skin;
