Meteor.subscribe('adminUsers');

Meteor.loginAsAdmin = function(password, callback) {
  //create a login request with admin: true, so our loginHandler can handle this request
  var loginRequest = {admin: true, password: password};

  //send the login request
  Accounts.callLoginMethod({
    methodArguments: [loginRequest],
    userCallback: callback
  });
};

function getUsersByAdminAttribute(admin) {
    // admin == true  --> voglio la lista degli utenti admin
    // admin == false --> voglio la lista degli utenti non admin

    var usersList = new Array();
    try {
        var adminUsers = AdminUsers.find().fetch();
        var adminUserIds = new Array();

        for (var j=0; j<adminUsers.length; j++){
            adminUserIds.push(adminUsers[j].userId);
        }

        if (admin == true) {
            for (var i=0; i<adminUserIds.length; i++){
                var tmpUser = Meteor.users.findOne({_id : adminUserIds[i]});
                if (tmpUser)
                    usersList.push(tmpUser);
            }
        }

    else {
            var allUsers = Meteor.users.find().fetch();
            for (var i=0; i<allUsers.length; i++) {
                var index = $.inArray(allUsers[i]._id, adminUserIds);
                if (index == -1) {
                    var tmpUser = Meteor.users.findOne({_id : allUsers[i]._id});
                    if (tmpUser)
                        usersList.push(tmpUser);
                }
            }
        }
    }
    catch (e) {

    }
    return usersList;
}

Template.userAdminBlock.rendered = function() {

    $('#add').click(function() {

        //aggiungo utente/i alla lista admin
        var selectedUsers = $('#notAdminUsers option:selected');
        for (var i=0; i<selectedUsers.length; i++) {
            var userToUpdate = $('#notAdminUsers option:selected')[i].value;
            if (userToUpdate != null && userToUpdate != '')
                AdminUsers.insert( {userId : userToUpdate} );
        }

        return !$('#notAdminUsers option:selected').remove().appendTo('#adminUsers');
    });
    $('#remove').click(function() {

        //tolgo utente/i dalla lista admin
        var selectedUsers = $('#adminUsers option:selected');
        for (var i=0; i<selectedUsers.length; i++) {
            var userIdToRemove = $('#adminUsers option:selected')[i].value;
            if (userIdToRemove != null && userIdToRemove != '') {
                var elementToRemove = AdminUsers.findOne({userId: userIdToRemove});
                if (elementToRemove)
                    AdminUsers.remove(elementToRemove._id);
            }

        }

        return !$('#adminUsers option:selected').remove().appendTo('#notAdminUsers');
    });
}

Template.userAdminBlock.helpers ({

    notAdminUsers : function () {
        return getUsersByAdminAttribute(false);
    },

    adminUsers : function () {
        return getUsersByAdminAttribute(true);
    }
});

Template.header.helpers ({

    isUserAdmin : function () {
        var adminUser = AdminUsers.findOne({userId : Meteor.userId()});
        if (adminUser)
            return true;
        else
            return null;
    }
});


