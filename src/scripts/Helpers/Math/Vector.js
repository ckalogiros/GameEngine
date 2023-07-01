"use strict";



export function Vec2Dist(srcpos, dstpos) {
   return [
      dstpos[0] - srcpos[0],
      dstpos[1] - srcpos[1]
   ];
}