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

function resetTimer() {
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
    var selectedUserId = Session.get('dailyScrumUserId');
    if (selectedUserId) {
        $("img."+selectedUserId).css('display','block');
        $(".pieChart."+selectedUserId).css('display','none');
        $('.chart.'+selectedUserId).data('easyPieChart').update(timer);
    }
}

function showDailyScrumPanel () {
    var selectedUserId = Session.get('dailyScrumUserId');
    $("img."+selectedUserId).css('display','none');
    $(".pieChart."+selectedUserId).css('display','block');
    $('#dailyScrumPanel').show();
}

function hideDailyScrumPanel () {
    var selectedUserId = Session.get('dailyScrumUserId');
    $("img."+selectedUserId).css('display','block');
    $(".pieChart."+selectedUserId).css('display','none');
    $('#dailyScrumPanel').hide();
}

Template.dailyscrum.rendered = function() {

    if (Session.get('tmpDudePicture') == null)
        resetTodayPair();

    $(function() {
        $( ".draggable_img" ).draggable({
            scroll: false,
            revert: true,
            helper: "clone",
      //      containment: ".todayPair",
            stack: "div",
      //      grid: [ 50, 100 ],
      //      containment: "#containmentDiv",
      /*      start: function(event, ui) {

            },*/
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


    $('.chart').easyPieChart({
        animate: 1000/* ,

        onStop: function () {
            resetTimer();
           var spanToReset = $('.percentValue');
            for (var i = 0 ; i<spanToReset.length; i++){
                $('.percentValue')[i].innerHTML = "0:00";
            }
        }*/
    });

    var selectedUserId = Session.get('dailyScrumUserId');
    if (selectedUserId)
        showDailyScrumPanel();
    else
        hideDailyScrumPanel();

}

Template.dailyScrumTasksPanel.rendered = function() {

    var selectedUserId = Session.get('dailyScrumUserId');

    if (selectedUserId) {
        showDailyScrumPanel();
    }
    else {
        hideDailyScrumPanel();
    }
}

Template.dailyscrum.events({

    'click .user': function (event, template) {

        var selectedUserId;

        if (!isTimerWorking) {

            selectedUserId = event.target.parentElement.id;

            resetTodayPair();
            Session.set('dailyScrumUserId', selectedUserId);

            isTimerWorking = true;

            showDailyScrumPanel();

            percentProgress = setInterval(function() {
                $("div."+selectedUserId+" canvas").css('background-image','url('+Meteor.users.findOne({_id:selectedUserId}).profile.picture+')');

                $("img."+selectedUserId).css('display','none');
                $(".pieChart."+selectedUserId).css('display','block');

                timer++;

                $('.chart.'+selectedUserId).data('easyPieChart').update(timer*100/maxDailyScrumTime);

                var minutes = Math.floor(timer/60);
                var seconds = timer%60;

                $('.percentValue.'+selectedUserId).text(minutes +':' + (seconds < 10 ? ('0'+seconds):seconds));

                if (timer == maxDailyScrumTime)
                    resetTimer();

            }, 1000);
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
                        tasks:[ ]
                    }
                );
        }
        return false;
    },

    'click #skipTimer': function (event, template) {
        resetTimer();

        return false;
    }

});

Template.dailyScrumTasksPanel.events ({
    'click .addTask': function (event, template) {

        var newTask= {};

        // todo funzione per generare un numero randomico.. capire se c'è qualcosa di meglio
        newTask.id = Meteor.uuid();

        newTask.description = $(".newTaskArea."+event.target.id).val();

        var pairUser = $('.todayPair.'+event.target.id).find('img').attr('userid');

        if (pairUser != null && pairUser != ''){
            newTask.pair = [pairUser];
        }
        else
            newTask.pair = [""];

        var dailyScrumToUpdate = DailyScrum.findOne({_id : event.target.id });

        if (dailyScrumToUpdate) {
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
    }
});

Template.dailyScrumTasksPanel.helpers ({

    dailyScrum: function() {

        var dailyScrumArray =  DailyScrum.find({
            $and: [
                {product_slug: Session.get('currentProduct')},
                {team_slug: Session.get('currentTeam')},
                {player: Session.get('dailyScrumUserId')}
            ]
        }).fetch().sort(sortDailyScrumByDate); //.reverse();

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