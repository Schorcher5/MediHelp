const express = require("express");
const mongoose = require("mongoose");
const puppeteer = require("puppeteer");

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

// Setting up the web scrapping function

async function scrape(drugName) {
	const browser = await puppeteer.launch({});
	const page = await browser.newPage();

	try {
		await page.goto("https://www.drugs.com/"+drugName+".html");
		const drugUse =  (await page.$x("//*[starts-with(text(),'"+drugName+" is')]"))[0];
		const drugUseText = await (await f.getProperty("textContent")).jsonValue();

		const drugWarnings =  (await page.$x("//*[starts-with(text(),'You should not use')]"))[0];
		const drugWarningsText = await (await f.getProperty("textContent")).jsonValue();

		const drugDosage =  (await page.$x("//*[starts-with(text(),'Use: ')]"))[0];
		const drugDosageText = await (await f.getProperty("textContent")).jsonValue();

		const drugAvoid =  (await page.$x("//*[contains(text(),'Avoid ')]"))[0];
		const drugAvoidText = await (await f.getProperty("textContent")).jsonValue();

		const drugEffects =  (await page.$x("//*[starts-with(text(),'Get emergency medical help ')]"))[0];
		const drugEffectsText = await (await f.getProperty("textContent")).jsonValue();

		const drugInteractions =  (await page.$x("//*[contains(text(),'other drugs')]"))[0];
		const drugInteractionsText = await (await f.getProperty("textContent")).jsonValue();

		const drug = {
			name: drugName,
			use: drugUseText,
			warning: drugWarningsText,
			dosage: drugDosageText,
			avoid: drugAvoidText,
			effects: drugEffectsText,
			interactions: drugInteractionsText};

			browser.close();
			return drug;
	}catch (e){
		console.log(e);
		browser.close();
		return null;
	}

};

// To redirect / request to the home page

app.get("/", (req,res) =>{
	res.redirect("/home");
});

app.get("/home", (req,res) => {
	res.render("index", {title: 'Home'});
});

app.get("/log-in", (req,res) => {
	const formItems = [
		{type: "email", id: "floatingInput", placeholder: "name@example.com", label: "Email address"},
		{type: "password", id: "floatingPassword", placeholder: "Password", label: "Password"},
	];

	res.render("form", {title: 'Log-in', formItems: formItems , formGreeting: "Welcome back"});
});

app.get("/sign-up", (req,res) => {
	const formItems = [
		{type: "text", id: "floatingInput", placeholder: "First name", label: "First Name"},
		{type: "text", id: "floatingInput", placeholder: "Last name", label: "Last Name"},
		{type: "email", id: "floatingInput", placeholder: "name@example.com", label: "Email address"},
		{type: "password", id: "floatingPassword", placeholder: "Password", label: "Password"},
	];

	res.render("form", {title: 'Sign-up', formItems: formItems , formGreeting: "Ready to begin you journey with Medi?"});
});

app.get("/account", (req,res) => {
	res.render("account", {title: 'Account'});
});

//Varbiable to determine whether a search has been made or not
let searched = false;

app.get("/medisearch", (req,res) => {
	res.render("medisearch",{title: "MediSearch", searched: searched});
});

app.post("/medisearch", (req,res) => {

});

app.get("/medibase", (req,res) => {
	const drugItems = [];
	res.render("medibase",{title: "MediSearch", drugItems:drugItems });
});

app.get("/medinotice", (req,res) => {
	const drugItems = [];
	res.render("medinotice",{title: "MediNotice", drugItems: drugItems});
});

//If user fails to enter a real page address, then the request falls to this method where a 404 error is produced
app.use((req,res) => {
	res.status(404).render("404",{title:"404"});
})
