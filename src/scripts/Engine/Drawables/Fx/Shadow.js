import { TimerGetGlobalTimerCycle } from "../../Timer/Timer.js";
import { TempMesh } from "../MeshBuffer.js";

// For readability of the attribute params1 vector
const SHADOW_ATTR_PARAMS1 = {
   size: 0, // The size attr parameter is at index 0
};


class ShadowMesh extends TempMesh {

   // gfxInfo = null;
   // isActive = false;
   translation = {
      has: false,
      xAdvance: INT_NULL,
      yAdvance: INT_NULL,
   };
   // timer = {
   //    has: false,
   //    t: null,
   // };

   constructor(name, sid, col, dim, scale, tex, pos, style, attrParams1) {
      super(name, sid, col, dim, scale, tex, pos, style, null, attrParams1); // Pass .5 to time attribute. The lesser the val 
      this.timer.t = this.mesh.time;
   }
   SetShadowSize(size) {
      this.mesh.attrParams1[SHADOW_ATTR_PARAMS1.size] = size;
      this.UpdateParams1Attr(SHADOW_ATTR_PARAMS1.size);
   }
   UpdateShadowSize() {
      this.UpdateParams1Attr(SHADOW_ATTR_PARAMS1.size);
   }
   SetDimentions(dim) {
      this.SetDim(dim);
   }
};
export class Shadow {
   buffer;
   size;
   count;
   // Debug
   name;

   constructor(size, name) {
      this.buffer = [];
      this.size = size;
      this.count = 0;
      this.name = name;

   }

   Create(pos, col, dim, hasTimer, shadowSize, z_index) {
      const idx = this.GetFreeElem();
      this.buffer[idx].isActive = true;
      this.count++;
      // Catch buffer overflow
      if (this.count >= this.size) {
         console.log(`Max Size:${this.size}  current count:${this.count}`);
         alert(`ERROR. Buffer overflow for exlosions: name: ${this.name}`);
      }

      // this.buffer[idx].translation.has = hasTranslation;
      this.buffer[idx].timer.has = hasTimer;
      this.buffer[idx].SetColor(col);
      this.buffer[idx].SetPosXY(pos);
      this.buffer[idx].SetDim(dim);
      if (z_index) {
         this.buffer[idx].SetZindex(z_index);
      }

      this.buffer[idx].SetShadowSize(shadowSize);

      return idx;
   }
   Clear(idx) {
      this.buffer[idx].isActive = false;
      this.buffer[idx].mesh.time = .2;
      this.buffer[idx].translation.yAdvance = INT_NULL;
      this.buffer[idx].translation.xAdvance = INT_NULL;
      this.buffer[idx].translation.has = false;
      this.buffer[idx].SetPosXY([OUT_OF_VIEW, OUT_OF_VIEW]); // Stop drawing by setting the mesh far away
      this.count--;
   }
   Init(name, sid, color, dim) {
      for (let i = 0; i < this.size; i++) {
         this.buffer[i] = new ShadowMesh(
            name + i,
            SID_EXPLOSION | sid,
            color,
            dim,
            [1, 1],
            null,
            [OUT_OF_VIEW, OUT_OF_VIEW, -1],
            null,
            [.2]
         );
         this.buffer[i].gfxInfo = GlAddMesh(
            this.buffer[i].sid,
            this.buffer[i].mesh,
            1,
            SCENE.all,
            'Shadow',
            GL_VB.ANY,
            NO_SPECIFIC_GL_BUFFER
         );
         this.buffer[i].SetTimeAttr(this.buffer[i].timer.t);
      }
   }
   Update() {
      for (let i = 0; i < this.size; i++) {
         if (this.buffer[i].isActive) {
            if (this.buffer[i].translation.has) {
               this.buffer[i].Move(this.buffer[i].translation.xAdvance, this.buffer[i].translation.yAdvance);
            }
            if (this.buffer[i].timer.has) {
               const t = TimerGetGlobalTimerCycle();
               this.buffer[i].timer.t = t;
               this.buffer[i].SetTimeAttr(t);
            }
         }
      }
   }
   GetFreeElem() {
      for (let i = 0; i < this.size; i++) {
         if (!this.buffer[i].isActive)
            return i;
      }
      alert(`No more space in buffer to create an explosion. GetFreeElem() - Shadow.js`);
   }
   GetGfxIdx() {
      /** Get all widget's progs and vertexBuffer indexes */
      const gfxIdx = [
         [this.buffer[0].gfxInfo.prog.idx, this.buffer[0].gfxInfo.vb.idx],
      ];
      return gfxIdx;
   }
};

const shadow = new Shadow(64, 'Shadow');

export function ShadowGet() { return shadow; }
export function ShadowInit() {
   // shadow.Init('shadow', SID.FX.FS_SHADOW | SID.ATTR.PARAMS1, WHITE, [10, 10]);
   shadow.Init('shadow', SID.FX.FS_SHADOW, WHITE, [10, 10]);
}
export function ShadowUpdate(pos) {
   shadow.Update(pos);
}
export function ShadowDestroy(idx) {
   shadow.Clear(idx);
}
export function ShadowCreate(pos, col, dim, hasTimer, shadowSize, z_index) {
   return shadow.Create(pos, col, dim, hasTimer, shadowSize, z_index);
}
export function ShadowGetShadow(idx) {
   return shadow.buffer[idx];
}



/** Animations */

// export function ShadowCreateAnimation(idx) {
//    const animations = AnimationsGet();
//    animations.Create(TranslateStartAnimation, TranslateStopAnimation, idx, 'Shadow Animation');
// }

// function TranslateStartAnimation(idx) {
//    let pos = [0, 0];
//    CopyArr2(pos, shadow.buffer[idx].mesh.pos);
//    const pos2 = UiGetUi(UI_TEXT.SCORE).GetVariPos();
//    const dist = CalcVectorDist(pos, [pos2[0], pos2[1]]);

//    // ShadowSetTranslation(idx, dist[0] * .007, dist[1] * .02);


//    // We use the time attribute of the shadow shader to pass the shadow size
//    if (shadow.buffer[idx].mesh.time < .8) {
//       shadow.buffer[idx].mesh.time *= 1.018
//       shadow.buffer[idx].UpdateShadowSize();
//    }

//    // Run animation until shadow effect has reached it's destination.
//    if (pos2[1] <= pos[1] - 10) return true;
//    return false;
// }
// function TranslateStopAnimation(idx) {
//    shadow.Clear(idx);
// }
