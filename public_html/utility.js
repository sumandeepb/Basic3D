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
 * Basic3D Viewer: Utility functions
 * Author: sumandeep.banerjee@gmail.com
 */

"use strict";

function getViewport() {
    var viewPortWidth;
    var viewPortHeight;

    // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
    if (typeof window.innerWidth !== 'undefined') {
        viewPortWidth = window.innerWidth;
        viewPortHeight = window.innerHeight;
    }
    // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
    else if (typeof document.documentElement !== 'undefined'
            && typeof document.documentElement.clientWidth !==
            'undefined' && document.documentElement.clientWidth !== 0) {
        viewPortWidth = document.documentElement.clientWidth;
        viewPortHeight = document.documentElement.clientHeight;
    }
    // older versions of IE
    else {
        viewPortWidth = document.getElementsByTagName('body')[0].clientWidth;
        viewPortHeight = document.getElementsByTagName('body')[0].clientHeight;
    }

    return [viewPortWidth, viewPortHeight];
}

// check for WebGL compatibility of browser
function isWebGLAvailable(canvas) {
    try {
        return !!(window.WebGLRenderingContext && (
                canvas.getContext('webgl') ||
                canvas.getContext('experimental-webgl'))
                );
    } catch (e) {
        return false;
    }
}

// wait untill condition becomes true
function waitForCondition(arg1, arg2, callBack) {
    if (arg1() === arg2) {
        callBack();
    }
    else {
        setTimeout(function () {
            waitForCondition(arg1, arg2, callBack);
        }, 250);
    }
}

// return a mesh from an OBJ file   
function createOBJMTLMesh(loader, objFile, mtlFile, texFile, objName) {
    // create Oject3D container
    var container = new THREE.Object3D();

    // call 3D model loader function
    loader.load(objFile, mtlFile, function (object) {
        // set 3D Model name
        object.name = objName;
        // parse through the object list for Mesh objects
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                // compute model centroid to auto align the model with the origin and the axes
                var centroid = new THREE.Vector3();
                child.geometry.computeBoundingBox();
                centroid.addVectors(child.geometry.boundingBox.min, child.geometry.boundingBox.max);
                centroid.multiplyScalar(-0.5);
                child.position.set(centroid.x, 0, centroid.z);

                // compute model bounding sphere radius to auto scale the object to fit into a unit sphere
                child.geometry.computeBoundingSphere();
                var scale = 1 / child.geometry.boundingSphere.radius;
                child.geometry.applyMatrix(new THREE.Matrix4().makeScale(scale, scale, scale));

                // render both front and back facing triangles
                child.material.side = THREE.DoubleSide;

                //child.castShadow = true;
                //child.receiveShadow = false;
            }
        });
        container.add(object);
    });
    return container;
}

// return a mesh from a JSON file
function createBinaryMesh(loader, jsonFile, objName) {
    // create Oject3D container
    var container = new THREE.Object3D();

    // call 3D model loader function
    loader.load(jsonFile, function (geometry, materials) {
        var material = new THREE.MeshFaceMaterial(materials);
        var mesh = new THREE.Mesh(geometry, material);
        
        var object = mesh;
        object.name = objName;
        
        var child = object;
        if (child instanceof THREE.Mesh) {
            for (var i = 0; i < 2; i++) { // change: no proper explanation for success of this
                // compute model centroid to auto align the model with the origin and the axes
                var centroid = new THREE.Vector3();
                child.geometry.computeBoundingBox();
                centroid.addVectors(child.geometry.boundingBox.min, child.geometry.boundingBox.max);
                centroid.multiplyScalar(-0.5);
                child.position.set(centroid.x, 0, centroid.z);

                // compute model bounding sphere radius to auto scale the object to fit into a unit sphere
                child.geometry.computeBoundingSphere();
                var scale = 1 / child.geometry.boundingSphere.radius;
                child.geometry.applyMatrix(new THREE.Matrix4().makeScale(scale, scale, scale));

                // render both front and back facing triangles
                child.material.side = THREE.DoubleSide;

                //child.castShadow = true;
                //child.receiveShadow = false;
            }
        }

        container.add(object);
    });

    return container;
}
