$(document).ready(function(){
    var carHistoryItem = $('#car_history_modal');
    if (carHistoryItem.length > 0)
    {
        var modal = new SotModal(carHistoryItem);

        if (window.location.href.indexOf('?') == -1) {
            modal.showModal();
        }
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
});