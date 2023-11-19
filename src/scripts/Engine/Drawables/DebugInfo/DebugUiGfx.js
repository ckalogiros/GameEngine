"use strict";

import { Gl_Program } from '../../../Graphics/GlProgram';


const _dbg_prog = [];
// Constant shader id's
const _sid_rect = {
    shad: SID.SHAD.INDEXED,
    attr: SID.ATTR.COL4 | SID.ATTR.POS2 | SID.ATTR.WPOS_TIME4,
    unif: SID.UNIF.PROJECTION,
    pass: SID.PASS.COL4,
};
const _sid_text = {
    shad: SID.SHAD.INDEXED | SID.SHAD.TEXT_SDF,
    attr: (SID.ATTR.POS2 | SID.ATTR.WPOS_TIME4 | SID.ATTR.SDF),
    unif: SID.UNIF.PROJECTION,
    pass: SID.PASS.COL4,
};


export function Debug_ui_initialize_gfx() {

    _dbg_prog[0] = new Gl_Program(gfxCtx.gl, _sid_rect); // Rendering rectangles
    // _dbg_prog[1] = new Gl_Program(gfxCtx.gl, _sid_text); // Rendering text

    console.log(_dbg_prog)
}



// export function GlGenerateContext(sid, sceneidx, GL_BUFFER, addToSpecificGlBuffer, num_faces = 1) {

//     if (ERROR_NULL(sceneidx)) console.error('Scene index is null. @ GlGenerateContext()')
//     if (Array.isArray(GL_BUFFER) || Array.isArray(addToSpecificGlBuffer)) console.error('Array of indexes instead of vbIdx is passed. @ GlGenerateContext()')

//     const progs = Gl_progs_get();
//     // ProgramExists returns 0 index based program or -1 for not found
//     const progidx = (sid & SID.DEBUG_UI.RECT_SHADER) ? 0 : ((sid & SID.DEBUG_UI.TEXT_SHADER) ? 1 : INT_NULL);
//     if (progidx === INT_NULL) alert('Debug ui program index is not sid type rect or text');

//     // If the program already exists, add mesh
//     if (progIdx === INT_NULL) { // Else create new program
//         progIdx = Gl_create_program(sid);

//         // Enable screen_resolution vec2 uniform  
//         if (sid.unif & SID.UNIF.BUFFER_RES) {
//             const unifBufferResIdx = progs[progIdx].UniformsBufferCreateScreenRes();
//             progs[progIdx].UniformsSetBufferUniform(Viewport.width, unifBufferResIdx.resXidx);
//             progs[progIdx].UniformsSetBufferUniform(Viewport.height, unifBufferResIdx.resYidx);
//         }

//         // Enable global_timer float uniform  
//         if (sid.unif & SID.UNIF.BUFFER_RES) {
//             const step = 0.1;
//             progs[progIdx].UniformsCreateTimer(step);
//         }


//     }

//     GlUseProgram(progs[progIdx].webgl_program, progIdx);

//     let vbIdx = INT_NULL;
//     let ibIdx = INT_NULL;

//     if (GL_BUFFER == GFX.NEW) {
//         vbIdx = INT_NULL;
//     }
//     else if (GL_BUFFER == GFX.SPECIFIC) { // Case caller accidentally 'specific buffer' flag but the vbIdx is either null or does not exist. 
//         if (addToSpecificGlBuffer === INT_NULL) {
//             vbIdx = VertexBufferExists(sceneidx, progs[progIdx]);
//         }
//         else { //  Check id the vbIdx passed by the caller exists and it is valid for adding the mesh.

//             vbIdx = addToSpecificGlBuffer;

//             // If the passsed vbIdx does not exist or comply with the program, set to create new vertex buffer.
//             if (!(progs[progIdx].vertexBuffer[vbIdx] &&
//                 SID.CheckSidMatch(sid, progs[progIdx].sid)))
//                 vbIdx = INT_NULL;
//         }
//     }
//     else if (GL_BUFFER == GFX.ANY) {
//         vbIdx = VertexBufferExists(sceneidx, progs[progIdx]);
//     }

//     // If the chosen vertexBuffer is used as private by another drawable, then it should not be used if addToSpecificGlBuffer is not passed.
//     // SEE ## PRIVATE_BUFFERS
//     if (vbIdx > INT_NULL && vbIdx !== addToSpecificGlBuffer && progs[progIdx].vertexBuffer[vbIdx].isPrivate) vbIdx = INT_NULL;

//     let vb = null; // Cash for convinience
//     let ib = null; // Cash for convinience

//     /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//      * Initialize gl buffers
//      */
//     if (vbIdx < 0) { // Create gl buffer

//         vbIdx = progs[progIdx].vertexBufferCount++;
//         progs[progIdx].vertexBuffer[vbIdx] = vb = new VertexBuffer(sid, sceneidx, vbIdx, gfxCtx.gl);

//         gfxCtx.gl.bindBuffer(gfxCtx.gl.ARRAY_BUFFER, vb.webgl_buffer);

//         // Initialize attribute locations of the shader for every newly created vertex buffer.
//         GlEnableAttribsLocations(gfxCtx.gl, progs[progIdx]);

//         // Connect the vertex buffer with the atlas texture. 
//         if (sid.attr & SID.ATTR.TEX2) {
//             if (sid.shad & SID.SHAD.TEXT_SDF) vb.textidx = Texture.font;
//             else vb.textidx = Texture.atlas;
//         }
//         if (dbg.GL_DEBUG_BUFFERS_ALL) console.log('===== VertexBuffer =====\nvbIdx:', vbIdx, 'progIdx:', progIdx);

//         /**
//          * Create Index buffer
//          */
//         if (sid.shad & SID.SHAD.INDEXED) {

//             ibIdx = progs[progIdx].indexBufferCount++;
//             progs[progIdx].indexBuffer[ibIdx] = ib = new IndexBuffer(sid, sceneidx, ibIdx, gfxCtx.gl, INDICES_PER_RECT);
//             ib.vao = vb.vao; // Let index buffer have a copy of the vao

//             if (dbg.GL_DEBUG_BUFFERS_ALL) console.log('----- VertexBuffer -----\nibIdx:', ibIdx, 'progIdx:', progIdx)
//         }

//         // Add the new vertexBuffer to render queue
//         Renderqueue_get().Add(progIdx, vbIdx, vb.show);
//         Gl_set_vb_show(progIdx, vbIdx, true);
//     }
//     else {

//         vb = progs[progIdx].vertexBuffer[vbIdx];
//         gfxCtx.gl.bindVertexArray(vb.vao)
//         gfxCtx.gl.bindBuffer(gfxCtx.gl.ARRAY_BUFFER, vb.webgl_buffer)

//         // Index buffer. TODO: we bound the ibIdx with the vbIdx. What if later we want to use arbitary index buffers??? We must implement another way of finding the correct ib(Most probable is to pass the ibIdx to this function)
//         ibIdx = IndexBufferExists(vbIdx, sceneidx, progs[progIdx]);
//         ib = progs[progIdx].indexBuffer[ibIdx];

//     }

//     // Cash values
//     const vertsPerRect = progs[progIdx].shaderinfo.verticesPerRect;
//     const attribsPerVertex = progs[progIdx].shaderinfo.attribsPerVertex;
//     // const start = vb.mesh_count * vertsPerRect * attribsPerVertex; // Add meshes to the vb continuously
//     // console.log(`start:${start} prog:${progIdx} vb:${vbIdx}`)
//     // vb.mesh_count += num_faces;
//     const count = vertsPerRect * attribsPerVertex; // Total attributes of the mesh. All text meshes have only one face registered, the rest of the faces are calculated if needed.

//     // Set meshes gfx info
//     const gfxInfo = new GfxInfoMesh; // NOTE: This is the only construction of a new GfxInfoMesh object(as for now), all other calls are for creating a copy of an existing GfxInfoMesh. 
//     gfxInfo.sid = sid;
//     gfxInfo.sceneidx = sceneidx;
//     gfxInfo.vao = vb.vao;
//     gfxInfo.num_faces = num_faces;
//     gfxInfo.vertsPerRect = vertsPerRect;
//     gfxInfo.attribsPerVertex = attribsPerVertex;
//     gfxInfo.prog.idx = progIdx;
//     gfxInfo.vb.idx = vbIdx;
//     gfxInfo.vb.start = 0;
//     // gfxInfo.vb.start = start;
//     gfxInfo.vb.count = count;
//     gfxInfo.ib.idx = ibIdx;
//     gfxInfo.ib.count = ib.count;

//     return gfxInfo;
// }

// export function Gl_add_geom_mat_to_vb(sid, gfx, geom, mat, vb_type_flag, mesh_name, meshidx) {


//    // console.log(meshidx, mesh_name)
//    /**DEBUG ERROR*/ if (geom.pos[0] === undefined) { console.error('Pos is UNDEFINED. mesh:', mesh_name) }
//    /**DEBUG ERROR*/ if (geom.dim[0] === undefined) { console.error('Dim is UNDEFINED. mesh:', mesh_name) }
//    /**DEBUG ERROR*/ if (mat.col[0] === undefined) { console.error('Col is UNDEFINED. mesh:', mesh_name) }
//    /**DEBUG ERROR*/ if (mat.style[0] === undefined) { console.error('Style is UNDEFINED. mesh:', mesh_name) }
//     // /**DEBUG ERROR*/ if(meshidx === undefined){ console.error('Mesh index is not passed as a param. mesh:', mesh_name)}

//     const progIdx = gfx.prog.idx;
//     const vbIdx = gfx.vb.idx;
//     const ibIdx = gfx.ib.idx;
//     const prog = Gl_progs_get_prog_byidx(progIdx);
//     const vb = Gl_progs_get_vb_byidx(progIdx, vbIdx);
//     const ib = Gl_progs_get_ib_byidx(progIdx, ibIdx);
//     // const num_faces = geom.num_faces;
//     const num_faces = 1;
//     const start = (!gfx.vb.start) ? vb.count : gfx.vb.start;
//     vb.vCount += prog.shaderinfo.verticesPerRect * gfx.num_faces;

//     const count = gfx.vb.count;

//     if (GL.BOUND_PROG_IDX !== progIdx) {
//         GlUseProgram(prog.webgl_program, progIdx);
//         GL.BOUND_PROG_IDX = progIdx;
//         gfxCtx.gl.bindVertexArray(vb.vao);
//         gfxCtx.gl.bindBuffer(gfxCtx.gl.ARRAY_BUFFER, vb.webgl_buffer);
//         GL.BOUND_VBO_IDX = vbIdx;
//     }
//     if (GL.BOUND_VBO_IDX !== vbIdx) {
//         gfxCtx.gl.bindVertexArray(vb.vao);
//         gfxCtx.gl.bindBuffer(gfxCtx.gl.ARRAY_BUFFER, vb.webgl_buffer);
//         GL.BOUND_VBO_IDX = vbIdx;
//     }

//     // Reallocate vertex buffer if it has no more space
//     const meshSize = gfx.attribsPerVertex * gfx.vertsPerRect * num_faces;
//     if (vb.count + meshSize >= vb.size) vb.Realloc();
//     // console.log(`vbcount:${vb.count} meshsize:${meshSize} vb.size:${vb.size}`);

//     /**********************************************************************************************************************/
//     { // Add Geometry
//         if (sid.attr & SID.ATTR.POS2) { // Add Position, if the program has such an attribute 
//             GlOps.VbSetAttribPos(vb, start + prog.shaderinfo.attributes.offset.pos,
//                 count, prog.shaderinfo.attribsPerVertex - prog.shaderinfo.attributes.size.pos, geom.dim, num_faces);
//         }
//         if (sid.attr & SID.ATTR.WPOS_TIME4) { // Add World Position, if the program has such an attribute 
//             if (sid.attr & SID.ATTR.POS3) {
//                 GlOps.VbSetAttribWpos(vb, start + prog.shaderinfo.attributes.offset.wposTime,
//                     count, prog.shaderinfo.attribsPerVertex - 3, geom.pos, 2);
//             }
//             else {
//                 GlOps.VbSetAttribWpos(vb, start + prog.shaderinfo.attributes.offset.wposTime,
//                     count, prog.shaderinfo.attribsPerVertex - prog.shaderinfo.attributes.size.wpos, geom.pos, num_faces);
//             }
//         }
//         if (sid.attr & SID.ATTR.TIME) { // Per Vertex Timer (meant to be per mesh, 4 vertices) 
//             GlOps.VbSetAttrTime(vb, start + prog.shaderinfo.attributes.offset.time,
//                 count, prog.shaderinfo.attribsPerVertex - prog.shaderinfo.attributes.size.wpos, geom.time, num_faces);
//         }
//     }

//     /**********************************************************************************************************************/
//     { // Add Material
//         if (sid.attr & SID.ATTR.COL4 && mat.col) { // Add Color, if the program has such an attribute

//             if (!mat.col && DEBUG.WEB_GL) console.error('Style hasn\'t being set. @AddMaterial(), GlBuffers.js')

//             // 4 color vertex
//             if (sid.attr & SID.ATTR.COL4_PER_VERTEX) {
//                 GlOps.VbSetAttribColPerVertex(vb, start + prog.shaderinfo.attributes.offset.col,
//                     count, prog.shaderinfo.attribsPerVertex - prog.shaderinfo.attributes.size.col, mat.col, num_faces);
//             }
//             else { // Regular color. 1 color for all vertices
//                 GlOps.VbSetAttribCol(vb, start + prog.shaderinfo.attributes.offset.col,
//                     count, prog.shaderinfo.attribsPerVertex - prog.shaderinfo.attributes.size.col, mat.col, num_faces);
//             }
//         }
//         if (sid.attr & SID.ATTR.TEX2 && mat.uv) { // Add Texture, if the program has such an attribute 
//             if (!mat.uv && DEBUG.WEB_GL) console.error('Style hasn\'t being set. @AddMaterial(), GlBuffers.js')
//             GlOps.VbSetAttribTex(vb, start + prog.shaderinfo.attributes.offset.tex,
//                 count, prog.shaderinfo.attribsPerVertex - prog.shaderinfo.attributes.size.tex, mat.uv, num_faces);
//         }
//         if (sid.attr & SID.ATTR.SDF && mat.sdf_params) { // Add Texture, if the program has such an attribute 
//             if (!mat.sdf_params && DEBUG.WEB_GL) console.error('Sdf hasn\'t being set. @AddMaterial(), GlBuffers.js')
//             // (vb, start, count, stride, sdf_params)
//             GlOps.VbSetAttrSdf(vb, start + prog.shaderinfo.attributes.offset.sdf,
//                 count, prog.shaderinfo.attribsPerVertex - prog.shaderinfo.attributes.size.sdf, mat.sdf_params, num_faces);
//         }

//         let params1Index = 0; //  Handles any unused attributes of the vec4 params1 shader attribute.  
//         if (sid.attr & SID.ATTR.BORDER) {
//             if (!mat.style && DEBUG.WEB_GL) console.error('Style.border hasn\'t being set. @AddMaterial(), GlBuffers.js')
//             else {
//                 GlOps.VbSetAttrBorderWidth(vb, start + prog.shaderinfo.attributes.offset.params1 + params1Index,
//                     count, prog.shaderinfo.attribsPerVertex - V_BORDER_WIDTH, mat.style[STYLE.BORDER], num_faces)
//                 params1Index++;
//             }
//         }
//         if (sid.attr & SID.ATTR.R_CORNERS) {
//             if (!mat.style && DEBUG.WEB_GL) console.error('Style.rCorners hasn\'t being set. @AddMaterial(), GlBuffers.js')
//             else {
//                 GlOps.VbSetAttrRoundCorner(vb, start + prog.shaderinfo.attributes.offset.params1 + params1Index,
//                     count, prog.shaderinfo.attribsPerVertex - V_ROUND_CORNERS, mat.style[STYLE.R_CORNERS], num_faces)
//                 params1Index++;
//             }
//         }
//         if (sid.attr & SID.ATTR.FEATHER) {
//             if (!mat.style && DEBUG.WEB_GL) console.error('Style.feather hasn\'t being set. @AddMaterial(), GlBuffers.js')
//             else {
//                 GlOps.VbSetAttrBorderFeather(vb, start + prog.shaderinfo.attributes.offset.params1 + params1Index,
//                     count, prog.shaderinfo.attribsPerVertex - V_BORDER_FEATHER, mat.style[STYLE.FEATHER], num_faces)
//                 params1Index++;
//             }
//         }
//         /** IMPORTANT! The stayle attributes(counts 3 attributes) use the attrParams vector4 to be passed.
//          * Therefore, in order to count the totaol attributes we must take into consideration the empty attribute
//          */
//         if (sid.attr & SID.ATTR.EMPTY) { // Increment vertex count for unused vector elements
//             vb.count += prog.shaderinfo.verticesPerRect * num_faces;
//         }
//     }

//     /**********************************************************************************************************************/
//     // Create indices
//     if (sid.shad & SID.SHAD.INDEXED) {

//         // Check for buffer realloc
//         if (ib.count + num_faces * INDICES_PER_RECT > ib.size) {
//             ib.Realloc();
//         }

//         gfx.ib.start = ib.count;
//         ib.Add(num_faces)
//         gfx.ib.count = ib.count;
//     }


//     prog.isActive = true; // Sets a program to 'active', only if there are meshes in the program's vb
//     vb.needsUpdate = true;

//     if (vb_type_flag) vb.type |= vb_type_flag;

//    /**DEBUG */vb.mesh_indexes.push(meshidx);
//    /**DEBUG */CreateUniqueMesh(vb.debug.meshesNames, mesh_name);

//     return start;
// }