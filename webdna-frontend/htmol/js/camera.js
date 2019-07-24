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

function initCamera(PersZ)
{
    Cx=molecule.CenterX;
    Cy=molecule.CenterY;
    Cz=molecule.CenterZ;

    Cxtemp = Cx;
    Cytemp = Cy;
    Cztemp = Cy;

    z=-Cz;

    var sum=Cx;
    if (Cx<Cy) 
    {
        sum=Cy;
    }
    
  
    CameraPosition = PersZ * (-2);
    CameraPosition = CameraPosition + sum;
    
    ZoomMotion=Math.ceil(CameraPosition/10);

}