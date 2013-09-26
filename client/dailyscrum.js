Meteor.subscribe('dailyscrum');

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
        $( ".draggable_yesterday" ).draggable({ containment: ".yesterday", scroll: false });
        $( ".draggable_today" ).draggable({ containment: ".today", scroll: false });
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

        $('.selected').removeClass('selected');
        var selectedUserId;

        if(event.target.parentElement.id == 'teamlist') {
            $(event.target).addClass('selected');
            selectedUserId = event.target.id;
        }
        else  {
            $(event.target.parentElement).addClass('selected');
            selectedUserId = event.target.parentElement.id;
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
            alert ("[ " + selectedDate + " ] loading daily scrum for user "+selectedUserId);

            $('.yesterdayPanel').show();
            $('.todayPanel').show();
            $('.buttonsPanel').show();
        }
        return false;
    }
});
