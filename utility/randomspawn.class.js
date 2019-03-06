import { Vector } from './vector.class.js';

var quantity;
var size;
var objects;
var verbose;
var viewport;
var ctx;

export class RandomSpawn {
    constructor(build) {
        this.quantity = build.quantity;
        this.size = build.object_size;
        this.viewport = build.viewport;
        this.verbose = build.verbose;
        this.ctx = build.context;
        this.init_objects();
    }
    
    spawn() {
        this.draw();
        
        return this.objects;
    }
    
    init_objects() {
        this.log('=========');

        this.objects = new Array();
        for(var i=0;i<this.quantity;i++) {
            var x = Math.floor(this.get_rand(this.size/2, this.viewport.w - this.size));
            var y = Math.floor(this.get_rand(this.size/2, this.viewport.h - this.size));

            var angle = this.get_rand(0,2*Math.PI);
            //var speed = Math.floor(this.get_rand(1,2));
            var speed = 5;

            this.log('#'+i+', pos: {'+x+', '+y+'}');
            //this.log('#'+i+', angle: '+angle);
            /*
            console.log('#'+i+', angle: '+angle+
                        ', (cos:'+Math.ceil(Math.cos(angle))+', sin:'+Math.ceil(Math.sin(angle))+')');
            */

            this.check_overlap({
                'x': x,
                'y': y,
                'width': this.size,
                'height': this.size,
                'angle': angle,
                'speed': speed
            });
        }

        this.log('=========');
    }

    check_overlap(obj) {
        var radius = this.size/2;
        var is_available = true;

        for(var i=0;i<this.objects.length;i++) {
            
            var points = {
                a: {
                    x: obj.x,
                    y: obj.y,
                    z: 0
                },
                b: {
                    x: this.objects[i].x,
                    y: this.objects[i].y,
                    z: 0
                }
            };
            
            var max_allowable_distance = Math.sqrt(Math.pow(radius,2) + Math.pow(radius,2)) * 2;
            var distance = new Vector(points.a,points.b).length;
            
            if(distance < max_allowable_distance) {
               is_available = false;
                break;
            }
            
            /*
            if((this.objects[i]['x'] + radius > obj['x'] && this.objects[i]['x'] - radius < obj['x']) && 
               (this.objects[i]['y'] + radius > obj['y'] && this.objects[i]['y'] - radius < obj['y'])) {
                is_available = false;
                break;
            }
            */
        }

        if(!is_available) {
            obj['x'] = Math.floor(this.get_rand(radius, this.viewport.w - this.size));
            obj['y'] = Math.floor(this.get_rand(radius, this.viewport.h - this.size));

            return this.check_overlap(obj);
        } else {
            this.objects.push(obj);
        }
    }
    
    move(args) {
        var index = args.index;
        var x = args.x;
        var y = args.y;
        
        this.objects[index]['x'] = x;
        this.objects[index]['y'] = y;
        
        this.log('RANDOM SPAWN MOVED');
        this.log('#'+index+', pos: {'+this.objects[index]['x']+', '+this.objects[index]['y']+'}');
    }
    
    draw() {
        for(var i=0;i<this.objects.length;i++) {
            var x = this.objects[i]['x'];
            var y = this.objects[i]['y'];

            this.ctx.fillStyle = 'rgba(255,0,0,0.5)';
            this.ctx.fillRect(x - (this.size/2), y - (this.size/2), this.size, this.size);
        }
    }

    get_rand(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    log(message) {
        if(this.verbose) console.log(message);
    }
}