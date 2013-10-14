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



Template.creationProdTeamBlock.rendered = function(){

    var name = $( "#name" ),
        slug = $( "#slug" ),
        allFields = $( [] ).add( name ).add( slug ),
        tips = $( ".validateTips" );

    function updateTips( t ) {
        tips
            .text( t )
            .addClass( "ui-state-highlight" );
        setTimeout(function() {
            tips.removeClass( "ui-state-highlight", 1500 );
        }, 500 );
    }

    function checkRequired( o, n ) {
        if ( o.val().length <= 0 ) {
            o.addClass( "ui-state-error" );
            updateTips( "Field '" + n + "' is required." );
            return false;
        } else {
            return true;
        }
    }

    function checkFieldAreadyInUse( o, n ) {

        var slugDesc = o.val();
        var productElement = Products.findOne({slug:slugDesc});

        if (productElement != null){
            o.addClass( "ui-state-error" );
            updateTips( "Value '"+o.val()+"' for Field '" + n + "' is already in use." );
            return false;
        } else {
            return true;
        }
    }

    $( "#new-product" ).dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        buttons: {
            "Create a product": function() {
                var bValid = true;
                allFields.removeClass( "ui-state-error" );

                bValid = bValid && checkRequired( name, "product name" );
                bValid = bValid && checkRequired( slug, "product slug" );

                if (bValid)
                    bValid = bValid && checkFieldAreadyInUse( slug, "product slug" );

                if ( bValid ) {
                    try {
                        Products.insert( {
                            name: name.val(),
                            slug: slug.val()
                        });
                  //      alert('name '+name.val()+', slug '+slug.val());
                        $.pnotify({
                            title: 'Success!',
                            text: '\nProduct '+name.val()+' successfully created!',
                            type: 'success',
                            hide: false
                        });
                    }
                    catch (err) {
                        $.pnotify({
                            title: 'Error!',
                            text: '\nProblem while creating product '+ name.val() +'\n'+((err.message) ? err.message : ''),
                            type: 'error',
                            hide: false
                        });
                    }
                    $( this ).dialog( "close" );
                }
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        },
        close: function() {
            allFields.val( "" ).removeClass( "ui-state-error" );
        }
    });

    $( "#new-team" ).dialog({
        autoOpen: false,
        height: 400,
        width: 450,
        modal: true,
        buttons: {
            "Create a Team": function() {
                var bValid = true;
                allFields.removeClass( "ui-state-error" );

               /* bValid = bValid && checkRequired( name, "product name" );
                bValid = bValid && checkRequired( slug, "product slug" );

                if (bValid)
                    bValid = bValid && checkFieldAreadyInUse( slug, "product slug" );
                */
                if ( bValid ) {
                    try {
                       /* Products.insert( {
                            name: name.val(),
                            slug: slug.val()
                        }); */
                        //      alert('name '+name.val()+', slug '+slug.val());
                        $.pnotify({
                            title: 'Success!',
                            text: '\Team '+name.val()+' successfully created!',
                            type: 'success',
                            hide: false
                        });
                    }
                    catch (err) {
                        $.pnotify({
                            title: 'Error!',
                            text: '\nProblem while creating Team '+ name.val() +'\n'+((err.message) ? err.message : ''),
                            type: 'error',
                            hide: false
                        });
                    }
                    $( this ).dialog( "close" );
                }
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        },
        close: function() {
            allFields.val( "" ).removeClass( "ui-state-error" );
        }
    });

    $( "#newProductBtn" ).button().click(function() {
        $( "#new-product" ).dialog( "open" );
    });

    $( "#newTeamBtn" ).button().click(function() {
        $( "#new-team" ).dialog( "open" );
    });
}



