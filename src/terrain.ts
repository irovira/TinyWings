import {vec2, vec3, mat4} from 'gl-matrix';

class Terrain {

  constructor() {

  }

  getHeight(distance: number) {
      return 0.2 * Math.sin(10.0 * distance);

  }

  getNormal(distance: number) {  
    return vec2.fromValues(- 2.0 * Math.cos(10.0 * distance), 1 );
  }

};

export default Terrain;
