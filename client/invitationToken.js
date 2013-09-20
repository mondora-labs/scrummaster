Meteor.subscribe('invitationToken');

function selectedToken(){
   // return InvitationToken.find(); // tutti i token
    var token =  InvitationToken.findOne( {token: this.location.href.substring(this.location.href.indexOf('?')+1)}); // solo il token corrente
    if (token) {
        // se il token viene riconosciuto,
        // creazione utente
        // login utente
        // rimozione token
    }
    return token;
}

Template.joinTeam.helpers({
    tokens: function() {
        return selectedToken() ;
    }
})