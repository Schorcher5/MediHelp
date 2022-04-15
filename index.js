const express = require("express");
const mongoose = require("mongoose");

const app = express();

const hidden = require("./hidden");
const mongoDBURL = hidden.mongoDBURL;

// Connects to the mongodb cloud database using a hidden url.
mongoose.connect(mongoDBURL, {useNewUrlParser:true, useUnifiedTopology: true})
	.then(result => app.listen(3000, () => console.log("Server is running")))
	.catch(err => console.log(err));

// Sets up the view engine which in this case is the ejs or embedded javascipt engine
app.set("view engine","ejs");

// Some middleware to handle the file location and data collection
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));

// To redirect / request to the home page

app.get("/", (req,res) =>{
	res.redirect("/home");
});

app.get("/home", (req,res) => {
	res.render("index", {title: 'Home'});
});

app.get("/log-in", (req,res) => {
	res.render("log-in", {title: 'log-in'});
});



//If user fails to enter a real page address, then the request falls to this method where a 404 error is produced
app.use((req,res) => {
	res.status(404).render("404",{title:"404"});
})
