Meteor.subscribe('dailyscrum');

var tmpDudePicture = "https://lh4.googleusercontent.com/-77wocJdaiXg/AAAAAAAAAAI/AAAAAAAAAAA/NN3q52w3EXQ/s48-c/photo.jpg";
var tmpDudeUserId = "";

function resetTodayPair() {

    Session.set('tmpDudePicture',tmpDudePicture);
    Session.set('tmpDudeUserId',tmpDudeUserId);

}

Template.dailyscrum.rendered = function() {

    if (Session.get('tmpDudePicture') == null)
        resetTodayPair();

    $(function() {
        $( ".draggable_img" ).draggable({
            scroll: false,
            stack: "div",
            revert: true,
            containment: "#todayPair"
      //      stack: "div"
      //      grid: [ 50, 100 ],
      //      containment: "#containmentDiv",
      /*      start: function(event, ui) {

            }*/,
            stop: function(event, ui) {
                if (ui.helper != null && ui.helper.length > 0) {
                    pairMate = ui.helper[0];
                    userid = $(ui.helper).attr('userid');

                    if (userid != Meteor.userId()) {
                        Session.set('tmpDudePicture',pairMate.src);
                        Session.set('tmpDudeUserId',userid);

                    }
                }
            }
        });
    });


    if (Session.get('dailyScrumUserId'))
        $('#dailyScrumPanel').show();
    else
        $('#dailyScrumPanel').hide();

}

Template.dailyscrum.events({

    'click .user': function (event, template) {

        var selectedUserId;
        $('.selected').removeClass('selected');

        if (event.target.parentElement.id == 'teamlist'){
            selectedUserId = event.target.parentElement.id;
            $(event.target.parentElement).addClass('selected');
        }
        else {
            selectedUserId = event.target.parentElement.parentElement.id;
            $(event.target.parentElement.parentElement).addClass('selected');
        }

        Session.set('dailyScrumUserId', selectedUserId);

        $('#dailyScrumPanel').show();

     //   $('#fancyClock').tzineClock();

        return false;
    },

    'click .addTask': function (event, template) {

        event.preventDefault();
        var newTask= {};
        newTask.description = $(".newTaskArea").val();
        newTask.pair = ["bEXEw4wKvFF2BFGGB"];

        var dailyScrumToUpdate = DailyScrum.findOne({
            $and: [
                {product_slug: Session.get('currentProduct')},
                {team_slug: Session.get('currentTeam')},
                {player: Session.get('dailyScrumUserId')}
            ]
        });

        if (dailyScrumToUpdate) {
            var arrayTasks = dailyScrumToUpdate.tasks;
            arrayTasks.splice(0,0,newTask);
            DailyScrum.update( {_id: dailyScrumToUpdate._id} , {$set:{tasks: arrayTasks}} );

        }

        return false;
    },

    'focus .newTaskArea': function (event, template) {

        event.target.value = '';
        return false;
    }

});

Template.dailyscrum.helpers ({

    dailyScrum: function() {
        return DailyScrum.find({
            $and: [
                {product_slug: Session.get('currentProduct')},
                {team_slug: Session.get('currentTeam')},
                {player: Session.get('dailyScrumUserId')}
            ]
        });
    }
});

Template.pairdude.helpers ({

    dudepicture: function() {
        return Session.get('tmpDudePicture');
    }
    ,
    userid : function() {
        return Session.get('tmpDudeUserId');
    }
});

Template.dailyscrum.events({

    'click .removePair': function (event, template) {
        resetTodayPair();
        return false;
    }

});