Meteor.subscribe('retrospectives');

function getRetrospectiveList(product,team) {

    var onlyLastRetrospective = Session.get('onlyLastRetrospective');

    var retrospectiveArray = Retrospectives.find({
        $and: [
            {product_slug: product},
            {team_slug: team}
        ]
    }).fetch().sort(sortRetrospectivesByDate);

    if (retrospectiveArray) {

        for (var i=0; i<retrospectiveArray.length;i++) {

            var lessonsLearnedArray = retrospectiveArray[i].lessonlearned;

            for (var j=0; j < lessonsLearnedArray.length; j++) {
                lessonsLearnedArray[j].retrospectiveId = retrospectiveArray[i]._id;
                var commentsArray = lessonsLearnedArray[j].comments;

                if (commentsArray) {

                    for (var k=0; k<commentsArray.length; k++) {
                        var userInfo = Meteor.users.findOne({_id: commentsArray[k].user});
                        if (userInfo)
                            commentsArray[k].user = userInfo.profile.picture;
                    }
                    lessonsLearnedArray[j].comments = commentsArray;
                }
            }
            retrospectiveArray[i].lessonlearned = lessonsLearnedArray;

            // se sono nella pagina del team, restituisco solo la retrospettiva piu' recente
            if (onlyLastRetrospective == 1)
                return new Array(retrospectiveArray[0]);
        }
    }

    return retrospectiveArray;

}

Template.retrospectives.events ({

    'click #newRetrospective': function (event, template) {

        var todayRetrospective = Retrospectives.findOne({
            $and: [
                {product_slug: Session.get('currentProduct')},
                {team_slug: Session.get('currentTeam')},
                {date: formatDate(new Date())}
            ]
        });

        if (todayRetrospective != null) {
            alert('E\' già presente una retrospettiva per la data odierna!!!');
            return false;
        }

        if ($('#newRetrospectiveDescr').length != 0)
            return false;

        var input = $('<input />', {'type': 'text',
                                    'id': 'newRetrospectiveDescr',
                                    'value': 'Retrospettiva del '+formatDate(new Date())
                                   }
                     );

        $(event.target).parent().append(input);
        input.focus();

        return false;
    },

    'blur #newRetrospectiveDescr': function (event, template) {

        Retrospectives.insert( {
             product_slug: Session.get('currentProduct'),
             team_slug: Session.get('currentTeam'),
             date: formatDate(new Date()),
             description: $('#newRetrospectiveDescr').val(),
             lessonlearned:[ ]
        });

        $('#newRetrospectiveDescr').remove();

        return false;
    }
});

Template.retrospectivesList.events ({

    'click .addLessonLearned': function (event, template) {

        var retrospectiveId = $(event.target).attr('retrospectiveId');
        var retrospectiveElement = Retrospectives.findOne({_id: retrospectiveId});

        var currentLessonLearned = {};
        currentLessonLearned.id = Meteor.uuid();
        currentLessonLearned.description = $('.UFIAddLessonLearnedInput.'+retrospectiveId).val();
        currentLessonLearned.comments = new Array();

        if (retrospectiveElement) {
            var lessonLearnedArray = retrospectiveElement.lessonlearned;
            lessonLearnedArray.splice(0,0,currentLessonLearned);
            Retrospectives.update( {_id: retrospectiveId} , {$set:{lessonlearned: lessonLearnedArray}} );
        }
        return false;
    },

    'click .addTopicComment': function (event, template) {

        var retrospectiveId = $(event.target).attr('retrospectiveId');
        var lessonlearnedId = $(event.target).attr('lessonlearnedId');

        var commentText = $('.UFIAddCommentInput.'+lessonlearnedId).val();

        var newComment = {};
        newComment.user = Meteor.userId();
        newComment.text = commentText;

        var retrospectiveElement = Retrospectives.findOne({_id: retrospectiveId});

        if (retrospectiveElement) {
            var lessonLearnedArray = retrospectiveElement.lessonlearned;
            for (var i=0; i<lessonLearnedArray.length; i++) {
                if (lessonLearnedArray[i].id == lessonlearnedId) {
                    lessonLearnedArray[i].comments.push(newComment);
                    break;
                }
            }

            Retrospectives.update( {_id: retrospectiveId} , {$set:{lessonlearned: lessonLearnedArray}} );
        }

        return false;
    }

});

Template.retrospectives.helpers ({

    teamName: function() {
        return Session.get('currentTeam');
    },

    isScrumMaster: function (){
        return Session.get('currentRole') == 'SM' ;
    }

});

Template.retrospectivesList.helpers ({

    retrospectives: function() {
        return getRetrospectiveList(Session.get('currentProduct'),Session.get('currentTeam'));
    },

    currentUserImage: function (){
        return Meteor.user().profile.picture;
    }
});

// todo functions duplicate, altrimenti non vengono riconosciute in questo js: e' da capire come creare un dateUtil.js
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

function sortRetrospectivesByDate(a, b){
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