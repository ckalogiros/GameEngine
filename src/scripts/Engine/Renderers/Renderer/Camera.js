import { GlProgram, GlProgramUpdateUniformProjectionMatrix } from '../../../Graphics/GlProgram.js';
import { Mat4Orthographic, Mat4Perspective } from '../../../Helpers/Math/Matrix.js';
import { MouseGetMousePos, MouseGetPosDif } from '../../Controls/Input/Mouse.js';
import { Matrix4 } from '../../math/Matrix4.js';

// const tra = new Matrix4();

export class Camera extends Matrix4{
	isSet;
	constructor() {
		super();
		this.isSet = false;
	}
	Update(gl) {
		if (DEBUG.CAMERA && !this.isSet) alert('Forget to set Camera. @ Camera.js');
		// Update the projection matrix uniform in all programs that
		// TODO: It is not flexible if more than 1 cameras exist. So we need to store the programs 
		// idx in the camera to update only the programs that use the cameras projection matrix.
		GlProgramUpdateUniformProjectionMatrix(gl, this.elements);
	}
	Translate(x, y, z) {
		super.Translate(x, y, 0);
	}
	Pan() {
		const mouseDif = MouseGetPosDif();
		mouseDif.x /= Viewport.width / 2;
		mouseDif.y /= Viewport.height / 2;
		this.Translate(mouseDif.x, mouseDif.y, 0);
		this.needsUpdateUniform = true;
	}
}

export class CameraOrthographic extends Camera {
	constructor(){
		super();
	}
	Set() {
		this.makeOrthographic(0, Viewport.width, 0, Viewport.height, -100, 100);
		console.log('Orthographic Camera:', this.elements);
		this.isSet = true;
	}
	Update(gl) {
		super.Update(gl);
	}
}
export class CameraPerspective extends Camera {
	constructor(){
		super();
	}
	Set() {
		this.elements.makePerspective(0, Viewport.width, 0, Viewport.height, -100, 100);
		console.log('Perspective Camera:', this.elements)
		this.isSet = true;
	}
	Update(gl) {
		super.Update(gl);
	}
}