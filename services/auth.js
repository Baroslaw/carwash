const PassportModule = require('koa-passport');

const LocalStartegy = require('passport-local').Strategy;

const UserModel = require('../models/User');

PassportModule.serializeUser(function(user, done){
    done(null, user);
});

PassportModule.deserializeUser(function(user, done){
    done(null, user);
});

PassportModule.use(new LocalStartegy(function(username, password, done){
    
    try {
        var user = await UserModel.GetUser(username, password);
        done(null, user);
    }
    catch(err) {
        done(err);
    }
}));
