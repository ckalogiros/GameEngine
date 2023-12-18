"use strict";

const MAX_DRAWQUEUE_COUNT = 64; // Number of Gl programs for the queue  

class Queue {

   groupidx;
   progidx;
   vbidx;
   queueIdx;
   isActive;

   constructor(){
      this.Reset();
   }

   Set(elem){
      this.groupidx  = elem.groupidx;
      this.progidx  = elem.progidx;
      this.vbidx    = elem.vbidx;
      this.queueIdx = elem.queueIdx;
      this.isActive = elem.isActive;
   }
   
   Reset(){
      this.groupidx  = INT_NULL;
      this.progidx  = INT_NULL;
      this.vbidx    = INT_NULL;
      this.queueIdx = INT_NULL;
      this.isActive = false;
   }

}

class RenderQueue {

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

   Deactivate(groupidx, progidx, vbidx){

      const foundIdx = this.Find(groupidx, progidx, vbidx);
      if (foundIdx !== INT_NULL && foundIdx < this.count-1) {
         this.buffer[foundIdx].isActive = false;
         this.RebuildActiveQueue()
      }
   }

   RebuildActiveQueue(){ // Recreates an array of all active vertex buffers from the draw queue on every Frame.

      this.activeCount = 0;
      this.active = []; // Reset curent active queue buffer
      for (let i = 0; i < this.size; i++) {
         if(this.buffer[i].isActive){ // recreate the active queue buffer from the renderqueue buffer 
            this.active[this.activeCount++] = this.buffer[i];
         }
      }
   }

   UpdateActiveQueueByIdx(idx){ // Recreates an array of all active vertex buffers from the draw queue on every Frame.
      this.active[this.activeCount++] = this.buffer[idx];
   }


   Add(groupidx, progidx, vbidx, isActive) {

      // index = (i * (columns * depth)) + (j * depth) + k
      // index = (groupidx * (max_progs * max_vbs)) + (progidx * max_vbs) + vbidx
      const obj = {
         groupidx: groupidx,
         progidx: progidx,
         vbidx: vbidx,
         queueIdx: this.count,
         isActive: isActive,
      }
      this.buffer[this.count].Set(obj);
      this.count++;

      // DEBUG
      if(this.count > this.size) alert('ERROR - RenderQueue buffer is FULL')
   }


   Find(groupidx, progidx, vbidx) {

      if(!this.count) return INT_NULL; // Case RenderQueue hasn't been initialized
      for (let i = 0; i < this.size; i++) {
         if (this.buffer[i].vbidx === vbidx &&
            this.buffer[i].progidx === progidx && 
            this.buffer[i].groupidx === groupidx) {
            return i;
         }
      }
      return INT_NULL;
   }
   
   FindAllBuffersFromProgram(groupidx, progidx) {

      if(!this.count) return INT_NULL; // Case RenderQueue hasn't been initialized
      let idxs = [];
      for (let i = 0; i < this.size; i++) {
         if (this.buffer[i].progidx === progidx && this.buffer[i].groupidx === groupidx) {
            idxs.push(i);
         }
      }
      return idxs;
   }

   Swap(obj1, obj2){

      const temp = new Queue;
      temp.Set(obj1);
      obj1.Set(obj2);
      obj2.Set(temp);
   }

   // TODO: SLOW, 
   SetPriority(flag, groupidx, progidx, vbidx = ALL){

      if(vbidx === ALL){

         const idxs = this.FindAllBuffersFromProgram(groupidx, progidx);

         for(let k=0; k<idxs.length; k++){

            if(flag === 'first' && idxs[k] > 0){

               // Move all elements to the right
               for(let i = idxs[k]; i>0; i--){
                  this.buffer[i].Set(this.buffer[i-1]);
               }
               // Store back prioritized element
               this.buffer[0].Set(temp);
            }
            else if(flag === 'last' && idxs[k] < this.count-1){
               // Move all elements to the left
               for(let i = idxs[k]; i<this.count; i++){
                  this.buffer[i].Set(this.buffer[i+1]);
               }
               // Store back prioritized element
               this.buffer[this.count-1].Set(temp); 
            }
         }

      }

      /**************************************************************************/

      const idx = this.Find(groupidx, progidx, vbidx);
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

   /**
    * INEFFICIENT.
    * But we do not care for now.
    * // TODO: Implement correctly: using bubble sort? 
    */
   SetPriorityProgram(flag, groupidx, progidx){

      if(!this.count) return; // Case RenderQueue hasn't been initialized

      for (let i = 0; i < this.count; i++) {
         
         if (this.buffer[i].progidx === progidx && this.buffer[i].groupidx === groupidx) {
            this.SetPriority(flag, groupidx, progidx, this.buffer[i].vbidx)
         }
      }
   }

   SetPrioritySwap(progs_groupidx1, progIdx1, vbIdx1, progs_groupidx2, progIdx2, vbIdx2){

      const idx1 = this.Find(progs_groupidx1, progIdx1, vbIdx1);
      const idx2 = this.Find(progs_groupidx2, progIdx2, vbIdx2);
      if(idx1 !== INT_NULL && idx2 !== INT_NULL){
         const temp = new Queue;
         temp.Set(this.buffer[idx1]); // Temporary store the prioritized element
         this.buffer[idx1].Set(this.buffer[idx2]);
         this.buffer[idx2].Set(temp);
      }
   }

   // Debug
   PrintAll() {
      console.log('--- RenderQueue All');
      for(let i=0; i<this.count; i++){
         if(this.buffer[i]) console.log(this.buffer[i]);
      }
   }
   PrintActive() {
      console.log('--- RenderQueue Active');
      console.log(this.active);
      for(let i=0; i<this.activeCount; i++){
         if(this.active[i]) console.log(this.active[i]);
      }
   }
}

const renderQueue = new RenderQueue;

export function Renderqueue_get() { return renderQueue; }

export function Renderqueue_get_active() { return renderQueue.active; }
export function Renderqueue_active_get_count() { return renderQueue.activeCount; }

// Set priority to the render queue buffer, but need to update the active render queue buffer.
export function Renderqueue_set_priority(flag, progs_groupidx1, progidx, vbidx) { 
   renderQueue.SetPriority(flag, progs_groupidx1, progidx, vbidx); 
}

// Set priority to the active render queue buffer, no need to update.
export function Renderqueue_set_priority_to_active_queue(flag, groupidx, progidx, vbidx) { /*// TODO: IMPLEMENT*/ }

// Update the active queue, when new gfx buffers have been created
export function Renderqueue_update_active_queue() { renderQueue.RebuildActiveQueue(); }

/**
 * Enable and Disable programs and vertex buffers from the draw queue.
 * It is called from the GfxVbRender function. If a vertex buffer has 
 * changed(enabled or disabled for drawing), we must add or remove
 * these programs-vertex buffers from the draw queue.
 */
export function Renderqueue_set_active(groupidx, progidx, vbidx, flag){ 
   // console.log(flag, '1111111111111111111111 Renderqueue_set_active ', groupidx, progidx, vbidx)
   const idx = renderQueue.Find(groupidx, progidx, vbidx);
   if(idx !== INT_NULL){

      renderQueue.buffer[idx].isActive = flag;
      // renderQueue.UpdateActiveQueueByIdx(idx);
      // IMPORTANT: Rebuild the queue once, if this function is called at least once
      renderQueue.RebuildActiveQueue(); // Create a new active buffer from the updated queue
   }
}

export function Renderqueue_Add(groupidx, progidx, vbidx, isActive) {
   renderQueue.Add(groupidx, progidx, vbidx, isActive);
}


export function Renderqueue_init() {
   renderQueue.Init(); // One time initialization(creates an empty buffer...)
}



