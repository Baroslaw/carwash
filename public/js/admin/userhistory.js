$(document).ready(function(){
    var userHistoryItem = $('#user_history_modal');
    if (userHistoryItem.length > 0)
    {
        $(".daypicker").datepicker({
            language: "pl-PL",
            zIndex: 9999,
            format: "YYYY-MM-DD",
            weekStart: 1,
            offset: 10,
            autoHide: true
        });

        var modal = new SotModal(userHistoryItem);

        if (window.location.href.indexOf('?') == -1) {
            modal.showModal();
        }
    }
});