$(document).ready(function(){
    var historyItem = $('#history_modal');
    if (historyItem.length > 0)
    {
        var historyModal = new SotModal(historyItem);

        if (window.location.href.indexOf('?') == -1) {
            historyModal.showModal();
        }
    }

    var editHistoryEntryItem = $('#edit_wash_entry');
    var editHistoryEntryModal  = null;
    if (editHistoryEntryItem.length > 0)
    {
        editHistoryEntryModal = new SotModal(editHistoryEntryItem);
    }

    var notesLegendItem = $('#notes_legend');
    var notesLegendModal = null;
    if (notesLegendItem.length > 0)
    {
        notesLegendModal = new SotModal(notesLegendItem);
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
        var table = $(this).parents('table');

        editHistoryEntryModal.showModal({
            'reg_number': tr.data('reg_number'),
            'date': tr.data('date'),
            'wash_type_id': tr.data('wash_type_id'),
            'washer_id': tr.data('washer_id'),
            'submitText': "Aktualizuj",
            'back_url': window.location.pathname + window.location.search,
            'action': url,
        });
    });

    $('.content').on('click','#show_new_history_entry_button',function(){

        editHistoryEntryModal.showModal({
            'action': "/admin/carhistory/create",
            'submitText': "Utwórz"
        });
    });

    $('.content').on('click','#filter_button',function(){

        var params = {};

        // Get current filter parameters
        $('#filter_button').find('span.filter_value').each(function(index,object){
            params[object.dataset.key] = object.dataset.value;
        });

        historyModal.showModal(params);
    });

    // Click on icon shows legend
    $('.content').on('click','.attrs .icon',function(){

        notesLegendModal.showModal();
    });
});