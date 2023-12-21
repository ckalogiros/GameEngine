"use strict";
import { GlSetAttrTime } from "../../../../Graphics/Buffers/GlBufferOps.js";
import { Int8Buffer, M_Buffer } from "../../../Core/Buffers.js";
import { TimerGetGlobalTimer } from "../../../Timers/Timers.js";
import { Listener_create_child_event, Listener_create_event, Listener_remove_children_event_by_idx, Listener_remove_event_by_idx } from "../../../Events/EventListeners.js";
import { CopyArr4 } from "../../../../Helpers/Math/MathOperations.js";
import { Scenes_get_count, Scenes_update_all_gfx_starts, Scenes_get_root_meshes, Scenes_remove_mesh_from_gfx, Scenes_remove_root_mesh } from "../../../Scenes.js";
import { Gfx_remove_geometry } from "../../../Interfaces/Gfx/GfxContextCreate.js";
import { TimeIntervalsDestroyByIdx } from "../../../Timers/TimeIntervals.js";
import { Info_listener_dispatch_event } from "../../DebugInfo/InfoListeners.js";
import { Gl_set_vb_show } from "../../../../Graphics/GlProgram.js";
import { BatchStore } from "../../../Batch/Batch.js";



_cnt = 0x1;
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


let _meshId = 0;
export class Mesh {

    /**
     * // TODO: Organize all function callbacks to an object
     * // TODO: Organize all buffers to an object
     */


    // Bit masks and single values
    sid;        // BitField: Shader Identifier
    idx;        // Value: This is the index of the mesh in the scene's children buffer;
    type;       // A bit masked large integer to 'name' all different types of a mesh. 
    state;      // BitField: Bitfield integer. Stores enebled-dissabled mesh state. 
    hover_margin; // Value: A margin to be set for hovering. // TODO: Abstract to a struct.
    
    sceneidx; // Value: A reference to the scene that the mesh belongs to(index only).
    
    parent;     // Pointer: to the parent mesh.
    children;   // Buffer: of pointers to children mesh.
    
    geom;   // Class:
    mat;    // Class:
    gfx;    // Class
    
    is_gfx_inserted; // Bool: A way to tell if the mesh has been inserted to the graphics pipeline;
    
    attrParams1; // Array: A vec4 array which a mesh can pass any values the the shaders.
    uniforms;   // Struct: Some uniform values that need to be stored mesh-side
    
    listeners;      // Buffer: Indexes to the EventListeners class.
    eventCallbacks; // Buffer: A buffer to store all callbacks, for any event enabled for the mesh.
    timedEvents;    // Buffer: A buffer to set a one time event that is triggered by another event. E.x. When we need to set the mesh priority in the renderQueue and the mesh does not have a gfx yet. 
    timeIntervalsIdxBuffer; // Buffer: This buffer stores indexes of the timeIntervals this mesh is using.
    
    debug_info; // Struct: Debug_info_ui bit mask.
    minimized;      // Pointer: to a minimized version of the mesh.
    menu_options;   // Struct: A callback and an index. Constructs the options popup menu for the mesh
    menu_options_idx; //Value: An index to the menu options handler's buffer

    name; // String:

    constructor(geom = null, mat = null, time = 0, attrParams1 = [0, 0, 0, 0], name = '???') {

        this.geom = geom;
        this.mat = mat;

        this.sid = {
            shad: SID.SHAD.INDEXED | (this.geom.sid.shad | this.mat.sid.shad),
            attr: (this.geom.sid.attr | this.mat.sid.attr),
            unif: (this.mat.sid.unif) | SID.UNIF.PROJECTION, // Assuming we always have  a projection camera and a uniforms buffer. 
            pass: (this.geom.sid.pass | this.mat.sid.pass | SID.PASS.COL4),
            progs_group: PROGRAMS_GROUPS.DEFAULT.MASK, // To denote if the curent mesh is used for dubug, so it uses specific gfx buffers for debug ui rendering.
        };

        this.gfx = null;
        this.is_gfx_inserted = false;

        this.sceneidx = STATE.scene.active_idx;
        this.idx = INT_NULL;

        this.attrParams1 = [0, 0, 0, 0];
        if (attrParams1) CopyArr4(this.attrParams1, attrParams1);

        this.uniforms = {
            time: {
                val: 0,
                idx: INT_NULL,
            }
        }

        // Guard against enable a param for the shaders after the gl program has been created
        this.is_gfx_inserted = false;

        // Add the type 'Mesh'
        this.type = MESH_TYPES_DBG.MESH;
        this.state = { mask: 0x0 }; // Unfortunately js cannot create a pointer for integers, so we have to wrap the mask to a class;

        this.listeners = new M_Buffer();
        this.listeners.Init(LISTEN_EVENT_TYPES_INDEX.SIZE);

        this.eventCallbacks = new M_Buffer();
        this.timedEvents = new M_Buffer();
        this.children = new M_Buffer();
        this.timeIntervalsIdxBuffer = new Int8Buffer();


        this.hover_margin = [0, 0];

        this.menu_options_idx = INT_NULL;
        this.menu_options = {
            Clbk: null,
            idx: INT_NULL,
        };

        // this.debug_info_type = 0x0;
        this.debug_info = {
            type: 0x0, // Bit mask for distinguish the infoListener listening to that event type
            data: null, // Some storage for any kind of data
            evtidx: INT_NULL, // Stores the index of the events in the Info_Listeners buffer.
        };

        /** Debug  properties */
        if (DEBUG.MESH) {
            Object.defineProperty(this, 'id', { value: _meshId++ });
        }
    }

    SetSceneIdx(scene_idx) {

        if (scene_idx === INT_NULL || scene_idx >= Scenes_get_count()) alert('ERROR scene index.');
        this.sceneidx = scene_idx;
    }

    RemoveChildren() {

        const count = this.children.boundary;
        for (let i = 0; i < count; i++) {

            this.children.RemoveByIdx(i);
        }
    }

    RemoveChildByIdx(idx) {

        this.children.RemoveByIdx(idx);
    }

    Destroy() {

        // Remove event listeners
        this.RemoveAllListenEvents();

        // Remove time intervals
        if (this.timeIntervalsIdxBuffer.active_count) {

            for (let i = 0; i < this.timeIntervalsIdxBuffer.boundary; i++) {

                const intervalIdx = this.timeIntervalsIdxBuffer.buffer[i];
                TimeIntervalsDestroyByIdx(intervalIdx);
                this.timeIntervalsIdxBuffer.RemoveByIdx(i);
            }
        }

        // Remove from gfx buffers.
        const ret = Gfx_remove_geometry(this.gfx, this.geom.num_faces)
        // Remove from scene
        Scenes_update_all_gfx_starts(this.sceneidx, this.gfx.prog.groupidx, this.gfx.prog.idx, this.gfx.vb.idx, ret); // Update the gfx.start of all meshes that are inserted in the same vertex buffer.
        Scenes_remove_root_mesh(this, this.sceneidx);
        // console.log('Destroy mesh:', this.name)
        const error = Scenes_remove_mesh_from_gfx(this.sceneidx, this.gfx.prog.groupidx, this.gfx.prog.idx, this.gfx.vb.idx, this.gfx.scene_mesh_in_gfx_idx); // Remove mesh from the scene's gfx buffer
        if (error) { console.error('ERROR REMOVING MESH: ', this.name); }

        if (this.parent) this.parent.RemoveChildByIdx(this.idx); // Remove the current mesh from the parent

        const params = {
            progidx: this.gfx.prog.idx,
            vbidx: this.gfx.vb.idx,
            sceneidx: this.sceneidx,
            isActive: true,
            isPrivate: (FLAGS & GFX_CTX_FLAGS.PRIVATE) ? true : false,
            type: INFO_LISTEN_EVENT_TYPE.GFX.UPDATE_VB,
        }
        Info_listener_dispatch_event(INFO_LISTEN_EVENT_TYPE.GFX.UPDATE, params);

    }


    /*******************************************************************************************************************************************************/
    // Graphics

    /**DO NOT DELETE */
    // DeactivateGfx() {

    //     Gfx_deactivate(this.gfx);
    //     this.is_gfx_inserted = false;

    //     Scenes_remove_mesh_from_gfx(this.sceneidx, this.gfx.prog.idx, this.gfx.vb.idx, this.gfx.scene_mesh_in_gfx_idx);

    //     const params = {
    //         progidx: this.gfx.prog.idx,
    //         vbidx: this.gfx.vb.idx,
    //         sceneidx: this.sceneidx,
    //         isActive: true,
    //         isPrivate: (FLAGS & GFX_CTX_FLAGS.PRIVATE) ? true : false,
    //         type: INFO_LISTEN_EVENT_TYPE.GFX.UPDATE_VB,
    //     }
    //     Info_listener_dispatch_event(INFO_LISTEN_EVENT_TYPE.GFX.UPDATE, params);
    // }

    Set_graphics_vertex_buffer_render(flag) {

        Gl_set_vb_show(this.gfx.prog.groupidx, this.gfx.prog.idx, this.gfx.vb.idx, flag);
        if (flag) this.StateEnable(MESH_STATE.IS_HOVERABLE);
        else this.StateDisable(MESH_STATE.IS_HOVERABLE);
    }

    /*******************************************************************************************************************************************************/
    /* Mesh State.
     * Enable, disable, etc, mesh states.
     * E.x. enable mesh to be movable or to have a popup menu when right clicked...
     */
    StateEnable(bit) { this.state.mask |= bit; }
    StateDisable(bit) { this.state.mask &= ~bit; }
    StateToggle(bit) { this.state.mask ^= bit; }
    StateCheck(bit) { return this.state.mask & bit; }

    /*******************************************************************************************************************************************************/
    // Listeners

    CreateListenEvent(etype, is_fake_event = false) {

        if (etype & LISTEN_EVENT_TYPES.HOVER) {

            this.listeners.AddAtIndex(LISTEN_EVENT_TYPES_INDEX.HOVER, {
                evt: null,
                is_child_event: false,
            });
            this.StateEnable(MESH_STATE.IS_HOVERABLE | MESH_STATE.IS_HOVER_COLORABLE);
            if (is_fake_event) this.StateEnable(MESH_STATE.IS_FAKE_EVENT | MESH_STATE.IS_FAKE_HOVERABLE);
        }
        else if (etype & LISTEN_EVENT_TYPES.CLICK_UP) {

            this.listeners.AddAtIndex(LISTEN_EVENT_TYPES_INDEX.CLICK, {
                evt: null,
                is_child_event: false,
            });
            this.StateEnable(MESH_STATE.IS_CLICKABLE);
            if (is_fake_event) this.StateEnable(MESH_STATE.IS_FAKE_EVENT | MESH_STATE.IS_FAKE_CLICKABLE);
        }
        else if (etype & LISTEN_EVENT_TYPES.MOVE) {

            this.listeners.AddAtIndex(LISTEN_EVENT_TYPES_INDEX.CLICK, {
                evt: null,
                is_child_event: false,
            });
            this.StateEnable(MESH_STATE.IS_GRABABLE | MESH_STATE.IS_MOVABLE | MESH_STATE.IS_CLICKABLE);
            if (is_fake_event) this.StateEnable(MESH_STATE.IS_FAKE_EVENT | MESH_STATE.IS_FAKE_CLICKABLE);
        }

    }

    AddListenEvent(etypeidx, Clbk = null, params = null, parent_event = null) {

        if (!this.listeners.buffer[etypeidx])
            console.error('NO LISTENER IN this.listeners.buffer[etypeidx]')
        if (parent_event && parent_event[etypeidx] && parent_event[etypeidx].evt) {
            this.listeners.buffer[etypeidx].evt = Listener_create_child_event(etypeidx, parent_event[etypeidx].evt, Clbk, this, params);
            this.listeners.buffer[etypeidx].is_child_event = true;
        }
        else {
            this.listeners.buffer[etypeidx].evt = Listener_create_event(etypeidx, Clbk, this, params);
        }
    }

    RemoveAllListenEvents() {
        /**
         * // TODO!!
         * The if's maybe better implemented in EventListeners class RemoveEvent()???
         */
        for (let etype = 0; etype < this.listeners.boundary; etype++) {

            if (this.listeners.buffer[etype] && this.listeners.buffer[etype].evt) {
                if (!this.listeners.buffer[etype].is_child_event) {

                    Listener_remove_event_by_idx(etype, this.listeners.buffer[etype].evt);
                }
                else {
                    Listener_remove_children_event_by_idx(etype, this.listeners.buffer[etype].evt);
                }
            }
        }
    }

    CreateEventCallback(params = null) {

        if (!params) alert('CreateEventCallback(params = null). @ Mesh.js')
        const eventIdx = this.eventCallbacks.Add(params);
        return eventIdx;
    }


    /*******************************************************************************************************************************************************
     * Set mesh's menu options (on left mouse click).
     * If the callback that will create the menu options for this mesh
     * is set and the 'MESH_STATE.HAS_POPUP' is enabled, then this mesh has options menu.
     * 
     * @param {*} ClbkFunction The function to call for contructing the menu options of 'this' mesh.
     */
    SetMenuOptionsClbk(ClbkFunction) {

        this.menu_options.Clbk = ClbkFunction;
    }

    /*******************************************************************************************************************************************************/
    // Setters-Getters                                            // Function Calls 'number of calls':'in number of files'
    SetHoverColor()         { this.mat.SetHoverColor(this.gfx); } //5:3
    SetColor(col)           { this.mat.SetColor(col, this.gfx); } //16:11
    SeHoverColortDefault()  { this.mat.SeHoverColortDefault(this.gfx); } //4:3
    SetDefaultColor()       { this.mat.SetDefaultColor(this.gfx, this.geom.num_faces); }//5:3
    SetDefaultPosXY()       { alert('SetDefaultPosXY'); this.geom.SetDefaultPosXY(this.gfx); }//3:2
    SetColorRGB(col)        { this.mat.SetColorRGB(col, this.gfx, this.geom.num_faces); }//14:7
    SetColorAlpha(alpha)    { this.mat.SetColorAlpha(alpha, this.gfx, this.geom.num_faces); }//27:8
    SetPosXYZ(pos)          { alert('SetPosXYZ');this.geom.SetPosXYZ(pos, this.gfx); }//5:3
    SetPosXY(pos)           { alert('SetPosXY');this.geom.SetPosXY(pos, this.gfx); }//14:8
    SetPosX(x)              { alert('SetPosX');this.geom.SetPosX(x, this.gfx); }//18:7
    SetPosY(y)              { alert('SetPosY');this.geom.SetPosY(y, this.gfx); }//16:5
    SetDim(dim)             { alert('SetDim');this.geom.SetDim(dim, this.gfx); }//10:7
    UpdatePosXY()           { alert('UpdatePosXY');this.geom.UpdatePosXY(this.gfx); }//7:4
    UpdatePosXYZ()          { alert('UpdatePosXYZ');this.geom.UpdatePosXYZ(this.gfx); }//5:4
    UpdateDim()             { this.geom.UpdateDim(this.gfx); }//8:5
    UpdateZindex(z)         { this.geom.SetZindex(z, this.gfx); }//
    SetStyle(style)         { this.mat.SetStyle(style); }//19:10
    MoveXY(x, y)            { 
        // this.geom.pos[0] += x;
        // this.geom.pos[1] += y;
        BatchStore(this, 'MoveXY', [x,y]); 
    }//42:10 from which 33 calls are directly to geom.MoveXY
    MoveXYZ(pos)            { 
        // this.geom.pos[0] += pos[0];
        // this.geom.pos[1] += pos[1];
        BatchStore(this, 'MoveXY', pos); 
    }//20:8
    SetAttrTime() {
        if (this.sid.attr & SID.ATTR.TIME) {
            this.geom.timer = TimerGetGlobalTimer();
            GlSetAttrTime(this.gfx, this.geom.timer);
        }
    }

    FindIdInChildren(id) {

        for (let i = 0; i < this.children.boundary; i++) {
            const child = this.children.buffer[i];
            if (child && id === child.id && child.StateCheck(MESH_STATE.IS_HOVERABLE)) {
                return true;
            }
        }
        return false;
    }

    /*******************************************************************************************************************************************************
     * Enable shader properties.
     * In order for a mesh to be drawn in a certain way, specific shaders must be build.
     * Allow the shader constructor to combine different shader by enabling* meshes 'sid' bit field. 
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

    OnFakeClick() { console.log('FAKE CLICK! : ', this.source_params.name); }

    /*******************************************************************************************************************************************************/
    // Debug
    SetName(name = null) {

        // if(name) this.name = name + this.id;
        if (name !== '' && name) this.name = name + ' id:' + this.id;
        else {
            this.name = GetMeshHighOrderNameFromType(this.type);
            this.name += ' id: ' + this.id;
        }
    }
}


export function Recursive_gfx_operations(_mesh, Clbk, params) {

    const children = _mesh.children;
    for (let i = 0; i < children.boundary; i++) {

        const mesh = children.buffer[i];
        if (mesh.children.active_count)
            Recursive_gfx_operations(mesh, Clbk, params)

        Clbk(mesh, params);
    }
}


/******************************************************************************************************************************************************/
// DEBUG PRINT
export function Mesh_print_all_mesh_listeners() {

    const children = Scenes_get_root_meshes(STATE.scene.active_idx);

    if (children) Mesh_print_all_mesh_listeners_recursive(children);
}

function Mesh_print_all_mesh_listeners_recursive(meshes) {

    for (let i = 0; i < meshes.boundary; i++) {

        const mesh = meshes.buffer[i];
        if (mesh) {

            if (mesh.children)
                Mesh_print_all_mesh_listeners_recursive(mesh.children);

            // if (mesh.listeners.buffer[0].idx !== INT_NULL || mesh.listeners.buffer[1].idx !== INT_NULL)
            if (mesh.listeners.buffer)
                console.log(`id:${mesh.id} name:${mesh.name} boundary:${mesh.listeners.boundary}`, mesh.listeners.buffer);
        }
    }
}


