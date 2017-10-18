$(document).ready(function(){
    var carHistoryItem = $('#car_history_modal');
    if (carHistoryItem.length > 0)
    {
        var modal = new SotModal(carHistoryItem);

        if (window.location.href.indexOf('?') == -1) {
            modal.showModal();
        }
    }
});