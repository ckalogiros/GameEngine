import { GlAddMesh } from "../../Graphics/GlBuffers.js";
import { Rect } from "./Shapes/Rect.js";

export class TempMesh extends Rect{

   /** TODO: Timer is included in Mesh.Maybe use that one...    */
   timer = {
      has: false,
      t: null,
   };

   constructor(name, sid, col, dim, scale, tex, pos, style, time, attrParams1) {
      super(name, sid, col, dim, scale, tex, pos, style, time, attrParams1); 
      this.timer.t = this.mesh.time;
   }
   SetSize(attr_params_idx, size){
      this.mesh.attrParams1[attr_params_idx] = size;
      super.UpdateParams1Attr(attr_params_idx)
   }
   UpdateSize(attr_params_idx){
      super.UpdateParams1Attr(attr_params_idx)
   }
   SetDim(dim) {
      super.SetDim(dim);
   }
};

export class MeshBuffer {
   buffer;
   size;
   count;
   // For Debug Only
   name;

   constructor(size, name) {
      this.buffer = [];
      this.size = size;
      this.count = 0;
      this.name = name;
   }

   Create(pos, col, z_index) {
      this.count++;
      // Catch buffer overflow
      if (this.count >= this.size) {
         console.log(`Max Size:${this.size}  current count:${this.count}`);
         alert(`ERROR. Buffer overflow for meshbuffer: ${this.name}`);
      }
      const idx = this.GetFreeElem();
      this.buffer[idx].isActive = true;
      this.buffer[idx].SetColor(col);
      this.buffer[idx].SetPosXY(pos);
      if (z_index) this.buffer[idx].SetZindex(z_index);
      return idx;
   }
   Clear(idx) {
      this.buffer[idx].isActive = false;
      // this.buffer[idx].SetPosXY([OUT_OF_VIEW, OUT_OF_VIEW]); // Stop drawing by setting the mesh far away
      this.count--;
   }
   Init(sceneIdx, name, i) {

      this.buffer[i].name = name;

      this.buffer[i].gfxInfo = GlAddMesh(
         this.buffer[i].sid,
         this.buffer[i].mesh,
         1,
         sceneIdx,
         name,
         GL_VB.ANY,
         NO_SPECIFIC_GL_BUFFER
      );

      this.buffer[i].SetTimeAttr(this.buffer[i].timer.t);
   }
   GetFreeElem() {
      for (let i = 0; i < this.size; i++) {
         if (!this.buffer[i].isActive)
            return i;
      }
      alert(`No more space in buffer to create an explosion. GetFreeElem() - MeshBuffer.js`);
   }
   GetGfxIdx() {
      /** Get all widget's progs and vertexBuffer indexes */
      return [ [this.buffer[0].gfxInfo.prog.idx, this.buffer[0].gfxInfo.vb.idx], ];
   }
}; 