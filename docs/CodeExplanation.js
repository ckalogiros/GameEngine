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

/** // TODO:NOT VALID, RE-WRITE
 * Position-Size Controler and grid sections
 * 
 * A section should be responsible for:
 *    position: all its children
 *    size: resize all its children, if they are sections
 *          resize its self, tha means repositioning its children
 */

/** ### Event Listener

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

/****************************************************************************** */
// Scenes

/** ### Scene gfx buffer
 * Stores all meshes gfx in that order:
 *    1. buffer of programs groups
 *    2. buffer of programs
 *    3. buffer of vertex buffers
 *    4 buffer of meshes in vertex buffer
 * 
 * Used for: Have a refference to all meshes of each buffer of each shader program.
 *    1. Batch update all 'start' of all meshes in a specific vertex buffer. 
 */


/****************************************************************************** */
// Widgets And Meshes

/** ### Widget Drop down menu.

   Widget is comprised of a section with a button widget as the trigger 
   (expansion/contraction). The expanded mesh is called 'menu' 
   (with type of Section).

   Any Mesh-Widget can be added to a dropdown's menu.
   
   When a dropdown is insertet to the menu of another dropdown,
   it retains its state (expanded/contructed).
   Example: If a dp2 was deactivated because a higher dp1 contracted, then 
   upon higher dp1 expansion the current dp2 must retain its state. If its 
   state was 'expanded' then it must expand its menu and also have the
   expansion symbol. 

   ## Dropdown Menu
   The 'menu' variable is used to store the state of the dropdowns menu items.
   Based on the 'menu' variable, we expand-activate the menu of a dropdown by
   adding the 'menu' to the dropdown's children buffer.
   For contracting-deactivating a dropdown's menu, we remove the menu from the 
   children.buffer[menu] and from the gfx buffers, BUT the 'menu' var from the
   class retains all state.

   GFX:
   The drop down is split into 2 conceptual categories.
   1. the drop down section mesh with the trigger button,
   2. the menu section mesh.
   In that sense the menu gfx must be separate from the drop down gfx, for the 
   reason of  show/hide the menu upon drop down trigger.


   ## OnClick()
      Upon trigger 'On', the class variable 'menu' is coppied as a reference to
      the dropdown's children buffer. Then we call gfx generation, find private 
      gfx buffers for the menu section mesh and all its children (any Mesh type).  
      The menu's items may be on the same gfx buffers, as long their sid match,
      because the activation/deactivation hapens on the menu level. 

   ## ActivateMenu()
      TODO: Implement


 */

/** ### Fake Events // TODO:IMPLEMENT DISCRIPTION
 * 
 */

/** ### OnMove Events Implementation Logic
 * 
 * The OnMove() method is called from the 'TimeIntervals' class as a callback function,
 * not directly from the EventListeners buffer. That is because of:
 * 1. The move event must update on every frame, so a time interval is needed.
 * 2. We need a function to initialize the time interval and what better place to do
 *    if not in the object's OnClick() method, since it is only logical because the object was clicked(in order to be moved).
 *
 * The OnClick() method of the class is responsible for creating a interval timer
 * and pass the this.OnMove() as a callback.
 *  
 * Logic: Uppon object click for moving:
 * 1. The OnClick() is called, which is only natural, since the object was clicked (in order to be moved).
 * 2. The OnClick() checks/decides if the object is movable and creates a time interval event, 
 *    with the OnMove() method passed as a callback. 
 *    The Update for the OnMove() will run independetly from the Event System, updating on a time interval.
 * 3. The OnMove() checks if the user let go of the grabbed object, and if so
 *    destroys the OnMove time interval and the moving operation for the object stops.
 * 
 * 
 */