var tree;
var threshold;
var nodes;
var maxNodeWidth, maxNodeHeight;
var fieldWidth, fieldHeight;

var ctx;
var verbose;

export class Quadtree {
    constructor(build) {
        var objects = build.objects;
        this.fieldWidth = build.viewport.w;
        this.fieldHeight = build.viewport.h;
        this.threshold = build.threshold;
        this.verbose = build.verbose;
        this.ctx = build.context;
        
        this.setNodes(objects);
        this.setFieldSize(this.fieldWidth, this.fieldHeight);
        this.update();
    }
    
    setNodes(objects) {
        var n = [];
        
        for(var i=0;i<objects.length;i++) {
            n[i] = {
                'id': i,
                'x': objects[i]['x'],
                'y': objects[i]['y'],
                'width': objects[i]['width'],
                'height': objects[i]['height']
            };
            
            if(i == 0) {
                this.maxNodeWidth = objects[i]['width'];
                this.maxNodeHeight = objects[i]['height'];
                
            } else if(objects[i]['width'] > this.maxNodeWidth) {
                this.maxNodeWidth = objects[i]['width'];
                
            } else if(objects[i]['width'] > this.maxNodeWidth) {
                this.maxNodeHeight = objects[i]['height'];
            }
        }
        
        this.nodes = n;
    }
    
    setFieldSize(width, height) {
        this.fieldWidth = width;
        this.fieldHeight = height;
    }
    
    update() {
        /*
        var d = new Date();
        var time = '('+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()+')';
        console.log('updating quadtree '+time);
        */
        
        this.tree = this.branch(this.nodes, 0, 0, this.fieldWidth, this.fieldHeight);
    }
    
    branch(nodes, x0, y0, x1, y1) {
        var width = x1 - x0;
        var height = y1 - y0;
        var bounds = [[x0, y0],[x1, y1]];
        
        if(nodes.length <= this.threshold || 
           (width <= this.maxNodeWidth +1) || (height <= this.maxNodeHeight +1)) {
            return nodes;
        }
        
        var midx = (x0 + x1) / 2;
        var midy = (y0 + y1) / 2;
        
        var nw = [];
        var ne = [];
        var sw = [];
        var se = [];
        
        for(var i=0;i<nodes.length;i++) {
            if(this.in_quadrant(nodes[i],'nw',bounds)) {
                nw.push(nodes[i]);
            } 
            
            if(this.in_quadrant(nodes[i],'ne',bounds)) {
                ne.push(nodes[i]); 
            }
            
            if(this.in_quadrant(nodes[i],'sw',bounds)) {
                sw.push(nodes[i]);
            }
            
            if(this.in_quadrant(nodes[i],'se',bounds)) {
                se.push(nodes[i]);
            }
        }
        
        nw = (nw.length <= this.threshold)? nw: this.branch(nw, x0,   y0,   midx, midy);
        ne = (ne.length <= this.threshold)? ne: this.branch(ne, midx, y0,   x1,   midy);
        sw = (sw.length <= this.threshold)? sw: this.branch(sw, x0,   midy, midx, y1);
        se = (se.length <= this.threshold)? se: this.branch(se, midx, midy, x1,   y1);
        
        return {
            'quadrants': {
                'nw': nw,
                'ne': ne,
                'sw': sw,
                'se': se,
            },
            'bounds': bounds
        };
    }
    
    in_quadrant(node, quadrant, bounds) {
        var radiusx = node['width'] / 2;
        var radiusy = node['height'] / 2;
        
        var nodex = node['x'];
        var nodey = node['y'];
        
        // corners of node
        var n_nw, n_ne, n_sw, n_se;
        n_nw = [nodex - radiusx, nodey - radiusy];
        n_ne = [nodex + radiusx, nodey - radiusy];
        n_sw = [nodex - radiusx, nodey + radiusy];
        n_se = [nodex + radiusx, nodey + radiusy];
        
        var x0 = bounds[0][0];
        var y0 = bounds[0][1];
        var x1 = bounds[1][0];
        var y1 = bounds[1][1];
        
        var midx = (x0 + x1) / 2;
        var midy = (y0 + y1) / 2;
        
        // corners of specified quadrant
        var q_nw, q_ne, q_sw, q_se;
        
        switch(quadrant) {
            case 'nw':
                q_nw = [x0, y0];
                q_ne = [midx, y0];
                q_sw = [x0, midy];
                q_se = [midx, midy];
                break;
            case 'ne':
                q_nw = [midx, y0];
                q_ne = [x1, y0];
                q_sw = [midx, midy];
                q_se = [x1, midy];
                break;
            case 'sw':
                q_nw = [x0, midy];
                q_ne = [midx, midy];
                q_sw = [x0, y1];
                q_se = [midx, y1];
                break;
            case 'se':
                q_nw = [midx, midy];
                q_ne = [x1, midy];
                q_sw = [midx, y1];
                q_se = [x1, y1];
                break;
            case 'full':
                q_nw = [x0, y0];
                q_ne = [x1, y0];
                q_sw = [x0, y1];
                q_se = [x1, y1];
                break;
        }
        
        if(
            // node's northwest is in quadrant
            ((n_nw[0] >= q_nw[0] && n_nw[1] >= q_nw[1]) &&
            (n_nw[0] <= q_ne[0] && n_nw[1] >= q_ne[1]) &&
            (n_nw[0] >= q_sw[0] && n_nw[1] <= q_sw[1]) &&
            (n_nw[0] <= q_se[0] && n_nw[1] <= q_se[1])) ||
            
            // node's northeast is in quadrant
            ((n_ne[0] >= q_nw[0] && n_ne[1] >= q_nw[1]) &&
            (n_ne[0] <= q_ne[0] && n_ne[1] >= q_ne[1]) &&
            (n_ne[0] >= q_sw[0] && n_ne[1] <= q_sw[1]) &&
            (n_ne[0] <= q_se[0] && n_ne[1] <= q_se[1])) ||
            
            // node's southwest is in quadrant
            ((n_sw[0] >= q_nw[0] && n_sw[1] >= q_nw[1]) &&
            (n_sw[0] <= q_ne[0] && n_sw[1] >= q_ne[1]) &&
            (n_sw[0] >= q_sw[0] && n_sw[1] <= q_sw[1]) &&
            (n_sw[0] <= q_se[0] && n_sw[1] <= q_se[1])) ||
            
            // node's southeast is in quadrant
            ((n_se[0] >= q_nw[0] && n_se[1] >= q_nw[1]) &&
            (n_se[0] <= q_ne[0] && n_se[1] >= q_ne[1]) &&
            (n_se[0] >= q_sw[0] && n_se[1] <= q_sw[1]) &&
            (n_se[0] <= q_se[0] && n_se[1] <= q_se[1]))
        ) {
            return true;   
        }
        
        return false;
    }
    
    draw() {
        this.update();
        this.draw_grid(this.tree);
    }
    
    draw_grid(tree) {
        if(tree['bounds'] == null) return false;

        var x0 = tree['bounds'][0][0];
        var y0 = tree['bounds'][0][1];
        var x1 = tree['bounds'][1][0];
        var y1 = tree['bounds'][1][1];

        var midx = (x0 + x1) / 2;
        var midy = (y0 + y1) / 2;

        this.draw_line(midx, y0, midx, y1); // vertical divider
        this.draw_line(x0, midy, x1, midy); // horizontal divider
        
        this.draw_grid(tree['quadrants']['nw']);
        this.draw_grid(tree['quadrants']['ne']);
        this.draw_grid(tree['quadrants']['sw']);
        this.draw_grid(tree['quadrants']['se']);
    }

    draw_line(x0, y0, x1, y1) {
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.strokeStyle = 'black';
        this.ctx.stroke();
    }
    
    log(message) {
        if(this.verbose) console.log(message);
    }
    
} // end class