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
      this.cnt++;
   }

   GetFps(){ return Math.floor( 1 / (this.accum * MILISEC / this.cnt)); }
   GetMilisec(){ 
      const ret = (this.accum / this.cnt); 
      return ret.toFixed(4);
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


/**
 * Global Variables for mesuring code.
 * Must be declared somewhere globally because they are gonna be used mainly in Render loop
 * so we need some global declaration to access them. 
 * Also its better for callbacks to be functions rather than class methods,
 * which they dont have any object state through the callback.
 */
export const __pt1 = PerformanceTimerCreate('_pt1');
export function _Tm1GetFps(){ return __pt1.GetFps(); }
export function _Tm1GetMilisec(){ return __pt1.GetMilisec(); }
export function _Tm1GetNanosec(){ return __pt1.GetNanosec(); }

export const __pt2 = PerformanceTimerCreate('_pt2');
export function _Tm2GetFps(){ return __pt2.GetFps(); }
export function _Tm2GetMilisec(){ return __pt2.GetMilisec(); }
export function _Tm2GetNanosec(){ return __pt2.GetNanosec(); }

export const _pt3 = PerformanceTimerCreate();
export function _Tm3GetFps(){ return _pt3.GetFps('_pt3'); }
export function _Tm3GetMilisec(){ return _pt3.GetMilisec(); }
export function _Tm3GetNanosec(){ return _pt3.GetNanosec(); }

export const _pt4 = PerformanceTimerCreate();
export function _Tm4GetFps(){ return _pt4.GetFps('_pt4'); }
export function _Tm4GetMilisec(){ return _pt4.GetMilisec(); }
export function _Tm4GetNanosec(){ return _pt4.GetNanosec(); }

export const __pt5 = PerformanceTimerCreate();
export function _Tm5GetFps(){ return __pt5.GetFps('_pt5'); }
export function _Tm5GetMilisec(){ return __pt5.GetMilisec(); }
export function _Tm5GetNanosec(){ return __pt5.GetNanosec(); }

export const __pt6 = PerformanceTimerCreate();
export function _Tm6GetFps(){ return __pt6.GetFps('_pt6'); }
export function _Tm6GetMilisec(){ return __pt6.GetMilisec(); }
export function _Tm6GetNanosec(){ return __pt6.GetNanosec(); }
