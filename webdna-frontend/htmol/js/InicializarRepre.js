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

//esta es la inicialización o cambio de representación de toda la molécula

function InitBufRepreDefault(command)
{
    var todo=command.split(";");
    todo.forEach(function(item,index){
        main.Parse(item);
    });
}


function InitBufSB()
{
    OptRep=false;//Para que no entre en Spline
    cleanMemory();

    initBuffersSpheresSB();

    initBuffersBonds(true);

    initBufBndSkele(false);

    AtomosSeleccionados=molecule.LstAtoms;

}

function InitBufVDW()
{
    OptRep=false;//Para que no entre en Spline
    cleanMemory();

    initBuffersSpheresVDW();

    initBuffersBonds(false);

    initBufBndSkele(false);

    AtomosSeleccionados=molecule.LstAtoms;

}

function InitBufBonds()
{
    OptRep=false;//Para que no entre en Spline
    cleanMemory();

    initBuffersBonds(true);

    initBufBndSkele(false);

    AtomosSeleccionados=molecule.LstAtoms;
}


function InitBufSkeleton()
{
    OptRep=false;//Para que no entre en Spline
    cleanMemory();

    initBuffersBonds(false);

    initBufBndSkele(true);

    //Inicializar los CA de todos los átomos de la molécula

    AtomosSeleccionados=molecule.LstAtoms;

}
function InitBufSpline()
{
    cleanMemory();
    OptRep=true;//Para que dibuje Spline
    initBuffersBonds(false);
    initBufBndSkele(false);
    initBufferSpline();


    //Inicializar los CA de todos los átomos de la molécula

    //AtomosSeleccionados=molecule.LstAtoms;

}
