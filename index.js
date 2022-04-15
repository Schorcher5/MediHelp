const express = require("express");
const mongoose = require("mongoose");

const app = express();

const hidden = require("./hidden");
const mongoDBURL = hidden.mongoDBURL;

mongoose.connect(mongoDBURL, {useNewUrlParser:true, useUnifiedTopology: true})
	.then(result => app.listen(3000, () => console.log("Server is running")))
	.catch(err => console.log(err));

app.set("view engine","ejs");
