Meteor.subscribe('friendsList');

function getUsersListPerProducts(){

    var products = Products.find().fetch();

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

function getUsersList(){

    var outputUserArray = new Array();
    var usersList = Meteor.users.find().fetch();

    for (var i=0; i<usersList.length; i++){
        var tmpUser = {};
        tmpUser.id = usersList[i]._id;
        tmpUser.img = usersList[i].profile.picture;
        tmpUser.name = usersList[i].profile.name;
        tmpUser.roles = getUserRolesPerTeam(tmpUser.id);

        outputUserArray.push(tmpUser);
    }

    return outputUserArray;
}

function getUserRolesPerTeam(userId){
    var userRolesArray = new Array();

    var products = Products.find().fetch();
    for (var i=0; i<products.length; i++){
        var tmpRole = {};

        for (var j=0; j<products[i].team.length; j++){

            // recupero SM e Po
            if (products[i].scrummaster == userId ){
                tmpRole.role = 'Scrum Master';
                tmpRole.teamName = products[i].team[j].name;
                tmpRole.teamSlug = products[i].team[j].slug;
                tmpRole.productSlug = products[i].slug;
                userRolesArray.push(tmpRole);
            }
            if (products[i].productowner == userId ){
                tmpRole.role = 'Product Owner';
                tmpRole.teamName = products[i].team[j].name;
                tmpRole.teamSlug = products[i].team[j].slug;
                tmpRole.productSlug = products[i].slug;
                userRolesArray.push(tmpRole);
            }

            //recupero tra gli altri del team
            for (var k=0; k<products[i].team[j].members.length; k++){
                if (products[i].team[j].members[k] == userId){
                    tmpRole.role = 'Team Member';
                    tmpRole.teamName = products[i].team[j].name;
                    tmpRole.teamSlug = products[i].team[j].slug;
                    tmpRole.productSlug = products[i].slug;
                    userRolesArray.push(tmpRole);
                }
            }
        }
    }

    return userRolesArray;
}

Template.usersList.helpers({
    usersList: function() {
         //return getUsersListPerProducts();
        return getUsersList();
    }
});
