import { GlGetProgram, GlGetPrograms, GlGetProgramsCnt } from "../../Graphics/GlProgram.js";

const MAX_DRAWQUEUE_COUNT = 32; // Number of Gl programs for the queue  

class Queue {

   progIdx;
   vbIdx;
   queueIdx;
   isActive;

   constructor(){
      this.progIdx = INT_NULL;
      this.vbIdx = INT_NULL;
      this.queueIdx = INT_NULL;
      this.isActive = false;
   }

   Set(elem){
      this.progIdx = elem.progIdx;
      this.vbIdx = elem.vbIdx;
      this.queueIdx = elem.queueIdx;
      this.isActive = elem.isActive;
   }
   Reset(){
      this.progIdx = INT_NULL;
      this.vbIdx = INT_NULL;
      this.queueIdx = INT_NULL;
      this.isActive = false;
   }
}

class DrawQueue {

   buffer = [];
   count = 0;
   size = 0;
   active = [];
   activeCount = 0;

   constructor() {
      this.size = MAX_DRAWQUEUE_COUNT;
   }

   Init() {
      for (let i = 0; i < this.size; i++) {
         this.buffer[i] = new Queue;
      }
   }
   Create(){
      const progs = GlGetPrograms();
      const progCount = GlGetProgramsCnt();
      for (let i = 0; i < progCount; i++) {
         for (let j = 0; j < progs[i].vertexBufferCount; j++) {
            const isActive = progs[i].vertexBuffer[j].show; 
            const progIdx = progs[i].info.progIdx;
            const vbIdx = progs[i].vertexBuffer[j].idx;
            this.Store(progIdx, vbIdx, isActive);
         }
      }
   }
   UpdateActiveQueue(){ // Recreates an array of all active vertex buffers from the draw queue on every Frame.
      this.activeCount = 0;
      for (let i = 0; i < this.size; i++) {
         if(this.buffer[i].isActive){
            this.active[this.activeCount++] = this.buffer[i];
         }
      }
   }
   Store(progIdx, vbIdx, isActive) {
      const obj = {
         progIdx: progIdx,
         vbIdx: vbIdx,
         queueIdx: this.count,
         isActive: isActive,
      }
      this.buffer[this.count].Set(obj);
      this.count++;

      // DEBUG
      if(this.count > this.size) alert('ERROR - DrawQueue buffer is FULL')
   }
   Remove(progIdx, vbIdx) {
      const foundIdx = this.Find(progIdx, vbIdx);
      if (foundIdx !== INT_NULL && foundIdx < this.count-1) {

         for(let i = foundIdx; i<this.count; i++){
            this.buffer[i].Set(this.buffer[i+1]);
         }

         this.buffer[this.count-1].Reset();
         this.count--;

         this.UpdateActiveQueue();

         // DEBUG
         if (this.count < 0) alert('ERROR - DrawQueue count is negative')
      }
   }
   Find(progIdx, vbIdx) {
      if(!this.count) return INT_NULL; // Case DrawQueue hasn't been initialized
      for (let i = 0; i < this.size; i++) {
         if (this.buffer[i].vbIdx === vbIdx &&
            this.buffer[i].progIdx === progIdx) {
            return i;
         }
      }
      return INT_NULL;
   }

   Swap(obj1, obj2){
      const temp = new Queue;
      temp.Set(obj1);
      obj1.Set(obj2);
      obj2.Set(temp);
   }
   SetPriority(flag, progIdx, vbIdx){
      const idx = this.Find(progIdx, vbIdx);
      if(idx !== INT_NULL){

         const temp = new Queue;
         temp.Set(this.buffer[idx]); // Temporary store the prioritized element

         if(flag === 'first' && idx > 0){
            // Move all elements to the right
            for(let i = idx; i>0; i--){
               this.buffer[i].Set(this.buffer[i-1]);
            }
            // Store back prioritized element
            this.buffer[0].Set(temp);
            // this.PrintAll();
         }
         else if(flag === 'last' && idx<this.count-1){
            // Move all elements to the left
            for(let i = idx; i<this.count; i++){
               this.buffer[i].Set(this.buffer[i+1]);
            }
            // Store back prioritized element
            this.buffer[this.count-1].Set(temp); 
         }
      }
   }
   SetPrioritySwap(progIdx1, vbIdx1, progIdx2, vbIdx2){
      const idx1 = this.Find(progIdx1, vbIdx1);
      const idx2 = this.Find(progIdx2, vbIdx2);
      if(idx1 !== INT_NULL && idx2 !== INT_NULL){
         const temp = new Queue;
         temp.Set(this.buffer[idx1]); // Temporary store the prioritized element
         this.buffer[idx1].Set(this.buffer[idx2]);
         this.buffer[idx2].Set(temp);
      }
   }

   // Debug
   PrintAll() {
      console.log('----------------------------------------------------------------');
      for (let i = 0; i < this.size; i++) {
         if (this.buffer[i].progIdx !== INT_NULL) {
            const prog = GlGetProgram(this.buffer[i].progIdx);
            const progActive = prog.isActive;
            const vbActive = prog.vertexBuffer[this.buffer[i].vbIdx].show;
            console.log(this.buffer[i]);
            console.log(`progActive:${progActive} vbActive:${vbActive}`);
         }
      }

   }
}

const drawQueue = new DrawQueue;

export function DrawQueueGet() { return drawQueue; }

export function DrawQueueGetActive() { return drawQueue.active; }
export function DrawQueueGetActiveCount() { return drawQueue.activeCount; }

/**
 * Enable and Disable programs and vertex buffers from the draw queue.
 * It is called from the GfxVbShow function. If a vertex buffer has 
 * changed(enabled or disabled for drawing), we must add or remove
 * these programs-vertex buffers from the draw queue.
 */
export function DrawQueueUpdate(progIdx, vbIdx, flag){ 
   const idx = drawQueue.Find(progIdx, vbIdx);
   if(idx !== INT_NULL){
      drawQueue.buffer[idx].isActive = flag;
      drawQueue.UpdateActiveQueue(); // Create a new active buffer from the updated queue
   }
}
export function DrawQueueSetPriority(flag, progIdx, vbIdx) { drawQueue.SetPriority(flag, progIdx, vbIdx); }

