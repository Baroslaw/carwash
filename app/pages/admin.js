'use strict'

const KoaRouter = require('koa-router');
const Consolidate = require('consolidate');

const adminRouter = new KoaRouter();

adminRouter.get('/admin', MainAdminPage);
adminRouter.get('/admin/users', UsersPage);
adminRouter.post('/admin/users', NewUser);
adminRouter.get('/admin/users/delete/:id', DeleteUser); // TODO - change to POST
adminRouter.post('/admin/users/update/:id', UpdateUser); // TODO - change to POST
adminRouter.get('/admin/users/history/:id', UserHistory);

adminRouter.get('/admin/washtypes', WashTypesPage);
adminRouter.post('/admin/washtypes', NewWashType);
adminRouter.post('/admin/washtypes/update/:id', UpdateWashType);
adminRouter.get('/admin/washtypes/delete/:id', DeleteWashType);  // TODO - change to POST

adminRouter.get('/admin/carhistory', CarHistory);

async function MainAdminPage(ctx) {

    // TODO - build view model upper
    ctx.viewModel.content = await Consolidate.mustache('app/views/admin/AdminMenu.mustache', {});

    await ctx.render('MainView', ctx.viewModel);
}

async function UsersPage(ctx) {
    
    var UserModel = require('app/models/user.js');

    var locals = {
        "users": await UserModel.GetAllUsersData(),
        "partials": {
            "AdminMenu" : 'AdminMenu'
        }
    }
    var viewModel = {
        "user": ctx.session.user,
        "content": await Consolidate.mustache('app/views/admin/Users.mustache', locals)
    }
    await ctx.render('MainView', viewModel);
}

async function NewUser(ctx) {

    var user_name = ctx.request.body.username;
    var user_role = ctx.request.body.user_role;
    var user_password = ctx.request.body.password;

    var UserModel = require('app/models/user.js');

    UserModel.CreateUser(user_name, user_role, user_password);

    ctx.redirect('/admin/users');
}

async function DeleteUser(ctx) {

    var id = ctx.params.id;

    var UserModel = require('app/models/user.js');

    // TODO - react on error/success
    await UserModel.DeleteUserById(id);

    ctx.redirect('/admin/users');
}

async function UpdateUser(ctx) {

    var id = ctx.params.id;
    var user_name = ctx.request.body.username;
    var user_role = ctx.request.body.user_role;
    var user_password = ctx.request.body.password;

    var UserModel = require('app/models/user.js');

    await UserModel.UpdateUser(id, user_name, user_role, user_password);

    ctx.redirect('/admin/users');
}

async function UserHistory(ctx) {

    var id = ctx.params.id;
    var WashHistoryModel = require('app/models/wash_history.js');
    var UserModel = require('app/models/user.js');

    var locals = {
        "washHistory": await WashHistoryModel.GetHistoryForUser(id),
        "user": await UserModel.GetUserById(id),
        "partials": {
            "AdminMenu" : 'AdminMenu'
        }
    }
    ctx.viewModel.content = await Consolidate.mustache('app/views/admin/UserWashHistory.mustache', locals);

    await ctx.render('MainView', ctx.viewModel);
}


async function WashTypesPage(ctx) {

    var WashTypeModel = require('app/models/wash_type.js');

    var locals = {
        'washTypes': await WashTypeModel.GetWashTypes(),
        'partials': {
            "AdminMenu" : 'AdminMenu'
        }
    }

    ctx.viewModel.content = await Consolidate.mustache('app/views/admin/WashTypes.mustache', locals);
    await ctx.render('MainView', ctx.viewModel);
}

async function NewWashType(ctx) {

    var order_number = ctx.request.body.order_number;
    var name = ctx.request.body.wash_type_name;
    var description = ctx.request.body.description;

    var WashTypeModel = require('app/models/wash_type.js');
    
    await WashTypeModel.AddWashType(order_number, name, description);

    ctx.redirect('/admin/washtypes');
}

async function UpdateWashType(ctx) {

    var id = ctx.params.id;
    var order_number = ctx.request.body.order_number;
    var name = ctx.request.body.wash_type_name;
    var description = ctx.request.body.description;

    var WashTypeModel = require('app/models/wash_type.js');

    await WashTypeModel.UpdateWashType(id, order_number, name, description);

    ctx.redirect('/admin/washtypes');
}

async function DeleteWashType(ctx) {

    var id = ctx.params.id;

    var WashTypeModel = require('app/models/wash_type.js');

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
    
        var CarModel = require('app/models/car.js');

        var regNumber = ctx.request.query.reg_number;
        var car = await CarModel.GetByRegNumber(regNumber);

        if (car != null) {

            var WashHistoryModel = require('app/models/wash_history.js');
        
            locals.carHistoryEntries = await WashHistoryModel.GetHistoryForCar(car.id);
            locals.hasCarHistory = true;
            locals.reg_number = regNumber;
        }
        else {

            locals.message = "Brak pojazdu o numerze rejestracyjnym " + regNumber;
        }
    }
    ctx.viewModel.content = await Consolidate.mustache('app/views/admin/CarWashHistory.mustache', locals);
    await ctx.render('MainView', ctx.viewModel);
}

module.exports = adminRouter.routes();