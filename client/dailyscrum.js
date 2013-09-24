Meteor.subscribe('dailyscrum');

Template.dailyscrum.rendered = function() {
    var d = new Date();
    $( "#datepicker" ).datepicker({
        changeMonth: true,
        changeYear: true,
        defaultDate: d,
        dateFormat: 'dd-mm-yy'
    });
}
                             


