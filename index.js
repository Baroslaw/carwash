'use strict';

// This is for easy require app modules from modules in subfolders
require('app-module-path').addPath(__dirname);

const Koa = require('koa');
const KoaRouter = require('koa-router');
const Views = require('koa-views');
const KoaStatic = require('koa-static');
const KoaBody = require('koa-body');
const MySql = require('mysql2/promise');
const Consolidate = require('consolidate');
const SessionModule = require('koa-session');
const ConfigModule = require('config');

const app = new Koa();

// Initialize DB
const DbConfig = ConfigModule.get("DbConfig");
const connectionPool = MySql.createPool(DbConfig);

global.DbExecute = async (sql, params) => {

    try{
        var connection = await connectionPool.getConnection();
        var result = await connection.execute(sql, params);
        connection.release();

        return result[0];
    }
    catch(e)
    {
        var message = `Error connection to database: ${e.message}`;
        console.log(message);

        const err = new Error(message);
        err.status = 500;
        err.expose = true;
        throw err;
    }
}

// Session
app.keys = ['7wFfnXDBHo48Pms'];
app.use(SessionModule(app));

// Views initialization
app.use(Views(__dirname + '/app/views', {
    extension: "mustache",
    map: {
        mustache: "mustache"
    }
}));

// All errors handling
app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.status = err.status || 500;
      var locals = {
        "error": err.message,
        "main_url": "/wash"
      }
      // Save failure
      var viewModel = {
          content: await Consolidate.mustache('app/views/Error.mustache', locals)
      };
      await ctx.render('MainView', viewModel);
      ctx.app.emit('error', err, ctx);
    }
});

// Static files provider
app.use(KoaStatic(__dirname + '/public', { maxage: 1000*60*60 }));

app.use(KoaBody());

app.use(require('app/pages/login.js'));

// demand authentication here
app.use(async (ctx, next) =>{
    if (ctx.session.isNew) {
        ctx.redirect('/login');
    }
    else {
        ctx.viewModel = {
            "user": ctx.session.user
        }
        await next();
    }
});

app.use(require('app/pages/wash.js'));

// Administration pages
// TODO - move this middleware to app/pages/admin.js
app.use(async (ctx, next) => {
    if (ctx.session.user.role != "admin") {
        ctx.redirect('/wash');
    }
    else {
        await next();
    }
});

app.use(require('app/pages/admin.js'));

app.use(async ctx => {
    await ctx.render("PageNotFound");
});

app.listen(3000);
