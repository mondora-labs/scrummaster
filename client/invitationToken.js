Meteor.subscribe('invitationToken');

function selectedTokenAndLogin(){

    var token =  getToken();

    if (token) {
        // se il token viene riconosciuto

        // login utente
        Meteor.loginWithGoogle({
            requestPermissions: ['email', 'profile']
        }, function (err) {
            if(err) {
                //error handling
                alert('error : '+ err + '; '+err.message);
                throw new Meteor.Error(Accounts.LoginCancelledError.numericError, 'Error');
            } else {
                //show an alert
                // alert('logged in');
            }
        });


    }
    return token;
}

function getToken () {
    // return InvitationToken.find(); // tutti i token
    var tokenString = this.location.href.substring(this.location.href.indexOf('?')+1);
    var token =  InvitationToken.findOne( {token: tokenString}); // solo il token corrente

    return token;
}

Template.joinTeam.helpers({
    tokens: function() {
        return selectedTokenAndLogin() ;
    }
});


Template.joinTeam.events({

    'click .confirmSubscription' : function () {

        var currentTeam = Session.get('currentTeam');
        var currentProduct = Session.get('currentProduct');

        try {

            // l'utente viene inserito all'interno di un prodotto
            var elementProduct = Products.find({slug: currentProduct}).fetch()[0];
            var productId = elementProduct._id;
            var arrayAllowedUsers = elementProduct.allowedusers;
            var index = $.inArray(Meteor.userId(), arrayAllowedUsers);

            if (index == -1) {
                // se il cliente non è contenuto nel prodotto corrente, lo aggiungo
                arrayAllowedUsers.push(Meteor.userId());
                Products.update( {_id: productId} , {$set:{allowedusers: arrayAllowedUsers}} );

            }

            var token = getToken();
       //     if (token)
       //         InvitationToken.remove(token._id);

            location.href="/"+currentProduct+"/team/"+currentTeam;

        }

        catch(err) {
            $.pnotify({
                title: 'Error during subscription!',
                text: '\n'+err.message,
                type: 'error',
                hide: false
            });
        }

        //prevent reload
        return false;
    }

});