"use strict";
import { RenderQueueGet } from './Renderers/Renderer/RenderQueue.js';
import { FramebuffersGet } from '../Graphics/Buffers/Renderbuffer.js';
import { Mesh } from './Drawables/Mesh.js';

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *  LOGIC:
 * TODO
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */




export class Scene {
    /**
     * The only reason a Scene has refferences to meshes is that:
     *      1. needs to have all programs and vertex buffers so it can toggle the drawing buffers
     *      2. the Button meshes may differ from scene to scene
     */
    sceneIdx = 0; // Scene ID (of type: SCENE const structure).
    buttons; // Must have all the buttons together in an array(of pointers) so that we can loop through only the buttons easily.
    btnCount;
    gfxBuffer; // Store the program and vertexBuffer indexes of all meshes of the app.
    meshBuffer

    constructor() {
        this.sceneIdx++;
        this.gfxBuffer = [];
        this.buttons = [];
        this.btnCount = 0;
    }


    AddMesh(mesh) {
        if(!(mesh instanceof Mesh)) {
            console.error('Cannot add mesh to scene. mesh= ', mesh)
            return;
        }
        const gfx = mesh.AddToGraphicsBuffer(this.sceneIdx);
        this.StoreGfxInfo(gfx);
    }
    StoreGfxInfo(gfxInfo) { // This is the way for a scene to know what and how many gfx buffers it's meshes have
        if (gfxInfo === undefined)
            console.log()

        // Check if the glVertexBuffer index of the current Mesh is already stored
        let found = false;
        const len = this.gfxBuffer.length;

        for (let i = 0; i < len; i++) {
            if (this.gfxBuffer[i].progIdx === gfxInfo.prog.idx && this.gfxBuffer[i].vbIdx === gfxInfo.vb.idx) {
                found = true;
                break;
            }
        }
        // Store it, if not stored.
        if (!found) {
            this.gfxBuffer.push({ progIdx: gfxInfo.prog.idx, vbIdx: gfxInfo.vb.idx, active: false });
        }
    }

};



// TODO: Implement in class
// export function ScenesLoadScene(sceneIdx) {

//     /**
//      * If there is not any previusly loaded scene(stored globally),
//      * find the scene by name and load it.
//      * If a previous scene is loaded,
//      * unload it and load the new scene. 
//      */
//     if (sceneIdx !== SCENE.active.idx) {
//         const idx = SCENE.active.idx; // Current loaded scene index
//         // Unload any previous scene.
//         if (idx !== INT_NULL) {
//             scenes.scene[idx].UnloadGfxBuffers();
//         }
//         // Load the new scene
//         const scene = scenes.GetScene(sceneIdx);
//         if (scene) scene.LoadGfxBuffers();
//         SCENE.active.idx = sceneIdx;
//     }
// }




// export function ScenesSetFramebufferQueue(){
//     const drawQueue = RenderQueueGet();
//     // Framebuffer0
//     const fb0 = FramebuffersGet(FRAMEBUFFERS_IDX.buffer0);
//     let meshGfxIdx = scenes.GetGfxIdx(APP_MESHES_IDX.buttons.play);
//     if (meshGfxIdx !== INT_NULL){
//         const progsLen = meshGfxIdx.length;
//         fb0.FbqInit(progsLen+1)
//         for (let i = 0; i < progsLen; i++) {
//             fb0.FbqStore(meshGfxIdx[i][0], meshGfxIdx[i][1])
//         }
//         // fb0.FbqStore(5, 0)
//         // fb0.FbqStore(1, 0)
//         // fb0.FbqStore(5, 3)
//         //TODO: Must remove from RenderQueue 

//         // drawQueue.Remove(5, 0);
//         // drawQueue.Remove(1, 0);
//         // drawQueue.Remove(5, 3);
//     }
// }


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Helper functions
 */
// function ScenesGetSceneName(sceneIdx) {
//     const name = SCENE_NAME[sceneIdx];
//     if (!name || name === undefined) alert('sceneIdx does not exist! At: ScenesGetSceneName(sceneIdx)');
//     return name;
// }


////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// DEBUG
// export function ScenesPrintAllGfxBuffers() {
//     scenes.PrintAllGfxBuffers();
// }


/* Old code */

// class Scene {
//     /**
//      * The only reason a Scene has refferences to meshes is that:
//      *      1. needs to have all programs and vertex buffers so it can toggle the drawing buffers
//      *      2. the Button meshes may differ from scene to scene
//      */
//     sceneIdx; // Scene ID (of type: SCENE const structure).
//     buttons; // Must have all the buttons together in an array(of pointers) so that we can loop through only the buttons easily.
//     btnCount;
//     gfxBuffer; // Store the program and vertexBuffer indexes of all meshes of the app.

//     constructor(sceneIdx) {
//         this.sceneIdx = sceneIdx;
//         this.gfxBuffer = [];
//         this.buttons = [];
//         this.btnCount = 0;
//     }


//     AddMesh(mesh, idx) {
//         if (!mesh || mesh === undefined) {
//             console.log('Mesh shouldn\'t be undefined. At: class Scene.AddMesh(). meshIdx:', idx);
//             return;
//         }

//         if (mesh instanceof Rect ||
//             mesh instanceof Player) {
//             this.StoreGfxBuffer(mesh.gfxInfo);
//         }
//         else if (mesh instanceof Shadow) {
//             this.StoreGfxBuffer(mesh.gfxInfo);
//         }
//         else if (mesh instanceof Bricks ||
//             mesh instanceof PowerUps ||
//             mesh instanceof Coins ||
//             mesh instanceof Balls ||
//             mesh instanceof Explosions ||
//             mesh instanceof Glow ||
//             mesh instanceof Vortex ||
//             mesh instanceof Twist ||
//             mesh instanceof Framebuffer ||
//             mesh instanceof Particles) {
//             this.StoreGfxBuffer(mesh.buffer[0].gfxInfo);
//         }
//         else if (mesh instanceof UiTextVariable) {
//             // Because constText and variText belong to the same buffer, 
//             // the gfx info of any letter is enough to store progIdx and vbIdx.
//             this.StoreGfxBuffer(mesh.constText.letters[0].gfxInfo);
//         }
//         else if (mesh instanceof AnimTexts) {
//             this.StoreGfxBuffer(mesh.buffer[0].text.letters[0].gfxInfo);
//         }
//         else if (mesh[0] !== undefined) {
//             this.StoreGfxBuffer(mesh[0].gfxInfo);
//         }
//         else if (mesh instanceof Button) {
//             // this.buttons.push(mesh);
//             this.buttons[this.btnCount] = mesh;
//             this.btnCount++;
//             this.StoreGfxBuffer(mesh.text.gfxInfo);
//             this.StoreGfxBuffer(mesh.area.gfxInfo);
//         }
//         else if (mesh instanceof TextLabel || mesh instanceof Text) {
//             this.StoreGfxBuffer(mesh.text.gfxInfo);
//             this.StoreGfxBuffer(mesh.area.gfxInfo);
//         }
//         else if (mesh instanceof ParticleSystem) { // For Fx
//             for (let i = 0; i < mesh.psBuffer.length; i++) {
//                 this.StoreGfxBuffer(mesh.psBuffer[i].buffer[0].gfxInfo);
//             }
//         }

//     }

//     /** Graphics */
//     StoreGfxBuffer(gfxInfo) { // This is the way for a scene to know what and how many gfx buffers it's meshes have
//         if (gfxInfo === undefined)
//             console.log()

//         // Check if gfx buffer index already stored
//         let found = false;
//         const len = this.gfxBuffer.length;

//         for (let i = 0; i < len; i++) {
//             if (this.gfxBuffer[i].progIdx === gfxInfo.prog.idx
//                 && this.gfxBuffer[i].vbIdx === gfxInfo.vb.idx) {
//                 found = true;
//                 break;
//             }
//         }
//         // If gfx buffer is not stored, store it
//         if (!found) {
//             this.gfxBuffer.push({ progIdx: gfxInfo.prog.idx, vbIdx: gfxInfo.vb.idx, active: false });
//         }
//     }
//     UnloadGfxBuffers() {
//         const len = this.gfxBuffer.length;
//         for (let i = 0; i < len; i++) {
//             GfxSetVbShow(this.gfxBuffer[i].progIdx, this.gfxBuffer[i].vbIdx, false);
//             this.gfxBuffer[i].active = false;
//         }
//     }
//     LoadGfxBuffers() {
//         const len = this.gfxBuffer.length;
//         for (let i = 0; i < len; i++) {
//             GfxSetVbShow(this.gfxBuffer[i].progIdx, this.gfxBuffer[i].vbIdx, true);
//             this.gfxBuffer[i].active = true;
//         }
//     }

//     // DEBUG
//     PrintAllGfxBuffers() {
//         const len = this.gfxBuffer.length;
//         for (let i = 0; i < len; i++) {
//             console.log(i, ': active ', this.gfxBuffer[i].active, ' prog:', this.gfxBuffer[i].progIdx, ' vb:', this.gfxBuffer[i].vbIdx)
//         }
//     }

// };

// class Scenes {

//     scene = [];
//     sceneCount = 0;

//     allMeshes = [];
//     allMeshesCount = 0;
//     count = APP_MESHES_IDX.count;

//     // Debug
//     name;

//     AddScene(scene) {
//         // this.scene[this.sceneCount++] = scene;
//         this.scene[scene.sceneIdx] = scene;
//         this.sceneCount++;
//         return scene.sceneIdx;
//     }
//     InitAllMeshesBuffer() { // Initialize the buffer to the count of all meshes(APP_MESHES_IDX.count)
//         for (let i = 0; i < this.count; i++) {
//             this.allMeshes[i] = null;
//         }
//     }
//     AddMesh(mesh, idx) {
//         this.allMeshes[idx] = mesh;
//         // if(meshBuffer) this.AddMesh(meshBuffer, idx);
//         // else this.scene.AddMesh(mesh, idx);
//     }
//     UnloadAllGfxBuffers() {
//         for (let i = 0; i < this.sceneCount; i++) {
//             if (!(this.scene[i].name === 'All Scenes'))
//                 this.scene[i].UnloadGfxBuffers();
//         }
//     }
//     GetGfxIdx(meshIdx) {
//         if (!this.allMeshes[meshIdx] || this.allMeshes[meshIdx] === undefined) {
//             console.log(`No mesh found at current allMeshes buffer. Probably mesh does not exist. \nmesh index:${meshIdx}`);
//             return INT_NULL;
//         }
//         // alert(`No mesh found at current allMeshes buffer. Probably mesh does not exist. \nmesh index:${meshIdx}`);
//         return this.allMeshes[meshIdx].GetGfxIdx();
//     }
//     SetPriority(meshIdx, flag) {
//         const meshGfxIdx = this.GetGfxIdx(meshIdx); //  Get an array of [[progIdx,vbIdx], [progIdx,vbIdx], ...] for all the meshes a widget may have
//         if (meshGfxIdx === INT_NULL) return;
//         const progsLen = meshGfxIdx.length;
//         for (let i = 0; i < progsLen; i++) {
//             RenderQueueSetPriority(flag, meshGfxIdx[i][0], meshGfxIdx[i][1]);
//         }
//     }
//     GetScene(sceneIdx) {
//         if (this.scene[sceneIdx]) return this.scene[sceneIdx];
//         alert(`No scene found with index:${sceneIdx}`)
//         return null;
//     }

//     // DEBUG
//     PrintAllGfxBuffers() {
//         const len = this.scene.length;
//         for (let i = 0; i < len; i++) {
//             console.log(`scene:${i} name:${this.scene[i].name}`)
//             this.scene[i].PrintAllGfxBuffers();
//         }
//     }

// };

// const scenes = new Scenes;
// export function ScenesGetScene(sceneIdx) {

//     if (sceneIdx < 0 || sceneIdx > scenes.count){{
//         console.error('Scene Index Out Of Bounds!');
//         // alert('Scene Index Out Of Bounds!');
//         return null;
//     }}

//     return scenes.scene[sceneIdx];
// }
// export function ScenesGetMesh(meshIdx) {
//     const mesh = scenes.allMeshes[meshIdx];
//     return mesh;
// }
// Set the gfx buffers to 'hidden', so that the meshes will not been drawn until the function
// export function ScenesUnloadAllScenes() {
//     scenes.UnloadAllGfxBuffers();
// }
