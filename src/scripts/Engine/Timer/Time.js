"use strict";

// import { TimeIntervalsCreate } from "./TimerInterval.js";



class Time {

   cur;
   prev;
   dif;

   constructor() {

      this.cur = Date.now();
      this.prev = this.cur;
   }

   Update() {

      this.prev = this.cur;
      this.cur = Date.now(); // In miliseconds
      this.dif = this.cur - this.prev;
   }

   GetDif() { return this.dif; }
};

const _time = new Time;

export function TimeGet() { return _time; }
export function TimeUpdate() { _time.Update(); }




/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Step Timer.
 */
const MAX_STEP_TIMERS_LEN = 10;
class StepTimer {
   t; // The running step timer
   duration; // In miliseconds
   step; // If = 0, executes indefinitely. Set a maximum number of times the callback will execute before the timer has finished  
   clbk; // Callback to call upon time interval  
   stopClbk; // Callback to call upon timer completion  
   clbkParams; // The parameters for the Stop mestod callback
   idx;
   isActive;
   constructor() {
      this.t = 0;
      this.duration = 0;
      this.step = 0;
      this.clbk = null;
      this.stopClbk = null;
      this.clbkParams = null;
      this.idx = INT_NULL;
      this.isActive = false;
   }
   Set(duration, step, idx, clbk, stopClbk, params) {
      this.duration = duration;
      this.clbk = clbk;
      this.stopClbk = stopClbk;
      this.clbkParams = params;
      this.step = step;
      this.idx = idx;
      this.isActive = true;
   }
   Clear() {
      this.t = 0;
      this.duration = 0;
      this.step = 0;
      this.clbk = null;
      this.stopClbk = null;
      this.clbkParams = null;
      this.idx = INT_NULL;
      this.isActive = false;
   }
};

/** Create a class that manages all applications intervals(in an array) */
class StepTimers {
   buffer = [];
   size;
   count = 0;

   constructor() {
      this.size = MAX_STEP_TIMERS_LEN;
      this.count = 0;
      this.buffer = new Array(this.size);

      for (let i = 0; i < this.size; i++) {
         this.buffer[i] = new StepTimer;
      }
   }

   Create(duration, step, clbk, stopClbk, params) {

      const idx = this.GetNextFreeIdx(); // Get the first not active timer 
      this.buffer[idx].Set(duration, step, idx, clbk, stopClbk, params);
      this.count++;

      // Catch buffer overflow
      if (this.count >= this.size) {
         console.log(`Max Size:${this.size}  current count:${this.count}`);
         alert('ERROR. Buffer overflow in StepTimers');
      }

      return this.buffer[idx];
   }
   Clear(idx) {
      this.buffer[idx].Clear();
      this.count--;
   }
   GetNextFreeIdx() {
      for (let i = 0; i < this.size; i++) {
         if (this.buffer[i].isActive === false) {
            return i;
         }
      }
      alert('No Space for new Timer. Timer.js');
   }
};

const stepTimers = new StepTimers;
export function StepTimersUpdateAll() {
   // stepTimers.Update();
}
export function StepTimersCreate(duration, step, clbk, stopClbk, params) {
   stepTimers.Create(duration, step, clbk, stopClbk, params);
}
export function TimersUpdateStepTimers() {

   for (let i = 0; i < stepTimers.size; i++) {
      const t = stepTimers.buffer[i]; // Cash
      if (t.isActive) {
         if (t.t >= t.duration) {
            t.stopClbk(t.clbkParams);
            stepTimers.Clear(i);
            return;
         }
         t.t += t.step;
         t.clbk();
      }
   }
}



/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * FPS Omplementation
 */
const FPS_DELTA_LESS_THAN_1000_FPS = 0.001;

class Fps {
   t;
   accum;
   delta;
   cnt;
   elapsedCnt;
   elapsedAccum;
   avg1s;

   worst = {
      delta: 1000000, // Set to a high value, so that it compares to any lower frame time
      accum: 0,
      count: 0,
   }

   constructor() {

      this.t = 0;
      this.accum = 0;
      this.delta = 0;
      this.cnt = 0;
      this.elapsedCnt = 0;
      this.elapsedAccum = 0;

      this.avg1s = 0;

      // Create an 1 second average _fps counter
      // TimeIntervalsCreate(500, 'Fps-1sec', TIME_INTERVAL_REPEAT_ALWAYS, Fps_create_1Sec_interval);
   }

   Stop() {

      this.delta = _time.dif * MILISEC;
      this.accum += this.delta;
      this.cnt++;
      this.elapsedAccum += this.delta
      this.elapsedCnt++;

      if (this.worst.delta > this.delta) this.worst.delta = this.delta;
      
      this.worst.accum += this.worst.delta;
      this.worst.count++;
   }

};

/** Local  */
const _fps = new Fps;


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Getters
*/
export function FpsGet() { return _fps; }
export function FpsGetAvg() { return Math.floor(1 / (_fps.accum / _fps.cnt)) }
export function FpsGetAvg1S() { return Math.floor(_fps.avg1s); }
export function FpsGetWorstFrame() { return Math.floor(1 / _fps.worst.delta); }
export function FpsGetWorstFrameAvg() { return Math.floor(1 / (_fps.worst.accum / _fps.worst.count)); }


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * TODO: Name correctly
 */

function Fps_create_1Sec_interval(){

   _fps.avg1s = 1.0 / (_fps.elapsedAccum / _fps.elapsedCnt);
   _fps.elapsedAccum = 0.;
   _fps.elapsedCnt = 0.;
}
function Fps_create_500ms_interval(){

   _fps.avg1s = 1.0 / (_fps.elapsedAccum / _fps.elapsedCnt);
   _fps.elapsedAccum = 0.;
   _fps.elapsedCnt = 0.;
}