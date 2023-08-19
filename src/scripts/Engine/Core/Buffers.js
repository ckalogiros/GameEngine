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

   Init(size) {

      this.size = size;
      this.buffer = new Array(size);
   }

   Add(elem) {

      const idx = this.GetNextFree();
      this.buffer[idx] = elem;
      return idx;
   }


   RemoveByIdx(idx) {

      if (this.buffer[idx] !== null) {

         /**
          * In this implementation of buffer, we run 
          * the loops until count and not until size. 
          * For this to work, we can only decrement count
          * if all next elements are not used.
          * All we are doing is 
          * to have the count at the last used element of the buffer.
          */

         this.buffer[idx] = null;

         if (this.count === 1) {
            this.count = 0;
            return;
         }

         else if (this.count === this.size) {
            this.count--;
            return;
         }

         else {
            const count = this.count + 1;
            for (let i = count; i > 0; i--) {

               if (this.buffer[this.count - 1] || this.count === 0) break;
               this.count--;
            }
         }
         if(this.count === INT_NULL) 
            alert('M_Buffer count = -1')
      }
   }

   GetNextFree() {

      if (this.count >= this.size) {
         // buffer is full.
         this.Realloc();
         const freeIdx = this.count++;
         return freeIdx;
      }

      // We run until count and not size (the whole buffer) 
      // since count does not decrement (on remove) below the last element's index.
      for (let i = 0; i <= this.count; i++) {
         if (!this.buffer[i]) {
            // Increment count only if the free element is after the last stored element in the buffer.
            if (i >= this.count) this.count++;
            return i;
         }
      }
   }

   Realloc() {

      if (this.size <= 0) {
         this.size = 1;
      }
      else this.size *= 2;

      const oldData = this.buffer;
      this.buffer = new Array(this.size);

      if (oldData) this.#CopyBuffer(oldData)
      console.warn('Resizing M_Buffer!')
   }

   #CopyBuffer(oldData) {

      const size = oldData.length;
      for (let i = 0; i < size; i++) {
         this.buffer[i] = oldData[i];
      }
   }
}


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

      if (this.count >= this.size) {

         console.warn(`Int8Array\'s buffer is uninitialized Or buffer overflow. buffer:${this.buffer}, count:${this.count}, size:${this.size}`)
         this.Realloc();
      }

      const idx = this.count;
      this.buffer[idx] = elem;
      this.count++;
   }

   Reset() {

      this.size = 1;
      this.count = 0;
      this.buffer = new Int8Array(this.size);
   }

   Realloc() {

      if (this.size <= 0) this.size = 1;
      else this.size *= 2;

      const oldData = this.buffer;
      this.buffer = new Int8Array(this.size);

      if (oldData) this.#CopyBuffer(oldData)
      console.warn('Resizing Int8Buffer!')
   }


   RemoveByIdx(idx) {

      /**
       * TODO: Remove Only works for removing last element.
       * Else implement a GetFreeIdx() approach.
       */

      // Guard for now, Reimplement later. SEE above explanation.
      if (idx < this.count - 1) { // If it is not the last element
         alert('Try to remove element that is not last in buffer. @ M_Buffer.RemoveByIdx().');
         return;
      }

      this.buffer[idx] = INT_NULL;
      this.count--;
   }

   #CopyBuffer(oldData) {

      const size = oldData.length;
      for (let i = 0; i < size; i++) {
         this.buffer[i] = oldData[i];
      }
   }
}

