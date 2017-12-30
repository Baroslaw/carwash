'use strict'

const KoaRouter = require('koa-router');
const Consolidate = require('consolidate');

const preAuthRouter = new KoaRouter();

// Routing 
preAuthRouter.get('/login', LoginForm);
preAuthRouter.post('/login', Authenticate);
preAuthRouter.get('/logout', Logout);

async function LoginForm(ctx) {
    
    var UserModel = require('app/data_access/user.js');
    var locals = {
        "users": await UserModel.GetUsersNames()
    };
    ctx.viewModel.content = await Consolidate.mustache('app/views/LoginForm.mustache', locals);
}

async function Authenticate(ctx) {
    var UserModel = require('app/data_access/user.js');

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
        global.Logger.error('Authenticate '+e.message);
        ctx.redirect('/login');
    }
}

async function Logout(ctx) {
    ctx.session = null;
    ctx.redirect('/login');
}

module.exports = preAuthRouter.routes();