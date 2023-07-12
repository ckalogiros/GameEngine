import { GlGetProgram, GlGetPrograms, GlGetProgramsCnt } from "../../../Graphics/GlProgram.js";

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

const drawQueue = new RenderQueue;

export function RenderQueueGet() { return drawQueue; }

export function RenderQueueGetActive() { return drawQueue.active; }
export function RenderQueueGetActiveCount() { return drawQueue.activeCount; }

export function RenderQueueSetPriority(flag, progIdx, vbIdx) { drawQueue.SetPriority(flag, progIdx, vbIdx); }

/**
 * Enable and Disable programs and vertex buffers from the draw queue.
 * It is called from the GfxVbShow function. If a vertex buffer has 
 * changed(enabled or disabled for drawing), we must add or remove
 * these programs-vertex buffers from the draw queue.
 */
export function RenderQueueUpdate(progIdx, vbIdx, flag){ 
   const idx = drawQueue.Find(progIdx, vbIdx);
   if(idx !== INT_NULL){
      drawQueue.buffer[idx].isActive = flag;
      drawQueue.UpdateActiveQueue(); // Create a new active buffer from the updated queue
   }
}


export function RenderQueueCreate() {
   drawQueue.Init(); // One time initialization(creates an empty buffer...)
   drawQueue.Create();

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

   drawQueue.UpdateActiveQueue();
   // drawQueue.PrintAll();

   // BallProjLineSetPriority();
}

