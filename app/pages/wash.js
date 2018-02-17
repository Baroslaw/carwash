'use strict'

const KoaRouter = require('koa-router');
const Consolidate = require('consolidate');
const Moment = require('moment');

const FREE_WASHING_COUNT = 10;

const router = new KoaRouter();

// TODO - define all data_access requires here
const WashHistoryDataAccess = require('app/data_access/wash_history');
const CarDataAccess = require('app/data_access/car');
const WashTypeDataAccess = require('app/data_access/wash_type');

router.get('/wash', RegistrationNumberForm);
router.post('/wash', OnSelectWashProgram);

async function RegistrationNumberForm(ctx) {

    if ("reg_number" in ctx.request.query) {

        var regNumber = ctx.request.query.reg_number.toUpperCase();
    
        var carId = await CarDataAccess.GetByRegNumberOrCreate(regNumber);
        global.Logger.info(`Car of reg_number ${regNumber} id=${carId}`);
    
        var carData = await CarDataAccess.GetCarDataById(carId);
        var thisWashCount = carData.notUsedWashingCount + 1;
        var notUsedHistory = await WashHistoryDataAccess.GetNotUsedHistoryForCar(carId);

        var durationHours = 0;
        if (carData.lastWashDate != null)
        {
            var now = Moment(new Date());
            var washTime = Moment(carData.lastWashDate);
            var duration = Moment.duration(now.diff(washTime));
            durationHours = duration.asHours();
        }
        
        var locals = {
            "reg_number": carData.reg_number,
            "wash_types" : await WashTypeDataAccess.GetWashTypes(),
            "id": ctx.params.id,
            "lastWashDate": carData.lastWashDate,
            "isFast": carData.lastWashDate != null && durationHours < 48,
            "lastWashDurationHours": Math.floor(durationHours),
            "washingCountText": WashCountToText(thisWashCount, carData.reg_number),
            "isFreeWash": (thisWashCount >= FREE_WASHING_COUNT),
            "historyEntries": notUsedHistory,
            "hasCarHistory": notUsedHistory.length > 0,
            "fullHistory": false,
            "user": ctx.session.user,
            "partials" : {
                "CarWashHistoryTable": 'admin/CarWashHistoryTable'
            }
        };
    
        ctx.viewModel.content = await Consolidate.mustache('app/views/SelectWashingProgram.mustache', locals);
    }
    else {
        ctx.viewModel.content = await Consolidate.mustache('app/views/RegistrationNumberForm.mustache', {});
    }
}

function WashCountToText(washCount, regNumber) {

    var countText;
    var countRemainder = washCount;

    countRemainder = washCount % 100;
    if (countRemainder > 20) {
        countRemainder = countRemainder % 10;
    }

    if (countRemainder == 1) {
        countText = `-sze`;
    }
    else if (countRemainder == 2) {
        countText = `-gie`;
    }
    else if (countRemainder == 3) {
        countText =`-cie`;
    }
    else {
        countText = `-te`
    }
    return `${washCount}${countText} mycie pojazdu ${regNumber}`;
}
    
async function OnSelectWashProgram(ctx) {

    if (ctx.request.body.submit_cancel_wash != undefined) {
        ctx.redirect('/wash');
        return;
    }
    var carRegNumber = ctx.request.body.reg_number;
    var washTypeId = ctx.request.body.wash_type;

    var CarObject = await CarDataAccess.GetByRegNumber(carRegNumber);

    global.Logger.info(`SelectWashProgram ${carRegNumber} WashType ${washTypeId}`);

    // Save washing in history
    var WashHistoryModel = require('app/data_access/wash_history');

    var historyEntryId = await WashHistoryModel.AddHistory(CarObject.id, washTypeId, null, ctx.session.user.id);
    if (historyEntryId < 0) {
        // TODO - error (throw something)
        var locals = {
            "error": "Błąd rejestracji mycia samochodu",
            "main_url": "/wash"
        }
        // Save failure
        ctx.viewModel.content = await Consolidate.mustache('app/views/WashingError.mustache', locals);
    }
    else {
        var notUsedWashings = await WashHistoryModel.GetNotUsedWashings(CarObject.id);
        var notUsedWashingCount = notUsedWashings.length;

        if ( ctx.request.body.free_wash != undefined ) {
            var notUsedIds = notUsedWashings.map(a => a.id);
            await WashHistoryModel.SetUsedWithIdToEntries(historyEntryId, notUsedIds);
            notUsedWashingCount = 0;
        }

        var washType = await WashTypeDataAccess.GetWashTypeById(washTypeId);
        var locals = {
            "reg_number" : carRegNumber,
            "wash_type_text": washType.name,
            "main_url": "/wash",
            "isNextFree": notUsedWashingCount == (FREE_WASHING_COUNT - 1)
        };
        // And show Confirmation window
        ctx.viewModel.content = await Consolidate.mustache('app/views/ConfirmWashing.mustache', locals);
    }
}

module.exports = router.routes();