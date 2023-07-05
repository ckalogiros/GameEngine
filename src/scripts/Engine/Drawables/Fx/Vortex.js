import { Rect } from "../Shapes/Rect.js";
import { TimerGetGlobalTimer } from "../../Timer/Timer.js";
import { GlGetProgram } from "../../../Graphics/GlProgram.js";

// For readability of the attribute params1 array vector
const VORTEX_ATTR_PARAMS1 = {
   countIdx: 0, // The size attr parameter is at index 0
};


class VortexMesh extends Rect {

   isActive = false;
   timer = {
      has: false,
      t: null,
   };

   constructor(name, sid, col, dim, scale, tex, pos, style, time, attrParams1) {
      super(name, sid, col, dim, scale, tex, pos, style, time, attrParams1); // Pass .5 to time attribute. The lesser the val 
      this.timer.t = this.mesh.time;
   }
   SetUniformRadius(val) {
      const prog = GlGetProgram(this.gfxInfo.prog.idx);
      prog.UniformsSetuniformsBufferValue(val, UNIFORM_PARAMS.VORTEX.radiusIdx);
   }
   SetAttribParams1_Count(count) {
      this.mesh.attrParams1[VORTEX_ATTR_PARAMS1.countIdx] = count;
      this.UpdateParams1Attr(VORTEX_ATTR_PARAMS1.countIdx);
   }

};
export class Vortex {
   buffer;
   size;
   count;

   // Debug
   name;
   exists;

   constructor(size, name) {
      this.buffer = [];
      this.size = size;
      this.count = 0;
      this.name = name;
      this.exists = false;
   }

   Create(col, pos, dim, hasTimer) {
      const idx = this.GetFreeElem();
      this.buffer[idx].isActive = true;
      this.count++;
      // Catch buffer overflow
      if (this.count > this.size) {
         console.log(`Max Size:${this.size}  current count:${this.count}`);
         alert(`ERROR. Buffer overflow for Vortex mesh: name: ${this.name}`);
      }

      this.buffer[idx].timer.has = hasTimer;

      this.buffer[idx].SetColor(col);
      this.buffer[idx].SetPosXY(pos);
      this.buffer[idx].SetDim(dim);
      this.buffer[idx].SetUniformRadius(dim[0]);
      this.buffer[idx].SetAttribParams1_Count(0);

      return idx;
   }
   Clear(idx) {
      this.buffer[idx].isActive = false;
      this.buffer[idx].mesh.time = .2;
      this.buffer[idx].SetPosXY([OUT_OF_VIEW, OUT_OF_VIEW]); // Stop drawing by setting the mesh far away
      this.count--;
   }
   Init(name, sid, color, dim) {
      for (let i = 0; i < this.size; i++) {
         this.buffer[i] = new VortexMesh(
            name + i,
            SID_MIN | sid,
            color,
            dim,
            [1,1], null, [306, 74, VORTEX.Z_INDEX], null, TimerGetGlobalTimer(), null
         );
         this.buffer[i].gfxInfo = GlAddMesh(
            this.buffer[i].sid,
            this.buffer[i].mesh,
            1,
            SCENE.all,
            'Vortex Shader',
            GL_VB.ANY,
            NO_SPECIFIC_GL_BUFFER
         );
         this.buffer[i].UpdateTimeAttr();
         this.exists = true;
      }
   }
   Update() {
      for (let i = 0; i < this.size; i++) {
         if (this.buffer[i].isActive) {
            if (this.buffer[i].timer.has) {
               const t = TimerGetGlobalTimer();
               this.buffer[i].timer.t = t;
               this.buffer[i].SetTimeAttr(t);
            }
         }
      }
   }
   SetAttribParams1_Count(idx, count) {
      this.buffer[idx].SetAttribParams1_Count(count);
   }
   GetFreeElem() {
      for (let i = 0; i < this.size; i++) {
         if (!this.buffer[i].isActive)
            return i;
      }
      alert(`No more space in buffer to create a Vortex mesh. GetFreeElem() - Vortex.js`);
   }
   GetGfxIdx() {
      /** Get all widget's progs and vertexBuffer indexes */
      const gfxIdx = [
         [this.buffer[0].gfxInfo.prog.idx, this.buffer[0].gfxInfo.vb.idx],
      ];
      return gfxIdx;
   }

   // Debug
   Exists(){
      return this.exists;
   }
};

const vortex = new Vortex(1, 'Vortex Class');

export function VortexGet() { return vortex; }
export function VortexGetVortex(idx) { return vortex.buffer[idx]; }
export function VortexInit() {
   vortex.Init('Vortex', SID.FX.FS_VORTEX | SID.ATTR.PARAMS1, WHITE, [0, 0]);
}
export function VortexCreate(col, pos, dim) {
   return vortex.Create(col, pos, dim, true);
}
export function VortexDestroy(idx) {
   vortex.Clear(idx);
}
export function VortexUpdate() {
   // TODO: The checking vortex.Exists() is for debugging. Please remove on release
   if(vortex.Exists()) vortex.Update();
}
/** For now there is only one vortex used in application.
 * When more are created, we must pass an index(of the vortex in buffer[]),m
 * to update any of the 4 attributes in atribParams1
 */
export function VortexUpdateAttribParams1_Count(count) {
   // TODO: The checking vortex.Exists() is for debugging. Please remove on release
   if(vortex.Exists()) vortex.SetAttribParams1_Count(0, count);
}



/** Animations */

// export function VortexCreateAnimation(idx) {
//    // const animations = AnimationsGet();
//    // animations.Create(TranslateStartAnimation, TranslateStopAnimation, idx, 'Vortex Animation');
// }

// function TranslateStartAnimation() {
// }
// function TranslateStopAnimation() {
// }

