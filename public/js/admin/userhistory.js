$(document).ready(function(){
    var userHistoryItem = $('#user_history_modal');
    if (userHistoryItem.length > 0)
    {
        var modal = new SotModal(userHistoryItem);

        if (window.location.href.indexOf('?') == -1) {
            modal.showModal();
        }
    }
});