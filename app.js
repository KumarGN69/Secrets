//DEFINE the usage different packages****************************************************************************************************************************//
require('dotenv').config();
// port for app to listen to events
const port = process.env.PORT || 3000;

//for express server
const express = require("express");

//for parsing the information from HTML body
const bodyParser = require("body-parser");
//ejs template
const ejs = require("ejs");

//mongoose ORM for MongoDB
const mongoose = require("mongoose");

//define the encryption engine
// const encrypt = require("mongoose-encryption");

//hash algorithm to be used
const md5 = require("md5");

//instantiate the express app
const app = express();

//define usage of bcrypt
// const bcrypt = require("bcrypt");

//define dependencies for cookies and sessions
const session= require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

//define number of salt rounds to use
// const saltRounds = 10;

// console.log(process.env);
//APP settings ****************************************************************************************************************************//
//ejs template views
app.set('view engine', 'ejs');

// ejs templates
app.use(express.static("public"));

//for utf8 based parsing
app.use(bodyParser.urlencoded({extended:true}));

//define the use of session by the app
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
}));

//use of passport package by  the app
app.use(passport.initialize());
app.use(passport.session());

//DB related configurations and connections ****************************************************************************************************************************//
//connect to the cloud version of MongoDB atlas
mongoose.connect("mongodb+srv://admin-kumargn:Gnk69%40Jay73@cluster0.vpzxn.mongodb.net/userDB");

//define the schema for the DB
const userSchema = new mongoose.Schema({
	username: String,
	password: String,
	googleID: String
});

//adding the passport plugin for the mongoose
userSchema.plugin(passportLocalMongoose, {usernameUnique: false});
userSchema.plugin(findOrCreate);
//creating the encryption string and setting the encryption for selected field
// const secret = process.env.SECRET;

// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });
//define the new model for creating and using the mongoDB collections
const User = mongoose.model("User",userSchema);

//define the use of passport plugin for mongoose in the model
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://secrets-kqndw.run.goorm.io/auth/google/secrets"
  },
  function(accessToken, refreshToken, profile, cb) {
	console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
		console.log(user);
      return cb(err, user);
    });
  }
));
//ROUTE definitions ****************rs************************************************************************************************************//
//define the HTTP GET HOME Route for the server
app.get("/",function(req,res){
	res.render("home");
});

app.get("/auth/google",passport.authenticate('google', { scope: ['profile'], failureRedirect: '/login', failureMessage: true  }));

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
  });

//define the HTTP GET LOGIN  Route for the server
app.get("/login",function(req,res){
	res.render("login");
});

//define the HTTP REGISTER route for the server
app.get("/register",function(req,res){
	res.render("register");
});
//GET route for secrets page
app.get("/secrets",function(req,res){
	//if user is authenticated then render secrets page else redirect to login page
	if(req.isAuthenticated()){
		res.render("secrets");
	}else{
		res.redirect("/login");
	}
});
//POST route for Register page
app.post("/register",function(req,res){
	User.register({username: req.body.username},req.body.password,function(err,user){
		if(err){
			console.log(err);
			res.redirect("/login");
		}else{
			passport.authenticate("local")(req,res, function(){
				res.redirect("/secrets");
			});
		}
	});
});

app.post("/login",function(req,res){
	const newUser = new User({
		username: req.body.username,
		password: req.body.password
	});
	// console.log("new user is "+ newUser);
	req.login(newUser, function(err){
		
		if(err){
			console.log("errorfound 1"+ err);
			
		}else{
			passport.authenticate("local")(req,res, function(){
				res.redirect("/secrets");
			});
		}
	});
});

app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
});

//Start **************commenting out the hashing implementation for Cookies and Sessions ********************
//define the HTTP POST route for REGISTER
// app.post("/register",function(req,res){
	
// 	bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//     // Store hash in your password DB.
	
// 	const newUser = new User({
// 		email: req.body.username,
// 		password: hash
// 	});
// 	newUser.save(function(err){
// 		if(!err){
// 			console.log("Username and Password saved!");
// 			res.render("secrets");
// 		}else{
// 			console.log(err);
// 		}
// 	});	
// });
	
	
// });

//define the HTTP POST for LOGIN
// app.post("/login",function(req,res){
// 	// const username = req.body.username;
// 	// const password = req.body.password;
// 	User.findOne({email:req.body.username},function(err,foundUser){
// 		if(err){
// 			console.log(err);
// 			// res.render("user not found" + err);
// 		}else{
// 			if(foundUser){
				
// 				bcrypt.compare(req.body.password, foundUser.password, function(err,result){
// 				if(result === true){
// 					res.render("secrets");
// 				}
// 			 });
// 			}
			
// 		}
// 	});
	
// });
//End **************commenting out the hashing implementation for Cookies and Sessions ********************


//INIIALIZE server and listen to events ****************************************************************************************************************************//
//start the server and listen to the events on the defined PORT
app.listen(port, function(err){
	if(!err){
		console.log("Server succesfully starter on : "+ port);
		
	}
	else{
		console.log(err);
	}
	
});