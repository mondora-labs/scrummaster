

Meteor.Router.add({

   '/dailyscrum/:_id': {
		to: 'dailyscrum',
		and: function(id) {   
			Session.set('currentProduct', id);
		    Session.set('currentPage', 'dailyscrum');
	    }
	},            
   
   '/team/:_id': {
		to: 'team',
		and: function(id) {   
			Session.set('currentTeam', id);
		    Session.set('currentPage', 'team');
	    }
	},
   '/': 'home'            

});

