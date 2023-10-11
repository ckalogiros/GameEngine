"use strict";
import { AddArr3, FloorArr3 } from '../Helpers/Math/MathOperations.js';
import { AnimationsGet } from './Animations/Animations.js';
import { M_Buffer } from './Core/Buffers.js';
import { Drop_down_set_root, Widget_Dropdown } from './Drawables/Meshes/Widgets/Menu/Widget_Dropdown.js';
import { Widget_Text } from './Drawables/Meshes/Widgets/WidgetText.js';
import { HandleEvents } from './Events/Events.js';

class Update_Meshes_buffer {
    mesh;
    flag;
    callbacks;
    params;
    constructor(mesh = null, flags = 0x0, callbacks = null, params = null) {
        this.mesh = mesh;
        this.flags |= flags;
        this.callbacks = callbacks;
        this.params = params;
    }
}
const _update_meshes_buffer = new M_Buffer();

export function UpdaterAdd(mesh, flags, callbacks, params) {
    _update_meshes_buffer.Add(new Update_Meshes_buffer(mesh, flags, callbacks, params))
}
export function UpdaterRun() {

    for (let i = 0; i < _update_meshes_buffer.boundary; i++) {

        if (_update_meshes_buffer.buffer[i]) {

            const mesh = _update_meshes_buffer.buffer[i].mesh;
            const params = _update_meshes_buffer.buffer[i].params;

            if (mesh.gfx) {

                // console.log('Update positions: PREV', mesh.geom.pos)
                mesh.Reposition_post(params);
                // console.log('Update positions:', mesh.geom.pos)

                // Mesh update handled, remove.
                _update_meshes_buffer.RemoveByIdx(i)
            }
        }

    }
}


function UpdaterRunRecursive(mesh, params, level) {

    AddArr3(mesh.geom.pos, params)
    mesh.UpdateGfx();

    for (let i = 0; i < mesh.children.boundary; i++) {

        const child = mesh.children.buffer[i];

        if (child) {
            UpdaterRunRecursive(child, params, level++)
        }
    }
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *  LOGIC:
 * TODO
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


export class Scene {

    sceneidx = 0;   // Scene ID (of type: SCENE const structure).
    camera;        // Cameras buffer used by the scene
    gfx;
    root_meshes; // Holds only the root widget mesh of the scene(not widgets)
    name;

    constructor(idx) {

        this.sceneidx = idx;
        this.camera = null;
        this.type |= MESH_TYPES_DBG.SCENE;
        this.name = 'scene, idx:' + this.idx;

        this.gfx = null;
        this.root_meshes = new M_Buffer();

    }

    OnUpdate() {

        const animations = AnimationsGet();

        UpdaterRun();

        /** Run Animations */
        animations.Run();

        /** Handle Events */
        HandleEvents();

        /** Special case for DebugInfoUi for the GFX, must update its rendering from main loop */
        // const event_params = Info_listener_get_event(INFO_LISTEN_EVENT_TYPE.GFX);
        // if(event_params) Debug_info_render_gfx_info(event_params);
    }

    AddWidget(widget, FLAGS = GFX.ANY, gfxidx) {

        /**DEBUG*/  if (!widget || widget === undefined) {
            console.error('Mesh shouldn\'t be undefined. @ class Scene.AddMesh().');
            return;
        }

        widget.SetSceneIdx(this.sceneidx); // Set the sceneidx for all widgets meshes
        widget.GenGfxCtx(FLAGS, gfxidx);
        this.StoreRootMesh(widget);

    }

    /*******************************************************************************************************************************************************/
    // Graphics

    Render() {

        /**
         * Add all secene meshes to the graphics vertex buffers.
         * Use: Runs only once. We wait to insert all meshes to the graphics buffers,
         * so that all meshe's calculations (position, dimention, etc) have taken place.
         * In case of RunTime mesh creation, the meshe's Render() method is called directly.
         */

        for (let i = 0; i < this.root_meshes.boundary; i++) {

            const widget = this.root_meshes.buffer[i];
            widget.Render();
        }
    }

    RemoveRootMesh(widget) {

        ERROR_NULL(widget.scene_rootidx);
        if(widget.scene_rootidx !== INT_NULL)
            this.root_meshes.RemoveByIdx(widget.scene_rootidx);
    }

    RemoveMeshFromGfx(progidx, vbidx, scene_gfx_mesh_idx){

        if(scene_gfx_mesh_idx === undefined || scene_gfx_mesh_idx === INT_NULL){
            console.error('UNDEFINED scene_gfx_mesh_idx. returning witout removing mesh from buffer. scene_gfx_mesh_idx:', scene_gfx_mesh_idx);
            return true;
        }
        { /**DEBUG */
            const mesh = this.gfx.buffer[progidx].vb.buffer[vbidx].mesh.buffer[scene_gfx_mesh_idx];
            console.log(`Removing mesh: prog:${progidx} vb:${vbidx} idx:${scene_gfx_mesh_idx}`)
            if(mesh) console.log(`name:${mesh.name}`)
        }
        this.gfx.buffer[progidx].vb.buffer[vbidx].mesh.RemoveByIdx(scene_gfx_mesh_idx);
        return false;
    }

    /*******************************************************************************************************************************************************/
    // Camera

    // Store a reference to the camera object
    SetCamera(camera) {
        if (this.camera) alert('Camera already existas for scene:', this.sceneidx)
        this.camera = camera;
    }

    /*******************************************************************************************************************************************************/
    // Getters-Setters
    StoreGfxCtx(mesh) {
        /** 
         * Store all scene's meshes by the gfx vertex buffer they belong.
         * and all vertex buffer indexes by the gfx program they belong.
         * 
         * Scema: this.gfx = [{ progidx: int, vb: [{ vbidx: int, meshes: [{ mesh: ref to type:Mesh }, ...], }, ...], }, ...]
         * 
         * #Case 1 : Meshe's progidx does not exist
         *      create: this.gfx = new M_Buffer()
         *      store the meshes progidx to:  this.gfx.Add({ vb: new M_Buffer(), progidx: mesh_gfx.prog.idx })
         *      store the meshes vbidx to:  this.gfx[i].vb.Add({ mesh: new M_Buffer(), vbidx: mesh_gfx.vb.idx })
         *      store the ref of the mesh to: this.gfx.buffer[j].vb[k].Add(mesh)
         * #Case 2 : Meshe's vbidx does not exist
         *      create: this.gfx.buf[j] = new M_Buffer()
         *      store the meshes vbidx to:  this.gfx[i].vb.Add({ mesh: new M_Buffer(), vbidx: mesh_gfx.vb.idx })
         *      store the ref of the mesh to: this.gfx.buffer[j].vb[k].Add(mesh)
         * #Case 3 : Both progidx and vbidx exist
         *      store the ref of the mesh to: this.gfx.buffer[j].vb[k].Add(mesh)
         * #Edge Case: The 'this.gfx' is not initialized.  
         *      Do like #Case 1
         */

        const mesh_gfx = mesh.gfx;
        let handled = false;

        if (!this.gfx) { // #Edge Case
            this.gfx = new M_Buffer();
            const idx_prog = this.gfx.Add({
                progidx: mesh_gfx.prog.idx,
                vb: new M_Buffer(),
            });
            const idx_vb = this.gfx.buffer[idx_prog].vb.Add({
                vbidx: mesh_gfx.vb.idx,
                mesh: new M_Buffer(),
            });

            this.camera.StoreProgIdx(mesh_gfx.prog.idx); // Store the new program to the cameras progidx buffer for the program's matrix uniform update. 

        }
        else {

            // Must loop through all existing 'gfx' to conclude if the current meshes gfx buffers exist or not.
            for (let j = 0; j < this.gfx.boundary; j++) { // loop for all gfx program buffer indexes

                if (this.gfx.buffer[j].progidx === mesh_gfx.prog.idx) {

                    for (let k = 0; k < this.gfx.buffer[j].vb.boundary; k++) { // loop for all stored vertex buffer indexes

                        if (this.gfx.buffer[j].vb.buffer[k].vbidx === mesh_gfx.vb.idx) {

                            // #Case 3
                            handled = true;
                            break; // Break when gfx already stored.
                        }
                    }

                    if(!handled){  // #Case 2
                            
                        const idx_vb = this.gfx.buffer[j].vb.Add({
                            vbidx: mesh_gfx.vb.idx,
                            mesh: new M_Buffer(),
                        });
                        handled = true;
                    }

                }
                if (handled) break; // We broke the inner loop, but we need to break this one too and continue with the next mesh.
            }

            if (!handled) { // #Case 1. Program index not found.

                const idx_prog = this.gfx.Add({
                    progidx: mesh_gfx.prog.idx,
                    vb: new M_Buffer(),
                });
                const idx_vb = this.gfx.buffer[idx_prog].vb.Add({
                    vbidx: mesh_gfx.vb.idx,
                    mesh: new M_Buffer(),
                });

                this.camera.StoreProgIdx(mesh_gfx.prog.idx); // Store the new program to the cameras progidx buffer for the program's matrix uniform update. 
                handled = true;
            }
        }

        // Store the mesh based on the its gfx buffers, if the buffers are already stored.
        // IMPORTANT!!!: Supose the function is called only for newly created meshes, not meshes that alredy been stored;
        const progidx = mesh.gfx.prog.idx;
        const vbidx = mesh.gfx.vb.idx;
        
        // Case the mesh is already inserted(inserted and removed, but not from the gfx mesh buffer)
        if(mesh.gfx.scene_gfx_mesh_idx !== INT_NULL){

            const mesh_exists = this.gfx.buffer[progidx].vb.buffer[vbidx].mesh.buffer[mesh.gfx.scene_gfx_mesh_idx];
            if(mesh_exists) {
    
                console.log(`Mesh already exixts: prog:${progidx} vb:${vbidx} name:${mesh.name} idx:${mesh.scene_gfx_mesh_idx}`)
                // // Check if its the same mesh
                // if(mesh.id !== mesh_exists.id){
                //     // If it is a diferent mesh, add it to the same index
                //     this.gfx.buffer[progidx].vb.buffer[vbidx].mesh.AddAtIndex(mesh.gfx.scene_gfx_mesh_idx, mesh)
                // }
            }
        }
        else{ // Mesh does not

            mesh.gfx.scene_gfx_mesh_idx = this.gfx.buffer[progidx].vb.buffer[vbidx].mesh.Add(mesh);
            { /**DEBUG */
            console.log(`Adding mesh: prog:${progidx} vb:${vbidx} name:${mesh.name} idx:${mesh.scene_gfx_mesh_idx}`)
        }

    }
        // console.log('--- Added:', mesh.name, ' prog:', progidx, ' vb:', vbidx, ' idx:', mesh.gfx.scene_gfx_mesh_idx)

    }

    StoreRootMesh(widget) {
        widget.scene_rootidx = this.root_meshes.Add(widget);
        widget.idx = widget.scene_rootidx;
    }

    FindMeshById(id) {
        for (let i = 0; i < this.children.boundary; i++) {
            if (this.children.buffer && this.children.buffer[i].id === id)
                return this.children.buffer[i];
            return null;
        }
    }

    GetRootMeshes() {
        return this.root_meshes;
    }

    GetRootMeshByIdx(rootidx) {
        return this.root_meshes.buffer[rootidx];
    }

    GetAllSceneMeshes(){

        const meshes = [];
        // this.gfx.buffer[progidx].vb.buffer[vbidx].mesh.Add(mesh);
        for(let i=0; i<this.gfx.boundary; i++){

            const vbs = this.gfx.buffer[i].vb;
            for(let j=0; j<vbs.boundary; j++){
                
                for(let k=0; k<vbs.buffer[j].mesh.boundary; k++){
                    
                    const mesh = vbs.buffer[j].mesh.buffer[k];
                    if(mesh) meshes.push(mesh);
                }

            }
        }

        return meshes;
    }


    /*******************************************************************************************************************************************************/
    /** DEBUG PRINT */
    Print() {
        ScenesPrintRootMeshes(this.children, 0)
    }

    PrintMeshInGfx() {
        console.log('PrintMeshInGfx:')
        for (let i = 0; i < this.mesh_in_gfx.length; i++) {

            console.log('prog, vb:', this.gfxBuffer[i], 'meshes:', this.mesh_in_gfx[i].boundary);
            for (let j = 0; j < this.mesh_in_gfx[i].boundary; j++) {
                console.log(
                    j, 'name:', this.mesh_in_gfx[i].buffer[j].name
                );
            }
        }
    }

    PrintGfxStorageBuffer() {
        // console.log(this.gfx)
        let count_meshes = 0;
        for (let i = 0; i < this.gfx.boundary; i++){

            console.log('progidx:', this.gfx.buffer[i].progidx);
            for (let j = 0; j < this.gfx.buffer[i].vb.boundary; j++){
                
                console.log('  vbidx:', this.gfx.buffer[i].vb.buffer[j].vbidx);
                for (let k = 0; k < this.gfx.buffer[i].vb.buffer[j].mesh.boundary; k++) { 
                    if(this.gfx.buffer[i].vb.buffer[j].mesh.buffer[k]){
                        
                        const mesh = this.gfx.buffer[i].vb.buffer[j].mesh.buffer[k];
                        console.log(`    ${k} name:${mesh.name}, gfxmesh: ${mesh.gfx.scene_gfx_mesh_idx} mesh: ${mesh.idx} root: ${mesh.scene_rootidx}`)
                        count_meshes++;
                    } 
                }
            }
        }
        console.log('MESH COUNT:', count_meshes);
    }

    PrintRootMeshBuffer() {
        console.log(this.root_meshes)
    }
};

class Scenes extends M_Buffer {

    constructor() {

        super();
    }

    Create() {

        const scene = new Scene(this.boundary);
        this.Add(scene);
        return scene;
    }

    /**
     * @returns type of M_Buffer, not just an array[]
     */
    GetRootMeshes(sceneidx) {
        return this.buffer[sceneidx].GetRootMeshes();
    }

    GetRootMeshByIdx(sceneidx, rootidx) {
        return this.buffer[sceneidx].GetRootMeshByIdx(rootidx);
    }

    GetAllSceneMeshes(sceneidx){
        return this.buffer[sceneidx].GetAllSceneMeshes();
    }

}

const _scenes = new Scenes();
_scenes.Init(1);

export function Scenes_get_scene_by_idx(sceneidx) { return _scenes.buffer[sceneidx]; }
export function Scenes_create_scene() { return _scenes.Create(); }
export function Scenes_get_root_meshes(sceneidx) { return _scenes.GetRootMeshes(sceneidx); }
export function Scenes_get_root_mesh_by_idx(sceneidx, rootidx) { return _scenes.GetRootMeshByIdx(sceneidx, rootidx); }
export function Scenes_get_all_scene_meshes(sceneidx) { return _scenes.GetAllSceneMeshes(sceneidx); }
export function Scenes_get_count() { return _scenes.active_count; }
export function Scenes_remove_root_mesh(widget, sceneidx) { 
    _scenes.buffer[sceneidx].RemoveRootMesh(widget);
}
export function Scenes_store_gfx_to_buffer(sceneidx, mesh) { 
    _scenes.buffer[sceneidx].StoreGfxCtx(mesh);
}
export function Scenes_remove_mesh_from_gfx(sceneidx, progidx, vbidx, scene_gfx_mesh_idx) { 
    return _scenes.buffer[sceneidx].RemoveMeshFromGfx(progidx, vbidx, scene_gfx_mesh_idx);
}

/**
 * Upon mesh's removal of the vertex buffers, 
 * we must update all the starts of the other meshes
 * that are located at the right of the removed mesh.
 * Otherwise the 'mesh.gfx.vb.start' will point to the original index. 
 */
export function Scenes_update_all_gfx_starts(sceneidx, progidx, vbidx, ret) {

    const scene = _scenes.buffer[sceneidx];
    const meshes = scene.gfx.buffer[progidx].vb.buffer[vbidx].mesh;
    for (let k = 0; k < meshes.boundary; k++) { 
        
        if(meshes.buffer[k]){ // Make sure for any removed meshes

            const gfx = meshes.buffer[k].gfx;
            // Decrement all meshes start indices (that belong to the same vertex buffer) 
            // if they are 'positioned' after the removed mesh.
            if (gfx.vb.start > ret.start && gfx.prog.idx === progidx && gfx.vb.idx === vbidx) {

                gfx.vb.start -= ret.counts[0];
                if (gfx.ib.start > 0) gfx.ib.start -= ret.counts[1];
            }
        } 
    }
}

export function Scenes_update_all_gfx_starts2(sceneidx, progidx, vbidx, ret) {

    const scene = _scenes.buffer[sceneidx];

    const idx = scene.MeshInGfxFind(progidx, vbidx); // Find in which index is the vertex buffer located. 
    const meshes = scene.mesh_in_gfx[idx]; // Get all meshes references of that specific vertex buffer

    for (let i = 0; i < meshes.boundary; i++) {

        const start = meshes.buffer[i].gfx.vb.start

        // Decrement all meshes start indices if they are 'positioned' after the removed mesh in the vertex buffer.
        if (start > ret.start) {

            meshes.buffer[i].gfx.vb.start += ret.counts[0];
            // if(meshes.buffer[i].gfx.ib.start > 0) mesh.gfx.ib.start += ret.counts[1]; // Also decrent the indexBuffer, if > 0. TODO!!!: implement correctly the index buffer, so we donot have to check for ib > 0
        }
    }

}

/**
 * Debug
 */
export function ScenesPrintRootMeshes(array) {

    let total_count = 0;

    for (let i = 0; i < array.boundary; i++) {

        const mesh = array.buffer[i];
        if (mesh) {

            console.log(i, mesh.name, mesh.geom.pos)
            total_count++;
        }

    }

    return total_count;
}

export function ScenesPrintAllMeshes(children, count) {

    let total_count = 0;

    for (let i = 0; i < children.boundary; i++) {

        const child = children.buffer[i];

        if (child) {

            let r = ' ';

            for (let j = 0; j < count; j++) r += '->';

            // console.log(i, r, child.id, GetMeshHighOrderNameFromType(child.type))
            console.log(i, r, child.name, ' idx:', child.idx, FloorArr3(child.geom.pos));
            total_count++;

            if (child.children.boundary) {
                count++;
                total_count += ScenesPrintAllMeshes(child.children, count);
                count--;
            }
        }
    }

    return total_count;

}



/**************************************************************************************************************************/
// Debug Info Drop Down
// TODO!!: Maybe implement the debug info and its creation functions in another file and use a standardized 
// info-mesh input, like the standard M_Buffer class, to insert all info meshes to the debug info dropdown menu.
const temp_transparency = 0.02;
const pad = [20, 2.5]

function Gather_mesh_children_names(mesh) {

    let buffer = '';
    for (let i = 0; i < mesh.children.boundary; i++) {
        const child = mesh.children.buffer[i];
        if (child) {
            buffer += `${i}: ${child.name} | `;
        }
    }

    return buffer
}

function Scenes_debug_info_create_recursive(scene, dropdown_root, mesh_children, parent_discription) {

    // if children events exist, put them in a new drop down.
    // const dropdown = new Widget_Dropdown(`${parent_discription}`, [200, 400, 0], [60, 20], GREY1, TRANSPARENCY(GetRandomColor(), temp_transparency), WHITE, pad);
    const dropdown = new Widget_Dropdown(`${parent_discription}`, [200, 400, 0], [60, 20], TRANSPARENCY(BLUE_10_120_220, .7), TRANSPARENCY(GREY1, .8), WHITE, pad);
    // dropdown.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); dropdown.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);


    for (let j = 0; j < mesh_children.boundary; j++) {

        const mesh = mesh_children.buffer[j];

        const type = Listeners_get_event_type_string(mesh.type);
        const info = `mesh: ${mesh.name}`;
        //text, pos, fontSize = 5, scale = [1, 1], color = WHITE, bold = 4, font = TEXTURES.SDF_CONSOLAS_LARGE
        const text = new Widget_Text(info, [OUT_OF_VIEW, OUT_OF_VIEW, 0], 4, BLUE_10_120_220);
        text.info_id = [type, j]
        text.debug_info.type |= INFO_LISTEN_EVENT_TYPE.LISTENERS;
        dropdown.AddToMenu(text)

        { // Mesh's Gfx info
            const gfx = mesh.gfx;
            const dp_info = `prog:${gfx.prog.idx} | vb:${gfx.vb.idx}, start:${gfx.vb.start}, count:${gfx.vb.boundary}`;
            const dp_gfx = new Widget_Dropdown(`Gfx: ${dp_info}`, [200, 400, 0], [60, 20], GREY6, TRANSPARENCY(RED, .05), WHITE, pad);
            // dp_gfx.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); dp_gfx.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);


            const info = `prog:${gfx.prog.idx} | vb:${gfx.vb.idx}, start:${gfx.vb.start}, count:${gfx.vb.boundary}`;
            const gfx_text = new Widget_Text(info, [OUT_OF_VIEW, OUT_OF_VIEW, 0], 4, TRANSPARENCY(GREEN_140_240_10, 1));
            gfx_text.debug_info.type |= INFO_LISTEN_EVENT_TYPE.LISTENERS;
            dropdown.AddToMenu(gfx_text)
        }
        { // Geometry info
            const dp_info = `geom: pos:${mesh.geom.pos} dim:${mesh.geom.dim}`;
            const dp = new Widget_Dropdown(dp_info, [200, 400, 0], [60, 20], GREY1, TRANSPARENCY(GREY1, 1), WHITE, pad);
            // dp.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); dp.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);

            const info = `defPos:${mesh.geom.defPos} | defDim:${mesh.geom.defDim}, numFaces:${mesh.geom.num_face}`;
            const gfx_text = new Widget_Text(info, [OUT_OF_VIEW, OUT_OF_VIEW, 0], 4, TRANSPARENCY(GREEN_140_240_10, 1));
            gfx_text.debug_info.type |= INFO_LISTEN_EVENT_TYPE.LISTENERS;
            dp.AddToMenu(gfx_text)
            dropdown.AddToMenu(dp)
        }
        { // Miscelaneus info
            const dp = new Widget_Dropdown('Misc', [200, 400, 0], [60, 20], GREY1, TRANSPARENCY(GREY1, 1), WHITE, pad);
            // dp.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); dp.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);

            {// Children buffer
                // const info = `children:${mesh.children.buffer}`;
                const info = Gather_mesh_children_names(mesh);
                const gfx_text = new Widget_Text(info, [OUT_OF_VIEW, OUT_OF_VIEW, 0], 4, WHITE);
                dp.AddToMenu(gfx_text)
            }
            {// Event Callbacks
                const info = `eventCallbacks:${mesh.eventCallbacks.buffer}`;
                const gfx_text = new Widget_Text(info, [OUT_OF_VIEW, OUT_OF_VIEW, 0], 4, WHITE);
                dp.AddToMenu(gfx_text)
            }
            { // Listeners
                const info = `listeners:${mesh.listeners.buffer}`;
                const gfx_text = new Widget_Text(info, [OUT_OF_VIEW, OUT_OF_VIEW, 0], 4, WHITE);
                dp.AddToMenu(gfx_text)
            }
            dropdown.AddToMenu(dp)
        }

        if (mesh.children.active_count) // Pass as new root for the recursion the current dropdown menu
            Scenes_debug_info_create_recursive(scene, dropdown, mesh.children, mesh.name);

    }

    dropdown_root.AddToMenu(dropdown);
}

export function Scenes_debug_info_create(scene) {

    // const dropdown = new Widget_Dropdown('Scene Meshes Dropdown Section Panel', ALIGN.LEFT, [200, 400, 0], [60, 20], GREY1, TRANSPARENCY(GetRandomColor(), temp_transparency), WHITE, pad);
    const dropdown = new Widget_Dropdown('Scene Meshes Dropdown Section Panel', [600, 20, 0], [60, 20], GREY1, TRANSPARENCY(GREY7, temp_transparency), WHITE, pad);
    // dropdown.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); dropdown.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);
    // dropdown.CreateListenEvent(LISTEN_EVENT_TYPES.MOVE, dropdown.SetOnMove);
    // Drop_down_set_root(dropdown, dropdown);


    for (let i = 0; i < _scenes.boundary; i++) {

        const scene = _scenes.buffer[i];
        //    const type = Listeners_get_event_type_string(i);

        // const drop_down_mesh = new Widget_Dropdown(`${scene.name}`, [200, 400, 0], [60, 20], GREY1, TRANSPARENCY(GetRandomColor(), temp_transparency), WHITE, pad);
        const drop_down_mesh = new Widget_Dropdown(`${scene.name}`, [200, 400, 0], [60, 20], GREY1, TRANSPARENCY(BLUE, temp_transparency), WHITE, pad);
        // drop_down_mesh.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER); drop_down_mesh.StateEnable(MESH_STATE.IS_HOVER_COLORABLE);

        const meshes_buffer = scene.children;

        for (let j = 0; j < meshes_buffer.boundary; j++) {

            const mesh = meshes_buffer.buffer[j];

            const info = `mesh: ${mesh.name}`;
            const text = new Widget_Text(info, [OUT_OF_VIEW, OUT_OF_VIEW, 0], 4, WHITE);
            text.info_id = [mesh.id]
            text.debug_info.type |= INFO_LISTEN_EVENT_TYPE.LISTENERS;
            drop_down_mesh.AddToMenu(text)

            if (mesh.children)
                Scenes_debug_info_create_recursive(scene, drop_down_mesh, mesh.children, mesh.name);

        }

        dropdown.AddToMenu(drop_down_mesh)
    }

    // const info_event_type = INFO_LISTEN_EVENT_TYPE.ALL_MESHES;
    // Info_listener_create_event(info_event_type, Scenes_debug_info_update, dropdown, null)


    scene.AddMesh(dropdown);
    dropdown.Init();
    // dropdown.Reconstruct_listeners_recursive();
    dropdown.Calc();
    // Drop_down_set_root_for_debug(dropdown);
    Drop_down_set_root(dropdown, dropdown);
}

export function Scenes_debug_info_update(params) {

    const dropdown_root = params.source_params;

    const evt = params.target_params;

    for (let i = 0; i < dropdown_root.children.boundary; i++) {

        const dropdown_child = dropdown_root.children.buffer[i];
        if (dropdown_child.val[0] === evt.type) {

            const type = Listeners_get_event_type_string(evt.type);
            const info = `type: ${type} | name:${evt.source_params.name}`;
            const text = new Widget_Text(info, [OUT_OF_VIEW, OUT_OF_VIEW, 0], 4, WHITE);
            text.info_id = [evt.type, 0]
            text.debug_info.type |= INFO_LISTEN_EVENT_TYPE.LISTENERS;
            dropdown_child.AddToMenu(text);
        }
    }
} 


    /**SAVE */
    // StoreGfxCtx(mesh) {

    //     const mesh_count = mesh.length;
    //     for (let i = 0; i < mesh_count; i++) {
            
            
    //         const mesh_gfx = mesh[i].gfx;
    //         let handled = false;

    //         if (!this.gfx) { // #Edge Case
    //             this.gfx = new M_Buffer();
    //             const idx_prog = this.gfx.Add({
    //                 progidx: mesh_gfx.prog.idx,
    //                 vb: new M_Buffer(),
    //             });
    //             const idx_vb = this.gfx.buffer[idx_prog].vb.Add({
    //                 vbidx: mesh_gfx.vb.idx,
    //                 mesh: new M_Buffer(),
    //             });
    //             mesh[i].gfx.scene_gfx_mesh_idx = this.gfx.buffer[idx_prog].vb.buffer[idx_vb].mesh.Add(mesh[i]);

    //             this.camera.StoreProgIdx(mesh_gfx.prog.idx); // Store the new program to the cameras progidx buffer for the program's matrix uniform update. 

    //         }
    //         else {

    //             // Must loop through all existing 'gfx' to conclude if the current meshes gfx buffers exist or not.
    //             for (let j = 0; j < this.gfx.boundary; j++) { // loop for all gfx program buffer indexes

    //                 if (this.gfx.buffer[j].progidx === mesh_gfx.prog.idx) {

    //                     for (let k = 0; k < this.gfx.buffer[j].vb.boundary; k++) { // loop for all stored vertex buffer indexes

    //                         if (this.gfx.buffer[j].vb.buffer[k].vbidx === mesh_gfx.vb.idx) {

    //                             // #Case 3
    //                             mesh[i].gfx.scene_gfx_mesh_idx = this.gfx.buffer[j].vb.buffer[k].mesh.Add(mesh[i]);
    //                             handled = true;
    //                             break; // Break when gfx already stored.
    //                         }
    //                     }

    //                     if(!handled){  // #Case 2
                                
    //                         const idx_vb = this.gfx.buffer[j].vb.Add({
    //                             vbidx: mesh_gfx.vb.idx,
    //                             mesh: new M_Buffer(),
    //                         });
    //                         mesh[i].gfx.scene_gfx_mesh_idx = this.gfx.buffer[j].vb.buffer[idx_vb].mesh.Add(mesh[i]);
    //                         handled = true;
    //                     }

    //                 }
    //                 if (handled) break; // We broke the inner loop, but we need to break this one too and continue with the next mesh.
    //             }

    //             if (!handled) { // #Case 1. Program index not found.

    //                 const idx_prog = this.gfx.Add({
    //                     progidx: mesh_gfx.prog.idx,
    //                     vb: new M_Buffer(),
    //                 });
    //                 const idx_vb = this.gfx.buffer[idx_prog].vb.Add({
    //                     vbidx: mesh_gfx.vb.idx,
    //                     mesh: new M_Buffer(),
    //                 });
    //                 // mesh[i].idx = this.gfx.buffer[idx_prog].vb.buffer[idx_vb].mesh.Add(mesh[i]);
    //                 mesh[i].gfx.scene_gfx_mesh_idx = this.gfx.buffer[idx_prog].vb.buffer[idx_vb].mesh.Add(mesh[i]);

    //                 this.camera.StoreProgIdx(mesh_gfx.prog.idx); // Store the new program to the cameras progidx buffer for the program's matrix uniform update. 
    //                 handled = true;
    //             }
    //         }
    //     }
    // }
