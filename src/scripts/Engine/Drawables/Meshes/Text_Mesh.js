"use strict";

import { GfxInfoMesh } from "../../../Graphics/GlProgram.js";
import { CalculateSdfOuterFromDim } from "../../../Helpers/Helpers.js";
import { AddArr3, CopyArr3 } from "../../../Helpers/Math/MathOperations.js";
import { Gfx_generate_context } from "../../Interfaces/Gfx/GfxContextCreate.js"; ``
import { GfxSetTex, Gfx_add_geom_mat_to_vb, Gfx_progs_set_vb_texidx } from "../../Interfaces/Gfx/GfxInterfaceFunctions.js";
import { FontGetUvCoords } from "../../Loaders/Font/Font.js";
import { Scenes_store_mesh_in_gfx } from "../../Scenes.js";
import { Find_gfx_from_parent_ascend_descend } from "../../Interfaces/Gfx/GfxContextFindMatch.js";
import { Info_listener_dispatch_event } from "../DebugInfo/InfoListeners.js";
import { Geometry2D_Text } from "../Geometry/Geometry2DText.js";
import { FontMaterial } from "../Material/Base/Material.js";
import { Mesh } from "./Base/Mesh.js";



export class Text_Mesh extends Mesh {

   constructor(text, pos = [0, 0, 0], fontSize = 4, color = WHITE, bold = 4, font = TEXTURES.SDF_CONSOLAS_LARGE, scale = [1, 1]) {

      const sdfouter = CalculateSdfOuterFromDim(fontSize);
      if (sdfouter + bold > 1) bold = 1 - sdfouter;
      const mat = new FontMaterial(color, font, text, [bold, sdfouter])
      const geom = new Geometry2D_Text(pos, fontSize, scale, text, font);


      super(geom, mat);
      this.SetName(text);
      this.type |= MESH_TYPES_DBG.TEXT_MESH;

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

      // Copy gfx, to pass new start for each character
      let gfxCopy = new GfxInfoMesh(this.gfx);
      let geomCopy = new Geometry2D_Text();
      geomCopy.Copy(this.geom)


      // Get the starting index of the text in the vertex buffer.
      this.mat.uv = FontGetUvCoords(this.mat.uvIdx, this.mat.text[0]);
      this.gfx.vb.start = Gfx_add_geom_mat_to_vb(this.sid, gfxCopy, geomCopy, this.mat, this.type & MESH_TYPES_DBG.UI_INFO_GFX, this.name);

      Scenes_store_mesh_in_gfx(this.sceneidx, this); // For storing meshes by its gfx

      for (let i = 1; i < geomCopy.num_faces; i++) {

         this.mat.uv = FontGetUvCoords(this.mat.uvIdx, ' ');
         if (this.mat.text[i])
            this.mat.uv = FontGetUvCoords(this.mat.uvIdx, this.mat.text[i]);

         // If texture exists, store texture index, else if font texture exists, store font texture index, else store null
         gfxCopy.tb.idx = this.mat.textidx !== INT_NULL ? this.mat.textidx : (this.mat.uvIdx !== INT_NULL ? this.mat.uvIdx : INT_NULL);

         geomCopy.pos[0] += geomCopy.dim[0] * 2;
         Gfx_add_geom_mat_to_vb(this.sid, gfxCopy, geomCopy, this.mat, this.type & MESH_TYPES_DBG.UI_INFO_GFX, this.name, this.idx);
      }

      Gfx_progs_set_vb_texidx(gfxCopy.progs_groupidx, gfxCopy.prog.idx, gfxCopy.vb.idx, gfxCopy.tb.idx); // Update the vertex buffer to store the texture index

      // Gfx_set_vb_show(gfxCopy.progs_groupidx,  gfxCopy.prog.idx, gfxCopy.vb.idx, true);

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

      const text = this.mat.text;

      const textLen = text.length;
      const len = this.geom.num_faces > textLen ? this.geom.num_faces : textLen;

      const charPos = [0, 0, 0];
      CopyArr3(charPos, this.geom.pos)

      // Copy gfx, to pass new start for each character
      let gfxCopy = new GfxInfoMesh(this.gfx);

      for (let i = 0; i < len; i++) {

         this.geom.UpdateFromPosXYZ(gfxCopy, charPos); // For text we need to give a 'next' position for every characters
         // console.log(this.geom.pos[0])
         gfxCopy.vb.start += gfxCopy.vb.boundary;
         gfxCopy.ib.start += gfxCopy.ib.boundary;
         charPos[0] += this.geom.dim[0] * 2;
      }
   }

   UpdateText(val) {

      if (!this.gfx) return; // Case replace text before insert to gfx buffers;

      var text = '';

      if (typeof (val) === 'number') text = `${val}`;
      else text = val;

      let gfxInfoCopy = new GfxInfoMesh(this.gfx);

      if (text === undefined)
         console.log()
      const textLen = text.length;
      const len = (this.geom.num_faces > textLen) ? this.geom.num_faces :
         (textLen > this.geom.num_faces ? this.geom.num_faces : textLen);

      // Update text faces
      for (let j = 0; j < len; j++) {

         let uvs = [0, 0, 0, 0];
         if (text[j] !== undefined) {
            uvs = FontGetUvCoords(this.mat.uvIdx, text[j]);
         }
         GfxSetTex(gfxInfoCopy, uvs);
         gfxInfoCopy.vb.start += gfxInfoCopy.vb.count
      }

   }

   /** Update a specific character in text char array */
   UpdateTextCharacter(char, idx) {

      if (!this.gfx) return; // Case replace text before insert to gfx buffers;

      var text = '';

      if (typeof (char) === 'number') text = `${char}`;
      else text = char;

      let gfxInfoCopy = new GfxInfoMesh(this.gfx);
      gfxInfoCopy.vb.start += gfxInfoCopy.vb.count * idx;

      const uvs = FontGetUvCoords(this.mat.uvIdx, char);

      GfxSetTex(gfxInfoCopy, uvs);

   }

   SetColorRGB(col) {
      this.mat.SetColorRGB(col, this.gfx, this.geom.num_faces)
   }

   /*******************************************************************************************************************************************************/
   // Setters-Getters

   GetMaxWidth() { return this.geom.dim[0] * (this.geom.num_faces) + 1; }

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


   /*******************************************************************************************************************************************************/
   // Helpers


}



