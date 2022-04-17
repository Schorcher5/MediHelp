const express = require("express");
const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
const Prescription = require("./models/prescription.js");

const app = express();

const hidden = require("./hidden");
const mongoDBURL = hidden.mongoDBURL;

// Connects to the mongodb cloud database using a hidden url.
mongoose.connect(mongoDBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(result => app.listen(3000, () => console.log("Server is running")))
  .catch(err => console.log(err));

// Sets up the view engine which in this case is the ejs or embedded javascipt engine
app.set("view engine", "ejs");

// Some middleware to handle the file location and data collection
app.use(express.static("public"));
app.use(express.urlencoded({
  extended: true
}));

// Setting up the web scrapping function

async function scrape(drugName) {
  const browser = await puppeteer.launch({});
  const page = await browser.newPage();
  drugName = drugName.trim();
  drugName = drugName.charAt(0).toUpperCase() + drugName.slice(1);
  await page.goto("https://www.drugs.com/" + drugName + ".html");
  const drugUse = (await page.$x("//*[contains(text(),'is an')]"))[0];
  const drugUseText = await (await drugUse.getProperty("textContent")).jsonValue();

  const drugWarnings = (await page.$x("//*[starts-with(text(),'You should not')]"))[0];
  const drugWarningsText = await (await drugWarnings.getProperty("textContent")).jsonValue();

  const drugDosage = (await page.$x("//*[contains(text(),' mg ')]"))[0];
  const drugDosageText = await (await drugDosage.getProperty("textContent")).jsonValue();

  const drugAvoid = (await page.$x("//*[contains(text(),'Avoid ')]"))[0];
  const drugAvoidText = await (await drugAvoid.getProperty("textContent")).jsonValue();

  const drugEffects = (await page.$x("//*[starts-with(text(),'Get emergency medical help ')]"))[0];
  const drugEffectsText = await (await drugEffects.getProperty("textContent")).jsonValue();


  const drug = {
    name: drugName,
    use: drugUseText,
    warning: drugWarningsText,
    dosage: drugDosageText,
    avoid: drugAvoidText,
    effects: drugEffectsText
  };

  browser.close();
  console.log(drug);
  return drug;

};

// To redirect / request to the home page

app.get("/", (req, res) => {
  res.redirect("/home");
});

app.get("/home", (req, res) => {
  res.render("index", {
    title: 'Home'
  });
});

app.get("/log-in", (req, res) => {
  const formItems = [{
      type: "email",
      id: "floatingInput",
      placeholder: "name@example.com",
      label: "Email address"
    },
    {
      type: "password",
      id: "floatingPassword",
      placeholder: "Password",
      label: "Password"
    },
  ];

  res.render("form", {
    title: 'Log-in',
    formItems: formItems,
    formGreeting: "Welcome back"
  });
});

app.get("/sign-up", (req, res) => {
  const formItems = [{
      type: "text",
      id: "floatingInput",
      placeholder: "First name",
      label: "First Name"
    },
    {
      type: "text",
      id: "floatingInput",
      placeholder: "Last name",
      label: "Last Name"
    },
    {
      type: "email",
      id: "floatingInput",
      placeholder: "name@example.com",
      label: "Email address"
    },
    {
      type: "password",
      id: "floatingPassword",
      placeholder: "Password",
      label: "Password"
    },
  ];

  res.render("form", {
    title: 'Sign-up',
    formItems: formItems,
    formGreeting: "Ready to begin you journey with Medi?"
  });
});

app.get("/account", (req, res) => {
  res.render("account", {
    title: 'Account'
  });
});


app.get("/medisearch", (req, res) => {

  res.render("medisearch", {
    title: "MediSearch",
    searched: false
  });

});

//Varbiable to store drug object for later
let searchedDrug = [];
// Methods for searching drugs

app.post("/medisearch", (req, res) => {

  scrape(req.body.search)
    .then((drug) => {
      searchedDrug = drug;
      res.render("medisearch", {
        title: "MediSearch",
        searched: true,
        drug: drug
      });
    })
    .catch((err) => {
      res.status(404).render("404", {
        title: "404"
      });
    })

});

app.get("/medibase", (req, res) => {
  Prescription.find()
    .then((drugItems) => {
			console.log(drugItems);
      res.render("medibase", {
        title: "MediBase",
        drugItems: drugItems
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(404).render("404", {
        title: "404"
      });
    })
});

// Method for adding items to medibase

app.get("/add-prescription", (req, res) => {
  const prescription = new Prescription(searchedDrug);

  prescription.save()
    .then((result) => {
      res.redirect("/medisearch");

    })
    .catch((err) => {
      console.log(err);
      res.redirect("/medisearch");
    })
})

app.get("/medinotice", (req, res) => {
  const drugItems = [];
  res.render("medinotice", {
    title: "MediNotice",
    drugItems: drugItems
  });
});

//If user fails to enter a real page address, then the request falls to this method where a 404 error is produced
app.use((req, res) => {
  res.status(404).render("404", {
    title: "404"
  });
})
