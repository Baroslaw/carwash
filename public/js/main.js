$(document).ready(function() {

    Noty.overrideDefaults({
        theme: 'metroui',
        layout: 'center',
        modal: true
    });

    var item = $('a[href="'+window.location.pathname+'"]');
    if (item.length > 0) {
        item.addClass('active_link');
    }
});
