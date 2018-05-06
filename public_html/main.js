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
 * Basic3D Viewer: Main module source
 * Author: sumandeep.banerjee@gmail.com
 */

"use strict";

var g_htmlCanvas;
var g_cRenderer = null;
var g_fIsFullScreen = false;

// start WebGL script when browser is ready
$(document).ready(
        function webGLMain()
        {
            /*var OSName = "Unknown OS";
            if (navigator.appVersion.indexOf("Win") != -1)
                OSName = "Windows";
            else if (navigator.appVersion.indexOf("Mac") != -1)
                OSName = "MacOS";
            else if (navigator.appVersion.indexOf("X11") != -1)
                OSName = "UNIX";
            else if (navigator.appVersion.indexOf("Linux") != -1)
                OSName = "Linux";
            console.log('Your OS is: ' + OSName);*/

            // parse query string
            var strUserName = "local-test";
            var strItemCode = "";
            var strTypeCode = "o";
            var strSkyBoxFlag = "f";
            var strFreeMoveFlag = "t";

            var strPageURL = window.location.search.substring(1);
            var strURLVariables = strPageURL.split('&');

            // parse each variable
            for (var i = 0; i < strURLVariables.length; i++) {
                var strParamRecord = strURLVariables[i].split('=');
                // test each variable name and assign data
                switch (strParamRecord[0])
                {
                    case ("un"):
                        strUserName = strParamRecord[1];
                        break;
                    case ("ic"):
                        strItemCode = strParamRecord[1];
                        break;
                    case ("tc"):
                        strTypeCode = strParamRecord[1];
                        break;
                    case ("sb"):
                        strSkyBoxFlag = strParamRecord[1];
                        break;
                    case ("fm"):
                        strFreeMoveFlag = strParamRecord[1];
                        break;
                }
            }

            // select resource path
            var strStoragePath = "";
            var strUserString = "";
            switch (strUserName)
            {
                case("web-test"):
                    strStoragePath = "https://web.resource.path/";
                    strUserString = "WebTest";
                    break;
                case("local-test"):
                default:
                    strStoragePath = "./assets/models/";
                    strUserString = "LocalTest";
                    break;
            }

            // create title string
            $("#title").text(strUserString + " : " + strItemCode);

            // create file paths & other parameters
            var cModelParam = new Object();
            switch (strTypeCode)
            {
                case("b"):
                    cModelParam.strJsonFile = strStoragePath + strItemCode + ".json";
                    cModelParam.strType = "binary";
                    break;
                case("o"):
                default:
                    cModelParam.strObjFile = strStoragePath + strItemCode + ".obj";
                    cModelParam.strMtlFile = strStoragePath + strItemCode + ".mtl";
                    cModelParam.strTexFile = strStoragePath + strItemCode + ".jpg";
                    cModelParam.strType = "obj";
                    break;
            }

            switch (strSkyBoxFlag)
            {
                case ("f"):
                default:
                    cModelParam.fSkyBox = false;
                    break;
                case ("t"):
                    cModelParam.fSkyBox = true;
                    break;
            }

            switch (strFreeMoveFlag)
            {
                case ("t"):
                default:
                    cModelParam.fFreeMove = true;
                    break;
                case ("f"):
                    cModelParam.fFreeMove = false;
                    break;
            }

            // get html5 3D canvas context
            g_htmlCanvas = document.getElementById("main-canvas");

            // set the canvas size
            var viewport = getViewport();
            g_htmlCanvas.width = viewport[0];
            g_htmlCanvas.height = viewport[1];

            // create, initialize and set-up Renderer
            g_cRenderer = new CRenderer();
            g_cRenderer.initEngine(g_htmlCanvas, onLoadComplete);
            g_cRenderer.setupScene(cModelParam);

            // add UI buttons
            //dirty solution to get the correct context, change it!!
            var container1 = document.getElementsByTagName("body")[0];
            var container2 = document;
            initLogo();
            initPromptMessage();
            initFullScreen(container1, container2);
            initInfoButton();
            initSplashMessage();
            initAutoSpin();
            initResetView();
            initPanZoomControl();

            // Start listening to user events
            window.addEventListener('resize', onWindowResize, false);
            g_htmlCanvas.addEventListener('contextmenu', onContextMenu, false);
            window.addEventListener("keydown", onKeyDown, true);
            g_htmlCanvas.addEventListener('mousewheel', onMouseWheel, false);
            //g_htmlCanvas.addEventListener('mousemove', onMouseMove, false);
            //g_htmlCanvas.addEventListener('mousedown', onMouseDown, false);
            //g_htmlCanvas.addEventListener('mouseup', onMouseUp, false);
            document.addEventListener("fullscreenerror", function () {
                console.log("OOps!!");
            });

            // create an instance of Hammer
            var touch = new Hammer(g_htmlCanvas);
            var pan = new Hammer.Pan({direction: Hammer.DIRECTION_ALL});
            var pinch = new Hammer.Pinch({enable: true});
            touch.add([pinch, pan]);
            pinch.recognizeWith(pan);
            pan.requireFailure(pinch);

            // listen to touch events...
            touch.on("pinch pan", onTouch);

            // run the rendering loop
            runProcessLoop();
        }
);

// animation timing parameters
var g_prevTime = 0.0;

// infinite loop to poll the rendering routine
function runProcessLoop(currTime)
{
    requestAnimationFrame(runProcessLoop);

    // track time
    var deltaT = currTime - g_prevTime;  // mili-second
    g_prevTime = currTime;

    // render the scene
    g_cRenderer.displayScene(deltaT);
}

function initLogo() {
    var img = document.createElement("IMG");
    img.src = "./assets/texture/logo.svg";
    img.width = '40';
    img.height = '40';
    document.getElementById("logo").appendChild(img);

    $("#logo").click(function () {
        $("#prompt-box").css('opacity', '1');
        $("#prompt-box").css('display', 'block');
    });
}

var g_strPromptMessage = "<div id='prompt-close'><img src='./assets/texture/close_round.svg' /></div>"
        + "<div id='prompt-title'>About</div>"
        + "<div style='width: 100%; overflow: hidden;'>"
        + "<div style='margin-left: 20px; width: 64px; float: left; margin-top: 20px; margin-right: 20px;'>"
        + "<img class='img' src= './assets/texture/logo.svg' /></div>"
        + "<div style='margin-left: 20px; margin-top: 20px; margin-right: 20px; vertical-align: middle;'>"
        + "Basic3D Viewer<br>"
        + "</div></div>";

function initPromptMessage() {
    $("#prompt-box").css('display', 'none');
    $("#prompt-box").html(g_strPromptMessage);

    $("#prompt-close").click(function () {
        $("#prompt-box").animate({
            opacity: '0'
        }, 500, function () {
            //$("#prompt-box").css('display', 'none');
        });

        $("#prompt-box").effect("transfer", {
            to: "#logo", className: "ui-effects-transfer"
        }, 500, function () {
            $("#prompt-box").css('display', 'none');
        });
    });
}

var g_strHelpMessage = "<div id='splash-close'><img src='./assets/texture/close_round.svg' /></div>"
        + "<div id='splashMessage-title'>Navigation Hints</div>"
        + "<table><tr><td><figure><img class='img' src= './assets/texture/clickdrag.svg' /><figcaption>Left Click and Drag to Rotate</figcaption></figure></td>"
        + "<td><figure><img class='img' src= './assets/texture/mousewheel.svg' /><figcaption>Scroll Mouse Wheel to Zoom </figcaption></figure></td></tr>"
        + "<tr><td><figure><img class='img' src= './assets/texture/arrowkeys.svg' /><figcaption>Press Arrow Keys to Rotate</figcaption></figure></td>"
        + "<td><figure><img class='img' src= './assets/texture/keyzoom.svg' /><figcaption>Press Z-X Keys to Zoom</figcaption></figure></td></tr></table>";
var g_fSplashMsg = false;

function initInfoButton() {
    var img = document.createElement("IMG");
    img.src = "./assets/texture/info.svg";
    img.width = '32';
    img.height = '32';
    document.getElementById("info-button").appendChild(img);

    $("#info-button").click(function () {
        g_fSplashMsg = true;
        $("#splashMessage-box").css('opacity', '1');
        $("#splashMessage-box").css('display', 'block');
    });
}

function initSplashMessage() {
    g_fSplashMsg = true;
    $("#splashMessage-box").html(g_strHelpMessage);
    $("#splash-close").click(onCloseSplashMsg);
    setTimeout(onCloseSplashMsg, 5000);
}

function onCloseSplashMsg() {
    if (g_fSplashMsg) {
        g_fSplashMsg = false;
    }
    else {
        return;
    }

    $("#splashMessage-box").animate({
        opacity: '0'
    }, 500, function () {
        //$("#splashMessage-box").css('display', 'none');
    });

    $("#splashMessage-box").effect("transfer", {
        to: "#info-button", className: "ui-effects-transfer"
    }, 500, function () {
        $("#splashMessage-box").css('display', 'none');
    });
}

$(document).on("fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange", function () {
    if (!g_fIsFullScreen) {
        document.getElementById("fullScreen-icon").src = "./assets/texture/fullscreen_exit.svg";
        document.getElementById("fullScreen-button").title = "Exit Fullscreen";
        g_fIsFullScreen = true;
    } else {
        //exitFullScreen();
        document.getElementById("fullScreen-icon").src = "./assets/texture/fullscreen.svg";
        document.getElementById("fullScreen-button").title = "View Fullscreen";
        g_fIsFullScreen = false;
    }
});

function initFullScreen(container1, container2) {
    var img = document.createElement("IMG");
    img.id = "fullScreen-icon";
    img.src = "./assets/texture/fullscreen.svg";
    img.width = '32';
    img.height = '32';
    document.getElementById("fullScreen-button").appendChild(img);

    $("#fullScreen-button").click(function () {
        if (!g_fIsFullScreen)
        {
            if (container1.requestFullscreen) {
                container1.requestFullscreen();
            } else if (container1.msRequestFullscreen) {
                container1.msRequestFullscreen();
            } else if (container1.mozRequestFullScreen) {
                container1.mozRequestFullScreen();
            } else if (container1.webkitRequestFullscreen) {
                container1.webkitRequestFullscreen();
            }
        }
        else
        {
            if (container2.exitFullscreen) {
                container2.exitFullscreen();
            } else if (container2.webkitExitFullscreen) {
                container2.webkitExitFullscreen();
            } else if (container2.mozCancelFullScreen) {
                container2.mozCancelFullScreen();
            } else if (container2.msExitFullscreen) {
                container2.msExitFullscreen();
            }
        }
    });
}

// browser window is resized
function onWindowResize()
{
    // set the canvas size
    var viewport = getViewport();
    g_htmlCanvas.width = viewport[0];
    g_htmlCanvas.height = viewport[1];

    // update renderer size
    g_cRenderer.updateScene(g_htmlCanvas);
}

// disable context menu
function onContextMenu(event)
{
    if (event.button === 2) {
        event.preventDefault();
        return false;
    }
}

// 3D content is loaded
function onLoadComplete()
{
    // refresh viewport
    $(window).trigger('resize');

    // remove the loading spinner animation
    $("#spinner").fadeOut("slow");
}

var g_LEFTKEY = 37;
var g_UPKEY = 38;
var g_RIGHTKEY = 39;
var g_DOWNKEY = 40;

// keypress event handler
function onKeyDown(event)
{
    // interpret key commands
    switch (event.keyCode) {
        case(g_LEFTKEY):
        case(g_RIGHTKEY):
        case(g_UPKEY):
        case(g_DOWNKEY):
            event.preventDefault();
            g_cRenderer.modelWalk(event.keyCode);
            event.stopPropagation();
            break;
        default:
            break;
    }
}

// mouse wheel scroll
function onMouseWheel(event)
{
    event.preventDefault();

    // measure wheel rotation
    var delta = 0;
    if (event.wheelDelta) { // WebKit / Opera / Explorer 9
        delta = event.wheelDelta;
    } else if (event.detail) { // Firefox
        delta = -event.detail;
    }

    // zoom model using the mouse wheel 
    g_cRenderer.modelZoom(delta / 120); // 3 scrolls = 360
}

/*
 // mouse state parameters
 var g_fLeftMouseDown;
 var g_fMiddleMouseDown;
 var g_fRightMouseDown;
 var g_ptPrevMousePos = new Array();
 var g_ptCurrMousePos = new Array();
 
 // any mouse button is depressed
 function onMouseDown(event)
 {
 event.preventDefault();
 
 if (event.button === 0) // left button
 {
 g_fLeftMouseDown = true;
 }
 else if (event.button === 1) // middle button
 {
 g_fMiddleMouseDown = true;
 }
 else if (event.button === 2) // right button
 {
 g_fRightMouseDown = true;
 }
 
 // determine position relative to window origin
 g_ptPrevMousePos.x = g_ptCurrMousePos.x = event.pageX - g_htmlCanvas.offsetLeft;
 g_ptPrevMousePos.y = g_ptCurrMousePos.y = event.pageY - g_htmlCanvas.offsetTop;
 }
 
 // any mouse button is released
 function onMouseUp(event)
 {
 event.preventDefault();
 
 if (event.button === 0) // left button
 {
 g_fLeftMouseDown = false;
 }
 else if (event.button === 1) // middle button
 {
 g_fMiddleMouseDown = false;
 }
 else if (event.button === 2) // right button
 {
 g_fRightMouseDown = false;
 }
 }
 
 // mouse pointer is moved
 function onMouseMove(event)
 {
 event.preventDefault();
 
 // determine position relative to window origin
 g_ptCurrMousePos.x = event.pageX - g_htmlCanvas.offsetLeft;
 g_ptCurrMousePos.y = event.pageY - g_htmlCanvas.offsetTop;
 
 // spin model using the left mouse button
 //if (true === g_fLeftMouseDown)
 //{
 //    g_cRenderer.modelSpin(g_ptCurrMousePos.x - g_ptPrevMousePos.x,
 //            g_ptCurrMousePos.y - g_ptPrevMousePos.y);
 //}
 
 // pan model using the right mouse button
 if (true === g_fRightMouseDown)
 {
 g_cRenderer.modelMove(g_ptCurrMousePos.x - g_ptPrevMousePos.x,
 g_ptCurrMousePos.y - g_ptPrevMousePos.y);
 }
 
 // save current data for next call
 g_ptPrevMousePos.x = g_ptCurrMousePos.x;
 g_ptPrevMousePos.y = g_ptCurrMousePos.y;
 }
 */

function initAutoSpin() {
    var img = document.createElement("IMG");
    img.src = "./assets/texture/autospin.svg";
    img.id = 'spin-icon';
    img.width = '32';
    img.height = '32';
    document.getElementById("spin-button").appendChild(img);

    $("#spin-button").click(function () {
        g_cRenderer.toggleAnimateSpin();
        if (g_cRenderer.m_fAnimateSpin) {
            document.getElementById("spin-icon").src = "./assets/texture/autospin_active.svg";
            document.getElementById("spin-button").title = "Stop Spin";
        }
        else {
            document.getElementById("spin-icon").src = "./assets/texture/autospin.svg";
            document.getElementById("spin-button").title = "Auto Spin";
        }
    });
}

function initResetView() {
    var img = document.createElement("IMG");
    img.src = "./assets/texture/resetview.svg";
    img.width = '32';
    img.height = '32';
    document.getElementById("reset-button").appendChild(img);

    $("#reset-button").click(function () {
        g_cRenderer.resetView();
    });
}

// process pan-zoom button events
function initPanZoomControl()
{
    /*$('#pan-u').click(function () {
     // flip up object
     g_cRenderer.modelSpin(0, -g_htmlCanvas.height / 24);
     });
     
     $('#pan-r').click(function () {
     // rotate right object
     g_cRenderer.modelSpin(g_htmlCanvas.width / 18, 0);
     });
     
     $('#pan-d').click(function () {
     // flip down object
     g_cRenderer.modelSpin(0, g_htmlCanvas.height / 24);
     });
     
     $('#pan-l').click(function () {
     // rotate left object
     g_cRenderer.modelSpin(-g_htmlCanvas.width / 18, 0);
     });*/

    var imgin = document.createElement("IMG");
    imgin.src = "./assets/texture/zoomin.svg";
    imgin.width = '32';
    imgin.height = '32';
    document.getElementById("zoomin-button").appendChild(imgin);

    $('#zoomin-button').click(function () {
        // zoom in
        g_cRenderer.modelZoom(1);
    });

    var imgout = document.createElement("IMG");
    imgout.src = "./assets/texture/zoomout.svg";
    imgout.width = '32';
    imgout.height = '32';
    document.getElementById("zoomout-button").appendChild(imgout);

    $('#zoomout-button').click(function () {
        // zoom out
        g_cRenderer.modelZoom(-1);
    });
}

// touch parameters
var g_ptPrevPanShift = new Object();
var g_ptCurrPanShift = new Object();
var g_ptPrevSwipeShift = new Object();
var g_ptCurrSwipeShift = new Object();
var g_cSwipeTween = null;
var g_fSwipeIsOver = false;
var g_rPrevPinchScale = 1.0;
var g_rCurrPinchScale = 1.0;
var g_fPinchIsOver = false;

// process hammer.js touch events
function onTouch(event)
{
    if ("pinch" === event.type)
    {
        event.preventDefault();
        g_rCurrPinchScale = event.scale;

        g_cRenderer.modelZoom(5 * (g_rCurrPinchScale - g_rPrevPinchScale));

        g_rPrevPinchScale = g_rCurrPinchScale;

        if (event.eventType === Hammer.INPUT_END)
        {
            g_rPrevPinchScale = 1.0;
            g_fPinchIsOver = true;
        }
    }
    else if ("pan" === event.type)
    {
        event.preventDefault();
        var speed = Math.abs(event.velocity);

        if (event.eventType === Hammer.INPUT_END && speed > 0.65)
        {
            // stop current tween
            if (g_cSwipeTween)
                g_cSwipeTween.stop();

            var speedFactorX = Math.max(1.0, 0.05 * Math.abs(event.velocityX));
            var speedFactorY = Math.max(1.0, 0.05 * Math.abs(event.velocityY));

            var source = {x: 0, y: 0};
            var target = {x: speedFactorX * event.deltaX, y: speedFactorY * event.deltaY / 2}; // y is divided by 2 because of latt(90) vs long(180) range
            g_ptPrevSwipeShift.x = source.x;
            g_ptPrevSwipeShift.y = source.y;

            g_cSwipeTween = new TWEEN.Tween(source).to(target, 3000)
                    .interpolation(TWEEN.Interpolation.Linear)
                    .delay(0)
                    .easing(TWEEN.Easing.Exponential.Out)
                    .repeat(0)
                    .start();

            g_cSwipeTween.onUpdate(function () {
                // 
                g_ptCurrSwipeShift.x = source.x;
                g_ptCurrSwipeShift.y = source.y;

                // spin object
                g_cRenderer.modelSpin(g_ptCurrSwipeShift.x - g_ptPrevSwipeShift.x,
                        g_ptCurrSwipeShift.y - g_ptPrevSwipeShift.y);

                //
                g_ptPrevSwipeShift.x = g_ptCurrSwipeShift.x;
                g_ptPrevSwipeShift.y = g_ptCurrSwipeShift.y;
            });

            g_fSwipeIsOver = true;
        }
        else
        {
            // determine position relative to window origin
            if (undefined === g_ptPrevPanShift.x || undefined === g_ptPrevPanShift.y)
            {
                g_ptPrevPanShift.x = 0;
                g_ptPrevPanShift.y = 0;
            }

            if (g_fPinchIsOver)
            {
                g_ptPrevPanShift.x = event.deltaX;
                g_ptPrevPanShift.y = event.deltaY;
                g_fPinchIsOver = false;
            }

            if (g_fSwipeIsOver)
            {
                // stop current tween
                if (g_cSwipeTween)
                    g_cSwipeTween.stop();

                g_ptPrevPanShift.x = event.deltaX;
                g_ptPrevPanShift.y = event.deltaY;
                g_fSwipeIsOver = false;
            }

            g_ptCurrPanShift.x = event.deltaX;
            g_ptCurrPanShift.y = event.deltaY;

            // spin object
            g_cRenderer.modelSpin(g_ptCurrPanShift.x - g_ptPrevPanShift.x,
                    g_ptCurrPanShift.y - g_ptPrevPanShift.y);

            // save current data for next call
            g_ptPrevPanShift.x = g_ptCurrPanShift.x;
            g_ptPrevPanShift.y = g_ptCurrPanShift.y;

            if (event.eventType === Hammer.INPUT_END)
            {
                g_ptPrevPanShift.x = 0;
                g_ptPrevPanShift.y = 0;
            }
        }
    }
}
