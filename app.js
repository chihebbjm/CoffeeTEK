const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var admin = require('firebase-admin');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
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
  databaseURL: "https://coffetek-54473.firebaseio.com"
});



app.post('/api/coffeeTEK/register', (req, res) => {
  
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

      //add the model Shema from the body after verify & add into firebase auth :
      const user = new User({
        _id:userRecord.uid,
        email: req.body.email, 
        phone_number:req.body.phonenumber,
        password: req.body.password,
        username: req.body.username
    });


    //save the data in mangodb
    user.save()
    .then(data => {
      res.json({"message":"successfully create new user_id: "+ data._id});
    }).catch(err => {
        res.status(500).send({
          message: err.message || "Some error occurred while creating New User."
        });
    });
   
     
    //catch error in firebase auth 
    })
    .catch(function(error) {
      console.log('Error creating new user:', error.message);
      res.json({"message":"Error creating new user: "+ error.message});
    });


});





//define the login route:
app.post('/api/coffeeTEK/login',async(req,res)=>{

console.log('Start Login !')

if (!validator.isEmail(req.body.email)) return res.status(422).json({'message': 'Invalid Email address'} )
console.log('Value of emailVrified:'+validator.isEmail(req.body.email));
console.log('Cheking Email Validation is Done !');

//Cheking if the email is exists:
const user =User.findOne({email:req.body.email});
if (!user) return res.status(400).send('Email is worng');
console.log('Email Found !')



//Cheking if the passowrd is exists:
//TODO : this part is not working 
console.log('Password Body :'+req.body.password);
if(req.body.password!=user.password) return res.status(400).send({'message':'Password is worng'})

res.send('Logged in !')


});



// define a root router
app.get('/api/coffeeTEK/', (req, res) => {
  res.json({"message": "Welcome to CoffeeTEK application."});
});



// listen for requests
app.listen(3100, () => {
    console.log("Server is listening on port 3100");
});