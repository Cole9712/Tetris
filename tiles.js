import {Map, MapIndex} from './map.js'
class shape {
    gridColorArr = [0.0,0.0,0.0,1.0,
        0.0,0.0,0.0,1.0,
        0.0,0.0,0.0,1.0,
        0.0,0.0,0.0,1.0,
        0.0,0.0,0.0,1.0,
        0.0,0.0,0.0,1.0,
        0.0,0.0,0.0,1.0,
        0.0,0.0,0.0,1.0,
        0.0,0.0,0.0,1.0,
        0.0,0.0,0.0,1.0,
        0.0,0.0,0.0,1.0,
        0.0,0.0,0.0,1.0,
        0.0,0.0,0.0,1.0,
        0.0,0.0,0.0,1.0,
        0.0,0.0,0.0,1.0,
        0.0,0.0,0.0,1.0,
        0.0,0.0,0.0,1.0,
        0.0,0.0,0.0,1.0,
        0.0,0.0,0.0,1.0,
        0.0,0.0,0.0,1.0,
        0.0,0.0,0.0,1.0,];
    constructor(posList, color, programInfo, type) {
        // prepare buffer for shader
        let pos = [];
        let colorBuf = [];
        let posLine = [];
        posList.forEach(function(item){
            let pc = genSingleSqrBuffer(item, color);
            let linePos = genLinePosBuffer(item);
            pos = pos.concat(pc.pos);
            posLine = posLine.concat(linePos);
            colorBuf = colorBuf.concat(pc.color);
        });
        this.colorArr = colorBuf;
        this.posArr = pos;
        this.mvMatrix = mat4.create();
        this.lineArr = posLine;
        this.programInfo = programInfo;
        this.type = type;
        this.shape = 0;
        this.mapIndexs = new MapIndex(posList);
        // console.log(this.mapIndexs.indexs);
    }
    rotateShape(){
        if (this.type == 'o') return;
            else {
            this.shape = (this.shape+1) % 4;
        }
    }
    drop(gl, baseMap, tileNum) {
        if (this.mapIndexs.drop()==false) {
            return false;
        }
        if (baseMap.collisionDetect(this.mapIndexs.indexs)) {
            this.mapIndexs.up();
            baseMap.addTile2Base(this, tileNum);
            baseMap.testRowFully();
            baseMap.updateBuffer();
            return false;
        }
        drawBackground(gl, this.programInfo);
        drawGrid(gl, this.programInfo);

        mat4.translate(this.mvMatrix, // destination matrix
            this.mvMatrix, // matrix to translate
            [0.0, -1.0, 0.0]); // amount to translate
        // console.log(this.y);
        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.posArr), gl.STATIC_DRAW);
        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colorArr), gl.STATIC_DRAW);
        // pos buffer pull out
        {
            const numComponents = 2;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
            gl.vertexAttribPointer(this.programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
            gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
        }
        // Tell WebGL how to pull out the colors from the color buffer
        // into the vertexColor attribute.
        {
            const numComponents = 4;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.vertexAttribPointer(this.programInfo.attribLocations.vertexColor, numComponents, type, normalize, stride, offset);
            gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexColor);
        }
        var degree = 1.5707963268 * this.shape;
        var newMat = mat4.create();
        mat4.rotate(newMat, // destination matrix
            this.mvMatrix, // matrix to translate
            degree, [0,0,1]); // amount to translate
        // Tell WebGL to use our program when drawing
        gl.useProgram(this.programInfo.program);

        // Set the shader uniforms
        gl.uniformMatrix4fv(this.programInfo.uniformLocations.modelViewMatrix, false, newMat);
        {
            const offset = 0;
            const vertexCount = 4;
            for (let i = 0; i < 16; i+=4) {
                gl.drawArrays(gl.TRIANGLE_STRIP, offset + i, vertexCount);
            }
        }
        
        this.drawEdges(gl, this.programInfo);
        baseMap.render(gl, this.programInfo);
    }
    rotate(gl, baseMap){
        // this.mapIndexs.rotate(this.shape);

        drawBackground(gl, this.programInfo);
        drawGrid(gl, this.programInfo);
        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.posArr), gl.STATIC_DRAW);
        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colorArr), gl.STATIC_DRAW);
        // pos buffer pull out
        {
            const numComponents = 2;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
            gl.vertexAttribPointer(this.programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
            gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
        }
        // Tell WebGL how to pull out the colors from the color buffer
        // into the vertexColor attribute.
        {
            const numComponents = 4;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.vertexAttribPointer(this.programInfo.attribLocations.vertexColor, numComponents, type, normalize, stride, offset);
            gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexColor);
        }
        var degree = 1.5707963268 * this.shape;
        var newMat = mat4.create();
        mat4.rotate(newMat, // destination matrix
            this.mvMatrix, // matrix to translate
            degree, [0,0,1]); // amount to translate
        // Tell WebGL to use our program when drawing
        gl.useProgram(this.programInfo.program);
        // console.log(this.mvMatrix);
        // Set the shader uniforms
        gl.uniformMatrix4fv(this.programInfo.uniformLocations.modelViewMatrix, false, newMat);
        {
            const offset = 0;
            const vertexCount = 4;
            for (let i = 0; i < 16; i+=4) {
                gl.drawArrays(gl.TRIANGLE_STRIP, offset + i, vertexCount);
            }
        }
        this.drawEdges(gl, this.programInfo);
        baseMap.render(gl, this.programInfo);
    }

    transLeftRight(gl, baseMap, direction){
        if (direction == -1.0) {
            this.mapIndexs.left();
        } else {
            this.mapIndexs.right();
        }
        if (baseMap.collisionDetect(this.mapIndexs.indexs)) {
            if (direction == -1.0) {
                this.mapIndexs.right();
            } else {
                this.mapIndexs.left();
            }
            return false;
        }
        drawBackground(gl, this.programInfo);
        drawGrid(gl, this.programInfo);
        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.posArr), gl.STATIC_DRAW);
        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colorArr), gl.STATIC_DRAW);
        // pos buffer pull out
        {
            const numComponents = 2;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
            gl.vertexAttribPointer(this.programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
            gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
        }
        // Tell WebGL how to pull out the colors from the color buffer
        // into the vertexColor attribute.
        {
            const numComponents = 4;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.vertexAttribPointer(this.programInfo.attribLocations.vertexColor, numComponents, type, normalize, stride, offset);
            gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexColor);
        }
        mat4.translate(this.mvMatrix, // destination matrix
            this.mvMatrix, // matrix to translate
            [direction, 0.0, 0.0]); // amount to translate
        this.rotate(gl, baseMap);
        this.drawEdges(gl, this.programInfo);
        baseMap.render(gl, this.programInfo);
    }

    drawEdges(gl, programInfo){
        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.lineArr), gl.STATIC_DRAW);
        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.gridColorArr), gl.STATIC_DRAW);
        {
            const numComponents = 2;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        }
        {
            const numComponents = 4;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, numComponents, type, normalize, stride, offset);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
        }
        gl.useProgram(programInfo.program);
        {
            const offset = 0;
            const vertexCount = 2;
            for (let i = 0; i < 20; i+=5) {
                gl.drawArrays(gl.LINE_STRIP, offset + i, vertexCount);
                gl.drawArrays(gl.LINE_STRIP, offset + i+1, vertexCount);
                gl.drawArrays(gl.LINE_STRIP, offset + i+2, vertexCount);
                gl.drawArrays(gl.LINE_STRIP, offset + i+3, vertexCount);
            }
        }
    }

    firstDraw(gl){
        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.posArr), gl.STATIC_DRAW);
        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colorArr), gl.STATIC_DRAW);
        // pos buffer pull out
        {
            const numComponents = 2;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
            gl.vertexAttribPointer(this.programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
            gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
        }
        // Tell WebGL how to pull out the colors from the color buffer
        // into the vertexColor attribute.
        {
            const numComponents = 4;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.vertexAttribPointer(this.programInfo.attribLocations.vertexColor, numComponents, type, normalize, stride, offset);
            gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexColor);
        }
        if (this.type === 'o') {
            mat4.translate(this.mvMatrix, // destination matrix
                this.mvMatrix, // matrix to translate
                [0, 10, -10.0]); // amount to translate
        } else {
            mat4.translate(this.mvMatrix, // destination matrix
            this.mvMatrix, // matrix to translate
            [0.5, 9.5, -10.0]); // amount to translate
        }
        
        // Tell WebGL to use our program when drawing
        gl.useProgram(this.programInfo.program);
        // Set the shader uniforms
        gl.uniformMatrix4fv(this.programInfo.uniformLocations.modelViewMatrix, false, this.mvMatrix);
        {
            const offset = 0;
            const vertexCount = 4;
            for (let i = 0; i < 16; i+=4) {
                gl.drawArrays(gl.TRIANGLE_STRIP, offset + i, vertexCount);
            }
        }
        this.drawEdges(gl, this.programInfo);
    }
}

class oShape extends shape {
    constructor(programInfo){ // lime
        super([[-1,1],[-0,1],[-1,0],[-0,0]], [0.0, 1.0, 0.0, 1.0],programInfo,'o');
    }
}

class iShape extends shape {
    constructor(programInfo){ // blue
        super([[-0.5,0.5],[-1.5,0.5],[-2.5,0.5],[0.5,0.5]], [0.0, 0.0, 1.0, 1.0],programInfo,'i');
    }
}

class sShape extends shape {
    constructor(programInfo){ // navy	
        super([[-0.5,0.5],[0.5,0.5],[-0.5,-0.5],[-1.5,-0.5]], [0.0, 0.0, 0.5, 1.0],programInfo,'s');
    }
}

class zShape extends shape {
    constructor(programInfo){ // maroon
        super([[-0.5,0.5],[-1.5,0.5],[-0.5,-0.5],[0.5,-0.5]], [0.5, 0.0, 0.0, 1.0],programInfo,'z');
    }
}

class lShape extends shape {
    constructor(programInfo){ // olive	
        super([[-0.5,0.5],[-1.5,0.5],[0.5,0.5],[-1.5,-0.5]], [0.5, 0.5, 0.0, 1.0],programInfo,'l');
    }
}

class jShape extends shape {
    constructor(programInfo){ // red	
        super([[-0.5,0.5],[-1.5,0.5],[0.5,0.5],[0.5,-0.5]], [1.0, 0.0, 0.0, 1.0],programInfo,'j');
    }
}

class tShape extends shape {
    constructor(programInfo){ // aqua
        super([[-0.5,0.5],[-1.5,0.5],[-0.5,-0.5],[0.5,0.5]], [0.0, 1.0, 1.0, 1.0],programInfo,'t');
    }
}


function genSingleSqrBuffer(posInput, colorInput){
    var returnPos = [];
    var returnColor = colorInput;
    returnPos = [posInput[0], posInput[1],posInput[0]+1.0, posInput[1], posInput[0], posInput[1]-1.0, posInput[0]+1.0, posInput[1]-1.0];
    returnColor = returnColor.concat(colorInput);
    returnColor = returnColor.concat(colorInput);
    returnColor = returnColor.concat(colorInput);
    return {
        pos: returnPos,
        color: returnColor
    }
}

function genLinePosBuffer(posInput){
    var returnPos = [];
    returnPos = [posInput[0], posInput[1],posInput[0]+1.0, posInput[1], posInput[0]+1.0, posInput[1]-1.0,posInput[0], posInput[1]-1.0,posInput[0], posInput[1] ];
    return returnPos;
}

//
// Draw the scene.
//
function drawBackground(gl, programInfo) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things
    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.
    const fieldOfView = 90 * Math.PI / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();
    // Now move the drawing position a bit to where we want to
    // start drawing the square.
    mat4.translate(modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to translate
    [-0.0, 0.0, -10.0]); // amount to translate
    // Tell WebGL to use our program when drawing
    gl.useProgram(programInfo.program);
    // Set the shader uniforms
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
}

// function to draw grid lines
function drawGrid(gl, programInfo) {
    // Create grid positions buffer
    const gridPosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gridPosBuffer);
    const gridPos = [
        -1.0, -10.0,
        -1.0, 10.0,
        -2.0, -10.0,
        -2.0, 10.0,
        -3.0, -10.0,
        -3.0, 10.0,
        -4.0, -10.0,
        -4.0, 10.0,
        -5.0, -10.0,
        -5.0, 10.0,
        0.0, -10.0,
        0.0, 10.0,
        1.0, -10.0,
        1.0, 10.0,
        2.0, -10.0,
        2.0, 10.0,
        3.0, -10.0,
        3.0, 10.0,
        4.0, -10.0,
        4.0, 10.0,
        5.0, -10.0,
        5.0, 10.0,
        -5.0, 9.0,
        5.0, 9.0,
        -5.0, 8.0,
        5.0, 8.0,
        -5.0, 7.0,
        5.0, 7.0,
        -5.0, 6.0,
        5.0, 6.0,
        -5.0, 5.0,
        5.0, 5.0,
        -5.0, 4.0,
        5.0, 4.0,
        -5.0, 3.0,
        5.0, 3.0,
        -5.0, 2.0,
        5.0, 2.0,
        -5.0, 1.0,
        5.0, 1.0,
        -5.0, 0.0,
        5.0, 0.0,
        -5.0, -9.0,
        5.0, -9.0,
        -5.0, -8.0,
        5.0, -8.0,
        -5.0, -7.0,
        5.0, -7.0,
        -5.0, -6.0,
        5.0, -6.0,
        -5.0, -5.0,
        5.0, -5.0,
        -5.0, -4.0,
        5.0, -4.0,
        -5.0, -3.0,
        5.0, -3.0,
        -5.0, -2.0,
        5.0, -2.0,
        -5.0, -1.0,
        5.0, -1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gridPos), gl.STATIC_DRAW);
    var gridColor = [
        1.0, 1.0, 1.0, 1.0, // white
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
    ];
    const gridColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gridColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gridColor), gl.STATIC_DRAW);

    // pos buffer pull out
    {
        const numComponents = 2;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, gridPosBuffer);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    }
    // Tell WebGL how to pull out the colors from the color buffer
    // into the vertexColor attribute.
    {
        const numComponents = 4;
        const type = gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, gridColorBuffer);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, numComponents, type, normalize, stride, offset);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
    }
    {
        const offset = 0;
        const vertexCount = 2;
        for (let i = 0; i < 60; i+=2) {
            gl.drawArrays(gl.LINE_STRIP, offset + i, vertexCount);
        }
    }
}
export {oShape, iShape, sShape, zShape, lShape, jShape, tShape, drawBackground, drawGrid};