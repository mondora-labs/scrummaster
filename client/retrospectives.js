Meteor.subscribe('retrospectives');

function getRetrospectiveList(product,team) {

    var retrospectiveArray = Retrospectives.find({
        $and: [
            {product_slug: product},
            {team_slug: team}
        ]
    }).fetch();

    if (retrospectiveArray) {

        for (var i=0; i<retrospectiveArray.length;i++) {

            var lessonsLearnedArray = retrospectiveArray[i].lessonlearned;

            for (var j=0; j < lessonsLearnedArray.length; j++) {
                lessonsLearnedArray[j].retrospectiveId = retrospectiveArray[i]._id;
                var commentsArray = lessonsLearnedArray[j].comments;

                if (commentsArray) {

                    for (var k=0; k<commentsArray.length; k++) {
                        var userInfo = Meteor.users.findOne({_id: commentsArray[k].user});
                        if (userInfo)
                            commentsArray[k].user = userInfo.profile.picture;
                    }
                    lessonsLearnedArray[j].comments = commentsArray;
                }
            }
            retrospectiveArray[i].lessonlearned = lessonsLearnedArray;
        }
    }

    return retrospectiveArray;
}

Template.retrospectives.events ({

    'click .addLessonLearned': function (event, template) {

        var retrospectiveId = $(event.target).attr('retrospectiveId');
        var retrospectiveElement = Retrospectives.findOne({_id: retrospectiveId});

        var currentLessonLearned = {};
        currentLessonLearned.id = Meteor.uuid();
        currentLessonLearned.description = $('.UFIAddLessonLearnedInput.'+retrospectiveId).val();
        currentLessonLearned.comments = new Array();

        if (retrospectiveElement) {
            var lessonLearnedArray = retrospectiveElement.lessonlearned;
            lessonLearnedArray.splice(0,0,currentLessonLearned);
            Retrospectives.update( {_id: retrospectiveId} , {$set:{lessonlearned: lessonLearnedArray}} );
        }
        return false;
    },

    'click .addTopicComment': function (event, template) {

        var retrospectiveId = $(event.target).attr('retrospectiveId');
        var lessonlearnedId = $(event.target).attr('lessonlearnedId');

        var commentText = $('.UFIAddCommentInput.'+lessonlearnedId).val();

        var newComment = {};
        newComment.user = Meteor.userId();
        newComment.text = commentText;

        var retrospectiveElement = Retrospectives.findOne({_id: retrospectiveId});

        if (retrospectiveElement) {
            var lessonLearnedArray = retrospectiveElement.lessonlearned;
            for (var i=0; i<lessonLearnedArray.length; i++) {
                if (lessonLearnedArray[i].id == lessonlearnedId) {
                    lessonLearnedArray[i].comments.splice(0,0,newComment);
                    break;
                }
            }

            Retrospectives.update( {_id: retrospectiveId} , {$set:{lessonlearned: lessonLearnedArray}} );
        }

        return false;
    }
});

Template.retrospectives.helpers ({

    teamName: function() {
        return Session.get('currentTeam');
    },

    retrospectives: function() {
        return getRetrospectiveList(Session.get('currentProduct'),Session.get('currentTeam'));
    },

    currentUserImage: function (){
        return Meteor.user().profile.picture;
    }

});