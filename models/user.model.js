const mongoose = require('mongoose');

const userSchema =new mongoose.Schema({
    
    _id:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true,
        min: 6
    },
    email:{
        type:String,
        required:true,
        min: 6,
        max: 255
    },
    phone_number:{
        type:String,
        required:true,
        min: 8,
        max: 12
    },
    password:{
        type:String,
        required:true,
        min: 6,
        max: 1024
    },
    date:{
        type:Date,
        default:Date.now
    }
        

})




module.exports = mongoose.model('User', userSchema);