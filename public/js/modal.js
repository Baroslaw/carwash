function SotModal(modal)
{
    var self = this;
    var form = modal.find('form');

    this.removeErrors = function() {
        // TODO - clear all errors
        var errors = form.find('.error');
        $.each(errors, function(){
            $(this).remove();
        });
    }
    
    this.setErrors = function(result) {

        this.removeErrors();
        
        if (!result.hasOwnProperty('errors')) {
            return;
        }

        $.each(result.errors, function(key, value){
            var error = $('<div class="error">'+value+'</div>');
            var item = form.find('[name='+key+']');
            
            if (item.length) {
                $(item).parent().prepend(error);
            }
            else {
                $(form.find('.description')).after(error);
            }
        });
    }

    /**
     * Shows modal dialog. Sets values to fields by their names
     * @param {type} params
     * @returns {undefined}
     */
    this.showModal = function(params) {
        if (params != null)
        {
            // Handle inputs
            var inputs = form.find(':input[type!=submit]');
            inputs.each(function() {
                
                var inputId = $(this).attr('name');
                
                $(this).val(params.hasOwnProperty(inputId) ? params[inputId] : '');
            });

            if (params.hasOwnProperty('action')) {
                form.attr('action', params['action']);
            }
            if (params.hasOwnProperty('submitText')) {
                var submitButton = form.find('[type=submit]');
                if (submitButton.length > 0) {
                    $(submitButton).text(params['submitText']);
                }
            }
        }
        modal.show();
    }
    
    this.hideModal = function() {
        this.removeErrors();
        modal.hide();
    }
    
    form.on('submit', function(e){

        var form = $(e.target);

        var method = form.attr('method');

        if (method == 'get') {
            return true;
        }

        // Prevent form submission
        e.preventDefault();

        // Use Ajax to submit form data
        $.ajax({
            url: form.attr('action'),
            type: form.attr('method'),
            data: form.serialize(),
            dataType: 'json',
            encode: true,
            success: function(result) {
                self.setErrors(result);
                if (result.hasOwnProperty('success')) {
                    self.hideModal();
                    modal.trigger('success', [result]);
                }
            },
            error: function(result) {
                self.hideModal();
                $('body').html(result.responseText);
            }
        });
    });

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal[0]) {
            self.hideModal();
        }
    }
    
    modal.find(".modal-close").on('click', function(event) {
        self.hideModal();
        event.preventDefault();
    });
   
}

