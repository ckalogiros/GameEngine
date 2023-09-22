"use strict";
import { GlRotateXY3D } from '../Graphics/Buffers/GlBufferOps.js';
import { AddArr2, AddArr3, FloorArr3 } from '../Helpers/Math/MathOperations.js';
import { AnimationsGet } from './Animations/Animations.js';
import { M_Buffer } from './Core/Buffers.js';
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

    for (let i = 0; i < _update_meshes_buffer.count; i++) {

        const mesh = _update_meshes_buffer.buffer[i].mesh;
        const params = _update_meshes_buffer.buffer[i].params;

        AddArr3(mesh.geom.pos, params)
        mesh.UpdateGfx();
        // console.log('UPDATE:', mesh.name, params, mesh.geom.pos)

        for (let j = 0; j < mesh.children.count; j++) {

            const child = mesh.children.buffer[j];
            const level = 0;
            if (child) {
                UpdaterRunRecursive(child, params, level)
            }
        }
        // if(flags & UPDATER.SELF){
        // }
        // else if(flags & UPDATER.CHILDREN){
        // }
        // else if(flags & UPDATER.ALL){
        // }

        // Mesh update handled, remove.
        _update_meshes_buffer.RemoveByIdx(i)
    }
}

function UpdaterRunRecursive(mesh, params, level) {

    // console.log('Before:', level, mesh.name, params, mesh.geom.pos)
    AddArr3(mesh.geom.pos, params)
    // console.log('After:', level, mesh.name, params, mesh.geom.pos)

    mesh.UpdateGfx();
    // console.log('RECURSIVE:', level, mesh.name, params, mesh.geom.pos)
    
    for (let i = 0; i < mesh.children.count; i++) {
        
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

    sceneIdx = 0;   // Scene ID (of type: SCENE const structure).
    cameras;        // Cameras buffer used by the scene
    children;       // Store all meshes (by refference) that belong to the scene.
    gfxBuffer;      // Quick access to graphics buffers (indexes only)
    mesh_in_gfx;   // Store meshes as array of pointers per gfx vertex buffer. Store for every vertex buffer all meshes that belong to that vertex buffer.
    name;

    constructor(idx) {

        this.sceneIdx = idx;
        this.cameras = [];
        this.children = new M_Buffer();
        this.children.Init(32);
        this.gfxBuffer = [];
        this.mesh_in_gfx = [];
        this.type |= MESH_TYPES_DBG.SCENE;
        this.name = 'scene, idx:' + this.idx;

    }

    // OnUpdate should handle all meshes requirements. E.x. uniform update, etc...
    OnUpdate() {

        const animations = AnimationsGet();

        UpdaterRun();

        /** Run Animations */
        animations.Run();

        /** Handle Events */
        HandleEvents();
    }

    AddMesh(mesh, FLAGS = GFX.ANY, gfxidx) {

        if (!mesh || mesh === undefined) {
            console.error('Mesh shouldn\'t be undefined. @ class Scene.AddMesh().');
            return;
        }

        mesh.sceneIdx = this.sceneIdx;
        mesh.GenGfxCtx(FLAGS, gfxidx);
        this.StoreGfxInfo(mesh.gfx);
        this.StoreMesh(mesh);
        return mesh.gfx;
    }

    Render() {

        for (let i = 0; i < this.children.count; i++) {

            const mesh = this.children.buffer[i];
            mesh.AddToGfx();
        }
    }

    RemoveMesh(mesh) {

        ERROR_NULL(mesh.idx)
        this.children.RemoveByIdx(mesh.idx);
    }

    StoreMesh(mesh) {

        const idx = this.children.Add(mesh);
        mesh.parent = this;
        mesh.idx = idx;
    }

    // Store meshe's graphics info (program index, vertex buffer index), 
    // as an easy and light-weight way of dealing with all Graphics buffers of the scene.
    StoreGfxInfo(gfxInfo) {

        let index = INT_NULL;

        if (Array.isArray(gfxInfo)) {

            const gfxlen = gfxInfo.length;
            for (let numGfx = 0; numGfx < gfxlen; numGfx++) {

                // Check if the glVertexBuffer index of the current Mesh is already stored
                let found = false;
                const len = this.gfxBuffer.length;

                for (let i = 0; i < len; i++) {
                    if (this.gfxBuffer[i].progidx === gfxInfo[numGfx].prog.idx && this.gfxBuffer[i].vbidx === gfxInfo[numGfx].vb.idx) {
                        found = true;
                        index = i;
                        break;
                    }
                }
                // Store it, if not stored.
                if (!found) {
                    index = this.gfxBuffer.push({ progidx: gfxInfo[numGfx].prog.idx, vbidx: gfxInfo[numGfx].vb.idx, active: false }) -1;
                }

                this.cameras[0].StoreProgIdx(gfxInfo[0].prog.idx);
            }

            return index;
        }
        else {

            // Check if the glVertexBuffer index of the current Mesh is already stored
            let found = false;
            const len = this.gfxBuffer.length;

            for (let i = 0; i < len; i++) {
                if (this.gfxBuffer[i].progidx === gfxInfo.prog.idx && this.gfxBuffer[i].vbidx === gfxInfo.vb.idx) {
                    found = true;
                    index = i;
                    break;
                }
            }
            // Store it, if not stored.
            if (!found) {
                index = this.gfxBuffer.push({ progidx: gfxInfo.prog.idx, vbidx: gfxInfo.vb.idx, active: false }) -1;
            }

            this.cameras[0].StoreProgIdx(gfxInfo.prog.idx);

            return index;
        }

    }

    StoreMeshInGfx(mesh){
        const idx = this.StoreGfxInfo(mesh.gfx);
        if(this.mesh_in_gfx[idx] === undefined){
            this.mesh_in_gfx[idx] = new M_Buffer();
        }
        this.mesh_in_gfx[idx].Add(mesh);
    }

    // Store a refference to the camera object
    UseCamera(camera) {
        this.cameras.push(camera);
    }

    FindMeshById(id) {
        for (let i = 0; i < this.children.count; i++) {
            if (this.children.buffer && this.children.buffer[i].id === id)
                return this.children.buffer[i];
            return null;
        }
    }

    MeshInGfxFind(progidx, vbidx){

        const count = this.gfxBuffer.length;
        for (let i = 0; i < count; i++) {
            if ( this.gfxBuffer[i].progidx === progidx && this.gfxBuffer[i].vbidx === vbidx){
                return i;
            }
        }
        
        return INT_NULL;
    }

    GetChildren() {
        return this.children;
    }

    /**
     * Debug
     */
    Print() {
        ScenesPrintSceneMeshes(this.children, 0)
    }
    PrintMeshInGfx() {
        console.log('PrintMeshInGfx:')
        for(let i=0; i<this.mesh_in_gfx.length; i++){
            
            console.log('prog, vb:', this.gfxBuffer[i], 'meshes:', this.mesh_in_gfx[i].count);
            for(let j=0; j<this.mesh_in_gfx[i].count; j++){
                console.log(
                    'name:', this.mesh_in_gfx[i].buffer[j].name
                    );
            }
        }
    }

};

class Scenes extends M_Buffer {

    constructor() {

        super();
    }

    Create() {

        const scene = new Scene(this.count);
        this.Add(scene);
        return scene;
    }

    GetChildren(idx) {
        return this.buffer[idx].GetChildren();
    }

}

const _scenes = new Scenes();
_scenes.Init(1);

export function Scenes_get_scene_by_idx(idx) { return _scenes.buffer[idx]; }
export function Scenes_create_scene() { return _scenes.Create(); }
export function Scenes_get_children(idx) { return _scenes.GetChildren(idx); }
export function Scenes_get_count() { return _scenes.active_count; }

export function Scenes_update_all_gfx_starts(sceneidx, progidx, vbidx, ret){

    const scene = _scenes.buffer[sceneidx];

    for (let i=0; i<scene.children.count; i++){
        if(scene.children.buffer[i])
            Scenes_update_all_gfx_starts_recursive(scene.children.buffer[i], progidx, vbidx, ret)
    }
}
export function Scenes_update_all_gfx_starts_recursive(mesh, progidx, vbidx, ret){
    
    if(mesh.children.count){
        
        for (let i=0; i<mesh.children.count; i++){
            
            const child = mesh.children.buffer[i];
            if(child) Scenes_update_all_gfx_starts_recursive(child, progidx, vbidx, ret)
        }
    }

    // Decrement all meshes start indices (that belong to the same vertex buffer) if they are 'positioned' after the removed mesh.
    if(mesh.gfx.vb.start > ret.start && mesh.gfx.prog.idx === progidx && mesh.gfx.vb.idx === vbidx){

        mesh.gfx.vb.start -= ret.counts[0];
        if(mesh.gfx.ib.start > 0) mesh.gfx.ib.start -= ret.counts[1];
    }
}

export function Scenes_update_all_gfx_starts2(sceneidx, progidx, vbidx, ret){

    const scene = _scenes.buffer[sceneidx];

    const idx = scene.MeshInGfxFind(progidx, vbidx); // Find in which index is the vertex buffer located. 
    const meshes = scene.mesh_in_gfx[idx]; // Get all meshes references of that specific vertex buffer

    for (let i=0; i<meshes.count; i++) {

        const start = meshes.buffer[i].gfx.vb.start
        
        // Decrement all meshes start indices if they are 'positioned' after the removed mesh in the vertex buffer.
        if(start > ret.start){

            meshes.buffer[i].gfx.vb.start += ret.counts[0];
            // if(meshes.buffer[i].gfx.ib.start > 0) mesh.gfx.ib.start += ret.counts[1]; // Also decrent the indexBuffer, if > 0. TODO!!!: implement correctly the index buffer, so we donot have to check for ib > 0
        }
    }

}

/**
 * Debug
 */
export function ScenesPrintSceneMeshes(array) {

    let total_count = 0;

    for (let i = 0; i < array.count; i++) {

        const mesh = array.buffer[i];
        if(mesh){

            console.log(i, mesh.name, mesh.geom.pos)
            total_count++;
        }
        
    }

    return total_count;
}

export function ScenesPrintAllMeshes(_children, count) {

    let total_count = 0;

    for (let i = 0; i < _children.count; i++) {

        const child = _children.buffer[i];

        // if(child === null)
        //     console.log('NULL child:', _children)
        
        if(child){

            let r = ' ';
    
            for (let j = 0; j < count; j++) r += '->';
            
            // console.log(i, r, child.id, GetMeshHighOrderNameFromType(child.type))
            console.log(i, r, child.name, FloorArr3(child.geom.pos));
            total_count++;
    
            if (child.children.count) {
                count++;
                total_count += ScenesPrintAllMeshes(child.children, count);
                count--;
            }
        }
    }

    return total_count;

}