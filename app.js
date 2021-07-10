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
const findOrCreate = require("mongoose-findorcreate");



const app = express();


// app.use(express.static("public"));
app.use(express.static(__dirname + '/public'));

app.set("view engine", "ejs");

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
}))

app.use(passport.initialize())

app.use(passport.session())


const uri = `mongodb+srv://${process.env.MONGODB_ADMIN}:${process.env.MONGODB_PASSWORD}@cluster0.sgdbp.mongodb.net/cfg99?retryWrites=true&w=majority`


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

mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },

    email: {
        type: String,

    },

    password: {
        type: String,

    },


});


userSchema.plugin(passportLocalMongoose, {
    usernameField: "username"
});

userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy())


passport.serializeUser(function (user, done) {
    done(null, user);
});


passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


passport.use(new LocalStrategy(
    function (username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            if (!user.authenticate(password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));


app
    .route("/register")
    .get((req, res) => {
        res.render("register");
    })

    .post((req, res) => {

        const username = req.body.username
        const password = req.body.password

        User.register({ username: username, provider: "local" }, password, (err, user) => {
            if (err) {
                console.log(err)
                res.redirect("/register")
            }

            else {
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/login")

                })
            }
        })
    })





// Login route
app
    .route("/login")
    .get((req, res) => {
        res.render("login");
    })
    .post((req, res) => {

        const user = new User({
            username: req.body.username,
            password: req.body.password,
        })

        req.login(user, (err) => {
            if (err) {
                console.log(err)
            }

            else {

                passport.authenticate("local")(req, res, () => {
                    res.redirect("/admin")
                })
            }
        })
    })




app.route("/admin")
    .get((req, res) => {
        if (req.isAuthenticated()) {
            res.render("admin")
        }
        else {
            res.redirect("/login")
        }
    })

app.get("/", (req, res) => {
    res.send("<h1>Hello world</h1>")
})
app.listen(port, () => {
    console.log("Server started on port 3000");
});
