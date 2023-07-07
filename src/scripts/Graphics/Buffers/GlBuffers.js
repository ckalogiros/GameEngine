import { GfxInfoMesh, GlEnableAttribsLocations } from '../GlProgram.js'
import * as GlOps from './GlBufferOps.js';

// For Debuging
import * as dbg from '../Z_Debug/GfxDebug.js'
import { GlCreateProgram } from '../GlProgram.js'
import { GlGetIB, GlGetProgram, GlGetPrograms, GlGetVB } from '../GlProgram.js';
import { RenderQueueUpdate } from '../../Engine/Renderer/RenderQueue.js';


class VertexBuffer {

    sceneIdx = INT_NULL;

    webgl_buffer = null;
    data = [];
    meshes = [];        // An array of pointers to all vertexBuffer's meshes. Has the type of 'GfxInfoMesh'

    idx = INT_NULL;	    // The vertex buffer (float*) idx that this Mesh is stored to.
    count = 0;			// Current size of the float buffer (in floats)
    size = 0;			// Total   size of the float buffer (in floats)
    start = 0;			// The current meshe's starting idx in the vertex buffer. 
    vCount = 0;			// Nuuumber of vertices

    vao = null;		    // Vertex Array 
    vboId = INT_NULL;	// Vertex Buffer Gl-Id
    iboId = INT_NULL;	// Index Buffer Gl-Id
    tboId = INT_NULL;	// Texture Buffer Gl-Id
    texIdx = INT_NULL;	// Stores the index of the texture's location in the texture array


    scissorBox = [];

    show = true;
    needsUpdate = false;
    hasChanged = false;
    hasScissorBox = false;

    // Debug
    debug = { meshesNames: [], sidName: '' };

    constructor(sid, sceneIdx, idx) {
        this.debug.sidName = dbg.GetShaderTypeId(sid);
        this.sceneIdx = sceneIdx;
        this.idx = idx;
    }
    AddGeometry(sid, pos, dim, shaderInfo, numFaces, start, count) {
        if (sid.attr & SID.ATTR.POS2) { // Add Position, if the program has such an attribute 
            GlOps.VbSetAttribPos(this, start + shaderInfo.posOffset,
                count, shaderInfo.attribsPerVertex - V_POS_COUNT, dim);
        }
        if (sid.attr & SID.ATTR.WPOS_TIME4) { // Add World Position, if the program has such an attribute 
            GlOps.VbSetAttribWpos(this, start + shaderInfo.wposTimeOffset,
                count, shaderInfo.attribsPerVertex - V_WPOS_COUNT, pos);
        }
        if (sid & SID.ATTR.TIME) { // Per Vertex Timer (meant to be per mesh, 4 vertices) 
            GlOps.VbSetAttrTime(this, start + shaderInfo.timeOffset,
                count, shaderInfo.attribsPerVertex - V_TIME_COUNT, mesh.time);
        }
        this.needsUpdate = true;
    }
    AddMaterial(sid, shaderInfo, numFaces, start, count, col, tex, style = null) {
        if (sid.attr & SID.ATTR.COL4 && col) { // Add Color, if the program has such an attribute
            if (!col && DEBUG.WEB_GL) console.error('Style hasn\'t being set. @AddMaterial(), GlBuffers.js')
            GlOps.VbSetAttribCol(this, start + shaderInfo.colOffset,
                count, shaderInfo.attribsPerVertex - V_COL_COUNT, col);
        }
        if (sid.attr & SID.ATTR.TEX2 && tex) { // Add Texture, if the program has such an attribute 
            if (!tex && DEBUG.WEB_GL) console.error('Style hasn\'t being set. @AddMaterial(), GlBuffers.js')
            GlOps.VbSetAttribTex(this, start + shaderInfo.texOffset,
                count, shaderInfo.attribsPerVertex - V_TEX_COUNT, tex);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        let params1Index = 0; //  Should increment with every enabled attribute. Use: Only to pass the correct start  
        if (sid.attr & SID.ATTR.BORDER) { // Mesh round corners
            if (!style.border && DEBUG.WEB_GL) console.error('Style.border hasn\'t being set. @AddMaterial(), GlBuffers.js')
            GlOps.VbSetAttrBorderWidth(this, start + shaderInfo.params1Offset + params1Index,
                count, shaderInfo.attribsPerVertex - V_BORDER_WIDTH, style.border)
            params1Index++;
        }
        if (sid.attr & SID.ATTR.R_CORNERS) { // Mesh round corners
            if (!style.rCorners && DEBUG.WEB_GL) console.error('Style.rCorners hasn\'t being set. @AddMaterial(), GlBuffers.js')
            GlOps.VbSetAttrRoundCorner(this, start + shaderInfo.params1Offset + params1Index,
                count, shaderInfo.attribsPerVertex - V_ROUND_CORNERS, style.rCorners)
            params1Index++;
        }
        if (sid.attr & SID.ATTR.FEATHER) { // Mesh round corners
            if (!style.feather && DEBUG.WEB_GL) console.error('Style.feather hasn\'t being set. @AddMaterial(), GlBuffers.js')
            GlOps.VbSetAttrBorderFeather(this, start + shaderInfo.params1Offset + params1Index,
                count, shaderInfo.attribsPerVertex - V_BORDER_FEATHER, style.feather)
            params1Index++;
        }
        this.needsUpdate = true;
    }

    // AddMesh(sid, mesh, shaderInfo, numFaces) {
    // 	const start = this.count; // Add meshes to the vb continuously
    // 	const count = numFaces * shaderInfo.verticesPerRect * shaderInfo.attribsPerVertex; // Total attributes to add
    // 	if (sid & SID.ATTR.COL4) { // Add Color, if the program has such an attribute
    // 		GlOps.VbSetAttribCol(this, start + shaderInfo.colOffset,
    // 			count, shaderInfo.attribsPerVertex - V_COL_COUNT, mesh.col);
    // 	}
    // 	if (sid & SID.ATTR.POS2) { // Add Position, if the program has such an attribute 
    // 		GlOps.VbSetAttribPos(this, start + shaderInfo.posOffset,
    // 			count, shaderInfo.attribsPerVertex - V_POS_COUNT, mesh.dim);
    // 	}
    // 	if (sid & SID.ATTR.TEX2) { // Add Texture, if the program has such an attribute 
    // 		GlOps.VbSetAttribTex(this, start + shaderInfo.texOffset,
    // 			count, shaderInfo.attribsPerVertex - V_TEX_COUNT, mesh.tex);
    // 	}
    // 	if (sid & SID.ATTR.WPOS_TIME4) { // Add World Position, if the program has such an attribute 
    // 		GlOps.VbSetAttribWpos(this, start +shaderInfo.wposTimeOffset,
    // 			count, shaderInfo.attribsPerVertex - V_WPOS_COUNT, mesh.pos);
    // 	}
    // 	if (sid & SID.ATTR.PARAMS1) { // Add World Position, if the program has such an attribute 
    // 		GlOps.VbSetAttribParams1(this, start + shaderInfo.params1Offset,
    // 			count, shaderInfo.attribsPerVertex - V_PARAMS1_COUNT, mesh.attrParams1);
    // 	}
    // 	if (sid & SID.ATTR.SDF_PARAMS) { // The parameters for the rendering of SDF text
    // 		GlOps.VbSetAttrSdfParams(this, start + shaderInfo.sdfOffset,
    // 			count, shaderInfo.attribsPerVertex - V_SDF_PARAMS_COUNT, mesh.sdfParams)
    // 	}
    // 	if (sid & SID.ATTR.STYLE) { // Mesh round corners
    // 		GlOps.VbSetAttrStyle(this, start + shaderInfo.styleOffset,
    // 			count, shaderInfo.attribsPerVertex - V_STYLE_COUNT, mesh.style)
    // 	}
    // 	if (sid & SID.ATTR.TIME) { // Per Vertex Timer (meant to be per mesh, 4 vertices) 
    // 		GlOps.VbSetAttrTime(this, start + shaderInfo.timeOffset,
    // 			count, shaderInfo.attribsPerVertex - V_TIME_COUNT, mesh.time);
    // 	}

    // 	this.needsUpdate = true;
    // }

};

class IndexBuffer {
    name = '';

    data = [];
    webgl_buffer = null;

    idx = INT_NULL;
    start = 0;
    count = 0;
    size = 0;
    vCount = 0;

    vao = null;
    iboId = INT_NULL;

    needsUpdate = false;

    constructor(idx) {
        this.idx = idx;
    }
};



export let GlFrameBuffer = {

    name: '',

    buffer: null,
    tex: null,
    texId: INT_NULL,
    texIdx: INT_NULL,
    texWidth: 0,
    texHeight: 0,
    progIdx: INT_NULL,
    vbIdx: INT_NULL,
    isActive: false,
};


export function GlGetContext(sid, sceneIdx, GL_BUFFER, addToSpecificGlBuffer) {

    // TODO: TEMP
    const numFaces = 1;
    const progs = GlGetPrograms();
    // ProgramExists returns 0 index based program or -1 for not found
    let progIdx = ProgramExists(sid, progs);

    // If the program already exists, add mesh
    if (progIdx === INT_NULL) { // Else create new program
        progIdx = GlCreateProgram(sid);
    }

    GlUseProgram(progs[progIdx].webgl_program, progIdx);

    let vbIdx = INT_NULL;
    let ibIdx = INT_NULL;

    if (GL_BUFFER == GL_VB.SPECIFIC) {
        if (addToSpecificGlBuffer === INT_NULL) {
            vbIdx = VertexBufferExists(sceneIdx, progs[progIdx]);
        }
        else vbIdx = addToSpecificGlBuffer;
    }
    else if (GL_BUFFER == GL_VB.NEW) {
        vbIdx = INT_NULL;
    }
    else if (GL_BUFFER == GL_VB.ANY) {
        vbIdx = VertexBufferExists(sceneIdx, progs[progIdx]);
    }

    let vb = null; // Cash for convinience
    let ib = null; // Cash for convinience

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    * Add Mesh to Vertex Buffer
    */
    if (vbIdx < 0) { // Create gl buffer
        vbIdx = progs[progIdx].vertexBufferCount++;
        progs[progIdx].vertexBuffer[vbIdx] = vb = new VertexBuffer(sid, sceneIdx, vbIdx);

        const vao = gfxCtx.gl.createVertexArray();
        gfxCtx.gl.bindVertexArray(vao);
        vb.webgl_buffer = gfxCtx.gl.createBuffer();
        gfxCtx.gl.bindBuffer(gfxCtx.gl.ARRAY_BUFFER, vb.webgl_buffer);
        /**
         * Hack for large enough buffer
         */
        vb.size = MAX_VERTEX_BUFFER_COUNT;
        vb.data = new Float32Array(vb.size);
        vb.vao = vao;

        // Initialize attribute locations of the shader for every newly created program
        GlEnableAttribsLocations(gfxCtx.gl, progs[progIdx]);
        // Connect the vertex buffer with the atlas texture. 
        if (sid.attr & SID.ATTR.TEX2) {
            if (sid.shad & SID.SHAD.TEXT_SDF) vb.texIdx = Texture.fontConsolasSdf35;
            else vb.texIdx = Texture.atlas;
        }
        if (dbg.GL_DEBUG_BUFFERS_ALL) console.log('===== VertexBuffer =====\nvbIdx:', vbIdx, 'progIdx:', progIdx);

        /**
         * Create Index buffer
         */
        if (sid.shad & SID.SHAD.INDEXED) {
            ibIdx = progs[progIdx].indexBufferCount++;
            progs[progIdx].indexBuffer[ibIdx] = new IndexBuffer(ibIdx);
            ib = progs[progIdx].indexBuffer[ibIdx];
            ib.name = dbg.GetShaderTypeId(sid);
            ib.sceneIdx = sceneIdx;

            ib.webgl_buffer = gfxCtx.gl.createBuffer();
            gfxCtx.gl.bindBuffer(gfxCtx.gl.ELEMENT_ARRAY_BUFFER, ib.webgl_buffer);
            ib.size = MAX_INDEX_BUFFER_COUNT;
            ib.data = new Uint16Array(ib.size);
            ib.vao = vb.vao;
            if (dbg.GL_DEBUG_BUFFERS_ALL) console.log('----- VertexBuffer -----\nibIdx:', ibIdx, 'progIdx:', progIdx)
        }
    }
    else {
        vb = progs[progIdx].vertexBuffer[vbIdx];
        gfxCtx.gl.bindVertexArray(vb.vao)
        gfxCtx.gl.bindBuffer(gfxCtx.gl.ARRAY_BUFFER, vb.webgl_buffer)

        // Index buffer
        ibIdx = IndexBufferExists(sceneIdx, progs[progIdx]);
        ib = progs[progIdx].indexBuffer[ibIdx];
    }

    // Cash values
    const vertsPerRect = progs[progIdx].shaderInfo.verticesPerRect;
    const attribsPerVertex = progs[progIdx].shaderInfo.attribsPerVertex;
    const start = vb.count; // Add meshes to the vb continuously
    const count = numFaces * vertsPerRect * attribsPerVertex; // Total attributes of the mesh

    // Set meshes gfx info
    const gfxInfo = new GfxInfoMesh;
    gfxInfo.sid = sid;
    gfxInfo.sceneIdx = sceneIdx;
    gfxInfo.vao = vb.vao;
    gfxInfo.numFaces = numFaces;
    gfxInfo.vertsPerRect = vertsPerRect;
    gfxInfo.attribsPerVertex = attribsPerVertex;
    gfxInfo.prog.idx = progIdx;
    gfxInfo.vb.idx = vbIdx;
    gfxInfo.vb.webgl_buffer = vb.webgl_buffer;
    gfxInfo.vb.start = start;
    gfxInfo.vb.count = count;
    gfxInfo.ib.webgl_buffer = ib.webgl_buffer;
    gfxInfo.ib.idx = ibIdx;
    gfxInfo.ib.count = ib.count;


    // Update viewport for the curent program
    progs[progIdx].CameraUpdate(gfxCtx.gl);

    const index = progs[progIdx].vertexBuffer[vbIdx].meshes.length;
    gfxInfo.meshIdx = index; // Store the current meshe's index so the mesh know in what index can find it's self in the vertexBuffer's meshes array.

    // Store the same reference to the vertex buffer's array so that we can manipulate the vertex buffer and update the gfxInfo from within the progs[].vertexBuffer[]
    progs[progIdx].vertexBuffer[vbIdx].meshes[index] = gfxInfo;

    return gfxInfo;
}


export function GlAddGeometry(sid, pos, dim, gfx, meshName) {

    // TODO: TEMP
    const numFaces = 1;

    const progIdx = gfx.prog.idx;
    const vbIdx = gfx.vb.idx;
    const ibIdx = gfx.ib.idx;
    const prog = GlGetProgram(progIdx);
    const vb = GlGetVB(progIdx, vbIdx);
    const ib = GlGetIB(progIdx, ibIdx);

    GlUseProgram(prog.webgl_program, progIdx);

    gfxCtx.gl.bindVertexArray(vb.vao)
    gfxCtx.gl.bindBuffer(gfxCtx.gl.ARRAY_BUFFER, vb.webgl_buffer)

    CreateUniqueMesh(vb.debug.meshesNames, meshName);

    vb.AddGeometry(sid, pos, dim, prog.shaderInfo, numFaces, gfx.vb.start, gfx.vb.count);
    prog.isActive = true; // Sets a program to 'active', only if there are meshes in the program's vb

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Add Mesh to Index Buffer
     */
    if (sid.shad & SID.SHAD.INDEXED) {
        gfx.ib.start = ib.count;
        CreateIndices(ib, numFaces);
        gfx.ib.count = ib.count;
    }
}


export function GlAddMaterial(sid, gfx, col, tex, style) {

    // TODO: TEMP
    const numFaces = 1;

    const progIdx = gfx.prog.idx;
    const vbIdx = gfx.vb.idx;
    const prog = GlGetProgram(progIdx);
    const vb = GlGetVB(progIdx, vbIdx);

    GlUseProgram(prog.webgl_program, progIdx);

    gfxCtx.gl.bindVertexArray(vb.vao)
    gfxCtx.gl.bindBuffer(gfxCtx.gl.ARRAY_BUFFER, vb.webgl_buffer)

    vb.AddMaterial(sid, prog.shaderInfo, numFaces, gfx.vb.start, gfx.vb.count, col, tex, style);
}



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////



/**
 * Update index and vertex buffers.
 * When meshes are added to the local buffers, we must inform GL to update to the changed buffers. 
 */
export function GlUpdateVertexBufferData(gl, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.webgl_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, buffer.data, gl.STATIC_DRAW, 0);
    buffer.needsUpdate = false;
}
export function GlUpdateIndexBufferData(gl, buffer) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.webgl_buffer);
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
        if (sid.shad === progs[i].sid.shad &&
            sid.attr === progs[i].sid.attr &&
            sid.pass === progs[i].sid.pass
        )
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
export function GfxSetVbShowFromSceneId(sceneIdx, flag) {

    const progs = GlGetPrograms();

    for (let i = 0; i < progs.length; i++) {
        for (let j = 0; j < progs[i].vertexBufferCount; j++) {
            if (sceneIdx === progs[i].vertexBuffer[j].sceneIdx) {
                progs[i].vertexBuffer[j].show = flag;
                progs[i].indexBuffer[j].show = flag;
            }
        }
    }
}

export function GfxSetVbShow(progIdx, vbIdx, flag) {

    const progs = GlGetPrograms();
    progs[progIdx].vertexBuffer[vbIdx].show = flag;
    progs[progIdx].indexBuffer[vbIdx].show = flag;

    RenderQueueUpdate(progIdx, vbIdx, flag); // Update the draw buffer
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

    ib.needsUpdate = true; // Make sure that we update GL bufferData 
}





export function GlUseProgram(webgl_program, progIdx) {
    gfxCtx.gl.useProgram(webgl_program);
    GL.BOUND_PROG_IDX = progIdx;
    GL.BOUND_PROG = webgl_program;
}
export function GlBindVAO(vao) {
    gfxCtx.gl.bindVertexArray(vao);
    GL.BOUND_VAO = vao;
}
export function GlBindTexture(texture) {
    gfxCtx.gl.activeTexture(texture.texId);
    gfxCtx.gl.bindTexture(gfxCtx.gl.TEXTURE_2D, texture.tex);

    // TODO: Combine the Texture to the global GL
    GL.BOUND_TEXTURE_ID = texture.texId; // Update the global GL constant object
    GL.BOUND_TEXTURE_IDX = texture.idx;
    Texture.boundTexture = texture.idx; // Update the global Texture constant object
}


// Helpers
function CreateUniqueMesh(strArr, str) {
    for (let i = 0; i < strArr.length; i++) {
        if (strArr[i] === str) {
            return;
        }
    }
    //Else if the string does not exist, add it
    strArr.push(str);
}