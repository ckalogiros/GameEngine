import { Mat4Orthographic, Mat4Perspective } from '../../Helpers/Math/Matrix.js';

export class Camera{
	camera = null;
   CameraSet() {
		this.camera = new Mat4Orthographic(0, Viewport.width, Viewport.height, 0, -100.0, 1000); 
	}
	CameraUpdate(gl) {
		if (!this.camera) alert('Forget to set camera. I_GlProgram.js');
		gl.uniformMatrix4fv(this.shaderInfo.uniforms.orthoProj, false, this.camera);
	}
}

export class CameraOrthographic
{
   camera = null;
   CameraSet() {
		this.camera = new Mat4Orthographic(0, Viewport.width, Viewport.height, 0, -100.0, 1000); 
	}
	CameraUpdate(gl) {
		if (!this.camera) alert('Forget to set camera. I_GlProgram.js');
		gl.uniformMatrix4fv(this.shaderInfo.uniforms.orthoProj, false, this.camera);
	}
}
export class CameraProjection
{
   camera = null;
   CameraSet() {
		this.camera = new Mat4Perspective(0, Viewport.width, Viewport.height, 0, -100.0, 1000); 
		// this.camera = new Mat4Perspective(0, 1000, 2000, 0, -100.0, 1000); 
	}
	CameraUpdate(gl) {
		if (!this.camera) alert('Forget to set camera. I_GlProgram.js');
		gl.uniformMatrix4fv(this.shaderInfo.uniforms.orthoProj, false, this.camera);
	}
}

function Controls(){
	
}