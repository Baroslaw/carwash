const Koa = require('koa');
const KoaRouter = require('koa-router');
const Views = require('koa-views');
const KoaStatic = require('koa-static');
const app = new Koa();
const router = new KoaRouter();

// Views initialization
app.use(Views(__dirname + '/views', {
    extension: "mustache",
    map: {
        mustache: "mustache"
    }
}));

// Static files provider
app.use(KoaStatic(__dirname + '/public'));

// Routing initialization
router.get('/wash', RegistrationNumberForm);
router.get('/wash/:id', Wash);
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

function Wash(ctx) {
    console.log("Wash called with id=" + ctx.params.id);
    ctx.body = "Wash" + ctx.params.id;
}

app.listen(3000);
