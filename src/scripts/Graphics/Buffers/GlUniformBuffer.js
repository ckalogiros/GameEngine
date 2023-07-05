"use strict";
const TYPES = {
   FLOAT  : 0x1406, // FLOAT
   FVEC2  : 0x8b50, // _VEC2
   FVEC3  : 0x8b51, // _VEC3
   FVEC4  : 0x8b52, // _VEC4
   MAT2   : 0x8b5a, // _MAT2
   MAT3   : 0x8b5b, // _MAT3
   MAT4   : 0x8b5c, // _MAT4
   //     : 0x1404,  
   INT    : 0x8b56, // INT, 
   BOOL   : 0x8b53, // BOOL 
   IVEC2  : 0x8b57, // _VEC2
   //     : 0x8b54,  
   IVEC3  : 0x8b58, // _VEC3
   //     : 0x8b55,  
   UIVEC4  : 0x8b59, // _VEC4

   UINT   : 0x1405, // UINT
   UIVEC2 : 0x8dc6, // _VEC2
   UIVEC3 : 0x8dc7, // _VEC3
   UIVEC4 : 0x8dc8, // _VEC4
};

export class Uniform {
   val;
   loc;
   gl_uniform_func;
   constructor(val = null, loc = null, type = null){
      this.val = val;// Uniform value
      this.loc = loc; // Uniform Location
      this.gl_uniform_func = null; //gl uniform type function
      this.needsUpdate = false;

      // 
      switch(type){
         // From THREE.js
         case 0x1406: this.gl_uniform_func = this.setValueV1f; // FLOAT
         case 0x8b50: this.gl_uniform_func = this.setValueV2f; // _VEC2
         case 0x8b51: this.gl_uniform_func = this.setValueV3f; // _VEC3
         case 0x8b52: this.gl_uniform_func = this.setValueV4f; // _VEC4
   
         case 0x8b5a: this.gl_uniform_func = this.setValueM2; // _MAT2
         case 0x8b5b: this.gl_uniform_func = this.setValueM3; // _MAT3
         case 0x8b5c: this.gl_uniform_func = this.setValueM4; // _MAT4
   
         case 0x1404: case 0x8b56:  this.gl_uniform_func = this.setValueV1i; // INT, BOOL
         case 0x8b53: case 0x8b57:  this.gl_uniform_func = this.setValueV2i; // _VEC2
         case 0x8b54: case 0x8b58:  this.gl_uniform_func = this.setValueV3i; // _VEC3
         case 0x8b55: case 0x8b59:  this.gl_uniform_func = this.setValueV4i; // _VEC4
   
         case 0x1405: this.gl_uniform_func = this.setValueV1ui; // UINT
         case 0x8dc6: this.gl_uniform_func = this.setValueV2ui; // _VEC2
         case 0x8dc7: this.gl_uniform_func = this.setValueV3ui; // _VEC3
         case 0x8dc8: this.gl_uniform_func = this.setValueV4ui; // _VEC4
      
         default: {
            console.error('The type of the uniform\'s value is unknown');
            break; 
         }
         
      }
   }

   Set(value) {
		this.val = value;
		this.uniformsNeedUpdate = true;
	}
	Update(gl) {
      this.gl_uniform_func(gl);
		this.uniformsNeedUpdate = false;
	}

   // Array of scalars
   setValueV1fArray( gl, v ) {
      gl.uniform1fv( this.loc, v );
   }
   // Array of vectors (from flat array or array of THREE.VectorN)
   setValueV2fArray( gl, v ) {
      const data = flatten( v, this.size, 2 );
      gl.uniform2fv( this.loc, data );
   }
   setValueV3fArray( gl, v ) {
      const data = flatten( v, this.size, 3 );
      gl.uniform3fv( this.loc, data );
   }
   setValueV4fArray( gl, v ) {
      const data = flatten( v, this.size, 4 );
      gl.uniform4fv( this.loc, data );
   }
   // Array of matrices (from flat array or array of THREE.MatrixN)
   setValueM2Array( gl, v ) {
      const data = flatten( v, this.size, 4 );
      gl.uniformMatrix2fv( this.loc, false, data );
   }
   setValueM3Array( gl, v ) {
      const data = flatten( v, this.size, 9 );
      gl.uniformMatrix3fv( this.loc, false, data );
   }
   setValueM4Array( gl, v ) {
      const data = flatten( v, this.size, 16 );
      gl.uniformMatrix4fv( this.loc, false, data );
   }
   // Array of integer / boolean
   setValueV1iArray( gl, v ) {
      gl.uniform1iv( this.loc, v );
   }
   // Array of integer / boolean vectors (from flat array)
   setValueV2iArray( gl, v ) {
      gl.uniform2iv( this.loc, v );
   }
   setValueV3iArray( gl, v ) {
      gl.uniform3iv( this.loc, v );
   }
   setValueV4iArray( gl, v ) {
      gl.uniform4iv( this.loc, v );
   }
   // Array of unsigned integer
   setValueV1uiArray( gl, v ) {
      gl.uniform1uiv( this.loc, v );
   }
   // Array of unsigned integer vectors (from flat array)
   setValueV2uiArray( gl, v ) {
      gl.uniform2uiv( this.loc, v );
   }
   setValueV3uiArray( gl, v ) {
      gl.uniform3uiv( this.loc, v );
   }
   setValueV4uiArray( gl, v ) {
      gl.uniform4uiv( this.loc, v );
   }
}

export class UniformsBuffer {
   buffer;
   loc;
   needsUpdate;

   constructor(gl, prog, size){
      this.loc = gl.getUniformLocation(prog, 'uniforms_buffer');
      if(!this.loc) {
         console.error('Could not locate uniform: \'uniforms_buffer\'');
         this.buffer = null;
      } 
      else {
         this.buffer = new Float32Array(size);
         console.log('Uniform: \'uniforms_buffer\' located successfully!')
      } 
      this.needsUpdate = false;
   }

   Failure(){ return null; }
   // Init(size){
   //    this.buffer = new Float32Array(size);
   // }
   Set(value, index) {
		this.buffer[index] = value;
		this.uniformsNeedUpdate = true;
	}
	Update(gl) {
		gl.uniform1fv(this.loc, this.buffer); // And the shader decides the number of elements to draw from the buffer
		this.uniformsNeedUpdate = false;
	}
}