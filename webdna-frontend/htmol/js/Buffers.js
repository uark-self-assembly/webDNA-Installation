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

var AtomArray=[];

function cleanMemory()
{
    LstBSphe=[];
    NBSphe=0;

    //Limpieza de las esferas
    vertexPositionData = [[]];
    ColorTotal = [[]];
    indexData = [[]];
    normalDataN = [[]];
    ChainIndex=[[]];

    indiceOffset=0;
    ////////////////////////

    //limpieza de los enlaces
    verticesLineas = [];
    colores=[];
    colorBndDif =[];
    linesNormals=[];
    ChainIndexBnd=[];

    //limpieza de los enlaces Skeleton
    verLineSkele = [];
    coloresSkele=[];
    colorSkeleBndDif =[];
    lineSkeleNor=[];
    ChainSkeleIndexBnd=[];

    //-------------------Julio
    //limpieza de los enlaces Spline
      verLineSpl = [];
      coloresSpl = [];
      colorSplBndDif = [];
      lineSplNor = [];
      ChainSplIndexBnd = [];
      //------Julio

      //////////////// parte de las mediciones
            diPosition = [];
            diColor = [];
            diNormal = [];
            diIndex = [];
            chaIndex = [];
            diColorDif = [];

            DistanceBool=false;
            AngleBool=false;

            indxOffset=0;
}

function initBuffersSpheresSB()
{
    var atmX= null;
    var atmY= null;
    var atmZ= null;
    var NoAtomos = molecule.LstAtoms.length;
    NoBloques = Math.ceil(NoAtomos/NoPaso);
    var Restantes = NoAtomos - ((NoBloques-1) * NoPaso);

    var ultimo=0;

    var apuntador = 0;

    if (NoBloques==1)
    {

        LstBSphe[0]=new Array();
        for(var i=0; i<NoAtomos; i++)
        {
            //-----------------------------------------------------------------------------------------

            molecule.LstAtoms[apuntador].BloqueSolid=1;
            molecule.LstAtoms[apuntador].PositionBSolid=i+1;

            LstBSphe[0].push(molecule.LstAtoms[apuntador]);
            //-----------------------------------------------------------------------------------------
            if (DinamicaActiva)  //////////*********** checar instrucción
            {
                var s=molecule.LstAtoms.length*pos+apuntador;
                //entonces toman las posiciones x y z del frame en el que se encuentra
                if(bndbuffer==0)
                {
                    atmX=coordsX[s];
                    atmY=coordsY[s];
                    atmZ=coordsZ[s];
                }
                else
                {
                    atmX=coordsX1[s];
                    atmY=coordsY1[s];
                    atmZ=coordsZ1[s];
                }
            }
            else
            {
                atmX=molecule.LstAtoms[apuntador].X;
                atmY=molecule.LstAtoms[apuntador].Y;
                atmZ=molecule.LstAtoms[apuntador].Z;
            }
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            molecule.LstAtoms[apuntador].Representation="SB";
            for (var z=0; z<verArray.length;)
            {
                vertexPositionData[0].push(verArray[z]   + atmX -Cx);
                vertexPositionData[0].push(verArray[z+1] + atmY -Cy);
                vertexPositionData[0].push(verArray[z+2] + atmZ -Cz);

                normalDataN[0].push(normalData[z]);
                normalDataN[0].push(normalData[z+1]);
                normalDataN[0].push(normalData[z+2]);

                z=z+3;


                ColorTotal[0].push(molecule.LstAtoms[apuntador].ColorRGB[0]);
                ColorTotal[0].push(molecule.LstAtoms[apuntador].ColorRGB[1]);
                ColorTotal[0].push(molecule.LstAtoms[apuntador].ColorRGB[2]);
                ColorTotal[0].push(1);

                ColorTotalDiffuse[0].push(molecule.LstAtoms[apuntador].ColorRGBDiffuse[0]);
                ColorTotalDiffuse[0].push(molecule.LstAtoms[apuntador].ColorRGBDiffuse[1]);
                ColorTotalDiffuse[0].push(molecule.LstAtoms[apuntador].ColorRGBDiffuse[2]);
                ColorTotalDiffuse[0].push(1);

                ChainIndex[0].push(molecule.LstAtoms[apuntador].idChain);
                ChainIndex[0].push(molecule.LstAtoms[apuntador].idChain);


            }

            for(var t=0; t<indx.length; t++)
            {
                indexData[0].push( indx[t] + indiceOffset);

            }
            indiceOffset= indiceOffset + indexOff;

            apuntador=apuntador+1;

                //-----------------------------------------------------------------------------------------------------
        }

        ///////////////////////////////////////// COLORES REALES ///////////////////////////////////////////////

        sphereVertexPositionBuffer[0] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer[0]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData[0]), gl.DYNAMIC_DRAW);
        sphereVertexPositionBuffer[0].itemSize = 3;
        sphereVertexPositionBuffer[0].numItems = vertexPositionData[0].length / 3;
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        //alert("vertices: "+ vertexPositionData[0].length);

        sphereVertexColorBuffer[0] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer[0]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorTotal[0]), gl.DYNAMIC_DRAW);
        sphereVertexColorBuffer[0].itemSize = 4;
        sphereVertexColorBuffer[0].numItems = ColorTotal[0].length/4;
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        //alert("ColorTotal: "+ ColorTotal[0].length);

        ChainBuffer[0] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, ChainBuffer[0]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ChainIndex[0]), gl.DYNAMIC_DRAW);
        ChainBuffer[0].itemSize = 2;
        ChainBuffer[0].numItems = ChainIndex[0].length/2;
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        sphereVertexIndexBuffer[0] = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer[0]);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData[0]), gl.DYNAMIC_DRAW);
        sphereVertexIndexBuffer[0].itemSize = 1;
        sphereVertexIndexBuffer[0].numItems = indexData[0].length;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        //alert("indices: "+indexData[0].length);

        sphereVertexNormalBuffer[0] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer[0]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalDataN[0]), gl.DYNAMIC_DRAW);
        sphereVertexNormalBuffer[0].itemSize = 3;
        sphereVertexNormalBuffer[0].numItems = normalDataN[0].length / 3;
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        ////////////////////////////////////////// COLORES DIFFUSOS ///////////////////////////////////////////////

        sphereVertexColorBufferDiffuse[0] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBufferDiffuse[0]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorTotalDiffuse[0]), gl.DYNAMIC_DRAW);
        sphereVertexColorBufferDiffuse[0].itemSize = 4;
        sphereVertexColorBufferDiffuse[0].numItems = ColorTotalDiffuse[0].length/4;
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        //alert("ColorDiffuse: "+ColorTotalDiffuse[0].length);
        //////////////////////////////////////////////////////////////////////////////////////////////////

    }
    else
    {
        for(var i=0; i<NoBloques; i++)
        {

            ultimo=0;
            vertexPositionData[i]=new Array();
            normalDataN[i]=new Array();
            ColorTotal[i]=new Array();
            indexData[i]=new Array();
            ColorTotalDiffuse[i]=new Array();

            LstBSphe[i]=new Array();

            ChainIndex[i]=new Array();

            indiceOffset=0;

            if (i==NoBloques-1) //esto es que llegó al último
            {
                for(var j=0; j<Restantes; j++)
                {

                    molecule.LstAtoms[apuntador].BloqueSolid=i+1;
                    molecule.LstAtoms[apuntador].PositionBSolid=j+1;
                    molecule.LstAtoms[apuntador].Representation="SB";
                    LstBSphe[i].push(molecule.LstAtoms[apuntador]);
                    //-----------------------------------------------------------------------------------------
                    if (DinamicaActiva)  //////////*********** checar instrucción
                    {
                        var s=molecule.LstAtoms.length*pos+apuntador;
                        //entonces toman las posiciones x y z del frame en el que se encuentra
                        if(bndbuffer==0)
                        {
                            atmX=coordsX[s];
                            atmY=coordsY[s];
                            atmZ=coordsZ[s];
                        }
                        else
                        {
                            atmX=coordsX1[s];
                            atmY=coordsY1[s];
                            atmZ=coordsZ1[s];
                        }
                    }
                    else
                    {
                        atmX=molecule.LstAtoms[apuntador].X;
                        atmY=molecule.LstAtoms[apuntador].Y;
                        atmZ=molecule.LstAtoms[apuntador].Z;
                    }
                    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                    for (var z=0; z<verArray.length;)
                    {
                        vertexPositionData[i].push(verArray[z]   + atmX -Cx);
                        vertexPositionData[i].push(verArray[z+1] + atmY -Cy);
                        vertexPositionData[i].push(verArray[z+2] + atmZ -Cz);

                        normalDataN[i].push(normalData[z]);
                        normalDataN[i].push(normalData[z+1]);
                        normalDataN[i].push(normalData[z+2]);

                        z=z+3;

                        ColorTotal[i].push(molecule.LstAtoms[apuntador].ColorRGB[0]);
                        ColorTotal[i].push(molecule.LstAtoms[apuntador].ColorRGB[1]);
                        ColorTotal[i].push(molecule.LstAtoms[apuntador].ColorRGB[2]);
                        ColorTotal[i].push(1);

                        ColorTotalDiffuse[i].push(molecule.LstAtoms[apuntador].ColorRGBDiffuse[0]);
                        ColorTotalDiffuse[i].push(molecule.LstAtoms[apuntador].ColorRGBDiffuse[1]);
                        ColorTotalDiffuse[i].push(molecule.LstAtoms[apuntador].ColorRGBDiffuse[2]);
                        ColorTotalDiffuse[i].push(1);

                        ChainIndex[i].push(molecule.LstAtoms[apuntador].idChain);
                        ChainIndex[i].push(molecule.LstAtoms[apuntador].idChain);

                        //ColorDiffuse=ColorDiffuse.concat(molecule.LstAtoms[apuntador].ColorRGBDiffuse);
                    }

                    for(var t=0; t<indx.length; t++)
                    {
                        indexData[i].push( indx[t] + indiceOffset);
                    }
                    indiceOffset= indiceOffset + indexOff;
                    apuntador=apuntador+1;

                    //---------------------------------------------------------------------------------------------------------
                }

                sphereVertexPositionBuffer[i] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData[i]), gl.DYNAMIC_DRAW);
                sphereVertexPositionBuffer[i].itemSize = 3;
                sphereVertexPositionBuffer[i].numItems = vertexPositionData[i].length / 3;
                gl.bindBuffer(gl.ARRAY_BUFFER, null);

                sphereVertexColorBuffer[i] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorTotal[i]), gl.DYNAMIC_DRAW);
                sphereVertexColorBuffer[i].itemSize = 4;
                sphereVertexColorBuffer[i].numItems = ColorTotal[i].length/4;
                gl.bindBuffer(gl.ARRAY_BUFFER, null);

                ChainBuffer[i] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, ChainBuffer[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ChainIndex[i]), gl.DYNAMIC_DRAW);
                ChainBuffer[i].itemSize = 2;
                ChainBuffer[i].numItems = ChainIndex[i].length/2;
                gl.bindBuffer(gl.ARRAY_BUFFER, null);

                sphereVertexIndexBuffer[i] = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer[i]);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData[i]), gl.DYNAMIC_DRAW);
                sphereVertexIndexBuffer[i].itemSize = 1;
                sphereVertexIndexBuffer[i].numItems = indexData[i].length;
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

                sphereVertexNormalBuffer[i] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalDataN[i]), gl.DYNAMIC_DRAW);
                sphereVertexNormalBuffer[i].itemSize = 3;
                sphereVertexNormalBuffer[i].numItems = normalDataN[i].length / 3;
                gl.bindBuffer(gl.ARRAY_BUFFER, null);

                 ///////////////////////////////////////// COLORES DIFFUSOS ///////////////////////////////////////////////

                sphereVertexColorBufferDiffuse[i] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBufferDiffuse[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorTotalDiffuse[i]), gl.DYNAMIC_DRAW);
                sphereVertexColorBufferDiffuse[i].itemSize = 4;
                sphereVertexColorBufferDiffuse[i].numItems = ColorTotalDiffuse[i].length/4;
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
                //alert("ColorDiffuse: "+ColorTotalDiffuse[0].length);

                //limpieza
                normalDataN[i]=[];
                indexData[i]=[];
                ColorTotalDiffuse[i]=[];

                ChainIndex[i]=[];
            }
            else
            {
                for (var j=0; j <NoPaso; j++)
                {

                    //-----------------------------------------------------------------------------------------------------------

                    molecule.LstAtoms[apuntador].BloqueSolid=i+1;
                    molecule.LstAtoms[apuntador].PositionBSolid=j+1;
                    molecule.LstAtoms[apuntador].Representation="SB";

                    LstBSphe[i].push(molecule.LstAtoms[apuntador]);
                    //-----------------------------------------------------------------------------------------
                    if (DinamicaActiva)  //////////*********** checar instrucción
                    {
                        var s=molecule.LstAtoms.length*pos+apuntador;
                        //entonces toman las posiciones x y z del frame en el que se encuentra
                        if(bndbuffer==0)
                        {
                            atmX=coordsX[s];
                            atmY=coordsY[s];
                            atmZ=coordsZ[s];
                        }
                        else
                        {
                            atmX=coordsX1[s];
                            atmY=coordsY1[s];
                            atmZ=coordsZ1[s];
                        }
                    }
                    else
                    {
                        atmX=molecule.LstAtoms[apuntador].X;
                        atmY=molecule.LstAtoms[apuntador].Y;
                        atmZ=molecule.LstAtoms[apuntador].Z;
                    }
                    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


                    for (var z=0; z<verArray.length;)
                    {
                        vertexPositionData[i].push(verArray[z]   + atmX -Cx);
                        vertexPositionData[i].push(verArray[z+1] + atmY -Cy);
                        vertexPositionData[i].push(verArray[z+2] + atmZ -Cz);

                        normalDataN[i].push(normalData[z]);
                        normalDataN[i].push(normalData[z+1]);
                        normalDataN[i].push(normalData[z+2]);

                        z=z+3;

                        ColorTotal[i].push(molecule.LstAtoms[apuntador].ColorRGB[0]);
                        ColorTotal[i].push(molecule.LstAtoms[apuntador].ColorRGB[1]);
                        ColorTotal[i].push(molecule.LstAtoms[apuntador].ColorRGB[2]);
                        ColorTotal[i].push(1);

                        ColorTotalDiffuse[i].push(molecule.LstAtoms[apuntador].ColorRGBDiffuse[0]);
                        ColorTotalDiffuse[i].push(molecule.LstAtoms[apuntador].ColorRGBDiffuse[1]);
                        ColorTotalDiffuse[i].push(molecule.LstAtoms[apuntador].ColorRGBDiffuse[2]);
                        ColorTotalDiffuse[i].push(1);

                        ChainIndex[i].push(molecule.LstAtoms[apuntador].idChain);
                        ChainIndex[i].push(molecule.LstAtoms[apuntador].idChain);

                        //ColorDiffuse=ColorDiffuse.concat(molecule.LstAtoms[apuntador].ColorRGBDiffuse);
                    }
                    //ColorTotalDiffuse[i]=ColorTotalDiffuse[i].concat(molecule.LstAtoms[apuntador].ColorRGBDiffuse); //estas son las líneas que se congelan
                    //ColorTotal[i]=ColorTotal[i].concat(molecule.LstAtoms[apuntador].ColorRGB); //estas son las líneas que se congelan

                    for(var t=0; t<indx.length; t++)
                    {
                        indexData[i].push( indx[t] + indiceOffset);
                    }
                    indiceOffset= indiceOffset + indexOff;
                    apuntador=apuntador+1;

                        //---------------------------------------------------------------------------------------------------
                }


                sphereVertexPositionBuffer[i] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData[i]), gl.DYNAMIC_DRAW);
                sphereVertexPositionBuffer[i].itemSize = 3;
                sphereVertexPositionBuffer[i].numItems = vertexPositionData[i].length / 3;
                gl.bindBuffer(gl.ARRAY_BUFFER, null);

                sphereVertexColorBuffer[i] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorTotal[i]), gl.DYNAMIC_DRAW);
                sphereVertexColorBuffer[i].itemSize = 4;
                sphereVertexColorBuffer[i].numItems = ColorTotal[i].length/4;
                gl.bindBuffer(gl.ARRAY_BUFFER, null);

                ChainBuffer[i] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, ChainBuffer[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ChainIndex[i]), gl.DYNAMIC_DRAW);
                ChainBuffer[i].itemSize = 2;
                ChainBuffer[i].numItems = ChainIndex[i].length/2;
                gl.bindBuffer(gl.ARRAY_BUFFER, null);

                sphereVertexIndexBuffer[i] = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer[i]);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData[i]), gl.DYNAMIC_DRAW);
                sphereVertexIndexBuffer[i].itemSize = 1;
                sphereVertexIndexBuffer[i].numItems = indexData[i].length;
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

                sphereVertexNormalBuffer[i] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalDataN[i]), gl.DYNAMIC_DRAW);
                sphereVertexNormalBuffer[i].itemSize = 3;
                sphereVertexNormalBuffer[i].numItems = normalDataN[i].length / 3;
                gl.bindBuffer(gl.ARRAY_BUFFER, null);

                 ///////////////////////////////////////// COLORES DIFFUSOS ///////////////////////////////////////////////

                sphereVertexColorBufferDiffuse[i] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBufferDiffuse[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorTotalDiffuse[i]), gl.DYNAMIC_DRAW);
                sphereVertexColorBufferDiffuse[i].itemSize = 4;
                sphereVertexColorBufferDiffuse[i].numItems = ColorTotalDiffuse[i].length/4;
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
                //alert("ColorDiffuse: "+ColorTotalDiffuse[0].length);

                //////////////////////////////////////////////////////////////////////////////////////////////////

                //limpieza
                normalDataN[i]=[];
                indexData[i]=[];
                ColorTotalDiffuse[i]=[];

                ChainIndex[i]=[];

            }
        }
    }
    NBSphe=NoBloques;

}

function initBuffersSpheresVDW()
{
    var atmX= null;
    var atmY= null;
    var atmZ= null;

    var NoAtomos = molecule.LstAtoms.length;
    NoBloques = Math.ceil(NoAtomos / NoPaso);
    var Restantes = NoAtomos - ((NoBloques - 1) * NoPaso);

    var ultimo = 0;

    var apuntador = 0;


    if (NoBloques == 1) {

        LstBSphe[0] = new Array();
        for (var i = 0; i < NoAtomos; i++) {
            //-----------------------------------------------------------------------------------------

            molecule.LstAtoms[apuntador].BloqueSolid = 1;
            molecule.LstAtoms[apuntador].PositionBSolid = i + 1;
            molecule.LstAtoms[apuntador].Representation = "VDW";

            LstBSphe[0].push(molecule.LstAtoms[apuntador]);
            //-----------------------------------------------------------------------------------------
            if (DinamicaActiva)  //////////*********** checar instrucción
            {
                var s=molecule.LstAtoms.length*pos+apuntador;
                //entonces toman las posiciones x y z del frame en el que se encuentra
                if(bndbuffer==0)
                {
                    atmX=coordsX[s];
                    atmY=coordsY[s];
                    atmZ=coordsZ[s];
                }
                else
                {
                    atmX=coordsX1[s];
                    atmY=coordsY1[s];
                    atmZ=coordsZ1[s];
                }
            }
            else
            {
                atmX=molecule.LstAtoms[apuntador].X;
                atmY=molecule.LstAtoms[apuntador].Y;
                atmZ=molecule.LstAtoms[apuntador].Z;
            }
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            if (molecule.LstAtoms[apuntador].Element == 'H') { // NameAtom
                for (var z = 0; z < verArray.length;) {
                    vertexPositionData[0].push(verArrayH[z] + atmX - Cx);
                    vertexPositionData[0].push(verArrayH[z + 1] + atmY - Cy);
                    vertexPositionData[0].push(verArrayH[z + 2] + atmZ - Cz);

                    z = z + 3;
                }
            } else if (molecule.LstAtoms[apuntador].Element == 'C') { 
                for (var z = 0; z < verArray.length;) {
                    vertexPositionData[0].push(verArrayC_PB_TI_CA[z] + atmX - Cx);
                    vertexPositionData[0].push(verArrayC_PB_TI_CA[z + 1] + atmY - Cy);
                    vertexPositionData[0].push(verArrayC_PB_TI_CA[z + 2] + atmZ - Cz);

                    z = z + 3;
                }

//            } else if (molecule.LstAtoms[apuntador].NameAtom == 'PB') {
//                for (var z = 0; z < verArray.length;) {
//                    vertexPositionData[0].push(verArrayC_PB_TI_CA[z] + atmX - Cx);
//                    vertexPositionData[0].push(verArrayC_PB_TI_CA[z + 1] + atmY - Cy);
//                    vertexPositionData[0].push(verArrayC_PB_TI_CA[z + 2] + atmZ - Cz);
//
//                    z = z + 3;
//                }

//            } else if (molecule.LstAtoms[apuntador].NameAtom == 'TI') {
//                for (var z = 0; z < verArray.length;) {
//                    vertexPositionData[0].push(verArrayC_PB_TI_CA[z] + atmX - Cx);
//                    vertexPositionData[0].push(verArrayC_PB_TI_CA[z + 1] + atmY - Cy);
//                    vertexPositionData[0].push(verArrayC_PB_TI_CA[z + 2] + atmZ - Cz);
//
//                    z = z + 3;
//                }

//            } else if (molecule.LstAtoms[apuntador].NameAtom == 'CA') {
//                for (var z = 0; z < verArray.length;) {
//                    vertexPositionData[0].push(verArrayC_PB_TI_CA[z] + atmX - Cx);
//                    vertexPositionData[0].push(verArrayC_PB_TI_CA[z + 1] + atmY - Cy);
//                    vertexPositionData[0].push(verArrayC_PB_TI_CA[z + 2] + atmZ - Cz);
//
//                    z = z + 3;
//                }

            } else if (molecule.LstAtoms[apuntador].Element == 'N') {
                for (var z = 0; z < verArray.length;) {
                    vertexPositionData[0].push(verArrayN[z] + atmX - Cx);
                    vertexPositionData[0].push(verArrayN[z + 1] + atmY - Cy);
                    vertexPositionData[0].push(verArrayN[z + 2] + atmZ - Cz);

                    z = z + 3;
                }

            } else if (molecule.LstAtoms[apuntador].Element == 'O') {
                for (var z = 0; z < verArray.length;) {
                    vertexPositionData[0].push(verArrayO[z] + atmX - Cx);
                    vertexPositionData[0].push(verArrayO[z + 1] + atmY - Cy);
                    vertexPositionData[0].push(verArrayO[z + 2] + atmZ - Cz);

                    z = z + 3;
                }

            } else if (molecule.LstAtoms[apuntador].Element == 'S') {
                for (var z = 0; z < verArray.length;) {
                    vertexPositionData[0].push(verArrayS[z] + atmX - Cx);
                    vertexPositionData[0].push(verArrayS[z + 1] + atmY - Cy);
                    vertexPositionData[0].push(verArrayS[z + 2] + atmZ - Cz);

                    z = z + 3;
                }

            } else if (molecule.LstAtoms[apuntador].Element == 'P') {
                for (var z = 0; z < verArray.length;) {
                    vertexPositionData[0].push(verArrayP[z] + atmX - Cx);
                    vertexPositionData[0].push(verArrayP[z + 1] + atmY - Cy);
                    vertexPositionData[0].push(verArrayP[z + 2] + atmZ - Cz);

                    z = z + 3;
                }

            } else {
                for (var z = 0; z < verArray.length;) {
                    vertexPositionData[0].push(verArrayDefault[z] + atmX - Cx);
                    vertexPositionData[0].push(verArrayDefault[z + 1] + atmY - Cy);
                    vertexPositionData[0].push(verArrayDefault[z + 2] + atmZ - Cz);

                    z = z + 3;
                }

            }


            for (var z = 0; z < verArray.length;) {
                normalDataN[0].push(normalData[z]);
                normalDataN[0].push(normalData[z + 1]);
                normalDataN[0].push(normalData[z + 2]);
                ////////////////////////////////////////////////////////////////////////////////////

                z = z + 3;

                ColorTotal[0].push(molecule.LstAtoms[apuntador].ColorRGB[0]);
                ColorTotal[0].push(molecule.LstAtoms[apuntador].ColorRGB[1]);
                ColorTotal[0].push(molecule.LstAtoms[apuntador].ColorRGB[2]);
                ColorTotal[0].push(1);

                ChainIndex[0].push(molecule.LstAtoms[apuntador].idChain);
                ChainIndex[0].push(molecule.LstAtoms[apuntador].idChain);
            }

            for(var t=0; t<indx.length; t++)
                    {
                        indexData[0].push( indx[t] + indiceOffset);
                    }
                    indiceOffset= indiceOffset + indexOff;
            apuntador = apuntador + 1;

            //-----------------------------------------------------------------------------------------------------
        }

        ///////////////////////////////////////// COLORES REALES ///////////////////////////////////////////////

        sphereVertexPositionBuffer[0] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer[0]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData[0]), gl.DYNAMIC_DRAW);
        sphereVertexPositionBuffer[0].itemSize = 3;
        sphereVertexPositionBuffer[0].numItems = vertexPositionData[0].length / 3;
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        //alert("vertices: "+ vertexPositionData[0].length);

        sphereVertexColorBuffer[0] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer[0]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorTotal[0]), gl.DYNAMIC_DRAW);
        sphereVertexColorBuffer[0].itemSize = 4;
        sphereVertexColorBuffer[0].numItems = ColorTotal[0].length / 4;
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        //alert("ColorTotal: "+ ColorTotal[0].length);

        ChainBuffer[0] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, ChainBuffer[0]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ChainIndex[0]), gl.DYNAMIC_DRAW);
        ChainBuffer[0].itemSize = 2;
        ChainBuffer[0].numItems = ChainIndex[0].length / 2;
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        sphereVertexIndexBuffer[0] = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer[0]);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData[0]), gl.DYNAMIC_DRAW);
        sphereVertexIndexBuffer[0].itemSize = 1;
        sphereVertexIndexBuffer[0].numItems = indexData[0].length;
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        //alert("indices: "+indexData[0].length);

        sphereVertexNormalBuffer[0] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer[0]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalDataN[0]), gl.DYNAMIC_DRAW);
        sphereVertexNormalBuffer[0].itemSize = 3;
        sphereVertexNormalBuffer[0].numItems = normalDataN[0].length / 3;
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        ////////////////////////////////////////// COLORES DIFFUSOS ///////////////////////////////////////////////

        sphereVertexColorBufferDiffuse[0] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBufferDiffuse[0]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorTotalDiffuse[0]), gl.DYNAMIC_DRAW);
        sphereVertexColorBufferDiffuse[0].itemSize = 4;
        sphereVertexColorBufferDiffuse[0].numItems = ColorTotalDiffuse[0].length / 4;
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        //alert("ColorDiffuse: "+ColorTotalDiffuse[0].length);
        //////////////////////////////////////////////////////////////////////////////////////////////////

    } else {
        for (var i = 0; i < NoBloques; i++) {

            ultimo = 0;
            vertexPositionData[i] = new Array();
            normalDataN[i] = new Array();
            ColorTotal[i] = new Array();
            indexData[i] = new Array();
            ColorTotalDiffuse[i] = new Array();

            LstBSphe[i] = new Array();

            ChainIndex[i] = new Array();

            indiceOffset=0;

            if (i == NoBloques - 1) //esto es que llegó al último
            {
                for (var j = 0; j < Restantes; j++) {

                    //-------------------------------------------------------------------------------------------------

                    molecule.LstAtoms[apuntador].BloqueSolid = i + 1;
                    molecule.LstAtoms[apuntador].PositionBSolid = j + 1;
                    molecule.LstAtoms[apuntador].Representation = "VDW";

                    LstBSphe[i].push(molecule.LstAtoms[apuntador]);
                    //-----------------------------------------------------------------------------------------
                    if (pos>0)  //////////*********** checar instrucción
                    {
                        var s=molecule.LstAtoms.length*pos+apuntador;
                        //entonces toman las posiciones x y z del frame en el que se encuentra
                        if(bndbuffer==0)
                        {
                            atmX=coordsX[s];
                            atmY=coordsY[s];
                            atmZ=coordsZ[s];
                        }
                        else
                        {
                            atmX=coordsX1[s];
                            atmY=coordsY1[s];
                            atmZ=coordsZ1[s];
                        }
                    }
                    else
                    {
                        atmX=molecule.LstAtoms[apuntador].X;
                        atmY=molecule.LstAtoms[apuntador].Y;
                        atmZ=molecule.LstAtoms[apuntador].Z;
                    }
                    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                    //en esta parte se asigna el color al átom
                    AsignaColor(molecule.LstAtoms[apuntador]);
                    if (molecule.LstAtoms[apuntador].Element == 'H') {
                        for (var z = 0; z < verArray.length;) {
                            vertexPositionData[i].push(verArrayH[z] + atmX - Cx);
                            vertexPositionData[i].push(verArrayH[z + 1] + atmY - Cy);
                            vertexPositionData[i].push(verArrayH[z + 2] + atmZ - Cz);

                            z = z + 3;
                        }
                    } else if (molecule.LstAtoms[apuntador].Element == 'C') {
                        for (var z = 0; z < verArray.length;) {
                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z] + atmX - Cx);
                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z + 1] + atmY - Cy);
                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z + 2] + atmZ - Cz);

                            z = z + 3;
                        }

//                    } else if (molecule.LstAtoms[apuntador].NameAtom == 'PB') {
//                        for (var z = 0; z < verArray.length;) {
//                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z] + atmX - Cx);
//                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z + 1] + atmY - Cy);
//                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z + 2] + atmZ - Cz);
//
//                            z = z + 3;
//                        }

//                    } else if (molecule.LstAtoms[apuntador].NameAtom == 'TI') {
//                        for (var z = 0; z < verArray.length;) {
//                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z] + atmX - Cx);
//                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z + 1] + atmY - Cy);
//                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z + 2] + atmZ - Cz);
//
//                            z = z + 3;
//                        }

//                    } else if (molecule.LstAtoms[apuntador].NameAtom == 'CA') {
//                        for (var z = 0; z < verArray.length;) {
//                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z] + atmX - Cx);
//                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z + 1] + atmY - Cy);
//                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z + 2] + atmZ - Cz);
//
//                            z = z + 3;
//                        }

                    } else if (molecule.LstAtoms[apuntador].Element == 'N') {
                        for (var z = 0; z < verArray.length;) {
                            vertexPositionData[i].push(verArrayN[z] + atmX - Cx);
                            vertexPositionData[i].push(verArrayN[z + 1] + atmY - Cy);
                            vertexPositionData[i].push(verArrayN[z + 2] + atmZ - Cz);

                            z = z + 3;
                        }

                    } else if (molecule.LstAtoms[apuntador].Element == 'O') {
                        for (var z = 0; z < verArray.length;) {
                            vertexPositionData[i].push(verArrayO[z] + atmX - Cx);
                            vertexPositionData[i].push(verArrayO[z + 1] + atmY - Cy);
                            vertexPositionData[i].push(verArrayO[z + 2] + atmZ - Cz);

                            z = z + 3;
                        }

                    } else if (molecule.LstAtoms[apuntador].Element == 'S') {
                        for (var z = 0; z < verArray.length;) {
                            vertexPositionData[i].push(verArrayS[z] + atmX - Cx);
                            vertexPositionData[i].push(verArrayS[z + 1] + atmY - Cy);
                            vertexPositionData[i].push(verArrayS[z + 2] + atmZ - Cz);

                            z = z + 3;
                        }

                    } else if (molecule.LstAtoms[apuntador].Element == 'P') {
                        for (var z = 0; z < verArray.length;) {
                            vertexPositionData[i].push(verArrayP[z] + atmX - Cx);
                            vertexPositionData[i].push(verArrayP[z + 1] + atmY - Cy);
                            vertexPositionData[i].push(verArrayP[z + 2] + atmZ - Cz);

                            z = z + 3;
                        }

                    } else {
                        for (var z = 0; z < verArray.length;) {
                            vertexPositionData[i].push(verArrayDefault[z] + atmX - Cx);
                            vertexPositionData[i].push(verArrayDefault[z + 1] + atmY - Cy);
                            vertexPositionData[i].push(verArrayDefault[z + 2] + atmZ - Cz);

                            z = z + 3;
                        }

                    }


                    for (var z = 0; z < verArray.length;) {
                        normalDataN[i].push(normalData[z]);
                        normalDataN[i].push(normalData[z + 1]);
                        normalDataN[i].push(normalData[z + 2]);

                        ////////////////////////////////////////////////////////////////////////////////////

                        z = z + 3;

                        ColorTotal[i].push(molecule.LstAtoms[apuntador].ColorRGB[0]);
                        ColorTotal[i].push(molecule.LstAtoms[apuntador].ColorRGB[1]);
                        ColorTotal[i].push(molecule.LstAtoms[apuntador].ColorRGB[2]);
                        ColorTotal[i].push(1);

                        ColorTotalDiffuse[i].push(molecule.LstAtoms[apuntador].ColorRGBDiffuse[0]);
                        ColorTotalDiffuse[i].push(molecule.LstAtoms[apuntador].ColorRGBDiffuse[1]);
                        ColorTotalDiffuse[i].push(molecule.LstAtoms[apuntador].ColorRGBDiffuse[2]);
                        ColorTotalDiffuse[i].push(1);

                        ChainIndex[i].push(molecule.LstAtoms[apuntador].idChain);
                        ChainIndex[i].push(molecule.LstAtoms[apuntador].idChain);
                    }

                    for(var t=0; t<indx.length; t++)
                    {
                        indexData[i].push( indx[t] + indiceOffset);
                    }
                    indiceOffset= indiceOffset + indexOff;
                    apuntador = apuntador + 1;

                    //---------------------------------------------------------------------------------------------------------
                }

                sphereVertexPositionBuffer[i] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData[i]), gl.DYNAMIC_DRAW);
                sphereVertexPositionBuffer[i].itemSize = 3;
                sphereVertexPositionBuffer[i].numItems = (vertexPositionData[i].length / 3) * 1;

                sphereVertexColorBuffer[i] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorTotal[i]), gl.DYNAMIC_DRAW);
                sphereVertexColorBuffer[i].itemSize = 4;
                sphereVertexColorBuffer[i].numItems = ColorTotal[i].length / 4;

                ChainBuffer[i] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, ChainBuffer[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ChainIndex[i]), gl.DYNAMIC_DRAW);
                ChainBuffer[i].itemSize = 2;
                ChainBuffer[i].numItems = ChainIndex[i].length / 2;

                sphereVertexIndexBuffer[i] = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer[i]);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData[i]), gl.DYNAMIC_DRAW);
                sphereVertexIndexBuffer[i].itemSize = 1;
                sphereVertexIndexBuffer[i].numItems = indexData[i].length;

                sphereVertexNormalBuffer[i] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalDataN[i]), gl.DYNAMIC_DRAW);
                sphereVertexNormalBuffer[i].itemSize = 3;
                sphereVertexNormalBuffer[i].numItems = (normalDataN[i].length / 3) * 1;

                ///////////////////////////////////////// COLORES DIFFUSOS ///////////////////////////////////////////////

                sphereVertexColorBufferDiffuse[i] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBufferDiffuse[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorTotalDiffuse[i]), gl.DYNAMIC_DRAW);
                sphereVertexColorBufferDiffuse[i].itemSize = 4;
                sphereVertexColorBufferDiffuse[i].numItems = ColorTotalDiffuse[i].length / 4;
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
                //alert("ColorDiffuse: "+ColorTotalDiffuse[0].length);

                //////////////////////////////////////////////////////////////////////////////////////////////////
            } else {
                for (var j = 0; j < NoPaso; j++) {

                    //-----------------------------------------------------------------------------------------------------------

                    molecule.LstAtoms[apuntador].BloqueSolid = i + 1;
                    molecule.LstAtoms[apuntador].PositionBSolid = j + 1;
                    molecule.LstAtoms[apuntador].Representation = "VDW";

                    LstBSphe[i].push(molecule.LstAtoms[apuntador]);
                    //-----------------------------------------------------------------------------------------
                    if (DinamicaActiva)  //////////*********** checar instrucción
                    {
                        var s=molecule.LstAtoms.length*pos+apuntador;
                        //entonces toman las posiciones x y z del frame en el que se encuentra
                        if(bndbuffer==0)
                        {
                            atmX=coordsX[s];
                            atmY=coordsY[s];
                            atmZ=coordsZ[s];
                        }
                        else
                        {
                            atmX=coordsX1[s];
                            atmY=coordsY1[s];
                            atmZ=coordsZ1[s];
                        }
                    }
                    else
                    {
                        atmX=molecule.LstAtoms[apuntador].X;
                        atmY=molecule.LstAtoms[apuntador].Y;
                        atmZ=molecule.LstAtoms[apuntador].Z;
                    }
                    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                    if (molecule.LstAtoms[apuntador].Element == 'H') {
                        for (var z = 0; z < verArray.length;) {
                            vertexPositionData[i].push(verArrayH[z] + atmX - Cx);
                            vertexPositionData[i].push(verArrayH[z + 1] + atmY - Cy);
                            vertexPositionData[i].push(verArrayH[z + 2] + atmZ - Cz);

                            z = z + 3;
                        }
                    } else if (molecule.LstAtoms[apuntador].Element == 'C') {
                        for (var z = 0; z < verArray.length;) {
                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z] + atmX - Cx);
                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z + 1] + atmY - Cy);
                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z + 2] + atmZ - Cz);

                            z = z + 3;
                        }

//                    } else if (molecule.LstAtoms[apuntador].NameAtom == 'PB') {
//                        for (var z = 0; z < verArray.length;) {
//                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z] + atmX - Cx);
//                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z + 1] + atmY - Cy);
//                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z + 2] + atmZ - Cz);
//                            z = z + 3;
//                        }

//                    } else if (molecule.LstAtoms[apuntador].NameAtom == 'TI') {
//                        for (var z = 0; z < verArray.length;) {
//                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z] + atmX - Cx);
//                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z + 1] + atmY - Cy);
//                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z + 2] + atmZ - Cz);
//
//                            z = z + 3;
//                        }

//                    } else if (molecule.LstAtoms[apuntador].NameAtom == 'CA') {
//                        for (var z = 0; z < verArray.length;) {
//                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z] + atmX - Cx);
//                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z + 1] + atmY - Cy);
//                            vertexPositionData[i].push(verArrayC_PB_TI_CA[z + 2] + atmZ - Cz);
//
//                            z = z + 3;
//                        }

                    } else if (molecule.LstAtoms[apuntador].Element == 'N') {
                        for (var z = 0; z < verArray.length;) {
                            vertexPositionData[i].push(verArrayN[z] + atmX - Cx);
                            vertexPositionData[i].push(verArrayN[z + 1] + atmY - Cy);
                            vertexPositionData[i].push(verArrayN[z + 2] + atmZ - Cz);

                            z = z + 3;
                        }

                    } else if (molecule.LstAtoms[apuntador].Element == 'O') {
                        for (var z = 0; z < verArray.length;) {
                            vertexPositionData[i].push(verArrayO[z] + atmX - Cx);
                            vertexPositionData[i].push(verArrayO[z + 1] + atmY - Cy);
                            vertexPositionData[i].push(verArrayO[z + 2] + atmZ - Cz);

                            z = z + 3;
                        }

                    } else if (molecule.LstAtoms[apuntador].Element == 'S') {
                        for (var z = 0; z < verArray.length;) {
                            vertexPositionData[i].push(verArrayS[z] + atmX - Cx);
                            vertexPositionData[i].push(verArrayS[z + 1] + atmY - Cy);
                            vertexPositionData[i].push(verArrayS[z + 2] + atmZ - Cz);

                            z = z + 3;
                        }

                    } else if (molecule.LstAtoms[apuntador].Element == 'P') {
                        for (var z = 0; z < verArray.length;) {
                            vertexPositionData[i].push(verArrayP[z] + atmX - Cx);
                            vertexPositionData[i].push(verArrayP[z + 1] + atmY - Cy);
                            vertexPositionData[i].push(verArrayP[z + 2] + atmZ - Cz);

                            z = z + 3;
                        }

                    } else {
                        for (var z = 0; z < verArray.length;) {
                            vertexPositionData[i].push(verArrayDefault[z] + atmX - Cx);
                            vertexPositionData[i].push(verArrayDefault[z + 1] + atmY - Cy);
                            vertexPositionData[i].push(verArrayDefault[z + 2] + atmZ - Cz);

                            z = z + 3;
                        }

                    }


                    for (var z = 0; z < verArray.length;) {
                        normalDataN[i].push(normalData[z]);
                        normalDataN[i].push(normalData[z + 1]);
                        normalDataN[i].push(normalData[z + 2]);
                        ////////////////////////////////////////////////////////////////////////////////////

                        z = z + 3;

                        ColorTotal[i].push(molecule.LstAtoms[apuntador].ColorRGB[0]);
                        ColorTotal[i].push(molecule.LstAtoms[apuntador].ColorRGB[1]);
                        ColorTotal[i].push(molecule.LstAtoms[apuntador].ColorRGB[2]);
                        ColorTotal[i].push(1);

                        ColorTotalDiffuse[i].push(molecule.LstAtoms[apuntador].ColorRGBDiffuse[0]);
                        ColorTotalDiffuse[i].push(molecule.LstAtoms[apuntador].ColorRGBDiffuse[1]);
                        ColorTotalDiffuse[i].push(molecule.LstAtoms[apuntador].ColorRGBDiffuse[2]);
                        ColorTotalDiffuse[i].push(1);

                        ChainIndex[i].push(molecule.LstAtoms[apuntador].idChain);
                        ChainIndex[i].push(molecule.LstAtoms[apuntador].idChain);
                    }
                    //ColorTotalDiffuse[i]=ColorTotalDiffuse[i].concat(molecule.LstAtoms[apuntador].ColorRGBDiffuse); //estas son las líneas que se congelan
                    //ColorTotal[i]=ColorTotal[i].concat(molecule.LstAtoms[apuntador].ColorRGB); //estas son las líneas que se congelan

                    for(var t=0; t<indx.length; t++)
                    {
                        indexData[i].push( indx[t] + indiceOffset);
                    }
                    indiceOffset= indiceOffset + indexOff;
                    apuntador = apuntador + 1;

                    //---------------------------------------------------------------------------------------------------
                }


                sphereVertexPositionBuffer[i] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData[i]), gl.DYNAMIC_DRAW);
                sphereVertexPositionBuffer[i].itemSize = 3;
                sphereVertexPositionBuffer[i].numItems = (vertexPositionData[i].length / 3) * 1;

                sphereVertexColorBuffer[i] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorTotal[i]), gl.DYNAMIC_DRAW);
                sphereVertexColorBuffer[i].itemSize = 4;
                sphereVertexColorBuffer[i].numItems = ColorTotal[i].length / 4;

                ChainBuffer[i] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, ChainBuffer[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ChainIndex[i]), gl.DYNAMIC_DRAW);
                ChainBuffer[i].itemSize = 2;
                ChainBuffer[i].numItems = ChainIndex[i].length / 2;

                sphereVertexIndexBuffer[i] = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer[i]);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData[i]), gl.DYNAMIC_DRAW);
                sphereVertexIndexBuffer[i].itemSize = 1;
                sphereVertexIndexBuffer[i].numItems = indexData[i].length;

                sphereVertexNormalBuffer[i] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexNormalBuffer[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalDataN[i]), gl.DYNAMIC_DRAW);
                sphereVertexNormalBuffer[i].itemSize = 3;
                sphereVertexNormalBuffer[i].numItems = (normalDataN[i].length / 3) * 1;

                ///////////////////////////////////////// COLORES DIFFUSOS ///////////////////////////////////////////////

                sphereVertexColorBufferDiffuse[i] = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBufferDiffuse[i]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorTotalDiffuse[i]), gl.DYNAMIC_DRAW);
                sphereVertexColorBufferDiffuse[i].itemSize = 4;
                sphereVertexColorBufferDiffuse[i].numItems = ColorTotalDiffuse[i].length / 4;
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
                //alert("ColorDiffuse: "+ColorTotalDiffuse[0].length);

                //////////////////////////////////////////////////////////////////////////////////////////////////
                //limpieza
                normalDataN[i]=[];
                indexData[i]=[];
                ColorTotalDiffuse[i]=[];

                ChainIndex[i]=[];

            }
        }
    }

    NBSphe = NoBloques;
}

function initBuffersBonds(Prendidos)
{
    ///////////////////////////////////////////////////////// LINEAS DE ENLACES //////////////////////////////////////////////

    lineVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexPositionBuffer);
    for(var t in molecule.LstBonds)
    {
        var o = molecule.LstBonds[t];
        o.BPosition=t; //es para ubicar esta línea en el arreglo y saber en qué posición se encuentra

        var atm_0 = o.LstAtoms[0];
        var atm_1 = o.LstAtoms[1];

                    //-----------------------------------------------------------------------------------------
                    if (DinamicaActiva)  //////////*********** checar instrucción
                    {

                        var s_0 = molecule.LstAtoms.length * pos + (atm_0.id-1);
                        var s_1 = molecule.LstAtoms.length * pos + (atm_1.id-1);
                        //entonces toman las posiciones x y z del frame en el que se encuentra
                        if(bndbuffer==0)
                        {
                            atm0_X = coordsX[s_0];
                            atm0_Y = coordsY[s_0];
                            atm0_Z = coordsZ[s_0];

                            atm1_X = coordsX[s_1];
                            atm1_Y = coordsY[s_1];
                            atm1_Z = coordsZ[s_1];
                        }
                        else
                        {
                            atm0_X = coordsX1[s_0];
                            atm0_Y = coordsY1[s_0];
                            atm0_Z = coordsZ1[s_0];

                            atm1_X = coordsX1[s_1];
                            atm1_Y = coordsY1[s_1];
                            atm1_Z = coordsZ1[s_1];
                        }
                    }
                    else
                    {
                        atm0_X = atm_0.X;
                        atm0_Y = atm_0.Y;
                        atm0_Z = atm_0.Z;

                        atm1_X = atm_1.X;
                        atm1_Y = atm_1.Y;
                        atm1_Z = atm_1.Z;
                    }

        verticesLineas.push(atm0_X -Cx);
        verticesLineas.push(atm0_Y -Cy);
        verticesLineas.push(atm0_Z -Cz);
        verticesLineas.push(atm1_X -Cx);
        verticesLineas.push(atm1_Y -Cy);
        verticesLineas.push(atm1_Z -Cz);
        linesNormals.push(atm0_X -Cx);
        linesNormals.push(atm0_Y -Cy);
        linesNormals.push(atm0_Z -Cz);
        linesNormals.push(atm1_X -Cx);
        linesNormals.push(atm1_Y -Cy);
        linesNormals.push(atm1_Z -Cz);

        if (Prendidos)
        {
            colores.push(atm_0.ColorRGB[0]);
            colores.push(atm_0.ColorRGB[1]);
            colores.push(atm_0.ColorRGB[2]);
            colores.push(1); //el color alpha
            colores.push(atm_1.ColorRGB[0]);
            colores.push(atm_1.ColorRGB[1]);
            colores.push(atm_1.ColorRGB[2]);
            colores.push(1); //
        }
        else
        {
            colores.push(atm_0.ColorRGB[0]);
            colores.push(atm_0.ColorRGB[1]);
            colores.push(atm_0.ColorRGB[2]);
            colores.push(0); //el color alpha
            colores.push(atm_1.ColorRGB[0]);
            colores.push(atm_1.ColorRGB[1]);
            colores.push(atm_1.ColorRGB[2]);
            colores.push(0); //
        }

        /////////////////////////
        if ( o.LstAtoms[0].idChain ==  o.LstAtoms[1].idChain  )
        {
            ChainIndexBnd.push( atm_0.idChain );
            ChainIndexBnd.push( atm_0.idChain );
            ChainIndexBnd.push( atm_0.idChain );
            ChainIndexBnd.push( atm_0.idChain );
        }
        else
        {
            ChainIndexBnd.push( 0.5 );
            ChainIndexBnd.push( 0.5 );
            ChainIndexBnd.push( 0.5 );
            ChainIndexBnd.push( 0.5 );
        }
        colorBndDif.push(atm_0.ColorRGBDiffuse[0]);
        colorBndDif.push(atm_0.ColorRGBDiffuse[1]);
        colorBndDif.push(atm_0.ColorRGBDiffuse[2]);
        colorBndDif.push(0);
        colorBndDif.push(atm_1.ColorRGBDiffuse[0]);
        colorBndDif.push(atm_1.ColorRGBDiffuse[1]);
        colorBndDif.push(atm_1.ColorRGBDiffuse[2]);
        colorBndDif.push(0);

    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesLineas), gl.DYNAMIC_DRAW);
    lineVertexPositionBuffer.itemSize = 3;
    lineVertexPositionBuffer.numItems = verticesLineas.length/3;

    colorVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colores), gl.DYNAMIC_DRAW);
    colorVertexBuffer.itemSize=4;
    colorVertexBuffer.numItems=colores.length/4;

    lineNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(linesNormals), gl.DYNAMIC_DRAW);
    lineNormalBuffer.itemSize=3;
    lineNormalBuffer.numItems=linesNormals.length/3;

    ChainBufferBnd = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ChainBufferBnd);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ChainIndexBnd), gl.DYNAMIC_DRAW);
    ChainBufferBnd.itemSize=2;
    ChainBufferBnd.numItems=ChainIndexBnd.length/2;

    ColorDifBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ColorDifBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorBndDif), gl.DYNAMIC_DRAW);
    ColorDifBuffer.itemSize=4;
    ColorDifBuffer.numItems=colorBndDif.length/4;

}

function initBufBndSkele(Prendidos)
{
    /////////////////////////////////////////// LINEAS DE ENLACES SKELETON//////////////////////////////////////////////

    lineSkeleVerPosBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineSkeleVerPosBuf);
    for(var t in molecule.LstBondsSkeleton)
    {
        var o = molecule.LstBondsSkeleton[t];

        var atm_0 = o.LstAtoms[0];
        var atm_1 = o.LstAtoms[1];

                    //-----------------------------------------------------------------------------------------
                    if (DinamicaActiva)  //////////*********** checar instrucción
                    {

                        var s_0 = molecule.LstAtoms.length * pos + (atm_0.id-1);
                        var s_1 = molecule.LstAtoms.length * pos + (atm_1.id-1);
                        //entonces toman las posiciones x y z del frame en el que se encuentra
                        if(bndbuffer==0)
                        {
                            atm0_X = coordsX[s_0];
                            atm0_Y = coordsY[s_0];
                            atm0_Z = coordsZ[s_0];

                            atm1_X = coordsX[s_1];
                            atm1_Y = coordsY[s_1];
                            atm1_Z = coordsZ[s_1];
                        }
                        else
                        {
                            atm0_X = coordsX1[s_0];
                            atm0_Y = coordsY1[s_0];
                            atm0_Z = coordsZ1[s_0];

                            atm1_X = coordsX1[s_1];
                            atm1_Y = coordsY1[s_1];
                            atm1_Z = coordsZ1[s_1];
                        }
                    }
                    else
                    {
                        atm0_X = atm_0.X;
                        atm0_Y = atm_0.Y;
                        atm0_Z = atm_0.Z;

                        atm1_X = atm_1.X;
                        atm1_Y = atm_1.Y;
                        atm1_Z = atm_1.Z;
                    }





        o.BPosition=t; //es para ubicar esta línea en el arreglo y saber en qué posición se encuentra
        verLineSkele.push(atm0_X -Cx);
        verLineSkele.push(atm0_Y -Cy);
        verLineSkele.push(atm0_Z -Cz);

        verLineSkele.push(atm1_X -Cx);
        verLineSkele.push(atm1_Y -Cy);
        verLineSkele.push(atm1_Z -Cz);

        lineSkeleNor.push(atm0_X -Cx);
        lineSkeleNor.push(atm0_Y -Cy);
        lineSkeleNor.push(atm0_Z -Cz);

        lineSkeleNor.push(atm1_X -Cx);
        lineSkeleNor.push(atm1_Y -Cy);
        lineSkeleNor.push(atm1_Z -Cz);

        if (Prendidos)
        {
            coloresSkele.push(1);
            coloresSkele.push(1);
            coloresSkele.push(1);
            coloresSkele.push(1); //el color alpha
            coloresSkele.push(1);
            coloresSkele.push(1);
            coloresSkele.push(1);
            coloresSkele.push(1); //
        }
        else
        {
            coloresSkele.push(1);
            coloresSkele.push(1);
            coloresSkele.push(1);
            coloresSkele.push(0); //el color alpha
            coloresSkele.push(1);
            coloresSkele.push(1);
            coloresSkele.push(1);
            coloresSkele.push(0); //
        }

        /////////////////////////
        if ( o.LstAtoms[0].idChain ==  o.LstAtoms[1].idChain  )
        {
            ChainSkeleIndexBnd.push( o.LstAtoms[0].idChain );
            ChainSkeleIndexBnd.push( o.LstAtoms[0].idChain );
            ChainSkeleIndexBnd.push( o.LstAtoms[0].idChain );
            ChainSkeleIndexBnd.push( o.LstAtoms[0].idChain );
        }
        else
        {
            ChainSkeleIndexBnd.push( 0.5 );
            ChainSkeleIndexBnd.push( 0.5 );
            ChainSkeleIndexBnd.push( 0.5 );
            ChainSkeleIndexBnd.push( 0.5 );
        }
        colorSkeleBndDif.push(0);
        colorSkeleBndDif.push(0);
        colorSkeleBndDif.push(0);
        colorSkeleBndDif.push(0);
        colorSkeleBndDif.push(0);
        colorSkeleBndDif.push(0);
        colorSkeleBndDif.push(0);
        colorSkeleBndDif.push(0);

    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verLineSkele), gl.DYNAMIC_DRAW);
    lineSkeleVerPosBuf.itemSize = 3;
    lineSkeleVerPosBuf.numItems = verLineSkele.length/3;

    colSkeleVerBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colSkeleVerBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coloresSkele), gl.DYNAMIC_DRAW);
    colSkeleVerBuf.itemSize=4;
    colSkeleVerBuf.numItems=coloresSkele.length/4;

    lineSkeleNorBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineSkeleNorBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineSkeleNor), gl.DYNAMIC_DRAW);
    lineSkeleNorBuf.itemSize=3;
    lineSkeleNorBuf.numItems=lineSkeleNor.length/3;

    ChainSkeleBufBnd = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ChainSkeleBufBnd);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ChainSkeleIndexBnd), gl.DYNAMIC_DRAW);
    ChainSkeleBufBnd.itemSize=2;
    ChainSkeleBufBnd.numItems=ChainSkeleIndexBnd.length/2;

    ColSkeleDifBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ColSkeleDifBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorSkeleBndDif), gl.DYNAMIC_DRAW);
    ColSkeleDifBuf.itemSize=4;
    ColSkeleDifBuf.numItems=colorSkeleBndDif.length/4;

}

function initBufDigit()
{

                diPosBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, diPosBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(diPosition), gl.DYNAMIC_DRAW);
                diPosBuffer.itemSize = 3;
                diPosBuffer.numItems = (diPosition.length / 3) * 1;

                diColorBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, diColorBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(diColor), gl.DYNAMIC_DRAW);
                diColorBuffer.itemSize = 4;
                diColorBuffer.numItems = diColor.length / 4;

                diColorBufferDif = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, diColorBufferDif);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(diColorDif), gl.DYNAMIC_DRAW);
                diColorBufferDif.itemSize = 4;
                diColorBufferDif.numItems = diColorDif.length / 4;

                chaIndexBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, chaIndexBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(chaIndex), gl.DYNAMIC_DRAW);
                chaIndexBuffer.itemSize = 2;
                chaIndexBuffer.numItems = chaIndex.length / 2;

                diIndexBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, diIndexBuffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(diIndex), gl.DYNAMIC_DRAW);
                diIndexBuffer.itemSize = 1;
                diIndexBuffer.numItems = diIndex.length;

                diNorBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, diNorBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(diNormal), gl.DYNAMIC_DRAW);
                diNorBuffer.itemSize = 3;
                diNorBuffer.numItems = (diNormal.length / 3) * 1;

                ///////////////////////////////////////// COLORES DIFFUSOS ///////////////////////////////////////////////
}

function initBufferSpline() {//Julio
    /////////////////////////////////////////// LINEAS DE ENLACES SPLINE//////////////////////////////////////////////
    lineSplVerPosBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineSplVerPosBuf);
    var Ne = 0;
    var PsAntA;
    verLineSpl[Ne] = new Array();
    ChainSplIndexBnd[Ne] = new Array();

    for (var t in molecule.LstBondsSkeleton) {
        var o = molecule.LstBondsSkeleton[t];

        var atm_0 = o.LstAtoms[0];
        if (PsAntA !== undefined)

            if (PsAntA.LstAtoms[1].X != o.LstAtoms[0].X) { //Para cambiar de cadena
                ///-----------------------------------------------------------CA ultimo de cadena
                atm_0 = PsAntA.LstAtoms[1];
                if (DinamicaActiva) {
                    var s_0 = molecule.LstAtoms.length * pos + (atm_0.id - 1);
                    if (bndbuffer == 0) {
                        atm0_X = coordsX[s_0];
                        atm0_Y = coordsY[s_0];
                        atm0_Z = coordsZ[s_0];
                    } else {
                        atm0_X = coordsX1[s_0];
                        atm0_Y = coordsY1[s_0];
                        atm0_Z = coordsZ1[s_0];
                    }
                } else {
                    atm0_X = atm_0.X;
                    atm0_Y = atm_0.Y;
                    atm0_Z = atm_0.Z;
                }
                verLineSpl[Ne].push(atm0_X - Cx);
                verLineSpl[Ne].push(atm0_Y - Cy);
                verLineSpl[Ne].push(atm0_Z - Cz);

                ChainSplIndexBnd[Ne].push(o.LstAtoms[0].idChain);
                ChainSplIndexBnd[Ne].push(o.LstAtoms[0].idChain);
                ChainSplIndexBnd[Ne].push(o.LstAtoms[0].idChain);
                ChainSplIndexBnd[Ne].push(o.LstAtoms[0].idChain);
                atm_0 = o.LstAtoms[0];
                ///---------------------------------------------
                Ne++;
                verLineSpl[Ne] = new Array();
                ChainSplIndexBnd[Ne] = new Array();
            }
            //-----------------------------------------------------------------------------------------
        if (DinamicaActiva) {
            var s_0 = molecule.LstAtoms.length * pos + (atm_0.id - 1);
            //entonces toman las posiciones x y z del frame en el que se encuentra
            if (bndbuffer == 0) {
                atm0_X = coordsX[s_0];
                atm0_Y = coordsY[s_0];
                atm0_Z = coordsZ[s_0];
            } else {
                atm0_X = coordsX1[s_0];
                atm0_Y = coordsY1[s_0];
                atm0_Z = coordsZ1[s_0];
            }
        } else {
            atm0_X = atm_0.X;
            atm0_Y = atm_0.Y;
            atm0_Z = atm_0.Z;
        }

        o.BPosition = t;
        verLineSpl[Ne].push(atm0_X - Cx);
        verLineSpl[Ne].push(atm0_Y - Cy);
        verLineSpl[Ne].push(atm0_Z - Cz);

        /////////////////////////
        if (o.LstAtoms[0].idChain == o.LstAtoms[1].idChain) {
            ChainSplIndexBnd[Ne].push(o.LstAtoms[0].idChain);
            ChainSplIndexBnd[Ne].push(o.LstAtoms[0].idChain);
            ChainSplIndexBnd[Ne].push(o.LstAtoms[0].idChain);
            ChainSplIndexBnd[Ne].push(o.LstAtoms[0].idChain);
        }
        PsAntA = o;
        ///-----------------------------------------------------------Ultimo CA
        if (t == molecule.LstBondsSkeleton.length - 1) //Ultimo atomo de la lista.
        {
            atm_0 = o.LstAtoms[1];
            if (DinamicaActiva) {
                var s_0 = molecule.LstAtoms.length * pos + (atm_0.id - 1);
                //entonces toman las posiciones x y z del frame en el que se encuentra
                if (bndbuffer == 0) {
                    atm0_X = coordsX[s_0];
                    atm0_Y = coordsY[s_0];
                    atm0_Z = coordsZ[s_0];
                } else {
                    atm0_X = coordsX1[s_0];
                    atm0_Y = coordsY1[s_0];
                    atm0_Z = coordsZ1[s_0];
                }
            } else {
                atm0_X = atm_0.X;
                atm0_Y = atm_0.Y;
                atm0_Z = atm_0.Z;
            }
            verLineSpl[Ne].push(atm0_X - Cx);
            verLineSpl[Ne].push(atm0_Y - Cy);
            verLineSpl[Ne].push(atm0_Z - Cz);

            ChainSplIndexBnd[Ne].push(o.LstAtoms[0].idChain);
            ChainSplIndexBnd[Ne].push(o.LstAtoms[0].idChain);
            ChainSplIndexBnd[Ne].push(o.LstAtoms[0].idChain);
            ChainSplIndexBnd[Ne].push(o.LstAtoms[0].idChain);
        }
        ///--------------------------------------------------------
    }

    var conect = new Array();
    var cadena = new Array();
    for (var i = 0; i < verLineSpl.length; i++) {
        verLineSpl[i] = Spline(verLineSpl[i], 20);
    }


    for (var i = 0; i < verLineSpl.length; i++) {
        for (var j = 3; j < verLineSpl[i].length; j += 3) {
            conect.push(verLineSpl[i][j - 3]);
            conect.push(verLineSpl[i][j - 2]);
            conect.push(verLineSpl[i][j - 1]);

            conect.push(verLineSpl[i][j]);
            conect.push(verLineSpl[i][j + 1]);
            conect.push(verLineSpl[i][j + 2]);

            cadena.push(ChainSplIndexBnd[i][0]);
            cadena.push(ChainSplIndexBnd[i][0]);
            cadena.push(ChainSplIndexBnd[i][0]);
            cadena.push(ChainSplIndexBnd[i][0]);

            coloresSpl.push(1);
            coloresSpl.push(1);
            coloresSpl.push(1);
            coloresSpl.push(1); //el color alpha
            coloresSpl.push(1);
            coloresSpl.push(1);
            coloresSpl.push(1);
            coloresSpl.push(1); //

            colorSplBndDif.push(0);
            colorSplBndDif.push(0);
            colorSplBndDif.push(0);
            colorSplBndDif.push(0);
            colorSplBndDif.push(0);
            colorSplBndDif.push(0);
            colorSplBndDif.push(0);
            colorSplBndDif.push(0);
        }
    }
    ChainSplIndexBnd = cadena;
    verLineSpl = lineSplNor = conect;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verLineSpl), gl.DYNAMIC_DRAW);
    lineSplVerPosBuf.itemSize = 3;
    lineSplVerPosBuf.numItems = verLineSpl.length / 3;

    colSplVerBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colSplVerBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coloresSpl), gl.DYNAMIC_DRAW);
    colSplVerBuf.itemSize = 4;
    colSplVerBuf.numItems = coloresSpl.length / 4;

    lineSplNorBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineSplNorBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineSplNor), gl.DYNAMIC_DRAW);
    lineSplNorBuf.itemSize = 3;
    lineSplNorBuf.numItems = lineSplNor.length / 3;

    ChainSplBufBnd = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ChainSplBufBnd);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ChainSplIndexBnd), gl.DYNAMIC_DRAW);
    ChainSplBufBnd.itemSize = 2;
    ChainSplBufBnd.numItems = ChainSplIndexBnd.length / 2;

    ColSplDifBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ColSplDifBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorSplBndDif), gl.DYNAMIC_DRAW);
    ColSplDifBuf.itemSize = 4;
    ColSplDifBuf.numItems = colorSplBndDif.length / 4;
}

function initBuffAxis()
{

    //van a ser 3 ejes, X, Y y Z
    //todos los ejes salen del origen 0,0,0
    //eje X de 0,0,0  a  10,0,0 rojo
    //eje Y de 0,0,0  a  0,10,0 verde
    //eje Z de 0,0,0  a  0,0,10 azul
    AxisVertices =[ 0,0,0, 100,0,0, 0,0,0, 0,100,0, 0,0,0, 0,0,100  ];
    Axiscolores = [ 1,0,0,1, 1,0,0,1, 0,1,0,1, 0,1,0,1, 0,0,1,1, 0,0,1,1  ];
    AxiscolorDif = [ 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0 ];
    AxisNormals = [ 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1];
    AxisChainIndex = [ 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5  ];

    //alert(AxisVertices.length);
    //alert(Axiscolores.length);

    AxisPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, AxisPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(AxisVertices), gl.DYNAMIC_DRAW);
    AxisPositionBuffer.itemSize = 3;
    AxisPositionBuffer.numItems = AxisVertices.length/3;

    AxisColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, AxisColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Axiscolores), gl.DYNAMIC_DRAW);
    AxisColorBuffer.itemSize=4;
    AxisColorBuffer.numItems=Axiscolores.length/4;

    AxisNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, AxisNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(AxisNormals), gl.DYNAMIC_DRAW);
    AxisNormalBuffer.itemSize=3;
    AxisNormalBuffer.numItems=AxisNormals.length/3;

    AxisChainBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, AxisChainBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(AxisChainIndex), gl.DYNAMIC_DRAW);
    AxisChainBuffer.itemSize=2;
    AxisChainBuffer.numItems=AxisChainIndex.length/2;

    AxisColorDifBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, AxisColorDifBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(AxiscolorDif), gl.DYNAMIC_DRAW);
    AxisColorDifBuffer.itemSize=4;
    AxisColorDifBuffer.numItems=AxiscolorDif.length/4;
}

function initBuffBox()
{
    var BX=molecule.BoxX;
    var BY=molecule.BoxY;
    var BZ=molecule.BoxZ;
    var CX=molecule.CenterX;
    var CY=molecule.CenterY;
    var CZ=molecule.CenterZ;
    
    //console.log("Box X: "+BX+" Box Y: "+BY+" Box Z: "+BZ);
    //console.log("Center X: "+CX+" Center Y: "+CY+" Center Z: "+CZ);

    BoxVertices =[ 0-CX,0-CY,0-CZ, BX-CX,0-CY,0-CZ, 0-CX,0-CY,0-CZ, 0-CX,BY-CY,0-CZ, BX-CX,0-CY,0-CZ, BX-CX,BY-CY,0-CZ, BX-CX,BY-CY,0-CZ, 0-CX,BY-CY,0-CZ, 0-CX,0-CY,BZ-CZ, BX-CX,0-CY,BZ-CZ, 0-CX,0-CY,BZ-CZ, 0-CX,BY-CY,BZ-CZ, BX-CX,0-CY,BZ-CZ, BX-CX,BY-CY,BZ-CZ, BX-CX,BY-CY,BZ-CZ, 0-CX,BY-CY,BZ-CZ, 0-CX,0-CY,0-CZ, 0-CX,0-CY,BZ-CZ, BX-CX,0-CY,0-CZ, BX-CX,0-CY,BZ-CZ, 0-CX,BY-CY,0-CZ, 0-CX,BY-CY,BZ-CZ, BX-CX,BY-CY,0-CZ, BX-CX,BY-CY,BZ-CZ ];

    Boxcolores = [ 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1 ];
    BoxcolorDif = [ 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0 ];
    BoxNormals = [ 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1 ];
    BoxChainIndex = [ 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5, 0.5,0.5 ];

    BoxPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, BoxPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(BoxVertices), gl.DYNAMIC_DRAW);
    BoxPositionBuffer.itemSize = 3;
    BoxPositionBuffer.numItems = BoxVertices.length/3;

    BoxColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, BoxColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Boxcolores), gl.DYNAMIC_DRAW);
    BoxColorBuffer.itemSize=4;
    BoxColorBuffer.numItems=Boxcolores.length/4;

    BoxNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, BoxNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(BoxNormals), gl.DYNAMIC_DRAW);
    BoxNormalBuffer.itemSize=3;
    BoxNormalBuffer.numItems=BoxNormals.length/3;

    BoxChainBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, BoxChainBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(BoxChainIndex), gl.DYNAMIC_DRAW);
    BoxChainBuffer.itemSize=2;
    BoxChainBuffer.numItems=BoxChainIndex.length/2;

    BoxColorDifBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, BoxColorDifBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(BoxcolorDif), gl.DYNAMIC_DRAW);
    BoxColorDifBuffer.itemSize=4;
    BoxColorDifBuffer.numItems=BoxcolorDif.length/4;
}



