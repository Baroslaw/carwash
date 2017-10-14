'use strict'

const KoaRouter = require('koa-router');
const Consolidate = require('consolidate');

const adminRouter = new KoaRouter();

adminRouter.get('/admin', MainAdminPage);
adminRouter.get('/admin/users', UsersPage);
adminRouter.post('/admin/users', NewUser);
adminRouter.get('/admin/users/delete/:id', DeleteUser); // TODO - change to POST

adminRouter.get('/admin/washtypes', WashTypesPage);
adminRouter.post('/admin/washtypes', NewWashType);
adminRouter.get('/admin/washtypes/delete/:id', DeleteWashType);  // TODO - change to POST

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

async function DeleteWashType(ctx) {

    var id = ctx.params.id;

    var WashTypeModel = require('app/models/wash_type.js');

    await WashTypeModel.DeleteWashTypeById(id);

    ctx.redirect('/admin/washtypes');
}

module.exports = adminRouter.routes();