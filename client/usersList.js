function getUsersListPerProducts(){

    var products = Products.find().fetch();

    products.forEach(function(tmpProduct){
        tmpProduct.team.forEach(function(tmpTeam){
            tmpTeam.members.forEach(function(tmpUser){
                tmpTeam.users = new Array();
                var currentUser = Meteor.users.findOne({'_id':tmpUser});
                if (currentUser)
                    tmpTeam.users.push(currentUser);
            });
        });
    });

    return products;
}

Template.usersList.helpers({
    productList: function() {
         return getUsersListPerProducts();
    }
});
