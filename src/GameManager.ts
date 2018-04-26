import {vec2,vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Player from './Player';
import Terrain from './terrain';
import { ENETUNREACH } from 'constants';
//This class keeps track of the game state, including:
//*Player
//*Terrain
//*Score
//*Time
//It also controls the physics of the player and handles any intersections
//between the player and the terrain
//This information is passed into the renderer inside main

class GameManager {

    player: Player = new Player();
    terrain: Terrain = new Terrain();
    constructor() {}

    intersectPlayer(a:number, b:number, c:number, x:number, y:number, radius:number) : boolean{
      //based on perpendicular distance between line and point
      var dist = (Math.abs(a * x + b * y + c)) / Math.sqrt(a * a + b * b);
      return dist < radius;
    }

    keyUp(){
      this.player.buttonReleased();
    }
    keyDown(){
      this.player.buttonPressed();
    }

    quit(){
      this.player.playing = false;
      this.player.acc = vec2.create();
      this.player.vel = vec2.create();
      this.player.falling = false;
      
    }

    restart(){
      this.player.restart();
    }
    
    checkIntersection() {
      var terrainHeight = this.terrain.getHeight(this.player.pos[0]);
      var dir = vec2.fromValues(this.player.vel[0], this.player.vel[1]);
      vec2.normalize(dir, dir);
      var newPos = vec2.create();
      vec2.scale(dir, dir, 0.06);
      vec2.add(newPos, this.player.pos, dir);
      var birdDirHeight = this.terrain.getHeight(this.player.pos[0] + 0.03);//newPos[0]);
      var birdDirHeight2 = this.terrain.getHeight(this.player.pos[0] - 0.03);
      if (Math.abs(this.player.pos[1] - terrainHeight) < 0.055) {
        if(this.player.acc[0] > 0.0 && this.player.vel[0] > 0.0 && this.player.acc[1] > 0.0){
          // this.player.pos[1] = terrainHeight + 0.1;
          this.player.falling = true;
          // this.player.falling = true;
        } else {
          this.player.pos[1] = terrainHeight + 0.03;
          this.player.falling = false;
        }
        // this.player.pos[1] = terrainHeight + 0.03;
        //   this.player.falling = false;
        
        
      } else if(Math.abs(this.player.pos[1] - birdDirHeight) < 0.02){
        this.player.pos[1] = birdDirHeight + 0.04;
        this.player.falling = true;
      } else if(Math.abs(this.player.pos[1] - birdDirHeight2) < 0.02) { 
        this.player.pos[1] = birdDirHeight2 + 0.04;
        this.player.falling = true;
        // this.player.pos[1] = birdDirHeight2 + 0.03;
        // this.player.falling = false;
      } else {
        this.player.falling = true;
      }
      // var slope = this.terrain.getSlope(this.player.pos[0]);
      // var height = this.terrain.getHeight(this.player.pos[0]);
      //ax + by + c = 0, standard form
      //y - y1 = m(x - x1);
      //y - height = slope(x - this.player.pos[0]);
      //y - slope(x) = height - slope*this.player.pos[0];
      //slope(x) - 1(y) =  slope*this.player.pos[0] - height;
      //slope(x) - 1(y) + (slope*this.player.pos[0] - height) = 0;
      //a = m, b = -1, c = (slope*this.player.pos[0] - height), x, y = bird position
      // if (this.intersectPlayer(slope, -1.0, (-slope*this.player.pos[0] + height), this.player.pos[0], this.player.pos[1], 0.03)) {
      //   this.player.falling = false;
      // } else {
      //   this.player.falling = true;
      // }
    }
    updateState(){
      //see if terrain and bird are intersecting
      // this.checkIntersection();
      //update player force
      var terrainNormal = this.terrain.getNormal(this.player.pos[0]);
      var friction = vec2.fromValues(this.terrain.getSlope(this.player.pos[0]), 2.0);
      this.player.calculateForce(terrainNormal, friction);
      //see if terrain and bird are intersecting
      this.checkIntersection();
      //update player state
      this.player.updateState(0.1);

      
    }
}
export default GameManager;