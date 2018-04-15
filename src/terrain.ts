import {vec3, mat4} from 'gl-matrix';

class Terrain {

  constructor() {

  }

  getHeight(distance: number) {
      return Math.sin(distance);
  }

  getNormal(distance: number) {  
    return - 1 / Math.cos(distance);
  }

};

export default Terrain;
