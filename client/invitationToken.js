Meteor.subscribe('invitationToken');

function selectedToken(){
   // return InvitationToken.find(); // tutti i token
    var tokenString = this.location.href.substring(this.location.href.indexOf('?')+1);
    var token =  InvitationToken.findOne( {token: tokenString}); // solo il token corrente
    if (token) {
        // se il token viene riconosciuto,
        // creazione utente

        // login utente
        // todo commentato perchè non testato
    /*    Meteor.loginWithGoogle({
            requestPermissions: ['email', 'profile']
        }, function (err) {
            if(err) {
                //error handling
                alert('error : '+ err);
                throw new Meteor.Error(Accounts.LoginCancelledError.numericError, 'Error');
            } else {
                //show an alert
                // alert('logged in');
            }
        });
    */
        // rimozione token
        // todo da trovare altra soluzione.. con la remove viene fatto il refresh della pagina e si atterra sempre su template noMatchToken
        //InvitationToken.remove(token._id);

    }
    return token;
}

Template.joinTeam.helpers({
    tokens: function() {
        return selectedToken() ;
    }
})