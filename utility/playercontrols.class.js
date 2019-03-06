var keys = {
    left_arrow: 37,
    right_arrow: 39,
    up_arrow: 38,
    down_arrow: 40,
    spacebar: 32,
    w: 87,
    s: 83,
    a: 65,
    d: 68,
    f: 70,
    c: 67
};

var binds = {
    left: keys.left_arrow,
    right: keys.right_arrow,
    jump: keys.up_arrow,
    duck: keys.down_arrow,
    special_1: keys.f
};

export class PlayerControls {
    init(args) {
        var options = (args.options != null)? args.options:this.get_options();
        var horizontal_response = (args.horizontal != null)? args.horizontal:this.get_response;
        var vertical_response = (args.vertical != null)? args.vertical:this.get_response;
        
        // Horizontal
        var left = false;
        var right = false;
        var hor = 0; // current horizontal input
        var prev_hor = hor; // previous horizontal input

        // Vertical
        var up = false;
        var down = false;
        var vert = 0; // current vertical input
        var prev_vert = vert; // previous vertical input

        var ondown = (function(e) {
            // Manages horizontal input
            if(e.keyCode == binds.left || e.keyCode == binds.right) {
                if(e.keyCode == binds.left) { left = true; }
                if(e.keyCode == binds.right) { right = true; }

                if(left && right) { hor = 0; }
                else if(right && hor < 1) { hor += 1; }
                else if(left && hor > -1) { hor -= 1; }

                // If the horizontal input has changed
                if(prev_hor != hor) { 
                    prev_hor = hor;
                    horizontal_response(hor); 
                }
            }
            // Manages vertical input
            if(e.keyCode == binds.jump || e.keyCode == binds.duck) {
                if(e.keyCode == binds.jump) { up = true; }
                if(e.keyCode == binds.duck) { down = true; }

                if(up && down) { vert = 0; }
                else if(up && vert < 1) { vert += 1; }
                else if(down && vert > -1) { vert -= 1; }

                // If the vertical input has changed
                if(prev_vert != vert) { 
                    prev_vert = vert; 
                    vertical_response(vert);
                }
            }

            // Manages player (non-movement) actions
            if(e.keyCode == binds.special_1) {
                /*
                    The problem now is that movement actions continuously update on keydown and keyup
                      whereas non-movement actions only play once on keydown and can only be replayed after
                      the animation is finished.
                */
            }
        }).bind(this);

        var onup = (function(e) {
            // Manages horizontal input
            if(e.keyCode == binds.left || e.keyCode == binds.right) {
                if(e.keyCode == binds.left) { left = false; }
                if(e.keyCode == binds.right) { right = false; }

                if(!left && !right) { hor = 0; }
                else if(!left && hor < 1) { hor += 1; }
                else if(!right && hor > -1) { hor -= 1; } 

                // If the horizontal input has changed
                if(prev_hor != hor) { 
                    prev_hor = hor; 
                    horizontal_response(hor); 
                }
            }
            // Manages vertical input
            if(e.keyCode == binds.jump || e.keyCode == binds.duck) {
                if(e.keyCode == binds.jump) { up = false; }
                if(e.keyCode == binds.duck) { down = false; }

                if(!up && !down) { vert = 0; }
                else if(!down && vert < 1) { vert += 1; }
                else if(!up && vert > -1) { vert -= 1; }

                // If the vertical input has changed
                if(prev_vert != vert) { prev_vert = vert; }
            }
        }).bind(this);

        window.addEventListener('keydown', ondown);
        window.addEventListener('keyup', onup); 
    }
    
    get_options() {
        console.log('no options specified for controls');
    }
    
    get_response(response) {
        console.log('no function provided for '+response);
    }
}