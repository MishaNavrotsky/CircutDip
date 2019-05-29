class session {
    constructor(db) {
        this.passport = require('passport');
        this.LocalStrategy = require('passport-local').Strategy;
        this.session = require('express-session');
        this.db = db;
    }

    serializeUser(user, done) {
        return done(null, user);
    }

    deserializeUser(user, done) {
        return done(null, user);
    }

    async signinCheck(username, password, done) {
        var user = await this.db.findUser(username);
        if (!user) return done(null, false);
        if (user.username == username && user.password == password) {
            return done(null, {
                username,
                password
            });
        }
        return done(null, false)
    }
    initializeSession() {
        this.passport.serializeUser(function (user, done) {
            this.serializeUser(user, done);
        }.bind(this));

        this.passport.deserializeUser(function (user, done) {
            this.deserializeUser(user, done);
        }.bind(this));

        this.passport.use(new this.LocalStrategy(
            async function (username, password, done) {
                return await this.signinCheck(username, password, done);
            }.bind(this)
        ));
    }

    createSession(secret) {
        return this.session({
            secret: secret,
            resave: false,
            saveUninitialized: false
        });
    }

    passportyInitialize() {
        return this.passport.initialize();
    }

    passportSession() {
        return this.passport.session();
    }

    passportAuthenticate(str, obj) {
        return this.passport.authenticate(str, obj);
    }
}
module.exports = {
    session
}