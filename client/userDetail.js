function selectedUserProfile(){
    var currentUser = Meteor.users.findOne( {_id: Session.get('userId') } );
    var userItem;
    if (currentUser) {
        return  currentUser.profile;
    }
    return userItem;
}

Template.userDetail.helpers({
    userProfile: function() {
        return selectedUserProfile() ;
    }
});
