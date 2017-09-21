'use strict';

const Koa = require('koa');
const KoaRouter = require('koa-router');
const Views = require('koa-views');
const KoaStatic = require('koa-static');
const KoaBody = require('koa-body');
const MySql = require('mysql2/promise');
const Consolidate = require('consolidate');

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

// TODO - Errors handling middleware


// Routing initialization
router.get('/wash', RegistrationNumberForm);
router.post('/wash', koaBody, CheckRegistrationNumber);
router.get('/wash/:id', WashForm);
app.use(router.routes());

// Static files provider
app.use(KoaStatic(__dirname + '/public', { maxage: 1000*60*60 }));

app.use(async ctx => {
    await ctx.render("PageNotFound");
});

// Pages
// TODO - move to other files 
async function RegistrationNumberForm(ctx) {
    console.log("RegistationNumberForm");

    var viewModel = {
        "content": await Consolidate.mustache('./views/RegistrationNumberForm.mustache', {})
    };

    await ctx.render('MainView', viewModel);
}

async function CheckRegistrationNumber(ctx) {
    console.log("CheckRegistrationNumber");
    var regNumber = ctx.request.body.reg_number.toUpperCase();

    var CarModel = require('./models/car');

    var id = await CarModel.GetByRegNumberOrCreate(regNumber);
    console.log(`Car of reg_number ${regNumber} id=${id}`);

    ctx.redirect(`/wash/${id}`);
}

async function WashForm(ctx) {
    console.log("Wash id=" + ctx.params.id);

    var WashTypeModel = require('./models/wash_type');
    
    var wash_types = await WashTypeModel.GetWashTypes();
    
    var locals = {
        "wash_types" : wash_types,
        "id": ctx.params.id
    };

    var viewModel = {
        "content": await Consolidate.mustache('./views/SelectWashingProgram.mustache', locals)
    }
    await ctx.render('MainView', viewModel);
}

app.listen(3000);
