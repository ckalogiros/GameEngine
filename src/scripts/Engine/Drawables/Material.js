"use strict";

import * as math from '../../Helpers/Math/MathOperations.js'
import { GlSetColor, GlSetColorAlpha } from "../../Graphics/Buffers/GlBufferOps.js";
import { GlAddMaterial } from '../../Graphics/Buffers/GlBuffers.js';

let _materialId = 0;

export class Material {

   sid;
   col;
   tex;

   constructor(col = [0, 0, 0, 0], tex = null) {

      this.sid = {
         attr: SID.ATTR.COL4,
         pass: 0,
      };
      if(tex) this.sid = SID.ATTR.TEX2;

      this.col = [0,0,0,0];
      math.CopyArr4(this.col, col);
      if (tex) { math.CopyArr4(this.tex, tex); }

      /** Debug properties */
      if (DEBUG.MATERIAL) {
         Object.defineProperty(this, 'id', { value: _materialId++ });
         Object.defineProperty(this, 'type', { value: 'Material' });
      }
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////
   AddToGraphicsBuffer(sid, gfx) {
      GlAddMaterial(sid, gfx, this.col, this.tex, this.style)
   }
   
   
   ////////////////////////////////////////////////////////////////////////////////////////////////////////
   GetColor() { return this.col; }
   GetColorRed() { return this.col[0]; }
   GetColorGreen() { return this.col[1]; }
   GetColorBlue() { return this.col[2]; }
   GetColorAlpha() { return this.col[3]; }
   SetColor(col) {
      math.CopyArr4(this.col, col);
      GlSetColor(this.col);
   }
   SetColorAlpha(alpha) {
      this.col[3], alpha;
      GlSetColorAlpha(this.col[3]);
   }
   
   ////////////////////////////////////////////////////////////////////////////////////////////////////////
   SetStyle(border = 0, rCorners = 0, feather = 0){
      this.style = {
         border:border,
         rCorners:rCorners,
         feather:feather,
      }
      this.sid.attr |= (SID.ATTR.BORDER | SID.ATTR.R_CORNERS | SID.ATTR.FEATHER) | SID.ATTR.PARAMS1; 
   }

}