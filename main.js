import { CollisionDetector } from './utility/collisiondetector.class.js';
import { RandomSpawn } from './utility/randomspawn.class.js';
import { PlayerControls } from './utility/playercontrols.class.js';

var content;

var canvas;
var viewport = {w:1024/1.5,h:768/2};
var ctx;

var spn;
var collide;

var move_interval;
var stop_interval;
var character_size = 50;
//var character_weight = character_size / 3;
var character_weight = character_size / 3;
var id = 0;
var max_move_speed = character_size / 4;
var jumping = false;
var jump_height = Math.ceil(character_size * 2.5);
var jump_tracker = jump_height;
var gravity_interval;
var max_gravity = character_size / 3;
var on_platform = false;
var active_platform;
var falling = false;
var move_time = 0;
var prev_dir;
var delay = 1000 / 1000;

function main() {
    loading();
    init_canvas();
    
    spn = new RandomSpawn({
        quantity: 10,
        object_size: character_size,
        viewport: viewport,
        verbose: false,
        context: ctx
    });
    spn.draw();
    
    collide = new CollisionDetector({
        objects: spn.objects,
        viewport: viewport,
        threshold: 1,
        verbose: false,
        context: ctx
    });
    //collide.update();
    collide.draw();
    
    init_gravity();
    
    PlayerControls.prototype.init({
        horizontal:move_fx,
        vertical:jump_fx
    });
}

function loading() {
    var screen = document.createElement("div");
    screen.setAttribute('id','loading');
    screen.classList.add('noselect');
    screen.innerHTML = '<h1 class="message">Click to Start</h1>';
    document.getElementsByTagName("body")[0].appendChild(screen);
    var onclick = (function(){
        screen.classList.add('hide');
    });
    screen.addEventListener('click',onclick);
}

function jump_fx(response) {
    if(response == -1 || falling || jumping) return false;
    clearInterval(gravity_interval);
    
    //console.log(move_time);
    
    jumping = true;
    jump_tracker = jump_height / 2;
    var jump_interval = setInterval(function(){
        
        var conflict = handle_collision(id, ['top']); // why top????
        var amount = Math.log(jump_tracker / (character_weight /3)) *2;
        amount = (amount < 0)? 1:amount;
        
        if(conflict) {
            amount = -1 * spn.objects[id].height;
            clearInterval(jump_interval);
            jumping = false;
            init_gravity();
        
        } else if(jump_tracker <= 0) {
            jumping = false;
            clearInterval(jump_interval);
            init_gravity();
            return true;
        }
    
        var update = {
            index: id,
            x: spn.objects[id]['x'],
            y: spn.objects[id]['y'] - amount
        };

        spn.move(update);
        collide.move(update);

        reset_canvas();
        spn.draw();
        collide.draw();
        
        jump_tracker--;
    },delay);
}

function move_fx(response) {
    if(response == 0) {
        clearInterval(move_interval);
        stop_interval = setInterval(function(){
            if(move_time == 0) clearInterval(stop_interval);

            do_move(prev_dir);

            move_time--;
        },delay);
    } else {
        move_time = 0;
        prev_dir = response;

        clearInterval(stop_interval);
        move_interval = setInterval(function(){
            do_move(response);

            move_time++;
        },delay);
    }
}

function do_move(dir) {
    var side = (dir > 0)? ['right']:['left'];
    var conflict = handle_collision(id, side);
    
    var amp = Math.log(move_time/(character_weight /3));
    amp = (amp < 0)? 1:amp;
    amp = (amp > max_move_speed)? max_move_speed:amp;
    amp = (conflict)? 0:amp;
    
    var cur_obj = spn.objects[id];
    var radius = cur_obj.width / 2;
    var amount = cur_obj['x']+(dir * amp);
    
    if(conflict) {
        var clds = collide.collisions;
        var con_obj = clds[id].conflict;
        var con = {};
        con.radius = con_obj.width / 2;
        con.x = con_obj.x;
        con.left = con.x - con.radius;
        con.right = con.x + con.radius;
        
        if(dir >= 0) { // going right
            amount = con.left - radius;
        } else if(dir <= 0) {
            amount = con.right + radius;
        } else {
            amount = cur_obj.x;
        }
        
        clearInterval(move_interval);
        clearInterval(stop_interval);
        return false;
    }
    
    if(on_platform) {
        var pf = {};
        pf.radius = active_platform.width / 2;
        pf.x = active_platform.x;
        pf.left = pf.x - pf.radius;
        pf.right = pf.x + pf.radius;
        
        var cur = {};
        cur.left = cur_obj.x - radius;
        cur.right = cur_obj.x + radius;
        
        if(cur.left > pf.right || cur.right < pf.left) {
            on_platform = false;
            active_platform = null;
            falling = true;
        }
    }
    
    /*
    var fall_conflict = handle_collision(id, ['bottom']);
    if(fall_conflict) {
        var cur_obj = spn.objects[id];
        var clds = collide.collisions;
        var conflict_obj = spn.objects[clds[id].conflict];
        var max_distance = (cur_obj.width/2) + (conflict_obj.width/2);
        
        var intent = conflict_obj.x + (conflict_obj.width/2) + Math.abs(amount) + radius;
        
        console.log('conflict platform: '+conflict_obj.x + (conflict_obj.width/2));
        console.log('intent: '+intent);
        console.log('max: '+max_distance);
        
        if(intent > max_distance) console.log('should fall');

        //init_gravity();
    }
    */
    
    if(amount + radius > viewport.w) {
        amount = viewport.w - radius;
        clearInterval(move_interval);
        //console.log('oww!');
        
    } else if(amount - radius < 0) {
        amount = radius;
        clearInterval(move_interval);
        //console.log('oww!');
    }

    var update = {
        index: id,
        x: amount,
        y: spn.objects[id]['y']
    };

    spn.move(update);
    collide.move(update);

    reset_canvas();
    spn.draw();
    collide.draw();
}

function init_gravity() {
    var hang_time = 0;
    on_platform = false;
    active_platform = null;
    falling = true;
    
    gravity_interval = setInterval(function(){
        var conflict = handle_collision(id, ['top']);

        var amp = Math.log(Math.pow(hang_time / (character_weight /4),2)) *1.2;
        amp = (amp < 0)? 1:amp;
        amp = (amp > max_gravity)? max_gravity:amp;

        var radius = spn.objects[id].height / 2;
        var amount = spn.objects[id]['y']+(1 * amp);
        
        // landed on something
        if(conflict) {
            var cur_obj = spn.objects[id];
            var clds = collide.collisions;
            var con_obj = spn.objects[clds[id].conflict];
            var min_elevation = con_obj.y - (con_obj.height);
            
            /*
            var cur = {};
            cur.left = cur_obj.x - (cur_obj.width/2);
            cur.right = cur_obj.x + (cur_obj.width/2);
            
            var con = {};
            con.left = con_obj.x - (con_obj.width/2);
            con.right = con_obj.x + (con_obj.width/2);
            */
            
            //if(cur_obj.y > min_elevation 
            //if(cur_obj.y - radius < con_obj.y - (con_obj.height/2) 
            if(cur_obj.y - radius < con_obj.y 
               //&& cur.right >= con.left && cur.left <= con.right
              ) {
                amount = min_elevation;
                
            } else {
                amount = cur_obj.y;
            }
                
            //clearInterval(gravity_interval);
            on_platform = true;
            active_platform = con_obj;
            falling = false;
            hang_time = 0;
        
        // still on a platform;
        } else if(on_platform) {
            amount = spn.objects[id]['y'];
            hang_time = 0;
            
        // landed on floor
        } else if(amount + radius >= viewport.h) {
            amount = viewport.h - radius;
            clearInterval(gravity_interval);
            on_platform = false;
            active_platform = null;
            falling = false;
        }

        var update = {
            index: id,
            x: spn.objects[id]['x'],
            y: amount
        };

        spn.move(update);
        collide.move(update);

        reset_canvas();
        spn.draw();
        collide.draw();
        
        hang_time++;
    },delay);
}

function handle_collision(obj_id, check) {
    var clds = collide.collisions;
    if(clds[obj_id] != null) {
        if(clds[obj_id]['side'][check[0]]) return true;
        if(clds[obj_id]['side'][check[1]]) return true;
        if(clds[obj_id]['side'][check[2]]) return true;
        if(clds[obj_id]['side'][check[3]]) return true;
    }
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