
require('dotenv').config();
// port for app to listen to events
const port = process.env.PORT || 3000;

//define the express server
const express = require("express");

//define the parser for events and information from HTML body
const bodyParser = require("body-parser");
//define the ejs template
const ejs = require("ejs");

//define the mongoose ORM for MongoDB
const mongoose = require("mongoose");

//define the encryption engine
// const encrypt = require("mongoose-encryption");

//define hash algorithm
const md5 = require("md5");

//instantiate the express app
const app = express();

//define usage of bcrypt
const bcrypt = require("bcrypt");

//define number of salt rounds to use
const saltRounds = 10;
//set the ejs template views
app.set('view engine', 'ejs');

// set the path for ejs templates
app.use(express.static("public"));

//for utf8 based parsing
app.use(bodyParser.urlencoded({extended:true}));

//connect to the cloud version of MongoDB atlas
mongoose.connect("mongodb+srv://admin-kumargn:Gnk69%40Jay73@cluster0.vpzxn.mongodb.net/userDB");

//define the schema for the DB
const userSchema = new mongoose.Schema({
	email: String,
	password: String
});

//creating the encryption string and setting the encryption for selected field
// const secret = process.env.SECRET;

// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });
//define the new model for creating and using the mongoDB collections
const User = mongoose.model("User",userSchema);


//define the HTTP GET HOME Route for the server
app.get("/",function(req,res){
	res.render("home");
});

//define the HTTP GET LOGIN  Route for the server
app.get("/login",function(req,res){
	res.render("login");
});

//define the HTTP REGISTER route for the server
app.get("/register",function(req,res){
	res.render("register");
});

//define the HTTP POST route for REGISTER
app.post("/register",function(req,res){
	
	bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    // Store hash in your password DB.
	
	const newUser = new User({
		email: req.body.username,
		password: hash
	});
	newUser.save(function(err){
		if(!err){
			console.log("Username and Password saved!");
			res.render("secrets");
		}else{
			console.log(err);
		}
	});	
});
	
	
});

//define the HTTP POST for LOGIN
app.post("/login",function(req,res){
	// const username = req.body.username;
	// const password = req.body.password;
	User.findOne({email:req.body.username},function(err,foundUser){
		if(err){
			console.log(err);
			// res.render("user not found" + err);
		}else{
			if(foundUser){
				
				bcrypt.compare(req.body.password, foundUser.password, function(err,result){
				if(result === true){
					res.render("secrets");
				}
			 });
			}
			
		}
	});
	
});
//start the server and listen to the events on the defined PORT
app.listen(port, function(err){
	if(!err){
		console.log("Server succesfully starter on : "+ port);
		
	}
	else{
		console.log(err);
	}
	
});