const mongoose = require('mongoose');
const imageSchema = new mongoose.Schema({
    filename: String,
    path: String,
    date: Date,
    filter:String,
    size:Number
});
module.exports = mongoose.model('Image', imageSchema);