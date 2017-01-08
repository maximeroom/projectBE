var mongoose=require('mongoose');

var SkinSchema = new mongoose.Schema({
    _id: Number,
    title: String,
    points: Number,
    image: String
});

module.exports= SkinSchema;