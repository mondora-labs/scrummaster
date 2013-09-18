

Meteor.Router.add({

   '/dailyscrum/:_id': {
		to: 'dailyscrum',
		and: function(id) {   
			Session.set('currentProduct', id);
	    }
	},            
   '/': 'home',
   '/team/:_id': {
		to: 'team',
		and: function(id) {   
			Session.set('currentTeam', id);
	    }
	}            

});

