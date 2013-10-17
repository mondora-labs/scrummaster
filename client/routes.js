

Meteor.Router.add({

    '/': {
        to: 'home',
        and: function() {
            Session.set('selectedMenu');
        }
    },

    '/:product/dashboard/:team': {
        to: 'dashboard',
        and: function(product, team) {
            Session.set('currentTeam', team);
            Session.set('currentProduct', product);
            Session.set('selectedMenu','dashboard');
        }
    },

    '/admin': function() {
        Session.set('selectedMenu');
        var adminUser = AdminUsers.findOne({userId : Meteor.userId()});
        if (adminUser)
            return 'admin';
        else
            return 'notAuthorized';
    },

    '/:product/team/:team': {
		to: 'team',
		and: function(product, team) {
			Session.set('currentTeam', team);
			Session.set('currentProduct', product);
            Session.set('onlyTodayDailyScrum',1);
            Session.set('onlyLastRetrospective',1);
            Session.set('selectedMenu');

        }
	},

    '/:product/joinTeam/:team': {
        to: 'joinTeam',
        and: function(product, team) {
            Session.set('currentTeam', team);
            Session.set('currentProduct', product);
            Session.set('selectedMenu');

        }
    },

   // gestione separata per pagina Users e pagina UserDetail
    '/user/usersList': {
        to: 'usersList',
        and: function() {
            Session.set('selectedMenu');
        }
    },

    '/user/:id': {
        to: 'userDetail',
        and: function(id) {
            Session.set('userId',id);
            Session.set('selectedMenu');
        }
    },

    '/:product/dailyscrum/:team': {
        to: 'dailyscrum',
        and: function(product, team) {
            Session.set('currentTeam', team);
            Session.set('currentProduct', product);
            Session.set('onlyTodayDailyScrum',0);
            Session.set('selectedMenu','dailyscrum');

            var role = getUserRoleForCurrentTeam(product, team);
            if (role != null)
                Session.set('currentRole', role);
        }
    },

    '/:product/retrospectives/:team': {
        to: 'retrospectives',
        and: function(product, team) {
            Session.set('currentTeam', team);
            Session.set('currentProduct', product);
            Session.set('onlyLastRetrospective',0);
            Session.set('selectedMenu','retrospectives');

            var role = getUserRoleForCurrentTeam(product, team);
            if (role != null)
                Session.set('currentRole', role);
        }
    }

});

function getUserRoleForCurrentTeam(product, team){
    var role;
    var product = Products.findOne( {slug: product } );
    if (product) {
        if (product.scrummaster == Meteor.userId())
            return 'SM';
        else if (product.productowner == Meteor.userId())
            return 'PO';
        else {
            for (var i=0; i<product.team.length; i++){
                if (product.team[i].slug == team)  {
                    for (var j=0; j<product.team[i].members.length; j++ ){
                        if (product.team[i].members[j] == Meteor.userId())
                            return 'TM';
                    }
                }
            }
        }
    }

    return null;

}
