// Widget_Dynamic_Text_Mesh

// How to add more meshes of type 'dynamic text'

// -1-
// Add a new dynamicText, that will use its own timeInterval and update function, 
// with ofcourse different interval in miliseconds.
// Just grab the idx from the new dynamicText creation and pass it to the SetDynamicText().

// Example Code:
const dynamicText = new Widget_Dynamic_Text_Mesh('WorstFrameAvg:', '0000', [0, 60, 0], 7, [1, 1], WHITE, GREEN, .3);
scene.AddMesh(dynamicText);
// Set a timeInterval to call an Update() method, with a CallBack function that will update the dynamic text 
dynamicText.SetDynamicText(200, SetTextCallBack, 'Test-DynamicText1')
// Create a new dynamicText
const idx = dynamicText.CreateDynamicText('0000', 7, WHITE, GREEN, .3);
// Set a !NEW! timeInterval for the new dynamicText. This creates a
// new timeInterval object that can run independently from the first dynamic text,
// but adds the appropriate overhead. 
// Also we need to pass the index of the new dynamic text, so that only the 
// new dynamicText is passed as a mesh to the timeInterval and eventually to the Update() function.
// The index represents the index of the dynamicText int the children's buffer.
dynamicText.SetDynamicText(2000, SetTextCallBack2, 'Test-DynamicText2', idx) 


// -2- TODO
// Add a new dynamicText, that will use the same timeInterval and update function 
// with the interval time that has been already set by the first call to dynamicText2.CreateDynamicText.
// Just dont pass any idx to the  SetDynamicText() OR pass INT_NULL as the idx param

// Example Code:
const dynamicText = new Widget_Dynamic_Text_Mesh('WorstFrameAvg:', '0000', [0, 60, 0], 7, [1, 1], WHITE, GREEN, .3);
scene.AddMesh(dynamicText);
dynamicText.SetDynamicText(200, SetTextCallBack, 'Test-DynamicText1')
const idx = dynamicText.CreateDynamicText('0000', 7, WHITE, GREEN, .3);
dynamicText.SetDynamicText(2000, SetTextCallBack2, 'Test-DynamicText2', INT_NULL) 