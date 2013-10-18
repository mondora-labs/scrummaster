Meteor.subscribe('events');

function getEventsArray (product, team){

    var t = new Date();
    var e=t.getDate();
    var n=t.getMonth();
    var r=t.getFullYear();

    var events = new Array();

    var eventsQuery = Events.find({
        $and: [
            {product_slug: product},
            {team_slug: team}
              ]
    }).fetch();

    for (var i=0; i<eventsQuery.length; i++) {
        events.push({
            title: eventsQuery[i].title,
            start:new Date(r,n,e)
        })
    }

    return events;

}

function buildTimePicker() {
    var result = document.createElement('span');
    var hours = document.createElement('select');
    hours.setAttribute('id', 'hour');
    for (var h=1; h<13; h++) {
        var option = document.createElement('option');
        option.setAttribute('value', h);
        option.appendChild(document.createTextNode(h + 'h'));
        hours.appendChild(option);
    }
    var minutes = document.createElement('select');
    minutes.setAttribute('id', 'minute');
    for (var m=0; m<60; m++) {
        var option = document.createElement('option');
        option.setAttribute('value', m);
        option.appendChild(document.createTextNode(m + 'm'));
        minutes.appendChild(option);
    }
    result.appendChild(hours);
    result.appendChild(document.createTextNode(" : "));
    result.appendChild(minutes);

    return result;
}

Template.fullCalendar.rendered = function() {

    $( "#new-event-dialog" ).dialog({
        autoOpen: false,
        height: 450,
        width: 450,
        modal: true,
        buttons: {
            "Create event": function() {
               $( this ).dialog( "close" );
            },
            "Cancel": function() {
                $( this ).dialog( "close" );
            }
        }
    });

    $( "#newEventBtn" ).button().click(function() {
        $('#init').append(buildTimePicker);

        $('#startDate').datepicker({
            dateFormat: "dd/mm/yy"
        });

        $('#endDate').datepicker({
            dateFormat: "dd/mm/yy"
        });

        $( "#new-event-dialog" ).dialog( "open" );
    });


    var t = new Date();
    var e=t.getDate();
    var n=t.getMonth();
    var r=t.getFullYear();

    $("#fullCalendar").fullCalendar({
        header:{
            left:"prev,next",
            center:"title",
            right:"month,agendaWeek,agendaDay"},

        editable: true,
  //      droppable: true,

        firstDay:1,

        //weekends: false,
        weekMode: 'variable',

        dayClick: function() {
           // alert('a day has been clicked!');
        },

        events: function(start, end, callback) {
            var t = new Date();
            var e=t.getDate();
            var n=t.getMonth();
            var r=t.getFullYear();

            var events = getEventsArray(Session.get('currentProduct'), Session.get('currentTeam'));

            callback(events);
            /*return [{title:"All Day Event",start:new Date(r,n,1)},
                {title:"Long Event",start:new Date(r,n,e-5),end:new Date(r,n,e-2)},
                {id:999,title:"Repeating Event",start:new Date(r,n,e-3,16,0),allDay:!1},
                {id:999,title:"Repeating Event",start:new Date(r,n,e+4,16,0),allDay:!1},
                {title:"Meeting",start:new Date(r,n,e,10,30),allDay:!1},
                {title:"Lunch",start:new Date(r,n,e,12,0),end:new Date(r,n,e,14,0),allDay:!1},
                {title:"Birthday Party",start:new Date(r,n,e+1,19,0),end:new Date(r,n,e+1,22,30),allDay:!1},
                {title:"Click for Google",start:new Date(r,n,28),end:new Date(r,n,29),url:"http://google.com/"}] ; */
        }
    });
}





