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

adminRouter.post('/admin/history/create', CreateCarWashEntry);
adminRouter.post('/admin/history/update/:id', UpdateCarWashEntry);
adminRouter.get('/admin/history/delete/:id', DeleteCarWashEntry);

adminRouter.get('/admin/history', ShowWashHistory);


async function MainAdminPage(ctx) {

    ctx.viewModel.content = await Consolidate.mustache('app/views/admin/AdminMenu.mustache', {});
}

async function UsersPage(ctx) {
    
    var locals = {
        "users": await UserDataAccess.GetAllUsersData(),
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

    await UserDataAccess.CreateUser(user_name, user_role, user_password);

    ctx.redirect('/admin/users');
}

async function DeleteUser(ctx) {

    var id = ctx.params.id;

    // TODO - react on error/success
    await UserDataAccess.DeleteUserById(id);

    ctx.redirect('/admin/users');
}

async function UpdateUser(ctx) {

    var id = ctx.params.id;
    var user_name = ctx.request.body.username;
    var user_role = ctx.request.body.user_role;
    var user_password = ctx.request.body.password;

    await UserDataAccess.UpdateUser(id, user_name, user_role, user_password);

    ctx.redirect('/admin/users');
}

async function WashTypesPage(ctx) {

    var locals = {
        'washTypes': await WashTypeDataAccess.GetWashTypes(),
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

    await WashTypeDataAccess.AddWashType(order_number, name, description);

    ctx.redirect('/admin/washtypes');
}

async function UpdateWashType(ctx) {

    var id = ctx.params.id;
    var order_number = ctx.request.body.order_number;
    var name = ctx.request.body.wash_type_name;
    var description = ctx.request.body.description;

    await WashTypeDataAccess.UpdateWashType(id, order_number, name, description);

    ctx.redirect('/admin/washtypes');
}

async function DeleteWashType(ctx) {

    var id = ctx.params.id;

    await WashTypeDataAccess.DeleteWashTypeById(id);

    ctx.redirect('/admin/washtypes');
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
    // if ("submit_action" in ctx.request.query) {
    if (Object.keys(ctx.request.query).length !== 0) {  // check if object is empty
    
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

    var washEntry = await WashHistoryDataAccess.GetHistoryEntryById(id);

    // TODO - check if entry was returned
    var carData = await CarDataAccess.GetCarDataById(washEntry[0].car_id);

    var result = await WashHistoryDataAccess.RemoveHistory(id);

    ctx.redirect('/admin/history?reg_number=' + carData.reg_number);
}

async function UpdateCarWashEntry(ctx) {

    var id = ctx.params.id;
    var date = ctx.request.body.date;
    var wash_type_id = ctx.request.body.wash_type_id;
    var washer_id = ctx.request.body.washer_id;

    var washEntry = await WashHistoryDataAccess.GetHistoryEntryById(id);

    var carData = await CarDataAccess.GetCarDataById(washEntry[0].car_id);

    var result = await WashHistoryDataAccess.UpdateHistoryEntryById(id, date, wash_type_id, washer_id);

    if (ctx.request.body.back_url) {
        ctx.redirect(ctx.request.body.back_url);
    }
    else {
        ctx.redirect('/admin/history?reg_number=' + carData.reg_number);
    }
}

async function CreateCarWashEntry(ctx) {

    var carRegNumber = ctx.request.body.reg_number.toUpperCase();
    var date = ctx.request.body.date;
    var washTypeId = ctx.request.body.wash_type_id;
    var washerId = ctx.request.body.washer_id;

    // TODO - function below returns only id while GetByRegNumber whole object - normalize functions
    var CarId = await CarDataAccess.GetByRegNumberOrCreate(carRegNumber);

    var historyEntryId = await WashHistorDataAccess.AddHistory(CarId, washTypeId, date, washerId);

    ctx.redirect('/admin/history?reg_number=' + carRegNumber);
}

module.exports = adminRouter.routes();