Meteor.subscribe('Products');

function selectedProduct(){
    return Products.findOne( {slug: Session.get('currentProduct') } );
}

function filterUserTeam(){

    var product =  selectedProduct();
    if (product) {
        var userData = new Array();
        var userIds = selectedProduct().allowedusers;

        for (var i=0; i<userIds.length; i++) {
            var currentUser = Meteor.users.findOne({_id: userIds[i]});
            if (currentUser){

                var userItem = {
                    name: currentUser.profile.name,
                    picture: currentUser.profile.picture
                };

                userData.push(userItem);
            }
        }
        return userData;
    }
}

Template.product.helpers({
    product: function() {
        return selectedProduct() ;
    }
});

Template.userTeam.helpers ({
    users: function() {
        return filterUserTeam() ;
    }
});