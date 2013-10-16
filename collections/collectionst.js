Products = new Meteor.Collection('Products');    
DailyScrum = new Meteor.Collection('dailyscrum');
InvitationToken = new Meteor.Collection('invitationToken');
FriendsList = new Meteor.Collection('friendsList');
Retrospectives = new Meteor.Collection('retrospectives');
AdminUsers = new Meteor.Collection('adminUsers');
UsersSpeaking = new Meteor.Collection('usersSpeaking');
Canvas = new Meteor.Collection('canvas');


if (Meteor.isServer) {
  //TODO Publish all the Products with scrum-master, product-owner or team member = logged-in user
  Meteor.publish("Products", function () {
  /*  return Products.find ({ $or: [
          {scrummaster: this.userId},
          {productowner: this.userId},
          // team member
      ]}
      ); */
    return Products.find ();
  });

  Meteor.publish("dailyscrum", function () {
    return DailyScrum.find();
    //return Meteor.users.find({_id: this.userId},
    //    {fields: {'services.github.username': 1, 'username':1}});
  });

  Meteor.publish("invitationToken", function () {
    return InvitationToken.find ();
  });

  Meteor.publish( "friendsList", function() {
    return Meteor.users.find();
  });

  Meteor.publish( "retrospectives", function() {
    return Retrospectives.find();
  });

  Meteor.publish( "adminUsers", function() {
    return AdminUsers.find();
  });

  Meteor.publish( "usersSpeaking", function() {
    return UsersSpeaking.find();
  });

  Meteor.publish( "canvas", function() {
    return Canvas.find();
  });
}