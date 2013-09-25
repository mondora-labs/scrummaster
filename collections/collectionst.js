Products = new Meteor.Collection('Products');    
DailyScrum = new Meteor.Collection('dailyscrum');
InvitationToken = new Meteor.Collection('invitationToken');


if (Meteor.isServer) {
  //TODO Publish all the Products for the logged-in user, filter on user-role
  Meteor.publish("Products", function () {
    return Products.find ( /*{scrummaster: this.userId }*/)
//return Products.find ();  
  });

  Meteor.publish("dailyscrum", function () {
    return DailyScrum.find();
    //return Meteor.users.find({_id: this.userId},
    //    {fields: {'services.github.username': 1, 'username':1}});
  });

  Meteor.publish("invitationToken", function () {
    return InvitationToken.find ();
  });
}