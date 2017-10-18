'use strict'

const KoaRouter = require('koa-router');
const Consolidate = require('consolidate');

const FREE_WASHING_COUNT = 10;

const router = new KoaRouter();

router.get('/wash', RegistrationNumberForm);
router.post('/wash/:id', OnSelectWashProgram);
router.post('/wash', CheckRegistrationNumber);
router.get('/wash/:id', WashForm);

async function RegistrationNumberForm(ctx) {
    console.log("RegistationNumberForm");

    var viewModel = {
        "user": ctx.session.user,
        "content": await Consolidate.mustache('app/views/RegistrationNumberForm.mustache', {})
    };

    await ctx.render('MainView', viewModel);
}

async function CheckRegistrationNumber(ctx) {
    console.log("CheckRegistrationNumber");
    var regNumber = ctx.request.body.reg_number.toUpperCase();

    var CarModel = require('app/models/car');

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

    var WashTypeModel = require('app/models/wash_type');
    var CarModel = require('app/models/car');
    
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
        "content": await Consolidate.mustache('app/views/SelectWashingProgram.mustache', locals)
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
    var WashHistoryModel = require('app/models/wash_history');

    var historyEntryId = await WashHistoryModel.AddHistory(carId, washTypeId, null, ctx.session.user.id);
    if (historyEntryId < 0) {
        // TODO - error (throw something)
        var locals = {
            "error": "Błąd rejestracji mycia samochodu",
            "main_url": "/wash"
        }
        // Save failure
        viewModel.content = await Consolidate.mustache('app/views/WashingError.mustache', locals);
        await ctx.render('MainView', viewModel);
        return;
    }
    if ( ctx.request.body.free_wash != undefined ) {
        var notUsedWashings = await WashHistoryModel.GetNotUsedWashings(carId);
        var notUsedIds = notUsedWashings.map(a => a.id);
        await WashHistoryModel.SetUsedWithIdToEntries(historyEntryId, notUsedIds);
    }
    
    var viewModel = {};
    var WashTypeModel = require('app/models/wash_type');
    var washType = await WashTypeModel.GetWashTypeById(washTypeId)
    var locals = {
        "reg_number" : carRegNumber,
        "wash_type_text": washType.name,
        "main_url": "/wash"
    };
    // And show Confirmation window
    var viewModel = {
        "user": ctx.session.user,
        "content": await Consolidate.mustache('app/views/ConfirmWashing.mustache', locals)
    }
    await ctx.render('MainView', viewModel);
}

module.exports = router.routes();