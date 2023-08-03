// import { AnimationsGet } from "../../Animations/Animations.js";
// import { Abs, CopyArr2 } from '../../../Helpers/Math/MathOperations.js'
// import { UiGetUi } from "../../../App/Drawables/Ui/Ui.js";
// import { TimerGetGlobalTimerCycle } from "../../Timer/Timer.js";
// import { MeshBuffer, TempMesh } from "../MeshBuffer_OLD.js";

// // For readability of the attribute params1 vector
// const GLOW_ATTR_PARAMS1 = {
//    size: 0, // The size attr parameter is at index 0
// };


// class GlowMesh extends TempMesh {

//    translation = {
//       has: false,
//       xAdvance: INT_NULL,
//       yAdvance: INT_NULL,
//    };
//    timer = {
//       has: false,
//       t: null,
//    };

//    constructor(name, sid, col, dim, scale, tex, pos, style, attrParams1) {
//       super(name, sid, col, dim, scale, tex, pos, style, null, attrParams1); // Pass .5 to time attribute. The lesser the val 
//       this.timer.t = this.mesh.time;
//    }
//    SetGlowSize(size) {
//       super.SetSize(GLOW_ATTR_PARAMS1.size, size);
//    }
//    UpdateGlowSize() {
//       super.UpdateSize(GLOW_ATTR_PARAMS1.size);
//    }
//    SetDimentions(dim) {
//       this.SetDim(dim);
//    }
// };
// export class Glow extends MeshBuffer {

//    constructor(size, name) {
//       super(size, name);
//    }

//    Create(pos, col, hasTranslation, hasTimer, glowSize, z_index) {
//       const idx = super.Create(pos, col, z_index);

//       this.buffer[idx].translation.has = hasTranslation;
//       this.buffer[idx].timer.has = hasTimer;
//       this.buffer[idx].SetGlowSize(glowSize);

//       return idx;
//    }
//    Clear(idx) {
//       super.Clear(idx);
//       this.buffer[idx].SetPosXY([OUT_OF_VIEW, OUT_OF_VIEW]); // Stop drawing by setting the mesh far away
//       this.buffer[idx].mesh.time = .2;
//       this.buffer[idx].translation.yAdvance = INT_NULL;
//       this.buffer[idx].translation.xAdvance = INT_NULL;
//       this.buffer[idx].translation.has = false;
//    }
//    Init(name, sid, color, dim) {
//       for (let i = 0; i < this.size; i++) {
//          this.buffer[i] = new GlowMesh(
//             name + i, SID_EXPLOSION | sid,
//             color, dim, [1, 1], null,
//             [OUT_OF_VIEW, OUT_OF_VIEW, GLOW.Z_INDEX],
//             null, [.2]
//          );
//          super.Init(SCENE.stage, name, i);
//       }
//    }
//    Update() {
//       for (let i = 0; i < this.size; i++) {
//          if (this.buffer[i].isActive) {
//             if (this.buffer[i].translation.has) {
//                this.buffer[i].Move(this.buffer[i].translation.xAdvance, this.buffer[i].translation.yAdvance);
//             }
//             if (this.buffer[i].timer.has) {
//                const t = TimerGetGlobalTimerCycle();
//                this.buffer[i].timer.t = t;
//                this.buffer[i].SetTimeAttr(t);
//             }
//          }
//       }
//    }
// };
// // export class Glow {
// //    buffer;
// //    size;
// //    count;
// //    // Debug
// //    name;

// //    constructor(size, name) {
// //       this.buffer = [];
// //       this.size = size;
// //       this.count = 0;
// //       this.name = name;

// //    }

// //    Create(pos, col, hasTranslation, hasTimer, glowSize, z_index) {
// //       const idx = this.GetFreeElem();
// //       this.buffer[idx].isActive = true;
// //       this.count++;
// //       // Catch buffer overflow
// //       if (this.count >= this.size) {
// //          console.log(`Max Size:${this.size}  current count:${this.count}`);
// //          alert(`ERROR. Buffer overflow for exlosions: name: ${this.name}`);
// //       }

// //       this.buffer[idx].translation.has = hasTranslation;
// //       this.buffer[idx].timer.has = hasTimer;
// //       this.buffer[idx].SetColor(col);
// //       this.buffer[idx].SetPosXY(pos);
// //       if (z_index) {
// //          this.buffer[idx].SetZindex(z_index);
// //       }

// //       this.buffer[idx].SetGlowSize(glowSize);

// //       return idx;
// //    }
// //    Clear(idx) {
// //       this.buffer[idx].isActive = false;
// //       this.buffer[idx].mesh.time = .2;
// //       this.buffer[idx].translation.yAdvance = INT_NULL;
// //       this.buffer[idx].translation.xAdvance = INT_NULL;
// //       this.buffer[idx].translation.has = false;
// //       this.buffer[idx].SetPosXY([OUT_OF_VIEW, OUT_OF_VIEW]); // Stop drawing by setting the mesh far away
// //       this.count--;
// //    }
// //    Init(name, sid, color, dim) {
// //       for (let i = 0; i < this.size; i++) {
// //          this.buffer[i] = new GlowMesh(
// //             name + i,
// //             SID_EXPLOSION | sid,
// //             color,
// //             dim,
// //             [1, 1],
// //             null,
// //             [OUT_OF_VIEW, OUT_OF_VIEW, GLOW.Z_INDEX],
// //             null,
// //             [.2]
// //          );
// //          this.buffer[i].gfxInfo = GlAddMesh(
// //             this.buffer[i].sid,
// //             this.buffer[i].mesh,
// //             1,
// //             SCENE.stage,
// //             'Glow',
// //             GL_VB.ANY,
// //             NO_SPECIFIC_GL_BUFFER
// //          );
// //          this.buffer[i].SetTimeAttr(this.buffer[i].timer.t);
// //       }
// //    }
// //    Update() {
// //       for (let i = 0; i < this.size; i++) {
// //          if (this.buffer[i].isActive) {
// //             if (this.buffer[i].translation.has) {
// //                this.buffer[i].Move(this.buffer[i].translation.xAdvance, this.buffer[i].translation.yAdvance);
// //             }
// //             if (this.buffer[i].timer.has) {
// //                const t = TimerGetGlobalTimerCycle();
// //                this.buffer[i].timer.t = t;
// //                this.buffer[i].SetTimeAttr(t);
// //             }
// //          }
// //       }
// //    }
// //    GetFreeElem() {
// //       for (let i = 0; i < this.size; i++) {
// //          if (!this.buffer[i].isActive)
// //             return i;
// //       }
// //       alert(`No more space in buffer to create an explosion. GetFreeElem() - Glow.js`);
// //    }
// //    GetGfxIdx() {
// //       /** Get all widget's progs and vertexBuffer indexes */
// //       const gfxIdx = [
// //          [this.buffer[0].gfxInfo.prog.idx, this.buffer[0].gfxInfo.vb.idx],
// //       ];
// //       return gfxIdx;
// //    }
// // };

// const glow = new Glow(64, 'Glow');

// export function GlowGet() { return glow; }
// export function GlowInit() {
//    glow.Init('glow', SID.FX.FS_GLOW | SID.ATTR.PARAMS1, BLUE_LIGHT, [50, 50]);
// }
// export function GlowUpdate(pos) {
//    glow.Update(pos);
// }
// export function GlowDestroy(idx) {
//    glow.Clear(idx);
// }
// export function GlowCreate(pos, col, hasTranslation, hasTimer, glowSize, z_index) {
//    return glow.Create(pos, col, hasTranslation, hasTimer, glowSize, z_index);
// }
// export function GlowSetTranslation(idx, x, y) {
//    glow.buffer[idx].translation.xAdvance = x;
//    glow.buffer[idx].translation.yAdvance = y;
// }
// export function GlowGetGlow(idx) {
//    return glow.buffer[idx];
// }



// /** Animations */

// export function GlowCreateAnimation(idx) {
//    const animations = AnimationsGet();
//    animations.Create(TranslateStartAnimation, TranslateStopAnimation, idx, 'Glow Animation');
// }

// function TranslateStartAnimation(idx) {
//    let pos = [0, 0];
//    CopyArr2(pos, glow.buffer[idx].mesh.pos);
//    const pos2 = UiGetUi(UI_TEXT.SCORE).GetVariPos();
//    const dist = CalcVectorDist(pos, [pos2[0], pos2[1]]);

//    GlowSetTranslation(idx, dist[0] * .007, dist[1] * .02);


//    // We use the time attribute of the glow shader to pass the glow size
//    if (glow.buffer[idx].mesh.time < .8) {
//       glow.buffer[idx].mesh.time *= 1.018
//       glow.buffer[idx].UpdateGlowSize();
//    }

//    // Run animation until glow effect has reached it's destination.
//    if (pos2[1] <= pos[1] - 10) return true;
//    return false;
// }
// function TranslateStopAnimation(idx) {
//    glow.Clear(idx);
// }

// function CalcVectorDir(srcpos, dstpos) {
//    const res = Math.sqrt(
//       Math.pow(
//          Abs(srcpos[0] - dstpos[0]) + Abs(srcpos[1] - dstpos[1]),
//          2
//       )
//    );
//    return res;
// }
// function CalcVectorDist(srcpos, dstpos) {
//    const res = [
//       dstpos[0] - srcpos[0],
//       dstpos[1] - srcpos[1]
//    ];
//    return res;
// }