"use strict";

import { Widget_Button_Mesh } from "../scripts/Engine/Drawables/Meshes/Widgets/WidgetButton.js";
import { Listener_hover_enable } from "../scripts/Engine/Events/EventListeners.js";

export function Test_Old_vs_new_hover_listener(scene){

   DEBUG.OLD_HOVER_LISTENER_IS_ENABLED = true;

   Create_buttons(scene, 19);

}

function Create_buttons(scene, num){

   let posy = 100;
   for (let i=0; i<num; i++){
      
      const btn = new Widget_Button_Mesh('button'+i, [20, posy, 1], 6, BLUE_10_160_220, WHITE, [1,1], [6, 5]);
      btn.StateEnable(MESH_STATE.HAS_HOVER_COLOR)
      scene.AddMesh(btn)
      // btn.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER);
      Listener_hover_enable(btn);
      posy += btn.geom.dim[1]*2;
   }
}