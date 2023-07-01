"use strict";

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Generic Timers
 */
let g_timer = 0;
export function TimerUpdateGlobalTimer(){  g_timer += .01; }
export function TimerGetGlobalTimer(){ return g_timer; }
export function TimerResetGlobalTimer(){ g_timer = 0.0; }
let g_timer_cycle_upper_limit = .5;
let g_timer_cycle_lower_limit = .1;
let g_timer_cycle = g_timer_cycle_lower_limit;
let g_timer_cycle_rate = 0.01;
export function TimerUpdateGlobalTimerCycle(){
    if(g_timer_cycle > g_timer_cycle_upper_limit)
        g_timer_cycle_rate  =  -0.01;
    else if(g_timer_cycle < g_timer_cycle_lower_limit)
        g_timer_cycle_rate =  0.01;
    g_timer_cycle += g_timer_cycle_rate;
}
export function TimerGetGlobalTimerCycle(){
    return g_timer_cycle;
}

export function TimerUpdateGlobalTimers(){
    TimerUpdateGlobalTimer();
    TimerUpdateGlobalTimerCycle();
}

/**
 * Timer Logic.
 * 
 * Timer class holds the backbone of a timer 
 * Timers class has a buffer of a large number of timers (SEE #1), that will be used by the application.
 * When a timer is reqquested(TimersCreateTimer() funtion), a free timer from the buffer is returned
 * and that timer is set to 'occupied' (isActive = true), until the duration of the timer expires
 * and the timer is rendered free again to be recycled to the free timers for new use.
 * 
 * Every Timer has a callback function, that is called upon timer's duration completion
 * and must belong to the owner of the timer (Caller).
 * 
 *  Timers are updated independently of the object owning the timer, in the App's update cycle.
 *  Timers duration and step define the duration of the timer in seconds and the increment step.
 *  Upon timers termination, the timer is Cleared, and is recycled to the free timers for new use.
 * 
 * #1 The max number of timers in the buffer, for now, must be large enough to the applications requirements.
 * Later maybe create a realocated buffer.
 */

const MAX_TIMERS_NUM = 350;

class Timer {

    t;
    duration;
    step;
    idx;
    clbk; // A Callback funtion to inform the owner when timer expires
    params; // The callback function parameters. Managed by the caller site.
    isActive;

    // Debbug 
    name;

    constructor(start, duration, step, isActive){
        this.t = start;
        this.duration = duration;
        this.step = step;
        this.idx = INT_NULL;
        this.clbk = null;
        this.params = null;
        this.isActive = isActive;
        this.name = '';
    }

    SetTimer(start, duration, step, idx, name, clbk, params){
        this.t = start;
        this.duration = duration;
        this.step = step;
        this.isActive = true;
        this.idx = idx;
        this.name = name;
        if(clbk) this.clbk = clbk; // Callback for when the timer has finished.
        if(params !== null && params !==undefined ) this.params = params; // Callback parameters, if any.
    }
        
    Clear(){
        this.t = this.duration; // The timer stays at the max duration. Up until now there are cases where the fragment shader will 'end' at 'duration' value.
        this.duration = 0;
        this.step = 0;
        this.isActive = false;
        this.idx = INT_NULL;
        this.clbk = null;
        this.name = '';
    }
    SetClbk(clbk){
        this.clbk = clbk;
    }

};
class Timers {

    buffer = [];
    size = MAX_TIMERS_NUM;
    count   = 0;

    CreateTimer(start, duration, step, name, clbk, params){

        const idx = this.GetFreeTimer(); // Get the first not active timer 
        this.buffer[idx].SetTimer(start, duration, step, idx, name, clbk, params); 
        this.count++;

        // Catch buffer overflow
        if(this.count >= this.size) {
            console.log(`Max Size:${this.size}  current count:${this.count}`);
            alert('ERROR. Buffer overflow for Timers');
        }
        
        return this.buffer[idx];
    }
    ClearTimer(idx){
        this.buffer[idx].Clear();
        this.count--;
    }
    GetFreeTimer(){
        for(let i=0; i<this.size; i++)
            if(this.buffer[i].isActive === false)
                return i;
        alert('No Space for new Timer. Timer.js');
    }
    Init(){
        for(let i=0; i<this.size; i++)
            this.buffer[i] = new Timer(0., 0., 0., false);
    }
    OnCompleted(idx){
        if(this.buffer[idx].clbk) // If a callback exists, call it
            this.buffer[idx].clbk(this.buffer[idx].params);
    }
    SetClbk(clbk, idx){
        this.buffer[idx].SetClbk(clbk);
    }
};

const timers = new Timers; // This is the (local scoped) variable for all timers.
// Initialize Timers buffer
timers.Init();


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* Getters-Setters
*/
export function TimersGetTimers(){
    return timers;
}
export function TimersGetTimer(idx){
    return timers.buffer[idx];
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Public Functions
 */
export function TimersCreateTimer(start, duration, step, name, clbk, params){
    // Catch wrong parameters(name is a valid param only for debugging)
    if(!(typeof name === 'string' || name instanceof String))
    alert('--NAME FOR TIMERS NOT PASSED--')
    return timers.CreateTimer(start, duration, step, name, clbk, params);
}

/**
 * Update all timers used by the game here.
 * Must run for each render iteration(frame)
 */
export function TimersUpdateTimers(){

    for(let i=0; i<timers.size; i++){
        const t = timers.buffer[i]; // Cash
        if(t.isActive){
            // Stop timer if the duration cycle has been completed
            if(t.t >= t.duration){
                // Debug
                // if(t.name === 'ParticlesBallTail-0')
                //     console.log('Destroy timer ParticlesBallTail-0 at index:', i);
                timers.OnCompleted(i)
                timers.ClearTimer(i);
            }
            else t.t += t.step;
        }
    }
}

/**
 * Debug
 */
export function TimersPrintimers(){

    for(let i=0; i<timers.size; i++){
        const t = timers.buffer[i]; // Cash
        if(t.isActive){
            console.log(`${i}:t:${t.t.toFixed(2)}|d:${t.duration}|name:${t.name}`)
        }
    }
}

