import {vec2,vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Player from './Player';

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
    constructor(center: vec3) {
    }

    updateState(){
      //see if terrain and bird are intersecting
      var terrainNormal = vec2.create();
      //update player force
      this.player.calculateForce(terrainNormal);
      //update player state
      this.player.updateState(0.1);
      //update terrain state
      
    }
}
export default GameManager;