/*
This file is part of HTMoL:
Copyright (C) 2014 Dr. Mauricio Carrillo-Tripp  
http://tripplab.com

Developers:
v1.0 Leonardo Alvarez-Rivera, Francisco Javier Becerra-Toledo, Adan Vega-Ramirez 
v2.0 Javier Garcia-Vieyra
v3.0 Omar Israel Lara-Ramirez, Eduardo González-Zavala, Emmanuel Quijas-Valades, Julio Cesar González-Vázquez
v3.5 Leonardo Alvarez-Rivera
*/

    var coordsX= new Float32Array();
    var coordsX1= new Float32Array();
    var coordsY= new Float32Array();
    var coordsY1=new Float32Array();
    var coordsZ= new Float32Array();
    var coordsZ1=new Float32Array();

    var gl;
    var NoBloques=0;
    var program;
    var Cx,Cy,Cz;
    var y=0;
    var x=0;
    var CameraPosition;
    var ZoomMotion;

    var contadores=0;

    var SeleccionadoNumber=0;
    var habiaSeleccionado=false;
    var haySeleccionado=false;

    var AtomosSeleccionados=[];

    var indexAlmacenado=[];

    var molecule;

    latitudeBands=SphereResolution;
    longitudeBands=SphereResolution;
    
    var nVertices= (latitudeBands +1) * (longitudeBands + 1)  * 3;  //  867 para 16 latitudes y 16 longitudes
    //var nVertices= 48;
    var nColor= (latitudeBands +1) * (longitudeBands + 1)  * 4; // 1156
    //var nColor= 64;
    var nIndices= latitudeBands * longitudeBands * 6; // 1536; //se le suma 289 para hacer el offset
    //var nIndices= 54;
    var nChain=(latitudeBands +1) * (longitudeBands + 1)  * 2; //578

    var indexOff = (latitudeBands * longitudeBands ) + latitudeBands + longitudeBands + 1;

    var indiceOffset = 0; //es para el indice de las esferas

    var LstBtnsChain = [] //es para los botones de las cadenas

    ///////////////////////estos radios son para las esferas VDW dependiendo del elemento
    var radiusH = 1.0;
    var rC_PB_TI_CA= 1.4; //6;
    var radiusN = 1.4; //6;
    var radiusO = 1.4; //6; //5;
    var radiusS = 1.4; //6; //8;
    var radiusP = 1.4; //6; //9;
    var rDefault = 1.0; //1.7;

    ///////////////en estos arreglos se guardan los vértices para las demás plantillas de esferas VDW
    var verArrayH=[];
    var verArrayC_PB_TI_CA=[];
    var verArrayN=[];
    var verArrayO=[];
    var verArrayS=[];
    var verArrayP=[];
    var verArrayDefault=[];
    /////////////////////////////////////////

// A PDB file with no trajectory info in the header
var URL_PDB_Load_default=PDBDIR+".pdb";
// Trajectory info for the previous PDB file. 
// The file has to be in the directory specified by TRJDIR
var URL_TRJ_Load_default=".xtc";
// PDB file with trajectory info specified in the header
//var URL_TRJ_AutoLoad_default=PDBDIR+"prueba.pdb";

    function initGL(canvas) {
        try {
            gl = canvas.getContext("experimental-webgl")||canvas.getContext("webgl")||canvas.getContext("webkit-3d")||canvas.getContext("moz-webgl");
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {
        }
        if (!gl) {
            alert("HTMoL: ERROR. Your browser does not support WebGL");
        }
    }


    var mvMatrix = mat4.create();
    var mvMatrixStack = [];
    var pMatrix = mat4.create();

    function mvPushMatrix() {
        var copy = mat4.create();
        mat4.set(mvMatrix, copy);
        mvMatrixStack.push(copy);
    }

    function mvPopMatrix() {
        if (mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        mvMatrix = mvMatrixStack.pop();
    }

    function setMatrixUniforms() {
        gl.uniformMatrix4fv(currentProgram.pMatrixUniform, false, pMatrix);
        gl.uniformMatrix4fv(currentProgram.mvMatrixUniform, false, mvMatrix);

        var normalMatrix = mat3.create();
        mat4.toInverseMat3(mvMatrix, normalMatrix);
        mat3.transpose(normalMatrix);
        gl.uniformMatrix3fv(currentProgram.nMatrixUniform, false, normalMatrix);
    }

    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }


    var mouseDown = false;
    var lastMouseX = null;
    var lastMouseY = null;

    var RotationMatrix = mat4.create();
    mat4.identity(RotationMatrix);


    function GetAtom(pix)
    {
        var NumAtom = 0;
        var atmS=null;

        NumAtom= pix[2]*255*255 + pix[1]*255 + pix[0];
        try
        {
            atmS= molecule.LstAtoms[NumAtom-1];
            return atmS;
        }
        catch(e)
        {
            return null;
        }

    }

    var ArrayIndx=[]; //variable para las cadenas que se apagan y prenden
    //es para la función de procesar cadena que afecta al fragment shader

    //////////////////////////////////////////////// VARIABLES GLOBALES PARA ESFERAS //////////////////////////////

    //para la plantilla
    var normalData = [];
    var verArray=[];

    var indx = [];

    //Para esferas
    var sphereVertexPositionBuffer=[[]];
    var sphereVertexNormalBuffer=[[]];
    var sphereVertexIndexBuffer=[];
    var sphereVertexColorBuffer=[];
    var ChainBuffer=[];  //es para asignarle a cáda vértice a qué cadena le corresponde

    var vertexPositionData = [[]];
    var ColorTotal = [[]];
    var indexData = [[]];
    var normalDataN = [[]];
    var ChainIndex=[];

    var sphereVertexColorBufferDiffuse=[];   ////para colores difusos
    var ColorTotalDiffuse = [[]];

    ////////////////////////////////////////////// PARA LOS ENLACES /////////////////////////////////////////////7
    var lineVertexPositionBuffer=[];
    var colorVertexBuffer= []; //es para el buffer de los enlaces
    var ColorDifBuffer = []; //buffer
    var lineNormalBuffer=[];
    var ChainBufferBnd=[]; //para el buffer del indice de la cadena

    var verticesLineas = [];
    var colores=[];
    var colorBndDif =[]; //para el color diffuso, este se pone en 0
    var linesNormals=[]; //para el arreglo de js de las normales
    var ChainIndexBnd=[]; //para el arreglo en javascript del indice de la cadena
    /////////////////////////////////////////////////////////////////////////////////

    //////////////////////////////////////// PARA LOS ENLACES SKELETON/////////////////////////////////////////////7
    var lineSkeleVerPosBuf=[];
    var colSkeleVerBuf= []; //es para el buffer de los enlaces
    var ColSkeleDifBuf = []; //buffer
    var lineSkeleNorBuf=[];
    var ChainSkeleBufBnd=[]; //para el buffer del indice de la cadena

    var verLineSkele = [];
    var coloresSkele=[];
    var colorSkeleBndDif =[]; //para el color diffuso, este se pone en 0
    var lineSkeleNor=[]; //para el arreglo de js de las normales
    var ChainSkeleIndexBnd=[]; //para el arreglo en javascript del indice de la cadena

    //------Julio
    var verLineSpl = [];
    var coloresSpl=[];
    var colorSplBndDif =[]; //para el color diffuso, este se pone en 0
    var lineSplNor=[]; //para el arreglo de js de las normales
    var ChainSplIndexBnd=[]; //para el arreglo en javascript del indice de la cadena
    var OptRep=false;//Para que no haga spline si es que no se llama

    /////////////////////////////////////////// PARA DIGITOS ///////////////////////////////////////////
    var diPosition = [];
    var diColor = [];
    var diNormal = [];
    var diIndex = [];
    var chaIndex = [];
    var diColorDif = [];

    var diPosBuffer = [];
    var diColorBuffer = [];
    var diNorBuffer = [];
    var diIndexBuffer = [];
    var chaIndexBuffer = [];
    var diColorBufferDif = [];
    //-------------

    ///para los ejes
    var AxisPositionBuffer=[];
    var AxisColorBuffer= []; //es para el buffer de los enlaces
    var AxisColorDifBuffer = []; //buffer
    var AxisNormalBuffer=[];
    var AxisChainBuffer=[]; //para el buffer del indice de la cadena

    var AxisVertices = [];
    var Axiscolores=[];
    var AxiscolorDif =[]; //para el color diffuso, este se pone en 0
    var AxisNormals=[]; //para el arreglo de js de las normales
    var AxisChainIndex=[]; //para el arreglo en javascript del indice de la cadena 

    ///para la caja Box
    var BoxPositionBuffer=[];
    var BoxColorBuffer= []; //es para el buffer de los enlaces
    var BoxColorDifBuffer = []; //buffer
    var BoxNormalBuffer=[];
    var BoxChainBuffer=[]; //para el buffer del indice de la cadena

    var BoxVertices = [];
    var Boxcolores=[];
    var BoxcolorDif =[]; //para el color diffuso, este se pone en 0
    var BoxNormals=[]; //para el arreglo de js de las normales
    var BoxChainIndex=[]; //para el arreglo en javascript del indice de la cadena 

    /////////////////////////////////////////////////////////////////////////////////

    var NBSphe=0;
    var LstBSphe=[];


    var RegFrame=false;

    var DinamicaActiva=false;

    var DistanceBool = false; //se activa para en el picking mostrar la distancia de los átomos
    var AngleBool = false;

    var atomCenter = null //va a ser para centrarlo por atomo
    var Cxtemp = 0;
    var Cytemp = 0;
    var Cztemp = 0;

    function drawScene(diffuse)
    {

        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 1000.0, pMatrix);

        currentProgram = perFragmentProgram;
        gl.useProgram(currentProgram);

        gl.uniform1i(currentProgram.useLightingUniform, 1);
        gl.uniform3f(currentProgram.ambientColorUniform,LigthPWR,LigthPWR,LigthPWR);
        gl.uniform3f(currentProgram.pointLightingLocationUniform,0.0,0.0,0.0);
        gl.uniform3f(currentProgram.pointLightingColorUniform,0.8,0.8,0.8);

        mat4.identity(mvMatrix);

        mat4.translate(mvMatrix, [x, y, CameraPosition]);

        mat4.multiply(mvMatrix, RotationMatrix);
        //mat4.multiplyVec4(mvMatrix, vec, vecResul);  //matriz por vector = vector
        //mat4.multiplyVec4(pMatrix, vecResul, vecResul2);

        //console.log("mvMatrix:["+mvMatrix[0]+"]["+mvMatrix[1]+"]["+mvMatrix[2]+"]["+mvMatrix[3]+"]  ["+mvMatrix[4]+"]["+mvMatrix[5]+"]["+mvMatrix[6]+"]["+mvMatrix[7]+"]  ["+mvMatrix[8]+"]["+mvMatrix[9]+"]["+mvMatrix[10]+"]["+mvMatrix[11]+"]  ["+mvMatrix[12]+"]["+mvMatrix[13]+"]["+mvMatrix[14]+"]["+mvMatrix[15]+"]");

        //console.log("vecResul2:["+vecResul2[0]+"]["+vecResul2[1]+"]["+vecResul2[2]+"]["+vecResul2[3]+"]");

         //console.log("pMatrix:["+pMatrix[0]+"]["+pMatrix[1]+"]["+pMatrix[2]+"]["+pMatrix[3]+"]  ["+pMatrix[4]+"]["+pMatrix[5]+"]["+pMatrix[6]+"]["+pMatrix[7]+"]  ["+pMatrix[8]+"]["+pMatrix[9]+"]["+pMatrix[10]+"]["+pMatrix[11]+"]  ["+pMatrix[12]+"]["+pMatrix[13]+"]["+pMatrix[14]+"]["+pMatrix[15]+"]");

        if(trjbnd && autoplay) //trjbnd y autoplay están declaradas en el Main
        {
            var x1=0;
            var y1=0;
            var z1=0;
            //alert(coordsX);
            for(var i=0; i<molecule.LstAtoms.length;i++)
            {
                x1+=coordsX[i];
                y1+=coordsY[i];
                z1+=coordsZ[i];
            }
            Cx=x1/molecule.LstAtoms.length;
            Cy=y1/molecule.LstAtoms.length;
            Cz=z1/molecule.LstAtoms.length;

            if((pos*molecule.LstAtoms.length)==coordsX.length && bndbuffer==0)
            {
                bndbuffer=1;
                pos=0;
            }
            else if((pos*molecule.LstAtoms.length)==coordsX1.length && bndbuffer==1)
            {
                bndbuffer=0;
                pos=0;
            }
            //alert(molecule.LstAtoms.length);
            
            ChangeVertexPosition();

            //----------------------------------------  PARTE DE LOS ENLACES   ------------------------------------------------
            //alert(verticesLineas);
            verticesLineas = [];
            for (var i=0; i<molecule.LstBonds.length;i++)
            {
                var atm1 = molecule.LstBonds[i].LstAtoms[0];
                var atm2 = molecule.LstBonds[i].LstAtoms[1];

                var temp1 = molecule.LstAtoms.length*pos;
                var temp2 = molecule.LstAtoms.length*pos;

                //alert("entra");
                //alert("Atm1:"+temp1 + atm1.NumberAtom);
                //alert("Atm2:"+temp2 + atm2.NumberAtom);

                if ( temp1 <= coordsX.length )  //ESTÁ DENTRO DEL BUFFER1
                {
                    //alert(temp1);
                    //alert(atm1.NumberAtom);
                    //alert(parseInt(temp1) + parseInt(atm1.NumberAtom));
                    //alert(coordsX[parseInt(temp1) + parseInt(atm1.NumberAtom)]);
                    verticesLineas.push(coordsX[parseInt(temp1) + parseInt(atm1.id) -1] -Cx); /////////////////////////////77
                    verticesLineas.push(coordsY[parseInt(temp1) + parseInt(atm1.id) -1] -Cy);
                    verticesLineas.push(coordsZ[parseInt(temp1) + parseInt(atm1.id) -1] -Cz);

                }
                else
                {
                    verticesLineas.push(coordsX1[parseInt(temp1) + parseInt(atm1.id) -1] -Cx); /////////////////////////////77
                    verticesLineas.push(coordsY1[parseInt(temp1) + parseInt(atm1.id) -1] -Cy);
                    verticesLineas.push(coordsZ1[parseInt(temp1) + parseInt(atm1.id) -1] -Cz);

                }
                if ( temp2 <= coordsX.length )  //ESTÁ DENTRO DEL BUFFER1
                {
                    verticesLineas.push(coordsX[parseInt(temp2) + parseInt(atm2.id) -1] -Cx);
                    verticesLineas.push(coordsY[parseInt(temp2) + parseInt(atm2.id) -1] -Cy);
                    verticesLineas.push(coordsZ[parseInt(temp2) + parseInt(atm2.id) -1] -Cz);

                }
                else
                {
                    verticesLineas.push(coordsX1[parseInt(temp2) + parseInt(atm2.id) -1] -Cx);
                    verticesLineas.push(coordsY1[parseInt(temp2) + parseInt(atm2.id) -1] -Cy);
                    verticesLineas.push(coordsZ1[parseInt(temp2) + parseInt(atm2.id) -1] -Cz);
                }


            }

            if (molecule.LstBonds.length>0)
            {
                gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexPositionBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesLineas), gl.DYNAMIC_DRAW);
                lineVertexPositionBuffer.itemSize = 3;
                lineVertexPositionBuffer.numItems = verticesLineas.length/3;
                gl.bindBuffer(gl.ARRAY_BUFFER, null);

            }

            //----------------------------------------  PARTE DE LOS ENLACES SKELETON------------------------------------------------
            //alert(verticesLineas);
            verLineSkele = [];
            for (var i=0; i<molecule.LstBondsSkeleton.length;i++)
            {
                var atm1 = molecule.LstBondsSkeleton[i].LstAtoms[0];
                var atm2 = molecule.LstBondsSkeleton[i].LstAtoms[1];

                var temp1 = molecule.LstAtoms.length*pos;
                var temp2 = molecule.LstAtoms.length*pos;

                //alert("entra");
                //alert("Atm1:"+temp1 + atm1.NumberAtom);
                //alert("Atm2:"+temp2 + atm2.NumberAtom);

                if ( temp1 <= coordsX.length )  //ESTÁ DENTRO DEL BUFFER1
                {
                    //alert(temp1);
                    //alert(atm1.NumberAtom);
                    //alert(parseInt(temp1) + parseInt(atm1.NumberAtom));
                    //alert(coordsX[parseInt(temp1) + parseInt(atm1.NumberAtom)]);
                    verLineSkele.push(coordsX[parseInt(temp1) + parseInt(atm1.id) -1] -Cx);
                    verLineSkele.push(coordsY[parseInt(temp1) + parseInt(atm1.id) -1] -Cy);
                    verLineSkele.push(coordsZ[parseInt(temp1) + parseInt(atm1.id) -1] -Cz);

                }
                else
                {
                    verLineSkele.push(coordsX1[parseInt(temp1) + parseInt(atm1.id) -1] -Cx);
                    verLineSkele.push(coordsY1[parseInt(temp1) + parseInt(atm1.id) -1] -Cy);
                    verLineSkele.push(coordsZ1[parseInt(temp1) + parseInt(atm1.id) -1] -Cz);

                }
                if ( temp2 <= coordsX.length )  //ESTÁ DENTRO DEL BUFFER1
                {
                    verLineSkele.push(coordsX[parseInt(temp2) + parseInt(atm2.id) -1] -Cx);
                    verLineSkele.push(coordsY[parseInt(temp2) + parseInt(atm2.id) -1] -Cy);
                    verLineSkele.push(coordsZ[parseInt(temp2) + parseInt(atm2.id) -1] -Cz);

                }
                else
                {
                    verLineSkele.push(coordsX1[parseInt(temp2) + parseInt(atm2.id) -1] -Cx);
                    verLineSkele.push(coordsY1[parseInt(temp2) + parseInt(atm2.id) -1] -Cy);
                    verLineSkele.push(coordsZ1[parseInt(temp2) + parseInt(atm2.id) -1] -Cz);
                }


            }

            if (molecule.LstBondsSkeleton.length>0)
            {
                gl.bindBuffer(gl.ARRAY_BUFFER, lineSkeleVerPosBuf);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verLineSkele), gl.DYNAMIC_DRAW);
                lineSkeleVerPosBuf.itemSize = 3;
                lineSkeleVerPosBuf.numItems = verLineSkele.length/3;
                gl.bindBuffer(gl.ARRAY_BUFFER, null);

            }

            if(OptRep==true)//---------Julio  falta validar
            {
              cleanMemory();
              initBufferSpline();
            }
            //-----------------------

            //////////////// parte de las mediciones
            diPosition = [];
            diColor = [];
            diNormal = [];
            diIndex = [];
            chaIndex = [];
            diColorDif = [];

            indxOffset=0;
            if (DistanceBool)    //cada frame se van a limpiar y a procesar
            {
                var count = 2 * Math.floor(AtomosSeleccionados.length/2);
                for(var k=0; k < count;)
                {
                    var atm1 = AtomosSeleccionados[k];
                    var atm2 = AtomosSeleccionados[k+1];

                    var temp1 = molecule.LstAtoms.length*pos;

                    if ( temp1 <= coordsX.length )  //ESTÁ DENTRO DEL BUFFER1
                    {
                        xx = coordsX[parseInt(temp1) + parseInt(atm1.id) -1];
                        yy = coordsY[parseInt(temp1) + parseInt(atm1.id) -1];
                        zz = coordsZ[parseInt(temp1) + parseInt(atm1.id) -1];

                        xx2 = coordsX[parseInt(temp1) + parseInt(atm2.id) -1];
                        yy2 = coordsY[parseInt(temp1) + parseInt(atm2.id) -1];
                        zz2 = coordsZ[parseInt(temp1) + parseInt(atm2.id) -1];
                    }
                    else
                    {
                        xx = coordsX1[parseInt(temp1) + parseInt(atm1.id) -1];
                        yy = coordsY1[parseInt(temp1) + parseInt(atm1.id) -1];
                        zz = coordsZ1[parseInt(temp1) + parseInt(atm1.id) -1];

                        xx2 = coordsX1[parseInt(temp1) + parseInt(atm2.id) -1];
                        yy2 = coordsY1[parseInt(temp1) + parseInt(atm2.id) -1];
                        zz2 = coordsZ1[parseInt(temp1) + parseInt(atm2.id) -1];
                    }
                    NumDistance(xx,yy,zz,xx2,yy2,zz2);

                    k=k+2;
                }
                initBufDigit();
            }

            if(AngleBool)
            {
                var count = 3 * Math.floor(AtomosSeleccionados.length/3);
                for(var k=0; k < count;)
                {
                    var atm1 = AtomosSeleccionados[k];
                    var atm2 = AtomosSeleccionados[k+1];
                    var atm3 = AtomosSeleccionados[k+2];

                    var temp1 = molecule.LstAtoms.length*pos;

                    if ( temp1 <= coordsX.length )  //ESTÁ DENTRO DEL BUFFER1
                    {
                        xx = coordsX[parseInt(temp1) + parseInt(atm1.id) -1];
                        yy = coordsY[parseInt(temp1) + parseInt(atm1.id) -1];
                        zz = coordsZ[parseInt(temp1) + parseInt(atm1.id) -1];

                        xx2 = coordsX[parseInt(temp1) + parseInt(atm2.id) -1];
                        yy2 = coordsY[parseInt(temp1) + parseInt(atm2.id) -1];
                        zz2 = coordsZ[parseInt(temp1) + parseInt(atm2.id) -1];

                        xx3 = coordsX[parseInt(temp1) + parseInt(atm3.id) -1];
                        yy3 = coordsY[parseInt(temp1) + parseInt(atm3.id) -1];
                        zz3 = coordsZ[parseInt(temp1) + parseInt(atm3.id) -1];
                    }
                    else
                    {
                        xx = coordsX1[parseInt(temp1) + parseInt(atm1.id) -1];
                        yy = coordsY1[parseInt(temp1) + parseInt(atm1.id) -1];
                        zz = coordsZ1[parseInt(temp1) + parseInt(atm1.id) -1];

                        xx2 = coordsX1[parseInt(temp1) + parseInt(atm2.id) -1];
                        yy2 = coordsY1[parseInt(temp1) + parseInt(atm2.id) -1];
                        zz2 = coordsZ1[parseInt(temp1) + parseInt(atm2.id) -1];

                        xx3 = coordsX1[parseInt(temp1) + parseInt(atm3.id) -1];
                        yy3 = coordsY1[parseInt(temp1) + parseInt(atm3.id) -1];
                        zz3 = coordsZ1[parseInt(temp1) + parseInt(atm3.id) -1];
                    }
                    NumAngle(xx,yy,zz,xx2,yy2,zz2,xx3,yy3,zz3);

                    k=k+3;
                }
                initBufDigit();

            }

            framecounter(numframe+1);

            if(numframe<parseInt(totalframes)-1)
            {
                if (RegFrame==false)
                {
                    numframe++;
                    pos++;
                }

            }
            else
            {
                //console.log("segunda parte");
//                var button=document.getElementById("playpause");
//                button.className = "icon-logo-de-youtube";
//                button.value="Play";
                //agregado
//                autoplay=false;
//                totalframes=0;
//                bndfinal=false;
                numframe=0;
                pos=0;
                //console.log("segunda parte sale");
            }


            DrawSpheres();

            DrawBonds();

            DrawBondsSkele();

            DrawDigits();

            if(OptRep==true)//---------Julio falta validar cuando no hay ca
                DrawSpline();
       
            if (AxisBool) 
            {
                DrawAxis();
                DrawBox();
            }

        }

        else       ///////////////////////////////////////////////////////------sin dinámica------------------------///////////////////////////////////////
        {
                
            DrawSpheres();

            DrawBonds();

            DrawBondsSkele();

            DrawDigits();

            if (OptRep==true)///----Julio  Validar
                DrawSpline();

        }
            
        
        if (AxisBool) 
        {
            DrawAxis();
            DrawBox();
        }

    }
    //////////////////////////////////////////////////////////////////lineas SPLINE ----Julio

    function DrawSpline (){
            gl.bindBuffer(gl.ARRAY_BUFFER, colSplVerBuf);
            gl.vertexAttribPointer(currentProgram.textureCoordAttribute, colSplVerBuf.itemSize, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ARRAY_BUFFER, ColSplDifBuf);
            gl.vertexAttribPointer(currentProgram.ColorDif, ColSplDifBuf.itemSize, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ARRAY_BUFFER, ChainSplBufBnd);
            gl.vertexAttribPointer(currentProgram.Opcion, ChainSplBufBnd.itemSize, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ARRAY_BUFFER, lineSplNorBuf);
            gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            setMatrixUniforms();
            gl.bindBuffer(gl.ARRAY_BUFFER, lineSplVerPosBuf);
            gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, lineSplVerPosBuf.numItems);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
          }

    function DrawAxis ()
    {
            gl.bindBuffer(gl.ARRAY_BUFFER, AxisNormalBuffer);
            gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            gl.bindBuffer(gl.ARRAY_BUFFER, AxisColorBuffer);
            gl.vertexAttribPointer(currentProgram.textureCoordAttribute, AxisColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            gl.bindBuffer(gl.ARRAY_BUFFER, AxisColorDifBuffer);
            gl.vertexAttribPointer(currentProgram.ColorDif, AxisColorDifBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            gl.bindBuffer(gl.ARRAY_BUFFER, AxisChainBuffer);
            gl.vertexAttribPointer(currentProgram.Opcion, AxisChainBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            setMatrixUniforms();

            gl.bindBuffer(gl.ARRAY_BUFFER, AxisPositionBuffer);
            gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	    gl.drawArrays(gl.LINES, 0, AxisPositionBuffer.numItems);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    function DrawBox ()
    {
            gl.bindBuffer(gl.ARRAY_BUFFER, BoxNormalBuffer);
            gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            gl.bindBuffer(gl.ARRAY_BUFFER, BoxColorBuffer);
            gl.vertexAttribPointer(currentProgram.textureCoordAttribute, AxisColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            gl.bindBuffer(gl.ARRAY_BUFFER, BoxColorDifBuffer);
            gl.vertexAttribPointer(currentProgram.ColorDif, AxisColorDifBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            gl.bindBuffer(gl.ARRAY_BUFFER, BoxChainBuffer);
            gl.vertexAttribPointer(currentProgram.Opcion, AxisChainBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            setMatrixUniforms();

            gl.bindBuffer(gl.ARRAY_BUFFER, BoxPositionBuffer);
            gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	    gl.drawArrays(gl.LINES, 0, BoxPositionBuffer.numItems);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    function DrawSpheres()
    {
        for(var i=0; i<NBSphe; i++)
            {
                    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer[i]);
                    gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, sphereVertexPositionBuffer[i].itemSize, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);

                    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer[i]);
                    gl.vertexAttribPointer(currentProgram.textureCoordAttribute, sphereVertexColorBuffer[i].itemSize, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);

                    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBufferDiffuse[i]);
                    gl.vertexAttribPointer(currentProgram.ColorDif, sphereVertexColorBufferDiffuse[i].itemSize, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);

                    gl.bindBuffer(gl.ARRAY_BUFFER, ChainBuffer[i]);
                    gl.vertexAttribPointer(currentProgram.Opcion, ChainBuffer[i].itemSize, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);


                    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer[i]);
                    gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, sphereVertexNormalBuffer[i].itemSize, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);
                    setMatrixUniforms();

                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer[i]);
                    gl.drawElements(gl.TRIANGLES, sphereVertexIndexBuffer[i].numItems, gl.UNSIGNED_SHORT, 0);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

            }
    }

    function DrawBonds()
    {
       if (molecule.LstBonds.length>0) 
                {
                    gl.bindBuffer(gl.ARRAY_BUFFER, colorVertexBuffer);
                    gl.vertexAttribPointer(currentProgram.textureCoordAttribute, colorVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);
                    gl.bindBuffer(gl.ARRAY_BUFFER, ColorDifBuffer);
                    gl.vertexAttribPointer(currentProgram.ColorDif, ColorDifBuffer.itemSize, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);
                    gl.bindBuffer(gl.ARRAY_BUFFER, ChainBufferBnd);
                    gl.vertexAttribPointer(currentProgram.Opcion, ChainBufferBnd.itemSize, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);
                    gl.bindBuffer(gl.ARRAY_BUFFER, lineNormalBuffer);
                    gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);
                    setMatrixUniforms();
                    gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexPositionBuffer);
                    gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
                    gl.lineWidth(LineW);
                    gl.drawArrays(gl.LINES, 0, lineVertexPositionBuffer.numItems);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);
                }
    }

    function DrawBondsSkele()
    {
        if (molecule.LstBondsSkeleton.length>0) 
                {
                    gl.bindBuffer(gl.ARRAY_BUFFER, colSkeleVerBuf);
                    gl.vertexAttribPointer(currentProgram.textureCoordAttribute, colSkeleVerBuf.itemSize, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);
                    gl.bindBuffer(gl.ARRAY_BUFFER, ColSkeleDifBuf);
                    gl.vertexAttribPointer(currentProgram.ColorDif, ColSkeleDifBuf.itemSize, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);
                    gl.bindBuffer(gl.ARRAY_BUFFER, ChainSkeleBufBnd);
                    gl.vertexAttribPointer(currentProgram.Opcion, ChainSkeleBufBnd.itemSize, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);
                    gl.bindBuffer(gl.ARRAY_BUFFER, lineSkeleNorBuf);
                    gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);
                    setMatrixUniforms();
                    gl.bindBuffer(gl.ARRAY_BUFFER, lineSkeleVerPosBuf);
                    gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
                    gl.drawArrays(gl.LINES, 0, lineSkeleVerPosBuf.numItems);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);
                }
    }

    function DrawDigits()
    {
                ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                ///////////////////////////// PARTE DE LOS DÍGITOS ////////////////////////////////////////////////7
                if (diPosition.length>0)
                {
                    gl.bindBuffer(gl.ARRAY_BUFFER, diPosBuffer);
                    gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, diPosBuffer.itemSize, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);

                    gl.bindBuffer(gl.ARRAY_BUFFER, diColorBuffer);
                    gl.vertexAttribPointer(currentProgram.textureCoordAttribute, diColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);

                    gl.bindBuffer(gl.ARRAY_BUFFER, diColorBufferDif);
                    gl.vertexAttribPointer(currentProgram.ColorDif, diColorBufferDif.itemSize, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);

                    gl.bindBuffer(gl.ARRAY_BUFFER, chaIndexBuffer);
                    gl.vertexAttribPointer(currentProgram.Opcion, chaIndexBuffer.itemSize, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);

                    gl.bindBuffer(gl.ARRAY_BUFFER, diNorBuffer);
                    gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, diNorBuffer.itemSize, gl.FLOAT, false, 0, 0);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);
                    setMatrixUniforms();

                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, diIndexBuffer);
                    gl.drawElements(gl.TRIANGLES, diIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

                }


    }

     function framecounter(frame)
            {
                //if(bndknowframe==true)
                //{
                //    totalframes=sizeglob/molecule.LstAtoms.length;
                //    data.innerHTML="frame " + (frame) + "(" + parseInt((frame*100)/totalframes1) +  "%) of " + parseInt(totalframes1);
                //}
                //else
                //{
                //    totalframes=sizeglob/molecule.LstAtoms.length;
                //    data.innerHTML="frame " + (frame) + " of " + parseInt(totalframes);
                //}
		    
		totalframes=sizeglob/molecule.LstAtoms.length;
		var percentage=parseInt((frame*100)/totalframes);
		var md_time=0;
  	        md_time=(frame*nstxtcout*md_dt)+tinit;
		//data.innerHTML="frame " + (frame) + "(" + parseInt((frame*100)/totalframes) +  "%) of " + parseInt(totalframes);
		data.innerHTML=(frame) + "<progress value='"+percentage+"' max='100'></progress>"+percentage+"% ("+md_time+" ps)";
            }


    function tick() {
        requestAnimationFrame(tick);

            drawScene(0);


    }


    function zoomin() {
        return function (event){
	//console.log("zoomin CameraPosition: "+CameraPosition)
        CameraPosition=CameraPosition-ZoomMotion;
        y=y-.1;
        drawScene(0);
        }
    }

    function ZoomView(mag) {
	//console.log("zoomin CameraPosition: "+CameraPosition+" "+mag)
        CameraPosition=CameraPosition+(ZoomMotion*(-1)*mag);
        y=y+(0.1*(-1)*mag);
        drawScene(0);
    }

    function zoomout() {
        return function (event){
        CameraPosition=CameraPosition+ZoomMotion;
        y=y+.1;
        drawScene(0);
        }
    }


    function PauseTraj()
    {
        return function (event)
        {
            var button=document.getElementById("playpause");
            var reg=document.getElementById("Rew");
            var forw=document.getElementById("Forw");
            //alert("autoplay:"+autoplay + " trjbnd:"+trjbnd);


            if(!autoplay)
            {
                //alert(trjbnd);
                autoplay=true;
                button.value="Pause";
                button.className = "icon-boton-de-pausa";
                reg.style.display="none";
                RegFrame=false;

            }
            else
            {
                trjbnd = !trjbnd;

                if (trjbnd)
                {
                    //alert("Pause");
                    button.value="Pause";
                    button.className = "icon-boton-de-pausa";
                    reg.style.display="none";
                    forw.style.display="none";
                    RegFrame=false;

                }
                else
                {
                    //alert("Play");
                    button.value="Play";
                    button.className = "icon-logo-de-youtube";
                    reg.style.display="inline";
                    forw.style.display="inline";
                    pos--;
                    numframe--;
                }
            }
        }
    }

    
function RewFor(op) {
    return function(event) {
        if (op == 1) {
            if (pos > 0) {
                pos--;
                numframe--;
            }

        } else {
            if (numframe < parseInt(totalframes) - 1) {
                pos++;
                numframe++;
            }
        }

        //alert(coordsX);
        if ((pos * molecule.LstAtoms.length) == coordsX.length && bndbuffer == 0) {
            bndbuffer = 1;
            pos = 0;
        } else if ((pos * molecule.LstAtoms.length) == coordsX1.length && bndbuffer == 1) {
            bndbuffer = 0;
            pos = 0;
        }
        //alert(molecule.LstAtoms.length);

        ChangeVertexPosition();

        //----------------------------------------  PARTE DE LOS ENLACES   ------------------------------------------------
        //alert(verticesLineas);
        verticesLineas = [];
        for (var i = 0; i < molecule.LstBonds.length; i++) {
            var atm1 = molecule.LstBonds[i].LstAtoms[0];
            var atm2 = molecule.LstBonds[i].LstAtoms[1];

            var temp1 = molecule.LstAtoms.length * pos;
            var temp2 = molecule.LstAtoms.length * pos;

            //alert("entra");
            //alert("Atm1:"+temp1 + atm1.NumberAtom);
            //alert("Atm2:"+temp2 + atm2.NumberAtom);

            if (temp1 <= coordsX.length) //ESTÁ DENTRO DEL BUFFER1
            {
                //alert(temp1);
                //alert(atm1.NumberAtom);
                //alert(parseInt(temp1) + parseInt(atm1.NumberAtom));
                //alert(coordsX[parseInt(temp1) + parseInt(atm1.NumberAtom)]);
                verticesLineas.push(coordsX[parseInt(temp1) + parseInt(atm1.id) - 1] - Cx);
                verticesLineas.push(coordsY[parseInt(temp1) + parseInt(atm1.id) - 1] - Cy);
                verticesLineas.push(coordsZ[parseInt(temp1) + parseInt(atm1.id) - 1] - Cz);

            } else {
                verticesLineas.push(coordsX1[parseInt(temp1) + parseInt(atm1.id) - 1] - Cx);
                verticesLineas.push(coordsY1[parseInt(temp1) + parseInt(atm1.id) - 1] - Cy);
                verticesLineas.push(coordsZ1[parseInt(temp1) + parseInt(atm1.id) - 1] - Cz);

            }
            if (temp2 <= coordsX.length) //ESTÁ DENTRO DEL BUFFER1
            {
                verticesLineas.push(coordsX[parseInt(temp2) + parseInt(atm2.id) - 1] - Cx);
                verticesLineas.push(coordsY[parseInt(temp2) + parseInt(atm2.id) - 1] - Cy);
                verticesLineas.push(coordsZ[parseInt(temp2) + parseInt(atm2.id) - 1] - Cz);

            } else {
                verticesLineas.push(coordsX1[parseInt(temp2) + parseInt(atm2.id) - 1] - Cx);
                verticesLineas.push(coordsY1[parseInt(temp2) + parseInt(atm2.id) - 1] - Cy);
                verticesLineas.push(coordsZ1[parseInt(temp2) + parseInt(atm2.id) - 1] - Cz);
            }


        }

        gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesLineas), gl.DYNAMIC_DRAW);
        lineVertexPositionBuffer.itemSize = 3;
        lineVertexPositionBuffer.numItems = verticesLineas.length / 3;
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        //----------------------------------------  PARTE DE LOS ENLACES SKELETON------------------------------------------------
        //alert(verticesLineas);
        verLineSkele = [];
        for (var i = 0; i < molecule.LstBondsSkeleton.length; i++) {
            var atm1 = molecule.LstBondsSkeleton[i].LstAtoms[0];
            var atm2 = molecule.LstBondsSkeleton[i].LstAtoms[1];

            var temp1 = molecule.LstAtoms.length * pos;
            var temp2 = molecule.LstAtoms.length * pos;

            //alert("entra");
            //alert("Atm1:"+temp1 + atm1.NumberAtom);
            //alert("Atm2:"+temp2 + atm2.NumberAtom);

            if (temp1 <= coordsX.length) //ESTÁ DENTRO DEL BUFFER1
            {
                //alert(temp1);
                //alert(atm1.NumberAtom);
                //alert(parseInt(temp1) + parseInt(atm1.NumberAtom));
                //alert(coordsX[parseInt(temp1) + parseInt(atm1.NumberAtom)]);
                verLineSkele.push(coordsX[parseInt(temp1) + parseInt(atm1.id) - 1] - Cx);
                verLineSkele.push(coordsY[parseInt(temp1) + parseInt(atm1.id) - 1] - Cy);
                verLineSkele.push(coordsZ[parseInt(temp1) + parseInt(atm1.id) - 1] - Cz);

            } else {
                verLineSkele.push(coordsX1[parseInt(temp1) + parseInt(atm1.id) - 1] - Cx);
                verLineSkele.push(coordsY1[parseInt(temp1) + parseInt(atm1.id) - 1] - Cy);
                verLineSkele.push(coordsZ1[parseInt(temp1) + parseInt(atm1.id) - 1] - Cz);

            }
            if (temp2 <= coordsX.length) //ESTÁ DENTRO DEL BUFFER1
            {
                verLineSkele.push(coordsX[parseInt(temp2) + parseInt(atm2.id) - 1] - Cx);
                verLineSkele.push(coordsY[parseInt(temp2) + parseInt(atm2.id) - 1] - Cy);
                verLineSkele.push(coordsZ[parseInt(temp2) + parseInt(atm2.id) - 1] - Cz);

            } else {
                verLineSkele.push(coordsX1[parseInt(temp2) + parseInt(atm2.id) - 1] - Cx);
                verLineSkele.push(coordsY1[parseInt(temp2) + parseInt(atm2.id) - 1] - Cy);
                verLineSkele.push(coordsZ1[parseInt(temp2) + parseInt(atm2.id) - 1] - Cz);
            }


        }

        gl.bindBuffer(gl.ARRAY_BUFFER, lineSkeleVerPosBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verLineSkele), gl.DYNAMIC_DRAW);
        lineSkeleVerPosBuf.itemSize = 3;
        lineSkeleVerPosBuf.numItems = verLineSkele.length / 3;
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        if (OptRep == true) ////---Julio
        {
            cleanMemory();
            initBufferSpline();
        }
        //-----------Julio


        //////////////// parte de las mediciones
        diPosition = [];
        diColor = [];
        diNormal = [];
        diIndex = [];
        chaIndex = [];
        diColorDif = [];

        indxOffset = 0;
        if (DistanceBool) //cada frame se van a limpiar y a procesar
        {
            var count = 2 * Math.floor(AtomosSeleccionados.length / 2);
            for (var k = 0; k < count;) {
                var atm1 = AtomosSeleccionados[k];
                var atm2 = AtomosSeleccionados[k + 1];

                var temp1 = molecule.LstAtoms.length * pos;

                if (temp1 <= coordsX.length) //ESTÁ DENTRO DEL BUFFER1
                {
                    xx = coordsX[parseInt(temp1) + parseInt(atm1.id) - 1];
                    yy = coordsY[parseInt(temp1) + parseInt(atm1.id) - 1];
                    zz = coordsZ[parseInt(temp1) + parseInt(atm1.id) - 1];

                    xx2 = coordsX[parseInt(temp1) + parseInt(atm2.id) - 1];
                    yy2 = coordsY[parseInt(temp1) + parseInt(atm2.id) - 1];
                    zz2 = coordsZ[parseInt(temp1) + parseInt(atm2.id) - 1];
                } else {
                    xx = coordsX1[parseInt(temp1) + parseInt(atm1.id) - 1];
                    yy = coordsY1[parseInt(temp1) + parseInt(atm1.id) - 1];
                    zz = coordsZ1[parseInt(temp1) + parseInt(atm1.id) - 1];

                    xx2 = coordsX1[parseInt(temp1) + parseInt(atm2.id) - 1];
                    yy2 = coordsY1[parseInt(temp1) + parseInt(atm2.id) - 1];
                    zz2 = coordsZ1[parseInt(temp1) + parseInt(atm2.id) - 1];
                }
                NumDistance(xx, yy, zz, xx2, yy2, zz2);

                k = k + 2;
            }
            initBufDigit();
        }

        if (AngleBool) {
            var count = 3 * Math.floor(AtomosSeleccionados.length / 3);
            for (var k = 0; k < count;) {
                var atm1 = AtomosSeleccionados[k];
                var atm2 = AtomosSeleccionados[k + 1];
                var atm3 = AtomosSeleccionados[k + 2];

                var temp1 = molecule.LstAtoms.length * pos;

                if (temp1 <= coordsX.length) //ESTÁ DENTRO DEL BUFFER1
                {
                    xx = coordsX[parseInt(temp1) + parseInt(atm1.id) - 1];
                    yy = coordsY[parseInt(temp1) + parseInt(atm1.id) - 1];
                    zz = coordsZ[parseInt(temp1) + parseInt(atm1.id) - 1];

                    xx2 = coordsX[parseInt(temp1) + parseInt(atm2.id) - 1];
                    yy2 = coordsY[parseInt(temp1) + parseInt(atm2.id) - 1];
                    zz2 = coordsZ[parseInt(temp1) + parseInt(atm2.id) - 1];

                    xx3 = coordsX[parseInt(temp1) + parseInt(atm3.id) - 1];
                    yy3 = coordsY[parseInt(temp1) + parseInt(atm3.id) - 1];
                    zz3 = coordsZ[parseInt(temp1) + parseInt(atm3.id) - 1];
                } else {
                    xx = coordsX1[parseInt(temp1) + parseInt(atm1.id) - 1];
                    yy = coordsY1[parseInt(temp1) + parseInt(atm1.id) - 1];
                    zz = coordsZ1[parseInt(temp1) + parseInt(atm1.id) - 1];

                    xx2 = coordsX1[parseInt(temp1) + parseInt(atm2.id) - 1];
                    yy2 = coordsY1[parseInt(temp1) + parseInt(atm2.id) - 1];
                    zz2 = coordsZ1[parseInt(temp1) + parseInt(atm2.id) - 1];

                    xx3 = coordsX1[parseInt(temp1) + parseInt(atm3.id) - 1];
                    yy3 = coordsY1[parseInt(temp1) + parseInt(atm3.id) - 1];
                    zz3 = coordsZ1[parseInt(temp1) + parseInt(atm3.id) - 1];
                }
                NumAngle(xx, yy, zz, xx2, yy2, zz2, xx3, yy3, zz3);

                k = k + 3;
            }
            initBufDigit();

        }

        framecounter(numframe + 1);


        DrawSpheres();

        DrawBonds();


        DrawBondsSkele();

        DrawDigits();

        if (OptRep == true) //---------Julio falta validar cuando no hay ca
            DrawSpline();


        if (AxisBool)

        {
            DrawAxis();
            DrawBox();
        }

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        if (OptRep == true) //---------Julio falta validar cuando no hay ca
            DrawSpline();
        //--------------------

    }

}


    function webGLStart() {
        var canvas = document.getElementById("canvas");
        canvas.width=window.innerWidth;
        canvas.height=window.innerHeight;
        initGL(canvas);
        initShaders();
        initPlantillaEsfera();
        if (RepresentacionInicial=='SpheresBonds')
        {
            InitBufSB();
        }
        else if(RepresentacionInicial=='Bonds')
        {
            InitBufBonds();
        }
        else if(RepresentacionInicial=='VDW')
        {
            InitBufVDW();
        }
        initBufDigit();
        initBuffAxis();
        initBuffBox();

        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        gl.clearDepth(1.0);

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        canvas.onmousedown = handleMouseDown;
        document.onmouseup = handleMouseUp;
        document.onmousemove = handleMouseMove;

        var data=document.getElementById('zoom');
        var button;

        button = document.createElement( 'button' );
        button.value = '';
        button.className = "icon-logo-de-youtube";
        button.type="button";
        button.style.fontSize = "15px";
        button.id="playpause";
        button.onclick=PauseTraj();
	button.style.display="none";
        controles.appendChild( button );


       button = document.createElement( 'button' );
       button.value = 'retroceder';
       button.className = "icon-paso-atras";
       button.type="button";
       button.style.fontSize = "15px";
       button.id="Rew";
	    button.style.display="none";
       button.onclick=RewFor(1);
       controles.appendChild( button );

       button = document.createElement( 'button' );
       button.value = '';
       button.className = "icon-paso-de-avance";
       button.type="button";
       button.style.fontSize = "15px";
	    button.style.display="none";
       button.id="Forw";
       button.onclick=RewFor(2);
       controles.appendChild( button );


       button = document.createElement( 'button' );
       button.value = '';
       button.className = "icon-zoom";
       button.id='mas';
       button.type="button";
       button.style.fontSize = "15px";
       button.onclick=zoomin();
       zoom.appendChild( button );

       button = document.createElement( 'button' );
       button.value = '';
       button.className = "icon-alejar";
       button.id='menos';
       button.type="button";
       button.style.fontSize = "15px";
       button.onclick=zoomout();
       zoom.appendChild( button );
       document.getElementById("Console_input").focus();
/**/ 
       var modal= document.getElementById('myModal');
       var span= document.getElementsByClassName('close')[0];

       document.getElementById('MDTitle').innerHTML=""+MDTitle+"";
       document.getElementById('MDdescription').innerHTML=" "+MDdescription+" <center><a href='http://htmol.tripplab.com' target='_blank'>HTMoL</a></center>";
//       document.getElementById('downloadPDB').innerHTML="<H2>"+pdbInicial+"</H2> <a color='black' href='http://"+WebIP+"/HTMoLv3.5/pdbfiles/"+pdbInicial+"' download><img src='http://"+WebIP+"/HTMoLv3.5/images/descargar.png' width='104' height='104' border='0'></a>";
//       document.getElementById('downloadXTC').innerHTML= "<H2>"+trjInicial+"</H2> <a color='black' href='http://"+WebIP+"/HTMoLv3.5/trjfiles/"+trjInicial+"' download><img src='http://"+WebIP+"/HTMoLv3.5/images/descargar.png' width='104' height='104' border='0'></a>";
       
       var button = document.createElement( 'button' );
       button.value = 'Info';
      // button.className = "icon-dowload";
       button.type="button"
       button.id="MDInfo";
       button.innerHTML="MD";
       button.onclick=function(){
        modal.style.display="block";
       }
       controles.appendChild( button );

       span.onclick=function(){
            modal.style.display="none";
       }

       window.onclick=function(event){
            if(event.target == modal)
            {
                modal.style.display="none"
            }
       }
 /**/
       
        tick();
        InitBufRepreDefault(commandsDefault);
	main.loadTrjByScene();
    }




        var nav = navigator.userAgent.toLowerCase();
	    console.log("HTMoL3: Estas visitandome desde "+navigator.userAgent);
        if(nav.indexOf("msie") != -1){
        console.log("HTMoL3: Estas visitandome desde IE");
    } else if(nav.indexOf("firefox") != -1){
        console.log("HTMoL3: Estas visitandome desde Firefox");
    } else if(nav.indexOf("opera") != -1){
        console.log("HTMoL3: Estas visitandome desde Opera");
    } else if(nav.indexOf("chrome") != -1){
        console.log("HTMoL3: Estas visitandome desde Chrome");
    } else {
        console.log("HTMoL3: Web Browser unknown");
    }


    function manejadorEventoWorker1(event)
    {
        if(event.data.cmd=="enviar")
        {
            var anter=sizeglob;
            var datanter;
            sizeglob+=event.data.dato.length;
            if(event.data.bndarray)
            {
                var anter1=sizearrayp;
                sizearrayp+=event.data.dato.length;
                datanter=coordsX;
                coordsX = new Float32Array(sizearrayp);
                coordsX.set(datanter,0);
                coordsX.set(event.data.dato,anter1);
                datanter=coordsY;
                coordsY = new Float32Array(sizearrayp);
                coordsY.set(datanter,0);
                coordsY.set(event.data.dato1,anter1);
                datanter=coordsZ;
                coordsZ = new Float32Array(sizearrayp);
                coordsZ.set(datanter,0);
                coordsZ.set(event.data.dato2,anter1);
            }
            else
            {
                var anter1=sizearrayp;
                sizearrayp+=event.data.dato.length;
                datanter=coordsX1;
                coordsX1 = new Float32Array(sizearrayp);
                coordsX1.set(datanter,0);
                coordsX1.set(event.data.dato,anter1);
                datanter=coordsY1;
                coordsY1 = new Float32Array(sizearrayp);
                coordsY1.set(datanter,0);
                coordsY1.set(event.data.dato1,anter1);
                datanter=coordsZ1;
                coordsZ1 = new Float32Array(sizearrayp);
                coordsZ1.set(datanter,0);
                coordsZ1.set(event.data.dato2,anter1);
            }
        }
        else if(event.data.cmd=="endfinal")
        {
			bndfinal=true;
            data.innerHTML="Trajectory read succesfully! ";
            info.innerHTML=info.innerHTML+" "+molecule.TrjPath+" ("+sizeglob/molecule.LstAtoms.length+" frames)";
            //info.innerHTML=info.innerHTML+" "+sizeglob/molecule.LstAtoms.length+" frames";
	    }
        else
        {
            requireddata=true;
            readstart=readend-event.data.wast;
            readend=readstart+mxSize;
        }

    }
    function consola() {
          var panel = document.getElementById("Console");
          var panel1 = document.getElementById("console_title");
          var panel2 = document.getElementById("label1");
          var panel3 = document.getElementById("console_inputdiv");
          var panel4 = document.getElementById("Console_input");
          var panel5 = document.getElementById("outputdiv");
          var panel6 = document.getElementById("Console_output");
          if (panel.style.opacity == 1) {
            var maxL1 = "0";
            var maxT1 = "700px";
            panel.style.opacity = 0;
            panel.style.left=maxL1;
            panel.style.top=maxT1;
            panel3.style.height = 0;
            panel3.style.width=0;
            panel4.style.height = 0;
            panel4.style.width=0;
            panel5.style.height = 0;
            panel5.style.width=0;
            panel6.style.height = 0;
            panel4.style.width=0;

    } else  {
            var maxL2 = "50px";
            var maxT2 = "300px";
            panel.style.left=maxL2;
            panel.style.top=maxT2;
            panel.style.opacity = 1;
            var maxH1 = "110px";
            var maxH2 = "80px";
            var maxw1 = "245px";
            var maxw2="220px";
            panel3.style.height=maxH1;
            panel3.style.width=maxw1;
            panel4.style.height=maxH2;
            panel4.style.width=maxw2;
            panel5.style.height=maxH1;
            panel5.style.width=maxw1;
            panel6.style.height=maxH2;
            panel6.style.width=maxw2;
          }

    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
