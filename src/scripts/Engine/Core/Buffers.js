"use strict";

export class M_Buffer {

   buffer;
   count;
   size;

   constructor() {

      this.buffer = null;
      this.count = 0;
      this.size = INT_NULL;
   }
   
   Init(size){
      
      this.size = size;
      this.buffer = new Array(size);
   }

   Add(elem) {

      if(!this.buffer || this.count >= this.size) {
         console.warn(`M_Buffer\'s buffer is uninitialized Or buffer overflow. buffer:${this.buffer}, count:${this.count}, size:${this.size}`)
         
         this.Realloc();
         const idx = this.count++;
         this.buffer[idx] = elem;
         console.warn(`AFTER REALLOC\nbuffer:${this.buffer}, count:${this.count}, size:${this.size}`)
         return idx;
      }

      const idx = this.count++;
      this.buffer[idx] = elem;
      return idx;
   }

   Realloc(){

      if(this.size <= 0) this.size = 1;
      else this.size *= 2;
      
      const oldData = this.buffer;
      this.buffer = new Array(this.size);

      if(oldData) this.#CopyBuffer(oldData)
      console.warn('Resizing M_Buffer!')
  }

  #CopyBuffer(oldData){

      const size = oldData.length;
      for(let i=0; i<size; i++){
         this.buffer[i] = oldData[i];
      }
  }
}

/**
 * TODO: Implement Realloc
 */
export class Int8Buffer {

   buffer;
   count;
   size;

   constructor(size = 1, val = INT_NULL) {

      this.buffer = new Int8Array(size);
      this.count = 0;
      this.size = size;

      this.Init(val);
   }

   Init(val) {

      for (let i = 0; i < this.size; i++)
         this.buffer[i] = val;
   }

   Add(elem) {

      if(this.count >= this.size) {

         console.warn(`Int8Array\'s buffer is uninitialized Or buffer overflow. buffer:${this.buffer}, count:${this.count}, size:${this.size}`)
         this.Realloc();
      }

      const idx = this.count;
      this.buffer[idx] = elem;
      this.count++;
   }

   Reset(){

      this.size = 1;
      this.count = 0;
      this.buffer = new Int8Array(this.size);
   }

   Realloc(){

      if(this.size <= 0) this.size = 1;
      else this.size *= 2;
      
      const oldData = this.buffer;
      this.buffer = new Int8Array(this.size);

      if(oldData) this.#CopyBuffer(oldData)
      console.warn('Resizing Int8Buffer!')
  }

  #CopyBuffer(oldData){

      const size = oldData.length;
      for(let i=0; i<size; i++){
         this.buffer[i] = oldData[i];
      }
  }
}

// export class Int8Buffer2D {

//    buffer;
//    count;
//    size;

//    constructor(size) {
//       this.buffer = new Int8Array(size);
//       this.count = 0;
//       this.size = size;
//    }

//    Init(val) {
//       for (let i = 0; i < this.size; i++)
//          this.buffer[i] = val;
//    }

//    Add(elem) {

//       if(this.count >= this.size) alert('Int8Buffer Buffer Needs To Grow. @ Buffers.js')

//       const idx = this.count;
//       this.buffer[idx] = elem;
//       this.count++;
//    }
// }