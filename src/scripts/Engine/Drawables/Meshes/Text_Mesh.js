"use strict";

import { GfxInfoMesh, Gl_progs_set_vb_texidx } from "../../../Graphics/GlProgram.js";
import { CalculateSdfOuterFromDim } from "../../../Helpers/Helpers.js";
import { AddArr3, CopyArr3 } from "../../../Helpers/Math/MathOperations.js";
import { Gfx_generate_context } from "../../Interfaces/Gfx/GfxContextCreate.js"; ``
// import { FontGetUvCoords } from "../../Loaders/Font/Font.js";
import { Scenes_store_mesh_in_gfx } from "../../Scenes.js";
import { Find_gfx_from_parent_ascend_descend } from "../../Interfaces/Gfx/GfxContextFindMatch.js";
import { Info_listener_dispatch_event } from "../DebugInfo/InfoListeners.js";
import { Geometry2D_Text } from "../Geometry/Geometry2DText.js";
import { FontMaterial } from "../Material/Base/Material.js";
import { Mesh } from "./Base/Mesh.js";
import { Font_get_atlas_texture_metrics, Font_get_char_atlas_bounds, Font_get_char_plane_bounds, Font_get_char_uv_coords } from "../../Loaders/Font/ChlumskyFontMetricsLoader.js";
import { GlSetDim, GlSetDimY, GlSetTex, GlSetWposXY } from "../../../Graphics/Buffers/GlBufferOps.js";
import { Gl_add_geom_mat_to_vb } from "../../../Graphics/Buffers/GlBuffers.js";



export class Text_Mesh extends Mesh {

   fontsize; // TODO: TEMP. Move it to mat or geom or Mesh?
   constructor(text, pos = [0, 0, 0], fontsize = 4, color = WHITE, bold = 4, font = TEXTURES.MSDF_CONSOLAS_1024, scale = [1, 1]) {

      const sdfouter = CalculateSdfOuterFromDim(fontsize);
      if (sdfouter + bold > 1) bold = 1 - sdfouter;
      const mat = new FontMaterial(color, font, text, [bold, sdfouter])
      const geom = new Geometry2D_Text(pos, fontsize, scale, text, font);



      super(geom, mat);
      this.SetName(text);
      this.type |= MESH_TYPES_DBG.TEXT_MESH;
      this.fontsize = fontsize;
   }

   /*******************************************************************************************************************************************************/
   // Graphics
   GenGfxCtx(FLAGS, gfxidx) {

      if (FLAGS & GFX_CTX_FLAGS.PRIVATE) {

         const gfxidxs = Find_gfx_from_parent_ascend_descend(this, this.parent);
         FLAGS |= gfxidxs.text.FLAGS; // NOTE: The only way to pass .PRIVATE to 'Gfx_generate_context()'
         this.gfx = Gfx_generate_context(this.sid, this.sceneidx, this.geom.num_faces, FLAGS, gfxidxs.text.idxs);
      }
      else {
         this.gfx = Gfx_generate_context(this.sid, this.sceneidx, this.geom.num_faces, FLAGS, gfxidx);
      }

      return this.gfx;
   }

   AddToGfx() {

      Scenes_store_mesh_in_gfx(this.sceneidx, this); // For storing meshes by its gfx
      
      // Copy gfx, to pass new start for each character
      let gfxcopy = new GfxInfoMesh(this.gfx);
      let geomcopy = new Geometry2D_Text();
      geomcopy.Copy(this.geom)

      gfxcopy.tb.idx = this.mat.texidx;

      for (let i = 0; i < geomcopy.num_faces; i++) {
         
         if (this.mat.text[i]){
            
            this.mat.uv = Font_get_char_uv_coords(this.mat.uvIdx, this.mat.text[i]);
            const plane_bounds = Font_get_char_plane_bounds(this.mat.uvIdx, this.mat.text[i]);
            
            geomcopy.dim[0] *= plane_bounds.width;
            geomcopy.dim[1] *= plane_bounds.height;
            
            const yoffset = plane_bounds.yoffset;
            geomcopy.pos[1] += yoffset*this.fontsize;
            
         }
         else { // Case the text changed to a shorter text, fill up the absent texts in the graphics buffer with empty text(space char).
            this.mat.uv = Font_get_char_uv_coords(this.mat.uvIdx, ' ');
         }

         geomcopy.pos[0] += this.geom.dim[0];
         // geomcopy.pos[0] += this.geom.dim[0]; // Half advance current face width
         const start = Gl_add_geom_mat_to_vb(this.sid, gfxcopy, geomcopy, this.mat, this.type & MESH_TYPES_DBG.UI_INFO_GFX, `${this.mat.text[i]} in: ${this.name}`, this.idx);
         // geomcopy.pos[0] += geomcopy.dim[0]; // Half advance current face width

         if(i===0) this.gfx.vb.start = start; // Start of mesh in the vertex buffer hasn't been set from the GenGfx. So we only need the start of the first character in the vertex buffer. All the rest starts are calculated on the fly.

         // Reset geometry copy
         geomcopy.dim[0] = this.geom.dim[0]; geomcopy.dim[1] = this.geom.dim[1]; geomcopy.pos[1] = this.geom.pos[1]; 
      }

      // BUG: If one text has by mistake a different 'this.mat.uvIdx', then the vb will store that uv-map index. Cause a vertex buffer may use only one texture.
      Gl_progs_set_vb_texidx(gfxcopy.prog.groupidx, gfxcopy.prog.idx, gfxcopy.vb.idx, gfxcopy.tb.idx); // Update the vertex buffer to store the texture index

      const params = {
         progidx: this.gfx.prog.idx,
         vbidx: this.gfx.vb.idx,
         sceneidx: this.sceneidx,
         isActive: true,
         isPrivate: (FLAGS & GFX_CTX_FLAGS.PRIVATE) ? true : false,
         type: INFO_LISTEN_EVENT_TYPE.GFX.UPDATE_VB,
      }
      Info_listener_dispatch_event(INFO_LISTEN_EVENT_TYPE.GFX.UPDATE, params);

   }

   SetZindex(z) {
      this.geom.SetZindex(z, this.gfx, this.geom.num_faces)      // const params = {
   }

   UpdatePosXYZ() {

      alert()
      const text = this.mat.text;

      const textLen = text.length;
      const len = this.geom.num_faces > textLen ? this.geom.num_faces : textLen;

      const charPos = [0, 0, 0];
      CopyArr3(charPos, this.geom.pos)

      // Copy gfx, to pass new start for each character
      let gfxcopy = new GfxInfoMesh(this.gfx);

      for (let i = 0; i < len; i++) {

         this.geom.UpdateFromPosXYZ(gfxcopy, charPos); // For text we need to give a 'next' position for every characters
         // console.log(this.geom.pos[0])
         gfxcopy.vb.start += gfxcopy.vb.boundary;
         gfxcopy.ib.start += gfxcopy.ib.boundary;
         charPos[0] += this.geom.dim[0] * 2;
      }
   }

   UpdateText(_text) {

      if (!this.gfx) return; // Case replace text before insert to gfx buffers;

      let text = '';
      if (typeof (_text) === 'number') text = `${_text}`;
      else text = _text;

      const gfxInfoCopy = new GfxInfoMesh(this.gfx);
      const geomcopy = new Geometry2D_Text();
      geomcopy.Copy(this.geom)

      const numchars = text.length;
      const len = (this.geom.num_faces > numchars) ? this.geom.num_faces :
         (numchars > this.geom.num_faces ? this.geom.num_faces : numchars);

      // Update text faces
      for (let i = 0; i < len; i++) {

         let uvs = [0, 0, 0, 0];
         if (text[i] !== undefined) {
            uvs = Font_get_char_uv_coords(this.mat.uvIdx, text[i]);

            if(text[i] !== ' '){

               const plane_bounds = Font_get_char_plane_bounds(this.mat.uvIdx, text[i]);
               geomcopy.dim[0] *= plane_bounds.width;
               geomcopy.dim[1] *= plane_bounds.height;
               geomcopy.pos[1] += plane_bounds.yoffset * this.fontsize;
               GlSetDim(gfxInfoCopy, geomcopy.dim);
               GlSetWposXY(gfxInfoCopy, geomcopy.pos);
            }
            geomcopy.pos[0] += this.geom.dim[0]; // Advance xpos to next character.
            geomcopy.dim[0] = this.geom.dim[0]; geomcopy.dim[1] = this.geom.dim[1]; geomcopy.pos[1] = this.geom.pos[1]; // Reset 
         }
         GlSetTex(gfxInfoCopy, uvs);
         gfxInfoCopy.vb.start += gfxInfoCopy.vb.count
      }
   }

   /** Update a specific character in text char array */
   UpdateTextCharacter(_text, idx) {

      if (!this.gfx) return; // Case replace text before insert to gfx buffers;

      let text = '';
      if (typeof (_text) === 'number') text = `${_text}`;
      else text = _text;

      let gfxInfoCopy = new GfxInfoMesh(this.gfx);
      gfxInfoCopy.vb.start += this.gfx.vb.start + (gfxInfoCopy.vb.count * idx); // Calc the characters position inside the char array.

      // if(text !== ' '){

      // }
      const geomcopy = new Geometry2D_Text();
      geomcopy.Copy(this.geom);

      const plane_bounds = Font_get_char_plane_bounds(this.mat.uvIdx, text);
      geomcopy.dim[0] *= plane_bounds.width;
      geomcopy.dim[1] *= plane_bounds.height;
      geomcopy.pos[1] += plane_bounds.yoffset * this.fontsize;
      GlSetDim(gfxInfoCopy, geomcopy.dim);
      GlSetWposXY(gfxInfoCopy, geomcopy.pos);
      geomcopy.pos[0] += this.geom.dim[0];
      geomcopy.dim[0] = this.geom.dim[0]; geomcopy.dim[1] = this.geom.dim[1]; geomcopy.pos[1] = this.geom.pos[1]; 

      const uvs = Font_get_char_uv_coords(this.mat.uvIdx, _text);
      GlSetTex(gfxInfoCopy, uvs);
   }

   SetColorRGB(col) {
      this.mat.SetColorRGB(col, this.gfx, this.geom.num_faces)
   }

   /*******************************************************************************************************************************************************/
   // Setters-Getters

   GetMaxWidth() { return this.geom.dim[0]/2 * (this.geom.num_faces) + 1; }

   GetTotalHeight() { return this.geom.dim[1]; }

   GetCenterPosX() { return this.geom.pos[0] + this.GetMaxWidth() - this.geom.dim[0]; }

   // GetCenterPosY() { return this.geom.pos[1] - this.GetTotalHeight() + this.geom.dim[1]; }
   // NOTE: We do not count all the lines of the text, probably because we need to place the first line of a multiline text, and the next line ypos is calculated based on the first one(in case of type Widget_Dynamic_Text_Mesh) 
   GetCenterPosY() { return this.geom.pos[1] - this.geom.dim[1]; }


   /*******************************************************************************************************************************************************/
   // Alignment

   Reposition_pre(pos_dif) {

      AddArr3(this.geom.pos, pos_dif);
   }

}



