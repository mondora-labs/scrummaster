Products = new Meteor.Collection('Products');    
DailyScrum = new Meteor.Collection('dailyscrum');  


if (Meteor.isServer) {
  //Publish all the Products for the logged-in user
  Meteor.publish("Products", function () {
  return Products.find ( {scrummaster: this.userId })  
//return Products.find ();  
  });

  Meteor.publish("dailyscrum", function () {
    return DailyScrum.find();
    //return Meteor.users.find({_id: this.userId},
  //    {fields: {'services.github.username': 1, 'username':1}});
})};