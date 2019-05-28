class session {
    constructor(db) {
        this.passport = require('passport');
        this.LocalStrategy = require('passport-local').Strategy;
        this.session = require('express-session');
        this.db = db;
    }

    initializeSession() {
        this.passport.serializeUser(function (user, done) {
            done(null, user);
        });

        this.passport.deserializeUser(function (user, done) {
            done(null, user);
        });

        this.passport.use(new this.LocalStrategy(
            async function checkUserData(username, password, done) {
                var user = await this.db.findUser(username);
                if (!user) return done(null, false);
                if (user.username == username && user.password == password) {
                    return done(null, {
                        username,
                        password
                    });
                }
                return done(null, false)
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

    passportyInitialize(){
        return this.passport.initialize();
    }

    passportSession(){
        return this.passport.session();
    }

    passportAuthenticate(str,obj){
        return this.passport.authenticate(str,obj);
    }
}
module.exports = {
    session
}