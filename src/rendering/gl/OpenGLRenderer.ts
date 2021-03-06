import {mat4, vec4} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';
import ShaderProgram from './ShaderProgram';
import Sprite from '../../geometry/Sprite';

// In this file, `gl` is accessible because it is imported above
class OpenGLRenderer {
  constructor(public canvas: HTMLCanvasElement) {
  }

  setClearColor(r: number, g: number, b: number, a: number) {
    gl.clearColor(r, g, b, a);
  }

  setSize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clear() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  render( prog: ShaderProgram, drawables: Array<Drawable>) {

    for (let drawable of drawables) {
      prog.draw(drawable);
    }

    // for (let sprite of sprites){
    //   prog.drawSprite(sprite);
    // }
  }
};

export default OpenGLRenderer;
