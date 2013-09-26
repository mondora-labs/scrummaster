Meteor.subscribe('dailyscrum');

var tasksinputText = 0;

Template.dailyscrum.rendered = function() {

    var d = new Date();
    $( "#datepicker" ).datepicker({
        changeMonth: true,
        changeYear: true,
        defaultDate: d,
        dateFormat: 'dd-mm-yy'
    });

    $( "#datepicker" ).datepicker( "setDate", d );

    $(function() {
   //     $( ".draggable_yesterday" ).draggable({ containment: ".yesterday", scroll: false });
        $( ".draggable_today" ).draggable({
            snap: true,
            grid: [ 50, 100 ],
            containment: "#containmentDiv",
            start: function(event, ui) {

            },
            stop: function(event, ui) {
                // uso la coordinata Y per capire se l'oggetto è stato draggato nel container

                // startY > finalY : oggetto spostato in su, quindi inserito
                // startY < finalY : oggetto spostato in giù, quindi tolto
                // startY = finalY : oggetto non è stato spostato verticalmente
                var startY = ui.originalPosition.top;
                var finalY = ui.position.top;

                // aggiungo/sottraggo 50 per evitare di considerare i piccoli spostamenti dell'immagine
                if (startY > (finalY+50))
                    alert('oggetto in su.. verrà aggiunto')
                else if (startY < (finalY-50))
                    alert('oggetto in giù.. verrà tolto');

            }
        /*{ snap: ".ui-widget-header" }*/ /*{containment: ".today", scroll: false }*/
        });
    });

    $('.yesterdayPanel').hide();
    $('.todayPanel').hide();
    $('.buttonsPanel').hide();

}

Template.dailyscrum.events({

    'change #datepicker': function (event, template) {

        // se cancello la data, obbligo utente a re-inserirla per vedere la pagina
        if ($(event.target).val() == '' ) {
            $('.selected').removeClass('selected');
            $('.yesterdayPanel').hide();
            $('.todayPanel').hide();
            $('.buttonsPanel').hide();
        }
    },

    'click .user': function (event, template) {

        var selectedUserId;
        $('.selected').removeClass('selected');

        if(event.target.parentElement.id == 'teamlist') {
            selectedUserId = event.target.id;
            $(event.target).addClass('selected');
        }
        else  {
            selectedUserId = event.target.parentElement.id;
            $(event.target.parentElement).addClass('selected');
        }


        // format Date : Thu Sep 26 2013 00:00:00 GMT+0200 (CEST)
        // se si usa questo la condizione if sotto deve essere "if (!selectedDate)"
        //var selectedDate = $( "#datepicker" ).datepicker( "getDate");

        // format Date : 26-09-2013
        var selectedDate = $( "#datepicker" ).val();

        if (selectedDate == '') {
            alert ("Please select a date to load daily scrum...")
        }
        else {
            $('.yesterdayPanel').show();
            $('.todayPanel').show();
            $('.buttonsPanel').show();
        }

        Session.set('dailyScrumUserId', selectedUserId);
        return false;
    },

    'click .addTextboxButton': function (event, template) {

        $('#divInputText').append( "<input id='tasksInput_"+tasksinputText+"' value='Some Text..."+tasksinputText+"'/> <button class='removeBtn btn btn-default' id='"+tasksinputText+"'>Remove</button>" );
        tasksinputText++;
        return false;
    },

    'click .removeBtn': function (event, template) {
        var idToRemove = event.target.id;
        $('#tasksInput_'+idToRemove).remove();
        $('#'+idToRemove).remove();
        return false;
    }
});
