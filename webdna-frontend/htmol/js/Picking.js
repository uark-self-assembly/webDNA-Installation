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

function handleMouseDown(event) 
{
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;


    var rect = event.target.getBoundingClientRect();
    if (rect.left <= lastMouseX && lastMouseX < rect.right && rect.top <= lastMouseY && lastMouseY < rect.bottom) 
    {
        //Tengo q llamar al drawscene 2 veces
        /*
        var renderbuffer = gl.createRenderbuffer();
        gl.bindBuffer(gl.RENDERBUFFER, renderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,  gl.viewportWidth,gl.viewportHeight);

        var framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);*/

        var u_Clicked = gl.getUniformLocation(program, 'uOffscreen');

        gl.uniform1i(u_Clicked, 1);
        drawScene(1);

        var pixels = new Uint8Array(4);
        var pixelsUp = new Uint8Array(4);
        var pixelsDown = new Uint8Array(4);
        var pixelsLeft = new Uint8Array(4);
        var pixelsRight = new Uint8Array(4);
        
        var pixels = new Uint8Array(4);

        gl.readPixels(lastMouseX - rect.left, rect.bottom - lastMouseY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        if (pixels[0] > 0 || pixels[1] > 0 || pixels[2] > 0) 
        {
            gl.readPixels(lastMouseX - rect.left, rect.bottom - lastMouseY + 2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelsUp);
            gl.readPixels(lastMouseX - rect.left, rect.bottom - lastMouseY - 2, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelsDown);
            gl.readPixels(lastMouseX - rect.left - 2, rect.bottom - lastMouseY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelsLeft);
            gl.readPixels(lastMouseX - rect.left + 2, rect.bottom - lastMouseY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelsRight);

            if ((pixelsUp[0] == pixelsDown[0] && pixelsUp[1] == pixelsDown[1] && pixelsUp[2] == pixelsDown[2]) || (pixelsLeft[0] == pixelsRight[0] && pixelsLeft[1] == pixelsRight[1] && pixelsLeft[2] == pixelsRight[2])) {


                var atom = GetAtom(pixels);
                if (atom!=null) 
                {
                  
                    if (AtomosSeleccionados.length==molecule.LstAtoms.length) 
                    {
                        AtomosSeleccionados=[];
                    }

                    if (atom.State == 'Active') 
                    {
                        if (DistanceBool) 
                        {
                            var mul = (atom.PositionBSolid - 1) * nColor;
                            for (var z = 0; z < nColor;) 
                            {
                                ColorTotal[atom.BloqueSolid - 1][mul + z] = 0; //va a ser el color de la selección
                                ColorTotal[atom.BloqueSolid - 1][mul + z + 1] = 1;
                                ColorTotal[atom.BloqueSolid - 1][mul + z + 2] = 0;
                                ColorTotal[atom.BloqueSolid - 1][mul + z + 3] = 1;
                                z = z + 4;
                            }
                            gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer[atom.BloqueSolid - 1]);
                            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorTotal[atom.BloqueSolid - 1]), gl.DYNAMIC_DRAW);
                            sphereVertexColorBuffer[atom.BloqueSolid - 1].numItems = ColorTotal[atom.BloqueSolid - 1].length / 4;
                            gl.bindBuffer(gl.ARRAY_BUFFER, null);
                            //////////////////////////////////////////////////
                            AtomosSeleccionados.push(atom);
                            if (!((AtomosSeleccionados.length) % 2)) 
                            {
                                var x1, y1, z1, x2, y2, z2;
                                //procesar los últimos 2
                                var atm1 = AtomosSeleccionados[AtomosSeleccionados.length - 1];
                                var atm2 = AtomosSeleccionados[AtomosSeleccionados.length - 2];
                                if (DinamicaActiva)  //
                                {
                                    var s=molecule.LstAtoms.length * pos + (atm1.id-1);
                                    var t=molecule.LstAtoms.length * pos + (atm2.id-1);
                                    //entonces toman las posiciones x y z del frame en el que se encuentra
                                    if(bndbuffer==0)
                                    {
                                        x1=coordsX[s];
                                        y1=coordsY[s];
                                        z1=coordsZ[s];

                                        x2=coordsX[t];
                                        y2=coordsY[t];
                                        z2=coordsZ[t];
                                    }
                                    else
                                    {
                                        x1=coordsX1[s];
                                        y1=coordsY1[s];
                                        z1=coordsZ1[s];

                                        x2=coordsX1[t];
                                        y2=coordsY1[t];
                                        z2=coordsZ1[t];
                                    }
                                }
                                else
                                {
                                    x1=atm1.X;
                                    y1=atm1.Y;
                                    z1=atm1.Z;

                                    x2=atm2.X;
                                    y2=atm2.Y;
                                    z2=atm2.Z; 
                                }
                                NumDistance(x1, y1, z1, x2, y2, z2);
                                initBufDigit();
                            }

                        }
                        else if(AngleBool)
                        {
                            var mul = (atom.PositionBSolid - 1) * nColor;
                            for (var z = 0; z < nColor;) 
                            {
                                ColorTotal[atom.BloqueSolid - 1][mul + z] = 0; //va a ser el color de la selección
                                ColorTotal[atom.BloqueSolid - 1][mul + z + 1] = 1;
                                ColorTotal[atom.BloqueSolid - 1][mul + z + 2] = 0;
                                ColorTotal[atom.BloqueSolid - 1][mul + z + 3] = 1;
                                z = z + 4;
                            }
                            gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer[atom.BloqueSolid - 1]);
                            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorTotal[atom.BloqueSolid - 1]), gl.DYNAMIC_DRAW);
                            sphereVertexColorBuffer[atom.BloqueSolid - 1].numItems = ColorTotal[atom.BloqueSolid - 1].length / 4;
                            gl.bindBuffer(gl.ARRAY_BUFFER, null);
                            ////////////////////////////////////////////////
                            AtomosSeleccionados.push(atom);
                            if (!((AtomosSeleccionados.length) % 3)) //cada que se seleccionen 3 átomos
                            {
                                var x1, y1, z1, x2, y2, z2, x3, y3, z3;
                                //procesar los últimos 3
                                var atm1 = AtomosSeleccionados[AtomosSeleccionados.length - 1];
                                var atm2 = AtomosSeleccionados[AtomosSeleccionados.length - 2];
                                var atm3 = AtomosSeleccionados[AtomosSeleccionados.length - 3];
                                if (DinamicaActiva)  //
                                {
                                    var s=molecule.LstAtoms.length * pos + (atm1.id-1);
                                    var t=molecule.LstAtoms.length * pos + (atm2.id-1);
                                    var u=molecule.LstAtoms.length * pos + (atm3.id-1);
                                    //entonces toman las posiciones x y z del frame en el que se encuentra
                                    if(bndbuffer==0)
                                    {
                                        x1=coordsX[s];
                                        y1=coordsY[s];
                                        z1=coordsZ[s];

                                        x2=coordsX[t];
                                        y2=coordsY[t];
                                        z2=coordsZ[t];

                                        x3=coordsX[u];
                                        y3=coordsY[u];
                                        z3=coordsZ[u];
                                    }
                                    else
                                    {
                                        x1=coordsX1[s];
                                        y1=coordsY1[s];
                                        z1=coordsZ1[s];

                                        x2=coordsX1[t];
                                        y2=coordsY1[t];
                                        z2=coordsZ1[t];

                                        x3=coordsX1[u];
                                        y3=coordsY1[u];
                                        z3=coordsZ1[u];
                                    }
                                }
                                else
                                {
                                    x1=atm1.X;
                                    y1=atm1.Y;
                                    z1=atm1.Z;

                                    x2=atm2.X;
                                    y2=atm2.Y;
                                    z2=atm2.Z; 

                                    x3=atm3.X;
                                    y3=atm3.Y;
                                    z3=atm3.Z; 
                                }

                                NumAngle(x1, y1, z1, x2, y2, z2, x3, y3, z3);
                                initBufDigit();
                            }

                        }

                        else
                        {
                            ////////////////////////////////////////////////////////////////////////////////////////
                            /////////////////////////////// TECLA SHIFT PRESIONADA //////////////////////////////////
                            ////////////////////////////////////////////////////////////////////////////////////////
                            //alert(atom.NumberAtom);
                            if (event.shiftKey) 
                            {
                                //////////////////// EL ATOMO SELECCIONADO YA ESTABA SELECCIONADO ///////////////////////
                                if (atom.Seleccionado == true) 
                                {
                                    ////////////////////////////////////////
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

                                    var posit = 0;
                                    for (var k = 0; k < AtomosSeleccionados.length; k++) 
                                    {
                                        if (AtomosSeleccionados[k] == atom) 
                                        {
                                            posit = k;
                                            break;
                                        }

                                    }
                                    AtomosSeleccionados.splice(posit, 1);

                                }

                                /////////////////////////////////////////////////////////////////////////////////////////
                                //////////////////// EL ATOMO SELECCIONADO NO ESTABA SELECCIONADO ///////////////////////
                                else 
                                {
                                    var mul=(atom.PositionBSolid-1) * nColor;
                                    for (var z = 0; z < nColor;) 
                                    {
                                        ColorTotal[atom.BloqueSolid-1][mul + z]   = 0;  //va a ser el color de la selección
                                        ColorTotal[atom.BloqueSolid-1][mul + z + 1]=1;
                                        ColorTotal[atom.BloqueSolid-1][mul + z + 2]=0;
                                        ColorTotal[atom.BloqueSolid-1][mul + z + 3]=1;
                                        z = z + 4;
                                    }
                                    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer[atom.BloqueSolid-1]);
                                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorTotal[atom.BloqueSolid-1]), gl.DYNAMIC_DRAW);
                                    sphereVertexColorBuffer[atom.BloqueSolid-1].numItems = ColorTotal[atom.BloqueSolid-1].length / 4;
                                    gl.bindBuffer(gl.ARRAY_BUFFER, null);    

                                    atom.Seleccionado=true;
                                    AtomosSeleccionados.push(atom);

                                }                        

                            }
                            //////////////////////////////////////////////////////////////////////////////////////////
                            //////////////////////////////// SIN PRESIONAR LA TECLA SHIFT//////////////////////////////
                            //////////////////////////////////////////////////////////////////////////////////////////
                            else 
                            {
                                //alert("sin tecla crl");
                                //////////////////// EL ATOMO SELECCIONADO YA ESTABA SELECCIONADO ///////////////////////
                                //----------------------------------- poner todos en color normal ------------------------------------
                                if (atom.Seleccionado == true) 
                                {
                                    EliminarSeleccion();                           

                                }

                                //////////////////// EL ATOMO SELECCIONADO NO ESTABA SELECCIONADO ///////////////////////
                                //------ poner todos en solid menos este
                                else 
                                {
                                    EliminarSeleccion();

                                    var mul=(atom.PositionBSolid-1) * nColor;
                                    for (var z = 0; z < nColor;) 
                                    {
                                        ColorTotal[atom.BloqueSolid-1][mul + z]   = 0;  //va a ser el color de la selección
                                        ColorTotal[atom.BloqueSolid-1][mul + z + 1]=1;
                                        ColorTotal[atom.BloqueSolid-1][mul + z + 2]=0;
                                        ColorTotal[atom.BloqueSolid-1][mul + z + 3]=1;
                                        z = z + 4;
                                    }
                                    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexColorBuffer[atom.BloqueSolid-1]);
                                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ColorTotal[atom.BloqueSolid-1]), gl.DYNAMIC_DRAW);
                                    sphereVertexColorBuffer[atom.BloqueSolid-1].numItems = ColorTotal[atom.BloqueSolid-1].length / 4;
                                    gl.bindBuffer(gl.ARRAY_BUFFER, null);
                                    //////////////////////////////////////////////////
                                    AtomosSeleccionados.push(atom);
                                    ///////////////////////////////////////////////////
                                    atom.Seleccionado=true;               

                                }
                            }

                        }
                        

                        document.getElementById('data').innerHTML = atom.NumberAtom + ' ' + atom.Element + ' ' + atom.NameAtom + ' ' + atom.X + ' ' + atom.Y + ' ' + atom.Z + ' ' + atom.Aminoacid + ' ' + atom.AminoNum;
                        //document.getElementById('data').innerHTML= "contador: "+contadores;


                    }

                }



            }


                
            //document.getElementById('data').innerHTML=(lastMouseX-rect.left)+' '+(rect.bottom-lastMouseY);

            //alert(GetNumAtom(pixels));

            //document.getElementById('data').innerHTML= 'number:' + number + ' '+ atom.NumberAtom+' '+atom.Element+' '+atom.NameAtom+' '+atom.X+' '+atom.Y+' '+atom.Z + ' readPixels:' + pixels[0] + ' ' + pixels[1] + ' ' + pixels[2];
            //alert(pixels[0] + ' ' + pixels[1] + ' ' + pixels[2]);
            //ColorTotal[0]=ColorTotalDiffuse[0];
            //alert(11);
        }

        gl.uniform1i(u_Clicked, 0);
        drawScene(0);

    }
}

function handleMouseUp(event) 
{
    mouseDown = false;
}

function handleMouseMove(event) 
{
    if (!mouseDown) 
    {
        return;
    }
    var newX = event.clientX;
    var newY = event.clientY;

    var deltaX = newX - lastMouseX
    var newRotationMatrix = mat4.create();
    mat4.identity(newRotationMatrix);
    mat4.rotate(newRotationMatrix, degToRad(deltaX / 5), [0, 1, 0]);

    var deltaY = newY - lastMouseY;
    mat4.rotate(newRotationMatrix, degToRad(deltaY / 5), [1, 0, 0]);

    mat4.multiply(newRotationMatrix, RotationMatrix, RotationMatrix);

    lastMouseX = newX
    lastMouseY = newY;
}


