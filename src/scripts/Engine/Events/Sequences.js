"use strict";



const MAX_SEQ_EVTS_SIZE = 32;


export class SequencedEvent {

   RunClbk = null;
   StopClbk = null;
   params = null;

   isNotCompleted = false;
   isActive = false;

   // For debuging
   index = 0;
   name = '';

   Create(RunClbk, StopClbk, params, index, name) {
      this.params = params;
      this.RunClbk = RunClbk;
      this.StopClbk = StopClbk;
      this.index = index;
      this.name = name;
   }
   Run() { // Get the stop signal from callback's implementation logic
      this.isNotCompleted = this.RunClbk(this.params);
   }
   Stop() {
      this.StopClbk(this.params);
      this.isActive = false;
   }
}

export class SequencedEvents {
   buffer = [];
   count = 0;
   size = MAX_SEQ_EVTS_SIZE;

   constructor() {
      this.Init();
   }

   Init() {
      for (let i = 0; i < this.size; i++) {
         this.buffer[i] = new SequencedEvent;
         this.buffer[i].Create(null, null, null, INT_NULL, 'Empty');
      }
   }
   GetNextFree() {
      for (let i = 0; i < this.size; i++) {
         if (!this.buffer[i].isActive) {
            return this.buffer[i];
         }
      }
      return null;
   }
   Create(RunClbk, StopClbk, params, name) {
      const empty = this.GetNextFree();
      if (empty) {
         empty.Create(RunClbk, StopClbk, params, this.count, name);
         empty.isNotCompleted = true;
         empty.isActive = true;
         this.count++;
      }
      else { alert('Not enough space for new Animation. At buffer.js:buffer.Create()') }
   }
   Run() {
      if (this.count) {
         for (let i = 0; i < this.size; i++) {
            if (this.buffer[i].isActive) {
               if (this.buffer[i].isNotCompleted) {
                  this.buffer[i].Run();
               }
               else { // Here do stuf if NOT inAnimation
                  this.buffer[i].Stop();
                  this.count--;
               }
            }
         }
      }
   }
}

// Create a local (to this implementation unit) buffer for storing all app's sequenced events
const seqEvts = new SequencedEvents;

/**
 * Pass 2 callbacks, 
 *    one with the implementation of code that will run on every Sequenced Events buffer Update,
 *     and a second one to handle the call of another event (or stop the current event's update)
 *    The RunClbk is responsible to return true, if the event is NOT completed
 *       and false if the event is completed, which then triggers the StopClbk function to run.
 * 
 *    There is no need to return the sequenced event, as it is updated internaly from the class SequencedEvents on every frame.
 */
export function SequencedEventsCreate(RunClbk, StopClbk, params, name){
   seqEvts.Create(RunClbk, StopClbk, params, name)
}