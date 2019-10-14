const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const dotenv=require('dotenv')

dotenv.config();

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

userSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({_id: user._id}, process.env.JWT_KEY)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}


module.exports = mongoose.model('User', userSchema);