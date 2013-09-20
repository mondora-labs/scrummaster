if (Meteor.isServer) {
    Meteor.startup(function () {
        process.env.MAIL_URL = 'smtp://postmaster%40scrummaster.com:75jwvk-ng447@smtp.mailgun.org:587';
    });
}

if (Meteor.isClient) {
    Template.team.events({
        'click .sendMail' : function () {
            var msg = " invites you to join ScrumMaster!!! \n Click the link below: \n";//document.getElementById("message").value;
            var mailTo = document.getElementById('invitationMail').value;
            Meteor.call('sendMessage', mailTo, msg);
            //prevent reload
            return false;
        }
    });
}


var sendMessage = function (mailFrom, mailTo, msg) {

    // generazione token
    var result = {};
    var stampedToken = Accounts._generateStampedLoginToken();
    result.token = stampedToken.token;
    console.dir(result.token);

    // salvo in InvitationToken il token appen creato
    InvitationToken.insert({token: result.token, product: 'Matutor', team: 'Moschettieri'});

    var link = Meteor.absoluteUrl()+"matutorBis/joinTeam/moschettieri?" + result.token;

    console.dir("Current uid: "+ Meteor.userId());

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
    'sendMessage': function (mailTo, msg) {
        if (Meteor.isServer)
        // al posto di  "postmaster@scrummaster.com", si potrebbe pensare di prendere la mail dell'utente loggato
        // Meteor.users.findOne(Meteor.userId).profile.email
            sendMessage("postmaster@scrummaster.com", mailTo, msg);
    }
});

