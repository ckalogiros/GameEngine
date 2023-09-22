import { GlGetPrograms, GlGetProgramsCnt } from "../../../Graphics/GlProgram.js";

const MAX_DRAWQUEUE_COUNT = 32; // Number of Gl programs for the queue  

class Queue {

   progIdx;
   vbIdx;
   queueIdx;
   isActive;

   constructor(){
      this.progIdx  = INT_NULL;
      this.vbIdx    = INT_NULL;
      this.queueIdx = INT_NULL;
      this.isActive = false;
   }

   Set(elem){
      this.progIdx  = elem.progIdx;
      this.vbIdx    = elem.vbIdx;
      this.queueIdx = elem.queueIdx;
      this.isActive = elem.isActive;
   }

   Reset(){
      this.progIdx  = INT_NULL;
      this.vbIdx    = INT_NULL;
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

   Create(){

      const progs = GlGetPrograms();
      const progCount = GlGetProgramsCnt();
      for (let i = 0; i < progCount; i++) {
         for (let j = 0; j < progs[i].vertexBufferCount; j++) {
            const isActive = progs[i].vertexBuffer[j].show; 
            const progIdx = progs[i].idx;
            const vbIdx = progs[i].vertexBuffer[j].idx;
            this.Add(progIdx, vbIdx, isActive);
         }
      }
   }

   Deactivate(progidx, vbidx){

      const foundIdx = this.Find(progidx, vbidx);
      if (foundIdx !== INT_NULL && foundIdx < this.count-1) {
         this.buffer[foundIdx].isActive = false;
         this.UpdateActiveQueue()
      }
   }

   UpdateActiveQueue(){ // Recreates an array of all active vertex buffers from the draw queue on every Frame.

      this.activeCount = 0;
      this.active = [];
      for (let i = 0; i < this.size; i++) {
         if(this.buffer[i].isActive){
            this.active[this.activeCount++] = this.buffer[i];
         }
      }
   }

   Add(progIdx, vbIdx, isActive) {

      const obj = {
         progIdx: progIdx,
         vbIdx: vbIdx,
         queueIdx: this.count,
         isActive: isActive,
      }
      this.buffer[this.count].Set(obj);
      this.count++;

      // DEBUG
      if(this.count > this.size) alert('ERROR - RenderQueue buffer is FULL')
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
         if (this.count < 0) alert('ERROR - RenderQueue count is negative')
      }
   }

   Find(progIdx, vbIdx) {

      if(!this.count) return INT_NULL; // Case RenderQueue hasn't been initialized
      for (let i = 0; i < this.size; i++) {
         if (this.buffer[i].vbIdx === vbIdx &&
            this.buffer[i].progIdx === progIdx) {
            return i;
         }
      }
      return INT_NULL;
   }
   FindAllBuffersFromProgram(progIdx) {

      if(!this.count) return INT_NULL; // Case RenderQueue hasn't been initialized
      let idxs = [];
      for (let i = 0; i < this.size; i++) {
         if (this.buffer[i].progIdx === progIdx) {
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
   SetPriority(flag, progIdx, vbIdx = ALL){

      if(vbIdx === ALL){

         const idxs = this.FindAllBuffersFromProgram(progIdx);

         for(let k=0; k<idxs.length; KeyframeEffect++){

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
    * TODO: Implement correct bubble? sort 
    */
   SetPriorityProgram(flag, progIdx){

      if(!this.count) return; // Case RenderQueue hasn't been initialized

      for (let i = 0; i < this.size; i++) {
         
         if (this.buffer[i].progIdx === progIdx) {
            this.SetPriority(flag, progIdx, i)
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
      console.log('--- RenderQueue All');
      console.log(this.buffer);
   }
   PrintActive() {
      console.log('--- RenderQueue Active');
      console.log(this.active);
   }
}

const renderQueue = new RenderQueue;

export function RenderQueueGet() { return renderQueue; }

export function RenderQueueGetActive() { return renderQueue.active; }
export function RenderQueueGetActiveCount() { return renderQueue.activeCount; }

export function RenderQueueSetPriority(flag, progIdx, vbIdx) { renderQueue.SetPriority(flag, progIdx, vbIdx); }

/**
 * Enable and Disable programs and vertex buffers from the draw queue.
 * It is called from the GfxVbRender function. If a vertex buffer has 
 * changed(enabled or disabled for drawing), we must add or remove
 * these programs-vertex buffers from the draw queue.
 */
export function RenderQueueUpdate(progIdx, vbIdx, flag){ 

   const idx = renderQueue.Find(progIdx, vbIdx);
   if(idx !== INT_NULL){

      renderQueue.buffer[idx].isActive = flag;
      renderQueue.UpdateActiveQueue(); // Create a new active buffer from the updated queue
   }
}


export function RenderQueueInit() {
   renderQueue.Init(); // One time initialization(creates an empty buffer...)
}
export function RenderQueueCreate() {
   // renderQueue.Init(); // One time initialization(creates an empty buffer...)
   renderQueue.Create();

   /** Build up the draw queue, to draw all meshes in the correct order */
   {
       /**
        * In order to draw on top must:
        *  1. render the mesh last in the buffer
        *  2. have a z-index greater 
        * OR
        *  1. First draw the mesh with the less z-index
        *  2. Then draw the on top mesh with greater z-index 
       */
       //    scenes.SetPriority(APP_MESHES_IDX.bricks, 'first');

       // Ui. All ui are in one buffer, so setting any one ui is enough 
       // scenes.SetPriority(APP_MESHES_IDX.ui.animText, 'first');

       // scenes.SetPriority(APP_MESHES_IDX.coins, 'first');
       // scenes.SetPriority(APP_MESHES_IDX.powUps, 'first');
       // scenes.SetPriority(APP_MESHES_IDX.balls, 'first');


       // // Explosions
       // scenes.SetPriority(APP_MESHES_IDX.fx.twist, 'first');
       // scenes.SetPriority(APP_MESHES_IDX.fx.explosions.circle, 'first');
       // scenes.SetPriority(APP_MESHES_IDX.fx.explosions.simple, 'first');
       // scenes.SetPriority(APP_MESHES_IDX.fx.glow, 'first');
       // scenes.SetPriority(APP_MESHES_IDX.fx.shadow, 'first');

       // scenes.SetPriority(APP_MESHES_IDX.player, 'first');


       // // Particles
       // scenes.SetPriority(APP_MESHES_IDX.fx.particleSystem.ballTail, 'first');

       // scenes.SetPriority(APP_MESHES_IDX.ui.fps.avg1s, 'first');
       // scenes.SetPriority(APP_MESHES_IDX.ui.fps.avg, 'first');
       // scenes.SetPriority(APP_MESHES_IDX.fx.vortex, 'first');

       // scenes.SetPriority(APP_MESHES_IDX.bricks, 'first');
       
       // // Buttons
       // scenes.SetPriority(APP_MESHES_IDX.buttons.play, 'first');
       // scenes.SetPriority(APP_MESHES_IDX.buttons.continue, 'first');
       // scenes.SetPriority(APP_MESHES_IDX.buttons.start, 'first');
       
       // scenes.SetPriority(APP_MESHES_IDX.framebuffer, 'first');
       
       // // RenderQueueSetPriority('last',5,3);
       // // Backgrounds
       // scenes.SetPriority(APP_MESHES_IDX.background.finishStage, 'first');
       // scenes.SetPriority(APP_MESHES_IDX.background.stageMenu, 'first');
       // scenes.SetPriority(APP_MESHES_IDX.background.stage, 'first');
       // scenes.SetPriority(APP_MESHES_IDX.background.startStage, 'first');
       // scenes.SetPriority(APP_MESHES_IDX.background.startMenu, 'first');
       
   }

   renderQueue.UpdateActiveQueue();
   // renderQueue.PrintAll();

   // BallProjLineSetPriority();
}


