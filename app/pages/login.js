'use strict'

const KoaRouter = require('koa-router');
const Consolidate = require('consolidate');

const preAuthRouter = new KoaRouter();

// Routing 
preAuthRouter.get('/login', LoginForm);
preAuthRouter.post('/login', Authenticate);
preAuthRouter.get('/logout', Logout);

async function LoginForm(ctx) {
    console.log("RegistationNumberForm");
    
    var UserModel = require('app/models/user.js');
    var locals = {
        "users": await UserModel.GetUsersNames()
    };
    var viewModel = {
        "content": await Consolidate.mustache('app/views/LoginForm.mustache', locals)
    };

    await ctx.render('MainView', viewModel);        
}

async function Authenticate(ctx) {
    var UserModel = require('app/models/user.js');

    try {
        var user = await UserModel.GetUser(ctx.request.body.username, ctx.request.body.password);
        ctx.session.user = user;
        if (user.isAdmin) {
            ctx.redirect('/admin');
        }
        else {
            ctx.redirect('/wash');
        }
    }
    catch(e) {
        console.log(e.message);
        ctx.redirect('/login');
    }
}

async function Logout(ctx) {
    ctx.session = null;
    ctx.redirect('/login');
}

module.exports = preAuthRouter.routes();