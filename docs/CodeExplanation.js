/**
 * Uniforms
 * 
 * UniformsBuffer
 * It is dificult to know the size of the Float32Array uniforms buffer
 * for the initialization, cause meshes could and should add uniforms
 * to the uniformsBuffer when ever is needed. So we need to have a big
 * enough uniformsBuffer Float32Array.
 * On the contrary, in the glsl shader code, 
 */

/**
 * Creating 'style' border-feather and round corners.
 * 
 * The @params1 attribute is used to pass the 'style'.
 * 1. Set the Material's class function @mat.SetStyle(60, 30, 20) 
 *    with the border-width, feather and round-corners as parameters.
 * 2. At @Matterial class set the curents material @sid.attr with the SID.ATTR.Border, ... for the rest styles, 
 *    + the SID.ATTR.PARAMS1 to enable the construction of the @a_params1 attribute in the vertex shader.
 * 3. The @CreateShader() will contruct the rest of the vertex shader code, with the check in the sid.attr.'styles'.
 *    1 'in' float, 1 'out' float and 1 assigment statement for each of the styles are added to the vertex shader.
 * 4. At the frament shader the apropriate 'in' floats are constructed and then used for the final result  
 */

/**
 * Automatic Shaders Creation.
 * 
 * Enabling uniforms and attributes in shaders.
 *    Different 'enables' of uniforms for different meshes,
 *    creates different glPrograms.
 *    Uniforms have to be set, attributes already exist in the shaders.
 *    That saying, enable a uniform can only happen from the first mesh, 
 *    cause the shader will be created with its uniforms state at the creation time.
 *    Attributes on the other hand, may be enabled from any mesh belonging to the 
 *    shader program,   
 */

/** TODO:NOT VALID, RE-WRITE
 * Position-Size Controler and grid sections
 * 
 * A section should be responsible for:
 *    position: all its children
 *    size: resize all its children, if they are sections
 *          resize its self, tha means repositioning its children
 */

/**
   ### Event Listener

   [CreateListenEvent(TYPE_IDX, Clbk, source_params, target_params)]
   Listener takes a callback, [source_params] and [target_params].
   Internaly creates and stores an object 'event_params':
      const event_params = {
         type: TYPE_IDX, 
         Clbk: Clbk,
         source_params: source_params,
         target_params: target_params,
      }


   [DispatchEvents(TYPE_IDX, trigger_params)]
   Upon Dispatch, the callback[Clbk] is called, passing an object 'dispatch_params':
      const dispatch_params = {
         source_params:    this.event_type[TYPE_IDX].buffer[i].source_params,
         target_params:    this.event_type[TYPE_IDX].buffer[i].target_params,
         trigger_params:   trigger_params,
         event_type:       TYPE_IDX,
      }
   So any [Clbk] function must accept as params an object of type: 
   [dispatch_params]
      source_params: 
      target_params: 
      trigger_params:
      event_type:    

 */

/**
 * Widget Drop down menu.
 * 
 * Widget is comprised of a section with a button widget as the trigger (expansion/contraction).
 * The expanded mesh is called 'menu' (type of section). The 'menu exists as a class variable,
 * so that it can be activated and deactivated from the drop down mesh (as child) but also
 * from the graphics buffers.
 * 
 * GFX:
 * The drop down is split into 2 conceptual categories.
 * 1. the drop down section mesh with the trigger button,
 * 2. the menu section mesh.
 * In that sense the menu gfx must be separate from the drop down gfx, for the reason of 
 * show/hide the menu upon drop down trigger.
 * The children meshes of the menu
 * 
 * OnClick():
 * Upon trigger 'On', the class variable 'menu' is coppied as a reference to the drop down children.
 * Then we call for gfx generation, to find private gfx buffers for the menu section mesh 
 * and its children (text, buttons and other drop downs).   
 */