"use strict";

import { GlAddGeometry, GlHandlerAddGeometryBuffer } from "../../../Graphics/Buffers/GlBuffers.js";
import { GfxInfoMesh } from "../../../Graphics/GlProgram.js";
import { Geometry2D } from "../Geometry.js";


export class TextGeometry2D extends Geometry2D {

   numChars;
   text;

   constructor(pos, fontSize, scale, text) {
      const dim = [fontSize, fontSize];
      super(pos, dim, scale);
      this.text = text;
      this.numChars = text.length;
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
         charPos[0] += this.dim[0] * 2 ;
      }
   }

   MoveXY(pos, gfx) {
      this.MoveXYConcecutive(pos, gfx, this.numChars)
  }
}