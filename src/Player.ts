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
    mass:number;
    minVelocityX:number;
    maxVelocityX:number;
    minVelocityY:number;
    maxVelocityY:number;
    falling:boolean;
    constructor() {
        this.force = vec2.fromValues(0.0,-9.8);
        this.falling = true;
        this.vel = vec2.fromValues(1.0, 0.0);
        this.pos = vec2.fromValues(-0.7, 0.5);
        this.minVelocityX = 1.0;
        this.maxVelocityX = 5.0;
        this.maxVelocityY = 5.0;
    }

    calculateForce(normal:vec2) {
        var gravity = vec2.fromValues(0.0,-9.8);
        if (this.falling) {
            this.force = gravity;
        } else {
            vec2.add(normal, normal, gravity);
            this.force = vec2.fromValues(1.0* normal[0], -9.8*normal[1]);
        }

    }

    updateState(deltaT:number){
        //this.computeDynamics(deltaT);
    
        //euler integration
        //vec3.add(force, force, this.addedForce);
        //update velocity
        this.vel[0] = this.vel[0] + (this.force[0]) * 0.01;
        this.vel[1] = this.vel[1] + (this.force[1]) * 0.01;

        if(this.vel[0] < this.minVelocityX){
            this.vel[0] = this.minVelocityX;
        }
        if(this.vel[0] > this.maxVelocityX){
            this.vel[0] = this.maxVelocityX;
        }
        if(this.vel[1] > this.maxVelocityY){
            this.vel[1] = this.maxVelocityY;
        }
        //this.addedForce = vec3.fromValues(0,0,0);
        //update position
        this.pos[0] = this.pos[0] + this.vel[0] * 0.01;
        this.pos[1] = this.pos[1] + this.vel[1] * 0.01;
      }
}

export default Player;