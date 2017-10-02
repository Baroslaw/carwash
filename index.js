'use strict';

const Koa = require('koa');
const KoaRouter = require('koa-router');
const Views = require('koa-views');
const KoaStatic = require('koa-static');
const KoaBody = require('koa-body');
const MySql = require('mysql2/promise');
const Consolidate = require('consolidate');
const SessionModule = require('koa-session');

const app = new Koa();
const koaBody = new KoaBody();

const FREE_WASHING_COUNT = 10;

// TODO - take credentials from outher resources
// Initialize DB
const DbConfig = {
    host: "localhost",
    port: "3306",
    user: "carwash",
    password: "carwash",
    database: "carwash"
};

const connectionPool = MySql.createPool(DbConfig);

global.DbExecute = async (sql, params) => {

    try{
        var connection = await connectionPool.getConnection();
        console.log("Connected to database");

        var result = await connection.execute(sql, params);
        console.log(`Query ${sql} returned`);

        connection.release();
        console.log("Connection released");

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
app.use(Views(__dirname + '/views', {
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
          content: await Consolidate.mustache('./views/Error.mustache', locals)
      };
      await ctx.render('MainView', viewModel);
      ctx.app.emit('error', err, ctx);
    }
});

// Static files provider
app.use(KoaStatic(__dirname + '/public', { maxage: 1000*60*60 }));

// Authentication
// const auth = require('./services/auth.js');

const preAuthRouter = new KoaRouter();

// Routing 
preAuthRouter.get('/login', LoginForm);
preAuthRouter.post('/login', koaBody, Authenticate);
preAuthRouter.get('/logout', Logout);
app.use(preAuthRouter.routes());

// TODO - demand authentication here
app.use(async (ctx, next) =>{
    if (ctx.session.isNew) {
        ctx.redirect('/login');
    }
    else {
        await next();
    }
});

const router = new KoaRouter();

router.get('/wash', RegistrationNumberForm);
router.post('/wash/:id', koaBody, OnSelectWashProgram);
router.post('/wash', koaBody, CheckRegistrationNumber);
router.get('/wash/:id', WashForm);
app.use(router.routes());

app.use(async ctx => {
    await ctx.render("PageNotFound");
});


// Pages
// TODO - move to other files 

async function LoginForm(ctx) {
    console.log("RegistationNumberForm");
    
    var UserModel = require('./models/user.js');
    var locals = {
        "users": await UserModel.GetUsersNames()
    };
    var viewModel = {
        "content": await Consolidate.mustache('./views/LoginForm.mustache', locals)
    };

    await ctx.render('MainView', viewModel);        
}

async function Authenticate(ctx) {
    var UserModel = require('./models/user.js');

    try {
        var user = await UserModel.GetUser(ctx.request.body.username, ctx.request.body.password);
        ctx.session.user = user;
        ctx.redirect('/wash');
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

async function RegistrationNumberForm(ctx) {
    console.log("RegistationNumberForm");

    var viewModel = {
        "user": ctx.session.user,
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

function WashCountToText(washCount, regNumber) {

    var countText;
    var countRemainder = washCount;

    countRemainder = washCount % 100;
    if (countRemainder > 20) {
        countRemainder = countRemainder % 10;
    }

    if (countRemainder == 1) {
        countText = `sze`;
    }
    else if (countRemainder == 2) {
        countText = `gie`;
    }
    else if (countRemainder == 3) {
        countText =`cie`;
    }
    else {
        countText = `te`
    }
    return `${washCount}${countText} mycie pojazdu ${regNumber}`;
}
    
async function WashForm(ctx) {

    var carId = ctx.params.id;
    console.log(`Car id=${carId}`);

    var WashTypeModel = require('./models/wash_type');
    var CarModel = require('./models/car');
    
    var washTypes = await WashTypeModel.GetWashTypes();
    var carData = await CarModel.GetCarDataById(carId);


    var thisWashCount = carData.notUsedWashingCount + 1;
    
    var locals = {
        "reg_number": carData.reg_number,
        "wash_types" : washTypes,
        "id": ctx.params.id,
        "washingCountText": WashCountToText(thisWashCount, carData.reg_number),
        "isFreeWash": (thisWashCount >= FREE_WASHING_COUNT)
    };

    var viewModel = {
        "user": ctx.session.user,
        "content": await Consolidate.mustache('./views/SelectWashingProgram.mustache', locals)
    }
    await ctx.render('MainView', viewModel);
}

async function OnSelectWashProgram(ctx) {

    if (ctx.request.body.submit_cancel_wash != undefined) {
        ctx.redirect('/wash');
        return;
    }
    var carId = ctx.params.id;
    var carRegNumber = ctx.request.body.reg_number;
    var washTypeId = ctx.request.body.wash_type;

    console.log(`SelectWashProgram ${carRegNumber} WashType ${washTypeId}`);

    if (!washTypeId) {
        ctx.redirect(`/wash/${carId}`);
        return;
    }

    // Save washing in history
    var WashHistoryModel = require('./models/wash_history');

    var historyEntryId = await WashHistoryModel.AddHistory(carId, washTypeId, null);
    if (historyEntryId < 0) {
        // TODO - error (throw something)
        var locals = {
            "error": "Błąd rejestracji mycia samochodu",
            "main_url": "/wash"
        }
        // Save failure
        viewModel.content = await Consolidate.mustache('./views/WashingError.mustache', locals);
        await ctx.render('MainView', viewModel);
        return;
    }
    if ( ctx.request.body.free_wash != undefined ) {
        var notUsedWashings = await WashHistoryModel.GetNotUsedWashings(carId);
        var notUsedIds = notUsedWashings.map(a => a.id);
        await WashHistoryModel.SetUsedWithIdToEntries(historyEntryId, notUsedIds);
    }
    
    var viewModel = {};
    var WashTypeModel = require('./models/wash_type');
    var washType = await WashTypeModel.GetWashTypeById(washTypeId)
    var locals = {
        "reg_number" : carRegNumber,
        "wash_type_text": washType.name,
        "main_url": "/wash"
    };
    // And show Confirmation window
    var viewModel = {
        "user": ctx.session.user,
        "content": await Consolidate.mustache('./views/ConfirmWashing.mustache', locals)
    }
    await ctx.render('MainView', viewModel);
}

app.listen(3000);
