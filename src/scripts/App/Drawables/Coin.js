// "use strict";
// import { GetRandomInt } from "../../Helpers/Helpers.js";
// import { AnimTextsCreateValue, UiUpdate } from "./Ui/Ui.js";
// import { TimersCreateTimer } from "../../Engine/Timer/Timer.js";
// import { GlowCreate, GlowCreateAnimation, GlowSetTranslation } from "../../Engine/Drawables/Fx/Glow.js";
// import { MeshBuffer, TempMesh } from "../../Engine/Drawables/MeshBuffer_OLD.js";

// const TIMER_MAX = 2; // Make large enough so the timer does not end and start from 0 again, because the animation will start over 
// const TIMER_STEP = 0.01;
// const COIN_MAX_COUNT = 32;
// const COIN_VALUE_TYPES = {
//    _10: 0,
//    _20: 1,
//    _30: 2,

//    COUNT: 3,
// };
// const COIN_TYPES_ARRAY = [];



// class Coin extends TempMesh {

//    type = 'NULL'; // The type of the coin
//    // isActive = false;
//    dir = { x: 1, y: 1 }; // Store ball's direction on brick hit
//    animation = {
//       isRunning: false,
//       timer: null, // Timer
//    }
//    fx = {
//       glowIdx: INT_NULL,
//    };

//    constructor(sid, col, dim, scale, tex, pos, style) {
//       super('Coin', sid, col, dim, scale, tex, pos, style, null, null);
//    }
// };

// export class Coins extends MeshBuffer {

//    constructor(){
//       super(COIN_MAX_COUNT, 'Coins');
//    }

//    // We dont use the constructor because power ups nedd to be initialized in specific time order
//    Init(sceneIdx) {
//       const sid = SID_DEFAULT_TEXTURE;
//       const style = {
//          roundCorner: COIN.STYLE.ROUNDNESS,
//          border: COIN.STYLE.BORDER,
//          feather: COIN.STYLE.FEATHER,
//       }

//       this.buffer[0] = new Coin(sid, TRANSPARENT, [COIN.WIDTH, COIN.HEIGHT, 0],
//          [1, 1], [-1, -1, -1, -1], [1000, 0, COIN.Z_INDEX], style);
//       this.buffer[0].isActive = false;
//       this.buffer[0].gfxInfo = GlAddMesh(this.buffer[0].sid, this.buffer[0].mesh, 1,
//       SCENE.stage, 'Coin', GL_VB.NEW, NO_SPECIFIC_GL_BUFFER);

//       let createNewGlBuffer = GL_VB.SPECIFIC;
//       let specificVertexBuffer = this.buffer[0].gfxInfo.vb.idx;
//       for (let i = 1; i < this.size; i++) {

//          this.buffer[i] = new Coin(sid, TRANSPARENT, [COIN.WIDTH, COIN.HEIGHT, 0],
//                         [1, 1], [-1, -1, -1, -1], [1000, 0, COIN.Z_INDEX], style);
//          this.buffer[i].isActive = false;
//          this.buffer[i].gfxInfo = GlAddMesh(this.buffer[i].sid, this.buffer[i].mesh, 1,
//             sceneIdx, 'Coin', createNewGlBuffer, specificVertexBuffer);
//       }
//    }
//    Reset() {
//       for (let i = 0; i < this.size; i++) {
//          this.Destroy(i);
//       }
//    }
//    Destroy(idx) {
//       super.Clear(idx);
//       this.buffer[idx].SetColor([0., 0., 0., 0.]);
//       // Create glow effects animation, if the coin has been captured by the player
//       if(this.buffer[idx].fx.glowIdx !== INT_NULL && this.buffer[idx].mesh.pos[1] < Viewport.bottom){
//          GlowCreateAnimation(this.buffer[idx].fx.glowIdx);
//       }
//    }
//    Create(pos) {

//       const freeidx = super.Create(pos, WHITE, COIN.Z_INDEX);
//       const coin = this.buffer[freeidx];
     
//       // Create glow effect
//       coin.fx.glowIdx = GlowCreate(pos, YELLOW, true, false, .17, null);
//       coin.type = COIN_TYPES_ARRAY[GetRandomInt(0, COIN_TYPES_ARRAY.length)];
//       coin.SetTexture(ATLAS_TEX_NAMES.COIN);
//       coin.animation.timer = TimersCreateTimer(0.01, TIMER_MAX, TIMER_STEP, 'coin animation', null, null);
//       coin.animation.isRunning = true;
//       coin.dir = [BALL.HIT.LEFT_DIR, BALL.HIT.TOP_DIR];
//    }
//    RunAnimation() {
//       for (let i = 0; i < COIN_MAX_COUNT; i++) {

//          if (this.buffer[i].animation.isRunning) {

//             const gravity = 10.0;
//             let seed = Math.random();
//             const t = this.buffer[i].animation.timer.t;
//             seed += (Math.atan(t * 4 * (i + 1) * .5));
//             const tPos = [(Math.cos(seed)) * this.buffer[i].dir[0] + t, Math.atan(seed) * (this.buffer[i].dir[1] + t)];
//             tPos[1] = (gravity * t * t) + (tPos[1] * t) + t;
//             this.buffer[i].Move(tPos[0], tPos[1] - .9);

//             GlowSetTranslation(this.buffer[i].fx.glowIdx, tPos[0], tPos[1] - .9);

//             if (this.buffer[i].mesh.pos[1] > Viewport.bottom + 100) {
//                this.buffer[i].animation.isRunning = false;
//                this.buffer[i].isActive = false;
//                this.Destroy(i);
//             }
//          }
//       }
//    }

//    DimColor() {
//       const len = this.buffer.length;
//       for (let i = 0; i < len; i++) {
//          const col = DimColor(this.buffer[i].mesh.col);
//          this.buffer[idx].SetColor(col);
//       }
//    }

// }

// const coins = new Coins;
// export function CoinGet() {
//    return coins;
// }

// export function CoinInit(sceneIdx) {
//    coins.Init(sceneIdx);
// }
// export function CoinCreate(brickPos) {
//    coins.Create(brickPos);
// }
// export function CoinReset() {
//    // Destroy any active coin
//    coins.Reset();
// }



// export function CoinPlayerCollision(plPos, plw, plh) {

//    let scoreMod = 0;

//    for (let i = 0; i < COIN_MAX_COUNT; i++) {

//       const coinpos = coins.buffer[i].mesh.pos;
//       const coinw = coins.buffer[i].mesh.dim[0];
//       const coinh = coins.buffer[i].mesh.dim[1];
//       if (coins.buffer[i].isActive) {
//          if (
//             plPos[0] + plw >= coinpos[0] - coinw &&
//             plPos[0] - plw <= coinpos[0] + coinw &&
//             plPos[1] + plh >= coinpos[1] - coinh &&
//             plPos[1] - plh <= coinpos[1] + coinh) {

//             scoreMod = 0.5;
//             AnimTextsCreateValue(coins.buffer[i].mesh.pos, scoreMod);
//             UiUpdate(UI_TEXT.SCORE_MOD, scoreMod);
//             coins.Destroy(i);
//             // GlowDestroy(coins.buffer[i].fx.glowIdx);

//          }
//       }
//    }
// }

// let t = 0;
// export function CoinRunAnimation() {
//    coins.RunAnimation();
// }

