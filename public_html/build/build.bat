REM Copyright (C) 2015-2018 Sumandeep Banerjee
REM
REM This program is free software: you can redistribute it and/or modify
REM it under the terms of the GNU Affero General Public License as published
REM by the Free Software Foundation, either version 3 of the License, or
REM (at your option) any later version.
REM
REM This program is distributed in the hope that it will be useful,
REM but WITHOUT ANY WARRANTY; without even the implied warranty of
REM MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
REM GNU Affero General Public License for more details.
REM
REM You should have received a copy of the GNU Affero General Public License
REM along with this program.  If not, see <http://www.gnu.org/licenses/>.

REM Basic3D Viewer: Build Script
REM Author: sumandeep.banerjee@gmail.com

@echo off
java -jar closure/compiler.jar --compilation_level=SIMPLE --language_in=ECMASCRIPT5 --js_output_file=../basic3d.js ../libs/tween.js/tween.js ../libs/hammer.js/hammer.js ../libs/dat.gui/dat.gui.js  ../main.js ../renderer.js ../utility.js ../camera.js ../libs/requestAnimationFrame/RequestAnimationFrame.js ../libs/three.js/loaders/MTLLoader.js ../libs/three.js/loaders/OBJMTLLoader.js ../libs/three.js/loaders/BinaryLoader.js
