

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
	}            

});

