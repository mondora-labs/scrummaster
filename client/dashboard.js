Meteor.subscribe('canvas');

var canvas = null;
var ctx = null;
var started = false;
var isRightMouseDown = false;

iniziaDisegno = function(evento){
    ctx.beginPath();
    ctx.moveTo(evento.offsetX,evento.offsetY);
    started = true;
}

disegna = function(evento){
    if(started){
        ctx.lineTo(evento.offsetX,evento.offsetY);
        // set line color
        if (isRightMouseDown == false)
            ctx.strokeStyle = '#000000';
        else
            ctx.strokeStyle = '#ffffff';
        ctx.stroke();
    }
}

fermaDisegno = function(){
    ctx.closePath();
    started = false;
}

salvaCanvas = function(){
    // anzichè salvarlo in local storage, lo salvo in una collection a DB
    //localStorage.setItem("canvas_fb_" + evento.detail, ctx.canvas.toDataURL('image/png'));

    var canvasElement = Canvas.findOne({
        $and: [
            {product_slug: Session.get('currentProduct')},
            {team_slug: Session.get('currentTeam')}
        ]
    });

    if (canvasElement)
        Canvas.remove(canvasElement._id);

    Canvas.insert( {
        product_slug: Session.get('currentProduct'),
        team_slug: Session.get('currentTeam'),
        dataUrl: ctx.canvas.toDataURL('image/png')
    });

    alert("Canvas salvato");
}

recuperaCanvas = function(){
    // anzichè recuperarlo da local storage, lo recupero da collection a DB
    //var immagine_salvata = localStorage.getItem("canvas_fb_" + evento.detail);
    var immagine_salvata = null;
    var canvasElement = Canvas.findOne({
        $and: [
            {product_slug: Session.get('currentProduct')},
            {team_slug: Session.get('currentTeam')}
        ]
    });

    if (canvasElement)
        immagine_salvata = canvasElement.dataUrl;

    if(immagine_salvata == null) return;
    var img = new Image();
    img.src = immagine_salvata;
    ctx.canvas.width = ctx.canvas.width;
    ctx.drawImage(img, 0, 0);
    //alert("Canvas recuperato");
}

resetCanvas = function(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

Template.dashboard.rendered = function(){
    canvas = $("#dash_canvas")[0];
    ctx = canvas.getContext("2d");

    recuperaCanvas();

};

Template.dashboard.events ({

    'mousedown #dash_canvas': function (event, template) {
        iniziaDisegno(event);
    },
    'mousemove #dash_canvas': function (event, template) {
        disegna(event);
    },
    'mouseup #dash_canvas': function (event, template) {
        fermaDisegno();
        isRightMouseDown = false;
    },
    'mouseleave #dash_canvas': function (event, template) {
        fermaDisegno();
        isRightMouseDown = false;
    },
    'click .saveCanvasBtn': function (event, template) {
        salvaCanvas();
    },
    'click .loadCanvasBtn': function (event, template) {
        recuperaCanvas();
    },
    'click .resetCanvas': function (event, template) {
        resetCanvas();
    },
    'contextmenu #dash_canvas': function (event, template) {
        isRightMouseDown = true;
        return false;
    }
});