import {vec2, vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import GameManager from './GameManager';
import Sprite from './geometry/Sprite';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.


let screenQuad: Square;
let bird: Sprite;
let count: number;
let gameManager: GameManager = new GameManager();
const controls = {
  timer: 45.0,
  distance: 0.0,
  'Restart': restart,
};
function handleKeyDown(){

}

function handleKeyUp(){

}




function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);
  count = 0;

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'timer').listen();
  gui.add(controls, 'distance').listen();
  gui.add(controls, 'Restart');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');

  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  screenQuad = new Square(vec3.fromValues(0, 0, 0));
  screenQuad.create();

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.disable(gl.DEPTH_TEST);

  const gameShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/game-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/game-frag.glsl')),
  ]);

  // set uniforms for the game
  gameShader.setTerrainParameters();

  // This function will be called every frame
  function tick() {
    count++;
    controls.distance = gameManager.player.pos[0];
    controls.timer -= 0.01;
    if(controls.timer <= 0.0){
      //debugger;
      gameManager.quit();
      controls.timer = 0.0;
    }
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    gameShader.setBirdPosition(gameManager.player.pos);//vec2.fromValues(count / 500.0, Math.sin(count / 100)));
    gameManager.updateState();
    renderer.clear();
    renderer.render(gameShader, [
      screenQuad,
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    gameShader.setScreenDimensions(canvas.width, canvas.height);
  }, false);

  window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
      return; // Should do nothing if the default action has been cancelled
    }
  
    var handled = false;
    if (event.key !== undefined) {
      if(event.key == " "){
        gameManager.keyDown();
      }

      // Handle the event with KeyboardEvent.key and set handled true.
      handled = true;
    } else if (event.keyCode !== undefined) {
      // Handle the event with KeyboardEvent.keyCode and set handled true.
    }
  
    if (handled) {
      // Suppress "double action" if event handled
      event.preventDefault();
    }
  }, true);

  window.addEventListener("keyup", function (event) {
    if (event.defaultPrevented) {
      return; // Should do nothing if the default action has been cancelled
    }
  
    var handled = false;
    if (event.key !== undefined) {
      if(event.key == " "){
        gameManager.keyUp();
      }
      // Handle the event with KeyboardEvent.key and set handled true.
      handled = true;
    } else if (event.keyCode !== undefined) {
      // Handle the event with KeyboardEvent.keyCode and set handled true.
    }
  
    if (handled) {
      // Suppress "double action" if event handled
      event.preventDefault();
    }
  }, true);

 

  renderer.setSize(window.innerWidth, window.innerHeight);
  gameShader.setScreenDimensions(canvas.width, canvas.height);


  // Start the render loop
  tick();
}

function restart(){
  debugger;
  controls.timer = 30.0;
  gameManager.restart();
  
}

main();
