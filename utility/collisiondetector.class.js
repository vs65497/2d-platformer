import { Quadtree } from './quadtree.class.js';
import { Vector } from './vector.class.js';

var collidables, collisions;

export class CollisionDetector extends Quadtree {
    constructor(build) {
        super(build);
    }
    
    move(args) {
        var index = args.index;
        var x = args.x;
        var y = args.y;
        
        this.nodes[index]['x'] = x;
        this.nodes[index]['y'] = y;
        
        this.log('COLLIDABLE MOVED');
        this.log('#'+index+', pos: {'+this.nodes[index]['x']+', '+this.nodes[index]['y']+'}');
        
        this.update();
    }
    
    update() {
        super.update();
        
        var d = new Date();
        var time = '('+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()+')';
        this.log('(around :15) fetching new collisions '+time);
        
        var qt = this.tree;
        
        this.collidables = new Array();
        this.collisions = new Array();
        
        this.findLeaves(qt);
        this.collisions = this.findCollisions();
    }
    
    findLeaves(qt) {
        var quadrants = qt['quadrants'];
        
        if(quadrants == null && qt.length > 1) { this.collidables.push(qt); }
        
        var branch = [];
        for(var q in quadrants) {
            this.findLeaves(quadrants[q]);
        }
        
        if(branch.length > 0) {
            this.collidables.push(branch);
        }
    }
    
    findCollisions() {
        var c = [];
        
        var clds = this.collidables;
        
        // iterate through potential collisions
        for(var i=0;i<clds.length;i++) {
            
            // objects
            var a = clds[i][0];
            var b = clds[i][1];
            
            //var poi = [a, b];
            
            var points = {
                a: {
                    x: a.x,
                    y: a.y,
                    z: 0
                },
                b: {
                    x: b.x,
                    y: b.y,
                    z: 0
                }
            };
            
            var max_width = (a.width >= b.width)? a.width:b.width;
            var max_height = (a.height >= b.height)? a.height:b.height;
            var max_allowable_distance = (max_width >= max_height)? max_width:max_height;
            var distance = new Vector(points.a,points.b).length;
            
            var adj = points.b.x - points.a.x;
            var opp = points.b.y - points.a.y;
            var theta = Math.atan(opp/adj) * (180 / Math.PI);
            theta = (theta < 0)? Math.abs(theta) + 90: theta;
            
            var side = {
                top: false,
                left: false,
                bottom: false,
                right: false
            };
            
            // bottom
            if(theta > 45 && theta <= 135) {
                side.top = true;
                
            // left
            } if(theta > 135 && theta <= 180 ) {
                side.right = true;
                
            // top
            } if(theta > 180 && theta <= 270) {
                side.bottom = true;
                
            // right
            } if((theta > 270 && theta <= 360) || theta >= 0 && theta <= 45) {
                side.left = true;
            }
            
            if(distance <= max_allowable_distance) {
                //if(JSON.stringify(poi)!=JSON.stringify(c[c.length-1])) c.push(poi);
                if(c[a.id] == null) {
                    c[a.id] = {
                        conflict: b.id,
                        angle: theta,
                        side: side
                    };
                }
            }
            
        }
        
        return c;
    }
    
    getCollisions() {
        return this.collisions;
    }
} // end class