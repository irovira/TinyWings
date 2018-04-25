import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';

class Sprite extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  center: vec4;
  textureInfo: Array<number> = new Array<number>();
  texture: WebGLTexture;
  textureWidth: number;
  textureHeight: number;

  constructor(center: vec3) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);
    this.name = "sprite";
    this.isSprite = true;
  }

  create() {

  this.indices = new Uint32Array([0, 1, 2,
                                  0, 2, 3]);
  this.normals = new Float32Array([0, 0, 1, 0,
                                   0, 0, 1, 0,
                                   0, 0, 1, 0,
                                   0, 0, 1, 0]);
  this.positions = new Float32Array([-1, -1, 0, 1,
                                     1, -1, 0, 1,
                                     1, 1, 0, 1,
                                     -1, 1, 0, 1]);

    this.generateIdx();
    this.generatePos();
    this.generateNor();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(`Created sprite`);
  }

  loadImageAndCreateTextureInfo(url:string) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
   
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
   
    var textureInfo = {
      width: 1,   // we don't know the size until it loads
      height: 1
    };

    var img = new Image();
    img.src = url; 

    img.onload = function() {
      textureInfo.width = img.width;
      textureInfo.height = img.height;
   
      gl.bindTexture(gl.TEXTURE_2D, img);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
    }


    this.texture = img;
    this.textureHeight = textureInfo.height;
    this.textureWidth = textureInfo.width;
    
    
  }
};

export default Sprite;