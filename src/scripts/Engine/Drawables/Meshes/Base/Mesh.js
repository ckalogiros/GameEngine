"use strict";
import { GlSetAttrTime, GlSetTex } from "../../../../Graphics/Buffers/GlBufferOps.js";
import { GfxSetVbRender, GlGenerateContext } from "../../../../Graphics/Buffers/GlBuffers.js";
import { GfxInfoMesh, GlGetProgram } from "../../../../Graphics/GlProgram.js";
import { Int8Buffer, Int8_2DBuffer, M_Buffer } from "../../../Core/Buffers.js";
import { FontGetFontDimRatio, FontGetUvCoords } from "../../../Loaders/Font/Font.js";
import { TimerGetGlobalTimer } from "../../../Timers/Timers.js";
import { Listener_create_event, Listener_hover_enable, Listener_hover_remove_by_idx, Listener_remove_event, Listener_remove_events_all } from "../../../Events/EventListeners.js";
import { CopyArr4 } from "../../../../Helpers/Math/MathOperations.js";
import { Scenes_get_scene_by_idx } from "../../../Scenes.js";


const MAX_EVENT_FUNCTIONS_BUFFER_SIZE = 16; // TODO: Set max from global enum object of EVENTS_...
const MAX_LISTENERS_BUFFER_SIZE = 16; // TODO: Set max from global enum object of EVENTS_...

let _cnt = 1;
_cnt2 = 1;
export const MESH_ENABLE = {

    GFX: {

        UNIF_RESOLUTION: _cnt <<= 1,
        UNIF_TIMER: _cnt <<= 1,
        ATTR_TIME: _cnt <<= 1,
        ATTR_STYLE: _cnt <<= 1,

        // Pass from vertex to fragment shader
        PASS_COL4: _cnt <<= 1,
        PASS_WPOS2: _cnt <<= 1,
        PASS_DIM2: _cnt <<= 1,
        PASS_TIME1: _cnt <<= 1,
        PASS_RES2: _cnt <<= 1,

        NONE: 0,
    },
}

_cnt = 0;
const LISTENER_EVENT_FUNCS_INDEXES = {
    SCALE_ANIMATION: _cnt++,
    DIM_COLOR_ANIMATION: _cnt++,
};



class BitMask {

    mask;
    constructor() { this.mask = 1 | 0; }
    set(channel) { this.mask = (1 << channel | 0) >>> 0; }
    enable(channel) { this.mask |= 1 << channel | 0; }
    enableAll() { this.mask = 0xffffffff | 0; }
    toggle(channel) { this.mask ^= 1 << channel | 0; }
    disable(channel) { this.mask &= ~(1 << channel | 0); }
    disableAll() { this.mask = 0; }
    test(layers) { return (this.mask & layers.mask) !== 0; }
    isEnabled(channel) { return (this.mask & (1 << channel | 0)) !== 0; }

}

class Bit_Mask { mask = 0; }

let _meshId = 0;
export class Mesh {

    /**
     * TODO: Organize all function callbacks to an object
     * TODO: Organize all buffers to an object
     */

    sid; // Shader Identifier
    idx; // This is the index of the mesh in the scene's children buffer;
    geom;
    mat;
    time;
    attrParams1;
    gfx;
    uniforms;
    sceneIdx; // A refference to the scene that the mesh belongs to(index only).
    type; // A bit masked large integer to 'name' all different types of a mesh. 
    listeners; // Indexes to the EventListeners class.
    listen_hover_idx; // The index of the hover buffer that the mesh is stored to.
    eventCallbacks; // A buffer to store all callback for any event enabled for the mesh.
    parent; // Pointer to the parent mesh.
    children; // buffer of pointers to children mesh.
    state;  // Bitfield integer. Stores enebled-dissabled mesh state. 
    timeIntervalsIdxBuffer; // This buffer stores indexes of the timeIntervals this mesh is using.
    timedEvents; // A buffer to set a one time event that is triggered by another event. E.x. When we need to set the mesh priority in the renderQueue and the mesh does not have a gfx yet. 
    hoverMargin; // A margion to be set for hovering. TODO: Abstract to a struct.
    menu_options; // A callback and an index. Constructs the options popup menu for the mesh
    menu_options_idx; // An index to the menu options handler's buffer

    name;

    constructor(geom = null, mat = null, time = 0, attrParams1 = [0, 0, 0, 0], name = '???') {

        this.geom = geom;
        this.mat = mat;

        this.sid = {
            shad: SID.SHAD.INDEXED,
            attr: (this.geom.sid.attr | this.mat.sid.attr),
            unif: (this.mat.sid.unif) | SID.UNIF.PROJECTION, // Assuming we always have  a projection camera and a uniforms buffer. 
            pass: (this.geom.sid.pass | this.mat.sid.pass | SID.PASS.COL4),
        };

        this.gfx = null;

        if (time) this.time = time;

        this.attrParams1 = [0, 0, 0, 0];
        if (attrParams1)
            CopyArr4(this.attrParams1, attrParams1);

        this.uniforms = {
            time: {
                val: 0,
                idx: INT_NULL,
            }
        }

        // Guard against enable a param for the shaders after the gl program has been created
        this.alreadyAdded = false;

        // Add the type 'Mesh'
        this.type |= MESH_TYPES_DBG.MESH;

        /** TODO: Make one listen events buffer, but destroy calling the 2 different events functions */
        this.listeners = new Int8_2DBuffer(LISTEN_EVENT_TYPES.SIZE, 1);
        this.listen_hover_idx = INT_NULL;

        this.eventCallbacks = new M_Buffer();

        this.timedEvents = new M_Buffer();

        this.children = new M_Buffer();

        this.timeIntervalsIdxBuffer = new Int8Buffer();

        this.state = {
            inHover: false,
            inScale: false,
            inDimColor: false,
            inBrightColor: false,
        };

        this.state = { mask: 0 }; // Unfortunately js cannot create a pointer for integers, so we have to wrap the mask to a class;

        this.hoverMargin = 0;

        this.menu_options_idx = INT_NULL;
        this.menu_options = {
            Clbk: null,
            idx: INT_NULL,
        };

        /** Debug  properties */
        if (DEBUG.MESH) {
            Object.defineProperty(this, 'id', { value: _meshId++ });
        }
    }

    AddChild(mesh) {

        mesh.parent = this;
        mesh.idx = this.children.Add(mesh);
        return mesh.idx;
    }

    RemoveChildren() {

        const count = this.children.count;
        for (let i = 0; i < count; i++) {

            this.children.RemoveByIdx(i);
        }
    }

    RemoveChildByIdx(idx) {

        this.children.RemoveByIdx(idx);
    }

    RecursiveDestroy() {

        /**
         * Currently destroys the 'this' mesh, all of its listeners and the liste_hover event.
         * Continues call destroy of any child recursively with the same destruction options.
         * 
         * TODO!!! Implement:
         * 1.   If the curent mesh belongs to a Private vertex buffer, 
         *          we should implement to destroy the vrtex buffer to.
         * 2.   Definetly we need an implementation of removing vertices from the gfx buffers.
         *      One way would be to keep track of all the free attributes of a vertex buffer
         *      and add to that free space when it is fit. Also we need a kind of combining
         *      overlaping free space implementation
         */
        Mesh_recursive_destroy(this);

        // Remove self

        if (this.listeners.count) 
            Listener_remove_events_all(LISTEN_EVENT_TYPES.CLICK, this.listeners);

        if (this.listen_hover_idx !== INT_NULL)
            Listener_hover_remove_by_idx(this.listen_hover_idx);

        const scene = Scenes_get_scene_by_idx(this.sceneIdx);
        ERROR_NULL(scene);
        scene.RemoveMesh(this);
    }

    /**
     * Optimize mesh hover checking. 
     * Remove any unecessary listen events from the EventListeners buffer.
     * 
     * IMPORTANT! MUST BE CALLED AFTER ALL CHILDREN MESHES HAVE BEEN ADDED T
     * 
     * The core idea is to set the ListenEvent in the parent of the listened meshes and
     * have the EventListener check the event for all children meshes if the parent is hovered at all.
     * That way we skip all other meshes with different parent.
     * The worst case scenario is the <number of parent meshes + number of meshes to be listened (for that parent)>
     * On the other hand, that is having all meshes (to be listened for an event) in the EventListeners buffer,
     * the worst case scenario is <number of meshes to be listened(all meshes of all parents).
     * E.x: 10 parents with 10 meshes each.
     *      1. 10 + 10 = 20 event checks.
     *      2. 10 * 10 = 100 event checks.
     * SEE: ##HoverListenEvents.darwio file at docs/ScemeDraws/ folder
     */
    // ListenersReconstruct() {

    //     const count = this.children.count
    //     // if(count<=1) return; // If there is only one child mesh, is more eficient to leave the event to the child. Otherwise would be 2 checks, 1 for parent + 1 for child. 

    //     for(let i=0; i<count; i++){

    //         const mesh = this.children.buffer[i];
    //         const idx = LISTEN_EVENT_TYPES_INDEX.HOVER;
    //         if(mesh.StateCheck(MESH_STATE.HAS_HOVER) && mesh.listeners.buffer[idx] !== null){

    //             // Remove the EventListener from all the children.
    //             mesh.RemoveListenEvent(idx);
    //             // console.log('________________________REMOVING_LISTENER________________________\n', mesh.name)
    //         }
    //     }

    //     // Enable 'IS_FAKE_HOVER' to denote that this mesh may have a listener, but it is actually it's children to be listened to.
    //     this.StateEnable(MESH_STATE.IS_FAKE_HOVER);
    // }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * GRAPHICS
     */
    CreateGfxCtx(sceneIdx, useSpecificVertexBuffer = GL_VB.ANY, vertexBufferIdx = INT_NULL) {

        this.sceneIdx = sceneIdx;
        let mesh = this;

        ERROR_NULL(sceneIdx)

        mesh.gfx = GlGenerateContext(mesh.sid, sceneIdx, useSpecificVertexBuffer, vertexBufferIdx);

        const prog = GlGetProgram(mesh.gfx.prog.idx);
        if (mesh.sid.unif & SID.UNIF.BUFFER_RES) {
            const unifBufferResIdx = prog.UniformsBufferCreateScreenRes();
            prog.UniformsSetBufferUniform(Viewport.width, unifBufferResIdx.resXidx);
            prog.UniformsSetBufferUniform(Viewport.height, unifBufferResIdx.resYidx);
        }

        // Set Texture if this is a textured mesh.
        if (mesh.mat.texId !== INT_NULL) { // texId is init with INT_NULL that means there is no texture passed to the Material constructor.

            // Set font parameters if this is a text mesh.
            if (mesh.mat.hasFontTex) {
                mesh.isFontSet = true;
                // Correct the text face height by calculating the ratio from the current font metrics.
                mesh.geom.dim[1] *= FontGetFontDimRatio(mesh.mat.uvIdx);
            }
        }

        // mesh.geom.AddToGraphicsBuffer(mesh.sid, mesh.gfx, mesh.name);
        // mesh.mat.AddToGraphicsBuffer(mesh.sid, mesh.gfx);

        return mesh.gfx;
    }

    AddToGfx(){

        this.geom.AddToGraphicsBuffer(this.sid, this.gfx, this.name);
        this.mat.AddToGraphicsBuffer(this.sid, this.gfx);
    }

    // Remove_from_graphics_buffer_fast() {

    //     this.geom.Remove_from_graphics_buffer_fast(this.gfx, 1);

    //     if (this.children.count)
    //         Recursive_gfx_operations(this, Remove_from_graphics_buffer_fast, TRANSPARENT)

    // }

    Set_graphics_vertex_buffer_render(flag) {

        GfxSetVbRender(this.gfx.prog.idx, this.gfx.vb.idx, flag);
        if (flag) this.StateEnable(MESH_STATE.HAS_HOVER);
        else this.StateDisable(MESH_STATE.HAS_HOVER);

        if (this.children.count)
            Recursive_gfx_operations(this, Set_graphics_vertex_buffer_render, flag)

    }


    /**
     * Mesh States.
     * Enable, disable, etc, mesh states.
     * E.x. enable mesh to be movable or to have a popup menu when right clicked...
     * Also enables booleans such inHover, 
     */
    StateEnable(bit) { this.state.mask |= bit; }
    StateDisable(bit) { this.state.mask &= ~bit; }
    StateToggle(bit) { this.state.mask ^= bit; }
    StateCheck(bit) { return this.state.mask & bit; }

    /**
     * Enable shader properties.
     * In order for a mesh to be draw in a certain way, 
     * specific shaders must be build.
     * This is how the shader constructor
     * decides what shader chunks to use
     * when constructing the shader for the mesh. 
     */
    EnableGfxAttributes(which, params) {

        if (this.alreadyAdded === true) {
            console.error(`You are trying to enable ${which} but the shaders have been already created. Try Enable() before inserting the mesh to a Scene().`);
        }

        if (Array.isArray(which)) {
            const count = which.length;
            for (let i = 0; i < count; i++) {
                this.CheckCase(which[i], params);
            }

        }
        else {
            this.CheckCase(which, params);
        }
    }
    CheckCase(which, params) {
        switch (which) {
            case MESH_ENABLE.GFX.UNIF_RESOLUTION: {
                this.sid.unif |= SID.UNIF.BUFFER_RES | SID.UNIF.U_BUFFER; // Enable the screen resolution to be contructed as a uniform in the vertex shader, to be used in the fragment shader.
                break;
            }
            case MESH_ENABLE.GFX.ATTR_STYLE: {
                this.sid.attr |= (SID.ATTR.BORDER | SID.ATTR.R_CORNERS | SID.ATTR.FEATHER) | SID.ATTR.PARAMS1 | SID.ATTR.EMPTY;
                this.sid.unif |= SID.UNIF.U_BUFFER;
                this.sid.pass |= SID.PASS.WPOS2 | SID.PASS.DIM2;
                if (!(params === null || params === undefined)) {
                    this.mat.style = params.style;
                }

                this.sid.unif |= SID.UNIF.BUFFER_RES | SID.UNIF.U_BUFFER;
                break;
            }
            case MESH_ENABLE.GFX.ATTR_TIME: {
                this.sid.attr |= SID.ATTR.TIME;
                break;
            }

            case MESH_ENABLE.GFX.PASS_COL4: { this.sid.pass |= SID.PASS.COL4; break; }
            case MESH_ENABLE.GFX.PASS_WPOS2: { this.sid.pass |= SID.PASS.WPOS2; break; }
            case MESH_ENABLE.GFX.PASS_DIM2: { this.sid.pass |= SID.PASS.DIM2; break; }
            case MESH_ENABLE.GFX.PASS_RES2: { this.sid.pass |= SID.PASS.RES2; break; }
            case MESH_ENABLE.GFX.PASS_TIME1: { this.sid.pass |= SID.PASS.TIME1; break; }

            default: console.error('Enable material\'s shader param failed. @ Material.js');
        }
    }

    /**
     * Uniforms
     */
    SetTimeBufferUniform() {
        if (this.uniforms.time.idx === INT_NULL) {
            console.error('Buffer uniform time has not been created. @Mesh.SetBufferTimeUniform.');
            return;
        }
        const prog = GlGetProgram(this.gfx.prog.idx);
        prog.UniformsSetBufferUniform(this.time);
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * Event Listeners
     */
    CreateListenEvent(event_type, Clbk=null, params=null, target=null) {
        
        if(event_type & LISTEN_EVENT_TYPES.CLICK){
            if(ERROR_NULL(Clbk) | ERROR_NULL(params)) alert('Passing null parmeters. @  CreateListenEvent(), Mesh.js')

            // TODO: If the params is used only to pass the this object, the params is not needed for creating listen events
            const idx = Listener_create_event(event_type, Clbk, params, target);
            console.log('Listener: params === this : ', params === this)
            this.listeners.Add(event_type, idx);
        }
        else if(event_type & LISTEN_EVENT_TYPES.HOVER){

            this.listen_hover_idx = Listener_hover_enable(this);
        }
        else if(event_type & LISTEN_EVENT_TYPES.MOVE){

            // Necessary to activate in order for the mesh to be able to move by a 'Click' event
            this.StateEnable(MESH_STATE.IS_GRABABLE | MESH_STATE.IS_MOVABLE);
            // We use a click event because the operation its base on the mouse click and hold
            const idx = Listener_create_event(LISTEN_EVENT_TYPES.CLICK, Clbk, params, target);
            this.listeners.Add(LISTEN_EVENT_TYPES.CLICK, idx);
        }
    }

    RemoveAllListenEvents() {

        if(this.listen_hover_idx !== INT_NULL){
            for(let event_type=0; event_type<this.listeners.count; event_type++){

                for(let j=0; j<this.listeners.count; j++){

                    const idx = this.listeners.GetElem(event_type, i); 
                    Listener_remove_event(event_type, idx);
                    this.listeners.RemoveByIdx(event_type, j);
                }
            }
        }
        
        if(this.listen_hover_idx !== INT_NULL){
            Listener_hover_remove_by_idx(this.listen_hover_idx);
        }
    }

    RemoveListenEvent(event_type) {

        if(event_type & LISTEN_EVENT_TYPES.CLICK){
            if(this.listen_hover_idx !== INT_NULL){
                for(let i=0; i<this.listeners.count; i++){
                    
                    const idx = this.listeners.GetElem(event_type, i); 
                    Listener_remove_event(event_type, idx);

                    // Disable any state for the move mesh event on click.
                    if(this.StateCheck(MESH_STATE.IS_GRABABLE | MESH_STATE.IS_MOVABLE))
                        this.StateDisable(MESH_STATE.IS_GRABABLE | MESH_STATE.IS_MOVABLE);
                }
            }
        }
        else if(event_type & LISTEN_EVENT_TYPES.HOVER){
            if(this.listen_hover_idx !== INT_NULL){
                Listener_hover_remove_by_idx(this.listen_hover_idx);
            }
        }
    }

    CreateEvent(params = null) {

        if(!params) alert('CreateEvent(params = null). @ Mesh.js')
        const eventIdx = this.eventCallbacks.Add(params);
        return eventIdx;
    }

    /**
     * 
     * @param {*} ClbkFunction The function to call for contructing the menu options of 'this' mesh.
     */
    SetMenuOptionsClbk(ClbkFunction) {
        this.menu_options.Clbk = ClbkFunction;
    }

    /**
     * Setters-Getters
     */
    SetColor(col) { this.mat.SetColor(col, this.gfx) }
    SetDefaultColor() { this.mat.SetDefaultColor(this.gfx) }
    SetColorRGB(col) { this.mat.SetColorRGB(col, this.gfx) }
    SetColorAlpha(alpha) { this.mat.SetColor(alpha) }
    SetPos(pos) { this.geom.SetPos(pos, this.gfx); }
    SetPosRecursive(pos) { 
        this.geom.SetPos(pos, this.gfx); 
        if (this.children.count)
        Recursive_gfx_operations(this, Set_pos_xyz_for_recursion, pos)
    }
    SetPosXY(pos) { this.geom.SetPosXY(pos, this.gfx); }
    SetPosXYRecursiveMove(pos) { 
        this.geom.SetPosXY(pos, this.gfx); 
        if (this.children.count)
            Recursive_gfx_operations(this, Move_pos_xy_for_recursion, pos)
    }
    SetPosX(x) { this.geom.SetPosX(x, this.gfx); }
    UpdatePosXY() { this.geom.UpdatePosXY(this.gfx) }
    UpdatePosXYZ() { this.geom.UpdatePosXYZ(this.gfx) }
    UpdateDim() { this.geom.UpdateDim(this.gfx) }
    UpdateZindex(z) { 
        this.geom.SetZindex(z, this.gfx) }
    SetAttrTime() {
        if (this.sid.attr & SID.ATTR.TIME) {
            this.geom.timer = TimerGetGlobalTimer();
            GlSetAttrTime(this.gfx, this.geom.timer);
        }
    }
    SetStyle(border, rCorners, feather) { this.mat.SetStyle(border, rCorners, feather); }
    MoveRecursive(x, y) {

        this.geom.MoveXY(x, y, this.gfx);

        if (this.children.count)
            Recursive_mesh_move(this.children, x, y)
    }

    FindIdInChildren(id) {

        for (let i = 0; i < this.children.count; i++) {
            const child = this.children.buffer[i];
            if (child && id === child.id && child.StateCheck(MESH_STATE.HAS_HOVER)) {
                return true;
            }
        }
        return false;
    }

    /** Debug */
    SetName(name=null) {

        // if(name) this.name = name + this.id;
        if(name) this.name = name + ' id:' + this.id;
        else{
            this.name = GetMeshHighOrderNameFromType(this.type);
            this.name += ' id: ' + this.id;
        }
    }

}


export class Text_Mesh extends Mesh {

    isFontSet;

    constructor(geom, mat) {

        super(geom, mat);
        this.isFontSet = false;

        this.type |= MESH_TYPES_DBG.TEXT_MESH;
    }

    CreateGfxCtx(sceneIdx, useSpecificVertexBuffer = GL_VB.ANY, vertexBufferIdx = INT_NULL) {

        this.gfx = GlGenerateContext(this.sid, sceneIdx, useSpecificVertexBuffer, vertexBufferIdx, false, this.mat.numChars);

        const prog = GlGetProgram(this.gfx.prog.idx);
        if (this.sid.unif & SID.UNIF.BUFFER_RES) {
            const unifBufferResIdx = prog.UniformsBufferCreateScreenRes();
            prog.UniformsSetBufferUniform(Viewport.width, unifBufferResIdx.resXidx);
            prog.UniformsSetBufferUniform(Viewport.height, unifBufferResIdx.resYidx);
        }

        // this.geom.AddToGraphicsBuffer(this.sid, this.gfx, this.name);
        // this.mat.AddToGraphicsBuffer(this.sid, this.gfx);

        return this.gfx;
    }

    AddToGfx(){

        this.geom.AddToGraphicsBuffer(this.sid, this.gfx, this.name);
        const start = this.mat.AddToGraphicsBuffer(this.sid, this.gfx);
        return start;
    }

    UpdateText(_val) {

        const val = _val;

        const text = `${val}`;
        const geom = this.geom;
        const gfx = this.gfx;
        const mat = this.mat;

        let gfxInfoCopy = new GfxInfoMesh(gfx);

        const textLen = text.length;
        const len = geom.numChars > textLen ? geom.numChars : (textLen > geom.numChars ? geom.numChars : textLen);

        // Update text faces
        for (let j = 0; j < len; j++) {

            let uvs = [0, 0, 0, 0];
            if (text[j] !== undefined) {
                uvs = FontGetUvCoords(mat.uvIdx, text[j]);
            }
            GlSetTex(gfxInfoCopy, uvs);
            gfxInfoCopy.vb.start += gfxInfoCopy.vb.count
        }
    }

    // UpdateZindex(z) { this.geom.UpdateZindex(z, this.gfx) }
    SetZindex(z){
        this.geom.SetZindex(z, this.gfx, this.mat.numChars)
     }

    CalcTextWidth() {
        let width = this.geom.CalcTextWidth();
        for (let i = 0; i < this.children.count; i++) {
            if(this.children.buffer[i])
                width += this.children.buffer[i].geom.CalcTextWidth();
        }
        return width;
    }

    UpdatePosXYZ() { 
        // this.geom.UpdatePosXY(this.gfx) 
        console.log('OOOOOOOOOOOOOOOOO')
        
        const geom = this.geom;
        const gfx = this.gfx;
        const text = this.mat.text;

        const textLen = text.length;
        const len = geom.numChars > textLen ? geom.numChars : (textLen > geom.numChars ? geom.numChars : textLen);

        const charPos = [0, 0, 0];
        charPos[0] = geom.pos[0];
        charPos[1] = geom.pos[1];
        charPos[2] = geom.pos[2];
  
        // Copy gfx, to pass new start for each character
        let gfxCopy = new GfxInfoMesh(gfx);
  
        for (let i = 0; i < len; i++) {
  
        //    GlAddGeometry(sid, charPos, this.dim, this.time, gfxCopy, meshName, 1)
           geom.SetPos(charPos, gfxCopy)
           gfxCopy.vb.start += gfxCopy.vb.count;
           gfxCopy.ib.start += gfxCopy.ib.count; // TODO!!!: should we count the index buffer??? should we re-implement the index buffers also??? IMPORTANT!!!
           charPos[0] += geom.dim[0] * 2;
        }
        // // Update text faces
        // for (let j = 0; j < len; j++) {

        //     this.geom.UpdatePosXY(gfxInfoCopy)
        //     // GlSetTex(gfxInfoCopy, uvs);
        //     gfxInfoCopy.vb.start += gfxInfoCopy.vb.count
        // }
    }
}

/**
 * TODO: Implement Grouping meshes from indices buffer for efficient gl vertexBuffer rendering
 */
// class MeshGroup {
//     parent;
//     children;
//     constructor(parent = null, childrer = null) {
//         this.parent = parent;
//     }
//     addChild(object) {
//         this.children.push(object);
//     }
// }


/** Helper Recursive Functions */

function Mesh_recursive_destroy(parent) {

    for (let i = 0; i < parent.children.count; i++) {

        const mesh = parent.children.buffer[i];

        if (mesh) {

            /** Recursive Part */
            if (mesh.children.count)
                Mesh_recursive_destroy(mesh)

            if (mesh.listeners.count)
                Listener_remove_events_all(LISTEN_EVENT_TYPES.CLICK, mesh.listeners);
    
            if (mesh.listen_hover_idx !== INT_NULL)
                Listener_hover_remove_by_idx(mesh.listen_hover_idx);
    
            /**
             * TODO: Implement
             * Implement the 'Gl_is_private'
             * and the destruction OR the deactivation of the gfx buffers
             */
            {
                // if(Gl_is_private(mesh.gfx))
                // GlResetVertexBuffer(mesh.gfx, 1);
                // mesh.Set_graphics_vertex_buffer_render(false);
            }

            mesh.RemoveChildren(); // TODO: Do we need to strip down all meshes??? Only if they are shared pointers to some mesh of the appliction
        }
                
        parent.RemoveChildByIdx(i); // Remove the current mesh from the parent
    }
}

export function Recursive_gfx_operations(_mesh, Clbk, params) {

    const children = _mesh.children;
    for (let i = 0; i < children.count; i++) {

        const mesh = children.buffer[i];
        if (mesh.children.active_count)
            Recursive_gfx_operations(mesh, Clbk, params)

        Clbk(mesh, params);
    }
}

function Set_pos_xyz_for_recursion(mesh, params){

    mesh.geom.SetPos(params, mesh.gfx)
}
function Set_pos_xy_for_recursion(mesh, params){

    mesh.geom.SetPosXY(params, mesh.gfx)
}
function Move_pos_xy_for_recursion(mesh, params){
    const x = params[0], y = params[1];
    mesh.geom.MoveXY(x, y, mesh.gfx)
}

// function Remove_from_graphics_buffer_fast(mesh) {

//     const numChars = mesh.mat.numChars;
//     mesh.geom.Remove_from_graphics_buffer_fast(mesh.gfx, numChars);
// }

function Set_graphics_vertex_buffer_render(mesh, flag) {

    const progidx = mesh.gfx.prog.idx;
    const vbidx = mesh.gfx.vb.idx;
    GfxSetVbRender(progidx, vbidx, flag)
}

function Recursive_mesh_move(mesh, x, y) {

    const meshes = mesh;

    for (let i = 0; i < meshes.count; i++) {

        if (meshes.buffer[i].children.count)
            Recursive_mesh_move(meshes.buffer[i].children, x, y)

        const gfx = meshes.buffer[i].gfx;
        meshes.buffer[i].geom.MoveXY(x, y, gfx);

    }

}

// function Recursive_mesh_set_pos_x(mesh, x) {

//     const children = mesh.children;

//     for (let i = 0; i < children.count; i++) {

//         if (children.buffer[i].children.count) {
//             Recursive_mesh_set_pos_x(children.buffer[i].children, x)
//         }

//         const gfx = children.buffer[i].gfx;
//         children.buffer[i].geom.SetPosX(x, gfx);
//     }
// }

// function Recursive_mesh_set_col_rgba(mesh, col) {

//     const children = mesh.children;

//     for (let i = 0; i < children.count; i++) {

//         if (children.buffer[i].children.count) {
//             Recursive_mesh_set_col_rgba(children.buffer[i].children, col)
//         }

//         const gfx = children.buffer[i].gfx;
//         children.buffer[i].mat.SetColor(col, gfx);
//     }
// }
