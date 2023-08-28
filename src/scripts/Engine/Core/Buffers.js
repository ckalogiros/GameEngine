"use strict";

class Buffer_Interface {

   buffer;
   count; // Counts how many elements from start until last element. (Some elements in between could be null)
   active_count; // Counts how many elements are not null
   size;

   constructor(size=INT_NULL) {

      this.buffer = null;
      this.count = 0;
      this.active_count = 0;
      this.size = size;
   }

   Add(elem) {

      const idx = this.GetNextFree();
      this.buffer[idx] = elem;
      this.active_count++;
      return idx;
   }


   Reset() {

      this.size = INT_NULL;
      this.count = 0;
      this.buffer = null;
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
         this.active_count--;

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
         ERROR_NULL(this.active_count);
      }
   }

   GetNextFree() {

      if (this.count >= this.size) {

         this.Realloc(); // buffer is full.
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

   CopyBuffer(oldData) {

      const size = oldData.length;
      for (let i = 0; i < size; i++) {
         this.buffer[i] = oldData[i];
      }
   }

   /** Debug */
   Print(){
      console.log('Count: ', this.count)
      console.log(this.buffer)
   }

   PrintMeshInfo(){
      console.log('Count: ', this.count)
      for (let i=0; i<this.count; i++){
         if(this.buffer[i].mesh){

            console.log(this.buffer[i].mesh.name)
         }
      }
   }
}
export class M_Buffer extends Buffer_Interface{

   constructor() {

      super();
   }

   Init(size) {

      this.size = size;
      this.buffer = new Array(size);
   }


   Realloc() {

      if (this.size <= 0) {
         this.size = 1;
      }
      else this.size *= 2;

      const oldData = this.buffer;
      this.buffer = new Array(this.size);

      if (oldData) this.CopyBuffer(oldData)
      console.warn('Resizing M_Buffer!')
   }

}


export class Int8Buffer extends Buffer_Interface {

   constructor(size) {

      super(size);
   }

   Init(val) {

      if(!this.buffer) this.buffer = new Int8Array(this.size)
      for (let i = 0; i < this.size; i++)
         this.buffer[i] = val;
   }

   AddAtIndex(idx, elem) {
      if(idx <0 || idx > this.size) console.error('WRONG Index. Adding item at: ', idx, ' with size:', this.size)
      // if(!this.buffer) this.Init(this.size, INT_NULL)

      this.buffer[idx] = elem;
      this.active_count++;
      if(this.count < idx) this.count = idx+1;
      return idx;
   }

   Realloc() {

      if (this.size <= 0) {
         this.size = 1;
      }
      else this.size *= 2;

      const oldData = this.buffer;
      this.buffer = new Int8Array(this.size);

      if (oldData) this.CopyBuffer(oldData)
      console.warn('Resizing Int8Buffer!')
   }

}

export class Int8_2DBuffer {

   buffer;
   count; // CAUTION! Do not rely on the count variable.Its use is only for counting how many alements are in use(1 count for both rows and columns).
   size;
   numcols;

   constructor(numrows=0, numcols=0) {

      this.size = numcols * numrows;    
      this.numcols = numcols;    
      if(ERROR_NULL(this.size)) alert('Must initialize Int8_2dBuffer with a size > 1');

      this.buffer = new Int8Array(this.size);
      this.count = 0;

      this.Init(INT_NULL);
   }

   Init(val){
      for(let i=0; i<this.size; i++){
         this.buffer[i] = val;
      }
   }

   Add(rowidx, val){

      const idx = this.GetNextFree(rowidx);
      if(idx !== INT_NULL){
         this.buffer[idx] = val;
         this.count++;
      }
   }

   GetElem(rowidx, colidx){
      return this.buffer[this.numcols * rowidx + colidx];
   }

   GetRow(rowidx){
      const row = [];
      for(let i=0; i<this.numcols; i++){

         const idx = this.numcols * rowidx + i;

         if(this.buffer[idx] !== INT_NULL)
            row[i] = this.buffer[idx];
      }
      return row;
   }
   
   GetNextFree(rowidx) {

      for (let i = 0; i <= this.size; i++) {

         const idx =  this.numcols * rowidx + i;
         if (this.buffer[idx] === INT_NULL) {
            return idx;
         }
      }
      return INT_NULL;
   }

   RemoveByIdx(rowidx, i) {
      
      const idx =  this.numcols * rowidx + i;

      if(idx > INT_NULL && idx < this.size){
         this.buffer[idx] = INT_NULL;
         this.count--;
      }
   }

   RemoveAll(){

      for (let i = 0; i <= this.size; i++)
         this.buffer[i] = INT_NULL
      this.count = 0;
   }
   // RemoveByIdx(idx) {

   //    if (this.buffer[idx] !== null) {

   //       /**
   //        * In this implementation of buffer, we run 
   //        * the loops until count and not until size. 
   //        * For this to work, we can only decrement count
   //        * if all next elements are not used.
   //        * All we are doing is 
   //        * to have the count at the last used element of the buffer.
   //        */

   //       this.buffer[idx] = null;

   //       if (this.count === 1) {
   //          this.count = 0;
   //          return;
   //       }

   //       else if (this.count === this.size) {
   //          this.count--;
   //          return;
   //       }

   //       else {
   //          const count = this.count + 1;
   //          for (let i = count; i > 0; i--) {

   //             if (this.buffer[this.count - 1] || this.count === 0) break;
   //             this.count--;
   //          }
   //       }
   //       if(this.count === INT_NULL) 
   //          alert('M_Buffer count = -1')
   //    }
   // }
   /** Debug */
   Print(){
      console.log('Count: ', this.count)
      console.log(this.buffer)
   }

   PrintMeshInfo(){
      console.log('Count: ', this.count)
      for (let i=0; i<this.count; i++){
         if(this.buffer[i].mesh){

            console.log(this.buffer[i].mesh.name)
         }
      }
   }

}

