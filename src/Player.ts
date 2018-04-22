import {vec2,vec3} from 'gl-matrix';
//This class keeps track of the player's state including:
//*Position
//*Velocity
//*Acceleration
//It also controls the physics of the player
//This information is passed into the GameManager
//to check for intersections

class Player {

    vel: vec2 = vec2.create();
    pos: vec2 = vec2.create();
    force: vec2 = vec2.create();
    acc: vec2 = vec2.create();
    mass: vec2 = vec2.create();
    minVelocityX:number;
    maxVelocityX:number;
    minVelocityY:number;
    maxVelocityY:number;
    falling:boolean;
    buttonDown:boolean;
    constructor() {
        this.force = vec2.fromValues(0.0,-9.8);
        this.falling = true;
        this.vel = vec2.fromValues(1.0, 0.0);
        this.pos = vec2.fromValues(-0.7, 0.5);
        this.minVelocityX = 0.2;
        this.maxVelocityX = 3.0;
        this.maxVelocityY = 50.0;
        this.mass = vec2.fromValues(1.0,1.0);
        this.buttonDown = false;
    }

    buttonPressed(){
        this.buttonDown = true;
    }

    buttonReleased(){
        this.buttonDown = false;
    }

    calculateForce(normal:vec2, friction:vec2) {
        var gravity = vec2.fromValues(0.0,-9.8 * 0.15);
        var force = vec2.create();
        // vec2.scale(normal, normal, 3.0);

        if(this.buttonDown){
            console.log('button is DOWN');
            // vec2.add(this.acc, this.acc, vec2.fromValues(0.0,-20.8));
            // vec2.scale(normal, normal, 12.0);
            if(normal[0] > 0.0){
                vec2.divide(normal,normal,normal);
                vec2.divide(normal,normal,normal);
                normal[1] = -normal[1] * 5.0;
                normal[0] = normal[0] * 3.0;
            } else {
                vec2.scale(normal, normal, 4.0);
            }
            
            // vec2.scale(normal, normal, -1.0);

            if(friction[0] < 0.0){
                vec2.scale(friction, friction,-2.5);
                friction[0] = friction[0] * 2.0;
            }
            

            vec2.add(force, force, vec2.fromValues(0.0, -40.0));
        } else {
            vec2.scale(normal, normal, 3.0);
        }
        if (this.falling) {
            vec2.add(force, force, gravity);
            this.acc = vec2.fromValues(force[0], force[1]);
        } else {
            
            vec2.add(force, normal, force);
            vec2.add(force, force, gravity);
            vec2.add(force, force, friction);

            this.acc = vec2.fromValues(force[0], force[1]);
        }

        // if(this.buttonDown){
        //     console.log('button is DOWN');
        //     vec2.add(this.acc, this.acc, vec2.fromValues(0.0,-20.8));
        //     // vec2.add(force, force, vec2.fromValues(0.0, -4000.0));
        // }

        

    }

    updateState(deltaT:number){
        //this.computeDynamics(deltaT);
    
        //euler integration
        //vec3.add(force, force, this.addedForce);
        //update velocity
        
        this.vel[0] = this.vel[0] + (this.acc[0]) * 0.01;
        this.vel[1] = this.vel[1] + (this.acc[1]) * 0.01;

        // if(this.vel[0] < this.minVelocityX){
        //     this.vel[0] = this.minVelocityX;
        // }
        if(this.vel[0] > this.maxVelocityX){
            this.vel[0] = this.maxVelocityX;
        }
        // if(this.vel[1] > this.maxVelocityY){
        //     this.vel[1] = this.maxVelocityY;
        // }
        if(this.vel[1] < 0.0 && !this.falling){
            this.vel[1] = 0.0;
        }
        //this.addedForce = vec3.fromValues(0,0,0);
        //update position
        this.pos[0] = this.pos[0] + this.vel[0] * 0.01;
        this.pos[1] = this.pos[1] + this.vel[1] * 0.01;
      }
}

export default Player;