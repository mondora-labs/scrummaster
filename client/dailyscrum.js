Meteor.subscribe('dailyscrum');

var tmpDudePicture = "https://lh4.googleusercontent.com/-77wocJdaiXg/AAAAAAAAAAI/AAAAAAAAAAA/NN3q52w3EXQ/s48-c/photo.jpg";
var tmpDudeUserId = "";
var timer = 0;
var maxDailyScrumTime = 120; //numero di secondi a disposizione per il dailyscrum per ogni utente
var isTimerWorking = false;
var percentProgress;

function resetTodayPair() {
    Session.set('tmpDudePicture',tmpDudePicture);
    Session.set('tmpDudeUserId',tmpDudeUserId);
}

function resetTimer(role, selectedUserId) {
    timer = 0;
    var spanToReset = $('.percentValue');

    // resetto lo span contenente l'indicazione del timer
    for (var i = 0 ; i<spanToReset.length; i++){
        $('.percentValue').text('0:00');
    }

    // resetto l'interval di update del timer, e abilito il click sugli altri utenti
    clearInterval(percentProgress);
    isTimerWorking = false;

    // reinserisco l'immagine al posto del timer, e lo resetto per il prossimo avvio
    if (selectedUserId) {
        $("img."+selectedUserId).css('display','block');
        $(".pieChart."+selectedUserId).css('display','none');
        $('.chart.'+selectedUserId).data('easyPieChart').update(timer);
    }

    if (role == 'SM') {
        // quando si resetta il timer, viene resettato il flag isSpeaking dell'utente selezionato
        var userProfile = Meteor.users.findOne({_id:selectedUserId}).profile;
        userProfile.isSpeaking = null;
        Meteor.users.update( {_id: selectedUserId} , {$set:{profile: userProfile}} );
    }
    Session.set('dailyScrumUserId');

}

function enableTimer(role, selectedUserId) {

    // quando SM abilita il timer, setta il flag isSpeaking dell'utente selezionato
    if (role == 'SM') {
        var userProfile = Meteor.users.findOne({_id:selectedUserId}).profile;
        userProfile.isSpeaking = true;
        Meteor.users.update( {_id: selectedUserId} , {$set:{profile: userProfile}} );
    }

    if (!isTimerWorking) {
        isTimerWorking = true;

        percentProgress = setInterval(function() {
            $("div."+selectedUserId+" canvas").css('background-image','url('+Meteor.users.findOne({_id:selectedUserId}).profile.picture+')');

            $("img."+selectedUserId).css('display','none');
            $(".pieChart."+selectedUserId).css('display','block');

            timer++;

            $('.chart.'+selectedUserId).data('easyPieChart').update(timer*100/maxDailyScrumTime);

            var minutes = Math.floor(timer/60);
            var seconds = timer%60;

            $('.percentValue.'+selectedUserId).text(minutes +':' + (seconds < 10 ? ('0'+seconds):seconds));

            if (timer == maxDailyScrumTime +1)
                resetTimer(role, selectedUserId);

        }, 1000);
    }
}

function showDailyScrumPanel (selectedUserId) {
    $("img."+selectedUserId).css('display','none');
    $(".pieChart."+selectedUserId).css('display','block');
    $("div."+selectedUserId+" canvas").css('background-image','url('+Meteor.users.findOne({_id:selectedUserId}).profile.picture+')');

    $('#allDailyScrumPanel').hide();
    $('#dailyScrumPanel').show();
}

function hideDailyScrumPanel () {
    //var selectedUserId = Session.get('dailyScrumUserId');
    $('#dailyScrumPanel').hide();
    $('#allDailyScrumPanel').show();
    //$("img."+selectedUserId).css('display','block');
    //$(".pieChart."+selectedUserId).css('display','none');

}

function isScrumMaster() {
    return Session.get('currentRole') == 'SM';
}

function isProductOwner() {
    return Session.get('currentRole') == 'PO';
}

function isTeamMember() {
    return Session.get('currentRole') == 'TM';
}

function getDailyScrumListPerUser(role) {

    if (role == null)
        return null;

    else if (role == 'SM' || role == 'PO') {
        var dailyScrumArray =  DailyScrum.find({
            $and: [
                {product_slug: Session.get('currentProduct')},
                {team_slug: Session.get('currentTeam')},
                {player: Session.get('dailyScrumUserId')}
            ]
        }).fetch().sort(sortDailyScrumByDate); //.reverse();
    }

    // per un team member recupero solo i suoi daily scrum
    else if (role == 'TM'){
        var dailyScrumArray =  DailyScrum.find({
            $and: [
                {product_slug: Session.get('currentProduct')},
                {team_slug: Session.get('currentTeam')},
                {player: (Session.get('dailyScrumUserId')==Meteor.userId())? Meteor.userId() : " "}
            ]
        }).fetch().sort(sortDailyScrumByDate); //.reverse();
    }


    if (dailyScrumArray) {
        for (var i=0; i<dailyScrumArray.length; i++) {

            // aggiungo la data al task (mi serve per velocizzare la delete)
            var dateForTask = dailyScrumArray[i].date;

            // se data = oggi o ieri, setto TODAY / YESTERDAY invece della data
            dailyScrumArray[i].date = convertDailyScrumDate(dailyScrumArray[i].date);

            // aggiungo link alla foto per i pair users
            for (var j=0; j<dailyScrumArray[i].tasks.length; j++){

                // aggiungo la data al task (mi serve per velocizzare la delete)
                dailyScrumArray[i].tasks[j].date = dateForTask;

                if (dailyScrumArray[i].tasks[j].pair.length > 0 && dailyScrumArray[i].tasks[j].pair[0] != '' ){

                    var tmpUser = Meteor.users.findOne({_id: dailyScrumArray[i].tasks[j].pair[0]});
                    if (tmpUser)
                        dailyScrumArray[i].tasks[j].picture = tmpUser.profile.picture;
                }

            }
        }

    }
    return dailyScrumArray;
}

function getDailyScrumDates () {

    var dateArray = new Array();
    var onlyTodayDailyScrum = Session.get('onlyTodayDailyScrum');

    if (onlyTodayDailyScrum == null || onlyTodayDailyScrum == 0) {
       // recupero tutte le date dei daily scrum
        var dailyScrumArray =  DailyScrum.find({
            $and: [
                {product_slug: Session.get('currentProduct')},
                {team_slug: Session.get('currentTeam')}
            ]
        }).fetch().sort(sortDailyScrumByDate);

        if (dailyScrumArray){
            for (var i=0; i<dailyScrumArray.length; i++){
                var index = $.inArray(dailyScrumArray[i].date,dateArray);
                if (index == -1)
                    dateArray.push(dailyScrumArray[i].date);
            }
        }
    }

    else {
        // recupero solo la data odierna (serve per la pagina del team)
        dateArray.push(formatDate(new Date()));
    }
    return dateArray;
}

function getDailyScrumListPerDay(date) {

    var dayElement = {};

    var dailyScrumArray =  DailyScrum.find({
        $and: [
            {product_slug: Session.get('currentProduct')},
            {team_slug: Session.get('currentTeam')},
            {date: date}
        ]
    }).fetch().sort(sortDailyScrumByDate);

    if (dailyScrumArray!= null && dailyScrumArray.length > 0 ) {
        dayElement.date = convertDailyScrumDate(dailyScrumArray[0].date);
        dayElement.tasks = new Array();

        for (var i=0; i<dailyScrumArray.length; i++) {
            var user = Meteor.users.findOne({_id: dailyScrumArray[i].player})
            if (user) {
                var tmpOwner = user.profile.picture;
                for (var j=0; j<dailyScrumArray[i].tasks.length; j++) {
                    var tmpTask = {};
                    tmpTask.owner = tmpOwner;
                    tmpTask.description = dailyScrumArray[i].tasks[j].description;
                    dayElement.tasks.push(tmpTask);
                }
            }
        }

        // non vogliamo visualizzare un daily scrum senza task
        if (dayElement.tasks.length == 0)
            return null;
    }
    return dayElement;
}

function getUserIdActuallySpeaking () {
    var userList = $('.user');

    for (var i=0; i<userList.length; i++) {
        var currentUser = Meteor.users.findOne({_id: userList[i].id});
        if (currentUser != null && currentUser.profile.isSpeaking != null){
            return currentUser._id;
        }
    }
    return null;
}

Template.dailyscrum.rendered = function() {

    $('.chart').easyPieChart({
        animate: 1000
    });

    if (Session.get('currentRole') == 'SM') {
        var selectedUserId = Session.get('dailyScrumUserId');
        if (selectedUserId)
            showDailyScrumPanel(selectedUserId);
        else
            hideDailyScrumPanel();
    }
    // PO si deve comportare come TM
    // todo capire se è corretto così
    else  {
        var selectedUserId = getUserIdActuallySpeaking();
        if (selectedUserId != null) {
            Session.set('dailyScrumUserId',selectedUserId);
            showDailyScrumPanel(selectedUserId);
            enableTimer('TM', selectedUserId);
        }
        else
            hideDailyScrumPanel();
    }

}

Template.dailyScrumTasksPanel_SM.rendered = function() {

    if (Session.get('tmpDudePicture') == null)
        resetTodayPair();

    $(function() {
        $( ".draggable_img" ).draggable({
            scroll: false,
            revert: true,
            helper: "clone",
            stack: "div",
            stop: function(event, ui) {
                if (ui.helper != null && ui.helper.length > 0) {
                    pairMate = ui.helper[0];
                    userid = $(ui.helper).attr('userid');

                    if (userid != Session.get('dailyScrumUserId')) {
                        Session.set('tmpDudePicture',pairMate.src);
                        Session.set('tmpDudeUserId',userid);

                    }
                }
            }
        });
    });
}


Template.dailyscrum.events ({

    'click .user': function (event, template) {

        // solo il click dello scrum-master fa partire il timer
        if (Session.get('currentRole') == 'SM') {
            var selectedUserId;

            if (!isTimerWorking) {

                selectedUserId = event.target.parentElement.id;
                resetTodayPair();
                Session.set('dailyScrumUserId', selectedUserId);
                showDailyScrumPanel(selectedUserId);

                enableTimer('SM',selectedUserId);
            }
        }
        return false;
    },

    'click #newDailyScrum': function (event, template) {

        // se non ho selezionato l'utente, errore
        if (Session.get('dailyScrumUserId') == null)
            alert('please select team member before...');


        else {

            // se ho già creato un daily scrum oggi per quell'utente, errore
            var todayUserDailyScrum = DailyScrum.findOne({
                $and: [
                    {product_slug: Session.get('currentProduct')},
                    {team_slug: Session.get('currentTeam')},
                    {player: Session.get('dailyScrumUserId')},
                    {date: formatDate(new Date())}
                ]
            });

            if (todayUserDailyScrum != null)
                alert('Today DailyScrum for this user has been already created..');

            else
                DailyScrum.insert(
                    {
                        product_slug: Session.get('currentProduct'),
                        team_slug: Session.get('currentTeam'),
                        date: formatDate(new Date()),
                        player: Session.get('dailyScrumUserId'),
                        tasks:[ ],
                        issues: ''
                    }
                );
        }
        return false;
    },

    'click #skipTimer': function (event, template) {
        resetTimer(Session.get('currentRole'),Session.get('dailyScrumUserId'));
        return false;
    }


});

Template.dailyScrumTasksPanel_SM.events ({

    'click .addTask': function (event, template) {

        var newTask= {};

        // todo funzione per generare un numero randomico.. capire se c'è qualcosa di meglio
        newTask.id = Meteor.uuid();
        newTask.done = null;

        newTask.description = $(".newTaskArea."+event.target.id).val();

        var pairUser = $('.todayPair.'+event.target.id).find('img').attr('userid');

        if (pairUser != null && pairUser != ''){
            newTask.pair = [pairUser];
        }
        else
            newTask.pair = [""];

        var dailyScrumToUpdate = DailyScrum.findOne({_id : event.target.id });

        if (dailyScrumToUpdate) {

            // se sto aggiungendo un task ad un dailyscrum diverso da quello odierno, devo notificarlo
            if (dailyScrumToUpdate.date != formatDate(new Date()))
                newTask.addedLater = "true";

            var arrayTasks = dailyScrumToUpdate.tasks;
            arrayTasks.splice(0,0,newTask);
            DailyScrum.update( {_id: dailyScrumToUpdate._id} , {$set:{tasks: arrayTasks}} );

        }

        return false;
    },

    'focus .newTaskArea': function (event, template) {
        event.target.value = '';
        return false;
    },

    'click .removePair': function (event, template) {
        resetTodayPair();
        return false;
    },

    'click .deleteTask': function (event, template) {

        var taskToRemove = $(event.target).attr('taskid');

        if (taskToRemove != null && taskToRemove != "") {

            var dateTaskToRemove = $(event.target).attr('taskdate');
            var tmpDailyScrum = DailyScrum.findOne({
                $and: [
                    {product_slug: Session.get('currentProduct')},
                    {team_slug: Session.get('currentTeam')},
                    {player: Session.get('dailyScrumUserId')},
                    {date: dateTaskToRemove}
                ]
            });

            if (tmpDailyScrum) {
                var tmpTasks = tmpDailyScrum.tasks;
                for (var i=0; i<tmpTasks.length; i++) {
                    if (tmpTasks[i].id == taskToRemove) {
                        tmpTasks.splice(i,1);
                        DailyScrum.update( {_id: tmpDailyScrum._id} , {$set:{tasks: tmpTasks}} );
                        break;
                    }
                }
            }
        }

        return false;
    },

    'click .doneCheckBox': function (event, template) {

        var taskToModify = $(event.target).attr('taskid');

        if (taskToModify != null && taskToModify != "") {

            var dateTaskToModify = $(event.target).attr('taskdate');
            var tmpDailyScrum = DailyScrum.findOne({
                $and: [
                    {product_slug: Session.get('currentProduct')},
                    {team_slug: Session.get('currentTeam')},
                    {player: Session.get('dailyScrumUserId')},
                    {date: dateTaskToModify}
                ]
            });

            if (tmpDailyScrum) {
                var doneStatus = $(event.target).is(':checked');
                if (doneStatus)
                    $(event.target).attr('checked', 'checked');
                else
                    $(event.target).attr('checked');

                var tmpTasks = tmpDailyScrum.tasks;
                for (var i=0; i<tmpTasks.length; i++) {
                    if (tmpTasks[i].id == taskToModify) {
                        if (doneStatus) {
                            $(event.target).attr('checked', 'checked');
                            tmpTasks[i].done = 'checked';
                        }
                        else {
                            $(event.target).attr('checked');
                            tmpTasks[i].done = null;
                        }
                        DailyScrum.update( {_id: tmpDailyScrum._id} , {$set:{tasks: tmpTasks}} );
                        break;
                    }
                }
            }
        }

        return doneStatus;
    },

    'click .addIssueBtn': function (event, template) {
        var dailyScrumId = $(event.target).attr('dailyscrumid');
        var issuesText = $('.dailyIssues.'+dailyScrumId).val();

        DailyScrum.update( {_id: dailyScrumId} , {$set:{issues: issuesText}} );

        return false;
    },

    'click .taskDescription': function (event, template) {

        if (Session.get('currentRole')== 'SM') {
            //l'evento va gestito solo nel caso in cui clicco sullo span anzichè sull'input-text
            if ($(event.target).prop("tagName") == 'SPAN') {
                var input = $('<input />', {'type': 'text',
                                            'class': 'taskDescription',
                                            'taskid': $(event.target).attr('taskid') ,
                                            'taskdate': $(event.target).attr('taskdate') ,
                                            'style' : 'width:70%',
                                            'value': $(event.target).text()});
                $(event.target).parent().append(input);
                $(event.target).remove();
                input.focus();
            }
        }
    },

    'blur .taskDescription': function (event, template) {

        var taskIdToModify = $(event.target).attr('taskid');
        var taskDescription = $(event.target).val();

        if (taskIdToModify != null && taskIdToModify != "" && taskDescription != "") {

            var dateTaskToModify = $(event.target).attr('taskdate');
            var tmpDailyScrum = DailyScrum.findOne({
                $and: [
                    {product_slug: Session.get('currentProduct')},
                    {team_slug: Session.get('currentTeam')},
                    {player: Session.get('dailyScrumUserId')},
                    {date: dateTaskToModify}
                ]
            });

            if (tmpDailyScrum) {
                var tmpTasks = tmpDailyScrum.tasks;
                for (var i=0; i<tmpTasks.length; i++) {
                    if (tmpTasks[i].id == taskIdToModify) {
                        tmpTasks[i].description = taskDescription;
                        DailyScrum.update( {_id: tmpDailyScrum._id} , {$set:{tasks: tmpTasks}} );
                        break;
                    }
                }
            }


            var span = $('<span />', {'class': 'taskDescription',
                                      'taskid': $(event.target).attr('taskid') ,
                                      'taskdate': $(event.target).attr('taskdate') ,
                                      'style': 'margin-left: 2%;'
                                     }
                        );

            $(event.target).parent().append(span.html(taskDescription));
            $(event.target).remove();
        }
        return false;
    }
});


Template.dailyscrum.helpers ({
    userSelected : function() {
        return Session.get('dailyScrumUserId');
    },

    isScrumMaster : function() {
        return isScrumMaster();
    },

    isProductOwner : function() {
        return isProductOwner();
    },

    isTeamMember : function() {
        return isTeamMember();
    }
});


Template.dailyScrumTasksPanel_SM.helpers ({

    dailyScrum: function() {
        return getDailyScrumListPerUser('SM');
    }
});

Template.dailyScrumTasksPanel_PO.helpers ({

    dailyScrum: function() {
        return getDailyScrumListPerUser('PO');
    }
});

Template.dailyScrumTasksPanel_TM.helpers ({

    dailyScrum: function() {
        return getDailyScrumListPerUser('TM');
    }
});

Template.allDailyScrum.helpers ({

    dailyScrum: function() {

        var allDailyScrumArray = new Array();
        var dateArray = getDailyScrumDates();

        for (var i=0; i<dateArray.length; i++) {
            var tmpDaily = getDailyScrumListPerDay(dateArray[i]);
            if (tmpDaily != null)
                allDailyScrumArray.push(getDailyScrumListPerDay(dateArray[i]));
        }

        return allDailyScrumArray;
    }
});


Template.pairdude.helpers ({

    dudepicture: function() {
        return Session.get('tmpDudePicture');
    }
    ,
    userid : function() {
        return Session.get('tmpDudeUserId');
    }
});








// todo spostare questa parte in un dateUtils.js
function convertDailyScrumDate(d) {
    // d formattato come '27/09/2013'

    var today = new Date();

    var yesterday = getYesterdayDate(today);

    if (d == formatDate(today))
        return 'TODAY';
    else if (d == formatDate(yesterday)) {
        return 'YESTERDAY';
    }
    else
        return d;

}

function getYesterdayDate(today) {
    var yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // nel calcolo di yesterday, non devo considerare sabato, domenica
    // todo da implementare il calcolo delle festività

    // se ieri era domenica
    if (yesterday.getDay() == 0)
        yesterday.setDate(yesterday.getDate() - 2);

    // se ieri era sabato
    else if (yesterday.getDay() == 6)
        yesterday.setDate(yesterday.getDate() - 1);

    return yesterday;
}

function formatDate(date) {
    // input : date
    // output: date formattato come es. '27/09/2013'

    var day = date.getDate();
    var month = date.getMonth()+1;
    var year = date.getFullYear();

    if (day < 10)
        day = '0'+day;

    if (month < 10)
        month = '0'+month;

    return day+'/'+month+'/'+year;

}

function sortDailyScrumByDate(a, b){
    // return:
    //Less than 0: Sort "a" to be a lower index than "b"
    //Zero: "a" and "b" should be considered equal, and no sorting performed.
    //Greater than 0: Sort "b" to be a lower index than "a".

    // voglio gli oggetti ordinati per data decrescente (a partire da today)
    var dateA = parseString(a.date,'dd/MM/yyyy');
    var dateB = parseString(b.date,'dd/MM/yyyy');

    if (dateA.getTime() < dateB.getTime())
        return 1;
    else if (dateA.getTime() == dateB.getTime())
        return 0;
    else if (dateA.getTime() > dateB.getTime())
        return -1;


}

// Parse a string and convert it to a Date object.
// If no format is passed, try a list of common formats.
// If string cannot be parsed, return null.
// Avoids regular expressions to be more portable.
function parseString(val, format) {
    // If no format is specified, try a few common formats
    if (typeof(format)=="undefined" || format==null || format=="") {
        var generalFormats=new Array('y-M-d','MMM d, y','MMM d,y','y-MMM-d','d-MMM-y','MMM d','MMM-d','d-MMM');
        var monthFirst=new Array('M/d/y','M-d-y','M.d.y','M/d','M-d');
        var dateFirst =new Array('d/M/y','d-M-y','d.M.y','d/M','d-M');
        var checkList=new Array(generalFormats,Date.preferAmericanFormat?monthFirst:dateFirst,Date.preferAmericanFormat?dateFirst:monthFirst);
        for (var i=0; i<checkList.length; i++) {
            var l=checkList[i];
            for (var j=0; j<l.length; j++) {
                var d=Date.parseString(val,l[j]);
                if (d!=null) {
                    return d;
                }
            }
        }
        return null;
    };

    this.isInteger = function(val) {
        for (var i=0; i < val.length; i++) {
            if ("1234567890".indexOf(val.charAt(i))==-1) {
                return false;
            }
        }
        return true;
    };
    this.getInt = function(str,i,minlength,maxlength) {
        for (var x=maxlength; x>=minlength; x--) {
            var token=str.substring(i,i+x);
            if (token.length < minlength) {
                return null;
            }
            if (this.isInteger(token)) {
                return token;
            }
        }
        return null;
    };
    val=val+"";
    format=format+"";
    var i_val=0;
    var i_format=0;
    var c="";
    var token="";
    var token2="";
    var x,y;
    var year=new Date().getFullYear();
    var month=1;
    var date=1;
    var hh=0;
    var mm=0;
    var ss=0;
    var ampm="";
    while (i_format < format.length) {
        // Get next token from format string
        c=format.charAt(i_format);
        token="";
        while ((format.charAt(i_format)==c) && (i_format < format.length)) {
            token += format.charAt(i_format++);
        }
        // Extract contents of value based on format token
        if (token=="yyyy" || token=="yy" || token=="y") {
            if (token=="yyyy") {
                x=4;y=4;
            }
            if (token=="yy") {
                x=2;y=2;
            }
            if (token=="y") {
                x=2;y=4;
            }
            year=this.getInt(val,i_val,x,y);
            if (year==null) {
                return null;
            }
            i_val += year.length;
            if (year.length==2) {
                if (year > 70) {
                    year=1900+(year-0);
                }
                else {
                    year=2000+(year-0);
                }
            }
        }
        else if (token=="MMM" || token=="NNN"){
            month=0;
            var names = (token=="MMM"?(Date.monthNames.concat(Date.monthAbbreviations)):Date.monthAbbreviations);
            for (var i=0; i<names.length; i++) {
                var month_name=names[i];
                if (val.substring(i_val,i_val+month_name.length).toLowerCase()==month_name.toLowerCase()) {
                    month=(i%12)+1;
                    i_val += month_name.length;
                    break;
                }
            }
            if ((month < 1)||(month>12)){
                return null;
            }
        }
        else if (token=="EE"||token=="E"){
            var names = (token=="EE"?Date.dayNames:Date.dayAbbreviations);
            for (var i=0; i<names.length; i++) {
                var day_name=names[i];
                if (val.substring(i_val,i_val+day_name.length).toLowerCase()==day_name.toLowerCase()) {
                    i_val += day_name.length;
                    break;
                }
            }
        }
        else if (token=="MM"||token=="M") {
            month=this.getInt(val,i_val,token.length,2);
            if(month==null||(month<1)||(month>12)){
                return null;
            }
            i_val+=month.length;
        }
        else if (token=="dd"||token=="d") {
            date=this.getInt(val,i_val,token.length,2);
            if(date==null||(date<1)||(date>31)){
                return null;
            }
            i_val+=date.length;
        }
        else if (token=="hh"||token=="h") {
            hh=this.getInt(val,i_val,token.length,2);
            if(hh==null||(hh<1)||(hh>12)){
                return null;
            }
            i_val+=hh.length;
        }
        else if (token=="HH"||token=="H") {
            hh=this.getInt(val,i_val,token.length,2);
            if(hh==null||(hh<0)||(hh>23)){
                return null;
            }
            i_val+=hh.length;
        }
        else if (token=="KK"||token=="K") {
            hh=this.getInt(val,i_val,token.length,2);
            if(hh==null||(hh<0)||(hh>11)){
                return null;
            }
            i_val+=hh.length;
            hh++;
        }
        else if (token=="kk"||token=="k") {
            hh=this.getInt(val,i_val,token.length,2);
            if(hh==null||(hh<1)||(hh>24)){
                return null;
            }
            i_val+=hh.length;
            hh--;
        }
        else if (token=="mm"||token=="m") {
            mm=this.getInt(val,i_val,token.length,2);
            if(mm==null||(mm<0)||(mm>59)){
                return null;
            }
            i_val+=mm.length;
        }
        else if (token=="ss"||token=="s") {
            ss=this.getInt(val,i_val,token.length,2);
            if(ss==null||(ss<0)||(ss>59)){
                return null;
            }
            i_val+=ss.length;
        }
        else if (token=="a") {
            if (val.substring(i_val,i_val+2).toLowerCase()=="am") {
                ampm="AM";
            }
            else if (val.substring(i_val,i_val+2).toLowerCase()=="pm") {
                ampm="PM";
            }
            else {
                return null;
            }
            i_val+=2;
        }
        else {
            if (val.substring(i_val,i_val+token.length)!=token) {
                return null;
            }
            else {
                i_val+=token.length;
            }
        }
    }
    // If there are any trailing characters left in the value, it doesn't match
    if (i_val != val.length) {
        return null;
    }
    // Is date valid for month?
    if (month==2) {
        // Check for leap year
        if ( ( (year%4==0)&&(year%100 != 0) ) || (year%400==0) ) { // leap year
            if (date > 29){
                return null;
            }
        }
        else {
            if (date > 28) {
                return null;
            }
        }
    }
    if ((month==4)||(month==6)||(month==9)||(month==11)) {
        if (date > 30) {
            return null;
        }
    }
    // Correct hours value
    if (hh<12 && ampm=="PM") {
        hh=hh-0+12;
    }
    else if (hh>11 && ampm=="AM") {
        hh-=12;
    }
    return new Date(year,month-1,date,hh,mm,ss);
};