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

function isCurrentUserAdmin() {
    var adminUser = AdminUsers.findOne({userId : Meteor.userId()});
    if (adminUser)
        return true;
    else
        return null;
}

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

function insertTeam (product, teamName, teamSlug, teamMotto, teamPicture) {

    var product = Products.findOne({slug: product}) ;

    if (product) {
        var tmpTeam = {};
        tmpTeam.name = teamName;
        tmpTeam.slug = teamSlug;
        tmpTeam.motto = teamMotto;
        tmpTeam.picture = teamPicture;
        tmpTeam.members =  [];

        var teamList = product.team;
        teamList.push(tmpTeam) ;
        Products.update( {_id: product._id} , {$set:{team: teamList}} );

    }
    else {
        throw "Product not found!" ;
    }
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
        return isCurrentUserAdmin();
    }
});

Template.team.helpers ({
    isUserAdmin : function () {
        return isCurrentUserAdmin();
    }
});

Template.userTeam.helpers ({
    isUserAdmin : function () {
        return isCurrentUserAdmin();
    }
});


Template.creationProdTeamBlock.rendered = function(){

    var prodName = $( "#name" ),
        prodSlug = $( "#slug" ),
        prodAllFields = $( [] ).add( prodName ).add( prodSlug ),
        productTips = $( ".validateProductTips" );

    function updateTips( t, tips ) {
        tips
            .text( t )
            .addClass( "ui-state-highlight" );
        setTimeout(function() {
            tips.removeClass( "ui-state-highlight", 1500 );
        }, 500 );
    }

    function checkRequired( o, n, tips ) {
        if ( o.val().length <= 0 ) {
            o.addClass( "ui-state-error" );
            updateTips( "Field '" + n + "' is required.", tips );
            return false;
        } else {
            return true;
        }
    }

    function checkProductSlugAlreadyInUse( o, n , tips) {

        var slugDesc = o.val();
        var productElement = Products.findOne({slug:slugDesc});

        if (productElement != null){
            o.addClass( "ui-state-error" );
            updateTips( "Value '"+o.val()+"' for Field '" + n + "' is already in use." , tips);
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
                prodAllFields.removeClass( "ui-state-error" );

                bValid = bValid && checkRequired( prodName, "product name", productTips );
                bValid = bValid && checkRequired( prodSlug, "product slug", productTips );

                if (bValid)
                    bValid = bValid && checkProductSlugAlreadyInUse( prodSlug, "product slug", productTips );

                if ( bValid ) {
                    try {
                        Products.insert( {
                            name: prodName.val(),
                            slug: prodSlug.val(),
                            team:[]
                        });
                  //      alert('name '+prodName.val()+', slug '+prodSlug.val());
                        $.pnotify({
                            title: 'Success!',
                            text: '\nProduct '+prodName.val()+' successfully created!',
                            type: 'success',
                            hide: false
                        });
                    }
                    catch (err) {
                        $.pnotify({
                            title: 'Error!',
                            text: '\nProblem while creating product '+ prodName.val() +'\n'+((err.message) ? err.message : ''),
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
            prodAllFields.val( "" ).removeClass( "ui-state-error" );
        }
    });

    var productCombo = $("#chooseProductCombo"),
        teamName = $( "#teamName" ),
        teamSlug = $( "#teamSlug" ),
        teamMotto = $( "#teamMotto" ),
        teamPicture = $( "#teamPicture" ),
        teamAllFields = $( []).add(productCombo).add( teamName ).add( teamSlug).add( teamMotto).add( teamPicture),
        teamTips = $( ".validateTeamTips" );

    $( "#new-team" ).dialog({
        autoOpen: false,
        height: 450,
        width: 450,
        modal: true,
        buttons: {
            "Create a Team": function() {
                var bValid = true;
                teamAllFields.removeClass( "ui-state-error" );

                bValid = bValid && checkRequired( productCombo, "Product", teamTips );
                bValid = bValid && checkRequired( teamName, "Team Name", teamTips );
                bValid = bValid && checkRequired( teamSlug, "Team Slug", teamTips );

                if ( bValid ) {
                    try {
                        insertTeam (productCombo.val(),teamName.val(),teamSlug.val(),teamMotto.val(),teamPicture.val());
                       /* Products.insert( {
                            name: name.val(),
                            slug: slug.val()
                        }); */
                        //      alert('name '+name.val()+', slug '+slug.val());
                        $.pnotify({
                            title: 'Success!',
                            text: '\Team '+teamName.val()+' successfully created!',
                            type: 'success',
                            hide: false
                        });
                    }
                    catch (err) {
                        $.pnotify({
                            title: 'Error!',
                            text: '\nProblem while creating Team '+ teamName.val() +'\n'+((err.message) ? err.message : ''),
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
            teamAllFields.val( "" ).removeClass( "ui-state-error" );
        }
    });

    $( "#newProductBtn" ).button().click(function() {
        $( "#new-product" ).dialog( "open" );
    });

    $( "#newTeamBtn" ).button().click(function() {
        $( "#new-team" ).dialog( "open" );
    });
}



