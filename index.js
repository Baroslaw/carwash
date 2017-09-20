'use strict';

const Koa = require('koa');
const KoaRouter = require('koa-router');
const Views = require('koa-views');
const KoaStatic = require('koa-static');
const KoaBody = require('koa-body');
const MySql = require('mysql2/promise');

const app = new Koa();
const router = new KoaRouter();
const koaBody = new KoaBody();

// TODO - take credentials from outher resources
// Initialize DB
const DbConfig = {
    host: "localhost",
    port: "3306",
    user: "carwash",
    password: "carwash",
    database: "carwash"
};

MySql.createConnection(DbConfig)
.then((connection) => {
    console.log("Successfully connected to database");
    global.DbConnection = connection;
})
.catch((e) => {
    console.log("Error connection to database: " + e.message);
    process.exit(1);
});

// Views initialization
app.use(Views(__dirname + '/views', {
    extension: "mustache",
    map: {
        mustache: "mustache"
    }
}));

// Static files provider
app.use(KoaStatic(__dirname + '/public'));

// TODO - Errors handling middleware


// Routing initialization
router.get('/wash', RegistrationNumberForm);
router.post('/wash', koaBody, CheckRegistrationNumber);
router.get('/wash/:id', WashForm);
app.use(router.routes());

// TODO - Default route handling
app.use(async ctx => {
    await ctx.render("PageNotFound");
});

// Pages
// TODO - move to other files 
async function RegistrationNumberForm(ctx) {
    console.log("RegistationNumberForm");
    await ctx.render('RegistrationNumberForm');
}

async function CheckRegistrationNumber(ctx) {
    console.log("CheckRegistrationNumber");
    var regNumber = ctx.request.body.reg_number.toUpperCase();

    var CarModel = require('./models/car');

    var id = await CarModel.GetByRegNumberOrCreate(regNumber);
    console.log(`Car of reg_number ${regNumber} id=${id}`);

    ctx.redirect(`/wash/${id}`);
}

function WashForm(ctx) {
    console.log("Wash called with id=" + ctx.params.id);
    ctx.body = "Wash" + ctx.params.id;
}

app.listen(3000);
