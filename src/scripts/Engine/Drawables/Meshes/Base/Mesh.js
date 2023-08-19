"use strict";
import { GlSetAttrTime, GlSetTex } from "../../../../Graphics/Buffers/GlBufferOps.js";
import { GfxSetVbRender, GlGetContext } from "../../../../Graphics/Buffers/GlBuffers.js";
import { GfxInfoMesh, GlGetProgram } from "../../../../Graphics/GlProgram.js";
import { Int8Buffer, M_Buffer } from "../../../Core/Buffers.js";
import { FontGetFontDimRatio, FontGetUvCoords } from "../../../Loaders/Font/Font.js";
import { TimerGetGlobalTimer } from "../../../Timers/Timers.js";
import { ListenerCreateListenEvent, ListenerRemoveListenEvent, ListenersGetListenerType } from "../../../Events/EventListeners.js";
import { CopyArr4 } from "../../../../Helpers/Math/MathOperations.js";


const MAX_EVENT_FUNCTIONS_BUFFER_SIZE = 16; // TODO: Set max from global enum object of EVENTS_...
const MAX_LISTENERS_BUFFER_SIZE = 16; // TODO: Set max from global enum object of EVENTS_...

let _cnt = 1;
let _cnt2 = 1;
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
    eventCallbacks; // A buffer to store all callback for any event enabled for the mesh.
    parent; // Pointer to the parent mesh.
    children; // buffer of pointers to children mesh.
    state;  // Bitfield integer. Stores enebled-dissabled mesh state. 
    timeIntervalsIdxBuffer; // This buffer stores indexes of the timeIntervals this mesh is using.
    timedEvents; // A buffer to set a one time event that is triggered by another event. E.x. When we need to set the mesh priority in the renderQueue and the mesh does not have a gfx yet. 
    hoverMargin; // A margion to be set for hovering. TODO: Abstract to a struct.
    MenuOptionsClbk; // A callback 

    name;

    // TempClbk;

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

        this.listeners = new M_Buffer();
        this.listeners.Init(MAX_LISTENERS_BUFFER_SIZE);

        this.eventCallbacks = new M_Buffer();
        this.eventCallbacks.Init(4);

        this.timedEvents = new M_Buffer();
        this.timedEvents.Init(2);

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
        
        this.MenuOptionsClbk = null;
        // this.TempClbk = null;

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
        for(let i=0; i<count; i++){

            this.children.RemoveByIdx(i);
        }
    }

    RemoveChildByIdx(idx) {

        this.children.RemoveByIdx(idx);
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
    ListenersReconstruct() {
        
        const count = this.children.count
        // if(count<=1) return; // If there is only one child mesh, is more eficient to leave the event to the child. Otherwise would be 2 checks, 1 for parent + 1 for child. 
        
        for(let i=0; i<count; i++){

            const mesh = this.children.buffer[i];
            const idx = LISTEN_EVENT_TYPES_INDEX.HOVER;
            if(mesh.StateCheck(MESH_STATE.HAS_HOVER) && mesh.listeners.buffer[idx] !== null){
                
                // Remove the EventListener from all the children.
                mesh.RemoveListenEvent(idx);
                // console.log('________________________REMOVING_LISTENER________________________\n', mesh.name)
            }
        }

        // Enable 'IS_FAKE_HOVER' to denote that this mesh may have a listener, but it is actually it's children to be listened to.
        this.StateEnable(MESH_STATE.IS_FAKE_HOVER);
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * GRAPHICS
     */
    AddToGraphicsBuffer(sceneIdx, useSpecificVertexBuffer = GL_VB.ANY, vertexBufferIdx = INT_NULL) {

        this.sceneIdx = sceneIdx;
        let mesh = this;

        mesh.gfx = GlGetContext(mesh.sid, sceneIdx, useSpecificVertexBuffer, vertexBufferIdx);

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

        mesh.geom.AddToGraphicsBuffer(mesh.sid, mesh.gfx, mesh.name);
        mesh.mat.AddToGraphicsBuffer(mesh.sid, mesh.gfx);

        return mesh.gfx;
    }

    // Remove_from_graphics_buffer_fast() {

    //     this.geom.Remove_from_graphics_buffer_fast(this.gfx, 1);

    //     if (this.children.count)
    //         Recursive_gfx_operations(this, Remove_from_graphics_buffer_fast, TRANSPARENT)

    // }

    Set_graphics_vertex_buffer_render(flag) {

        GfxSetVbRender(this.gfx.prog.idx, this.gfx.vb.idx, flag);
        if(flag) this.StateEnable(MESH_STATE.HAS_HOVER);
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

    CreateListenEvent(evttype) {

        const params = this;
        const idx = ListenerCreateListenEvent(evttype, params);
        this.listeners.Add(idx); // Store the index of the created listener in listeners buffer
        this.StateEnable(MESH_STATE.HAS_HOVER);
    }
    RemoveAllListenEvents() {

        const count = this.listeners.count;
        for (let i = 0; i < count; i++) {
            ListenerRemoveListenEvent(this.listeners.buffer[i])
            this.listeners.RemoveByIdx(i)
        }
    }
    /**
     * @param {int} typeidx Type of: LISTEN_EVENT_TYPES_INDEX 
     */
    RemoveListenEvent(typeidx) {

        const count = this.listeners.count;
        for (let i = 0; i < count; i++) {
            if (this.listeners.buffer[i][0] === typeidx) {

                ListenerRemoveListenEvent(this.listeners.buffer[i]);
                this.listeners.RemoveByIdx(i);
            }
        }
    }

    // CreateDispatchEventOnListenEvent(listenEventType, dispatcEventType, dispatchClbk) {

    //     // Check if the specific listen event type allready enabled for this mesh.
    //     const listeneridx = this.#GetListenEventIdx(listenEventType);
    //     const params = this;

    //     /* TODO: Must store the dispatcher index??? */
    //     const dispatcherIdx = ListenerCreateDispatchEventOnListenEvent(dispatcEventType, dispatchClbk, params, listeneridx[0], listeneridx[1]);

    // }

    /**
     * 
     * @param {Func | [Funcs]} eventCallbacks type of function_pointer OR array [function_pointers, ...]  
     * @param {Object} target  Target of type mesh. Target will pass as params to the 'eventCallback' function. 
     * @param {Func | [Funcs]} targetClbks Callbacks are to be used in the 'eventCallback', not necceseraly conected with the 'target'param.
     * @returns 
     */
    // CreateEvent(eventCallback = null, target = null, targetClbks = null) {
    CreateEvent(params = {}) {

        const eventIdx = this.eventCallbacks.Add(params);
        return eventIdx;
    }

    SetMenuOptionsClbk(ClbkFunction){
        this.MenuOptionsClbk = ClbkFunction;
    }

    /**
     * Setters-Getters
     */
    SetColor(col) { this.mat.SetColor(col, this.gfx) }
    SetDefaultColor() { this.mat.SetDefaultColor(this.gfx) }
    SetColorRGB(col) { this.mat.SetColorRGB(col, this.gfx) }
    SetColorAlpha(alpha) { this.mat.SetColor(alpha) }
    SetPos(pos) { this.geom.SetPos(pos, this.gfx); }
    SetPosXY(pos) { this.geom.SetPosXY(pos, this.gfx); }
    SetPosX(x) { this.geom.SetPosX(x, this.gfx); }
    SetDim(dim) { this.geom.SetDim(this.dim, this.gfx) }
    UpdateDim() { this.geom.UpdateDim(this.gfx) }
    SetAttrTime() {
        if (this.sid.attr & SID.ATTR.TIME) {
            this.geom.timer = TimerGetGlobalTimer();
            GlSetAttrTime(this.gfx, this.geom.timer);
        }
    }
    SetStyle(border, rCorners, feather) { this.mat.SetStyle(border, rCorners, feather); }
    Move(x, y) {

        this.geom.Move(x, y, this.gfx);

        // TODO: Maybe loop should be elsewhere??? For The text to be moved we need to calculate the chars offsets
        if (this.children.count)
            Recursive_mesh_move(this.children, x, y)
    }

    /** Helpers */
    #GetListenEventIdx(listenEventType) {

        for (let i = 0; i < this.listeners.count; i++) {

            const type = ListenersGetListenerType(this.listeners.buffer[i][0]);

            if (listenEventType === type)
                return this.listeners.buffer[i];


            return INT_NULL;
        }
    }

    FindIdInChildren(id){

        for(let i=0; i<this.children.count; i++){
            const child = this.children.buffer[i];
            if(id === child.id && child.StateCheck(MESH_STATE.HAS_HOVER)){
                return true;
            }
        }
        return false;
    }

    /** Debug */
    SetName() {
        this.name = GetMeshHighOrderNameFromType(this.type);
        this.name += ' id: ' + this.id;
    }

}


export class Text_Mesh extends Mesh {

    isFontSet;

    constructor(geom, mat) {

        super(geom, mat);
        this.isFontSet = false;

        this.type |= MESH_TYPES_DBG.TEXT_MESH;
    }

    AddToGraphicsBuffer(sceneIdx, useSpecificVertexBuffer = GL_VB.ANY, vertexBufferIdx = INT_NULL) {

        this.gfx = GlGetContext(this.sid, sceneIdx, useSpecificVertexBuffer, vertexBufferIdx);

        const prog = GlGetProgram(this.gfx.prog.idx);
        if (this.sid.unif & SID.UNIF.BUFFER_RES) {
            const unifBufferResIdx = prog.UniformsBufferCreateScreenRes();
            prog.UniformsSetBufferUniform(Viewport.width, unifBufferResIdx.resXidx);
            prog.UniformsSetBufferUniform(Viewport.height, unifBufferResIdx.resYidx);
        }

        this.geom.AddToGraphicsBuffer(this.sid, this.gfx, this.name);
        this.mat.AddToGraphicsBuffer(this.sid, this.gfx);

        return this.gfx;
    }

    UpdateText(_val) {

        const val = _val;

        const text = `${val}`;
        const geom = this.geom;
        const gfx = this.gfx;
        const mat = this.mat;

        let gfxInfo = new GfxInfoMesh(gfx);

        const textLen = text.length;
        const len = geom.numChars > textLen ? geom.numChars : (textLen > geom.numChars ? geom.numChars : textLen);

        // Update text faces
        for (let j = 0; j < len; j++) {

            let uvs = [0, 0, 0, 0];
            if (text[j] !== undefined) {
                uvs = FontGetUvCoords(mat.uvIdx, text[j]);
            }
            GlSetTex(gfxInfo, uvs);
            gfxInfo.vb.start += gfxInfo.vb.count
        }
    }

    CalcTextWidth() {
        let width = this.geom.CalcTextWidth();
        for (let i = 0; i < this.children.count; i++) {
            width += this.children.buffer[i].geom.CalcTextWidth();
        }
        return width;
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

export function Recursive_gfx_operations(_mesh, Clbk, clbkParams) {

    const children = _mesh.children;
    for (let i = 0; i < children.count; i++) {

        const mesh = children.buffer[i];
        if (mesh.children.count)
            Recursive_gfx_operations(mesh, Clbk, clbkParams)

        Clbk(mesh, clbkParams);
    }
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

        if (meshes.buffer[i].children.count) {
            Recursive_mesh_move(meshes.buffer[i].children, x, y)
        }

        const gfx = meshes.buffer[i].gfx;
        meshes.buffer[i].geom.Move(x, y, gfx);
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

// function Recursive_remove_from_graphics_buffer_fast(mesh) {

//     // this.geom.Remove_from_graphics_buffer_fast(this.gfx);
//     const children = mesh.children;

//     for (let i = 0; i < children.count; i++) {

//         if (children.buffer[i].children.count) {
//             Recursive_remove_from_graphics_buffer_fast(children.buffer[i].children, col)
//         }

//         const gfx = children.buffer[i].gfx;
//         children.buffer[i].mat.SetColor(col, gfx);
//     }
// }