function resizeCanvas(width, height) {
    canvas.width = width;
    canvas.height = height;
}
function resizeToFit() {
    var width = parseFloat(window.getComputedStyle(canvas).width);
    var height = parseFloat(window.getComputedStyle(canvas).height);
    resizeCanvas(width, height);
}

class Point{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
}

// Declaring basic vector functions
function sizeVector(a) { 
    var v = Math.sqrt( (a.x * a.x) + (a.y * a.y) ); 
    return v;
}
function addVector(a, b) { 
    var v = new Point( (a.x + b.x), (a.y + b.y) ); 
    return v;
}
function subVector(a, b) { 
    var v = new Point( (a.x - b.x), (a.y - b.y) ); 
    return v;
}
function multCteVector(n, a) { 
    var v = new Point( (n * a.x), (n* a.y) ); 
    return v;
}
function multScalarVector(a, b) { 
    var v = (a.x * b.x) + (a.y * b.y); 
    return v;
}
function divVector(n, a) {
    var v = new Point( (a.x / n), (a.y / n) );
    return v;
}
function rotateVector(v, d) {
    var r = new Point( ((Math.cos(d) * v.x) + ((-1) *Math.sin(d) * v.y)),
                        (( Math.sin(d) * v.x) + (Math.cos(d) * v.y)) );
    return r;
}

function addPolygon() {
    if (no_vertex == 1) 
        circles.push(mouse);
    else {
        var d = 2*Math.PI/no_vertex;
        var v = new Point(0, (-1) * radius);
        var tmp = ( (no_vertex-1) / 2) + 1 ;
        if (no_vertex%2 == 0) tmp = (no_vertex/2) + 0.5;
        v = rotateVector(v, tmp*d);
        v = addVector(v, mouse);
        circles.push(v);
        v = subVector(v, mouse);

        // Rotate v on origin, then translade to mouse location and then translate it back to the origin
        for(var i = 0; i < no_vertex-1; i++){
            v = rotateVector(v, d);
            v = addVector(v, mouse);
            circles.push(v);
            v = subVector(v, mouse);
        }            
    }
}

function drawCircle(p) {
    // Draw inner circle
    ctx.beginPath();
    ctx.fillStyle = "#99FF66";
    ctx.arc(p.x, p.y, 4 , 0, 2*Math.PI);
    ctx.fill();
    // Draw outer circle
    ctx.beginPath();
    ctx.strokeStyle = "#99FF66";
    ctx.arc(p.x, p.y, 8 , 0, 2*Math.PI);
    ctx.stroke();
}

function drawLine(a, b, style) {
    ctx.strokeStyle = style;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
}

function deCasteljau(p, t) {
    if (p.length == 1){
        return p[0];
    }
    var dc_points = [];
    for (var i = 0; i < (p.length-1); i++){
        // Do (1-t)*a + t*b
        var a = multCteVector(1-t, p[i]);
        var b = multCteVector(t, p[i+1]);
        var c = addVector(a,b);
        dc_points.push(c);
    }
    return deCasteljau(dc_points, t);
}

function drawCurve(p) {
    var curve = [];
    for (var i = 0; i <= iterations; i++){
        curve.push(deCasteljau(p, i/iterations));
    }
    for (var i = 0; i < curve.length-1; i++){
        drawLine(curve[i], curve[i+1], "#999966");
    }
}

function drawHugePolygon() {
    var hugePolygon = [];
    for (var i = 0; i < no_vertex; i++){
        var tmp = [];
        var aux = i;
        while(aux < circles.length){
            tmp.push(circles[aux]);
            aux += no_vertex;
        }
        var vertex;
        aux = 0;
        if (t == 0 || t == 1)
            vertex = deCasteljau(tmp, t);
        else {
            while (aux < t)
                aux += 1/iterations;
            // Create the line between the two points from bezier's curve
            var end_line = deCasteljau(tmp, aux);
            aux -= 1/iterations;
            var begin_line = deCasteljau(tmp, aux);

            //scalar projection = ( (a * b) / ((|a|)^2) ) * a
            var a = subVector(end_line, begin_line); 
            var b = subVector(deCasteljau(tmp, t), begin_line);
            var tmp = multScalarVector(a,b);
            tmp /= (a.x * a.x) + (a.y * a.y);
            tmp = multCteVector(tmp, a);
            vertex = addVector(begin_line, tmp);
        }
        hugePolygon.push(vertex);
    }

    for (var i = 0; i < no_vertex-1; i++){
        drawLine(hugePolygon[i], hugePolygon[i+1], "#00ff99");
    }
    drawLine(hugePolygon[no_vertex-1], hugePolygon[0], "#00ff99");
}

function draw(){
    iterations = form[0].value - 1;
    console.log(typeof(form[0].value));
    radius = form[2].value;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw circles
    circles.forEach(p => {
        drawCircle(p);    
    });
    if (circles.length > no_vertex){
        
        // Draw bezier curve for each polygon
        for (var i = 0; i < no_vertex; i++){
            var points_polygon = [];
            var aux = i;
            while (aux < circles.length){
                points_polygon.push(circles[aux]);
                aux += no_vertex;
            }
            drawCurve(points_polygon);
        }
       drawHugePolygon();
    }
    
}

function circleClicked(circles){
    for (var i = 0; i<circles.length; i++){
        // Check if mouse is within circle's area
        if (sizeVector(subVector(mouse, circles[i])) <= 8){
            return i;
        }
    }
    return -1;
}


var form = document.getElementById("form");
var no_vertex = form[1].value * 1;
var radius = form[2].value;

var slider = document.getElementById("range");
var t = 0.5;

var container = document.getElementById('container');
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
resizeToFit();

var mouse = new Point(0,0);
var move = false;
var circles = [];


// Atualiza a posicao do mouse toda vez que ele se mover
canvas.addEventListener('mousemove', e=>{
    mouse = new Point(e.offsetX, e.offsetY);
    if (move){
        circles[circle] = mouse;
        draw();
    }
});

// Create a new circle, if there's already a circle, enable circle to move with mouse
canvas.addEventListener('mousedown', e=>{
    circle = circleClicked(circles);
    if (circle == -1){
        addPolygon();
        draw();
    }
    else
        move = true;
});

// Desable movement bool
canvas.addEventListener('mouseup', e=>{
    move = false;
});

// If user changes no_vertex, reset everything
form[1].addEventListener('change', e=>{
    no_vertex = form[1].value * 1;
    //Clear everything
    circles = [];
});

form[0].addEventListener('change', e=>{
    console.log(typeof(form[0].value));
    //if (!it || it <= 0) it = 1;
    console.log(iterations);
    draw();
});

slider.oninput = function() {
    t = this.value/100;
    draw();
}

var btn = document.getElementById("btn");

btn.addEventListener('click', e=> {
    if (t == 1) t = 0;
    var speed = form[3].value;
    var id = setInterval(function() {
        t += speed * 0.001;
        if (t > 1) t = 1;
        slider.value = 100*t;
        draw();
        if (t == 1) clearInterval(id);
    }, 1000 / 50);
});