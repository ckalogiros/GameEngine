"use strict";

import * as math from '../../../../Helpers/Math/MathOperations.js'
import { GlSetColor, GlSetColorAlpha } from "../../../../Graphics/Buffers/GlBufferOps.js";
import { GlAddMaterial, GlHandlerAddMaterialBuffer } from '../../../../Graphics/Buffers/GlBuffers.js';
import { FontGetUvCoords } from '../../../Loaders/Font/Font.js';
import { GfxInfoMesh, GlSetTexture } from '../../../../Graphics/GlProgram.js';
import { TextureLoadTexture } from '../../../Loaders/Textures/Texture.js';

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
   for(let texIdx in FONTS){
      if(id === FONTS[texIdx] && texIdx !== 'COUNT') return true;
   }
   return false;
}

export class Material {

   sid;
   col;
   defCol;
   uv;
   texId;
   texIdx;
   uvIdx;
   hasFontTex;
   type = 0;

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

      this.texIdx = INT_NULL;
      this.uvIdx  = INT_NULL;

      this.hasFontTex = false;

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
      this.style = {
         border: 0,
         rCorners: 0,
         feather: 0,
      }
      
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

      GlAddMaterial(sid, gfx, this.col, this.uv, this.style);
      this.alreadyAdded = true;
   }


   ////////////////////////////////////////////////////////////////////////////////////////////////////////
   GetColor() { return this.col; }
   GetColorRed() { return this.col[0]; }
   GetColorGreen() { return this.col[1]; }
   GetColorBlue() { return this.col[2]; }
   GetColorAlpha() { return this.col[3]; }
   SetColor(col, gfx) {
      math.CopyArr4(this.col, col);
      GlSetColor(gfx, this.col);
   }
   SetDefaultColor(gfx) {
      math.CopyArr4(this.col, this.defCol);
      GlSetColor(gfx, this.col);
   }
   SetColorRGB(col, gfx) {
      math.CopyArr3(this.col, col);
      GlSetColor(gfx, this.col);
   }
   SetColorAlpha(alpha) {
      this.col[3], alpha;
      GlSetColorAlpha(this.col[3]);
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
   SetStyle(border = 3, rCorners = 0, feather = 4) {
      this.style = {
         border: border,
         rCorners: rCorners,
         feather: feather,
      }
   }
   SetNewAttribute(attribName = null,) { }
   SetNewUniform() { }

}
export class FontMaterial extends Material {

   text;
   numChars;
   sdfParams;


   constructor(col = [1,1,1,1], texId, text, sdfParams = [.5,.5]) {

      super(col, texId);
      this.text = text;
      this.numChars = text.length;
      this.sdfParams = [0, 0];
      math.CopyArr2(this.sdfParams, sdfParams);

      // Create texture
      const indexes = TextureLoadTexture(this.texId);

      this.texIdx = indexes.texIdx;
      this.uvIdx = indexes.uvIdx;
      if(this.texIdx === INT_NULL) console.error('2222222 Texture Index is NULL')

      this.type |= MESH_TYPES_DBG.FONT_MATERIAL;
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////
   AddToGraphicsBuffer(sid, gfx) {

      // Copy gfx, so that we pass the start index of each text-face based on the previous face.
      // At the end, there is only one gfx variable, for the first text-face. So we must calculate in
      // order to address anyy other face of a text mesh.
      let gfxCopy = new GfxInfoMesh(gfx);
      for (let i = 0; i < this.numChars; i++) {

         const uv = FontGetUvCoords(this.uvIdx, this.text[i]);
         if(DEBUG.MESH_ALL_UVS) console.log('uv:', uv)
         GlAddMaterial(sid, gfxCopy, this.col, uv, this.style, this.sdfParams);
         gfxCopy.vb.start += gfxCopy.vb.count;
         
         // If texture is exists, store texture index, else if font texture exists, store font texture index, else store null
         gfx.tb.idx = this.texIdx !== INT_NULL ? this.texIdx : (this.uvIdx !== INT_NULL ? this.uvIdx : INT_NULL);
         if(this.texIdx === INT_NULL) 
            console.error('Texture Index is NULL')
            
      }
      GlSetTexture(gfx.prog.idx, gfx.vb.idx, gfx.tb.idx); // Update the vertex buffer to store the texture index
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
