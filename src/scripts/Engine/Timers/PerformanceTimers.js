"use strict";

import { M_Buffer } from '../Core/Buffers.js';
import { TimeGet } from './Time.js';

let _time = null;
export function PerformanceTimerInit(){

   _time = TimeGet();
}

class PerformanceTimer {

   cur;
   prev;
   accum;
   delta;
   cnt;

   /** Debug */
   name;

   constructor(name) {

      this.cur = 0;
      this.prev = 0;
      this.accum = 0;
      this.delta = 0;
      this.cnt = 0;
      this.name = name;
   }
   
   Start() { this.prev = performance.now(); }
   
   Stop() {
      
      this.cur = performance.now(); // In miliseconds
      this.delta = this.cur - this.prev;
      this.accum += this.delta;
   }
   
   GetFps(){ return Math.floor( 1 / (this.accum * MILISEC / this.cnt)); }
   GetMilisec(){ 
      return (this.accum / this.cnt).toFixed(4);
   }
   GetNanosec(){ return (this.accum / NANOSEC / this.cnt).toFixed(1); } // * MILISEC cause the accum is allready in milisecond

   Reset(){
      this.cur = 0;
      this.prev = 0;
      this.accum = 0;
      this.delta = 0;
      this.cnt = 0;
   }

   Print(){
      console.log(`Perf timer ${this.name}: fps:${this.GetFps()}, ms:${this.GetMilisec()}, ns:${this.GetNanosec()}, TotalTime:${this.accum.toFixed(1)}`)
   }
}

class PerformanceTimers extends M_Buffer {

   constructor() { super(); }
   Create(name) { return this.Add(new PerformanceTimer(name)); }
}

const _timeMeasures = new PerformanceTimers();
_timeMeasures.Init(32);

/**
 * Global Functions
 */

export function PerformanceTimerCreate(name = '') {

   const idx = _timeMeasures.Create(name);
   return _timeMeasures.buffer[idx];
}

export function PerformanceTimersTick(){
   /**
    * This updates the tick count uppon every frame.
    * Enables a timer to  Start and Stop more than 1 times during a frame.
    * The reason is: if the count would update on every Start() call, then the 
    * mesurement would be false, providing greater speed for mesurements 
    * that are calle may times per frame.  
    */
   for(let i=0; i<_timeMeasures.boundary; i++){

      _timeMeasures.buffer[i].cnt++;
   }
}

export function PerformanceTimersGetFps(timer){
   return Math.floor( 1 / (timer.accum * MILISEC / timer.cnt));
}
export function PerformanceTimersGetMilisec(timer){
   return (timer.accum / timer.cnt).toFixed(4); 
}
export function PerformanceTimersGetNanosec(timer){
   return (timer.accum / NANOSEC / timer.cnt).toFixed(1);
}
export function PerformanceTimersGetCurTime(timer){
   return (timer.cur);
}



/**
 * Global Variables for mesuring code.
 * Must be declared somewhere globally because they are gonna be used mainly in Render loop
 * so we need some global declaration to access them. 
 * Also its better for callbacks to be functions rather than class methods,
 * which they dont have any object state through the callback.
 */

export const _pt_fps = new PerformanceTimerCreate('Fps'); // Generic performance timer
// export const _pt_fps_1s_avg = new PerformanceTimerCreate('Fps1sAvg'); // Generic performance timer
export const _pt2 = new PerformanceTimerCreate('AllTimersUpdate'); // Generic performance timer
export const _pt3 = new PerformanceTimerCreate('SceneUpdate'); // Generic performance timer
export const _pt4 = new PerformanceTimerCreate('Gl_draw'); // Generic performance timer
export const _pt5 = new PerformanceTimerCreate('EventListener'); // Generic performance timer
export const _pt6 = new PerformanceTimerCreate('HoverListener'); // Generic performance timer
export const _pt7 = new PerformanceTimerCreate('MOVE_OLD'); // 
export const _pt8 = new PerformanceTimerCreate('BATCH'); // 
export const _pt9 = new PerformanceTimerCreate('BATCH_TEST_2_BATCHES'); // 
// export const _gfxctxtimer = new PerformanceTimerCreate('Measure GfxContext buffer'); // Generic performance timer


