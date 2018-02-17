'use strict'

const KoaRouter = require('koa-router');
const Consolidate = require('consolidate');

const adminRouter = new KoaRouter();

const WashTypeDataAccess = require('app/data_access/wash_type.js');
const UserDataAccess = require('app/data_access/user.js');
const CarDataAccess = require('app/data_access/car.js');
const WashHistoryDataAccess = require('app/data_access/wash_history.js');

adminRouter.get('/admin', MainAdminPage);
adminRouter.get('/admin/users', UsersPage);
adminRouter.post('/admin/users', NewUser);
adminRouter.get('/admin/users/delete/:id', DeleteUser); // TODO - change to POST
adminRouter.post('/admin/users/update/:id', UpdateUser);

adminRouter.get('/admin/washtypes', WashTypesPage);
adminRouter.post('/admin/washtypes', NewWashType);
adminRouter.post('/admin/washtypes/update/:id', UpdateWashType);
adminRouter.get('/admin/washtypes/delete/:id', DeleteWashType);  // TODO - change to POST

adminRouter.get('/admin/carhistory', CarHistory);
adminRouter.post('/admin/carhistory/create', CreateCarWashEntry);
adminRouter.post('/admin/carhistory/update/:id', UpdateCarWashEntry);
adminRouter.get('/admin/carhistory/delete/:id', DeleteCarWashEntry);

adminRouter.get('/admin/userhistory', UserHistory);

adminRouter.get('/admin/history', ShowWashHistory);


async function MainAdminPage(ctx) {

    ctx.viewModel.content = await Consolidate.mustache('app/views/admin/AdminMenu.mustache', {});
}

async function UsersPage(ctx) {
    
    var UserModel = require('app/data_access/user.js');

    var locals = {
        "users": await UserModel.GetAllUsersData(),
        "partials": {
            "AdminMenu" : 'AdminMenu'
        }
    }
    ctx.viewModel.content = await Consolidate.mustache('app/views/admin/Users.mustache', locals);
}

async function NewUser(ctx) {

    var user_name = ctx.request.body.username;
    var user_role = ctx.request.body.user_role;
    var user_password = ctx.request.body.password;

    var UserModel = require('app/data_access/user.js');

    UserModel.CreateUser(user_name, user_role, user_password);

    ctx.redirect('/admin/users');
}

async function DeleteUser(ctx) {

    var id = ctx.params.id;

    var UserModel = require('app/data_access/user.js');

    // TODO - react on error/success
    await UserModel.DeleteUserById(id);

    ctx.redirect('/admin/users');
}

async function UpdateUser(ctx) {

    var id = ctx.params.id;
    var user_name = ctx.request.body.username;
    var user_role = ctx.request.body.user_role;
    var user_password = ctx.request.body.password;

    var UserModel = require('app/data_access/user.js');

    await UserModel.UpdateUser(id, user_name, user_role, user_password);

    ctx.redirect('/admin/users');
}

async function UserHistory(ctx) {

    var UserModel = require('app/data_access/user.js');
    if ("user_id" in ctx.request.query) {
        var id = ctx.request.query.user_id;
        var date_from = ("date_from" in ctx.request.query) ? ctx.request.query.date_from : null;
        var date_to = ("date_to" in ctx.request.query) ? ctx.request.query.date_to : null;
        var WashHistoryModel = require('app/data_access/wash_history.js');

        var locals = {
            "washHistory": await WashHistoryModel.GetHistoryForUser(id, date_from, date_to),
            "user": await UserModel.GetUserById(id),
            "partials": {
                "AdminMenu" : 'AdminMenu'
            }
        }
    }
    else {
        var locals = {
            "users": await UserModel.GetAllUsersData(),
            "partials": {
                "AdminMenu" : 'AdminMenu'
            }
        }
    }
    ctx.viewModel.content = await Consolidate.mustache('app/views/admin/UserWashHistory.mustache', locals);
}


async function WashTypesPage(ctx) {

    var WashTypeModel = require('app/data_access/wash_type.js');

    var locals = {
        'washTypes': await WashTypeModel.GetWashTypes(),
        'partials': {
            "AdminMenu" : 'AdminMenu'
        }
    }

    ctx.viewModel.content = await Consolidate.mustache('app/views/admin/WashTypes.mustache', locals);
}

async function NewWashType(ctx) {

    var order_number = ctx.request.body.order_number;
    var name = ctx.request.body.wash_type_name;
    var description = ctx.request.body.description;

    var WashTypeModel = require('app/data_access/wash_type.js');
    
    await WashTypeModel.AddWashType(order_number, name, description);

    ctx.redirect('/admin/washtypes');
}

async function UpdateWashType(ctx) {

    var id = ctx.params.id;
    var order_number = ctx.request.body.order_number;
    var name = ctx.request.body.wash_type_name;
    var description = ctx.request.body.description;

    var WashTypeModel = require('app/data_access/wash_type.js');

    await WashTypeModel.UpdateWashType(id, order_number, name, description);

    ctx.redirect('/admin/washtypes');
}

async function DeleteWashType(ctx) {

    var id = ctx.params.id;

    var WashTypeModel = require('app/data_access/wash_type.js');

    await WashTypeModel.DeleteWashTypeById(id);

    ctx.redirect('/admin/washtypes');
}

async function CarHistory(ctx) {

    // For Edit Wash entry modal form
    var WashTypeModel = require('app/data_access/wash_type.js');
    var UserModel = require('app/data_access/user.js');

    var locals = {
        'wash_types': await WashTypeModel.GetWashTypes(),
        'users': await UserModel.GetAllUsersData(),
        'user': ctx.session.user,
        'partials': {
            "AdminMenu" : 'AdminMenu',
            "CarWashHistoryTable": 'CarWashHistoryTable'
        }
    }
    if ("reg_number" in ctx.request.query) {
    
        var CarModel = require('app/data_access/car.js');

        var regNumber = ctx.request.query.reg_number.toUpperCase();
        var car = await CarModel.GetByRegNumber(regNumber);

        if (car != null) {

            var WashHistoryModel = require('app/data_access/wash_history.js');
        
            locals.historyEntries = await WashHistoryModel.GetHistoryForCar(car.id);
            locals.fullHistory = true,
            locals.hasCarHistory = true;
            locals.reg_number = regNumber;
        }
        else {

            locals.message = "Brak pojazdu o numerze rejestracyjnym " + regNumber;
        }
    }
    ctx.viewModel.content = await Consolidate.mustache('app/views/admin/CarWashHistory.mustache', locals);
}

async function BuildHistoryFilterObject(query)
{
    var result = [];

    if (query.reg_number)
    {
        result.push({
            'form_key': 'reg_number',
            'form_value': query.reg_number,
            'key': 'Nr rej.',
            'value': query.reg_number
        });
    }

    if (query.washer_id && query.washer_id > 0)
    {
        var user = await UserDataAccess.GetUserById(query.washer_id);

        result.push({
            'form_key': 'washer_id',
            'form_value': query.washer_id,
            'key': 'Umył',
            'value': user.name
        });
    }

    if (query.date_from)
    {
        result.push({
            'form_key': 'date_from',
            'form_value': query.date_from,
            'key': 'Od',
            'value': query.date_from
        });
    }

    if (query.date_to)
    {
        result.push({
            'form_key': 'date_to',
            'form_value': query.date_to,
            'key': 'Do',
            'value': query.date_to
        });
    }
    return result;
}

async function ShowWashHistory(ctx) {

    var locals = {
        'wash_types': await WashTypeDataAccess.GetWashTypes(),
        'users': await UserDataAccess.GetAllUsersIdAndNames(true),
        'user': ctx.session.user,
        'partials': {
            "AdminMenu" : 'AdminMenu',
            "CarWashHistoryTable": 'CarWashHistoryTable'
        }
    }
    if ("submit_action" in ctx.request.query) {
    
        locals.historyEntries = await WashHistoryDataAccess.GetHistory(ctx.request.query);
        locals.fullHistory = true;
        locals.hasHistory = true;

        locals.filters = await BuildHistoryFilterObject(ctx.request.query);
        locals.hasFilters = locals.filters.length > 0;
    }
    ctx.viewModel.content = await Consolidate.mustache('app/views/admin/WashHistory.mustache', locals);
}

async function DeleteCarWashEntry(ctx) {

    var id = ctx.params.id;

    var WashHistoryDataAccess = require('app/data_access/wash_history.js');

    var washEntry = await WashHistoryDataAccess.GetHistoryEntryById(id);

    // TODO - check if entry was returned
    var CarDataAccess = require('app/data_access/car.js');

    var carData = await CarDataAccess.GetCarDataById(washEntry[0].car_id);

    var result = await WashHistoryDataAccess.RemoveHistory(id);

    ctx.redirect('/admin/carhistory?reg_number=' + carData.reg_number);
}

async function UpdateCarWashEntry(ctx) {

    var id = ctx.params.id;
    var date = ctx.request.body.date;
    var wash_type_id = ctx.request.body.wash_type_id;
    var washer_id = ctx.request.body.washer_id;

    var WashHistoryDataAccess = require('app/data_access/wash_history.js');

    var washEntry = await WashHistoryDataAccess.GetHistoryEntryById(id);

    var CarDataAccess = require('app/data_access/car.js');

    var carData = await CarDataAccess.GetCarDataById(washEntry[0].car_id);

    var result = await WashHistoryDataAccess.UpdateHistoryEntryById(id, date, wash_type_id, washer_id);

    if (ctx.request.body.back_url) {
        ctx.redirect(ctx.request.body.back_url);
    }
    else {
        ctx.redirect('/admin/carhistory?reg_number=' + carData.reg_number);
    }
}

async function CreateCarWashEntry(ctx) {

    var carRegNumber = ctx.request.body.reg_number.toUpperCase();
    var date = ctx.request.body.date;
    var washTypeId = ctx.request.body.wash_type_id;
    var washerId = ctx.request.body.washer_id;

    var CarModel = require('app/data_access/car');
    // TODO - function below returns only id while GetByRegNumber whole object - normalize functions
    var CarId = await CarModel.GetByRegNumberOrCreate(carRegNumber);

    var WashHistoryModel = require('app/data_access/wash_history');
    var historyEntryId = await WashHistoryModel.AddHistory(CarId, washTypeId, date, washerId);

    ctx.redirect('/admin/carhistory?reg_number=' + carRegNumber);
}

module.exports = adminRouter.routes();