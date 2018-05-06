/*
    Copyright (C) 2015-2018 Sumandeep Banerjee

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
    
/* 
 * Basic3D Viewer: Renderer module source
 * Author: sumandeep.banerjee@gmail.com
 */

"use strict";

// Renderer Class - Data
function CRenderer() {
    this.m_nWidth = 320;            // size of viewport width
    this.m_nHeight = 240;           // size of viewport height
    this.m_rFOV = 35.0;             // field of view angle
    this.m_fEnableShadows = false;  // enable or disable shadows
    this.m_rZoomMax = 1.50;         // closest approach to 3d model
    this.m_rZoomMin = 4.50;         // farthest distance to 3d model
    this.m_rZoomDefault = 4.50;     // default distance to 3d model
    this.m_fLoadingImg = true;      // flag to mark loading of 3D model
    this.m_funcOnModelLoad = null;  // call back function pointer to mark 3D model loading
    this.m_fLimitMove = false;      // limit movement of camera
    this.m_fAnimateSpin = false;    // boolean type to control auto spin
    this.m_xSceneColor = "#FFFFFF"; // hex integer type for background color

    //this.m_cControls = null;        // dat.gui controls variable
    //this.m_cGUI = null;             // dat.gui controls element
    this.m_cRenderer = null;        // three.js WebGL renderer
    this.m_cHUDScene = null;        // three.js scene for HUD
    this.m_cHUDCamera = null;       // three.js orthographic camera for HUD
    this.m_cHUDSprite = null;       // three.js 2D Image Sprite for HUD
    this.m_cScene = null;           // three.js 3D Scene
    this.m_cCamera = null;          // three.js perspecive camera for 3D rendering
    this.m_cModel = null;           // three.js Object3D container
    this.m_cFloor = null;           // three.js 3D Mesh for floor
    this.m_cSkyBox = null;          // three.js Skybox
    this.m_nObjectCount = 0;        // count of objects such as 3D Model, Floor, SkyBox etc.

    //this.m_urlHUDTexture = "./assets/texture/load_anim.gif";
    //this.m_urlFloorTexture = "./assets/texture/wood_brown.jpg";
}

// Renderer Class - Methods
CRenderer.prototype = {
    // constructor to declare the data
    constructor: CRenderer,
    // create renderer object and initialize settings 
    initEngine: function (canvas, onModelLoad) {
        // get canvas dimentions
        this.m_nWidth = canvas.width;
        this.m_nHeight = canvas.height;

        // get model load completion callback
        this.m_funcOnModelLoad = onModelLoad;

        // create renderer
        this.m_cRenderer = (isWebGLAvailable(canvas)) ?
                (new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true})) :
                (new THREE.CanvasRenderer({canvas: canvas, antialias: true, alpha: true}));
        this.m_cRenderer.setClearColor(this.m_xSceneColor, 1);

        // set the viewport size
        this.m_cRenderer.setSize(this.m_nWidth, this.m_nHeight);

        // disable viewport auto clear to enable HUD overlay on 3D scene
        //this.m_cRenderer.autoClear = false;

        // set shadow settings
        //this.m_cRenderer.shadowMapEnabled = true;
        //this.m_cRenderer.shadowMapType = THREE.PCFSoftShadowMap;

        // set rendering parameters
        this.m_cRenderer.setFaceCulling(THREE.CullFaceNone);    // disable face culling
    },
    // create scene and add 3d resources
    setupScene: function (cModelParam) {
        /*// create HUD Scene
         this.m_cHUDScene = new THREE.Scene();
         
         // create orthographic camera for HUD
         this.m_cHUDCamera = new THREE.OrthographicCamera(
         -this.m_nWidth / 2, this.m_nWidth / 2,
         this.m_nHeight / 2, -this.m_nHeight / 2, 0.1, 10);
         this.m_cHUDCamera.position.z = 8;
         this.m_cHUDScene.add(this.m_cHUDCamera);
         
         // load HUD sprite
         var object = this;
         var mapHUDTexture = THREE.ImageUtils.loadTexture(this.m_urlHUDTexture); //, undefined, object.createHUDSprite);
         var HUDMaterial = new THREE.SpriteMaterial({map: mapHUDTexture});
         this.m_cHUDSprite = new THREE.Sprite(HUDMaterial);
         this.m_cHUDSprite.scale.set(300, 300, 1);
         this.m_cHUDSprite.position.set(0, 0, 1);    // center
         this.m_cHUDScene.add(this.m_cHUDSprite);*/

        // create a new 3D scene
        this.m_cScene = new THREE.Scene();

        // add perspective camera to view the 3D scene
        this.m_fLimitMove = !cModelParam.fFreeMove;
        this.m_cCamera = new THREE.PerspectiveCamera(
                this.m_rFOV, this.m_nWidth / this.m_nHeight, 0.1, 1000.0);
        this.m_cCamera.position.set(0.0, 0.25, this.m_rZoomDefault);
        this.m_cScene.add(this.m_cCamera);

        // add ambient light
        var light1 = new THREE.AmbientLight(0xFFFFFF);
        this.m_cScene.add(light1);

        // add directional light
        var light2 = new THREE.DirectionalLight(0xFFFFFF, 0.7);
        light2.position.set(0, 0, 1);
        this.m_cScene.add(light2);

        // select loader based on model type
        switch (cModelParam.strType)
        {
            case("obj"):
                // load OBJ+MTL 3D Model
                var meshLoader = new THREE.OBJMTLLoader();
                this.m_cModel = createOBJMTLMesh(meshLoader,
                        cModelParam.strObjFile,
                        cModelParam.strMtlFile,
                        cModelParam.strTexFile,
                        "3D Model");
                this.m_nObjectCount++;
                break;
            case("binary"):
                // load JSON binary 3D Model
                var meshLoader = new THREE.BinaryLoader();
                this.m_cModel = createBinaryMesh(meshLoader,
                        cModelParam.strJsonFile,
                        "3D Model");
                this.m_nObjectCount++;
                break;
            default:
        }

        // add top light
        /*var light3 = new THREE.SpotLight(0xFFFFFF, 1.2, 0, Math.PI / 4);
         light3.position.set(0, 4, 0);
         light3.castShadow = false;
         this.m_cModel.add(light3);*/

        // add circular floor to showcase 3D model
        if (cModelParam.fFloor)
        {
            var mapFloorTexture = new THREE.ImageUtils.loadTexture(this.m_urlFloorTexture);
            var floorMaterial = new THREE.MeshBasicMaterial({
                map: mapFloorTexture,
                side: THREE.DoubleSide});
            var floorGeometry = new THREE.CircleGeometry(1.2, 36);
            this.m_cFloor = new THREE.Mesh(floorGeometry, floorMaterial);
            this.m_cFloor.rotation.x += Math.PI / 2;
            this.m_cModel.add(this.m_cFloor);
            this.m_nObjectCount++;
        }

        // add skybox (virtual room)
        if (cModelParam.fSkyBox)
        {
            var imagePrefix = "./assets/texture/";
            var directions = ["wall", "wall", "floor", "floor", "wall", "wall"];
            var imageSuffix = ".jpg";
            var skyGeometry = new THREE.BoxGeometry(8, 4, 8);
            var materialArray = [];
            for (var i = 0; i < 6; i++)
            {
                materialArray.push(new THREE.MeshBasicMaterial({
                    map: THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
                    side: THREE.BackSide,
                    color: 0xFFFFFF
                }));
            }
            var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
            this.m_cSkyBox = new THREE.Mesh(skyGeometry, skyMaterial);
            this.m_cSkyBox.position.y = 1.99;
            this.m_cModel.add(this.m_cSkyBox);
            this.m_nObjectCount++;
        }

        // initial object inclination
        this.m_cModel.rotation.x = Math.PI / 12;

        // finally add the mesh to our scene
        this.m_cScene.add(this.m_cModel);
    },
    /*createHUDSprite: function (mapHUDTexture) {
     var HUDMaterial = new THREE.SpriteMaterial({map: mapHUDTexture});
     this.m_cHUDSprite = new THREE.Sprite(HUDMaterial);
     this.m_cHUDSprite.scale.set(150, 150, 1);
     this.m_cHUDSprite.position.set(0, 0, 1); // center
     this.m_cHUDScene.add(this.m_cHUDSprite);
     },*/
    // toggle animate spin
    toggleAnimateSpin: function () {
        this.m_fAnimateSpin = !this.m_fAnimateSpin;
    },
    // set view
    resetView: function () {
        this.m_cCamera.position.set(0.0, 0.25, this.m_rZoomDefault);
        this.m_cModel.rotation.set(Math.PI / 12, 0, 0);
    },
    // render the scene, animate on time step input
    displayScene: function (timeStep) {
        // update the tween animations
        TWEEN.update();

        // update background color
        this.m_cRenderer.setClearColor(this.m_xSceneColor, 1);

        // animate object - autospin
        if (this.m_fAnimateSpin)
        {
            var angle = Math.PI * 2 * timeStep / 20000;
            this.m_cModel.rotation.y += angle;
        }

        // check for model loading complete
        if (true === this.m_fLoadingImg && this.m_cModel.children.length >= this.m_nObjectCount)       // change: not elegant
        {
            this.m_fLoadingImg = false;
            //this.m_cRenderer.autoClear = true;
            this.m_funcOnModelLoad();
        }

        // render the scene
        /*if (this.m_fLoadingImg)
         {
         this.m_cRenderer.clear();
         this.m_cRenderer.render(this.m_cScene, this.m_cCamera);
         //this.m_cRenderer.clearDepth();
         //this.m_cRenderer.render(this.m_cHUDScene, this.m_cHUDCamera);
         }
         else*/
        //{
        this.m_cRenderer.render(this.m_cScene, this.m_cCamera);
        //}
    },
    // if viewport is modified then update renderer and camera parameters
    updateScene: function (canvas) {
        // set canvas dimentions
        this.m_nWidth = canvas.width;
        this.m_nHeight = canvas.height;

        // set the viewport size
        this.m_cRenderer.setSize(this.m_nWidth, this.m_nHeight);

        /*// set HUD Camera
         this.m_cHUDCamera.left = -this.m_nWidth / 2;
         this.m_cHUDCamera.right = this.m_nWidth / 2;
         this.m_cHUDCamera.top = this.m_nHeight / 2;
         this.m_cHUDCamera.bottom = -this.m_nHeight / 2;
         this.m_cHUDCamera.updateProjectionMatrix(); 
         this.m_cHUDSprite.scale.set(300, 300, 1);*/

        // set camera aspect ratio
        this.m_cCamera.aspect = this.m_nWidth / this.m_nHeight;
        this.m_cCamera.updateProjectionMatrix();
    },
    // spin model
    modelSpin: function (spinX, spinY) {
        this.m_cModel.rotation.x += spinY * Math.PI / this.m_nHeight;
        // to avoid flipping of 3D model, limit spin about x-axis
        if (this.m_fLimitMove && this.m_cModel.rotation.x > Math.PI / 2)
        {
            this.m_cModel.rotation.x = Math.PI / 2;
        }
        else if (this.m_fLimitMove && this.m_cModel.rotation.x < 0)
        {
            this.m_cModel.rotation.x = 0;
        }
        this.m_cModel.rotation.y += spinX * 2 * Math.PI / this.m_nWidth;
    },
    // move camera
    modelMove: function (moveX, moveY) {
        this.m_cCamera.position.x -= 0.01 * moveX * Math.abs(this.m_cCamera.position.z / 8);
        this.m_cCamera.position.y += 0.01 * moveY * Math.abs(this.m_cCamera.position.z / 8);
    },
    // zoom model -> move camera
    modelZoom: function (zoom) {
        this.m_cCamera.position.z -= 0.1 * zoom;
        // limit zoom range
        if (this.m_cCamera.position.z < this.m_rZoomMax)
        {
            this.m_cCamera.position.z = this.m_rZoomMax;
        }
        else if (this.m_cCamera.position.z > this.m_rZoomMin)
        {
            this.m_cCamera.position.z = this.m_rZoomMin;
        }
    }
};
