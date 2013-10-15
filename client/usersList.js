Meteor.subscribe('friendsList');

function getUsersListPerProducts(){

    var products = Products.find().fetch();
  /*
    products.forEach(function(tmpProduct){
        tmpProduct.team.forEach(function(tmpTeam){

            tmpTeam.users = new Array();

            // recupero SM e Po
            if (tmpProduct.scrummaster && tmpProduct.scrummaster != ''){
                var sm = Meteor.users.findOne({'_id':tmpProduct.scrummaster});
                if (sm) {
                    sm.role = 'Scrum Master';
                    tmpTeam.users.push(sm);
                }
            }
            if (tmpProduct.productowner && tmpProduct.productowner != ''){
                var po = Meteor.users.findOne({'_id':tmpProduct.productowner});
                if (po){
                    po.role = 'Product Owner';
                    tmpTeam.users.push(po);
                }
            }

            //recupero gli altri del team
            tmpTeam.members.forEach(function(tmpUser){
                var currentUser = Meteor.users.findOne({'_id':tmpUser});
        //        var currentUser = FriendsList.findOne({ _id: tmpUser });
                if (currentUser) {
                    currentUser.role = 'Team Member';
                    tmpTeam.users.push(currentUser);
                }
            });
        });
    });

   */
    for (var i=0; i<products.length; i++){
        for (var j=0; j<products[i].team.length; j++){

            products[i].team[j].users = new Array();

            // questa variabile serve per creare il link che rimanda alla pagina del team
            products[i].team[j].productSlug = products[i].slug;

            // recupero SM e Po
            if (products[i].scrummaster && products[i].scrummaster != ''){
                var sm = Meteor.users.findOne({'_id':products[i].scrummaster});
                if (sm) {
                    sm.role = 'Scrum Master';
                    products[i].team[j].users.push(sm);
                }
            }
            if (products[i].productowner && products[i].productowner != ''){
                var po = Meteor.users.findOne({'_id':products[i].productowner});
                if (po){
                    po.role = 'Product Owner';
                    products[i].team[j].users.push(po);
                }
            }

            //recupero gli altri del team
            for (var k=0; k<products[i].team[j].members.length; k++){
                var currentUser = Meteor.users.findOne({'_id':products[i].team[j].members[k]});
                //        var currentUser = FriendsList.findOne({ _id: tmpUser });
                if (currentUser) {
                    currentUser.role = 'Team Member';
                    products[i].team[j].users.push(currentUser);
                }
            }

        }
    }

    return products;
}

Template.usersList.helpers({
    productList: function() {
         return getUsersListPerProducts();
    }
});
