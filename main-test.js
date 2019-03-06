import { CollisionDetector } from './utility/collisiondetector.class.js';
import { RandomSpawn } from './utility/randomspawn.class.js';

var content;

var canvas;
var viewport = {w:1024/2,h:768/2};
var ctx;

var collide;

function main() {
    init_canvas();
    
    var spn = new RandomSpawn({
        quantity: 20,
        object_size: 10,
        viewport: viewport,
        verbose: false,
        context: ctx
    });
    spn.draw();
    
    collide = new CollisionDetector({
        objects: spn.objects,
        viewport: viewport,
        threshold: 2,
        verbose: false,
        context: ctx
    });
    //collide.update();
    collide.draw();
    
    setTimeout(function(){
        var i = 0;
        var update = {
            index: i,
            x: spn.objects[i]['x']+50,
            y: spn.objects[i]['y']+50
        };
        spn.move(update);
        collide.move(update);
        
        reset_canvas();
        spn.draw();
        collide.draw();
    },1000);
}

function init_canvas() {
    content = document.getElementById("content");
    canvas = document.createElement("canvas");
    
    canvas.width = viewport.w;
    canvas.height = viewport.h;
    
    ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,viewport.w,viewport.h);
    
    content.appendChild(canvas);
}

function reset_canvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,viewport.w,viewport.h);
}

window.onload = function() {
    main();
}