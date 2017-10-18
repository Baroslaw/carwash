$(document).ready(function(){
    var newUserItem = $('#new_user_modal');
    if (newUserItem.length > 0) {
        var newUserModal = new SotModal(newUserItem);
        
        $('.content')
        .on('click','#show_new_user_button',function(){

            newUserModal.showModal({
                'action': "/admin/users",
                'submitText': "Utwórz"
            });
        })
        .on('click','a.edit', function(e){

            e.preventDefault();
            var tr = $(this).parents('tr');
            newUserModal.showModal({
                'id': tr.data('id'),
                'username': tr.data('name'),
                'user_role': tr.data('role'),
                'action': $(this).attr('href'),
                'submitText': "Modyfikuj"
            });
        });
        
        newUserItem.on("success", function(event, result){
            // updateTransitOnPage(result);
        });
    }

    $('.content').on('click', 'a.remove',function(event){

        event.preventDefault();
        var url = $(this).attr("href");
        var name = $(this).parents('tr').data('name');

        var messageBox = new Noty({
            text: `Usunąć użytkownika ${name}?`,
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
