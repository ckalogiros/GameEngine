"use strict";

import { GlSetWposY } from "../../../Graphics/Buffers/GlBufferOps.js";
// import { GlAddGeometry } from "../../../Graphics/Buffers/GlBuffers.js";
import { GfxInfoMesh } from "../../../Graphics/GlProgram.js";
import { CopyArr2 } from "../../../Helpers/Math/MathOperations.js";
import { GfxUpdatePosXY } from "../../Interfaces/Gfx/GfxInterfaceFunctions.js";
import { FontGetFontDimRatio } from "../../Loaders/Font/Font.js";
import { Geometry2D } from "./Base/Geometry.js";


export class Geometry2D_Text extends Geometry2D {

   text;
   char_ratio;

   constructor(pos=[0,0,0], fontSize=4, scale=[0,0], text='', texId = INT_NULL) {

      let dim = [0, 0]
      dim = [fontSize, fontSize];

      if (texId !== INT_NULL) {

         var char_ratio = FontGetFontDimRatio(texId);
         dim[1] *= char_ratio;
         pos[0] += fontSize; // Case pos is set to 0, then we must add half text face width.
      }

      super(pos, dim, scale);

      this.char_ratio = char_ratio;
      this.text = text;
      this.num_faces = text.length;
      this.type |= MESH_TYPES_DBG.TEXT_GEOMETRY2D;
   }

   /*******************************************************************************************************************************************************/
   // Graphics
   // AddToGraphicsBuffer(sid, gfx, meshName) {

   //    const charPos = [0, 0, 0];
   //    charPos[0] = this.pos[0];
   //    charPos[1] = this.pos[1];
   //    charPos[2] = this.pos[2];

   //    // Copy gfx, to pass new start for each character
   //    let gfxCopy = new GfxInfoMesh(gfx);

   //    for (let i = 0; i < this.num_faces; i++) {

   //       GlAddGeometry(sid, charPos, this.dim, this.time, gfxCopy, meshName, 1)
   //       gfxCopy.vb.start += gfxCopy.vb.count;
   //       gfxCopy.ib.start += gfxCopy.ib.count;
   //       charPos[0] += this.dim[0] * 2;
   //    }
   // }

   MoveXYZ(pos, gfx) {
      super.MoveXYZ(pos, gfx, this.num_faces)
   }

   MoveXY(x, y, gfx) {
      super.MoveXY(x, y, gfx, this.num_faces)
   }

   SetPosXYZ(pos, gfx) {
      super.SetPosXYZ(pos, gfx, this.num_faces)
   }

   SetPosY(y, gfx) {
      this.pos[1] = y;
      GlSetWposY(gfx, y, this.num_faces);
   }

   UpdatePosXY(gfx) {

      /**
       * For text face position update, we must calculate the x pos of each face.
       */

      const charPos = [0, 0];
      charPos[0] = this.pos[0];
      charPos[1] = this.pos[1];

      // Copy gfx, to pass new start for each character
      let gfxCopy = new GfxInfoMesh(gfx);
      for (let i = 0; i < this.num_faces; i++) {

         GfxUpdatePosXY(gfxCopy, charPos);
         gfxCopy.vb.start += gfxCopy.vb.count;
         charPos[0] += this.dim[0] * 2;
      }
   }

   /*******************************************************************************************************************************************************/
   // Helpers
   CalcTextWidth() {
      return this.num_faces * this.dim[0] * 2;
   }

   Reposition_pre(pos) {
      CopyArr2(this.pos, pos)
      CopyArr2(this.defPos, pos)
   }


   Copy(geom = {}) {

      if (geom instanceof Geometry2D) {

         super.Copy(geom);

         this.text = geom.text;
         this.char_ratio = geom.char_ratio;

      }
   }
}