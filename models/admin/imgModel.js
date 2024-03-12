const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    image:{
        data:Buffer,
        contentType:String
    }
})

module.exports = mongoose.model('images',imageSchema);