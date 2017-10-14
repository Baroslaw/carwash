$(document).ready(function(){
    var newWashTypeItem = $('#new_wash_type_modal');
    if (newWashTypeItem.length > 0) {
        var modal = new SotModal(newWashTypeItem);
        
        $('.content').on('click','#show_new_wash_type_button',function(){
            // var transitId = $(this).parents('tr').data('transit_id');

            modal.showModal({
                // "transit_id" : transitId
            });
        });
        
        newWashTypeItem.on("success", function(event, result){
            // updateTransitOnPage(result);
        });    
    }

    $('.content').on('click', 'a.remove',function(event){

        event.preventDefault();
        var url = $(this).attr("href");
        var name = $(this).parents('tr').data('name');

        var messageBox = new Noty({
            text: `Usunąć typ mycia ${name}?`,
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
