function selectedUserProfile(){
    var currentUser = Meteor.users.findOne( {_id: Session.get('userId') } );
    var userItem;
    if (currentUser) {
        return  currentUser.profile;
    }
    return userItem;
}

function getUserTeamList() {

    var teamList = new Array();
    var products = Products.find().fetch();

    if (products){
        for (var i=0; i<products.length; i++){
            for (var j=0; j<products[i].team.length; j++){
                var index = $.inArray(Session.get('userId'), products[i].team[j].members);
                if ( index != -1 ||
                     products[i].scrummaster == Session.get('userId') ||
                     products[i].productowner == Session.get('userId')
                    ) {
                    teamList.push({
                        product: products[i].slug,
                        team: products[i].team[j]
                    });
                }
            }
        }
    }
    return teamList;
}

Template.userDetail.helpers({
    userProfile: function() {
        return selectedUserProfile() ;
    },

    teamList: function() {
        return getUserTeamList();
    }
});
