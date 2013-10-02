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
    },

    scrummaster : function() {
        var scrummaster = selectedProduct().scrummaster;
        if (scrummaster)
            return Meteor.users.findOne(selectedProduct().scrummaster);

    },

    productowner : function() {
        var productowner = selectedProduct().productowner;
        if (productowner)
            return Meteor.users.findOne(selectedProduct().productowner);

    }
});


Template.userTeam.events({
    'click #deleteSM': function (event, template) {
        Products.update( {_id: selectedProduct()._id} , {$set:{scrummaster: ""}} );
        return false;
    },

    'click #deletePO': function (event, template) {
        Products.update( {_id: selectedProduct()._id} , {$set:{productowner: ""}} );
        return false;
    },

    'click .deleteTM': function (event, template) {
        var userId = $(event.target).val();
        alert(userId);

        var product = selectedProduct();
        var teamArray = product.team;

        for (var i=0; i< teamArray.length; i++){
            if (teamArray[i].slug == Session.get('currentTeam')){
                var index = ($.inArray(userId, teamArray[i].members));
                if (index != -1)
                    // rimuovo l'utente dalla lista dei membri
                    teamArray[i].members.splice(index, 1);


                break;
            }
        }

        Products.update( {_id: product._id} , {$set:{team: teamArray}} );

        return false;
    }
});


Template.dailyscrum.helpers({
    teamInfo: function() {
        var team = selectedTeam();
            if (team) {
            team.teamUserInfo = new Array();

            for (var i=0; i<team.members.length; i++){
                var currentUser = Meteor.users.findOne(team.members[i]);
                if (currentUser)
                    team.teamUserInfo.push(currentUser);
            }
        }
        return team;
    }
});

Template.matchToken.helpers({
    teamInfo: function() {
        return selectedTeam() ;
    }
});




