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
    falling:boolean;
    constructor() {
        this.force = vec2.fromValues(0.0,-9.8);
        this.falling = true;
        this.vel = vec2.fromValues(0.1, 0.0);
        this.pos = vec2.fromValues(-0.7, 0.5);
    }

    calculateForce(normal:vec2) {
        var gravity = vec2.fromValues(0.0,-9.8);
        if (this.falling) {
            this.force = gravity;
        } else {
            this.force = vec2.create();
        }
        // } else {
        //     vec2.add(normal, normal, gravity);
        //     this.force = vec2.fromValues(normal[0],normal[1]);
        // }
    }

    updateState(deltaT:number){
        //this.computeDynamics(deltaT);
    
        //euler integration
        //vec3.add(force, force, this.addedForce);
        //update velocity
        this.vel[0] = this.vel[0] + (this.force[0]) * 0.01;
        this.vel[1] = this.vel[1] + (this.force[1]) * 0.01;
        this.vel[2] = this.vel[2] + (this.force[2]) * 0.01;
        //this.addedForce = vec3.fromValues(0,0,0);
        //update position
        this.pos[0] = this.pos[0] + this.vel[0] * 0.01;
        this.pos[1] = this.pos[1] + this.vel[1] * 0.01;
        this.pos[2] = this.pos[2] + this.vel[2] * 0.01;
      }
}

export default Player;