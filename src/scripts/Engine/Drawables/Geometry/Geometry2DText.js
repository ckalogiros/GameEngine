"use strict";

import { GlAddGeometry } from "../../../Graphics/Buffers/GlBuffers.js";
import { GfxInfoMesh } from "../../../Graphics/GlProgram.js";
import { CopyArr2 } from "../../../Helpers/Math/MathOperations.js";
import { FontGetFontDimRatio } from "../../Loaders/Font/Font.js";
import { Geometry2D } from "./Base/Geometry.js";


export class Geometry2D_Text extends Geometry2D {

   num_faces;
   text;
   char_ratio;

   constructor(pos, fontSize, scale, text, texId = INT_NULL) {

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

   //////////////////////////////////////////////////////////////
   AddToGraphicsBuffer(sid, gfx, meshName) {

      const charPos = [0, 0, 0];
      charPos[0] = this.pos[0];
      charPos[1] = this.pos[1];
      charPos[2] = this.pos[2];

      // Copy gfx, to pass new start for each character
      let gfxCopy = new GfxInfoMesh(gfx);

      for (let i = 0; i < this.num_faces; i++) {

         GlAddGeometry(sid, charPos, this.dim, this.time, gfxCopy, meshName, 1)
         gfxCopy.vb.start += gfxCopy.vb.count;
         gfxCopy.ib.start += gfxCopy.ib.count; 
         charPos[0] += this.dim[0] * 2;
      }
   }


   MoveXY(x, y, gfx) {
      this.MoveXYConcecutive(x, y, gfx, this.num_faces)
   }

   CalcTextWidth(){
      return this.num_faces * this.dim[0] * 2;
   }   

   Reposition_pre(pos){
      CopyArr2(this.pos, pos)
      CopyArr2(this.defPos, pos)
   }
}