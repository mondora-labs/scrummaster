if (Meteor.isServer) {
    Meteor.startup(function () {
        process.env.MAIL_URL = 'smtp://postmaster%40scrummaster.com:75jwvk-ng447@smtp.mailgun.org:587';
    });
}
if (Meteor.isClient) {
    Template.team.events({
        'click .sendMail' : function () {
            var msg = "Subscribe to ScrumMaster!!! ";//document.getElementById("message").value;
            var mailTo = document.getElementById('invitationMail').value;
            Meteor.call('sendMessage', mailTo, msg);
        }
    });
}


var sendMessage = function (mailFrom, mailTo, msg) {
    Email.send({
        from: mailFrom,
        to: mailTo,
        replyTo: mailFrom || undefined,
        subject: "ScrumMaster: "+mailFrom+" sent you this email !",
        text: "Hello "+mailTo+",\n\n"+
            msg+"\n\n"+

            "ScrumMaster Team.\n"+
            Meteor.absoluteUrl()+"\n"
    });
}
Meteor.methods({
    'sendMessage': function (mailTo, msg) {
        if (Meteor.isServer)
        //TODO al posto di  postmaster, si potrebbe pensare di prendere la mail dell'utente loggato
            sendMessage("postmaster@scrummaster.com", mailTo, msg);
    }
});