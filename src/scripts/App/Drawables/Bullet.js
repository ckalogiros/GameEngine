"use strict";

import { MeshBuffer, TempMesh } from "../../Engine/Drawables/MeshBuffer.js";
import { Rect } from "../../Engine/Drawables/Shapes/Rect.js";
import { AtlasTextureGetCoords } from "../../Engine/Loaders/Textures/Texture.js";
import { TimersCreateTimer } from "../../Engine/Timer/Timer.js";
import { GlAddMesh } from "../../Graphics/GlBuffers.js";
import { PlayerGetPos } from "./Player.js";



let gun = null;


/**
 * Power Up Bullet for Gun
 */

const BULLET_MAX_COUNT = 10;

export class Bullet extends TempMesh {
   constructor(sid, col, dim, scale, tex, pos, isActive) {
      super('bullet', sid, col, dim, scale, tex, pos, null, null, null);
   }
}
export class Bullets extends MeshBuffer {

   constructor() {
      super(BULLET_MAX_COUNT, 'Bullets');
   }

   Init(sceneIdx) {
      // const sid = SID_DEFAULT_TEXTURE;
      const sid = SID_DEFAULT | SID.FX.FS_NOISE;
      const dim = [BULLET.WIDTH, BULLET.HEIGHT];
      const color = PINK_240_60_160;
      const pos = [OUT_OF_VIEW, OUT_OF_VIEW, BULLET.Z_INDEX];// Set the pos of every un-rendered ball out of view
      const tex = null;
      // const tex = ATLAS_TEX_COORDS[ATLAS_TEX_NAMES.BULLET];
      let isActive = false;

      for (let i = 0; i < this.size; i++) {
         this.buffer[i] = new Bullet(sid, color, dim, [1.0, 1.0], tex, pos, isActive);
         super.Init(sceneIdx, this.name, i);
      }
   }
   Create(pos) {
      super.Create(pos, WHITE, BULLET.Z_INDEX);
   }
   Destroy(idx) {
      super.Clear(idx);
      this.buffer[idx].SetPosXY([OUT_OF_VIEW, OUT_OF_VIEW]); // Stop drawing by setting the mesh far away
   }
   Update() {
      if (this.count) {
         for (let i = 0; i < this.size; i++) {
            if (this.buffer[i].isActive) {
               if (this.buffer[i].mesh.pos[1] < STAGE.MENU.HEIGHT * 2)
                  this.Destroy(i);
               else{
                  this.buffer[i].MoveY(-BULLET.SPEED);
                  this.buffer[i].SetGlobalTimeAttr();
                  // this.buffer[i].SetTimeAttr();
               }
            }
         }
      }
   }
   Collision(pos, dim) {
      if (this.count) {
         // Calculate target's collision area
         const left = pos[0] - dim[0];
         const right = pos[0] + dim[0];
         const bottom = pos[1] + dim[1];
         for (let i = 0; i < this.size; i++) {
            if (this.buffer[i].isActive) {
               // Cash bullet's collision area
               const blleft = this.buffer[i].mesh.pos[0] - this.buffer[i].mesh.dim[0];
               const blright = this.buffer[i].mesh.pos[0] + this.buffer[i].mesh.dim[0];
               const bltop = this.buffer[i].mesh.pos[1] - this.buffer[i].mesh.dim[1];
               
               // If bullet collides, destroy bullet.
               if (bltop < bottom && blleft > left && blright < right) {
                  this.Destroy(i);
                  return true;
               }
            }
         }
      }
   }
   GetGfxIdx() {
      /** Get rect's prog and vertexBuffer indexes. All balls are rendered with the same VS and FS */
      return this.buffer[0].GetGfxIdx();
   }
}

function TimerCLBK(param){
   console.log(`timer clbk. bullet idx: ${param}`)
}

const bullets = new Bullets;
export function BulletCreate() {
   bullets.Create(gun.mesh.pos);
   gun.DecrementBullet();
}
export function BulletGet() {
   return bullets;
}



export class Gun extends Rect {
   isActive;
   numBullets; // Counter on how many bullets the player has to spend
   constructor() {
      const sid = SID_DEFAULT_TEXTURE
      const texCoord = AtlasTextureGetCoords(ATLAS_TEX_NAMES.GUN);
      const col = WHITE;
      const dim = [GUN.WIDTH, GUN.HEIGHT];
      const pos = [OUT_OF_VIEW, OUT_OF_VIEW, GUN.Z_INDEX];
      const scale = [1, 1];
      super('gun', sid, col, dim, scale, texCoord, pos, null, null);

      this.isActive = false;
      this.numBullets = 0;
      this.gfxInfo = GlAddMesh(this.sid, this.mesh, 1, SCENE.stage, 'gun', GL_VB.ANY, NO_SPECIFIC_GL_BUFFER);
   }
   Create(numBullets, pos) {
      this.numBullets += numBullets;
      if (!pos) {
         pos = PlayerGetPos();
      }
      this.SetPos(pos);
      this.isActive = true;
      g_state.mode.powUp.gun = true;
   }
   Destroy() {
      this.SetPos([OUT_OF_VIEW, OUT_OF_VIEW]);
      this.isActive = false;
      g_state.mode.powUp.gun = false; // This is what we check on the global state to run any updates on the gun-bullet powUp
   }
   Update() {
      this.SetPosX(PLAYER.XPOS);
      bullets.Update();

   }
   DecrementBullet() {
      this.numBullets--;
      if (this.numBullets <= 0) { // If no bullets left for the player, destroy the gun.
         this.Destroy();
      }
   }
   GetGfxIdx() {
      /** Get rect's prog and vertexBuffer indexes. All balls are rendered with the same VS and FS */
      return this.GetGfxIdx();
   }
}


export function GunInit() {
   if (!gun) gun = new Gun;
   else alert('Gun allready created');
}
export function GunGet() {
   return gun;
}
export function GunUpdate() {
   return gun.Update();
}