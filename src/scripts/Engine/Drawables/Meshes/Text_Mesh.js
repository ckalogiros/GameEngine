"use strict";

import { GfxInfoMesh, Gl_progs_set_vb_texidx } from "../../../Graphics/GlProgram.js";
import { CalculateSdfOuterFromDim } from "../../../Helpers/Helpers.js";
import { CopyArr3 } from "../../../Helpers/Math/MathOperations.js";
import { Gfx_deactivate, Gfx_generate_context, Gfx_remove_geometry } from "../../Interfaces/Gfx/GfxContext.js";
import { GfxSetTex, Gfx_add_geom_mat_to_vb, Gfx_progs_set_vb_texidx } from "../../Interfaces/Gfx/GfxInterfaceFunctions.js";
import { FontGetUvCoords } from "../../Loaders/Font/Font.js";
import { Scenes_remove_mesh_from_gfx, Scenes_remove_root_mesh, Scenes_store_gfx_to_buffer, Scenes_update_all_gfx_starts } from "../../Scenes.js";
import { TimeIntervalsDestroyByIdx } from "../../Timers/TimeIntervals.js";
import { Info_listener_dispatch_event } from "../DebugInfo/InfoListeners.js";
import { Geometry2D_Text } from "../Geometry/Geometry2DText.js";
import { FontMaterial } from "../Material/Base/Material.js";
import { Mesh } from "./Base/Mesh.js";



export class Text_Mesh extends Mesh {

   constructor(text, pos = [0, 0, 0], fontSize = 4, scale = [1, 1], color = WHITE, bold = 4, font = TEXTURES.SDF_CONSOLAS_LARGE) {

      const sdfouter = CalculateSdfOuterFromDim(fontSize);
      if (sdfouter + bold > 1) bold = 1 - sdfouter;
      const mat = new FontMaterial(color, font, text, [bold, sdfouter])
      const geom = new Geometry2D_Text(pos, fontSize, scale, text, font);


      super(geom, mat);
      this.SetName(text);
      this.type |= MESH_TYPES_DBG.TEXT_MESH;
   }

   Destroy() {

      // console.log('text_mesh destroy:', this.name);

      // Remove event listeners
      this.RemoveAllListenEvents();

      // Remove time intervals
      if (this.timeIntervalsIdxBuffer.active_count) {

         for (let i = 0; i < this.timeIntervalsIdxBuffer.boundary; i++) {

            const intervalIdx = this.timeIntervalsIdxBuffer.buffer[i];
            TimeIntervalsDestroyByIdx(intervalIdx);
            this.timeIntervalsIdxBuffer.RemoveByIdx(i);
         }
      }

      // Remove from gfx buffers.
      const ret = Gfx_remove_geometry(this.gfx, this.geom.num_faces)
      Scenes_update_all_gfx_starts(this.sceneidx, this.gfx.prog.idx, this.gfx.vb.idx, ret); // Update the gfx.start of all meshes that are inserted in the same vertex buffer.
      // Remove from scene
      Scenes_remove_root_mesh(this, this.sceneidx);
      const error = Scenes_remove_mesh_from_gfx(this.sceneidx, this.gfx.prog.idx, this.gfx.vb.idx, this.gfx.scene_gfx_mesh_idx); // Remove mesh from the scene's gfx buffer
      if (error) {
         console.error('Mesh:', this.name)
      }


      if (this.parent) this.parent.RemoveChildByIdx(this.idx); // Remove the current mesh from the parent

   }

   /*******************************************************************************************************************************************************/
   // Graphics
   GenGfxCtx(FLAGS, gfxidx) {

      this.gfx = Gfx_generate_context(this.sid, this.sceneidx, this.geom.num_faces, FLAGS, gfxidx);
      Scenes_store_gfx_to_buffer(this.sceneidx, this);
      return this.gfx;
   }

   AddToGfx() {

      // this.geom.AddToGraphicsBuffer(this.sid, this.gfx, this.name);
      // const start = this.mat.AddToGraphicsBuffer(this.sid, this.gfx);

      // Copy gfx, to pass new start for each character
      let gfxCopy = new GfxInfoMesh(this.gfx);
      let geomCopy = new Geometry2D_Text();
      geomCopy.Copy(this.geom)
      let matCopy = new FontMaterial();
      matCopy.Copy(this.mat)

      for (let i = 0; i < geomCopy.num_faces; i++) {
         // for (let i = 0; i < 0; i++) {

         matCopy.uv = FontGetUvCoords(matCopy.uvIdx, ' ');
         if (matCopy.text[i])
            matCopy.uv = FontGetUvCoords(matCopy.uvIdx, matCopy.text[i]);

         // If texture exists, store texture index, else if font texture exists, store font texture index, else store null
         gfxCopy.tb.idx = matCopy.textidx !== INT_NULL ? matCopy.textidx : (matCopy.uvIdx !== INT_NULL ? matCopy.uvIdx : INT_NULL);

         Gfx_add_geom_mat_to_vb(this.sid, gfxCopy, geomCopy, matCopy);
         geomCopy.pos[0] += geomCopy.dim[0] * 2;
         gfxCopy.vb.start += gfxCopy.vb.count;
         gfxCopy.ib.start += gfxCopy.ib.count;
      }

      Gfx_progs_set_vb_texidx(gfxCopy.prog.idx, gfxCopy.vb.idx, gfxCopy.tb.idx); // Update the vertex buffer to store the texture index


   }

   DeactivateGfx() {

      Gfx_deactivate(this.gfx);
      this.is_gfx_inserted = false;
   }


   SetZindex(z) {
      this.geom.SetZindex(z, this.gfx, this.geom.num_faces)      // const params = {
      //    progidx: this.gfx.prog.idx,
      //    vbidx: this.gfx.vb.idx,
      //    sceneidx: this.sceneidx,
      //    isActive: true,
      //    isPrivate: (FLAGS & GFX.PRIVATE) ? true : false,
      // }
      // Info_listener_dispatch_event(INFO_LISTEN_EVENT_TYPE.GFX, {added_gfx:params});
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

   GetTotalWidth() { return this.geom.dim[0] * (this.geom.num_faces) + 1; }

   GetTotalHeight() { return this.geom.dim[1]; }

   GetCenterPosX() { return this.geom.pos[0] + this.GetTotalWidth() - this.geom.dim[0]; }

   GetCenterPosY() { return this.geom.pos[1] - this.GetTotalHeight() + this.geom.dim[1]; }


   /*******************************************************************************************************************************************************/
   // Helpers


}



