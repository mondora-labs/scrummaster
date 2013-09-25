Meteor.subscribe('dailyscrum');

Template.dailyscrum.rendered = function() {
    var d = new Date();
    $( "#datepicker" ).datepicker({
        changeMonth: true,
        changeYear: true,
        defaultDate: d,
        dateFormat: 'dd-mm-yy'
    });

    $(function() {
        $( ".draggable_yesterday" ).draggable({ containment: ".yesterday", scroll: false });
        $( ".draggable_today" ).draggable({ containment: ".today", scroll: false });
    });
}
