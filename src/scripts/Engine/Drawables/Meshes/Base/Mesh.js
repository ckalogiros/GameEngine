"use strict";
import { GlSetAttrTime } from "../../../../Graphics/Buffers/GlBufferOps.js";
import { Int8Buffer, Int8Buffer2, M_Buffer } from "../../../Core/Buffers.js";
import { TimerGetGlobalTimer } from "../../../Timers/Timers.js";
import { Listener_create_child_event, Listener_create_event, Listener_events_set_mesh_events_active, Listener_remove_event_by_idx, Listener_set_event_active_by_idx } from "../../../Events/EventListeners.js";
import { CopyArr4 } from "../../../../Helpers/Math/MathOperations.js";
import { Scenes_get_count, Scenes_update_all_gfx_starts, Scenes_get_root_meshes, Scenes_remove_mesh_from_gfx, Scenes_remove_root_mesh } from "../../../Scenes.js";
import { Gfx_deactivate, Gfx_deactivate_recursive, Gfx_remove_geometry } from "../../../Interfaces/Gfx/GfxContext.js";
import { TimeIntervalsDestroyByIdx } from "../../../Timers/TimeIntervals.js";
import { Gfx_set_vb_show } from "../../../Interfaces/Gfx/GfxInterfaceFunctions.js";
import { Info_listener_dispatch_event } from "../../DebugInfo/InfoListeners.js";



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
    is_gfx_inserted; // A way to tell if the mesh has been inserted to the graphics pipeline;
    uniforms;
    sceneidx; // A reference to the scene that the mesh belongs to(index only).
    type; // A bit masked large integer to 'name' all different types of a mesh. 
    listeners; // Indexes to the EventListeners class.
    eventCallbacks; // A buffer to store all callback for any event enabled for the mesh.
    parent; // Pointer to the parent mesh.
    children; // buffer of pointers to children mesh.
    state;  // Bitfield integer. Stores enebled-dissabled mesh state. 
    timeIntervalsIdxBuffer; // This buffer stores indexes of the timeIntervals this mesh is using.
    timedEvents; // A buffer to set a one time event that is triggered by another event. E.x. When we need to set the mesh priority in the renderQueue and the mesh does not have a gfx yet. 
    hover_margin; // A margin to be set for hovering. TODO: Abstract to a struct.
    menu_options; // A callback and an index. Constructs the options popup menu for the mesh
    menu_options_idx; // An index to the menu options handler's buffer
    minimized; // Pointer to a minimized version of the mesh.
    name;
    debug_info; // Debug_info_ui data.


    /**
        gfx: {
            sid,
            gfx,
            attr_params1
            uniforms
        }

        bools:{
            is_gfx_inserted,

        }

        scene:{
            idx,
            sceneidx,

        }
        children:[]
        listeners:[]
        eventCallbacks:[]
        timeIntervalsIdxBuffer:[]
        timedEvents:[]

        type; // A bit masked large integer to 'name' all different types of a mesh. 
        state;  // Bitfield integer. Stores enebled-dissabled mesh state. 
     
        geom;
        mat;

        time;
        parent; // Pointer to the parent mesh.
        hover_margin; // A margin to be set for hovering. TODO: Abstract to a struct.
        menu_options; // A callback and an index. Constructs the options popup menu for the mesh
        menu_options_idx; // An index to the menu options handler's buffer
        minimized; // Pointer to a minimized version of the mesh.
        debug_info; // Debug_info_ui data.
        name;
     */

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
        this.is_gfx_inserted = false;

        this.sceneidx = STATE.scene.active_idx;

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
        this.state = { mask: 0 }; // Unfortunately js cannot create a pointer for integers, so we have to wrap the mask to a class;

        // this.listeners = new Int8Buffer2();
        // this.listeners.Init(LISTEN_EVENT_TYPES_INDEX.SIZE, INT_NULL);
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
        Scenes_update_all_gfx_starts(this.sceneidx, this.gfx.prog.idx, this.gfx.vb.idx, ret); // Update the gfx.start of all meshes that are inserted in the same vertex buffer.
        Scenes_remove_root_mesh(this, this.sceneidx);
        const error = Scenes_remove_mesh_from_gfx(this.sceneidx, this.gfx.prog.idx, this.gfx.vb.idx, this.gfx.scene_gfx_mesh_idx); // Remove mesh from the scene's gfx buffer
        if (error) { console.error('ERROR REMOVING MESH: ', this.name); }

        if (this.parent) this.parent.RemoveChildByIdx(this.idx); // Remove the current mesh from the parent

        const params = {
            progidx: this.gfx.prog.idx,
            vbidx: this.gfx.vb.idx,
            sceneidx: this.sceneidx,
            isActive: true,
            isPrivate: (FLAGS & GFX.PRIVATE) ? true : false,
            type: INFO_LISTEN_EVENT_TYPE.GFX.UPDATE_VB,
        }
        Info_listener_dispatch_event(INFO_LISTEN_EVENT_TYPE.GFX.UPDATE, params);

    }

    // RecursiveDestroy() {

    //     /**
    //      * Currently destroys the 'this' mesh, all of its listeners and the liste_hover event.
    //      * Continues call destroy of any child recursively with the same destruction options.
    //      * 
    //      * TODO!!! Implement:
    //      * 1.   If the curent mesh belongs to a Private vertex buffer, 
    //      *          we should implement to destroy the vertex buffer to.
    //      * 2.   Definetly we need an implementation of removing vertices from the gfx buffers.
    //      *      One way would be to keep track of all the free attributes of a vertex buffer
    //      *      and add to that free space when it is fit. Also we need a kind of combining
    //      *      overlaping free space implementation
    //      */

    //     Mesh_recursive_destroy(this);

    //     if (DEBUG.GFX.REMOVE_MESH) console.log('Remove Parrent:', this.name)

    //     const ret = Gl_remove_geometry(this.gfx, this.geom.num_faces)

    //     Scenes_update_all_gfx_starts(this.sceneidx, this.gfx.prog.idx, this.gfx.vb.idx, ret);

    //     // Remove event listeners
    //     this.RemoveAllListenEvents();

    //     // Remove any time intervalse
    //     if (this.timeIntervalsIdxBuffer.active_count) {

    //         const intervalIdx = this.timeIntervalsIdxBuffer.buffer[0];// TODO!!!: HACK We need a way to know what interval is what, in the 'timeIntervalsIdxBuffer' in a mesh. 
    //         TimeIntervalsDestroyByIdx(intervalIdx);
    //         this.timeIntervalsIdxBuffer.RemoveByIdx(0); // HACK
    //     }

    //     /** Case the mesh has parent, remove this mesh from the parent */
    //     if (this.parent && (this.parent.type & MESH_TYPES_DBG.SCENE) === 0) {
    //         this.parent.RemoveChildByIdx(this.idx)
    //         return FLAGS.DESTROY;
    //     }

    //     /* Case the mesh is child of the scene.
    //      * Remove all listen events for the mesh
    //      * and remove the mesh from the scene
    //      */
    //     // Remove from scene's mesh buffer
    //     const scene = Scenes_get_scene_by_idx(this.sceneidx);
    //     ERROR_NULL(scene);
    //     scene.RemoveMesh(this);

    //     return FLAGS.DESTROY;
    // }

    // /**
    //  * Destroy a mesh and all of its children.
    //  * Also if the graphics buffers are private use, reset and deactivate them.  
    //  */
    // DestroyPrivateGfxRecursive() {

    //     const progidx = this.gfx.prog.idx;
    //     const vbidx = this.gfx.vb.idx;
    //     /**DEBUG*/ if (!Gfx_is_private_vb(progidx, vbidx)) alert('Mesh has Not private gfx buffers. @DestroyPrivateGfxRecursive()')

    //     // Reset gfx buffers
    //     Gfx_deactivate_recursive(this);

    //     Mesh_destroy_private_recursive(this);

    //     // Remove event listeners
    //     this.RemoveAllListenEvents();

    //     // Remove any time intervals
    //     if (this.timeIntervalsIdxBuffer.active_count) {

    //         const intervalIdx = this.timeIntervalsIdxBuffer.buffer[0];// TODO!!!: HACK We need a way to know what interval is what, in the 'timeIntervalsIdxBuffer' in a mesh. 
    //         TimeIntervalsDestroyByIdx(intervalIdx);
    //         this.timeIntervalsIdxBuffer.RemoveByIdx(0); // HACK
    //     }

    //     /** Case the mesh has parent, remove the this mesh from the parent */
    //     if (this.parent && (this.parent.type & MESH_TYPES_DBG.SCENE) === 0) {
    //         this.parent.RemoveChildByIdx(this.idx)
    //         return FLAGS.DESTROY;
    //     }


    //     // Remove from scene's mesh buffer
    //     const scene = Scenes_get_scene_by_idx(this.sceneidx);
    //     ERROR_NULL(scene);
    //     scene.RemoveMesh(this);

    //     return FLAGS.DESTROY;
    // }

    Reconstruct_listeners_recursive() {

        if (this.children.active_count)
            Reconstruct_listeners_recursive(this, this);
    }

    /*******************************************************************************************************************************************************/
    // Graphics

    DeactivateGfx() {

        // if (this.listeners.boundary) {
        //     Listener_events_set_mesh_events_active(LISTENERS_FLAGS.ALL, this.listeners, false);
        // }

        Gfx_deactivate(this.gfx);
        this.is_gfx_inserted = false;

        Scenes_remove_mesh_from_gfx(this.sceneidx, this.gfx.prog.idx, this.gfx.vb.idx, this.gfx.scene_gfx_mesh_idx);

        const params = {
            progidx: this.gfx.prog.idx,
            vbidx: this.gfx.vb.idx,
            sceneidx: this.sceneidx,
            isActive: true,
            isPrivate: (FLAGS & GFX.PRIVATE) ? true : false,
            type: INFO_LISTEN_EVENT_TYPE.GFX.UPDATE_VB,
        }
        Info_listener_dispatch_event(INFO_LISTEN_EVENT_TYPE.GFX.UPDATE, params);
    }

    Set_graphics_vertex_buffer_render(flag) {

        Gfx_set_vb_show(this.gfx.prog.idx, this.gfx.vb.idx, flag);
        if (flag) this.StateEnable(MESH_STATE.IS_HOVERABLE);
        else this.StateDisable(MESH_STATE.IS_HOVERABLE);

        // if (this.children.boundary)
        //     Recursive_gfx_operations(this, Set_graphics_vertex_buffer_render, flag)

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

    AddEventListener(event_type, Clbk = null, params = null, parent_event=null) {

        if (event_type & LISTEN_EVENT_TYPES.CLICK_UP) {

            // Case we accidentaly re-creating the same event(Avoiding duplicate events in the EventListeners buffer).
            // /*DEBUG*/if (this.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK] && this.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK].idx !== INT_NULL) 
            //     alert('Listen Event already exists. @ CreateListenEvent(), Mesh.js');

                const click_idx = LISTEN_EVENT_TYPES_INDEX.CLICK;
                
                if (parent_event && parent_event[click_idx]) {
                    // const idx = Listener_create_child_event(click_idx, [1, parent_event[click_idx].idx], Clbk, this, params);
                    const idx = Listener_create_child_event(click_idx, parent_event[click_idx].idx, Clbk, this, params);
                    this.listeners.AddAtIndex(click_idx, {idx:idx, is_child_event:true});
                    this.StateEnable(MESH_STATE.IS_CLICKABLE);
                }
                
                else {
                    const idx = Listener_create_event(click_idx, Clbk, this, params);
                    this.listeners.AddAtIndex(click_idx, {idx:idx, is_child_event:false});
                    this.StateEnable(MESH_STATE.IS_CLICKABLE);
                }
                
            }
            else if (event_type & LISTEN_EVENT_TYPES.HOVER) {
                // Case we accidentaly re-creating the same event(Avoiding duplicate events in the EventListeners buffer).
                // /*DEBUG*/if (this.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.HOVER] && this.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.HOVER].idx !== INT_NULL) 
                // alert('Listen Event already exists. @ CreateListenEvent(), Mesh.js')

                const hover_idx = LISTEN_EVENT_TYPES_INDEX.HOVER;
                
                if (parent_event && parent_event[hover_idx]) {
                    const idx = Listener_create_child_event(hover_idx, parent_event[hover_idx].idx, Clbk, this, params);
                    this.listeners.AddAtIndex(hover_idx, {idx:idx, is_child_event:true});
                    this.StateEnable(MESH_STATE.IS_HOVERABLE);
                }
                
                else {
                    const idx = Listener_create_event(hover_idx, Clbk, this, params);
                    this.listeners.AddAtIndex(hover_idx, {idx:idx, is_child_event:false});
                    this.StateEnable(MESH_STATE.IS_HOVERABLE);
                }
                
                // const idx = Listener_create_event(hover_idx, null, this, null);
                // this.listeners.AddAtIndex(hover_idx, {idx:idx, is_child_event:false});
                // this.StateEnable(MESH_STATE.IS_HOVERABLE);
            }
            else if (event_type & LISTEN_EVENT_TYPES.MOVE) {
                // Case we accidentaly re-creating the same event(Avoiding duplicate events in the EventListeners buffer).
                /*DEBUG*/if (this.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK] && this.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK].idx !== INT_NULL) 
                alert('Listen Event already exists. @ CreateListenEvent(), Mesh.js')
                
                const click_idx = LISTEN_EVENT_TYPES_INDEX.CLICK;
            // We use a click event because the operation its base on the mouse click and hold
            const idx = Listener_create_event(click_idx, Clbk, this, params);
            this.listeners.AddAtIndex(click_idx, {idx:idx, is_child_event:false});
            // Necessary to activate in order for the mesh to be able to move by a 'Click' event
            this.StateEnable(MESH_STATE.IS_GRABABLE | MESH_STATE.IS_MOVABLE | MESH_STATE.IS_CLICKABLE);
        }
    }

    RemoveAllListenEvents() {

        for (let etype = 0; etype < this.listeners.boundary; etype++) {

            if (this.listeners.buffer[etype] && !this.listeners.buffer[etype].is_child_event){
                    
                Listener_remove_event_by_idx(etype, this.listeners.buffer[etype].idx);
                this.listeners.RemoveByIdx(etype);
                // this.listeners.buffer[etype].idx = INT_NULL;
                // this.listeners.buffer[etype].is_child_event = false;
            }
        }
    }

    RemoveListenEvent(event_type) {

        if (event_type & LISTEN_EVENT_TYPES.CLICK_UP) {

            const idx = LISTEN_EVENT_TYPES_INDEX.CLICK;
            if(!this.listeners.buffer[idx].is_child_event){
                    
                Listener_remove_event_by_idx(idx, this.listeners.buffer[idx].idx);
                this.listeners.RemoveByIdx(idx)
                // this.listeners.buffer[idx].idx = INT_NULL;
                // this.listeners.buffer[idx].is_child_event = false;
            }
        }
        else if (event_type & LISTEN_EVENT_TYPES.HOVER) {
            
            const idx = LISTEN_EVENT_TYPES_INDEX.HOVER;
            if(!this.listeners.buffer[idx].is_child_event){
                
                Listener_remove_event_by_idx(idx, this.listeners.buffer[idx].idx);
                this.listeners.RemoveByIdx(idx)
                // this.listeners.buffer[idx].idx = INT_NULL;
                // this.listeners.buffer[idx].is_child_event = false;
            }
        }
    }

    // RecreateListenEvents() {

    //     if (this.StateCheck(MESH_STATE.IS_FAKE_HOVERABLE | MESH_STATE.IS_HOVERABLE))
    //         this.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)
    //     if (this.StateCheck(MESH_STATE.IS_FAKE_CLICKABLE) && (this.StateCheck(MESH_STATE.IS_CLICKABLE) === 0))
    //         this.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP, this.OnFakeClick)
    //     else if (this.StateCheck(MESH_STATE.IS_CLICKABLE))
    //         this.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP, this.OnClick)
    // }

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
    // Setters-Getters
    SetColor(col) { this.mat.SetColor(col, this.gfx); }
    SetDefaultColor() { this.mat.SetDefaultColor(this.gfx); }
    SetDefaultPosXY() { this.geom.SetDefaultPosXY(this.gfx); }
    SetColorRGB(col) { this.mat.SetColorRGB(col, this.gfx); }
    SetColorAlpha(alpha) { this.mat.SetColorAlpha(alpha, this.gfx); }
    SetPosXYZ(pos) { this.geom.SetPosXYZ(pos, this.gfx); }
    SetPosXY(pos) { this.geom.SetPosXY(pos, this.gfx); }
    SetPosX(x) { this.geom.SetPosX(x, this.gfx); }
    SetPosY(y) { this.geom.SetPosY(y, this.gfx); }
    UpdatePosXY() { this.geom.UpdatePosXY(this.gfx); }
    UpdatePosXYZ() { this.geom.UpdatePosXYZ(this.gfx); }
    UpdateDim() { this.geom.UpdateDim(this.gfx); }
    UpdateZindex(z) { this.geom.SetZindex(z, this.gfx); }
    SetStyle(style) { this.mat.SetStyle(style); }
    MoveXY(x, y) { this.geom.MoveXY(x, y, this.gfx); }
    MoveXYZ(pos) { this.geom.MoveXYZ(pos, this.gfx); }
    MoveRecursive(x, y) {
        
        this.geom.MoveXY(x, y, this.gfx);
        
        if (this.children.boundary)
            Recursive_mesh_move(this.children, x, y)
    }
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

    // UpdateGfx() {
    //     // console.log('UPDATE:', this.name)
    //     this.UpdatePosXYZ();
    // }

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

    /*******************************************************************************************************************************************************
    /** Debug */
    SetName(name = null) {

        // if(name) this.name = name + this.id;
        if (name !== '' && name) this.name = name + ' id:' + this.id;
        else {
            this.name = GetMeshHighOrderNameFromType(this.type);
            this.name += ' id: ' + this.id;
        }
    }
}

/**
 * Deactivate all event listeners of meshe's children,
 * so that the parent mesh can check on demand for it's children events 
 */
function Reconstruct_listeners_recursive(mesh, root) {

    for (let i = 0; i < mesh.children.boundary; i++) {

        const child = mesh.children.buffer[i];
        if (child)
            Reconstruct_listeners_recursive(child, root);

        if (child.StateCheck(MESH_STATE.IS_HOVERABLE) && child.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.HOVER] && !child.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.HOVER].is_child_event) {

            const type = LISTEN_EVENT_TYPES_INDEX.HOVER;

            // Create a Fake event for the root, if the root does not have an event (of same type)
            if (!root.listeners.buffer[type])
                root.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);

            root.StateEnable(MESH_STATE.IS_FAKE_HOVERABLE);

            const evt_idx = child.listeners.buffer[type].idx;
            child.listeners.buffer[type].idx = Listener_set_event_active_by_idx(type, root, evt_idx);
            child.listeners.buffer[type].is_child_event = true;
            // console.log('Remove Hover event:', type, child.name, child.listeners.buffer, ' parent:', mesh.name, ' root:', root.name)
        }
        if (child.StateCheck(MESH_STATE.IS_CLICKABLE) && child.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK] && !child.listeners.buffer[LISTEN_EVENT_TYPES_INDEX.CLICK].is_child_event) {

            const type = LISTEN_EVENT_TYPES_INDEX.CLICK;

            // Create a Fake event for the root, if the root does not have an event (of same type)
            if (!root.listeners.buffer[type])
                root.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_UP, root.OnFakeClick);

            root.StateEnable(MESH_STATE.IS_FAKE_CLICKABLE);

            const evt_idx = child.listeners.buffer[type].idx;
            child.listeners.buffer[type].idx = Listener_set_event_active_by_idx(type, root, evt_idx);
            child.listeners.buffer[type].is_child_event = true;
            // console.log('Remove click event:', type, child.name, child.listeners.buffer, ' parent:', mesh.name, ' root:', root.name)
        }
    }
}

function Gather_all_listen_events_recursive(mesh, event_type, idx = 0, gathered) {

    // Gather for current mesh
    if (mesh.listeners.active_count) {
        gathered.idxs[idx] = mesh.listeners.buffer[event_type].idx;
    }

    // Gather for meshh's children
    if (mesh.children.boundary) {

        for (let i = 0; i < mesh.children.boundary; i++) {

            const child = mesh.children.buffer[i];
            if (child)
                Gather_all_listen_events_recursive(mesh, event_type, idx = 0, gathered)
        }
    }

    return gathered;
}

function Gather_all_listen_events_recursive_to_parent(mesh, event_type, idx = 0) {

    let gathered = {
        idxs: [],
        count: 0,
    };

    if (mesh.parent && (mesh.parent.type & MESH_TYPES_DBG.SCENE) === 0) {

        gathered = Gather_all_listen_events_recursive(mesh.parent, event_type, idx);
        gathered.count++;
    }

    if (mesh.listeners.active_count) {
        gathered.idxs[idx] = mesh.listeners.buffer[event_type].idx;
    }

    return gathered;
}



/** Helper Recursive Functions */
// function Mesh_recursive_destroy(parent) {

//     // for (let i = 0; i < parent.children.boundary; i++) {

//     //     const mesh = parent.children.buffer[i];

//     //     if (mesh) {

//     //         /** Recursive Part */
//     //         if (mesh.children.boundary)
//     //             Mesh_recursive_destroy(mesh)

//     //         if (DEBUG.GFX.REMOVE_MESH) console.log('Remove:', mesh.name)
//     //         const ret = Gfx_remove_geometry(mesh.gfx, mesh.geom.num_faces); // Update the gfx.start of all meshes that are inserted in the same vertex buffer.
//     //         Scenes_remove_mesh_from_gfx(mesh.sceneidx, mesh.gfx.prog.idx, mesh.gfx.vb.idx, mesh.scene_gfx_mesh_idx); // Remove mesh from the scene's gfx buffer

//     //         // Remove event listeners
//     //         // mesh.RemoveAllListenEvents();

//     //         // Remove time intervals
//     //         if (mesh.timeIntervalsIdxBuffer.active_count) {

//     //             const intervalIdx = mesh.timeIntervalsIdxBuffer.buffer[0];// TODO!!!: HACK We need a way to know what interval is what, in the 'timeIntervalsIdxBuffer' in a mesh. 
//     //             TimeIntervalsDestroyByIdx(intervalIdx);
//     //             mesh.timeIntervalsIdxBuffer.RemoveByIdx(0); // HACK
//     //         }

//     //         mesh.RemoveChildren(); // TODO: Do we need to strip down all meshes??? Only if they are shared pointers to some mesh of the appliction

//     //         if (!ret.last) Scenes_update_all_gfx_starts(mesh.sceneidx, mesh.gfx.prog.idx, mesh.gfx.vb.idx, ret);

//     //         parent.RemoveChildByIdx(i); // Remove the current mesh from the parent
//     //     }
//     // }
// }

/** */
// function Mesh_destroy_private_recursive(parent) {

//     for (let i = 0; i < parent.children.boundary; i++) {

//         const mesh = parent.children.buffer[i];

//         if (mesh) {

//             /** Recursive Part */
//             if (mesh.children.boundary)
//                 Mesh_destroy_private_recursive(mesh)

//             Gfx_deactivate_recursive(mesh);

//             mesh.RemoveChildren(); // TODO: Do we need to strip down all meshes??? Only if they are shared pointers to some mesh of the appliction

//             // Remove event listeners
//             mesh.RemoveAllListenEvents();

//             // Remove time intervals
//             if (mesh.timeIntervalsIdxBuffer.active_count) {

//                 const intervalIdx = mesh.timeIntervalsIdxBuffer.buffer[0];// TODO!!!: HACK We need a way to know what interval is what, in the 'timeIntervalsIdxBuffer' in a mesh. 
//                 TimeIntervalsDestroyByIdx(intervalIdx);
//                 mesh.timeIntervalsIdxBuffer.RemoveByIdx(0); // HACK
//             }

//             if (mesh.type & MESH_TYPES_DBG.WIDGET_DROP_DOWN) {
//                 mesh.DeactivateMenu();
//             }

//             parent.RemoveChildByIdx(i); // Remove the current mesh from the parent
//         }
//     }
// }

/** */
export function Recursive_gfx_operations(_mesh, Clbk, params) {

    const children = _mesh.children;
    for (let i = 0; i < children.boundary; i++) {

        const mesh = children.buffer[i];
        if (mesh.children.active_count)
            Recursive_gfx_operations(mesh, Clbk, params)

        Clbk(mesh, params);
    }
}


function Set_graphics_vertex_buffer_render(mesh, flag) {

    const progidx = mesh.gfx.prog.idx;
    const vbidx = mesh.gfx.vb.idx;
    Gfx_set_vb_show(progidx, vbidx, flag)
}

// function Recursive_mesh_move(buffer, x, y) {

//     const meshes = buffer;

//     for (let i = 0; i < meshes.boundary; i++) {

//         if (meshes.buffer[i]) {
//             if (meshes.buffer[i].children.boundary)
//                 Recursive_mesh_move(meshes.buffer[i].children, x, y)

//             const gfx = meshes.buffer[i].gfx;
//             meshes.buffer[i].geom.MoveXY(x, y, gfx);
//             // console.log(x,y, meshes.buffer[i].name)
//         }

//     }

// }


/*******************************************************************************************************************************************************
/** DEBUG PRINT*/
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
