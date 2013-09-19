Meteor.subscribe('invitationToken');

function selectedToken(){
    return InvitationToken.findOne( {token: ''});
}

Template.team.helpers({
    tokens: function() {
        return selectedToken() ;
    }
})