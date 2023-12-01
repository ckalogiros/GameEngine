"use strict";

class Time {

   cur;
   prev;
   delta;
   deltaAvg;
   cnt;

   constructor() {

      this.cur = 0.00000001;
      this.prev = 0;
      this.delta = 0;
      this.deltaAvg = 0;
      this.cnt = 0;
   }

   Update() {

      this.prev = this.cur;
      this.cur = performance.now(); // In miliseconds
      this.delta = (this.cur - this.prev);
      this.cnt++;
   }

   Sample(){

      this.deltaAvg += performance.now() - this.cur;      
   }

   GetDelta() { return this.delta; }
   GetDelta2() { return this.deltaAvg; }
   GetTimer() { return this.cur; }
};

export const _time = new Time();

export function TimeGet() { return _time; }

export function TimeUpdate() { _time.Update(); }
export function TimeSample() { _time.Sample(); }
export function TimeStart() { _time.Start(); }
export function TimeStop() { _time.Stop(); }

export function TimeGetTimer() { return _time.GetTimer(); }
export function TimeGetDelta() { return _time.GetDelta(); }
export function TimeGetDeltaAvg() { return _time.deltaAvg /_time.cnt; }
export function TimeGetFps() { return Math.floor(1 / ((_time.deltaAvg*MILISEC) /_time.cnt)); }


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Time Averages
 * Time Average does not need call to Date.now() or performance.now(). 
 * It updates its accumulator directly from the '_time' variable of class Time.
 * IMPORTANT: 
 *    The PerformanceTimerGetFps1sAvg() does not run by its self on a time interval,
 *    so it is the user's responsibility to set an interval timer (calling PerformanceTimerGetFps1sAvg)
 *    with 1 second interval.
 */


export const _fps_1s_avg      = { accum: 0, cnt: 0, delta_avg: 0, };
export const _fps_500ms_avg   = { accum: 0, cnt: 0, delta_avg: 0, };
export const _fps_200ms_avg   = { accum: 0, cnt: 0, delta_avg: 0, };
export const _fps_100ms_avg   = { accum: 0, cnt: 0, delta_avg: 0, };



export function PerformanceTimerGetFps1sAvg(static_accumulator){

   const cur = { accum: 0, cnt: 0 };
   cur.accum   = _time.deltaAvg;
   cur.cnt     = _time.cnt;

   const dif_accum = cur.accum - static_accumulator.accum; // Calculate the diffference
   const dif_cnt = cur.cnt - static_accumulator.cnt; // Calculate the diffference
   
   const avg_1s = Math.floor( 1 / (dif_accum * MILISEC / dif_cnt));
   static_accumulator.delta_avg = (dif_accum / dif_cnt);
   // console.log(static_accumulator.delta_avg)

   // Store cur now for next use
   static_accumulator.accum = cur.accum;
   static_accumulator.cnt = cur.cnt;

   return avg_1s;
}






/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * FPS Implementation
 */

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

      this.delta = _time.delta * MILISEC;
      // this.delta = _time.delta;
      this.accum += this.delta;
      // console.log(this.accum)
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
 * // TODO: Name correctly
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