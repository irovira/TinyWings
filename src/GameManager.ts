import {vec2,vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Player from './Player';
import Terrain from './terrain';
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
    constructor() {

    }
    
    checkIntersection() {
      var terrainHeight = this.terrain.getHeight(this.player.pos[0]);
      // if (this.player.pos[1] - terrainHeight < 0.03) {
      if (Math.abs(this.player.pos[1] - terrainHeight) < 0.03) {
        this.player.falling = false;
        this.player.vel = vec2.create();
      } else {
        this.player.falling = true;
      }
    }
    updateState(){
      //see if terrain and bird are intersecting
      this.checkIntersection();
      //update player force
      var terrainNormal = this.terrain.getNormal(this.player.pos[0]);
      this.player.calculateForce(terrainNormal);
      //update player state
      this.player.updateState(0.1);

      
    }
}
export default GameManager;