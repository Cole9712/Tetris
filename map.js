
export class Map {
    constructor(){
        var a = 1;
        var lastRow = [new block(0),new block(0),new block(0),new block(0),new block(0),new block(0),new block(0),new block(0),new block(0),new block(0),new block(0),new block(0)];
        this.map = [];
        for (var i = 0; i < 21; i++) {
            (this.map).push([new block(0),null,null,null,null,null,null,null,null,null,null,new block(0)]);
        }
        (this.map).push(lastRow);
        this.posArr = [];
        this.colorArr = [];
        this.edgeArr = [];
        this.edgeColorArr = [];
        this.score = 0;
        this.tileNum = 0;
    }
    collisionDetect(posList) {
        var flag = false;
        posList.forEach((item)  => {
            if (this.map[item[0]][item[1]] != null) {
                // console.log(item);
                flag = true;
                return;
            }
        });
        return flag;
    }
    testRowFully(){
        for (var i = 0; i < 21; i++) {
            let number = 0;
            for (var j = 1; j < 11; j++) {
                if (this.map[i][j] != null) {
                    number++;
                }
            }
            if (number == 10) {
                let it = i-1;
                while(it>=0) {
                    this.map[it+1] = [];
                    this.map[it+1] = [...this.map[it]];
                    it--;
                }
                this.map[0] = [new block(0),null,null,null,null,null,null,null,null,null,null,new block(0)];
                this.score += 10;
                // console.log(this.map);
            }
        }
    }
    addTile2Base(tile, tileNum) {
        if (tileNum < this.tileNum) return;
        const indexs = tile.mapIndexs.indexs;
        indexs.forEach((item) => {
            let y = item[0];
            let x = item[1];
            this.map[y][x] = new block(1, tile.colorArr.slice(0,4), [item[0], item[1]]);
        });
        this.tileNum ++;
    }
    updateBuffer() {
        this.posArr = [];
        this.colorArr = [];
        this.edgeArr = [];
        this.edgeColorArr = [];
        for (var i = 0; i < 21; i++) {
            for (var j = 1; j < 11; j++) {
                if (this.map[i][j] != null) {
                    let item = this.map[i][j];
                    this.posArr = this.posArr.concat([j-1, 21-i,j, 21-i,j-1, 20-i,j, 20-i]);
                    this.edgeArr = this.edgeArr.concat([j-1, 21-i, j, 21-i, j, 20-i, j-1, 20-i, j-1, 21-i]);

                    this.colorArr = this.colorArr.concat(item.color);
                    this.colorArr = this.colorArr.concat(item.color);
                    this.colorArr = this.colorArr.concat(item.color);
                    this.colorArr = this.colorArr.concat(item.color);
                    this.edgeColorArr = this.edgeColorArr.concat([0.0,0.0,0.0,1.0]);
                    this.edgeColorArr = this.edgeColorArr.concat([0.0,0.0,0.0,1.0]);
                    this.edgeColorArr = this.edgeColorArr.concat([0.0,0.0,0.0,1.0]);
                    this.edgeColorArr = this.edgeColorArr.concat([0.0,0.0,0.0,1.0]);
                    this.edgeColorArr = this.edgeColorArr.concat([0.0,0.0,0.0,1.0]);
                } 
            }
        }
    }
    render(gl, programInfo){
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
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, numComponents, type, normalize, stride, offset);
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
        }
        var modelViewMatrix = mat4.create();
        mat4.translate(modelViewMatrix,modelViewMatrix,[-5.0, -10.0, -10.0]);
        
        // Tell WebGL to use our program when drawing
        gl.useProgram(programInfo.program);
        // Set the shader uniforms
        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
        {
            const offset = 0;
            const vertexCount = 4;
            for (let i = 0; i < this.posArr.length; i+=4) {
                gl.drawArrays(gl.TRIANGLE_STRIP, offset + i, vertexCount);
            }
        }
        this.renderEdges(gl, programInfo);
    }
    renderEdges(gl, programInfo){
        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.edgeArr), gl.STATIC_DRAW);
        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.edgeColorArr), gl.STATIC_DRAW);
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
            for (let i = 0; i < this.edgeColorArr.length; i+=5) {
                gl.drawArrays(gl.LINE_STRIP, offset + i, vertexCount);
                gl.drawArrays(gl.LINE_STRIP, offset + i+1, vertexCount);
                gl.drawArrays(gl.LINE_STRIP, offset + i+2, vertexCount);
                gl.drawArrays(gl.LINE_STRIP, offset + i+3, vertexCount);
            }
        }
    }
}

export class MapIndex {
    constructor(posList){
        this.shape = 0;
        this.indexs = [];
        posList.forEach((item) => (this.indexs.push([Math.floor(item[1]*(-1)+1.5),Math.floor(item[0]+6.5)])));
    }
    drop() {
        for (let i = 0; i < this.indexs.length; i++){
            this.indexs[i][0] += 1;
            if (this.indexs[i][0] >= 22) {
                this.indexs[i][0] -= 1;
                return false;
            }
        }
        return true;
    }
    right() {
        this.indexs.forEach((item) => (
            item[1] += 1
        ));
    }
    left() {
        this.indexs.forEach((item) => (
            item[1] -= 1
        ));
    }
    up() {
        this.indexs.forEach((item) => (
            item[0] -= 1
        ));
    }
    rotate(shape) {
        while (this.shape !== shape) {
            this.rotateOnce();
            this.shape = (this.shape + 1) % 4;
        }
    }
    rotateOnce() {
        for (let i = 1; i < 4; i++) {
            var yDistance = this.indexs[i][0] - this.indexs[0][0];
            var xDistance = this.indexs[i][1] - this.indexs[0][1];
            this.indexs[i][0] = this.indexs[0][0] - xDistance;
            this.indexs[i][1] = this.indexs[0][1] + yDistance;
        }
        // console.log(this.indexs);
    }
}

class block{
    constructor(type ,color, pos){
        // type - 0 boundary, 1 - tile
        this.type = type;
        this.color = color;
        this.pos = pos;
    }
}