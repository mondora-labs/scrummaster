function getUsersListPerProducts(){

    // Fetch all the Products with 'scrummaster' attribute = logged-in user
    var products = Products.find({'scrummaster' : Meteor.userId()}).fetch();

    products.forEach(function(data){
        data.users = new Array();
        data.allowedusers.forEach(function(innerData){
                var tmpUser = Meteor.users.findOne({'_id':innerData});
                if (tmpUser)
                    data.users.push(tmpUser);
            }
        );
    });

    return products;
}

Template.usersList.helpers({
    productList: function() {
         return getUsersListPerProducts();
    }
});
