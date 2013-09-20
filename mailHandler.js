if (Meteor.isServer) {
    Meteor.startup(function () {
        //todo promote in a configuration file
        process.env.MAIL_URL = 'smtp://postmaster%40scrummaster.com:75jwvk-ng447@smtp.mailgun.org:587';
    });
}

if (Meteor.isClient) {
    Template.team.events({
        'click .sendMail' : function () {
            var msg = " invites you to join ScrumMaster!!! \n Click the link below: \n";
            var mailTo = $('#invitationMail').val();
            var current_team = Session.get('currentTeam');
            var current_product = Session.get('currentProduct');

            Meteor.call('sendInvitation', mailTo, msg, current_team, current_product);
            //notify that the invitation has been sent
            //todo send a notification
            $('#invitationMail').val("");
            //prevent reload
            return false;
        }
    });
}


var sendInvitation = function (mailFrom, mailTo, msg, current_team, current_product) {

    // generazione token
    var result = {};
    var stampedToken = Accounts._generateStampedLoginToken();
    result.token = stampedToken.token;

    // salvo in InvitationToken il token appen creato

    var timestamp = new Date();



    InvitationToken.insert({token: result.token, product: current_product, team: current_team, date: timestamp});

    var link = Meteor.absoluteUrl() + current_product + "/joinTeam/" + current_team + "?" + result.token;


    var current_user = Meteor.users.findOne(  Meteor.userId() );

    console.dir("Current user: " + JSON.stringify(current_user));

    Email.send({
        from: mailFrom,
        to: mailTo,
        replyTo: mailFrom || undefined,
        subject: "ScrumMaster Join Request",
        text: "Hello "+mailTo+",\n\n"+
            current_user.profile.given_name + msg +
            link + "\n\n"+

            "ScrumMaster Team.\n"+
            Meteor.absoluteUrl()+"\n"
    });
}
Meteor.methods({
    'sendInvitation': function (mailTo, msg) {
        if (Meteor.isServer)
        // al posto di  "postmaster@scrummaster.com", si potrebbe pensare di prendere la mail dell'utente loggato
        // Meteor.users.findOne(Meteor.userId).profile.email
            sendInvitation("postmaster@scrummaster.com", mailTo, msg);
    }
});

