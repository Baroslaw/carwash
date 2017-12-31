$(document).ready(function(){
    var carHistoryItem = $('#car_history_modal');
    if (carHistoryItem.length > 0)
    {
        var modal = new SotModal(carHistoryItem);

        if (window.location.href.indexOf('?') == -1) {
            modal.showModal();
        }
    }

    var editHistoryEntryItem = $('#edit_wash_entry');
    var editHistoryEntryModal;
    if (editHistoryEntryItem.length > 0)
    {
        editHistoryEntryModal = new SotModal(editHistoryEntryItem);
    }

    $('.content').on('click', 'a.remove',function(event){

        event.preventDefault();
        var url = $(this).attr("href");
        var name = $(this).parents('tr').data('name');

        var messageBox = new Noty({
            text: `Usunąć wpis ${name}?`,
            type: 'alert',
            buttons: [
                Noty.button('Usuń', 'form-button', function(){
                    window.location.href = url;
                }),
                Noty.button('Anuluj', 'form-button', function(){
                    messageBox.close();
                })
            ]
        }).show();
    });

    $('.content').on('click', 'a.edit',function(event){

        event.preventDefault();

        var tr = $(this).parents('tr');
        var url = $(this).attr("href");

        editHistoryEntryModal.showModal({
            'date': tr.data('date'),
            'wash_type_id': tr.data('wash_type_id'),
            'washer_id': tr.data('washer_id'),
            'action': url,
        });
    });
});