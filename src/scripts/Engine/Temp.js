import { CalculateSdfOuterFromDim } from "../Helpers/Helpers.js";
import { Geometry2D } from "./Drawables/Geometry/Base/Geometry.js";
import { Geometry2D_Text } from "./Drawables/Geometry/Geometry2DText.js";
import { FontMaterial, Material } from "./Drawables/Material/Base/Material.js";
import { MESH_ENABLE, Mesh, Text_Mesh } from "./Drawables/Meshes/Base/Mesh.js";
import { Gfx_generate_context } from "./Interface/GfxContext.js"; 


export class T_Rect extends Mesh{
   
   constructor(pos = POSITION_CENTER, dim = [10, 10], col = RED){

      const geom = new Geometry2D(pos, dim);
      const mat = new Material(col);
      
      super(geom, mat);

      // this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      // this.SetStyle([4, 5, 2])
      super.SetName('T_Rect')
   }

   GenGfxCtx(FLAGS, gfxidx){
      
      // this function must be at an interface class to the Graphics System(Gfx class).  
      super.GenGfxCtx(FLAGS, gfxidx);
      console.log(this.name, this.gfx.prog.idx, this.gfx.vb.idx, this.gfx.vb.start)

      for(let i=0; i<this.children.count; i++){

         const child = this.children.buffer[i];
         if(child)
            child.GenGfxCtx(FLAGS, gfxidx); // Propagate the same functionality we apply here down the tree of meshes
      }

   }
   
   AddToGfx(){

      super.AddToGfx();

      for(let i=0; i<this.children.count; i++){

         const child = this.children.buffer[i];
         if(child)
            child.AddToGfx(); // Propagate the same functionality we apply here down the tree of meshes
      }
   }
}

export class T_Text extends Text_Mesh{
   
	pad = [0, 0];

	constructor(text, pos, fontSize = 4, scale = [1, 1], color = WHITE, bold = 4, font = TEXTURES.SDF_CONSOLAS_LARGE) {

		const sdfouter = CalculateSdfOuterFromDim(fontSize);
		if (sdfouter + bold > 1) bold = 1 - sdfouter;
		const geom = new Geometry2D_Text(pos, fontSize, scale, text, font);
		const mat = new FontMaterial(color, font, text, [bold, sdfouter])

		super(geom, mat);
      super.SetName('T_Text')
   }

   GenGfxCtx(FLAGS, gfxidx){
      
      // this function must be at an interface class to the Graphics System(Gfx class).  
      super.GenGfxCtx(FLAGS, gfxidx);
      console.log(this.name, this.gfx.prog.idx, this.gfx.vb.idx, this.gfx.vb.start)

      for(let i=0; i<this.children.count; i++){

         const child = this.children.buffer[i];
         if(child)
            child.GenGfxCtx(FLAGS, gfxidx); // Propagate the same functionality we apply here down the tree of meshes
      }

   }
   
   AddToGfx(){

      super.AddToGfx();

      for(let i=0; i<this.children.count; i++){

         const child = this.children.buffer[i];
         if(child)
            child.AddToGfx(); // Propagate the same functionality we apply here down the tree of meshes
      }
   }
}

export class T_Label extends T_Rect{

   pad;

   constructor(text, pos){

      const text_mesh = new T_Text(text, pos);
      const width = text_mesh.CalcTextWidth()

      const dim = [width/2, text_mesh.geom.dim[1]]
      super(pos, dim);

      super.SetName('T_Label')
      super.AddChild(text_mesh)

      this.pad = [0,0 ]

   }

   /**
    * This should be called from the scene.AddMesh() 
    * @param {*} FLAGS GL_VB.ANY . NEW . SPECIFIC . PRIVATE
    * @param {*} gfxIdx [uint, uint], for progidx and vbidx respectively
    */
   GenGfxCtx(FLAGS, gfxidx){
      
      // this function must be at an interface class to the Graphics System(Gfx class).  
      super.GenGfxCtx(FLAGS, gfxidx);
   }

   /** This should be called from the mesh.Render() */
   AddToGfx(){

      super.AddToGfx();
   }
}


// Case we construct a widget on our own
/**
   mesh = new Mesh();
   
   text1 = new Text()
   text2 = new Text()
   text3 = new Text()
 
   mesh.AddChild(text1);
         At Mesh class:
         AddAddChild(mesh){

            mesh.GenGfxCtx(flags);
            this.children.Add(mesh)
         }

         In Render() we just call the childrens Render().
 */

// Case create slider
export class T_Slider extends T_Rect{

   constructor(pos, dim, col){
      
      super(pos, dim, col);
      const fontSize = dim[0]
      const name_text = new T_Text('Slider', pos, fontSize);

      const value_text = new T_Text('0000', pos, fontSize);
      
      
      // Calculate the bar's and handle's horizontal pading.
      const ratio = dim[0] / dim[1];
      const pad = [dim[0] * 0.5, dim[1] / 2.8];
      pad[0] /= ratio;
      
      // Calculate bar's dimentions and position.
      const barpos = [this.geom.pos[0], this.geom.pos[1], this.geom.pos[2]]
      const barMetrics = this.#CalculateBarArea(barpos, this.geom.dim, pad)
      
      const bar = new T_Rect(barMetrics.pos, barMetrics.dim, col);
      // Create slider_bar mesh 
      // const bargeom = new Geometry2D(barMetrics.pos, barMetrics.dim);
      // const barmat = new Material(YELLOW_240_240_10)
      // const bar = new Mesh(bargeom, barmat);

      bar.SetName('Bar');
      bar.type |= MESH_TYPES_DBG.WIDGET_SLIDER_BAR | bar.geom.type | bar.mat.type;
      // bar.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      // bar.SetStyle([0, 3, 2]);
      // bar.StateEnable(MESH_STATE.IS_GRABABLE | MESH_STATE.IS_HOVER_COLORABLE | MESH_STATE.HAS_POPUP);
      // bar.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, this.OnClick)
      // bar.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)


      pad[1] = dim[1] / 10;
      const handleMetrics = this.#CalculateHandleArea(bar.geom.pos, this.geom.dim, pad)

      const handle = new T_Rect(pos, dim, col);
      // Create hndle_bar mesh 
      // const handlegeom = new Geometry2D(handleMetrics.pos, handleMetrics.dim);
      // const handlemat = new Material(YELLOW_240_220_10)
      // const handle = new Mesh(handlegeom, handlemat);

      // handle.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
      // handle.SetStyle([5, 35, 3]);
      // handle.StateEnable(MESH_STATE.IS_MOVABLE);
      handle.SetName('Handle');
      handle.type |= MESH_TYPES_DBG.WIDGET_SLIDER_HANDLE | handle.geom.type | handle.mat.type;




      this.AddChild(bar)
      this.AddChild(name_text)
      bar.AddChild(handle)
      bar.AddChild(value_text)

      // So now if we call ...
      // this.GenGfxCtx(FLAGS, gfxIdx);
      // The bar's GenGfxCtx(FLAGS, gfxIdx) will run, which is in T_Rect class
   }

   GenGfxCtx(FLAGS, gfxIdx){

      super.GenGfxCtx(FLAGS, gfxIdx);
   }

   AddToGfx(){

      super.AddToGfx()
   }

   /** Private Methods */
   #CalculateBarArea(_pos, _dim, pad) {

      const dim = [_dim[0] - (pad[0] * 2), _dim[1] - (pad[1] * 2)];
      // const pos = [_pos[0] + pad[0], _pos[1] + pad[1]];
      const pos = [_pos[0], _pos[1], _pos[2] + 1]; // Does not need to change for center positioning.

      return {
         pos: pos,
         dim, dim,
      };
   }
   #CalculateHandleArea(_pos, _dim, pad) {

      const dim = [0, _dim[1] - (pad[1] * 2)];
      dim[0] = dim[1];
      const pos = [_pos[0], _pos[1], _pos[2] + 1]; // Does not need to change for center positioning.

      return {
         pos: pos,
         dim, dim,
      };
   }
}



// let BAR_IDX = INT_NULL;

// export class T_Slider extends Mesh {

//    constructor(pos, dim, color, hover_margin = [0,0]) {

//       const geom = new Geometry2D(pos, dim);
//       const mat = new Material(color)

//       super(geom, mat);

//       this.type |= MESH_TYPES_DBG.WIDGET_SLIDER | geom.type | mat.type;
//       this.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
//       this.SetStyle([1, 8, 3]);
//       this.SetName('Widget_Slider');


//       /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//        * Slider Bar: Bar is child of the slider mesh
//        */
//       // Calculate the bar's and handle's horizontal pading.
//       const ratio = dim[0] / dim[1];
//       const pad = [dim[0] * 0.5, dim[1] / 2.8];
//       pad[0] /= ratio;

//       // Calculate bar's dimentions and position.
//       const barpos = [this.geom.pos[0], this.geom.pos[1], this.geom.pos[2]]
//       const barMetrics = this.#CalculateBarArea(barpos, this.geom.dim, pad)

//       // Create slider_bar mesh 
//       const bargeom = new Geometry2D(barMetrics.pos, barMetrics.dim);
//       const barmat = new Material(YELLOW_240_240_10)
//       const bar = new Mesh(bargeom, barmat);

//       bar.type |= MESH_TYPES_DBG.WIDGET_SLIDER_BAR | bargeom | barmat;
//       bar.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
//       bar.SetStyle([0, 3, 2]);
//       bar.StateEnable(MESH_STATE.IS_GRABABLE | MESH_STATE.IS_HOVER_COLORABLE | MESH_STATE.HAS_POPUP);
//       bar.CreateListenEvent(LISTEN_EVENT_TYPES.CLICK_DOWN, this.OnClick)
//       bar.CreateListenEvent(LISTEN_EVENT_TYPES.HOVER)

//       bar.SetName();
//       BAR_IDX = this.AddChild(bar);


//       /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//        * Slider Handle: Handle is a child of the bar mesh
//        */
//       pad[1] = dim[1] / 10;
//       const handleMetrics = this.#CalculateHandleArea(bargeom.pos, this.geom.dim, pad)

//       // Create hndle_bar mesh 
//       const handlegeom = new Geometry2D(handleMetrics.pos, handleMetrics.dim);
//       const handlemat = new Material(YELLOW_240_220_10)
//       const handle = new Mesh(handlegeom, handlemat);

//       handle.EnableGfxAttributes(MESH_ENABLE.GFX.ATTR_STYLE);
//       handle.SetStyle([5, 35, 3]);
//       handle.StateEnable(MESH_STATE.IS_MOVABLE);
//       handle.SetName();
//       handle.type |= MESH_TYPES_DBG.WIDGET_SLIDER_HANDLE | handlegeom | handlemat;

//       bar.AddChild(handle); // The handle is added as a child to the bar mesh.

//       /**
//        * Text Meshes
//        * Create slider_name_text and slider_value_text.
//        * Text's are children of the slider mesh
//        */
//       const min_font_size = 4.5, max_font_size = 10;
//       const fontSize = max_font_size < (dim[1] / 3) ? max_font_size : (min_font_size > (dim[1] / 3) ? min_font_size : (dim[1] / 3));
//       pos[0] -= this.geom.dim[0];
//       pos[1] -= this.geom.dim[1] + fontSize + 4;


//       /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
//        * Text 
//        */
//       // Create slider_name_text
//       const slider_name_text = new Widget_Text('Slider', pos, fontSize, [1, 1], GREEN_140_240_10, .4);
//       slider_name_text.SetName()
//       this.AddChild(slider_name_text);

//       pos[0] += this.geom.dim[0] * 2;
//       // Create slider_value_text
//       const slider_value_text = new Widget_Text('0000', pos, fontSize, [1, 1], YELLOW_240_220_10, .4);
//       slider_value_text.SetName();
//       slider_value_text.geom.pos[0] -= slider_value_text.CalcTextWidth();
      
//       // Let bar handle the value text, because the mesh bar has the hover listener.
//       bar.AddChild(slider_value_text);


//       // Make the vertical area of the bar larger for hover and handle moving.
//       if(hover_margin)
//          bar.hover_margin = handle.geom.dim[1] - bar.geom.dim[1];
//       else
//          bar.hover_margin = handle.geom.dim[1] - bar.geom.dim[1];

//    }

//    GenGfxCtx() {

//       /**
//        * TODO: Implement an automatic adding to the graphics pipeline.
//        */
//       const gfx = super.GenGfxCtx();

//       const bar = this.children.buffer[BAR_IDX];
//       const handle = bar.children.buffer[0];
//       bar.GenGfxCtx();
//       handle.GenGfxCtx();

//       const slider_name_text = this.children.buffer[1];
//       slider_name_text.GenGfxCtx();

//       const slider_value_text = bar.children.buffer[1];
//       slider_value_text.GenGfxCtx();

//       return gfx;

//    }

//    AddToGfx(){

//       super.AddToGfx();

//       const bar = this.children.buffer[BAR_IDX];
//       const handle = bar.children.buffer[0];
//       bar.AddToGfx();
//       handle.AddToGfx();

//       const slider_name_text = this.children.buffer[1];
//       slider_name_text.AddToGfx();

//       // const slider_value_text = this.children.buffer[2];
//       const slider_value_text = bar.children.buffer[1];
//       slider_value_text.AddToGfx();
//    }

//    SetMenuOptionsClbk(ClbkFunction) {

//       const bar = this.children.buffer[BAR_IDX];
//       bar.menu_options.Clbk = ClbkFunction;
//    }

//    /** Private Methods */
//    #CalculateBarArea(_pos, _dim, pad) {

//       const dim = [_dim[0] - (pad[0] * 2), _dim[1] - (pad[1] * 2)];
//       // const pos = [_pos[0] + pad[0], _pos[1] + pad[1]];
//       const pos = [_pos[0], _pos[1], _pos[2] + 1]; // Does not need to change for center positioning.

//       return {
//          pos: pos,
//          dim, dim,
//       };
//    }
//    #CalculateHandleArea(_pos, _dim, pad) {

//       const dim = [0, _dim[1] - (pad[1] * 2)];
//       dim[0] = dim[1];
//       const pos = [_pos[0], _pos[1], _pos[2] + 1]; // Does not need to change for center positioning.

//       return {
//          pos: pos,
//          dim, dim,
//       };
//    }


//    OnHover(params) {
//       console.log('Slider Hover!!!')
//    }

//    OnClick(params) {

//       const mesh = params.source_params;
//       const point = MouseGetPos();
//       const m = mesh.geom;

//       if (Check_intersection_point_rect(m.pos, m.dim, point, [0, 8])) {

//          STATE.mesh.SetClicked(params.source_params);

//          if (mesh.timeIntervalsIdxBuffer.count <= 0) {

//             /**
//              * Create move event.
//              * The move event runs only when the mesh is GRABED.
//              * That means that the timeInterval is created and destroyed upon 
//              * onClickDown and onClickUp respectively.
//              */
//             const idx = TimeIntervalsCreate(10, 'Move Mesh', TIME_INTERVAL_REPEAT_ALWAYS, Slider_on_update_handle, mesh);
//             mesh.timeIntervalsIdxBuffer.Add(idx);

//             if (mesh.StateCheck(MESH_STATE.IS_GRABABLE)) {

//                STATE.mesh.SetGrabed(mesh);
//                mesh.StateEnable(MESH_STATE.IN_GRAB);
//             }

//             // Handle any menu (on leftClick only)
//             if (mesh.StateCheck(MESH_STATE.HAS_POPUP)) {

//                const btnId = params.trigger_params;
//                Widget_popup_handler_onclick_event(mesh, btnId)
//             }
//          }
//          return true;
//       }
//       return false;
//    }

// }