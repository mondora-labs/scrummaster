Meteor.subscribe('events');

function getEventsArray (product, team){

    /*return [{title:"All Day Event",start:new Date(r,n,1)},
     {title:"Long Event",start:new Date(r,n,e-5),end:new Date(r,n,e-2)},
     {id:999,title:"Repeating Event",start:new Date(r,n,e-3,16,0),allDay:!1},
     {id:999,title:"Repeating Event",start:new Date(r,n,e+4,16,0),allDay:!1},
     {title:"Meeting",start:new Date(r,n,e,10,30),allDay:!1},
     {title:"Lunch",start:new Date(r,n,e,12,0),end:new Date(r,n,e,14,0),allDay:!1},
     {title:"Birthday Party",start:new Date(r,n,e+1,19,0),end:new Date(r,n,e+1,22,30),allDay:!1},
     {title:"Click for Google",start:new Date(r,n,28),end:new Date(r,n,29),url:"http://google.com/"}] ; */

   /* var t = new Date();
    var e=t.getDate();
    var n=t.getMonth();
    var r=t.getFullYear();
     */
    var events = new Array();

    var eventsQuery = Events.find({
        $and: [
            {product_slug: product},
            {team_slug: team}
              ]
    }).fetch();

    for (var i=0; i<eventsQuery.length; i++) {

        var startDate = eventsQuery[i].startDate.split("/");
        var startTime = eventsQuery[i].startTime.split(":");

        var endDate = eventsQuery[i].endDate.split("/");
        var endTime = eventsQuery[i].endTime.split(":");

        events.push({
            id: eventsQuery[i]._id,
            title: eventsQuery[i].title,
            start:new Date(startDate[2], startDate[1]-1, startDate[0], startTime[0], startTime[1]),
            end: (endDate.length == 3)? new Date(endDate[2], endDate[1]-1, endDate[0], endTime[0], endTime[1]) : "",
            allDay: eventsQuery[i].allDay,
            url: eventsQuery[i].url
        })
    }

    return events;

}

function buildTimePicker() {
    var result = document.createElement('span');
    var hours = document.createElement('select');
    hours.setAttribute('class', 'timeSelect hours');
  /*
    var option = document.createElement('option');
    option.setAttribute('value', '-');
    option.appendChild(document.createTextNode('HH'));
    hours.appendChild(option);
    */
    for (var h=0; h<24; h++) {
        var option = document.createElement('option');
        option.setAttribute('value', (h<10)?'0'+h : h);
        option.appendChild(document.createTextNode((h<10)?'0'+h : h));
        hours.appendChild(option);
    }

    var minutes = document.createElement('select');
    minutes.setAttribute('class', 'timeSelect minutes');
   /*
    var option = document.createElement('option');
    option.setAttribute('value', '-');
    option.appendChild(document.createTextNode('MM'));
    minutes.appendChild(option);
     */
    for (var m=0; m<60; m++) {
        var option = document.createElement('option');
        option.setAttribute('value', (m<10)? '0'+m : m);
        option.appendChild(document.createTextNode( (m<10)? '0'+m : m));
        minutes.appendChild(option);
    }
    result.appendChild(hours);
    result.appendChild(document.createTextNode(" : "));
    result.appendChild(minutes);

    return result;
}

function appendDeleteButtons() {
    var iconDelete = document.createElement('i');
    iconDelete.setAttribute('class', 'icon-remove rfloat');

    return iconDelete;
}

Template.fullCalendar.rendered = function() {

    $( "#new-event-dialog" ).dialog({
        autoOpen: false,
        height: 450,
        width: 450,
        modal: true,
        buttons: {
            "Create event": function() {

                var title = $('#title').val();

                var startDate = $('#startDate').val();
                var startHour = $('#init .hours').val();
                var startMinutes = $('#init .minutes').val();

                var endDate = $('#endDate').val();
                var endHour = $('#end .hours').val();
                var endMinutes = $('#end .minutes').val();

                var allDay = $('#allDayChBox').prop('checked');
                var url = $('#url').val();

                Events.insert( {
                    product_slug: Session.get('currentProduct'),
                    team_slug: Session.get('currentTeam'),
                    title: title,
                    startDate: startDate,
                    startTime: startHour +':'+ startMinutes, //"16:00",
                    endDate: endDate,
                    endTime: endHour +':'+ endMinutes,//"18:00",
                    allDay: allDay,
                    url: url
                });

                $( this ).dialog( "close" );
                location.reload();

            },
            "Cancel": function() {
                $( this ).dialog( "close" );
            }
        }
    });

    $('#init').append(buildTimePicker);
    $('#end').append(buildTimePicker);

    $( "#newEventBtn" ).button().click(function() {

        $('#startDate').datepicker({
            dateFormat: "dd/mm/yy"
        });

        $('#endDate').datepicker({
            dateFormat: "dd/mm/yy"
        });

        $( "#new-event-dialog" ).dialog( "open" );
    });

    setTimeout(function(){
        $('.fc-event-inner').append(appendDeleteButtons);
        $( ".icon-remove" ).click(function() {
            alert('[TODO] - da implementare la rimozione');
            return false;
        });

    }, 2000);

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

        }
    });
}






