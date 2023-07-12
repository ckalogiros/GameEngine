"use strict";

import * as math from '../../Helpers/Math/MathOperations.js'
import { GlSetColor, GlSetColorAlpha } from "../../Graphics/Buffers/GlBufferOps.js";
import { GlAddMaterial } from '../../Graphics/Buffers/GlBuffers.js';

let _materialId = 0;

export const MAT_ENABLE = {
   UNIF_RESOLUTION: 1,
   ATTR_STYLE: 2,

   NONE: 0,
}

// TODO: rename '_params'
// export const Mat_enable_shader_params = {
//    uniform:{
//       resolution: false,

//       Reset(){
//          this.resolution = false;
//       },
//    },

//    Enable(id){
//       if(which.isArray()){
//          const count = id.length;
//          for(let i = 0; i < count; i++){
//             this.ChecCase(id[i]);
//          }

//       }
//       else{
//          this.ChecCase(id);
//       }
//    },
//    CheckCase(id){
//       switch(id){
//          case MAT_ENABLE.UNIF_RESOLUTION:{
//             this.uniform.resolution = true;
//             break;
//          }

//          default: console.error('Enable material\'s param failed. @ Material.js');
//       }
//    },
//    Reset(){
//       this.uniform.Reset();
//    },
// };



export class Material {

   sid;
   col;
   tex;

   constructor(col = [0, 0, 0, 0], tex = null) {

      this.sid = {
         attr: SID.ATTR.COL4,
         unif: 0,
         pass: 0,
      };
      if (tex) this.sid = SID.ATTR.TEX2;

      this.col = [0, 0, 0, 0];
      math.CopyArr4(this.col, col);
      if (tex) { math.CopyArr4(this.tex, tex); }

      this.alreadyAdded = false; // To check if the shaders have been created

      /** Debug properties */
      if (DEBUG.MATERIAL) {
         Object.defineProperty(this, 'id', { value: _materialId++ });
         Object.defineProperty(this, 'type', { value: 'Material' });
      }
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////
   AddToGraphicsBuffer(sid, gfx) {
      GlAddMaterial(sid, gfx, this.col, this.tex, this.style);
      this.alreadyAdded = true;
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
   Enable(which) {

      if (this.alreadyAdded === true) {
         console.error(`You are trying to enable ${which} but the shaders have been already created. Try Enable() before inserting the mesh to a Scene().`);
      }

      if (Array.isArray(which)) {
         const count = which.length;
         for (let i = 0; i < count; i++) {
            this.CheckCase(which[i]);
         }

      }
      else {
         this.CheckCase(which);
      }

      // Initialize style attribute
      this.style = {
         border: 0,
         rCorners: 0,
         feather: 0,
      }
   }
   CheckCase(which) {
      switch (which) {
         case MAT_ENABLE.UNIF_RESOLUTION: {
            this.sid.unif |= SID.UNIF.BUFFER_RES; // Enable the screen resolution to be contructed as a uniform in the vertex shader, to be used in the fragment shader.
            break;
         }
         case MAT_ENABLE.ATTR_STYLE: {
            this.sid.attr |= (SID.ATTR.BORDER | SID.ATTR.R_CORNERS | SID.ATTR.FEATHER) | SID.ATTR.PARAMS1 | SID.ATTR.EMPTY;
            break;
         }
         default: console.error('Enable material\'s shader param failed. @ Material.js');
      }
   }

   SetStyle(border = 0, rCorners = 0, feather = 0) {
      this.style = {
         border: border,
         rCorners: rCorners,
         feather: feather,
      }
      // this.sid.attr |= (SID.ATTR.BORDER | SID.ATTR.R_CORNERS | SID.ATTR.FEATHER) | SID.ATTR.PARAMS1 | SID.ATTR.EMPTY; 
   }

   SetNewAttribute(attribName = null,) {

   }
   SetNewUniform() { }

}