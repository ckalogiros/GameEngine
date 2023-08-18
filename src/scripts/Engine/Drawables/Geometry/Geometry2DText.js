"use strict";

import { GlAddGeometry } from "../../../Graphics/Buffers/GlBuffers.js";
import { GfxInfoMesh } from "../../../Graphics/GlProgram.js";
import { FontGetFontDimRatio } from "../../Loaders/Font/Font.js";
import { Geometry2D } from "./Base/Geometry.js";


export class Geometry2D_Text extends Geometry2D {

   numChars;
   text;

   constructor(pos, fontSize, scale, text, texId = INT_NULL) {

      let dim = [0, 0]
      dim = [fontSize, fontSize];

      if (texId !== INT_NULL) {

         dim[1] *= FontGetFontDimRatio(texId);
         pos[0] += fontSize; // Case pos is set to 0, then we must add half text face width.
      }

      super(pos, dim, scale);

      this.text = text;
      this.numChars = text.length;
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

      for (let i = 0; i < this.numChars; i++) {

         GlAddGeometry(sid, charPos, this.dim, this.time, gfxCopy, meshName, 1)
         gfxCopy.vb.start += gfxCopy.vb.count;
         gfxCopy.ib.start += gfxCopy.ib.count;
         charPos[0] += this.dim[0] * 2;
      }
   }

   Move(x, y, gfx) {
      this.MoveXYConcecutive(x, y, gfx, this.numChars)
   }

   CalcTextWidth(){
      return this.numChars * this.dim[0] * 2;
   }   
}