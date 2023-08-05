"use strict";
import { GlSetAttrTime } from "../../Graphics/Buffers/GlBufferOps.js";
import { GlGetContext } from "../../Graphics/Buffers/GlBuffers.js";
import { GlGetProgram } from "../../Graphics/GlProgram.js";
import { Int8Buffer, M_Buffer } from "../Core/Buffers.js";
import { FontGetFontDimRatio } from "../Loaders/Font/Font.js";
import { TimerGetGlobalTimer } from "../Timer/Timer.js";
import { EventListener, ListenerCreateDispatchEvent, ListenerCreateListenEvent, Listener_listen_mouse_hover, ListenersGetListener, ListenersGetListenerType } from "../Events/EventListeners.js";



const MAX_EVENT_FUNCTIONS_BUFFER_SIZE = 16; // TODO: Set max from global enum object of EVENTS_...
const MAX_LISTENERS_BUFFER_SIZE = 16; // TODO: Set max from global enum object of EVENTS_...

let _cnt = 1;
export const MESH_ENABLE = {
    UNIF_RESOLUTION: _cnt++,
    UNIF_TIMER: _cnt++,
    ATTR_TIME: _cnt++,
    ATTR_STYLE: _cnt++,

    // Pass from vertex to fragment shader
    PASS_COL4: _cnt++,
    PASS_WPOS2: _cnt++,
    PASS_DIM2: _cnt++,
    PASS_TIME1: _cnt++,
    PASS_RES2: _cnt++,

    NONE: 0,
}

_cnt = 0;
const LISTENER_EVENT_FUNCS_INDEXES = {
    SCALE_ANIMATION: _cnt++,
    DIM_COLOR_ANIMATION: _cnt++,
};

_cnt = 0x1;
const MESH_STATE = {
    IN_HOVER: _cnt <<= 1,
    IN_SCALE: _cnt <<= 1,
};

class BitMask {

    mask;

    constructor() {

        this.mask = 1 | 0;
    }

    set(channel) { this.mask = (1 << channel | 0) >>> 0; }
    enable(channel) { this.mask |= 1 << channel | 0; }
    enableAll() { this.mask = 0xffffffff | 0; }
    toggle(channel) { this.mask ^= 1 << channel | 0; }
    disable(channel) { this.mask &= ~(1 << channel | 0); }
    disableAll() { this.mask = 0; }
    test(layers) { return (this.mask & layers.mask) !== 0; }
    isEnabled(channel) { return (this.mask & (1 << channel | 0)) !== 0; }

}

class MeshState {
    inHover = false;
    inScale = false;
}

let _meshId = 0;
export class Mesh {

    sid;
    geom;
    mat;
    time;
    attrParams1;
    gfx;
    uniforms;
    shaderParams;
    type; // A bit masked large integer to 'name' all different types of a mesh. 
    listeners; // Indexes to the EventListeners class.
    children;
    state; // Mesh info state. TODO: An enum of bit-masks as booleans.

    constructor(geom = null, mat = null, time = 0, attrParams1 = [0, 0, 0, 0], name = '???') {

        this.geom = geom;
        this.mat = mat;

        this.sid = {
            shad: SID.SHAD.INDEXED,
            attr: (this.geom.sid.attr | this.mat.sid.attr),
            unif: (this.mat.sid.unif) | SID.UNIF.PROJECTION, // Assuming we always have  a projection camera and a uniforms buffer. 
            pass: (this.geom.sid.pass | this.mat.sid.pass | SID.PASS.COL4),
        };

        this.attrParams1 = [0, 0, 0, 0];
        this.sdfParams = [0, 0];
        this.gfx = null;

        if (time) this.time = time;

        if (attrParams1) { // TODO: Better to create an array of length of the input param length 
            let i = 0;
            while (attrParams1[i]) {
                this.attrParams1[i] = attrParams1[i];
                i++;
            }
        }

        this.uniforms = {
            time: {
                val: 0,
                idx: INT_NULL,
            }
        }

        // Guard against enable a param for the shaders after the gl program has been created
        this.alreadyAdded = false;

        // Add the type 'Mesh'
        this.type |= MESH_TYPES.MESH;

        this.listeners = {

            size: MAX_LISTENERS_BUFFER_SIZE,
            count: 0,
            buffer: [],

            Add(arr) {

                if (this.count >= this.size) alert('Int8Buffer Buffer Needs To Grow. @ Buffers.js')

                const idx = this.count;
                this.buffer[idx][0] = arr[0];
                this.buffer[idx][1] = arr[1];
                this.count++;
            }
        };
        for (let i = 0; i < this.listeners.size; i++) {
            this.listeners.buffer[i] = [INT_NULL, INT_NULL]
        }

        this.children = new M_Buffer();
        this.children.Init(1); // Needs to be at least 1 because

        this.state = {
            inHover: false,
            inScale: false,
            inDimColor: false,
            inBrightColor: false,
        };


        /** Debug  properties */
        if (DEBUG.MESH) {
            Object.defineProperty(this, 'id', { value: _meshId++ });
        }
    }

    AddChild(mesh) {

        this.children.Add(mesh);
    }

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * GRAPHICS
     */
    AddToGraphicsBuffer(sceneIdx) {
        this.gfx = GlGetContext(this.sid, sceneIdx, GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);

        const prog = GlGetProgram(this.gfx.prog.idx);
        if (this.sid.unif & SID.UNIF.BUFFER_RES) {
            const unifBufferResIdx = prog.UniformsBufferCreateScreenRes();
            prog.UniformsSetBufferUniform(Viewport.width, unifBufferResIdx.resXidx);
            prog.UniformsSetBufferUniform(Viewport.height, unifBufferResIdx.resYidx);
        }

        // Set Texture
        if (this.mat.texId !== INT_NULL) { // texId is init with INT_NULL that means there is no texture passed to the Material constructor.

            if (this.mat.hasFontTex) {
                this.isFontSet = true;
                // Correct the geometry height.
                this.geom.dim[1] *= FontGetFontDimRatio(this.mat.uvIdx);
            }
        }

        this.geom.AddToGraphicsBuffer(this.sid, this.gfx, this.name);
        this.mat.AddToGraphicsBuffer(this.sid, this.gfx);
        return this.gfx;
    }


    /**
     * Setters-Getters
     */
    SetColor(col) {
        this.mat.SetColor(col, this.gfx)
    }
    SetColorAlpha(alpha) {
        this.mat.SetColor(alpha)
    }
    SetPos(pos) {
        this.geom.SetPos(pos, this.gfx)
    }
    SetDim(dim) {
        this.geom.SetDim(this.dim, this.gfx)
    }
    UpdateDim() {
        this.geom.UpdateDim(this.gfx)
    }
    SetAttrTime() {
        if (this.sid.attr & SID.ATTR.TIME) {
            this.geom.timer = TimerGetGlobalTimer();
            GlSetAttrTime(this.gfx, this.geom.timer);
        }
    }
    SetStyle(border, rCorners, feather) {
        this.mat.SetStyle(border, rCorners, feather);
    }

    /**
     * Enable shader properties
     */

    Enable(which, params) {

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
            case MESH_ENABLE.UNIF_RESOLUTION: {
                this.sid.unif |= SID.UNIF.BUFFER_RES | SID.UNIF.U_BUFFER; // Enable the screen resolution to be contructed as a uniform in the vertex shader, to be used in the fragment shader.
                break;
            }
            case MESH_ENABLE.ATTR_STYLE: {
                this.sid.attr |= (SID.ATTR.BORDER | SID.ATTR.R_CORNERS | SID.ATTR.FEATHER) | SID.ATTR.PARAMS1 | SID.ATTR.EMPTY;
                this.sid.unif |= SID.UNIF.U_BUFFER;
                this.sid.pass |= SID.PASS.WPOS2 | SID.PASS.DIM2;
                if (!(params === null || params === undefined)) {
                    this.mat.style = params.style;
                }

                this.sid.unif |= SID.UNIF.BUFFER_RES | SID.UNIF.U_BUFFER;
                break;
            }
            case MESH_ENABLE.ATTR_TIME: {
                this.sid.attr |= SID.ATTR.TIME;
                break;
            }

            case MESH_ENABLE.PASS_COL4: { this.sid.pass |= SID.PASS.COL4; break; }
            case MESH_ENABLE.PASS_WPOS2: { this.sid.pass |= SID.PASS.WPOS2; break; }
            case MESH_ENABLE.PASS_DIM2: { this.sid.pass |= SID.PASS.DIM2; break; }
            case MESH_ENABLE.PASS_RES2: { this.sid.pass |= SID.PASS.RES2; break; }
            case MESH_ENABLE.PASS_TIME1: { this.sid.pass |= SID.PASS.TIME1; break; }

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

        const params = {
            pos: [this.geom.pos[0], this.geom.pos[1]],
            dim: this.geom.dim,
            state: this.state,
            col: this.mat.col,
        };
        const idx = ListenerCreateListenEvent(evttype, params);
        this.listeners.Add(idx);
    }

    CreateDispatchEvent(listenEventType, dispatcEventType, dispatchClbk) {

        // Check if the specific listen event type allready enabled for this mesh.
        const listeneridx = this.#GetListenEventIdx(listenEventType);
        const params = this;

        /* TODO: Must store the dispatcher index??? */
        const dispatcherIdx = ListenerCreateDispatchEvent(dispatcEventType, dispatchClbk, params, listeneridx[0], listeneridx[1]);
    }

    /** Helepers */
    #GetListenEventIdx(listenEventType) {

        for (let i = 0; i < this.listeners.count; i++) {

            const type = ListenersGetListenerType(this.listeners.buffer[i][0]);

            if (listenEventType === type)
                return this.listeners.buffer[i];


            return INT_NULL;
        }
    }

}


export class Text_Mesh extends Mesh {

    sdfParams;
    isFontSet;

    constructor(geom, mat) {

        super(geom, mat);
        this.isFontSet = false;

        this.type |= MESH_TYPES.TEXT_MESH;
    }

    AddToGraphicsBuffer(sceneIdx) {
        this.gfx = GlGetContext(this.sid, sceneIdx, GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);

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

    MoveXY(pos) {
        this.geom.MoveXY(pos, this.gfx)
        // for(let i=0; i<this.geom.numChars; i++){
        //     this.geom.SetPos(pos, this.gfx)
        // }
    }
    // UseFont(fontIdx) {
    //     // Prevent replacing an existing loaded font texture.
    //     // Currently onlyy one texture per vertex buffer is allowed
    //     // TODO: Later implement multi texture for a vertexBuffer
    //     if (this.fontIdx === INT_NULL) this.fontIdx = fontIdx;
    // }
}

/**
 * TODO: Implement Grouping meshes from indices buffer for efficient gl vertexBuffer rendering
 */
class MeshGroup {
    parent;
    children;
    constructor(parent = null, childrer = null) {
        this.parent = parent;
    }
    addChild(object) {
        this.children.push(object);
    }
}
