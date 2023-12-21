"use strict";

import * as math from '../../../../Helpers/Math/MathOperations.js'
import { GlSetColor, GlSetColorAlpha, GlSetColorPerVertex } from "../../../../Graphics/Buffers/GlBufferOps.js";
import { Texture_load_texture_byid } from '../../../Loaders/Textures/Texture.js';


let _materialId = 0;

let _cnt = 1;
export const MAT_ENABLE = {
   ATTR_VERTEX_COLOR: _cnt++,
   ATTR_VERTEX_GRADIENT_HORIZONTAL: _cnt++,
   ATTR_VERTEX_GRADIENT_VERTICAL: _cnt++,

   NONE: 0,
   LEN: _cnt,
}

export class Material {

   sid;
   col;
   defCol;
   type;
   style;

   uvIdx;
   texidx;
   uv;
   
   constructor(col = [1,1,1,1]) {

      this.sid = {
         shad: 0,
         attr: SID.ATTR.COL4,
         unif: 0,
         pass: 0,
      };
      
      this.col = [0,0,0,1];
      math.CopyArr4(this.col, col);
      this.defCol = [0,0,0,0];
      math.CopyArr4(this.defCol, col);
  
      this.uv = [0,1,0,1];
      this.texidx = INT_NULL;
      this.uvIdx  = INT_NULL;

      // Initialize style attribute
      this.style = [0, 0, 0];
      
      this.alreadyAdded = false; // To check if the shaders have been created

      this.type = MESH_TYPES_DBG.MATERIAL;

      /** Debug properties */
      if (DEBUG.MATERIAL) {
         Object.defineProperty(this, 'id', { value: _materialId++ });
         // Object.defineProperty(this, 'type', { value: 'Material' });
      }
   }

   GetColor() { return this.col; }
   GetColorRed() { return this.col[0]; }
   GetColorGreen() { return this.col[1]; }
   GetColorBlue() { return this.col[2]; }
   GetColorAlpha() { return this.col[3]; }
   SetColor(col, gfx) {
      if(gfx.sid.attr & SID.ATTR.COL4_PER_VERTEX){
         math.CopyMat4(this.col, col);
         GlSetColorPerVertex(gfx, this.col);
      }
      else {
         math.CopyArr4(this.col, col);
         GlSetColor(gfx, this.col);
      }
   }
   SetHoverColor(gfx) {
      const intensity = 1.4;
      if(gfx.sid.attr & SID.ATTR.COL4_PER_VERTEX){
         GlSetColorPerVertex(gfx, math.Mult_mat4_scalar2(this.col, intensity));
      }
      else {
         GlSetColor(gfx, math.Mult_arr4_scalar2(this.col, intensity));
      }
   }
   SeHoverColortDefault(gfx) {
      if(gfx.sid.attr & SID.ATTR.COL4_PER_VERTEX){
         math.CopyMat4(this.col, this.defCol);
         GlSetColorPerVertex(gfx, this.col);
      }
      else {
         math.CopyArr4(this.col, this.defCol);
         GlSetColor(gfx, this.col);
      }
   }
   SetDefaultColor(gfx, num_faces) {
      math.CopyArr4(this.col, this.defCol);
      GlSetColor(gfx, this.col, num_faces);
   }
   SetColorRGB(col, gfx, num_faces) {
      math.CopyArr3(this.col, col);
      GlSetColor(gfx, this.col, num_faces);
   }
   SetColorAlpha(alpha, gfx, num_faces) {
      this.col[3] = alpha;
      GlSetColorAlpha(gfx, this.col[3], num_faces);
   }

   // Enable shader properties 
   // EnableGfxAttributes(which, params = {}) {

   //    if (this.alreadyAdded === true) {
   //       console.error(`You are trying to enable ${which} but the shaders have been already created. Try Enable() before inserting the mesh to a Scene().`);
   //    }

   //    if (Array.isArray(which)) {
   //       const count = which.length;
   //       for (let i = 0; i < count; i++) {
   //          this.CheckCase(which[i]);
   //       }

   //    }
   //    else {
   //       this.CheckCase(which, params);
   //    }

   // }
   // CheckCase(which, params = {}) {
   //    switch (which) {
   //       case MAT_ENABLE.ATTR_VERTEX_COLOR: {
   //          // this.sid.attr |= SID.ATTR.COL4_PER_VERTEX;
   //          this.sid.attr &= ~ SID.ATTR.COL4;
   //          this.sid.attr |= SID.ATTR.COL4_PER_VERTEX;
            
   //          if(DEBUG.CORE && !Object.hasOwn(params, 'color')){
   //             alert(`Property of:${params} does not exist. Make sure you pass the corect property with the parameter. @ Material.js`);
   //             return null;
   //          }
   //          this.col = params.color;
   //          break;
   //       }
   //       default: console.error('Enable material\'s shader param failed. @ Material.js');
   //    }
   // }
   SetStyle(style) {
      if(!Array.isArray(style)) console.error
      math.CopyArr3(this.style, style); 
   }
   SetNewAttribute(attribName = null,) { }
   SetNewUniform() { }

   Copy(mat = {}){

		if (mat instanceof Material) {

         this.shad = mat.sid.shad; 
         this.attr = mat.sid.attr; 
         this.unif = mat.sid.unif; 
         this.pass = mat.sid.pass;  
         math.CopyArr4(this.col, mat.col);
         math.CopyArr4(this.defCol, mat.defCol);
         math.CopyArr4(this.uv, mat.uv);
         math.CopyArr3(this.style, mat.style);
         this.type = mat.type;
         this.texidx = mat.texidx;
         this.uvIdx = mat.uvIdx;

		}
	}
}

export class FontMaterial extends Material {

   text;
   sdf_params;

   constructor(col = [1,1,1,1], texidx=INT_NULL, text='', sdf_params = [.5,.5]) {

      super(col, texidx);
      this.text = text;
      this.sdf_params = [0, 0];
      math.CopyArr2(this.sdf_params, sdf_params);
      this.texidx = texidx;

      // Create tex_idxs
      const tex_idxs = Texture_load_texture_byid(this.texidx, TEXTURE_TYPE.TYPE_FONT);

      // this.sid.shad |= SID.SHAD.; // Enable tex_idxs rendering
      this.sid.shad |= SID.SHAD.PRE_MULTIPLIED_ALPHA; // E
      this.sid.attr |= SID.ATTR.TEX2; // 
      // this.sid.attr |= SID.ATTR.SDF; // 
      this.sid.attr |= SID.ATTR.MSDF; // 

      this.texidx = tex_idxs.texidx;
      this.uvIdx = tex_idxs.uvmapidx;
      /**DEBUG*/if(this.texidx === INT_NULL) console.error('2222222 Texture Index is NULL')

      this.type |= MESH_TYPES_DBG.FONT_MATERIAL;
   }
}

/**
 * If tex_idxs is a ready atlas tex_idxs, imported to the engine,
 *    we should have metrics for it, so get the uvs from the metrics
 * If tex_idxs is a framebuffer tex_idxs, created from the engine,
 *    1. If it is an atlas tex_idxs, the uvs are calculated at the creation site of the framebuffer,
 *    2. The uvs are 0-1 covering the whole tex_idxs 
 */
export class Texture_Material extends Material {

   constructor(col = [1,1,1,1], textureid=INT_NULL) {

      super(col);
      
      this.sid.attr |= SID.ATTR.TEX2; // Enable texture coordinates for the vertex shader
      
      const tex_idxs = Texture_load_texture_byid(textureid, TEXTURE_TYPE.TYPE_TEXTURE);  
      this.texidx = tex_idxs.texidx;

      // Uvs are already set to: this.uv = [0, 1, 0, 1];
      /**DEBUG*/if(this.texidx === INT_NULL) console.error('2222222 Texture Index is NULL')
      this.type |= MESH_TYPES_DBG.TEXTURE_MATERIAL;
   }
}

export class Material_TEMP_fromBufferFor3D extends Material{
   
   // constructor(col, texidx){
   //    super(col, texidx);
   // }

   // ////////////////////////////////////////////////////////////////////////////////////////////////////////
   // AddToGraphicsBuffer(sid, gfx) {

   //    GlHandlerAddMaterialBuffer(sid, gfx, this.col, null);
   //    this.alreadyAdded = true;
   // }
}
