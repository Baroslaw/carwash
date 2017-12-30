'use strict'

const KoaRouter = require('koa-router');
const Consolidate = require('consolidate');

const adminRouter = new KoaRouter();

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
adminRouter.get('/admin/carhistory/delete/:id', DeleteCarWashEntry);

adminRouter.get('/admin/userhistory', UserHistory);

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

    var locals = {
        'partials': {
            "AdminMenu" : 'AdminMenu'
        }
    }
    if ("reg_number" in ctx.request.query) {
    
        var CarModel = require('app/data_access/car.js');

        var regNumber = ctx.request.query.reg_number.toUpperCase();
        var car = await CarModel.GetByRegNumber(regNumber);

        if (car != null) {

            var WashHistoryModel = require('app/data_access/wash_history.js');
        
            locals.carHistoryEntries = await WashHistoryModel.GetHistoryForCar(car.id);
            locals.hasCarHistory = true;
            locals.reg_number = regNumber;
        }
        else {

            locals.message = "Brak pojazdu o numerze rejestracyjnym " + regNumber;
        }
    }
    ctx.viewModel.content = await Consolidate.mustache('app/views/admin/CarWashHistory.mustache', locals);
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

module.exports = adminRouter.routes();