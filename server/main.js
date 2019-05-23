var database = require("./db/db").db;
var express = require("express");
var crypto = require('crypto');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

function randomValueHex(len) {
    return crypto.randomBytes(Math.ceil(len / 2))
        .toString('hex') // convert to hexadecimal format
        .slice(0, len).toUpperCase(); // return required number of characters
}

async function main() {
    var connectionString = "mongodb://localhost:27017";
    var db = new database();
    await db.connect(connectionString);
    await db.createSchemeCollection();
    await db.createUserCollection();
    var app = express();

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        done(null, user);
    });

    passport.use(new LocalStrategy(
        async function (username, password, done) {
            var user = await db.findUser(username);
            if (!user) return done(null, false);
            if (user.username == username && user.password == password) {
                return done(null, {
                    username,
                    password
                });
            }
            return done(null, false)
        }
    ));

    app.use(session({
        secret: "lolkek123",
        resave: false,
        saveUninitialized: false
    }));
    app.use(express.urlencoded({
        extended: false
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.post('/login',
        passport.authenticate('local', {
            failureRedirect: '/login',
            successRedirect: "/menu"
        }));

    app.use(function (req, res, next) {
        if (req.path == "/signup") {
            next();
            return res.redirect("/login");
        }
        if (req.path == "/login" && req.user != null) {
            return res.redirect("/menu")
        } else if (req.path == "/login" && req.user == null) {
            return next();
        } else if (req.user == null) {
            return res.redirect("/login");
        }
        next();
    });
    app.get('/login', function (req, res) {
        res.sendFile("login.html", {
            root: "../site"
        });
    })

    app.get('/menu', function (req, res) {
        res.sendFile("menu.html", {
            root: "../site"
        });
    })

    app.get('/signup', async function (req, res) {
        var user = await db.findUser(req.query.username);
        if (!user)
            db.createUser(req.query);
    })
    app.get('/', function (req, res) {
        res.sendFile("index.html", {
            root: "../site"
        });
    });

    app.get('/css/*', function (req, res) {
        res.sendFile(req.path, {
            root: "../site"
        });
    });

    app.get('/draw2d/*', function (req, res) {
        res.sendFile(req.path, {
            root: "../site"
        });
    });

    app.get('/script/*', function (req, res) {
        res.sendFile(req.path, {
            root: "../site"
        });
    })

    app.get("/scheme/*", async function (req, res) {
        // var url = req.path.slice(req.path.lastIndexOf("/"));
        var data = await db.findScheme(req.path);
        if (data) {
            if (data.user == req.user.username) {
                return res.send(data);
            }
        }
        res.send("error");
    })

    app.get("/url", function (req, res) {
        res.send(randomValueHex(8));
    })

    app.get("/allSchemes", async function (req, res) {
        var schemes = await db.findAllUserSchemes(req.user.username);
        res.send(schemes);
    });

    app.post("/deleteScheme", async function (req, res) {
        await db.deleteScheme(req.body.url);
        res.end();
    });
    app.get("/username",function (req,res){
        res.send(req.user.username);
    })
    app.get("*", function (req, res) {
        res.sendFile("index.html", {
            root: "../site"
        });
    })

    app.post("/scheme/*", function (req, res) {
        var data = req.body.data;
        db.updateScheme(req.path, {
            user: req.user.username,
            json: data
        });
        res.end();
    })

    app.post("/logout",function(req,res){
        req.logout();
        res.send("OK");
    });

    app.listen(80);


}

main();