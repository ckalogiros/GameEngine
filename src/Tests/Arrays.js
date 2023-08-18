"use strict";

import { Geometry2D } from "../scripts/Engine/Drawables/Geometry/Base/Geometry.js";
import { Mesh } from "../scripts/Engine/Drawables/Meshes/Base/Mesh.js";
import { FontGetCharWidth, FontGetFontDimRatio } from "../scripts/Engine/Loaders/Font/Font.js";
import { PerformanceTimerCreate } from "../scripts/Engine/Timers/PerformanceTimers.js";


const MAX_COUNT = 1000000;
const arr1 = [];
const arr2 = [];
let some = 10;


export function TestArraysPerformance(){

   const pt = PerformanceTimerCreate('Arrays Test');
   const min = 32, max = 128;
   const range = max - min;


   /** Array */
   {   
   // let k = 0;
   // for(let i=0; i<MAX_COUNT; i++){
   //    k += GetSomeRand(k);
   //    pt.Start();
   //    arr1[i] = GetSomeRand()+k;
   //    pt.Stop();
   // }
   // pt.Print();
   
   // pt.Reset();

   // for(let i=0; i<MAX_COUNT; i++){
   //    k += GetSomeRand(k);
   //    pt.Start();
   //    arr2[`${i}`] = GetSomeRand()+k;
   //    pt.Stop();
   // }
   // pt.Print();
   }

   /** Array push */
   {
      let k = 0;
      const m = new Geometry2D([100, 20, 2], [100, 120], [1,1]);
      for(let i=0; i<MAX_COUNT; i++){
         const ch = Math.floor(Math.random() * range + min);
         // console.log(ch+'')
         const c = FontGetCharWidth(0, ch+'');
         m.pos[0] = c
         pt.Start();
         arr1[i] = m;
         pt.Stop();
      }
      pt.Print();
      
      pt.Reset();

      for(let i=0; i<MAX_COUNT; i++){
         const ch = Math.floor(Math.random() * range + min);
         const c = FontGetCharWidth(0, ch+'');
         m.pos[0] = c
         pt.Start();
         arr2.push(m);
         pt.Stop();
      }
      pt.Print();
   }
}

function GetSomeRand(i){
   return i + Get() * Math.random();
}

function Get(val){
   return some + val;
}

function ArrayPush()
{

}