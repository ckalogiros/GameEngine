"use strict";

import { M_Buffer } from './Buffers.js';


class Binary_Tree_Array_Impl extends M_Buffer {



   constructor() {
      super();
   }

   Initialize(val) {

      for (let i = 0; i < this.size; i++) {

         this.buffer[i] = {
            left: INT_NULL,   // Index to this buffer
            Right: INT_NULL,  // Index to this buffer
            isNull: true,
            data: {},
         };
      }
   }

   Left (curNodeIdx) { return (2 * curNodeIdx) + 1; }
   Right(curNodeIdx) { return (2 * curNodeIdx) + 2; }

   FindEmpty() {

      let root = 0;
      let node = this.buffer[0];

      while(!node.isNull){
         
      }
      // for (let i = 0; i < this.size; i++) {

      //    if (this.buffer[i].isNull)
      //       return i;

      //    return INT_NULL;
      // }
   }

   Insert(data) {

      const freeIdx = this.FindEmpty();

      if (freeIdx === INT_NULL) alert('Binary Tree out of space')

   }

}

const _binaryTreeArr = new Binary_Tree_Array_Impl();
_binaryTreeArr.Init(64);