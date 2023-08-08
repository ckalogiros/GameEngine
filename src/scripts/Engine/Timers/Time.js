"use strict";

import { M_Buffer } from "../Core/Buffers.js";


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
 */

/**
 * Time Average does not need call to Date.now() or performance.now(). 
 * It updates its accumulator directly from the '_time' variable of class Time.
 */
// class TimeAverage{

//    accum;
//    cnt;

//    constructor() {

//       this.accum = 0;
//       this.cnt = 0;
//    }

//    Update(){ 
      
//       this.accum += _time.delta; 
//       this.cnt++;
//    }

//    GetAvg(){ 
      
//       const avg = Math.floor(1 / (this.accum * MILISEC / this.cnt)) ;
//       this.accum = 0; 
//       this.cnt = 0;
//       return avg;
//    }
   
// }

// class TimeAverages extends M_Buffer{

//    constructor() { super(); }

//    Create() { return this.Add(new TimeAverage); }
 
// }

// const _timeAvgs = new TimeAverages();
// _timeAvgs.Init(16);


// /**
//  * Global Functions
//  */

// export function TimeAverageCreate() {

//    const idx = _timeAvgs.Create();
//    return _timeAvgs.buffer[idx];
// }

// /**
//  * Global Variables for mesuring code.
//  * Must be declared somewhere globally because they are gonna be used mainly in Render loop
//  * so we need some global declaration to access them. 
//  * Also its better for callbacks to be functions rather than class methods.
//  */
// export const _ta1 = TimeAverageCreate();
// export function _Ta1GetAvg(){ return _ta1.GetAvg(); }
// export function _Ta1Start() { _ta1.Start(); }
// export function _Ta1Stop() { _ta1.Stop(); }



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