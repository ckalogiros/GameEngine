"use strict";

import { GlSetTex } from "../../../Graphics/Buffers/GlBufferOps.js";
import { Gl_remove_geometry } from "../../../Graphics/Buffers/GlBuffers.js";
import { GfxInfoMesh } from "../../../Graphics/GlProgram.js";
import { CalculateSdfOuterFromDim } from "../../../Helpers/Helpers.js";
import { CopyArr2, CopyArr3 } from "../../../Helpers/Math/MathOperations.js";
import { Gfx_deactivate } from "../../Interfaces/Gfx/GfxContext.js";
import { FontGetUvCoords } from "../../Loaders/Font/Font.js";
import { Scenes_remove_mesh, Scenes_update_all_gfx_starts } from "../../Scenes.js";
import { Geometry2D_Text } from "../Geometry/Geometry2DText.js";
import { FontMaterial } from "../Material/Base/Material.js";
import { Mesh } from "./Base/Mesh.js";



export class Text extends Mesh {

   constructor(text, pos = [0, 0, 0], fontSize = 4, scale = [1, 1], color = WHITE, bold = 4, font = TEXTURES.SDF_CONSOLAS_LARGE) {

      const sdfouter = CalculateSdfOuterFromDim(fontSize);
      if (sdfouter + bold > 1) bold = 1 - sdfouter;
      const mat = new FontMaterial(color, font, text, [bold, sdfouter])
      const geom = new Geometry2D_Text(pos, fontSize, scale, text, font);

      super(geom, mat);
   }

   Destroy(){

      console.log('text_mesh destroy');

      // Remove from gfx buffers.
      const ret = Gl_remove_geometry(this.gfx, this.geom.num_faces)
      Scenes_update_all_gfx_starts(this.sceneIdx, this.gfx.prog.idx, this.gfx.vb.idx, ret);

      // Remove event listeners
      this.RemoveAllListenEvents();

      // Remove time intervals
      if (this.timeIntervalsIdxBuffer.active_count) {

         for(let i=0; i<this.timeIntervalsIdxBuffer.boundary; i++){

            const intervalIdx = this.timeIntervalsIdxBuffer.buffer[i];
            TimeIntervalsDestroyByIdx(intervalIdx);
            this.timeIntervalsIdxBuffer.RemoveByIdx(i);
         }
      }

      if(this.parent) this.parent.RemoveChildByIdx(i); // Remove the current mesh from the parent

      // Remove from scene
      Scenes_remove_mesh(this);

   }

   /*******************************************************************************************************************************************************/
   // Graphics
   GenGfxCtx(FLAGS, gfxidx) {

      this.gfx = Gfx_generate_context(this.sid, this.sceneIdx, this.mat.num_faces, FLAGS, gfxidx);
      return this.gfx;
   }

   AddToGfx() {

      this.geom.AddToGraphicsBuffer(this.sid, this.gfx, this.name);
      const start = this.mat.AddToGraphicsBuffer(this.sid, this.gfx);
      return start;
   }

   SetZindex(z) {
      this.geom.SetZindex(z, this.gfx, this.mat.num_faces)
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

      if(!this.gfx) return; // Case replace text before insert to gfx buffers;

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
         GlSetTex(gfxInfoCopy, uvs);
         gfxInfoCopy.vb.start += gfxInfoCopy.vb.count
      }

   }

   SetColorRGB(col) {
      this.mat.SetColorRGB(col, this.gfx, this.geom.num_faces)
   }

   /*******************************************************************************************************************************************************/
   Align_pre(target_mesh, flags, pad = [0, 0]) { // Align pre-added to the vertexBuffers

      const pos = [0, 0];
      const dim = this.geom.dim;
      CopyArr2(pos, this.geom.pos);
      let ypos = pos[1] + dim[1] * 2;

      if (flags & ALIGN.VERTICAL) {

         for (let i = 0; i < this.children.boundary; i++) {

            const child = this.children.buffer[i];
            pos[1] = ypos;
            child.geom.Reposition_pre(pos);
            ypos += child.geom.dim[1] * 2;
         }
      }


      if (flags & ALIGN.LEFT) {

         const pos = [0, 0];
         CopyArr2(pos, this.geom.pos);
         // Vertical allignment
         pos[1] = target_mesh.geom.pos[1];
         // Horizontal allignment
         pos[0] = (target_mesh.geom.pos[0] - target_mesh.geom.dim[0]) + (this.geom.dim[0]) + pad[0];
         CopyArr2(this.geom.pos, pos);

      }
      else if (flags & ALIGN.RIGHT) {

         const pos = [0, 0];
         CopyArr2(pos, this.geom.pos);
         // Vertical allignment
         pos[1] = target_mesh.geom.pos[1];
         // Horizontal allignment
         const num_faces = (this.geom.num_faces - 1 > 1) ? this.geom.num_faces - 1 : 1;
         pos[0] = (target_mesh.geom.pos[0] + target_mesh.geom.dim[0]) - (this.geom.dim[0] * 2 * num_faces) - pad[0];
         CopyArr2(this.geom.pos, pos);

      }
   }


   /*******************************************************************************************************************************************************/
   // Helpers


}



