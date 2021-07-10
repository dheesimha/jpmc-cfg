require("dotenv").config();
const port = 3000;
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const passport = require("passport")
const session = require("express-session")
const passportLocalMongoose = require("passport-local-mongoose")
const LocalStrategy = require('passport-local').Strategy;
//MongoDb atlas : mongodb+srv://:<password>@cluster0.sgdbp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority


const app = express();


app.use(express.static("public"));

app.set("view engine", "ejs");

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
}))


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rrc0r.mongodb.net/cfg99?retryWrites=true&w=majority`


mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

    .then(() => {
        console.log("Connected to the cloud");
    })

    .catch((err) => {
        console.log(err);
    })



app.get("/", (req, res) => {
    res.send("<h1>Hello world</h1>")
})
app.listen(port, () => {
    console.log("Server started on port 3000");
});
