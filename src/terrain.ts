import {vec2, vec3, mat4} from 'gl-matrix';

class Terrain {

  constructor() {
  }

  getHeight(distance: number) {
      // Height function offset a little bit
      let sinPart = Math.sin(distance*3.0) * 0.2 + 
      Math.sin(distance * 6.17+4740.14) * 0.1 + 
      Math.sin(distance * 10.987+19.19) * 0.05;
      return ( - sinPart - 0.1);
  }

  getNormal(distance: number) {  
    // Negation of the derivative of the height
    let normal = 0.6 * Math.cos(3 * distance) + 
          0.617 * Math.cos(4740.14 + 6.17 * distance) +
          0.54935 * Math.cos(19.19 + 10.987 * distance);
    return vec2.fromValues(normal, 1);
  }

  getSlope(distance: number) {  
    // Derivative of the height
    let slope =  ( 0.6 * Math.cos(3 * distance) + 
    0.617 * Math.cos(4740.14 + 6.17 * distance) +
    0.54935 * Math.cos(19.19 + 10.987 * distance));
    return -slope;
  }
};

export default Terrain;
