import { GfxInfoMesh }          from './I_GlProgram.js'
import * as GlOps               from './GlBufferOps.js';
import { VertexBuffer, IndexBuffer } from './I_GlProgram.js'

// For Debuging
import * as dbg from './Debug/GfxDebug.js'
import { GlCreateProgram } from './GfxCreateProgram.js'
import { GlGetPrograms } from './GlProgram.js';
import { DrawQueueUpdate } from '../Engine/Renderer/DrawQueue.js';



export function GlAddMesh(sid, mesh, numFaces, sceneIdx, meshName, GL_BUFFER, addToSpecificGlBuffer) {
    
    var FLAG = false;
    const BUFFER_SIZE = 120000;
    // const BUFFER_SIZE = 1400;
    const progs = GlGetPrograms();
    // ProgramExists returns 0 index based program or -1 for not found
    let progIdx = ProgramExists(sid, progs);
    
    // If the program already exists, add mesh
    if (progIdx === INT_NULL) { // Else create new program
        progIdx = GlCreateProgram(sid);
    }
    
    GlUseProgram(progs[progIdx].program, progIdx);
    
    let vbIdx = INT_NULL;
    let ibIdx = INT_NULL;
    let isNewGlBuffer = false;

    if(GL_BUFFER == GL_VB.SPECIFIC){
        if(addToSpecificGlBuffer === INT_NULL) {
            vbIdx = VertexBufferExists(sceneIdx, progs[progIdx]);
            if(vbIdx === INT_NULL) isNewGlBuffer = true;
        }
        else vbIdx = addToSpecificGlBuffer;
    }
    else if(GL_BUFFER == GL_VB.NEW){
        vbIdx = INT_NULL;
        isNewGlBuffer = true;
    }
    else if(GL_BUFFER == GL_VB.ANY){
        vbIdx = VertexBufferExists(sceneIdx, progs[progIdx]);
        if(vbIdx === INT_NULL){
            isNewGlBuffer = true;
        }
    }

    let vb = null; // Cash for convinience
    let ib = null; // Cash for convinience

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Add Mesh to Vertex Buffer
    */
    if (vbIdx < 0) { // Create gl buffer
        vbIdx = progs[progIdx].vertexBufferCount++; 
        progs[progIdx].vertexBuffer[vbIdx] = vb =  new VertexBuffer(sid, sceneIdx, vbIdx);  
        
        const vao = gfxCtx.gl.createVertexArray();
        gfxCtx.gl.bindVertexArray(vao);
        vb.buffer = gfxCtx.gl.createBuffer();
        gfxCtx.gl.bindBuffer(gfxCtx.gl.ARRAY_BUFFER, vb.buffer);
        /**
         * Hack for large enough buffer
         */
        if(progIdx === 5 && vbIdx === 3){
            vb.size = BUFFER_SIZE;
            FLAG = true;
            console.log('-----------------------------------------------------------------------------')
            console.log(progIdx, vbIdx)
        }
        else vb.size = MAX_VERTEX_BUFFER_COUNT;
        vb.data = new Float32Array(vb.size);
        vb.needsUpdate = true;
        vb.vao = vao;

        // Initialize attribute locations of the shader for every newly created program
        GlEnableAttribsLocations(gfxCtx.gl, progs[progIdx]);
        // Connect the vertex buffer with the atlas texture. 
        if(sid & SID.ATTR.TEX2) 
        {
            if(sid & SID.TEXT_SDF) vb.texIdx = Texture.fontConsolasSdf35;
            else vb.texIdx = Texture.atlas;
        }
        if(dbg.GL_DEBUG_BUFFERS_ALL) console.log('===== VertexBuffer =====\nvbIdx:', vbIdx, 'progIdx:',  progIdx);

        /**
         * Create Index buffer
         */
        if(sid & SID.INDEXED){
            ibIdx = progs[progIdx].indexBufferCount++;
            progs[progIdx].indexBuffer[vbIdx] = new IndexBuffer;
            ib = progs[progIdx].indexBuffer[vbIdx];
            ib.name = dbg.GetShaderTypeId(sid);
            ib.sceneIdx = sceneIdx;
    
            ib.buffer = gfxCtx.gl.createBuffer();
            gfxCtx.gl.bindBuffer(gfxCtx.gl.ELEMENT_ARRAY_BUFFER, ib.buffer);
            if(FLAG){
                ib.size = BUFFER_SIZE/10;
            }
            else ib.size = MAX_INDEX_BUFFER_COUNT;
            ib.data = new Uint16Array(ib.size);
            ib.vao = vb.vao;
            if(dbg.GL_DEBUG_BUFFERS_ALL) console.log('----- VertexBuffer -----\nibIdx:', ibIdx, 'progIdx:',  progIdx)
        }
    }
    else{
        vb = progs[progIdx].vertexBuffer[vbIdx]; 
        gfxCtx.gl.bindVertexArray(vb.vao) 
        gfxCtx.gl.bindBuffer(gfxCtx.gl.ARRAY_BUFFER, vb.buffer) 

        // Index buffer
        ibIdx = vbIdx;
        ib = progs[progIdx].indexBuffer[ibIdx];
    }

    CreateUniqueMesh(vb.debug.meshesNames, meshName); 

    // Cash values
    const vertsPerRect = progs[progIdx].shaderInfo.verticesPerRect;
    const attribsPerVertex = progs[progIdx].shaderInfo.attribsPerVertex;
    const start = vb.count; // Add meshes to the vb continuously
    const count = numFaces * vertsPerRect * attribsPerVertex; // Total attributes to add
    
    // Set meshes gfx info
    const gfxInfo = new GfxInfoMesh; 
    gfxInfo.vao              = vb.vao;
    gfxInfo.numFaces         = numFaces;
    gfxInfo.vertsPerRect     = vertsPerRect;
    gfxInfo.attribsPerVertex = attribsPerVertex;
    gfxInfo.prog.idx         = progIdx;
    gfxInfo.vb.idx           = vbIdx;
    gfxInfo.vb.buffer        = vb.buffer;
    gfxInfo.vb.start         = start;
    gfxInfo.vb.count         = count;
    gfxInfo.sceneIdx         = sceneIdx;
    gfxInfo.sid              = sid;

    vb.AddMesh(sid, mesh, progs[progIdx].shaderInfo, numFaces);
    progs[progIdx].isActive = true; // Sets a program to 'active', only if there are meshes in the program's vb

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Add Mesh to Index Buffer
     */
    if (sid & SID.INDEXED) {
        CreateIndices(ib, numFaces);
        // Set meshes gfx info
        gfxInfo.ib.idx = ibIdx;
        gfxInfo.ib.buffer = ib.buffer;
        gfxInfo.ib.start = start;
        gfxInfo.ib.count = numFaces * INDICES_PER_RECT;
    }

    // Update viewport for the curent program
    progs[progIdx].CameraUpdate(gfxCtx.gl);
        
    const index = progs[progIdx].vertexBuffer[vbIdx].meshes.length;
    gfxInfo.meshIdx = index; // Store the current meshe's index so the mesh know in what index can find it's self in the vertexBuffer's meshes array.
    
    // Store the same reference to the vertex buffer's array so that we can manipulate the vertex buffer and update the gfxInfo from within the progs[].vertexBuffer[]
    progs[progIdx].vertexBuffer[vbIdx].meshes[index] = gfxInfo;

    return gfxInfo;
}

/**
 * Update index and vertex buffers.
 * When meshes are added to the local buffers, we must inform GL to update to the changed buffers. 
 */
export function GlUpdateVertexBufferData(gl, buffer){
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, buffer.data, gl.STATIC_DRAW, 0);
    buffer.needsUpdate = false;
}
export function GlUpdateIndexBufferData(gl, buffer){
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, buffer.data, gl.STATIC_DRAW, 0);
    buffer.needsUpdate = false;
}

/**
 * When a mesh is to be drawn, we check to see, if a program that
 * satisfies that meshe's data, already exists. 
 * If exists, we return the program's index, else -1 for false
 * 
 * @param {*} sid : The Shader Type Id
 * @param {*} progs : The array of all GL programs
 * @returns : 0-n: true or -1:false
 */
function ProgramExists(sid, progs) {

    for (let i = 0; i < progs.length; i++) {
        if (sid === progs[i].info.sid)
            return i;

    }
    return -1;
}

/**
 * 
 * @param {*} sceneIdx : The id for the scene the Vertex Buffer belongs to.
 * @param {*} prog : WebGl program
 * @returns 
 */
function VertexBufferExists(sceneIdx, prog) {

    for (let i = 0; i < prog.vertexBufferCount; i++) {
        if (sceneIdx === prog.vertexBuffer[i].sceneIdx)
            return i;

    }
    return -1;
}
function IndexBufferExists(sceneIdx, prog) {

    for (let i = 0; i < prog.indexBufferCount; i++) {
        if (sceneIdx === prog.indexBuffer[i].sceneIdx)
            return i;

    }
    return -1;
}

// TODO: the scene id must be a unique hex for bit masking, so we can & it with programs many scene ids.
export function GfxSetVbShowFromSceneId(sceneIdx, flag){

    const progs = GlGetPrograms();

    for (let i = 0; i < progs.length; i++) {
        for (let j = 0; j < progs[i].vertexBufferCount; j++) {
            if (sceneIdx === progs[i].vertexBuffer[j].sceneIdx){
                progs[i].vertexBuffer[j].show = flag;
                progs[i].indexBuffer[j].show  = flag;
            }
        }
    }
}

export function GfxSetVbShow(progIdx, vbIdx, flag){

    const progs = GlGetPrograms();
    progs[progIdx].vertexBuffer[vbIdx].show = flag;
    progs[progIdx].indexBuffer[vbIdx].show  = flag;

    DrawQueueUpdate(progIdx, vbIdx, flag); // Update the draw buffer
}

function CreateIndices(ib, numFaces) {

    const offset = 4;
    let k = ib.vCount;

    for (let i = 0; i < numFaces; ++i) {

        for (let j = 0; j < 2; j++) {

            ib.data[ib.count++] = k + j;
            ib.data[ib.count++] = k + j + 1;
            ib.data[ib.count++] = k + j + 2;
        }

        k += offset;
        ib.vCount += offset;
    }

    // ib.count = index;
    ib.needsUpdate = true; // Make sure that we update GL bufferData 
}


/**
 * Enabling Attribute locations for a program
 * and
 * Setting the attribute's offsets, types and sizes. 
 * 
 * @param {*} gl : Gl context
 * @param {*} prog : The program to which we set enable the attribute locations
 */
function GlEnableAttribsLocations(gl, prog) {

    const attribsPerVertex = prog.shaderInfo.attribsPerVertex;
    // For Uniforms
    if (prog.shaderInfo.attributes.colLoc >= 0) {
        gl.enableVertexAttribArray(prog.shaderInfo.attributes.colLoc);
        gl.vertexAttribPointer(prog.shaderInfo.attributes.colLoc,
            V_COL_COUNT, gl.FLOAT, false, attribsPerVertex * FLOAT, prog.shaderInfo.colOffset * FLOAT);
    }
    if (prog.shaderInfo.attributes.posLoc >= 0) {
        gl.enableVertexAttribArray(prog.shaderInfo.attributes.posLoc);
        gl.vertexAttribPointer(prog.shaderInfo.attributes.posLoc,
            V_POS_COUNT, gl.FLOAT, false, attribsPerVertex * FLOAT, prog.shaderInfo.posOffset * FLOAT);
    }
    if (prog.shaderInfo.attributes.scaleLoc >= 0) {
        gl.enableVertexAttribArray(prog.shaderInfo.attributes.scaleLoc);
        gl.vertexAttribPointer(prog.shaderInfo.attributes.scaleLoc,
            V_SCALE_COUNT, gl.FLOAT, false, attribsPerVertex * FLOAT, prog.shaderInfo.scaleOffset * FLOAT);
    }
    if (prog.shaderInfo.attributes.texLoc >= 0) {
        gl.enableVertexAttribArray(prog.shaderInfo.attributes.texLoc);
        gl.vertexAttribPointer(prog.shaderInfo.attributes.texLoc,
            V_TEX_COUNT, gl.FLOAT, false, attribsPerVertex * FLOAT, prog.shaderInfo.texOffset * FLOAT);
    }
    if (prog.shaderInfo.attributes.wposTimeLoc >= 0) {
        gl.enableVertexAttribArray(prog.shaderInfo.attributes.wposTimeLoc);
        gl.vertexAttribPointer(prog.shaderInfo.attributes.wposTimeLoc,
            V_WPOS_TIME_COUNT, gl.FLOAT, false, attribsPerVertex * FLOAT, prog.shaderInfo.wposTimeOffset * FLOAT);
    }
    if (prog.shaderInfo.attributes.params1Loc >= 0) {
        gl.enableVertexAttribArray(prog.shaderInfo.attributes.params1Loc);
        gl.vertexAttribPointer(prog.shaderInfo.attributes.params1Loc,
            V_PARAMS1_COUNT, gl.FLOAT, false, attribsPerVertex * FLOAT, prog.shaderInfo.params1Offset * FLOAT);
    }
    if (prog.shaderInfo.attributes.styleLoc >= 0) {
        gl.enableVertexAttribArray(prog.shaderInfo.attributes.styleLoc);
        gl.vertexAttribPointer(prog.shaderInfo.attributes.styleLoc,
            V_STYLE_COUNT, gl.FLOAT, false, attribsPerVertex * FLOAT, prog.shaderInfo.styleOffset * FLOAT);
    }
    if (prog.shaderInfo.attributes.timeLoc >= 0) {
        gl.enableVertexAttribArray(prog.shaderInfo.attributes.timeLoc);
        gl.vertexAttribPointer(prog.shaderInfo.attributes.timeLoc,
            V_TIME_COUNT, gl.FLOAT, false, attribsPerVertex * FLOAT, prog.shaderInfo.timeOffset * FLOAT);
    }
    if (prog.shaderInfo.attributes.sdfParamsLoc >= 0) {
        gl.enableVertexAttribArray(prog.shaderInfo.attributes.sdfParamsLoc);
        gl.vertexAttribPointer(prog.shaderInfo.attributes.sdfParamsLoc,
            V_SDF_PARAMS_COUNT, gl.FLOAT, false, attribsPerVertex * FLOAT, prog.shaderInfo.sdfParamsOffset * FLOAT);
    }


}



export function GlUseProgram(prog, progIdx){
    gfxCtx.gl.useProgram(prog);
    GL.BOUND_PROG_IDX = progIdx;
    GL.BOUND_PROG = prog;
}
export function GlBindVAO(vao){
    gfxCtx.gl.bindVertexArray(vao);
    GL.BOUND_VAO = vao;
}
export function GlBindTexture(texture){
    gfxCtx.gl.activeTexture(texture.texId);
    gfxCtx.gl.bindTexture(gfxCtx.gl.TEXTURE_2D, texture.tex);

    // TODO: Combine the Texture to the global GL
    GL.BOUND_TEXTURE_ID = texture.texId; // Update the global GL constant object
    GL.BOUND_TEXTURE_IDX = texture.idx;
    Texture.boundTexture = texture.idx; // Update the global Texture constant object
}


// Helpers
function CreateUniqueMesh(strArr, str){
    for(let i=0; i<strArr.length; i++){
        if(strArr[i] === str){
            return;
        }
    }
    //Else if the string does not exist, add it
    strArr.push(str);
}