"use strict";
import { GlSetAttrTime, GlSetTex } from "../../../../Graphics/Buffers/GlBufferOps.js";
import { GlGetContext } from "../../../../Graphics/Buffers/GlBuffers.js";
import { GfxInfoMesh, GlGetProgram } from "../../../../Graphics/GlProgram.js";
import { Int8Buffer, M_Buffer } from "../../../Core/Buffers.js";
import { FontGetFontDimRatio, FontGetUvCoords } from "../../../Loaders/Font/Font.js";
import { TimerGetGlobalTimer } from "../../../Timers/Timers.js";
import { ListenerCreateDispatchEventOnListenEvent, ListenerCreateListenEvent, ListenersGetListenerType } from "../../../Events/EventListeners.js";



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

    sid;
    idx; // This is the index of the mesh in the scene's children buffer;
    geom;
    mat;
    time;
    attrParams1;
    gfx;
    uniforms;
    shaderParams;
    type; // A bit masked large integer to 'name' all different types of a mesh. 
    listeners; // Indexes to the EventListeners class.
    eventCallbacks; // A buffer to store all callback for any event enabled for the mesh.
    children;
    state; // Mesh info state. TODO: An enum of bit-masks as booleans.
    state2;
    timeIntervalsIdxBuffer; // This buffer stores indexes of the timeIntervals this mesh is using.
    timedEvents; // A buffer to set a one time event that is triggered by another event. E.x. When we need to set the mesh priority in the renderQueue and the mesh does not have a gfx yet. 
    hoverMargin; // A margion to be set for hovering. TODO: Abstract to a struct.

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

        this.eventCallbacks = new M_Buffer();
        this.eventCallbacks.Init(4);

        this.timedEvents = new M_Buffer();
        this.timedEvents.Init(2);

        this.children = new M_Buffer();
        this.timeIntervalsIdxBuffer = new Int8Buffer();
        // this.children.Init(1); // Needs to be at least 1 because

        this.state = {
            inHover: false,
            inScale: false,
            inDimColor: false,
            inBrightColor: false,
        };

        // this.state2 = new Bit_Mask(); // Unfortunately js cannot create a pointer for inegers, so we have to wrap the mask to a class;
        this.state2 = { mask: 0 }; // Unfortunately js cannot create a pointer for inegers, so we have to wrap the mask to a class;

        this.hoverMargin = 0;

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

        let mesh = this;

        mesh.gfx = GlGetContext(mesh.sid, sceneIdx, GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);

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
        this.geom.SetPos(pos, this.gfx);
    }
    SetPosX(x) {
        this.geom.SetPosX(x, this.gfx);
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
    Move(x, y) {

        this.geom.Move(x, y, this.gfx);

        // TODO: Maybe loop should be elsewhere??? For The text to be moved we need to calculate the chars offsets
        if (this.children.count) {

            Recursive_move_mesh(this.children, x, y)
        }
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

        const params = this;
        const idx = ListenerCreateListenEvent(evttype, params);
        this.listeners.Add(idx); // Store the index of the created listener in listeners buffer
    }

    CreateDispatchEventOnListenEvent(listenEventType, dispatcEventType, dispatchClbk) {

        // Check if the specific listen event type allready enabled for this mesh.
        const listeneridx = this.#GetListenEventIdx(listenEventType);
        const params = this;

        /* TODO: Must store the dispatcher index??? */
        const dispatcherIdx = ListenerCreateDispatchEventOnListenEvent(dispatcEventType, dispatchClbk, params, listeneridx[0], listeneridx[1]);
    }
    /**
     * @param {*} eventCallbacks type of function_pointer OR array [function_pointers, ...] 
     * Store the callbacks to call  in a buffer.
     */
    CreateEvent(eventCallback = null, _params = null) {

        if(Array.isArray(eventCallback)){

            const len = eventCallback.length;
            for(let i=0; i<len; i++){

                const params = {
                    Clbk: eventCallback[i],
                    params: _params,
                };
                const eventIdx = this.eventCallbacks.Add(params);
                return eventIdx;
            }
        }
        else{

            const params = {
                Clbk: eventCallback,
                params: _params,
            };
            const eventIdx = this.eventCallbacks.Add(params);
            return eventIdx;
        }
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

    /** Debug */
    SetName(){
        this.name = GetMeshNameFromType(this.type);
        this.name += ' id: ' + this.id;
    }

}

/** Helper Recursive Functions */
function Recursive_move_mesh(mesh, x, y){

    const meshes = mesh;
    
    for (let i = 0; i < meshes.count; i++) {

        if(meshes.buffer[i].children.count){
            Recursive_move_mesh(meshes.buffer[i].children, x, y)
        }

        const gfx = meshes.buffer[i].gfx;
        meshes.buffer[i].geom.Move(x, y, gfx);
    }
}
export function Geometry2D_set_posx(params){

    const mesh = params.mesh;
    const x = params.x;
    const gfx = mesh.gfx;

    mesh.Move(x, 0)

    // Recursive_mesh_set_pos_x(mesh);
    // mesh.SetPosX(x, gfx)
    // mesh.geom.SetPosX(x, gfx)
}
function Recursive_mesh_set_pos_x(mesh, x){

    const children = mesh.children;
    
    for (let i = 0; i < children.count; i++) {

        if(children.buffer[i].children.count){
            Recursive_mesh_set_pos_x(children.buffer[i].children, x)
        }

        const gfx = children.buffer[i].gfx;
        children.buffer[i].geom.SetPosX(x, gfx);
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

    UpdateText(_val){

        // if (!Array.isArray(params.params.meshes)) alert('Array must be passed as param.meshes to TimeInterval instantiation.')

		// const meshes = params.params.meshes;
		// const mesheslen = meshes.length

		// for (let i = 0; i < mesheslen; i++) {

			const val = _val;

			const text = `${val}`;
			const geom = this.geom;
			const gfx  = this.gfx;
			const mat  = this.mat;

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
		// }
    }

    SetPosX(x){
        // this.
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
