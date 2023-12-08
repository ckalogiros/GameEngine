"use strict";

import * as math from '../../../../Helpers/Math/MathOperations.js'
import { GlSetColor, GlSetColorAlpha, GlSetColorPerVertex } from "../../../../Graphics/Buffers/GlBufferOps.js";
import { GlHandlerAddMaterialBuffer } from '../../../../Graphics/Buffers/GlBuffers.js';
import { FontGetUvCoords } from '../../../Loaders/Font/Font.js';
import { GfxInfoMesh } from '../../../../Graphics/GlProgram.js';
import { TextureLoadTexture } from '../../../Loaders/Textures/Texture.js';
import { Gfx_progs_set_vb_texidx } from '../../../Interfaces/Gfx/GfxInterfaceFunctions.js';

let _materialId = 0;

let _cnt = 1;
export const MAT_ENABLE = {
   ATTR_VERTEX_COLOR: _cnt++,
   ATTR_VERTEX_GRADIENT_HORIZONTAL: _cnt++,
   ATTR_VERTEX_GRADIENT_VERTICAL: _cnt++,

   NONE: 0,
   LEN: _cnt,
}

function TEMP_checkIfFontTexture(id){
   for(let textidx in FONTS){
      if(id === FONTS[textidx] && textidx !== 'COUNT') return true;
   }
   return false;
}

export class Material {

   sid;
   col;
   defCol;
   uv;
   texId;
   textidx;
   uvIdx;
   hasFontTex;
   type = 0;
   style;
   num_faces;

   constructor(col = [1,1,1,1], texId = INT_NULL) {

      this.sid = {
         shad: 0,
         attr: SID.ATTR.COL4,
         unif: 0,
         pass: 0,
      };
      
      this.col = [0,0,0,0];
      math.CopyArr4(this.col, col);
      this.defCol = [0,0,0,0];
      math.CopyArr4(this.defCol, col);
  
      this.uv = [0, 1, 0, 1];

      this.textidx = INT_NULL;
      this.uvIdx  = INT_NULL;

      this.hasFontTex = false;
      this.num_faces = 1;

      if(texId !== INT_NULL) {

         this.texId = texId;
         this.sid.attr |= SID.ATTR.TEX2; // Enable texture rendering
         
         // Check if texture is a font texture
         if(TEMP_checkIfFontTexture(texId)){
            this.sid.shad |= SID.SHAD.TEXT_SDF; // Enable texture rendering
            this.sid.attr |= SID.ATTR.SDF; // Enable texture rendering
            this.hasFontTex = true;
         }
      }

      // Initialize style attribute
      this.style = [0, 0, 0] 
      
      this.alreadyAdded = false; // To check if the shaders have been created

      this.type |= MESH_TYPES_DBG.MATERIAL;

      /** Debug properties */
      if (DEBUG.MATERIAL) {
         Object.defineProperty(this, 'id', { value: _materialId++ });
         // Object.defineProperty(this, 'type', { value: 'Material' });
      }
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////
   AddToGraphicsBuffer(sid, gfx) {

      GlAddMaterial(sid, gfx, this.col, this.uv, this.style, this.num_faces);
      this.alreadyAdded = true;
      
   }


   ////////////////////////////////////////////////////////////////////////////////////////////////////////
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
      if(gfx.sid.attr & SID.ATTR.COL4_PER_VERTEX){
         GlSetColorPerVertex(gfx, math.Mult_mat4_scalar2(this.col, 1.3));
      }
      else {
         GlSetColor(gfx, math.Mult_arr4_scalar2(this.col, 1.3));
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
   SetDefaultColor(gfx) {
      math.CopyArr4(this.col, this.defCol);
      GlSetColor(gfx, this.col, this.num_faces);
   }
   SetColorRGB(col, gfx) {
      math.CopyArr3(this.col, col);
      GlSetColor(gfx, this.col, this.num_faces);
   }
   SetColorAlpha(alpha, gfx) {
      this.col[3] = alpha;
      GlSetColorAlpha(gfx, this.col[3], this.num_faces);
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////
   // Enable shader properties 
   EnableGfxAttributes(which, params = {}) {

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
         this.CheckCase(which, params);
      }

   }
   CheckCase(which, params = {}) {
      switch (which) {
         case MAT_ENABLE.ATTR_VERTEX_COLOR: {
            // this.sid.attr |= SID.ATTR.COL4_PER_VERTEX;
            this.sid.attr &= ~ SID.ATTR.COL4;
            this.sid.attr |= SID.ATTR.COL4_PER_VERTEX;
            
            if(DEBUG.CORE && !Object.hasOwn(params, 'color')){
               alert(`Property of:${params} does not exist. Make sure you pass the corect property with the parameter. @ Material.js`);
               return null;
            }
            this.col = params.color;
            break;
         }
         default: console.error('Enable material\'s shader param failed. @ Material.js');
      }
   }
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
         this.texId = mat.texId;
         this.textidx = mat.textidx;
         this.uvIdx = mat.uvIdx;
         this.hasFontTex = mat.hasFontTex;
         this.type = mat.type;
         this.num_faces = mat.num_faces;

		}
	}
}

export class FontMaterial extends Material {

   text;
   sdf_params;

   constructor(col = [1,1,1,1], texId=INT_NULL, text='', sdf_params = [.5,.5]) {

      super(col, texId);
      this.text = text;
      this.num_faces = text.length;
      this.sdf_params = [0, 0];
      math.CopyArr2(this.sdf_params, sdf_params);

      // Create texture
      const indexes = TextureLoadTexture(this.texId);

      this.textidx = indexes.textidx;
      this.uvIdx = indexes.uvIdx;
      if(this.textidx === INT_NULL) console.error('2222222 Texture Index is NULL')

      this.type |= MESH_TYPES_DBG.FONT_MATERIAL;
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////
   AddToGraphicsBuffer(sid, gfx) {

      // Copy gfx, so that we pass the start index of each text-face based on the previous face.
      // At the end, there is only one gfx variable, for the first text-face. So we must calculate in
      // order to address anyy other face of a text mesh.
      let gfxCopy = new GfxInfoMesh(gfx);

      for (let i = 0; i < this.num_faces; i++) {

         let uv = FontGetUvCoords(this.uvIdx, ' ');
         if(this.text[i])
            uv = FontGetUvCoords(this.uvIdx, this.text[i]);
            
            GlAddMaterial(sid, gfxCopy, this.col, uv, this.style, this.sdf_params, 1);
            gfxCopy.vb.start += gfxCopy.vb.count;
            
            // If texture exists, store texture index, else if font texture exists, store font texture index, else store null
            gfx.tb.idx = this.textidx !== INT_NULL ? this.textidx : (this.uvIdx !== INT_NULL ? this.uvIdx : INT_NULL);
            
            if(this.textidx === INT_NULL) 
               console.error('Texture Index is NULL')

         if(DEBUG.MESH_ALL_UVS) console.log('uv:', uv)
            
      }
      Gfx_progs_set_vb_texidx(gfx.progs_groupidx, gfx.prog.idx, gfx.vb.idx, gfx.tb.idx); // Update the vertex buffer to store the texture index
      
      return gfxCopy.vb.start;
   }

   Copy(mat = {}){

		if (mat instanceof FontMaterial) {

			super.Copy(mat);
         this.text = mat.text;
         math.CopyArr2(this.sdf_params, mat.sdf_params);

		}
	}

}

export class Material_TEMP_fromBufferFor3D extends Material{
   
   constructor(col, texId){
      super(col, texId);
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////
   AddToGraphicsBuffer(sid, gfx) {

      GlHandlerAddMaterialBuffer(sid, gfx, this.col, null);
      this.alreadyAdded = true;
   }
}
