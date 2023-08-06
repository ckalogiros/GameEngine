"use strict";

import { M_Buffer } from '../Core/Buffers.js';
import { TimeGet } from './Time.js';

const _time = TimeGet()

class TimeMeasure {

   cur;
   prev;
   accum;
   delta;
   cnt;

   constructor() {

      this.cur = Date.now();
      this.prev = this.cur;
      this.accum = 0;
      this.delta = 0;
      this.cnt = 0;
   }
   
   Start() { this.prev = Date.now(); }
   
   Stop() {
      
      this.cur = Date.now(); // In miliseconds
      this.delta = this.cur - this.prev;
      this.accum += this.delta;
      this.cnt++;

      // console.log('cur:', this.cur, ', prev:', this.prev)
      // console.log('TimeMeasure - delta:', this.delta)
      // console.log('TimeMeasure - accum:', this.accum)
      // console.log('TimeMeasure - accum:', this.cnt)
      // console.log('TimeMeasure - fps:', Math.floor( 1 / (this.accum / this.cnt)));
   }

   GetFps(){ return Math.floor( 1 / (this.accum * MILISEC / this.cnt)); }
   
   GetMilisec(){ return (this.accum / this.cnt); }
   GetNanosec(){ return Math.floor(this.accum / NANOSEC / this.cnt); } // * MILISEC cause the accum is allready in milisecond

}

class TimeMeasures extends M_Buffer {

   constructor() { super(); }

   Init(size) { super.Init(size); }

   Create() { return this.Add(new TimeMeasure); }
 
}

const _timeMeasures = new TimeMeasures();
_timeMeasures.Init(32);

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Global Functions
 */

export function TimeMeasureCreate() {

   const idx = _timeMeasures.Create();
   return _timeMeasures.buffer[idx];
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Global Variables for mesuring code.
 * Must be declared somewhere globally because they are gonna be used mainly in Render loop
 * so we need some global declaration to access them. 
 */

export const _tm1 = TimeMeasureCreate();
export function _Tm1GetFps(){ return _tm1.GetFps(); }
export function _Tm1GetMilisec(){ return _tm1.GetMilisec(); }
export function _Tm1GetNanosec(){ return _tm1.GetNanosec(); }
