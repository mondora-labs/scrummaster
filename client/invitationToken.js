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
            var product = Products.findOne({slug: currentProduct});
            if (product){
                var productId = product._id;
                var teamArray = product.team;
                for (var i=0; i < teamArray.length; i++){
                    if (teamArray[i].slug == currentTeam) {
                        var index = $.inArray(Meteor.userId(), teamArray[i].members);
                        if (index == -1) {
                            // se il cliente non è contenuto nel prodotto e team corrente, lo aggiungo
                            teamArray[i].members.push(Meteor.userId());
                            Products.update( {_id: productId} , {$set:{team: teamArray}} );

                        }
                        break;
                    }
                }
            }

            var token = getToken();
            // todo commentato per debug, è da decommentare
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