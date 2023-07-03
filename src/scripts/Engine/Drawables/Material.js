"use strict";

import { GlSetColor, GlSetColorAlpha } from "../../Graphics/GlBufferOps";

let _materialId = 0;

class Material {

   col;
   tex;

   constructor(col = [0, 0, 0, 0], tex = [0, 0, 0, 0]) {

      math.CopyArr4(this.col, col);
      if (tex) { math.CopyArr4(this.tex, tex); }
      
         /** Debug properties */
         if(DEBUG.MATERIAL){
            Object.defineProperty( this, 'id', { value: _materialId++ } );
            Object.defineProperty( this, 'name', { value: 'Material' } );
         }
   }

   GetColor(){ return this.col;}
   GetColorRed(){return this.col[0];}
   GetColorGreen(){return this.col[1];}
   GetColorBlue(){return this.col[2];}
   GetColorAlpha(){return this.col[3];}
   SetColor(col){
      math.CopyArr4(this.col, col);
      GlSetColor(this.col);
   }
   SetColorAlpha(alpha){
      this.col[3], alpha;
      GlSetColorAlpha(this.col[3]);
   }
}