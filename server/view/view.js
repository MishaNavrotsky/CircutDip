class view {
    constructor(db, session) {
        this.express = require("express");
        this.db = db;
        this.app = this.express();
        this.session = session;
        this.crypto = require("crypto");
    }

    randomValueHex(len) {
        return this.crypto.randomBytes(Math.ceil(len / 2))
            .toString('hex') // convert to hexadecimal format
            .slice(0, len).toUpperCase(); // return required number of characters
    }

    sessionInitialize() {
        this.session.initializeSession();
        this.app.use(this.session.createSession("lolka1234"));
        this.app.use(this.express.urlencoded({
            extended: false
        }));
        this.app.use(this.session.passportyInitialize());
        this.app.use(this.session.passportSession());
        this.app.post('/login',
            this.session.passportAuthenticate('local', {
                failureRedirect: '/login',
                successRedirect: "/menu"
            }));

        this.app.use(function (req, res, next) {
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

    }

    createView() {
        this.app.get('/login', function (req, res) {
            res.sendFile("login.html", {
                root: "../site"
            });
        })

        this.app.get('/menu', function (req, res) {
            res.sendFile("menu.html", {
                root: "../site"
            });
        })

        this.app.get('/signup', async function (req, res) {
            var user = await this.db.findUser(req.query.username);
            if (!user)
                this.db.createUser(req.query);
        }.bind(this))

        this.app.get('/', function (req, res) {
            res.sendFile("index.html", {
                root: "../site"
            });
        });

        this.app.get('/css/*', function (req, res) {
            res.sendFile(req.path, {
                root: "../site"
            });
        });

        this.app.get('/draw2d/*', function (req, res) {
            res.sendFile(req.path, {
                root: "../site"
            });
        });

        this.app.get('/script/*', function (req, res) {
            res.sendFile(req.path, {
                root: "../site"
            });
        })

        this.app.get("/scheme/*", async function (req, res) {
            // var url = req.path.slice(req.path.lastIndexOf("/"));
            var data = await this.db.findScheme(req.path);
            if (data) {
                if (data.user == req.user.username) {
                    return res.send(data);
                }
            }
            res.send("error");
        }.bind(this))

        this.app.get("/url", function (req, res) {
            res.send(this.randomValueHex(8));
        }.bind(this))

        this.app.get("/allSchemes", async function (req, res) {
            var schemes = await this.db.findAllUserSchemes(req.user.username);
            res.send(schemes);
        }.bind(this));

        this.app.post("/deleteScheme", async function (req, res) {
            await this.db.deleteScheme(req.body.url);
            res.end();
        }.bind(this));
        this.app.get("/username", function (req, res) {
            res.send(req.user.username);
        }.bind(this))
        this.app.get("*", function (req, res) {
            res.sendFile("index.html", {
                root: "../site"
            });
        })

        this.app.post("/scheme/*", function (req, res) {
            var data = req.body.data;
            this.db.updateScheme(req.path, {
                user: req.user.username,
                json: data
            });
            res.end();
        }.bind(this))

        this.app.post("/logout", function (req, res) {
            req.logout();
            res.end();
        });

        this.app.post("/changeName", async function (req, res) {
            var json = req.body;
            await this.db.changeSchemeDisplayName(json.url, json.name);
            res.end();
        }.bind(this));

    }

    listen(port) {
        this.app.listen(port);
    }

}
module.exports = {
    view
}