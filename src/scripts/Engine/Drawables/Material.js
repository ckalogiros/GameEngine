"use strict";

class Material {

   col = [0, 0, 0, 0];
   tex = [0, 0, 0, 0];

   constructor(col, tex) {

      math.CopyArr4(this.col, col);
      if (tex) { math.CopyArr4(this.tex, tex); }
   }
}