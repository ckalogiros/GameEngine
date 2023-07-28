"use strict";

import { PrintAttributes, PrintIndexBufferAll, PrintVertexBufferAll, PrintVertexBufferAllPretty } from "../../../Graphics/Z_Debug/GfxDebug.js";
import { FpsGet } from "../../Timer/Time.js";


export function OnKeyDown(e){

   e.stopPropagation();
   // e.preventDefault();

   // console.log(e.key)

   switch(e.key){
      case ('p' || 'P'):{
         console.log(e.key);
         if(g_state.game.paused) g_state.game.paused = false
         else g_state.game.paused = true
         break;
      }
      case ('x' || 'X'):{
         console.log(e.key);
         PrintVertexBufferAll();
         break;
      }
      case ('c' || 'C'):{
         console.log(e.key);
         PrintIndexBufferAll();
         break;
      }
      case ('z' || 'Z'):{
         console.log(e.key);
         PrintAttributes();
         break;
      }
      case ('f' || 'F'):{
         const fps = FpsGet();
         console.log(`Avg:${fps.GetAvg()}, Avg 1s: ${fps.GetAvg_1S()}`)
         break;
      }
   }
}
export function OnKeyUp(e){

   e.stopPropagation();
   // e.preventDefault();

}