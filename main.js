import {oShape, iShape, sShape, zShape, lShape, jShape, tShape, drawBackground, drawGrid} from './tiles.js';
import {Map} from './map.js';

var scoreH3 = document.getElementById('score');
var score = 0;
main();

function main() {
    const canvas = document.getElementById('mainCanvas');
    const gl = canvas.getContext('webgl');
    // If we don't have a GL context, give up now
    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }
    // Vertex shader program
    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;
    // Fragment shader program
    const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;
    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    // Collect all the info needed to use the shader program.
    // Look up which attributes our shader program is using
    // for aVertexPosition, aVevrtexColor and also
    // look up uniform locations.
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        },
    }; 

    
    drawBackground(gl, programInfo);
    drawGrid(gl, programInfo);

    // initialize baseMap
    var baseMap = new Map();
    var currentTile = genNewTile(programInfo);
    currentTile.firstDraw(gl);
    var tick = 500;
    var tileNum = 0;

    var interval = setInterval(function(){
        if (currentTile.drop(gl, baseMap, tileNum) == false) {
            tileNum++;
            score = baseMap.score;
            updateScore();
            currentTile = genNewTile(programInfo);
            drawBackground(gl, programInfo);
            drawGrid(gl, programInfo);
            baseMap.render(gl, programInfo);
            currentTile.firstDraw(gl);
        }
    }, tick);

    document.addEventListener('keydown', (event) => {
        if (event.keyCode === 38 ) { // up arrow
            let originalShape = currentTile.shape;
            currentTile.rotateShape();
            currentTile.mapIndexs.rotate(currentTile.shape);
            if (baseMap.collisionDetect(currentTile.mapIndexs.indexs)) {
                currentTile.shape = originalShape;
                currentTile.mapIndexs.rotate(currentTile.shape);
                return;
            } else {
                currentTile.rotate(gl, baseMap);
            }
        } else if (event.keyCode === 40) { // down arrow
            currentTile.drop(gl, baseMap, tileNum);
        } else if (event.keyCode === 37) { // left arrow
            currentTile.transLeftRight(gl, baseMap, -1.0);
        } else if (event.keyCode === 39) { // right
            currentTile.transLeftRight(gl, baseMap, 1.0);
        } else if (event.keyCode === 81) { // quit
            window.close();
        } else if (event.keyCode === 82) { // restart
            tileNum = 0;
            score = 0;
            updateScore();
            clearInterval(interval);
            drawBackground(gl, programInfo);
            drawGrid(gl, programInfo);

            // initialize baseMap
            baseMap = new Map();
            currentTile = genNewTile(programInfo);
            currentTile.firstDraw(gl);
            tick = 500;

            interval = setInterval(function(){
                if (currentTile.drop(gl, baseMap, tileNum) == false) {
                    tileNum++;
                    score = baseMap.score;
                    updateScore();
                    currentTile = genNewTile(programInfo);
                    drawBackground(gl, programInfo);
                    drawGrid(gl, programInfo);
                    baseMap.render(gl, programInfo);
                    currentTile.firstDraw(gl);
                    
                }
            }, tick);
        }
    });

}

function genNewTile(programInfo) {
    const tileType = Math.floor(Math.random()*7);
    switch(tileType) {
        case 0:
            return new oShape(programInfo);
        case 1:
            return new iShape(programInfo);
        case 2:
            return new tShape(programInfo);
        case 3:
            return new sShape(programInfo);
        case 4:
            return new zShape(programInfo);
        case 5:
            return new lShape(programInfo);
        case 6:
            return new jShape(programInfo);
    }
}

function updateScore(){
    scoreH3.innerHTML = 'Score: ' + score;
}


//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    // Create the shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}
//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    // Send the source to the shader object
    gl.shaderSource(shader, source);
    // Compile the shader program
    gl.compileShader(shader);
    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}
