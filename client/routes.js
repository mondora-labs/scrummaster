

Meteor.Router.add({

  /*  '/:product/dailyscrum/:team': {
		to: 'dailyscrum',
		and: function(id) {
            Session.set('currentTeam', team);
            Session.set('currentProduct', product);	    }
    },*/
    '/': 'home',

    /*  '/admin': {
        to: 'admin'
    },
      */

    '/admin': function() {
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
	    }
	},

    '/:product/joinTeam/:team': {
        to: 'joinTeam',
        and: function(product, team) {
            Session.set('currentTeam', team);
            Session.set('currentProduct', product);
        }
    },

   // gestione separata per pagina Users e pagina UserDetail
    '/user/usersList': 'usersList',

    '/user/:id': {
        to: 'userDetail',
        and: function(id) {
            Session.set('userId',id);
        }

    },

    '/:product/dailyscrum/:team': {
        to: 'dailyscrum',
        and: function(product, team) {
            Session.set('currentTeam', team);
            Session.set('currentProduct', product);
            Session.set('onlyTodayDailyScrum',0);

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
