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

   constructor() {

      this.cur = 0;
      this.prev = 0;
      this.accum = 0;
      this.delta = 0;
      this.cnt = 0;
   }
   
   Start() { this.prev = performance.now(); }
   
   Stop() {
      
      this.cur = performance.now(); // In miliseconds
      this.delta = this.cur - this.prev;
      this.accum += this.delta;
      this.cnt++;
   }

   GetFps(){ return Math.floor( 1 / (this.accum * MILISEC / this.cnt)); }
   GetMilisec(){ return (this.accum / this.cnt); }
   GetNanosec(){ return Math.floor(this.accum / NANOSEC / this.cnt); } // * MILISEC cause the accum is allready in milisecond

}

class PerformanceTimers extends M_Buffer {

   constructor() { super(); }
   Create() { return this.Add(new PerformanceTimer); }
}

const _timeMeasures = new PerformanceTimers();
_timeMeasures.Init(32);

/**
 * Global Functions
 */

export function PerformanceTimerCreate() {

   const idx = _timeMeasures.Create();
   return _timeMeasures.buffer[idx];
}


/**
 * Global Variables for mesuring code.
 * Must be declared somewhere globally because they are gonna be used mainly in Render loop
 * so we need some global declaration to access them. 
 * Also its better for callbacks to be functions rather than class methods.
 */
export const _tm1 = PerformanceTimerCreate();
export function _Tm1GetFps(){ return _tm1.GetFps(); }
export function _Tm1GetMilisec(){ return _tm1.GetMilisec(); }
export function _Tm1GetNanosec(){ return _tm1.GetNanosec(); }

export const _tm2 = PerformanceTimerCreate();
export function _Tm2GetFps(){ return _tm2.GetFps(); }
export function _Tm2GetMilisec(){ return _tm2.GetMilisec(); }
export function _Tm2GetNanosec(){ return _tm2.GetNanosec(); }

export const _tm3 = PerformanceTimerCreate();
export function _Tm3GetFps(){ return _tm3.GetFps(); }
export function _Tm3GetMilisec(){ return _tm3.GetMilisec(); }
export function _Tm3GetNanosec(){ return _tm3.GetNanosec(); }
