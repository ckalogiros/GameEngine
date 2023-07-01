import { GlGetProgram } from "../../../Graphics/GlProgram.js";
import { MeshBuffer, TempMesh } from "../MeshBuffer.js";

class TwistMesh extends TempMesh {

   translation = {
      xAdvance: INT_NULL,
      yAdvance: INT_NULL,
   };

   constructor(name, sid, col, dim, scale, tex, pos, style) {
      super(name, sid, col, dim, scale, tex, pos, style, null, null);
   }
};
export class Twist extends MeshBuffer{

   constructor(size, name) {
      super(size, name);
   }

   Create(pos, col) {
      const idx = super.Create(pos, col, null);
      return idx;
   }
   Clear(idx) {
      super.Clear(idx);
      this.buffer[idx].translation.yAdvance = INT_NULL;
      this.buffer[idx].translation.xAdvance = INT_NULL;
      this.buffer[idx].SetPosXY([OUT_OF_VIEW, OUT_OF_VIEW]); // Stop drawing by setting the mesh far away
   }
   Init(sceneIdx, name, sid, color, dim) {
      for (let i = 0; i < this.size; i++) {
         this.buffer[i] = new TwistMesh(name + i, SID_EXPLOSION | sid, color, dim, [1, 1], null, [OUT_OF_VIEW, OUT_OF_VIEW, TWIST.Z_INDEX], null, 0);
         super.Init(sceneIdx, 'Twist', i);
      }
   }
   Update() {
      for (let i = 0; i < this.size; i++) {
         if (this.buffer[i].isActive) {
            this.buffer[i].Move(this.buffer[i].translation.xAdvance, this.buffer[i].translation.yAdvance);
            const prog = GlGetProgram(this.buffer[i].gfxInfo.prog.idx);
            prog.SetTimer(0.1, UNIFORM_PARAMS.TWIST.timeIdx);
         }
      }
   }
   SetTimer() {
      const prog = GlGetProgram(this.buffer[i].gfx.prog.idx);
      prog.SetTimer(0.1, UNIFORM_PARAMS.TWIST.timeIdx);
   }
   SetAmtxSpeed(val) {
      const prog = GlGetProgram(this.buffer[0].gfxInfo.prog.idx);
      prog.UniformsSetParamsBufferValue(val, UNIFORM_PARAMS.TWIST.dirIdx);
   }
};

const twist = new Twist(MAX_BALLS_COUNT, 'Twist');

export function TwistGet() { return twist; }

export function TwistInit(sceneIdx) {
   twist.Init(sceneIdx, 'twist', SID.FX.FS_TWIST | SID.ATTR.PARAMS1, YELLOW, [40, 40]);
}
export function TwistUpdate(pos) {
   twist.Update(pos);
}
export function TwistDestroy(idx) {
   twist.Clear(idx);
}
export function TwistCreate(pos, col) {
   return twist.Create(pos, col);
}
export function TwistSetTranslation(idx, x, y) {
   twist.buffer[idx].translation.xAdvance = x;
   twist.buffer[idx].translation.yAdvance = y;
}
export function TwistSetAmtxSpeed(val) {
   twist.SetAmtxSpeed(val);
}


/** Animations */

