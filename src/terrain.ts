import {vec2, vec3, mat4} from 'gl-matrix';

class Terrain {

  constructor() {

  }

  getHeight(distance: number) {
      // return 0.2 * Math.sin(10.0 * distance);
      return Math.sin(distance*3.0) * 0.2 + 
      Math.sin(distance * 6.17+4740.14) * 0.1 + 
      Math.sin(distance * 10.987+19.19) * 0.05;

  }

  getNormal(distance: number) {  
    // return vec2.fromValues(- 2.0 * Math.cos(10.0 * distance), 1 );
    let slope = 0.6 * Math.cos(3 * distance) + 
          0.617 * Math.cos(4740.14 + 6.17 * distance) +
          0.54935 * Math.cos(19.19 + 10.987 * distance);
    return vec2.fromValues( - slope, 1);
  }

  getSlope(distance: number) {  
    // return 2.0 * Math.cos(10.0 * distance);
    return 0.6 * Math.cos(3 * distance) + 
    0.617 * Math.cos(4740.14 + 6.17 * distance) +
    0.54935 * Math.cos(19.19 + 10.987 * distance);
  }

};

export default Terrain;
