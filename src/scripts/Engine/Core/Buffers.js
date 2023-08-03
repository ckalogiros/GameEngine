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
      
      // if(size){
         this.size = size;
         this.buffer = new Array(size);
      // }
      // else{
      //    this.buffer = [];
      // }

   }

   Add(elem) {

      if(!this.buffer || this.count >= this.size) {
         console.error('M_Buffer\'s buffer is uninitialized Or buffer overflow')
         return;
      }

      // if(this.count >= this.size) alert('M_Buffer Needs To Grow. @ Buffers.js')

      const idx = this.count++;
      this.buffer[idx] = elem;
      return idx;
   }

   Realloc(){

      this.size *= 2;
      const oldData = this.data;
      this.data = new Array(this.size);
      this.CopyBuffer(oldData)
      console.warn('Resizing M_Buffer!')
  }

  #CopyBuffer(oldData){

      const size = oldData.length;
      for(let i=0; i<size; i++){
         this.data[i] = oldData[i];
      }
  }
}


export class Int8Buffer {

   buffer;
   count;
   size;

   constructor(size) {
      this.buffer = new Int8Array(size);
      this.count = 0;
      this.size = size;
   }

   Init(val) {
      for (let i = 0; i < this.size; i++)
         this.buffer[i] = val;
   }

   Add(elem) {

      if(this.count >= this.size) alert('Int8Buffer Buffer Needs To Grow. @ Buffers.js')

      const idx = this.count;
      this.buffer[idx] = elem;
      this.count++;
   }
}