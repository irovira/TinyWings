import {vec2, vec4, mat4} from 'gl-matrix';
import Drawable from './Drawable';
import Sprite from '../../geometry/Sprite';
import {gl} from '../../globals';

var activeProgram: WebGLProgram = null;

export class Shader {
  shader: WebGLShader;

  constructor(type: number, source: string) {
    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);

    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;

  unifScreen: WebGLUniformLocation;
  unifBirdPos: WebGLUniformLocation;
  unifColorScheme: WebGLUniformLocation;
  unifTexture: WebGLUniformLocation;

  constructor(shaders: Array<Shader>) {
    this.prog = gl.createProgram();

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }
    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
    this.unifScreen = gl.getUniformLocation(this.prog, "u_Screen");
    this.unifBirdPos = gl.getUniformLocation(this.prog, "u_BirdPos");
    this.unifColorScheme = gl.getUniformLocation(this.prog, "u_ColorScheme");

    //sprite
    this.unifTexture = gl.getUniformLocation(this.prog, "u_Texture");


  }

  use() {
    if (activeProgram !== this.prog) {
      gl.useProgram(this.prog);
      activeProgram = this.prog;
    }
  }

  setScreenDimensions(width: number, height: number) {
    this.use();
    if (this.unifScreen != -1) {
      gl.uniform2f(this.unifScreen, width, height);
    }
  }

  setBirdPosition(birdPos: vec2) {
    this.use();
    if (this.unifBirdPos != -1) {
      gl.uniform2f(this.unifBirdPos, birdPos[0], birdPos[1]);
    }
  }

  setColorScheme() {
    this.use();
    if (this.unifColorScheme != -1) {
      gl.uniform2f(this.unifColorScheme, Math.random() - 0.5, Math.random() - 0.5);
    }
  }

  drawSprite(s: Sprite){
     // Setup the attributes for the quad

    this.use();

    if (this.attrPos != -1 && s.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
    }
 
    var textureUnit = 0;
  // The the shader we're putting the texture on texture unit 0
    gl.uniform1i(this.unifTexture, textureUnit);
 
  // Bind the texture to texture unit 0
    gl.activeTexture(gl.TEXTURE0 + textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, s.texture);
 
    s.bindIdx();
    gl.drawElements(s.drawMode(), s.elemCount(), gl.UNSIGNED_INT, 0);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
  }

  draw(d: Drawable) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
    }


    d.bindIdx();
    gl.drawElements(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
  }
};

export default ShaderProgram;
