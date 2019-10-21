const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var admin = require('firebase-admin');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const dotenv=require('dotenv').config;

const validator = require('validator')
const dbConfig = require('./config/database.config.js');
const User=require('./models/user.model.js')

// create express app
const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse requests of content-type - application/json
app.use(bodyParser.json())


//init mangoose:
mongoose.Promise = global.Promise;



// Connecting to the database
mongoose.connect(dbConfig.url, {
  useNewUrlParser: true
}).then(() => {
  console.log("Successfully connected to the database");    
}).catch(err => {
  console.log('Could not connect to the database. Exiting now...', err);
  process.exit();
});




//init the firebase auth:
var admin = require("firebase-admin");
var serviceAccount = require("./service-account-key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASEURL
});



app.post('/api/coffeeTEK/register',async(req, res) => {
  
  //add a veridy data from body into firebase auth:
   admin.auth().createUser({
    email: req.body.email,
    emailVerified: false,
    phoneNumber: req.body.phonenumber,
    password: req.body.password,
    displayName: req.body.username,
    disabled: false
  })
    .then(function(userRecord) {

      
      //Hash the password :
      const salt = bcrypt.genSaltSync(10);//or your salt constant
      const password = bcrypt.hashSync(req.body.password, salt);

      //add the model Shema from the body after verify & add into firebase auth :
      const user = new User({
        _id:userRecord.uid,
        email: req.body.email, 
        phone_number:req.body.phonenumber,
        password: password,
        username: req.body.username,
    });




      //save the data in mangodb
      try {
        user.save()
        .then(data => {
         
          //res.status(201).send({ user})
          res.json({"message":"successfully create new user_id: "+ data._id });
       
        })
        
       
    } catch (error) {
        console.log('Error creating new user:', error.message);
        res.json({"message":"Error creating new user: "+ error.message});
    }
  
  

     
    //catch error in firebase auth 
    })
    .catch(function(error) {
      console.log('Error creating new user:', error.message);
      res.json({"message":"Error creating new user: "+ error.message});
    });



});





//define the login route:
app.post('/api/coffeeTEK/login',(req,res)=>{

console.log('Start Login !')

if (!validator.isEmail(req.body.email)) return res.status(422).json({'message': 'Invalid Email address'} )

//Cheking if the email is exists  & display there info:
   user =User.findOne({email:req.body.email}).then(data=>{
    if (!user) return res.status(400).send('Email is worng');
    console.log('Email Found !')
    
    //res.json({"message":"User info",data})
    //console.log("Dsiplay the Info of The User",data)
    
  const userconfidition=bcrypt.compareSync(req.body.password,data.password)
    console.log("userconfidition password",userconfidition)
      if (userconfidition){
        console.log("userconfidition:",userconfidition)
        //Genrate Token :
        const user = this
        const token = jwt.sign({_id: user._id}, process.env.JWT_KEY)
      
          //res.status(201).send({ user, token }) 
          res.json({"message":"successfully Logged in : "+ data._id,token });}
          
      else{ res.json({"message":"Bad request. Password don't match !"})}
 

  })



});





// define a root router
app.get('/api/coffeeTEK/', (req, res) => {
  res.json({"message": "Welcome to CoffeeTEK application."});
});



// listen for requests
app.listen(3100, () => {
    console.log("Server is listening on port 3100");
});