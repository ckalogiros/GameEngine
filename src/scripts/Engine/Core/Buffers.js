"use strict";

class Buffer_Interface {

   buffer;
   boundary; // Counts how many elements from start until last element. (Some elements in between could be null)
   active_count; // Counts how many elements are not null
   size;

   constructor(m_buffer=null) {

      this.buffer = null;
      this.boundary = 0;
      this.active_count = 0;
      this.size = INT_NULL;

      if(m_buffer){

         return this.Copy(m_buffer);
      }
   }

   Add(elem) {

      const idx = this.GetNextFree();
      this.buffer[idx] = elem;
      this.active_count++;
      return idx;
   }


   Reset() {

      this.size = INT_NULL;
      this.boundary = 0;
      this.active_count = 0;
      this.buffer = null;
   }

   Copy(m_buffer){

      this.size = m_buffer.size;
      this.buffer = new Array(this.size);

      if(m_buffer instanceof Buffer_Interface){
         for(let i=0; i<m_buffer.boundary; i++){

            this.buffer[i] = m_buffer.buffer[i];
            this.boundary++;
            this.active_count++;
         }

         return this;
      }
      return null;
   }

   RemoveByIdx(idx) {

      /**DEBUG */ if(idx < 0 || idx > this.size-1) 
         alert('Index Out of bounds. @ M_Buffer.RemoveByIdx().')

      if (this.buffer[idx] !== null) {

         /**
          * In this implementation of buffer, we run 
          * the loops until boundary and not until size. 
          * For this to work, we can only decrement boundary
          * if all next elements are not used.
          * All we are doing is 
          * to have the boundary at the last used element of the buffer.
          */

         this.buffer[idx] = null;
         this.active_count--;

         if (this.boundary === 1) {
            this.boundary = 0;
            return;
         }

         else {
            const boundary = this.boundary + 1;
            for (let i = boundary; i > 0; i--) {

               if (this.buffer[this.boundary - 1] || this.boundary === 0) break;
               this.boundary--;
            }
         }

         if(this.boundary === INT_NULL) 
            alert('M_Buffer boundary = -1')
         ERROR_NULL(this.active_count);
      }
   }

   GetNextFree() {

      if (this.boundary >= this.size) {

         this.Realloc(); // buffer is full.
         const freeIdx = this.boundary++;
         return freeIdx;
      }

      // We run until boundary and not size (the whole buffer) 
      // since boundary does not decrement (on remove) below the last element's index.
      for (let i = 0; i <= this.boundary; i++) {
         if (!this.buffer[i]) {
            // Increment boundary only if the free element is after the last stored element in the buffer.
            if (i >= this.boundary) this.boundary++;
            return i;
         }
      }
   }

   CopyBufferElements(oldData) {

      const size = oldData.length;
      for (let i = 0; i < size; i++) {
         this.buffer[i] = oldData[i];
      }
   }

   /** Debug */
   Print(){
      console.log('Count: ', this.boundary)
      console.log(this.buffer)
   }

   PrintMeshInfo(){
      console.log('Count: ', this.boundary)
      for (let i=0; i<this.boundary; i++){
         if(this.buffer[i].mesh){

            console.log(this.buffer[i].mesh.name)
         }
      }
   }
}
export class M_Buffer extends Buffer_Interface{

   constructor(m_buffer) {

      super(m_buffer);
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

      if (oldData) this.CopyBufferElements(oldData)
      console.warn('Resizing M_Buffer!', this.size)
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

   Realloc() {

      if (this.size <= 0) {
         this.size = 1;
      }
      else this.size *= 2;

      const oldData = this.buffer;
      this.buffer = new Int8Array(this.size);

      if (oldData) this.CopyBufferElements(oldData)
      console.warn('Resizing Int8Buffer!')
   }

}

// Does not 'null' the elements on 'Remove()', instead it sets them to INT_NULL
export class Int8Buffer2 extends Buffer_Interface {

   constructor() {

      super();
   }

   Init(size, val) {

      if(size < 1) alert('Invalid size for Int8Buffer2 buffer.')
      this.size = size;
      if(!this.buffer) this.buffer = new Int8Array(this.size)
      for (let i = 0; i < this.size; i++)
         this.buffer[i] = val;
   }

   AddAtIndex(idx, elem) {
      if(idx <0 || idx > this.size) console.error('WRONG Index. Adding item at: ', idx, ' with size:', this.size)
   
   this.buffer[idx] = elem;
   this.active_count++;

   this.boundary++;
   if(this.boundary > this.size) // Case for Mesh.listeners buffer. Inserting first and then deleting from the listener. See popup - Widget_popup_handler_onclick_event(),
      //  where we first initialize the options menu with the new listeners added and then we deactivate the popup and delete all listeners, so the boundary goes to total types of listeners +1
      this.boundary = this.size;

   if(this.boundary < idx) this.boundary = idx+1; // Same here
      return idx;
   }

   RemoveByIdx(idx) {

      this.buffer[idx] = INT_NULL;
      this.active_count--;

      if (this.boundary === 1) {
         this.boundary = 0;
         return;
      }

      // else if (this.boundary === this.size) {
      //    this.boundary--;
      //    return;
      // }

      else {
         const boundary = this.boundary;
         for (let i = boundary; i > 0; i--) {

            if (this.buffer[this.boundary-1] !== INT_NULL|| this.boundary === 0) break;
            this.boundary--;
         }
      }

      if(this.boundary === INT_NULL) 
         alert('M_Buffer boundary = -1')
      ERROR_NULL(this.active_count);
   }

   Realloc() {

      if (this.size <= 0) {
         this.size = 1;
      }
      else this.size *= 2;

      const oldData = this.buffer;
      this.buffer = new Int8Array(this.size);

      if (oldData) this.CopyBufferElements(oldData)
      console.warn('Resizing Int8Buffer!')
   }

}

export class Int8_2DBuffer {

   buffer;
   boundary; // CAUTION! Do not rely on the boundary variable.Its use is only for counting how many alements are in use(1 boundary for both rows and columns).
   size;
   numcols;

   constructor(numrows=0, numcols=0) {

      this.size = numcols * numrows;    
      this.numcols = numcols;    
      if(ERROR_NULL(this.size)) alert('Must initialize Int8_2dBuffer with a size > 1');

      this.buffer = new Int8Array(this.size);
      this.boundary = 0;

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
         this.boundary++;
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
         this.boundary--;
      }
   }

   RemoveAll(){

      for (let i = 0; i <= this.size; i++)
         this.buffer[i] = INT_NULL
      this.boundary = 0;
   }
   // RemoveByIdx(idx) {

   //    if (this.buffer[idx] !== null) {

   //       /**
   //        * In this implementation of buffer, we run 
   //        * the loops until boundary and not until size. 
   //        * For this to work, we can only decrement boundary
   //        * if all next elements are not used.
   //        * All we are doing is 
   //        * to have the boundary at the last used element of the buffer.
   //        */

   //       this.buffer[idx] = null;

   //       if (this.boundary === 1) {
   //          this.boundary = 0;
   //          return;
   //       }

   //       else if (this.boundary === this.size) {
   //          this.boundary--;
   //          return;
   //       }

   //       else {
   //          const boundary = this.boundary + 1;
   //          for (let i = boundary; i > 0; i--) {

   //             if (this.buffer[this.boundary - 1] || this.boundary === 0) break;
   //             this.boundary--;
   //          }
   //       }
   //       if(this.boundary === INT_NULL) 
   //          alert('M_Buffer boundary = -1')
   //    }
   // }
   /** Debug */
   Print(){
      console.log('Count: ', this.boundary)
      console.log(this.buffer)
   }

   PrintMeshInfo(){
      console.log('Count: ', this.boundary)
      for (let i=0; i<this.boundary; i++){
         if(this.buffer[i].mesh){

            console.log(this.buffer[i].mesh.name)
         }
      }
   }

}

