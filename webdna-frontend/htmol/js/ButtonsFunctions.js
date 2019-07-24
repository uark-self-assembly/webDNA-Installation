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

function R_Cpk() {
    return function(event) {
        CambiarRepresentacion("VDW");
    }
}

function R_SB() {
    return function(event) {
        CambiarRepresentacion("SB");
    }
}

function R_B() {
    return function(event) {
        CambiarRepresentacion("Bonds");
    }
}

function R_Skele() {
    return function(event) {
        CambiarRepresentacion("Skeleton");
    }
}
function R_Spline() {
    return function(event) {
        CambiarRepresentacion("Spline");
    }
}

function SetView(mol, name){
    return function(event) {
        var newRotationMatrix = mat4.create();
        mat4.identity(newRotationMatrix);
        if (name.name=='FrontView')
        {
	  mat4.rotate(newRotationMatrix, degToRad(270), [0, 0, 1]); //vista frontal 0
	  mat4.rotate(newRotationMatrix, degToRad(270), [0, 1, 0]); //vista frontal 0
        }
        else if(name.name=='LeftView')
        {
	  mat4.rotate(newRotationMatrix, degToRad(270), [0, 0, 1]); //vista izquierda
	  mat4.rotate(newRotationMatrix, degToRad(270), [0, 1, 0]); //vista izquierda
	  mat4.rotate(newRotationMatrix, degToRad(90), [0, 0, 1]); //vista izquierda
        }
        else if(name.name=='RightView')
        {
	  mat4.rotate(newRotationMatrix, degToRad(270), [0, 0, 1]); //vista derecha
	  mat4.rotate(newRotationMatrix, degToRad(270), [0, 1, 0]); //vista derecha
	  mat4.rotate(newRotationMatrix, degToRad(270), [0, 0, 1]); //vista derecha
        }
        else if(name.name=='UpView')
        {
            mat4.rotate(newRotationMatrix, degToRad(270), [0, 0, 1]); //vista de arriba 90
        }
        else if(name.name=='DownView')
        {
	    mat4.rotate(newRotationMatrix, degToRad(270), [0, 0, 1]); //vista de arriba 90
            mat4.rotate(newRotationMatrix, degToRad(180), [0, 1, 0]); //vista de arriba 90
        }
        else //back
        {
	    mat4.rotate(newRotationMatrix, degToRad(270), [0, 0, 1]); //vista atras
	    mat4.rotate(newRotationMatrix, degToRad(270), [0, 1, 0]); //vista atras
	    mat4.rotate(newRotationMatrix, degToRad(180), [0, 0, 1]); //vista atras
        }

        mat4.identity(RotationMatrix);
        mat4.multiply(newRotationMatrix, RotationMatrix, RotationMatrix);
    }
}

function UserSetView(mol, name){

        var newRotationMatrix = mat4.create();
        mat4.identity(newRotationMatrix);
        if (name=='Custom')
        {
	  mat4.rotate(newRotationMatrix, degToRad(270), [1, 0, 0]); //vista frontal 0
	  mat4.rotate(newRotationMatrix, degToRad(220), [0, 0, 1]); //vista frontal 0
	  //mat4.rotate(newRotationMatrix, degToRad(-15), [1, 1, 1]); //vista frontal 0
        }
        else if (name=='FrontView')
        {
	  mat4.rotate(newRotationMatrix, degToRad(270), [0, 0, 1]); //vista frontal 0
	  mat4.rotate(newRotationMatrix, degToRad(270), [0, 1, 0]); //vista frontal 0
        }
        else if(name=='LeftView')
        {
	  mat4.rotate(newRotationMatrix, degToRad(270), [0, 0, 1]); //vista izquierda
	  mat4.rotate(newRotationMatrix, degToRad(270), [0, 1, 0]); //vista izquierda
	  mat4.rotate(newRotationMatrix, degToRad(90), [0, 0, 1]); //vista izquierda
        }
        else if(name=='RightView')
        {
	  mat4.rotate(newRotationMatrix, degToRad(270), [0, 0, 1]); //vista derecha
	  mat4.rotate(newRotationMatrix, degToRad(270), [0, 1, 0]); //vista derecha
	  mat4.rotate(newRotationMatrix, degToRad(270), [0, 0, 1]); //vista derecha
        }
        else if(name=='UpView')
        {
            mat4.rotate(newRotationMatrix, degToRad(270), [0, 0, 1]); //vista de arriba 90
        }
        else if(name=='DownView')
        {
	    mat4.rotate(newRotationMatrix, degToRad(270), [0, 0, 1]); //vista de arriba 90
            mat4.rotate(newRotationMatrix, degToRad(180), [0, 1, 0]); //vista de arriba 90
        }
        else //back
        {
	    mat4.rotate(newRotationMatrix, degToRad(270), [0, 0, 1]); //vista atras
	    mat4.rotate(newRotationMatrix, degToRad(270), [0, 1, 0]); //vista atras
	    mat4.rotate(newRotationMatrix, degToRad(180), [0, 0, 1]); //vista atras
        }

        mat4.identity(RotationMatrix);
        mat4.multiply(newRotationMatrix, RotationMatrix, RotationMatrix);

}

function ByAmino(mol, name) {
    return function(event) {
        EliminarSeleccion();
        for (var i = 0; i < molecule.LstChain.length; i++) {
            for (var j = 0; j < molecule.LstChain[i].LstAminoAcid.length; j++) {
                if (molecule.LstChain[i].LstAminoAcid[j].Name == name) {
                    for (var k = 0; k < molecule.LstChain[i].LstAminoAcid[j].LstAtoms.length; k++) {
                        AtomosSeleccionados.push(molecule.LstChain[i].LstAminoAcid[j].LstAtoms[k]);
                    }
                }
            }
        }
        ProcesarSeleccion();

    }

}

function ByAtoms(mol, element) {
    return function(event) {
        EliminarSeleccion();
        for (var i = 0; i < molecule.LstAtoms.length; i++) {
            //alert(molecule.LstAtoms[i].Element);
            if (element == molecule.LstAtoms[i].Element) {
                if (molecule.LstAtoms[i].State == 'Active') {
                    AtomosSeleccionados.push(molecule.LstAtoms[i]);
                }

            }
        }
        ProcesarSeleccion();


    }
}

function ByColor(mol, color) {
    return function(event) {
        AtomosSeleccionados = [];
        for (var i = 0; i < molecule.LstAtoms.length; i++) {
            //alert(molecule.LstAtoms[i].Element);
            if (color == molecule.LstAtoms[i].ColorName) {
                if (molecule.LstAtoms[i].State == 'Active') {
                    AtomosSeleccionados.push(molecule.LstAtoms[i]);
                }

            }
        }
        ProcesarSeleccion();
    }
}

function CenterByAtom()
{
     return function(event) {
        if (AtomosSeleccionados.length==1)
        {
            //si ya habia un atomcenter
            if (atomCenter!=null) 
            {
                Cx = Cxtemp;
                Cy = Cytemp;
                Cz = Cztemp;
            }

            var atom=AtomosSeleccionados[0];
            //center by atom.x y z
            //simplemete a cada átomo se le resta la x y z del átomo seleccionado
            atomCenter =atom;

            var colorSet = atom.ColorRGB;
            //quitar el átomo de la selecció (regresarlo a su color por defecto)
            if (atom.ColorDiferente) 
            {
                colorSet = atom.ColorDos;
            }
            var mul=(atom.PositionBSolid-1) * nColor;
            for (var z = 0; z < nColor;) 
            {
                ColorTotal[atom.BloqueSolid-1][mul + z]   = colorSet[0];
                ColorTotal[atom.BloqueSolid-1][mul + z + 1]=colorSet[1];
                ColorTotal[atom.BloqueSolid-1][mul + z + 2]=colorSet[2];
                ColorTotal[atom.BloqueSolid-1][mul + z + 3]=colorSet[3];
                z = z + 4;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer[atom.BloqueSolid-1]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorTotal[atom.BloqueSolid-1]), gl.DYNAMIC_DRAW);
            sphereVertexColorBuffer[atom.BloqueSolid-1].numItems = ColorTotal[atom.BloqueSolid-1].length / 4;
            gl.bindBuffer(gl.ARRAY_BUFFER, null);    

            atom.Seleccionado=false;

            Cx = atomCenter.X;
            Cy = atomCenter.Y;
            Cz = atomCenter.Z;

          ChangeVertexPositionStatic();

        }
        //alert("CenterByAtom")
     }

}

function Distance() {
    return function(event) {
        AngleBool=false;

        var ArrCont = [];
        for (var i = 0; i < AtomosSeleccionados.length; i++) {
            var atomTemp = AtomosSeleccionados[i];

            if (atomTemp.State == 'Active') {
                var mul = (atomTemp.PositionBSolid - 1) * nColor;
                for (var z = 0; z < nColor;) {
                    ColorTotal[atomTemp.BloqueSolid - 1][mul + z] = atomTemp.ColorRGB[0];
                    ColorTotal[atomTemp.BloqueSolid - 1][mul + z + 1] = atomTemp.ColorRGB[1];
                    ColorTotal[atomTemp.BloqueSolid - 1][mul + z + 2] = atomTemp.ColorRGB[2];
                    ColorTotal[atomTemp.BloqueSolid - 1][mul + z + 3] = atomTemp.ColorRGB[3];
                    z = z + 4;
                }
                atomTemp.Seleccionado = false;

                var agregar = true;
                for (var j = 0; j < ArrCont.length; j++) {
                    if ((atomTemp.BloqueSolid - 1) == ArrCont[j]) {
                        agregar = false;
                        break;
                    }
                }
                if (agregar == true) {
                    ArrCont.push(atomTemp.BloqueSolid - 1);
                }
            }


        }

        for (var i = 0; i < ArrCont.length; i++) {
            gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer[ArrCont[i]]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorTotal[ArrCont[i]]), gl.DYNAMIC_DRAW);
            sphereVertexColorBuffer[ArrCont[i]].itemSize = 4;
            sphereVertexColorBuffer[ArrCont[i]].numItems = ColorTotal[ArrCont[i]].length / 4;
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

        }

        AtomosSeleccionados = [];

        if (DistanceBool) {
            DistanceBool = false;

        } else {
            DistanceBool = true;
        }


    }

}

function Angle() {
    return function(event) {
        DistanceBool = false;

        var ArrCont = [];
        for (var i = 0; i < AtomosSeleccionados.length; i++) {
            var atomTemp = AtomosSeleccionados[i];

            if (atomTemp.State == 'Active') {
                var mul = (atomTemp.PositionBSolid - 1) * nColor;
                for (var z = 0; z < nColor;) {
                    ColorTotal[atomTemp.BloqueSolid - 1][mul + z] = atomTemp.ColorRGB[0];
                    ColorTotal[atomTemp.BloqueSolid - 1][mul + z + 1] = atomTemp.ColorRGB[1];
                    ColorTotal[atomTemp.BloqueSolid - 1][mul + z + 2] = atomTemp.ColorRGB[2];
                    ColorTotal[atomTemp.BloqueSolid - 1][mul + z + 3] = atomTemp.ColorRGB[3];
                    z = z + 4;
                }
                atomTemp.Seleccionado = false;

                var agregar = true;
                for (var j = 0; j < ArrCont.length; j++) {
                    if ((atomTemp.BloqueSolid - 1) == ArrCont[j]) {
                        agregar = false;
                        break;
                    }
                }
                if (agregar == true) {
                    ArrCont.push(atomTemp.BloqueSolid - 1);
                }
            }


        }

        for (var i = 0; i < ArrCont.length; i++) {
            gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer[ArrCont[i]]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorTotal[ArrCont[i]]), gl.DYNAMIC_DRAW);
            sphereVertexColorBuffer[ArrCont[i]].itemSize = 4;
            sphereVertexColorBuffer[ArrCont[i]].numItems = ColorTotal[ArrCont[i]].length / 4;
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

        }

        AtomosSeleccionados = [];

        if (AngleBool) {
            AngleBool = false;

        } else {
            AngleBool = true;
        }
    }

}


function None()
{
    return function(event) {
        DistanceBool=false;
        AngleBool=false;
    }

}

function DeleteMeasures()
{
    return function(event) {
        diPosition = [];
        diColor = [];
        diNormal = [];
        diIndex = [];
        chaIndex = [];
        diColorDif = [];
        DistanceBool=false;
        AngleBool=false;
        initBufDigit();
    }

}

function Axis()
{
    return function(event) {
        if (AxisBool) 
        {
            AxisBool=false;
        }
        else
        {
            AxisBool=true;
        }
    }   
}

function ProcesarSeleccion() //poner a color seleccionado, pregunta: va a estar habilitado para bonds?
{
    //console.time("procesarSeleccion");
    var ArrCont=[];
                        //console.log(molecule.LstAtoms.length);
                        //console.log(AtomosSeleccionados.length);
    for (var t = 0; t < AtomosSeleccionados.length; t++)
    {
        var atom = AtomosSeleccionados[t];
        if (atom.Seleccionado == false)
        {
            //
            atom.Seleccionado = true;
            haySeleccionado = true;
            var mul=(atom.PositionBSolid-1) * nColor;
            for (var z = 0; z < nColor;)
            {
                ColorTotal[atom.BloqueSolid-1][mul + z]   = 0;  //va a ser el color de la selección
                ColorTotal[atom.BloqueSolid-1][mul + z + 1]=1;
                ColorTotal[atom.BloqueSolid-1][mul + z + 2]=0;
                ColorTotal[atom.BloqueSolid-1][mul + z + 3]=1;
                 z = z + 4;
            }

            var agregar=true;
            for(var i=0; i < ArrCont.length; i++)
            {
                if ((atom.BloqueSolid-1)==ArrCont[i])
                {
                    agregar=false;
                    break;
                }
            }
            if (agregar==true)
            {
                ArrCont.push(atom.BloqueSolid-1);
            }

        }
        else
        {
            //No hacer nada xq ya está seleccionado

        }
    }

        for(var i=0; i < ArrCont.length; i++)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer[ArrCont[i]]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorTotal[ArrCont[i]]), gl.DYNAMIC_DRAW);
            sphereVertexColorBuffer[ArrCont[i]].numItems = ColorTotal[ArrCont[i]].length / 4;
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

        }


    //console.timeEnd("procesarSeleccion");

}


function ProcesarCadena(index, button) {
    return function(event) {
        if (molecule.LstChain[index].State == 'Inactive') {
            button.style.color = ' #ffffff ';
            molecule.LstChain[index].State = 'Active'

            var pos = index + 1;

            for (var k = 0; k < ArrayIndx.length; k++) {
                if (pos == ArrayIndx[k]) {
                    ArrayIndx.splice(k, 1);
                }

            }
            ArrayIndx.push(0);

            var u_Array = gl.getUniformLocation(program, 'uIntArray');

            gl.uniform1fv(u_Array, ArrayIndx);

            ArrayIndx.pop();


            for (var i = 0; i < molecule.LstChain[index].LstAminoAcid.length; i++) {
                for (var j = 0; j < molecule.LstChain[index].LstAminoAcid[i].LstAtoms.length; j++) {
                    var at = molecule.LstChain[index].LstAminoAcid[i].LstAtoms[j];
                    at.State = 'Active';

                }
            }

        } else {
            button.style.color = ' rgb(255,0,0) ';
            molecule.LstChain[index].State = 'Inactive'


            ArrayIndx.push(index + 1);

            //alert(ArrayIndx);

            var u_Array = gl.getUniformLocation(program, 'uIntArray');

            gl.uniform1fv(u_Array, ArrayIndx);

            for (var i = 0; i < molecule.LstChain[index].LstAminoAcid.length; i++) {
                for (var j = 0; j < molecule.LstChain[index].LstAminoAcid[i].LstAtoms.length; j++) {
                    var at = molecule.LstChain[index].LstAminoAcid[i].LstAtoms[j];
                    //voy a checar cada uno para ver si está en wire o en solid
                    //alert(ColorTotal[at.BloqueSolid-1]);
                    //alert(at.NameAtom);
                    at.State = 'Inactive';

                }

            }
        }

        //alert("entra ProcesarCadena:"+index);
    }
}


function CambiarRepresentacion(Repre) //Representacion es en lo que se va a cambiar
{
    if (AtomosSeleccionados.length==molecule.LstAtoms.length)
    {
        if (Repre=='VDW')
        {
            InitBufVDW();
        }
        else if (Repre == 'SB')
        {
            InitBufSB();
        }
        else if (Repre == 'Bonds')
        {
            InitBufBonds();
        }
        else if (Repre == 'Skeleton')
        {
            InitBufSkeleton();
        }
        //-----Julio
        else if (Repre == 'Spline')
        {
            InitBufSpline();
        }
        ///-------------------



    }

    else
    {
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        var ArrCont1=[];
        var ArrCont2=[];
        var BuffLineCol=false;
        var BuffLineSkeleCol=false;

        for(var i=0; i<AtomosSeleccionados.length; i++) //////////se va a procesar cáda átomo individual ya que son selecciones parciales
        {
            var atom = AtomosSeleccionados[i];

            if (DinamicaActiva)  //////////*********** checar instrucción
            {
                var s=molecule.LstAtoms.length * pos + (atom.id-1);
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
                atmX=atom.X;
                atmY=atom.Y;
                atmZ=atom.Z;
            }

            if (atom.Representation=='SB')    ////-------------------------------------------------------
            {
                atom.Representation=Repre;
                if (Repre=='SB')
                {
                    //No hacer nada ya que esa es la misma representación
                }
                else if(Repre=='VDW')
                {
                    var mul = (atom.PositionBSolid - 1) * nVertices;
                    //checar el radio del elemento específico
                    if (atom.NameAtom == 'H')
                    {
                        //alert("H");
                        //ingresar los nuevos vértices
                        for (var z = 0; z < nVertices;) //vertices para esfera de 16 latitudes y longitudes
                        {
                            vertexPositionData[atom.BloqueSolid - 1][mul + z]     = verArrayH[z] + atmX - Cx; //estoy quitando y al mismo tiempo agregando, por lo que se queda
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 1] = verArrayH[z + 1] + atmY - Cy; //la misma longitud en cada operación
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 2] = verArrayH[z + 2] + atmZ - Cz;

                            z = z + 3;
                        }

                    }
                    else if (atom.NameAtom == 'C')
                    {
                        //alert("C");
                        for (var z = 0; z < nVertices;) {
                            vertexPositionData[atom.BloqueSolid - 1][mul + z] = verArrayC_PB_TI_CA[z] + atmX - Cx;
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 1] = verArrayC_PB_TI_CA[z + 1] + atmY - Cy;
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 2] = verArrayC_PB_TI_CA[z + 2] + atmZ - Cz;

                            z = z + 3;
                        }

                        //alert("saleC");
                    }
                    else if (atom.NameAtom == 'PB')
                    {
                        //alert("PB");
                        //ingresar los nuevos vértices
                        for (var z = 0; z < nVertices;) {
                            vertexPositionData[atom.BloqueSolid - 1][mul + z] = verArrayC_PB_TI_CA[z] + atmX - Cx;
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 1] = verArrayC_PB_TI_CA[z + 1] + atmY - Cy;
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 2] = verArrayC_PB_TI_CA[z + 2] + atmZ - Cz;

                            z = z + 3;
                        }

                    } else if (atom.NameAtom == 'TI') {
                        //alert("TI");
                        //ingresar los nuevos vértices
                        for (var z = 0; z < nVertices;) {
                            vertexPositionData[atom.BloqueSolid - 1][mul + z] = verArrayC_PB_TI_CA[z] + atmX - Cx;
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 1] = verArrayC_PB_TI_CA[z + 1] + atmY - Cy;
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 2] = verArrayC_PB_TI_CA[z + 2] + atmZ - Cz;

                            z = z + 3;
                        }

                    } else if (atom.NameAtom == 'CA') {
                        //alert("CA");
                        //ingresar los nuevos vértices
                        for (var z = 0; z < nVertices;) {
                            vertexPositionData[atom.BloqueSolid - 1][mul + z] = verArrayC_PB_TI_CA[z] + atmX - Cx;
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 1] = verArrayC_PB_TI_CA[z + 1] + atmY - Cy;
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 2] = verArrayC_PB_TI_CA[z + 2] + atmZ - Cz;

                            z = z + 3;
                        }

                    } else if (atom.NameAtom == 'N') {
                        //alert("N");
                        //ingresar los nuevos vértices
                        for (var z = 0; z < nVertices;) //vertices para esfera de 16 latitudes y longitudes
                        {
                            vertexPositionData[atom.BloqueSolid - 1][mul + z] = verArrayN[z] + atmX - Cx;
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 1] = verArrayN[z + 1] + atmY - Cy;
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 2] = verArrayN[z + 2] + atmZ - Cz;

                            z = z + 3;
                        }

                    } else if (atom.NameAtom == 'O') {
                        //alert("O");
                        //ingresar los nuevos vértices
                        for (var z = 0; z < nVertices;) //vertices para esfera de 16 latitudes y longitudes
                        {
                            vertexPositionData[atom.BloqueSolid - 1][mul + z] = verArrayO[z] + atmX - Cx;
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 1] = verArrayO[z + 1] + atmY - Cy;
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 2] = verArrayO[z + 2] + atmZ - Cz;

                            z = z + 3;
                        }

                        //alert("ssss");

                    } else if (atom.NameAtom == 'S') {
                        //alert("S");
                        //ingresar los nuevos vértices
                        for (var z = 0; z < nVertices;) //vertices para esfera de 16 latitudes y longitudes
                        {
                            vertexPositionData[atom.BloqueSolid - 1][mul + z] = verArrayS[z] + atmX - Cx;
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 1] = verArrayS[z + 1] + atmY - Cy;
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 2] = verArrayS[z + 2] + atmZ - Cz;

                            z = z + 3;
                        }

                    } else if (atom.NameAtom == 'P') {
                        //alert("P");
                        //ingresar los nuevos vértices
                        for (var z = 0; z < nVertices;) //vertices para esfera de 16 latitudes y longitudes
                        {
                            vertexPositionData[atom.BloqueSolid - 1][mul + z] = verArrayP[z] + atmX - Cx;
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 1] = verArrayP[z + 1] + atmY - Cy;
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 2] = verArrayP[z + 2] + atmZ - Cz;

                            z = z + 3;
                        }

                    }
                    else /////////// DEFAULT
                    {
                        //alert("entra aqui");
                        //ingresar los nuevos vértices
                        for (var z = 0; z < nVertices;) //vertices para esfera de 16 latitudes y longitudes
                        {
                            vertexPositionData[atom.BloqueSolid - 1][mul + z]     = verArrayDefault[z] + atmX - Cx;
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 1] = verArrayDefault[z + 1] + atmY - Cy;
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 2] = verArrayDefault[z + 2] + atmZ - Cz;

                            z = z + 3;
                        }
                    }
                    var agregar=true;
                    for(var j=0; j < ArrCont1.length; j++)
                    {
                        if ((atom.BloqueSolid - 1)==ArrCont1[j])
                        {
                            agregar=false;
                            break;
                        }
                    }
                    if (agregar==true)
                    {
                        ArrCont1.push(atom.BloqueSolid - 1);
                    }

                    //para cada línea en la lista de este átomo apagarla poniendo en 0 su alpha
                    for(var z=0; z< atom.LstLinea.length;)
                    {
                        //cada línea va a tener un id que va a ser conforme se vaya agregando al bloque de enlaces
                        var line= atom.LstLinea[z];
                        var mul=line.BPosition * 8; //es 8 ya que cada línea contiene 2 vértices, cada vértice 4 dígitos para el color
                        colores[mul + 3 ] = 0;
                        colores[mul + 7 ] = 0;
                        z=z+1;
                    }
                    BuffLineCol=true;

                }

                else if(Repre=='Bonds')
                {
                    //apagar los vértices de las esferas, ya que no se hace interpolación lineal
                    //aparte también cambiarle el color al verdadero------------creo que no se requiere por el momento
                    var mul= (atom.PositionBSolid - 1) * nColor;
                    for(var j=0; j<nColor;)
                    {
                        ColorTotal[atom.BloqueSolid-1][mul + j + 3] = 0; //para apagar el color con el alpha
                        j=j+4;
                    }
                    atom.State='Inactive';
                    var agregar=true;
                    for(var j=0; j < ArrCont2.length; j++)
                    {
                        if ((atom.BloqueSolid - 1)==ArrCont2[j])
                        {
                            agregar=false;
                            break;
                        }
                    }
                    if (agregar==true)
                    {
                        ArrCont2.push(atom.BloqueSolid - 1);
                    }

                }

                else if(Repre=='Skeleton')
                {
                    for(var z=0; z< atom.LstLinea.length;)
                    {
                        //cada línea va a tener un id que va a ser conforme se vaya agregando al bloque de enlaces
                        var line= atom.LstLinea[z];
                        var mul=line.BPosition * 8;
                        colores[mul + 3 ] = 0;
                        colores[mul + 7 ] = 0;
                        z=z+1;
                    }
                    BuffLineCol=true;
                    if (atom.NameAtom=='CA')
                    {
                        //para cada líneaSkeleton en la lista del átomo (es 1 o dos líneas) checar en qué estado se encuentran sus átomos extremos
                        //si los dos estan en repre Skeleton entonces prenderla
                        for(var j=0; j<atom.LstLineaSke.length; j++)
                        {
                            var line= atom.LstLineaSke[j]; //la linea skeleton
                            if ((line.LstAtoms[0].Representation=='Skeleton') && (line.LstAtoms[1].Representation=='Skeleton' ))
                            {
                                var mul=line.BPosition * 8;
                                coloresSkele[mul + 3 ] = 1;
                                coloresSkele[mul + 7 ] = 1;
                            }
                        }
                        BuffLineSkeleCol=true;

                    }
                    else
                    {
                        //apagar el átomo con el colorTotal poniendo el alpha en 0
                        var mul= (atom.PositionBSolid - 1) * nColor;
                        for(var j=0; j<nColor;)
                        {
                            ColorTotal[atom.BloqueSolid-1][mul + j + 3] = 0; //para apagar el color con el alpha
                            j=j+4;
                        }
                        atom.State='Inactive';
                        var agregar=true;
                        for(var j=0; j < ArrCont2.length; j++)
                        {
                            if ((atom.BloqueSolid - 1)==ArrCont2[j])
                            {
                                agregar=false;
                                break;
                            }
                        }
                        if (agregar==true)
                        {
                            ArrCont2.push(atom.BloqueSolid - 1);
                        }

                    }

                }
                else //ponerlo en Spline
                {
                    ///////////parte de Julio para el Spline


                }

            }

            else if (atom.Representation=='VDW')                ////-------------------------------------------------------
            {
                atom.Representation=Repre;
                if (Repre=='VDW')
                {
                    //No hacer nada ya que esa es la misma representación
                }
                else if(Repre=='SB')
                {
                    var mul = (atom.PositionBSolid - 1) * nVertices;
                    for (var z = 0; z < nVertices;)
                    {
                        vertexPositionData[atom.BloqueSolid - 1][mul + z]     = verArray[z] + atmX - Cx;
                        vertexPositionData[atom.BloqueSolid - 1][mul + z + 1] = verArray[z + 1] + atmY - Cy;
                        vertexPositionData[atom.BloqueSolid - 1][mul + z + 2] = verArray[z + 2] + atmZ - Cz;

                        z = z + 3;
                    }
                    var agregar=true;
                    for(var j=0; j < ArrCont1.length; j++)
                    {
                        if ((atom.BloqueSolid - 1)==ArrCont1[j])
                        {
                            agregar=false;
                            break;
                        }
                    }
                    if (agregar==true)
                    {
                        ArrCont1.push(atom.BloqueSolid - 1);
                    }


                    for(var z=0; z< atom.LstLinea.length;) //para cáda línea prenderla si sus extremos están en SB
                    {
                        var line= atom.LstLinea[z];
                        if ((line.LstAtoms[0].Representation=='SB') && (line.LstAtoms[1].Representation=='SB' ))
                        {
                            var mul=line.BPosition * 8;
                            colores[mul + 3 ] = 1;
                            colores[mul + 7 ] = 1;
                        }
                        z=z+1;
                    }
                    BuffLineCol=true;

                }
                else if(Repre=='Bonds')
                {
                    var mul= (atom.PositionBSolid - 1) * nColor;
                    for(var j=0; j<nColor;)
                    {
                        ColorTotal[atom.BloqueSolid-1][mul + j + 3] = 0; //para apagar el color con el alpha
                        j=j+4;
                    }
                    atom.State='Inactive';
                    var agregar=true;
                    for(var j=0; j < ArrCont2.length; j++)
                    {
                        if ((atom.BloqueSolid - 1)==ArrCont2[j])
                        {
                            agregar=false;
                            break;
                        }
                    }
                    if (agregar==true)
                    {
                        ArrCont2.push(atom.BloqueSolid - 1);
                    }

                    for(var z=0; z< atom.LstLinea.length;)
                    {
                        //cada línea va a tener un id que va a ser conforme se vaya agregando al bloque de enlaces
                        var line= atom.LstLinea[z];
                        var mul=line.BPosition * 8;
                        colores[mul + 3 ] = 0;
                        colores[mul + 7 ] = 0;
                        z=z+1;
                    }
                    BuffLineCol=true;

                }
                else if(Repre=='Skeleton')
                {
                    if (atom.NameAtom=='CA')
                    {
                        var mul = (atom.PositionBSolid - 1) * nVertices;
                        for (var z = 0; z < nVertices;)
                        {
                            vertexPositionData[atom.BloqueSolid - 1][mul + z]     = verArray[z] + atmX - Cx;
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 1] = verArray[z + 1] + atmY - Cy;
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 2] = verArray[z + 2] + atmZ - Cz;

                            z = z + 3;
                        }
                        var agregar=true;
                        for(var j=0; j < ArrCont1.length; j++)
                        {
                            if ((atom.BloqueSolid - 1)==ArrCont1[j])
                            {
                                agregar=false;
                                break;
                            }
                        }
                        if (agregar==true)
                        {
                            ArrCont1.push(atom.BloqueSolid - 1);
                        }

                        for(var z=0; z< atom.LstLinea.length;) //para cáda línea prenderla
                        {
                            var line= atom.LstLinea[z];
                            var mul=line.BPosition * 8;
                            colores[mul + 3 ] = 0;
                            colores[mul + 7 ] = 0;
                            z=z+1;
                        }
                        BuffLineCol=true;
                    }
                    else
                    {
                        var mul= (atom.PositionBSolid - 1) * nColor;
                        for(var j=0; j<nColor;)
                        {
                            ColorTotal[atom.BloqueSolid-1][mul + j + 3] = 0; //para apagar el color con el alpha
                            j=j+4;
                        }
                        atom.State='Inactive';
                        var agregar=true;
                        for(var j=0; j < ArrCont2.length; j++)
                        {
                            if ((atom.BloqueSolid - 1)==ArrCont2[j])
                            {
                                agregar=false;
                                break;
                            }
                        }
                        if (agregar==true)
                        {
                            ArrCont2.push(atom.BloqueSolid - 1);
                        }
                    }

                }

                else //ponerlo en Spline
                {
                    ///////////parte de Julio para el Spline

                }

            }

            else if (atom.Representation=='Bonds')              ////-------------------------------------------------------
                                                        ///preguntar si se va a poder hacer el cambio a otra representación
            {
                atom.Representation=Repre;
                if (Repre=='Bonds')
                {
                    //No hacer nada ya que esa es la misma representación

                }
                else if(Repre=='SB')
                {
                    //checar si está inicializado el átomo en el bloque de esferas, sino inicializarlo


                }
                else if(Repre=='VDW')
                {
                    //checar si está inicializado el átomo en el bloque de esferas y ponerlo en cpk

                }
                else if(Repre=='Skeleton')
                {
                    //apagar las líneas que tenga este átomo


                }
                else //spline
                {
                    //parte de Julio

                }
            }

            else if (atom.Representation=='Skeleton')               ////-------------------------------------------------------
                                                        ///preguntar si se va a poder hacer el cambio a otra representación
            {
                atom.Representation=Repre;
                if (atom.NameAtom=='CA')
                {
                    if (Repre=='Skeleton')
                    {
                        //No hacer nada ya que esa es la misma representación
                    }
                    else if(Repre=='SB')
                    {
                        for(var z=0; z< atom.LstLinea.length;) //para cáda línea prenderla si sus extremos están en SB
                        {
                            var line= atom.LstLinea[z];
                            if ((line.LstAtoms[0].Representation=='SB') && (line.LstAtoms[1].Representation=='SB' ))
                            {
                                var mul=line.BPosition * 8;
                                colores[mul + 3 ] = 1;
                                colores[mul + 7 ] = 1;
                            }
                            z=z+1;
                        }
                        BuffLineCol=true;

                    }
                    else if(Repre=='VDW')
                    {
                        var mul = (atom.PositionBSolid - 1) * nVertices;
                        for (var z = 0; z < nVertices;) {
                            vertexPositionData[atom.BloqueSolid - 1][mul + z] = verArrayC_PB_TI_CA[z] + atmX - Cx;
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 1] = verArrayC_PB_TI_CA[z + 1] + atmY - Cy;
                            vertexPositionData[atom.BloqueSolid - 1][mul + z + 2] = verArrayC_PB_TI_CA[z + 2] + atmZ - Cz;

                            z = z + 3;
                        }

                        var agregar=true;
                        for(var j=0; j < ArrCont1.length; j++)
                        {
                            if ((atom.BloqueSolid - 1)==ArrCont1[j])
                            {
                                agregar=false;
                                break;
                            }
                        }
                        if (agregar==true)
                        {
                            ArrCont1.push(atom.BloqueSolid - 1);
                        }

                    }
                    else if(Repre=='Bonds')
                    {
                        //prender las líneas que tenga este átomo


                    }
                    else //spline
                    {
                        //parte de Julio
                    }

                }

            }

            else /// el Spline parte de Julio
            {

            }


        }
        /////////////////////////////////////////////////////////////////////////////////////////7
        for(var i=0; i < ArrCont1.length; i++)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer[ArrCont1[i]]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData[ArrCont1[i]]), gl.DYNAMIC_DRAW);
            sphereVertexPositionBuffer[ArrCont1[i]].itemSize = 3;
            sphereVertexPositionBuffer[ArrCont1[i]].numItems = vertexPositionData[ArrCont1[i]].length / 3;
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }

        for(var i=0; i < ArrCont2.length; i++)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer[ArrCont2[i]]);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorTotal[ArrCont2[i]]), gl.DYNAMIC_DRAW);
            sphereVertexColorBuffer[ArrCont2[i]].itemSize = 4;
            sphereVertexColorBuffer[ArrCont2[i]].numItems = ColorTotal[ArrCont2[i]].length / 4;
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }
        if (BuffLineCol==true)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, colorVertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colores), gl.DYNAMIC_DRAW);
            colorVertexBuffer.itemSize=4;
            colorVertexBuffer.numItems=colores.length/4;
        }
        if (BuffLineSkeleCol=true)
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, colSkeleVerBuf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coloresSkele), gl.DYNAMIC_DRAW);
            colSkeleVerBuf.itemSize=4;
            colSkeleVerBuf.numItems=coloresSkele.length/4;
        }

    }


}
function CAmino()
{
    var Amicad=[];

  for (var i = 0; i < molecule.LstChain.length; i++) {
      for (var j = 0; j < molecule.LstChain[i].LstAminoAcid.length; j++) {
        Amicad.push(molecule.LstChain[i].LstAminoAcid[j].Name);
      }
  }
    var Amicad1 = Amicad.filter(function(elem, pos) {
    return Amicad.indexOf(elem) == pos;});
      var many="";
    for(var i = 0; i < Amicad1.length; i++)
    {
    //  var button = document.getElementById( "sub-Amin" );
      many+='<li><a href="#" id='+Amicad1[i]+'>'+Amicad1[i]+'</a></li>';
  }
  return many;
}

function EliminarSeleccion()
{
    var ArrCont = [];
            if (AtomosSeleccionados.length != molecule.LstAtoms.length) //significa que todos estan seleccionados
            {
                /////////////////////////////////////////////////
                for (var i = 0; i < AtomosSeleccionados.length; i++) {
                    var atomTemp = AtomosSeleccionados[i];

                    if (atomTemp.State == 'Active') 
                    {
                        ////////////////////////////////////////
                                    var colorSet = atomTemp.ColorRGB;
                                    //quitar el átomo de la selecció (regresarlo a su color por defecto)
                                    if (atomTemp.ColorDiferente) 
                                    {
                                        colorSet = atomTemp.ColorDos;
                                    }
                        var mul = (atomTemp.PositionBSolid - 1) * nColor;
                        for (var z = 0; z < nColor;) {
                            ColorTotal[atomTemp.BloqueSolid - 1][mul + z] = colorSet[0];
                            ColorTotal[atomTemp.BloqueSolid - 1][mul + z + 1] = colorSet[1];
                            ColorTotal[atomTemp.BloqueSolid - 1][mul + z + 2] = colorSet[2];
                            ColorTotal[atomTemp.BloqueSolid - 1][mul + z + 3] = colorSet[3];
                            z = z + 4;
                        }
                        atomTemp.Seleccionado = false;

                        var agregar = true;
                        for (var j = 0; j < ArrCont.length; j++) {
                            if ((atomTemp.BloqueSolid - 1) == ArrCont[j]) {
                                agregar = false;
                                break;
                            }
                        }
                        if (agregar == true) {
                            ArrCont.push(atomTemp.BloqueSolid - 1);
                        }
                    }

                }
            }
            for (var i = 0; i < ArrCont.length; i++) {
                gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer[ArrCont[i]]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorTotal[ArrCont[i]]), gl.DYNAMIC_DRAW);
                sphereVertexColorBuffer[ArrCont[i]].itemSize = 4;
                sphereVertexColorBuffer[ArrCont[i]].numItems = ColorTotal[ArrCont[i]].length / 4;
                gl.bindBuffer(gl.ARRAY_BUFFER, null);

            }
            AtomosSeleccionados = [];

}

function CambiarColor(color) //función para cambiar el color
{
    var ArrCont = [];
    var real = false;

    var colorRGB = null;
    if (color=='red') 
    {
        colorRGB = [ 1.0, 0.0, 0.0, 1.0 ];
    }
    else if(color=='white')
    {
        colorRGB = [1.0, 1.0, 1.0, 1.0];;
    }
    else if(color=='green')
    {
        colorRGB = [0.0, 1.0, 0.0, 1.0];;
    }
    else if(color=='blue')
    {
        colorRGB = [0.0, 0.0, 1.0, 1.0];
    }
    else if(color=='magenta')
    {
        colorRGB = [1.0, 0.0, 1.0, 1.0];
    }
    else if(color=='yellow')
    {
        colorRGB = [1.0, 1.0, 0.0, 1.0];
    }
    else if(color=='atom') 
    {
        real = true;
    }
    else
    {
        var RGBstr = color.split(',');
        colorRGB = [ RGBstr[0], RGBstr[1], RGBstr[2], 1.0];
    }
    
    
    for(var i=0; i<AtomosSeleccionados.length; i++)
    {
        var atom = AtomosSeleccionados[i];
        if (real) 
        {   
            atom.ColorDiferente = false;
            colorRGB=atom.ColorRGB;
        }
        else
        {
            atom.ColorDiferente = true;
            atom.ColorDos = colorRGB;
        }

        var mul=(atom.PositionBSolid-1) * nColor;
        for (var z = 0; z < nColor;) 
        {
            ColorTotal[atom.BloqueSolid-1][mul + z]   = colorRGB[0];  //va a ser el color de la selección
            ColorTotal[atom.BloqueSolid-1][mul + z + 1]=colorRGB[1];
            ColorTotal[atom.BloqueSolid-1][mul + z + 2]=colorRGB[2];
            ColorTotal[atom.BloqueSolid-1][mul + z + 3]=colorRGB[3];
            z = z + 4;
        }

        var agregar = true;
        for (var j = 0; j < ArrCont.length; j++) 
        {
            if ((atom.BloqueSolid - 1) == ArrCont[j]) 
            {
                agregar = false;
                break;
            }
        }
        if (agregar == true) 
        {
            ArrCont.push(atom.BloqueSolid - 1);
        }
    }

    for (var i = 0; i < ArrCont.length; i++) 
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer[ArrCont[i]]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorTotal[ArrCont[i]]), gl.DYNAMIC_DRAW);
        sphereVertexColorBuffer[ArrCont[i]].itemSize = 4;
        sphereVertexColorBuffer[ArrCont[i]].numItems = ColorTotal[ArrCont[i]].length / 4;
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

    }
}

function ChangeVertexPosition()
{
    var apuntador=0;
    var NoAtomos = molecule.LstAtoms.length;
            var Restantes = NoAtomos - ((NoBloques-1) * NoPaso);
            if (NoBloques==1)
            {

                //para limpiarlos
                vertexPositionData[0]=[];

                for(var i=0; i<NoAtomos; i++)
                {

                    //la molecula tiene la lista de átomos en orden, entonces lo recorro con los i
                    var atom = molecule.LstAtoms[i];

                    //lo unico que va a cambiar es el buffer de posiciones VertexPosition
                    //alert(coordsX[molecule.LstAtoms.length*pos+i]);
                    var s=molecule.LstAtoms.length*pos+i;

                    if(bndbuffer==0)
                    {
                        if (atom.Representation=='SB')
                        {
                            ////////////si el átomo está en SB
                            for (var z=0; z<verArray.length;)
                            {
                            vertexPositionData[0].push(verArray[z]   + coordsX[s] -Cx);
                            vertexPositionData[0].push(verArray[z+1] + coordsY[s] -Cy);
                            vertexPositionData[0].push(verArray[z+2] + coordsZ[s] -Cz);

                            z=z+3;
                            }

                        }
                        else if (atom.Representation=='VDW')
                        {
                            ////////////si el átomo está en cpk
                            //for (var z=0; z<verArray.length;)
                            //{
                            //vertexPositionData[0].push(verArrayH[z]   + coordsX[s] -Cx);
                            //vertexPositionData[0].push(verArrayH[z+1] + coordsY[s] -Cy);
                            //vertexPositionData[0].push(verArrayH[z+2] + coordsZ[s] -Cz);

                            //z=z+3;
                            //}
                            
                                 if (atom.Element == 'H') {
                                      //console.log(apuntador, atom.Element);
                                    for (var z=0; z<verArray.length;)
                                    {
                                    vertexPositionData[0].push(verArrayH[z]   + coordsX[s] -Cx);
                                    vertexPositionData[0].push(verArrayH[z+1] + coordsY[s] -Cy);
                                    vertexPositionData[0].push(verArrayH[z+2] + coordsZ[s] -Cz);

                                    z=z+3;
                                    }
                                  } else {
                                      //console.log(apuntador, atom.Element);
                                    for (var z=0; z<verArray.length;)
                                    {
                                    vertexPositionData[0].push(verArrayN[z]   + coordsX[s] -Cx);
                                    vertexPositionData[0].push(verArrayN[z+1] + coordsY[s] -Cy);
                                    vertexPositionData[0].push(verArrayN[z+2] + coordsZ[s] -Cz);

                                    z=z+3;
                                    }                                  
                                  }
                            
                        }

                        //alert("vertex"+vertexPositionData[atom.BloqueSolid-1].length);

                    }
                    else
                    {
                        for (var z=0; z<verArray.length;)
                        {
                        vertexPositionData[0].push(verArray[z]   + coordsX1[s] -Cx);
                        vertexPositionData[0].push(verArray[z+1] + coordsY1[s] -Cy);
                        vertexPositionData[0].push(verArray[z+2] + coordsZ1[s] -Cz);

                        z=z+3;
                        }

                    }

                    apuntador=apuntador+1;

                //-----------------------------------------------------------------------------------------------------
                }

                gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer[0]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData[0]), gl.DYNAMIC_DRAW);
                sphereVertexPositionBuffer[0].itemSize = 3;
                sphereVertexPositionBuffer[0].numItems = vertexPositionData[0].length / 3;
                gl.bindBuffer(gl.ARRAY_BUFFER, null);


            }
            else
            {
                for(var i=0; i<NoBloques; i++)
                {

                    vertexPositionData[i]=[];

                    if (i==NoBloques-1) //esto es que llegó al último
                    {
                        for(var j=0; j<Restantes; j++)
                        {

                           //la molecula tiene la lista de átomos en orden, entonces lo recorro con los i
                            var atom = molecule.LstAtoms[apuntador];

                            //lo unico que va a cambiar es el buffer de posiciones VertexPosition
                            //alert(coordsX[molecule.LstAtoms.length*pos+i]);
                            var s=molecule.LstAtoms.length*pos+apuntador;

                            if(bndbuffer==0)
                            {
                                if (atom.Representation=='SB')
                                {
                                    ////////////si el átomo está en SB
                                    for (var z=0; z<verArray.length;)
                                    {
                                    vertexPositionData[i].push(verArray[z]   + coordsX[s] -Cx);
                                    vertexPositionData[i].push(verArray[z+1] + coordsY[s] -Cy);
                                    vertexPositionData[i].push(verArray[z+2] + coordsZ[s] -Cz);

                                    z=z+3;
                                    }

                                }
                                else if (atom.Representation=='VDW')
                                {
                                    ////////////si el átomo está en cpk
                                    //for (var z=0; z<verArray.length;)
                                    //{
                                    //vertexPositionData[i].push(verArrayH[z]   + coordsX[s] -Cx);
                                    //vertexPositionData[i].push(verArrayH[z+1] + coordsY[s] -Cy);
                                    //vertexPositionData[i].push(verArrayH[z+2] + coordsZ[s] -Cz);

                                    //z=z+3;
                                    //}

                                 if (atom.Element == 'H') {
                                      //console.log(apuntador, atom.Element);
                                    for (var z=0; z<verArray.length;)
                                    {
                                    vertexPositionData[i].push(verArrayH[z]   + coordsX[s] -Cx);
                                    vertexPositionData[i].push(verArrayH[z+1] + coordsY[s] -Cy);
                                    vertexPositionData[i].push(verArrayH[z+2] + coordsZ[s] -Cz);

                                    z=z+3;
                                    }
                                  } else {
                                      //console.log(apuntador, atom.Element);
                                    for (var z=0; z<verArray.length;)
                                    {
                                    vertexPositionData[i].push(verArrayN[z]   + coordsX[s] -Cx);
                                    vertexPositionData[i].push(verArrayN[z+1] + coordsY[s] -Cy);
                                    vertexPositionData[i].push(verArrayN[z+2] + coordsZ[s] -Cz);

                                    z=z+3;
                                    }                                  
                                  }
                                    
                                }

                            }
                            else
                            {
                                for (var z=0; z<verArray.length;)
                                {
                                vertexPositionData[i].push(verArray[z]   + coordsX1[s] -Cx);
                                vertexPositionData[i].push(verArray[z+1] + coordsY1[s] -Cy);
                                vertexPositionData[i].push(verArray[z+2] + coordsZ1[s] -Cz);

                                z=z+3;
                                }

                            }

                                apuntador=apuntador+1;

                                //---------------------------------------------------------------------------------------------------------
                            }

                    }
                    else
                    {
                        for (var j=0; j <NoPaso; j++)
                        {

                            //la molecula tiene la lista de átomos en orden, entonces lo recorro con los i
                            var atom = molecule.LstAtoms[apuntador];

                            //lo unico que va a cambiar es el buffer de posiciones VertexPosition
                            //alert(coordsX[molecule.LstAtoms.length*pos+i]);
                            var s=molecule.LstAtoms.length*pos+apuntador;

                            if(bndbuffer==0)
                            {
                                if (atom.Representation=='SB')
                                {
                                    ////////////si el átomo está en SB
                                    for (var z=0; z<verArray.length;)
                                    {

                                    vertexPositionData[i].push(verArray[z]   + coordsX[s] -Cx);
                                    vertexPositionData[i].push(verArray[z+1] + coordsY[s] -Cy);
                                    vertexPositionData[i].push(verArray[z+2] + coordsZ[s] -Cz);

                                    z=z+3;
                                    }

                                }
                                else if (atom.Representation=='VDW')
                                {
                                  if (atom.Element == 'H') {
                                      //console.log(apuntador, atom.Element);
                                    for (var z=0; z<verArray.length;)
                                    {
                                    vertexPositionData[i].push(verArrayH[z]   + coordsX[s] -Cx);
                                    vertexPositionData[i].push(verArrayH[z+1] + coordsY[s] -Cy);
                                    vertexPositionData[i].push(verArrayH[z+2] + coordsZ[s] -Cz);

                                    z=z+3;
                                    }
                                  } else {
                                      //console.log(apuntador, atom.Element);
                                    for (var z=0; z<verArray.length;)
                                    {
                                    vertexPositionData[i].push(verArrayN[z]   + coordsX[s] -Cx);
                                    vertexPositionData[i].push(verArrayN[z+1] + coordsY[s] -Cy);
                                    vertexPositionData[i].push(verArrayN[z+2] + coordsZ[s] -Cz);

                                    z=z+3;
                                    }                                  
                                  }
                                }

                            }
                            else
                            {
                                for (var z=0; z<verArray.length;)
                                {
                                    vertexPositionData[i].push(verArray[z]   + coordsX1[s] -Cx);
                                    vertexPositionData[i].push(verArray[z+1] + coordsY1[s] -Cy);
                                    vertexPositionData[i].push(verArray[z+2] + coordsZ1[s] -Cz);

                                    z=z+3;
                                }

                            }
                            apuntador=apuntador+1;

                        //---------------------------------------------------------------------------------------------------
                        }

                    }
                }

                ////////////for para la tarjeta gráfica
                for(var z=0; z<NBSphe; z++)
                {
                    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer[z]);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData[z]), gl.DYNAMIC_DRAW);
                    sphereVertexPositionBuffer[z].itemSize = 3;
                    sphereVertexPositionBuffer[z].numItems = vertexPositionData[z].length / 3;
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);

                }


            }
}

function ChangeVertexPositionStatic()
{
    var apuntador=0;
    var NoAtomos = molecule.LstAtoms.length;
            var Restantes = NoAtomos - ((NoBloques-1) * NoPaso);
            if (NoBloques==1)
            {

                //para limpiarlos
                vertexPositionData[0]=[];

                for(var i=0; i<NoAtomos; i++)
                {

                    //la molecula tiene la lista de átomos en orden, entonces lo recorro con los i
                    var atom = molecule.LstAtoms[i];

                    //lo unico que va a cambiar es el buffer de posiciones VertexPosition
                    //alert(coordsX[molecule.LstAtoms.length*pos+i]);
                    var s=molecule.LstAtoms.length*pos+i;

                    if(bndbuffer==0)
                    {
                        if (atom.Representation=='SB')
                        {
                            ////////////si el átomo está en SB
                            for (var z=0; z<verArray.length;)
                            {
                            vertexPositionData[0].push(verArray[z]   + atom.X -Cx);
                            vertexPositionData[0].push(verArray[z+1] + atom.Y -Cy);
                            vertexPositionData[0].push(verArray[z+2] + atom.Z -Cz);

                            z=z+3;
                            }

                        }
                        else if (atom.Representation=='VDW')
                        {
                            ////////////si el átomo está en cpk
                            //for (var z=0; z<verArray.length;)
                            //{
                            //vertexPositionData[0].push(verArrayH[z]   + atom.X -Cx);
                            //vertexPositionData[0].push(verArrayH[z+1] + atom.Y -Cy);
                            //vertexPositionData[0].push(verArrayH[z+2] + atom.Z -Cz);

                            //z=z+3;
                            //}

                                 if (atom.Element == 'H') {
                                      //console.log(apuntador, atom.Element);
                                    for (var z=0; z<verArray.length;)
                                    {
                                    vertexPositionData[0].push(verArrayH[z]   + atom.X -Cx);
                                    vertexPositionData[0].push(verArrayH[z+1] + atom.Y -Cy);
                                    vertexPositionData[0].push(verArrayH[z+2] + atom.Z -Cz);

                                    z=z+3;
                                    }
                                  } else {
                                      //console.log(apuntador, atom.Element);
                                    for (var z=0; z<verArray.length;)
                                    {
                                    vertexPositionData[0].push(verArrayN[z]   + atom.X -Cx);
                                    vertexPositionData[0].push(verArrayN[z+1] + atom.Y -Cy);
                                    vertexPositionData[0].push(verArrayN[z+2] + atom.Z -Cz);

                                    z=z+3;
                                    }                                  
                                  }
                         
                        
                        }

                        //alert("vertex"+vertexPositionData[atom.BloqueSolid-1].length);

                    }
                    else
                    {
                        for (var z=0; z<verArray.length;)
                        {
                        vertexPositionData[0].push(verArray[z]  + atom.X -Cx);
                        vertexPositionData[0].push(verArray[z+1]+ atom.Y -Cy);
                        vertexPositionData[0].push(verArray[z+2]+ atom.Z -Cz);

                        z=z+3;
                        }

                    }

                    apuntador=apuntador+1;

                //-----------------------------------------------------------------------------------------------------
                }

                gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer[0]);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData[0]), gl.DYNAMIC_DRAW);
                sphereVertexPositionBuffer[0].itemSize = 3;
                sphereVertexPositionBuffer[0].numItems = vertexPositionData[0].length / 3;
                gl.bindBuffer(gl.ARRAY_BUFFER, null);


            }
            else
            {
                for(var i=0; i<NoBloques; i++)
                {

                    vertexPositionData[i]=[];

                    if (i==NoBloques-1) //esto es que llegó al último
                    {
                        for(var j=0; j<Restantes; j++)
                        {

                           //la molecula tiene la lista de átomos en orden, entonces lo recorro con los i
                            var atom = molecule.LstAtoms[apuntador];

                            //lo unico que va a cambiar es el buffer de posiciones VertexPosition
                            //alert(coordsX[molecule.LstAtoms.length*pos+i]);
                            var s=molecule.LstAtoms.length*pos+apuntador;

                            if(bndbuffer==0)
                            {
                                if (atom.Representation=='SB')
                                {
                                    ////////////si el átomo está en SB
                                    for (var z=0; z<verArray.length;)
                                    {
                                    vertexPositionData[i].push(verArray[z]  + atom.X -Cx);
                                    vertexPositionData[i].push(verArray[z+1]+ atom.Y -Cy);
                                    vertexPositionData[i].push(verArray[z+2]+ atom.Z -Cz);

                                    z=z+3;
                                    }

                                }
                                else if (atom.Representation=='VDW')
                                {
                                    ////////////si el átomo está en cpk
                                    //for (var z=0; z<verArray.length;)
                                    //{
                                    //vertexPositionData[i].push(verArrayH[z]  + atom.X -Cx);
                                    //vertexPositionData[i].push(verArrayH[z+1]+ atom.Y-Cy);
                                    //vertexPositionData[i].push(verArrayH[z+2]+ atom.Z-Cz);

                                    //z=z+3;
                                    //}

                                 if (atom.Element == 'H') {
                                      //console.log(apuntador, atom.Element);
                                    for (var z=0; z<verArray.length;)
                                    {
                                    vertexPositionData[i].push(verArrayH[z]   + atom.X -Cx);
                                    vertexPositionData[i].push(verArrayH[z+1] + atom.Y -Cy);
                                    vertexPositionData[i].push(verArrayH[z+2] + atom.Z -Cz);

                                    z=z+3;
                                    }
                                  } else {
                                      //console.log(apuntador, atom.Element);
                                    for (var z=0; z<verArray.length;)
                                    {
                                    vertexPositionData[i].push(verArrayN[z]   + atom.X -Cx);
                                    vertexPositionData[i].push(verArrayN[z+1] + atom.Y -Cy);
                                    vertexPositionData[i].push(verArrayN[z+2] + atom.Z -Cz);

                                    z=z+3;
                                    }                                  
                                  }
                                    
                                }

                            }
                            else
                            {
                                for (var z=0; z<verArray.length;)
                                {
                                vertexPositionData[i].push(verArray[z]  + atom.X -Cx);
                                vertexPositionData[i].push(verArray[z+1]+ atom.Y -Cy);
                                vertexPositionData[i].push(verArray[z+2] + atom.Z-Cz);

                                z=z+3;
                                }

                            }

                                apuntador=apuntador+1;

                                //---------------------------------------------------------------------------------------------------------
                            }

                    }
                    else
                    {
                        for (var j=0; j <NoPaso; j++)
                        {

                            //la molecula tiene la lista de átomos en orden, entonces lo recorro con los i
                            var atom = molecule.LstAtoms[apuntador];

                            //lo unico que va a cambiar es el buffer de posiciones VertexPosition
                            //alert(coordsX[molecule.LstAtoms.length*pos+i]);
                            var s=molecule.LstAtoms.length*pos+apuntador;

                            if(bndbuffer==0)
                            {
                                if (atom.Representation=='SB')
                                {
                                    ////////////si el átomo está en SB
                                    for (var z=0; z<verArray.length;)
                                    {

                                    vertexPositionData[i].push(verArray[z]  + atom.X -Cx);
                                    vertexPositionData[i].push(verArray[z+1]+ atom.Y -Cy);
                                    vertexPositionData[i].push(verArray[z+2]+ atom.Z -Cz);

                                    z=z+3;
                                    }

                                }
                                else if (atom.Representation=='VDW')
                                {
                                    ////////////si el átomo está en vdw
                                    //for (var z=0; z<verArray.length;)
                                    //{
                                    //vertexPositionData[i].push(verArrayH[z]  + atom.X -Cx);
                                    //vertexPositionData[i].push(verArrayH[z+1]+ atom.Y -Cy);
                                    //vertexPositionData[i].push(verArrayH[z+2]+ atom.Z -Cz);

                                    //z=z+3;
                                    //}

                                 if (atom.Element == 'H') {
                                      //console.log(apuntador, atom.Element);
                                    for (var z=0; z<verArray.length;)
                                    {
                                    vertexPositionData[i].push(verArrayH[z]   + atom.X -Cx);
                                    vertexPositionData[i].push(verArrayH[z+1] + atom.Y -Cy);
                                    vertexPositionData[i].push(verArrayH[z+2] + atom.Z -Cz);

                                    z=z+3;
                                    }
                                  } else {
                                      //console.log(apuntador, atom.Element);
                                    for (var z=0; z<verArray.length;)
                                    {
                                    vertexPositionData[i].push(verArrayN[z]   + atom.X -Cx);
                                    vertexPositionData[i].push(verArrayN[z+1] + atom.Y -Cy);
                                    vertexPositionData[i].push(verArrayN[z+2] + atom.Z -Cz);

                                    z=z+3;
                                    }                                  
                                  }
                                    
                                }

                            }
                            else
                            {
                                for (var z=0; z<verArray.length;)
                                {
                                    vertexPositionData[i].push(verArray[z]  + atom.X -Cx);
                                    vertexPositionData[i].push(verArray[z+1]+ atom.Y-Cy);
                                    vertexPositionData[i].push(verArray[z+2]+ atom.Z-Cz);

                                    z=z+3;
                                }

                            }
                            apuntador=apuntador+1;

                        //---------------------------------------------------------------------------------------------------
                        }

                    }
                }

                ////////////for para la tarjeta gráfica
                for(var z=0; z<NBSphe; z++)
                {
                    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer[z]);
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData[z]), gl.DYNAMIC_DRAW);
                    sphereVertexPositionBuffer[z].itemSize = 3;
                    sphereVertexPositionBuffer[z].numItems = vertexPositionData[z].length / 3;
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);

                }


            }


            //----------------------------------------  PARTE DE LOS ENLACES   ------------------------------------------------
            //alert(verticesLineas);
            verticesLineas = [];
            for (var i=0; i<molecule.LstBonds.length;i++)
            {
                var atm1 = molecule.LstBonds[i].LstAtoms[0];
                var atm2 = molecule.LstBonds[i].LstAtoms[1];
                
                verticesLineas.push(atm1.X -Cx); 
                verticesLineas.push(atm1.Y -Cy);
                verticesLineas.push(atm1.Z -Cz);
            
                verticesLineas.push(atm2.X -Cx); 
                verticesLineas.push(atm2.Y -Cy);
                verticesLineas.push(atm2.Z -Cz);

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

                verLineSkele.push(atm1.X -Cx); 
                verLineSkele.push(atm1.Y -Cy);
                verLineSkele.push(atm1.Z -Cz);
            
                verLineSkele.push(atm2.X -Cx); 
                verLineSkele.push(atm2.Y -Cy);
                verLineSkele.push(atm2.Z -Cz);

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
}

function NoAtomCenter()
{
     return function(event) {
        Cx=Cxtemp;
        Cy=Cytemp;
        Cz=Cztemp;

        ChangeVertexPositionStatic();
    }
    
}
function Prueba()
{
    alert("entra");
}


