Template.avatar.gravatarUrl = function(){
        var user = Meteor.user();
        if (user) {    
          var email_hash = CryptoJS.MD5(user.emails[0].address.trim().toLowerCase()).toString();
          var url = 'http://www.gravatar.com/avatar/' + email_hash;
          return url
        };
  };