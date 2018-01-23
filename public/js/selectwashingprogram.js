$(document).ready(function(){
    var carHistoryItem = $("#car_history_modal");

    if (carHistoryItem.length > 0)
    {
        var carHistoryModal = new SotModal(carHistoryItem);

        $('.content').on('click','#show_history_modal_button',function(event){
            event.preventDefault();
            carHistoryModal.showModal();
        });
    }
});