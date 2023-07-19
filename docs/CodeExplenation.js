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
 *    creates differnt glPrograms. On the other hand
 *    Uniforms have to be set, attributes already exist in the shaders.
 *    That saying, enable a uniform can only happen from the first mesh, 
 *    cause the shader will be created with the state at the creation time.
 *    Attributes on the other hand, may be enabled from any mesh belonging to the 
 *    shader program,   
 */