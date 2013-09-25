Meteor.subscribe('Products');

function selectedProduct(){
    return Products.findOne( {slug: Session.get('currentProduct') } );
}

function selectedTeam() {
    var product = selectedProduct();
    if (product) {
        for (var i=0; i<product.team.length; i++){
            if (product.team[i].slug == Session.get('currentTeam'))
                return product.team[i];
        }
    }
}

function filterUserTeam(){

    var userData = new Array();
    var team =  selectedTeam();

    if (team) {
        // recupero tutti gli utenti del prodotto e team corrente
        team.members.forEach(function(userId){
            var currentUser = Meteor.users.findOne({_id: userId});
            if (currentUser){
                var userItem = {
                    name: currentUser.profile.name,
                    picture: currentUser.profile.picture,
                    id: userId
                };
                userData.push(userItem);
            }
        });
    }
    return userData;

}

Template.product.helpers({
    product: function() {
        return selectedProduct();
    }
});

Template.team.helpers({
    teamInfo: function() {
        return selectedTeam();
    }
});

Template.userTeam.helpers ({
    users: function() {
        return filterUserTeam() ;
    }
});

