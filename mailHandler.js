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
            Meteor.call('sendInvitation', mailTo, msg, function (error, result) {

                if (error) {
                    //notify that there's a problem
                    $.pnotify({
                        title: 'Error!',
                        text: '\nProblem while sending invitation to '+ mailTo +'\n'+((error.message) ? error.message : ''),
                        type: 'error',
                        hide: false
                    });
                }
                else {
                    //notify that the invitation has been sent
                    $.pnotify({
                        title: 'Success!',
                        text: '\nInvitation to '+ mailTo +' has been sent!',
                        type: 'success',
                        hide: false
                    });
                }

            });


            $('#invitationMail').val("");
            //prevent reload
            return false;
        }
    });
}


var sendInvitation = function (mailFrom, mailTo, msg) {

    // generazione token
    var result = {};
    var stampedToken = Accounts._generateStampedLoginToken();
    result.token = stampedToken.token;

    // salvo in InvitationToken il token appena creato
 //   var current_team = Session.get('currentTeam');
 //   var current_product = Session.get('currentProduct');
    var current_team = 'moschettieri';
    var current_product = 'matutorbis';
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
            // todo internazionalizzazione messaggio
            text: "Hello "+mailTo+",\n\n"+
                current_user.profile.given_name + msg +
                link + "\n\n"+

                "ScrumMaster Team.\n"+
                Meteor.absoluteUrl()+"\n"
    });

    return true;
}
Meteor.methods({
    'sendInvitation': function (mailTo, msg) {
        if (Meteor.isServer)
        // al posto di  "postmaster@scrummaster.com", si potrebbe pensare di prendere la mail dell'utente loggato
        // Meteor.users.findOne(Meteor.userId).profile.email
            sendInvitation("postmaster@scrummaster.com", mailTo, msg);
    }
});

