

Meteor.Router.add({

    '/:product/dailyscrum/:team': {
		to: 'dailyscrum',
		and: function(id) {
            Session.set('currentTeam', team);
            Session.set('currentProduct', product);	    }
    },
    '/': 'home',
    '/:product/team/:team': {
		to: 'team',
		and: function(product, team) {
			Session.set('currentTeam', team);
			Session.set('currentProduct', product);
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

    '/dailyscrum' : 'dailyscrum'

});

