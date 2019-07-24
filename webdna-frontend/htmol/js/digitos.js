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

//función para imprimir el valor por medio de triángulos
 var indxOffset=0; //es para el offset que me genere cáda dígito --------------------------------------hacerlo global

 function NumDistance(a1X,a1Y,a1Z,a2X,a2Y,a2Z)
 {

    var xx1=a2X;
    var xx2=a1X;

    var yy1=a2Y;
    var yy2=a1Y;

    var zz1=a2Z;
    var zz2=a1Z;

    var dist = Math.sqrt(   Math.pow( xx1 - xx2 , 2) + Math.pow( yy1 - yy2, 2) + Math.pow( zz1 - zz2, 2) );

    if(dist>0)  /////NaN
    {
        dist=Number((dist).toFixed(3));

        var distStr= dist.toString();
        //alert(distStr);
        //alert( distStr.length );

        //calcular la posición donde va a ir el número flotante
        var xx3=0;
        var yy3=0;
        var zz3=0;

        if (xx2 > xx1) 
        {
            xx3 = ((xx2 - xx1) / 2 ) +xx1;
        }
        else
        {
            xx3 = ((xx1 - xx2) / 2 ) +xx2;
        }
        if (yy2 > yy1) 
        {
            yy3 = ((yy2 - yy1) / 2 ) +yy1;
        }
        else
        {
            yy3 = ((yy1 - yy2) / 2 ) +yy2;
        }
        if (zz2 > zz1) 
        {
            zz3 = ((zz2 - zz1) / 2 ) +zz1;
        }
        else
        {
            zz3 = ((zz1 - zz2) / 2 ) +zz2;
        }

        //le sumo el offset de toda la molécula
        xx3=xx3 - Cx - 0.8;
        yy3=yy3 - Cy + 0.2;
        zz3=zz3 - Cz;

        DrawNumber(distStr, xx3, yy3, zz3, false);


    }

    
 }


function NumAngle(a1X, a1Y, a1Z, a2X, a2Y, a2Z, a3X, a3Y, a3Z)
{
    var xx1=a1X;
    var xx2=a2X;
    var xx3=a3X;

    var yy1=a1Y;
    var yy2=a2Y;
    var yy3=a3Y;

    var zz1=a1Z;
    var zz2=a2Z;
    var zz3=a3Z;

    var v1 = [ xx2-xx1, yy2-yy1, zz2-zz1 ];
    var v2 = [ xx2-xx3, yy2-yy3, zz2-zz3 ];

    //alert("xx1:" + xx1 + " yy1:" + yy1 + " zz1:" + zz1);
    //alert("xx2:" + xx2 + " yy2:" + yy2 + " zz2:" + zz2);
    //alert("xx3:" + xx3 + " yy3:" + yy3 + " zz3:" + zz3);
    //alert("v1[0]:" + v1[0] + " v1[1]:" + v1[1] + " v1[2]:" + v1[2]);
    //alert("v2[0]:" + v2[0] + " v2[1]:" + v2[1] + " v2[2]:" + v2[2]);

    var tmp =( (v1[0] * v2[0])  +  (v1[1] * v2[1])  +  (v1[2] * v2[2]) )  /  ( Math.sqrt(Math.pow(v1[0], 2) + Math.pow(v1[1], 2) + Math.pow(v1[2], 2))  *  Math.sqrt(Math.pow(v2[0], 2) + Math.pow(v2[1], 2) + Math.pow(v2[2], 2)) )

    var angulo=(180*Math.acos(tmp))/Math.PI;       
         
    //alert(angulo.toFixed(2));
    angulo = angulo.toFixed(2);

    if (angulo>0) 
    {
        var xx4= xx2 - Cx + 0.4; //con un offset en x
        var yy4= yy2 - Cy - 0.2;
        var zz4= zz2 - Cz;

        var angleStr= angulo.toString();

        DrawNumber(angleStr, xx4, yy4, zz4, true);


    }

}

function DrawNumber(Num, xx3, yy3, zz3, AngleBool)
{

    var numElementos=0;
    var char_scale=5;
    var char_offset=1.0;
        
        
        for(var i=0; i<Num.length; i++)
        {
            if (Num[i]==1) 
            {
                //agrego el dígito 1
                numElementos=diPos1.length; //es el número de vértices

                for(var j=0; j<numElementos;)
                {
                    diPosition.push( diPos1[j] * char_scale  + xx3 ); //es el x
                    diPosition.push( diPos1[j+1] * char_scale + yy3 ); //es el y
                    diPosition.push( diPos1[j+2] * char_scale + zz3 ); //es el z

                    j=j+3;
                }

                //le doy el offset para que el siguiente número se imprima un poco más en x
                xx3 = xx3 + char_offset;

                //agrego los índices
                for(var j=0; j< diInd1.length; j++)
                {
                    diIndex.push( diInd1[j] + indxOffset );
                }
                indxOffset=indxOffset+4;            

            }
            else if(Num[i]==2)
            {
                //agrego el dígito 2
                numElementos=diPos2.length; //es el número de vértices

                for(var j=0; j<numElementos;)
                {
                    diPosition.push( diPos2[j] * char_scale   + xx3 ); //es el x
                    diPosition.push( diPos2[j+1] * char_scale + yy3 ); //es el y
                    diPosition.push( diPos2[j+2] * char_scale + zz3 ); //es el z

                    j=j+3;
                }

                //le doy el offset para que el siguiente número se imprima un poco más en x
                xx3 = xx3 + char_offset;

                //agrego los índices
                for(var j=0; j< diInd2.length; j++)
                {
                    diIndex.push( diInd2[j] + indxOffset );
                }
                indxOffset=indxOffset+19;   

            }
            else if(Num[i]==3)
            {

                //agrego el dígito 3
                numElementos=diPos3.length; //es el número de vértices

                for(var j=0; j<numElementos;)
                {
                    diPosition.push( diPos3[j] * char_scale   + xx3 ); //es el x
                    diPosition.push( diPos3[j+1] * char_scale + yy3 ); //es el y
                    diPosition.push( diPos3[j+2] * char_scale + zz3 ); //es el z

                    j=j+3;
                }

                //le doy el offset para que el siguiente número se imprima un poco más en x
                xx3 = xx3 + char_offset;

                //agrego los índices
                for(var j=0; j< diInd3.length; j++)
                {
                    diIndex.push( diInd3[j] + indxOffset );
                }
                indxOffset=indxOffset+27;         

            }
            else if(Num[i]==4)
            {
                //agrego el dígito 4
                numElementos=diPos4.length; //es el número de vértices

                for(var j=0; j<numElementos;)
                {
                    diPosition.push( diPos4[j] * char_scale   + xx3 ); //es el x
                    diPosition.push( diPos4[j+1] * char_scale + yy3 ); //es el y
                    diPosition.push( diPos4[j+2] * char_scale + zz3 ); //es el z

                    j=j+3;
                }

                //le doy el offset para que el siguiente número se imprima un poco más en x
                xx3 = xx3 + char_offset;

                //agrego los índices
                for(var j=0; j< diInd4.length; j++)
                {
                    diIndex.push( diInd4[j] + indxOffset );
                }
                indxOffset=indxOffset+15;
            }
            else if(Num[i]==5)
            {
                //agrego el dígito 5
                numElementos=diPos5.length; //es el número de vértices

                for(var j=0; j<numElementos;)
                {
                    diPosition.push( diPos5[j] * char_scale   + xx3 ); //es el x
                    diPosition.push( diPos5[j+1] * char_scale + yy3 ); //es el y
                    diPosition.push( diPos5[j+2] * char_scale + zz3 ); //es el z

                    j=j+3;
                }

                //le doy el offset para que el siguiente número se imprima un poco más en x
                xx3 = xx3 + char_offset;

                //agrego los índices
                for(var j=0; j< diInd5.length; j++)
                {
                    diIndex.push( diInd5[j] + indxOffset );
                }
                indxOffset=indxOffset+18;
                
            }
            else if(Num[i]==6)
            {
                 //agrego el dígito 6
                numElementos=diPos6.length; //es el número de vértices

                for(var j=0; j<numElementos;)
                {
                    diPosition.push( diPos6[j] * char_scale   + xx3 ); //es el x
                    diPosition.push( diPos6[j+1] * char_scale + yy3 ); //es el y
                    diPosition.push( diPos6[j+2] * char_scale + zz3 ); //es el z

                    j=j+3;
                }

                //le doy el offset para que el siguiente número se imprima un poco más en x
                xx3 = xx3 + char_offset;

                //agrego los índices
                for(var j=0; j< diInd6.length; j++)
                {
                    diIndex.push( diInd6[j] + indxOffset );
                }
                indxOffset=indxOffset+21;
                
            }
            else if(Num[i]==7)
            {
                 //agrego el dígito 7
                numElementos=diPos7.length; //es el número de vértices

                for(var j=0; j<numElementos;)
                {
                    diPosition.push( diPos7[j] * char_scale   + xx3 ); //es el x
                    diPosition.push( diPos7[j+1] * char_scale + yy3 ); //es el y
                    diPosition.push( diPos7[j+2] * char_scale + zz3 ); //es el z

                    j=j+3;
                }

                //le doy el offset para que el siguiente número se imprima un poco más en x
                xx3 = xx3 + char_offset;

                //agrego los índices
                for(var j=0; j< diInd7.length; j++)
                {
                    diIndex.push( diInd7[j] + indxOffset );
                }
                indxOffset=indxOffset+6;
                
            }
            else if(Num[i]==8)
            {
                 //agrego el dígito 8
                numElementos=diPos8.length; //es el número de vértices

                for(var j=0; j<numElementos;)
                {
                    diPosition.push( diPos8[j] * char_scale   + xx3 ); //es el x
                    diPosition.push( diPos8[j+1] * char_scale + yy3 ); //es el y
                    diPosition.push( diPos8[j+2] * char_scale + zz3 ); //es el z

                    j=j+3;
                }

                //le doy el offset para que el siguiente número se imprima un poco más en x
                xx3 = xx3 + char_offset;

                //agrego los índices
                for(var j=0; j< diInd8.length; j++)
                {
                    diIndex.push( diInd8[j] + indxOffset );
                }
                indxOffset=indxOffset+32;
                
            }
            else if(Num[i]==9)
            {
                 //agrego el dígito 9
                numElementos=diPos9.length; //es el número de vértices

                for(var j=0; j<numElementos;)
                {
                    diPosition.push( diPos9[j] * char_scale   + xx3 ); //es el x
                    diPosition.push( diPos9[j+1] * char_scale + yy3 ); //es el y
                    diPosition.push( diPos9[j+2] * char_scale + zz3 ); //es el z

                    j=j+3;
                }

                //le doy el offset para que el siguiente número se imprima un poco más en x
                xx3 = xx3 + char_offset;

                //agrego los índices
                for(var j=0; j< diInd9.length; j++)
                {
                    diIndex.push( diInd9[j] + indxOffset );
                }
                indxOffset=indxOffset+23;
                
            }
            else if(Num[i]==0)
            {
                 //agrego el dígito 0
                numElementos=diPos0.length; //es el número de vértices

                for(var j=0; j<numElementos;)
                {
                    diPosition.push( diPos0[j] * char_scale   + xx3 ); //es el x
                    diPosition.push( diPos0[j+1] * char_scale + yy3 ); //es el y
                    diPosition.push( diPos0[j+2] * char_scale + zz3 ); //es el z

                    j=j+3;
                }

                //le doy el offset para que el siguiente número se imprima un poco más en x
                xx3 = xx3 + char_offset;

                //agrego los índices
                for(var j=0; j< diInd0.length; j++)
                {
                    diIndex.push( diInd0[j] + indxOffset );
                }
                indxOffset=indxOffset+ 16;
                
            }
            else //sería el punto
            {
                //agrego el dígito .
                numElementos=diPunto.length; //es el número de vértices

                for(var j=0; j<numElementos;)
                {
                    diPosition.push( diPunto[j] * char_scale   + xx3 ); //es el x
                    diPosition.push( diPunto[j+1] * char_scale + yy3 ); //es el y
                    diPosition.push( diPunto[j+2] * char_scale + zz3 ); //es el z

                    j=j+3;
                }

                //le doy el offset para que el siguiente número se imprima un poco más en x
                xx3 = xx3 + char_offset;

                //agrego los índices
                for(var j=0; j< diIndPunto.length; j++)
                {
                    diIndex.push( diIndPunto[j] + indxOffset );
                }
                indxOffset=indxOffset+ 8;            
            }

            for(j=0; j<numElementos; )
            {
                //para agregar el color
                diColor.push(0);
                diColor.push(1);
                diColor.push(0);
                diColor.push(1);

                diColorDif.push(0);
                diColorDif.push(0);
                diColorDif.push(0);
                diColorDif.push(0);

                diNormal.push(1);
                diNormal.push(1);
                diNormal.push(1);

                chaIndex.push(1.5);
                chaIndex.push(1.5);

                j=j+3;
            }
        }

        if (AngleBool) 
        {
            //al final agrego el grado
        //agrego el dígito grado
                numElementos=diGrado.length; //es el número de vértices

                for(var j=0; j<numElementos;)
                {
                    diPosition.push( diGrado[j] * char_scale * 2   + xx3   + char_offset); //es el x
                    diPosition.push( diGrado[j+1] * char_scale * 2 + yy3 ); //es el y
                    diPosition.push( diGrado[j+2] * char_scale * 2 + zz3 ); //es el z

                    j=j+3;
                }

                //le doy el offset para que el siguiente número se imprima un poco más en x
                xx3 = xx3 + char_offset;

                //agrego los índices
                for(var j=0; j< diIndGrado.length; j++)
                {
                    diIndex.push( diIndGrado[j] + indxOffset );
                }
                indxOffset=indxOffset+ 16;            
            

            for(j=0; j<numElementos; )
            {
                //para agregar el color
                diColor.push(0);
                diColor.push(1);
                diColor.push(0);
                diColor.push(1);

                diColorDif.push(0);
                diColorDif.push(0);
                diColorDif.push(0);
                diColorDif.push(0);

                diNormal.push(1);
                diNormal.push(1);
                diNormal.push(1);

                chaIndex.push(1.5);
                chaIndex.push(1.5);

                j=j+3;
            }


        }
        else
        {
            //al final agrego el nm
        //agrego el dígito nm
                xx3 = xx3 + 0.1;
                numElementos=diNM.length; //es el número de vértices

                for(var j=0; j<numElementos;)
                {
                    diPosition.push( diNM[j] * char_scale * 2   + xx3  + char_offset); //es el x
                    diPosition.push( diNM[j+1] * char_scale * 2 + yy3 ); //es el y
                    diPosition.push( diNM[j+2] * char_scale * 2 + zz3 ); //es el z

                    j=j+3;
                }

                //le doy el offset para que el siguiente número se imprima un poco más en x
                xx3 = xx3 + char_offset;

                //agrego los índices
                for(var j=0; j< diIndNM.length; j++)
                {
                    diIndex.push( diIndNM[j] + indxOffset );
                }
                indxOffset=indxOffset+ 44;            
            

            for(j=0; j<numElementos; )
            {
                //para agregar el color
                diColor.push(0);
                diColor.push(1);
                diColor.push(0);
                diColor.push(1);

                diColorDif.push(0);
                diColorDif.push(0);
                diColorDif.push(0);
                diColorDif.push(0);

                diNormal.push(1);
                diNormal.push(1);
                diNormal.push(1);

                chaIndex.push(1.5);
                chaIndex.push(1.5);

                j=j+3;
            }
        }
}


//dígito 0
var diPos0 = [
0.045250,0.297375,0.000000,0.125000,0.299000,0.000000,
0.125000,0.345500,0.000000,0.204750,0.297375,0.000000,
0.080250,0.264750,0.000000,0.169750,0.264750,0.000000,
0.015000,0.170500,0.000000,0.235000,0.170500,0.000000,
0.186000,0.170500,0.000000,0.064000,0.170500,0.000000,
0.045250,0.043625,0.000000,0.080250,0.076250,0.000000,
0.169750,0.076250,0.000000,0.204750,0.043625,0.000000,
0.125000,0.042000,0.000000,0.125000,0.004500,0.000000
];

var diInd0 = [
0, 1, 2, 1, 3, 2, 0, 4, 1, 5, 3, 1, 6, 4, 0, 5, 7, 3, 8, 7, 5, 6, 9, 4, 10, 9, 6, 10, 11, 9, 12, 7, 8, 12, 13, 7, 10, 14, 11, 14, 13, 12, 15, 14,
 10, 14, 15, 13

];

//dígito 1 
var diPos1 = [
0.101000, 0.000000, 0.000000, 0.150000, 0.341000, 0.000000, 0.101000, 0.341000, 0.000000, 0.150000, 0.000000, 0.000000

/*
-0.009600, 0.000000, 0.000000, 
0.010000, 0.136400, 0.000000,
-0.009600, 0.136400, 0.000000, 
0.010000, 0.000000, 0.000000*/
];

var diInd1 = [
    0, 1, 2, 0, 3, 1
];

 //dígito 2
    var diPos2 = [
0.064250, 0.337500, 0.000000, 0.179563, 0.315875, 0.000000, 0.104500, 0.345500, 0.000000, 0.024000, 0.313000, 0.000000, 0.101000, 0.297500, 0.000000, 0.142813, 0.279563, 0.000000, 0.208500, 0.239000, 0.000000, 0.024000, 0.251500, 0.000000, 0.063625, 0.287625, 0.000000, 0.159500, 0.233500, 0.000000, 0.184000, 0.155875, 0.000000, 0.153500, 0.196625, 0.000000, 0.135500, 0.160500, 0.000000, 0.079438, 0.080500, 0.000000, 0.102500, 0.046500, 0.000000, 0.017000, 0.003500, 0.000000, 0.233000, 0.046500, 0.000000, 0.233000, 0.000000, 0.000000, 0.017000, 0.000000, 0.000000
    ];


    var diInd2 = [
            0, 1, 2, 3, 1, 0, 3, 4, 1, 4, 5, 1, 5, 6, 1, 7, 8, 3, 8, 4, 3, 9, 6, 5,
            9, 10, 6, 11, 10, 9, 12, 10, 11, 13, 10, 12, 13, 14, 10, 15, 14, 13, 15,
            16, 14, 15, 17, 16, 18, 17, 15
    ];   //offset de 19

var diPos3 = [
0.071375, 0.342000, 0.000000, 0.179125, 0.321250, 0.000000, 0.106000, 0.345500, 0.000000, 0.040500, 0.331000, 0.000000, 0.040500, 0.284500, 0.000000, 0.071375, 0.295688, 0.000000, 0.098500, 0.299000, 0.000000, 0.141500, 0.285313, 0.000000, 0.206500, 0.256500, 0.000000, 0.157500, 0.248000, 0.000000, 0.196375, 0.210375, 0.000000, 0.140625, 0.211625, 0.000000, 0.090000, 0.198500, 0.000000, 0.163000, 0.180000, 0.000000, 0.090000, 0.153500, 0.000000, 0.200250, 0.148688, 0.000000, 0.144688, 0.138500, 0.000000, 0.212000, 0.099000, 0.000000, 0.163000, 0.096500, 0.000000, 0.181875, 0.024375, 0.000000, 0.148063, 0.056875, 0.000000, 0.032000, 0.015000, 0.000000, 0.070375, 0.048438, 0.000000, 0.032000, 0.068000, 0.000000, 0.108000, 0.042000, 0.000000, 0.104500, -0.004500, 0.000000, 0.068625, 0.000562, 0.000000
];

    var diInd3 = [
        0, 1, 2, 3, 1, 0, 4, 5, 3, 5, 1, 3, 5, 6, 1, 6, 7, 1, 7, 8, 1, 9, 8, 7, 9,
        10, 8, 11, 10, 9, 12, 10, 11, 12, 13, 10, 14, 13, 12, 14, 15, 13, 16, 15, 14, 16, 17, 15, 18, 17, 16, 18, 19, 17, 20, 19, 18, 21, 
        22, 23, 24, 19, 20, 21, 24, 22, 21, 19, 24, 21, 25, 19, 26, 25, 21
    ];     //offset de 27

    ////digito 4
    var diPos4 = [
           0.005500, 0.134500, 0.000000, 0.199000, 0.345500, 0.000000, 0.178000, 0.345500, 0.000000, 0.149000, 0.253000, 0.000000, 0.150000, 0.253000, 0.000000, 0.199000, 0.156000, 0.000000, 0.071000, 0.156000, 0.000000, 0.150000, 0.156000, 0.000000, 0.235500, 0.156000, 0.000000, 0.235500, 0.112000, 0.000000, 0.005500, 0.112000, 0.000000, 0.150000, 0.112000, 0.000000, 0.150000, 0.000000, 0.000000, 0.199000, 0.112000, 0.000000, 0.199000, 0.000000, 0.000000
    ];
    var diInd4 = [
            0, 1, 2, 0, 3, 1, 3, 4, 1, 4, 5, 1, 0, 6, 3, 7, 5, 4, 0, 7, 6, 0, 5, 7, 0, 
            8, 5, 0, 9, 8, 10, 9, 0, 11, 9, 10, 12, 13, 11, 13, 9, 11, 12, 14, 13
    ];   //offset de 15

    ///digito 5
    var diPos5 = [
0.050500, 0.163500, 0.000000, 0.095000, 0.297000, 0.000000, 0.050500, 0.341000, 0.000000, 0.202000, 0.341000, 0.000000, 0.202000, 0.297000, 0.000000, 0.095000, 0.211500, 0.000000, 0.185875, 0.183313, 0.000000, 0.138375, 0.156563, 0.000000, 0.219000, 0.104500, 0.000000, 0.170000, 0.103500, 0.000000, 0.187438, 0.026375, 0.000000, 0.149188, 0.060188, 0.000000, 0.025000, 0.016500, 0.000000, 0.062063, 0.048313, 0.000000, 0.025000, 0.067000, 0.000000, 0.099500, 0.042000, 0.000000, 0.107500 ,-0.004500, 0.000000, 0.066250, 0.000375, 0.000000
    ];

var diInd5 = [
    0, 1,2, 1, 3, 2, 1, 4, 3, 0, 5, 1, 0, 6, 5, 0, 7, 6, 7, 8, 6, 9, 8, 7, 9, 10, 8, 11, 10, 9, 12, 13,
    14, 15, 10, 11, 12, 15, 13, 12, 10, 15, 12, 16, 10, 17, 16, 12
]; 

        //digito 6
    var diPos6 = [

 0.057062,0.240938,0.000000,0.188000,0.308000,0.000000,0.158500,0.345500,0.000000,0.123000,0.252813,0.000000,0.083500,0.183000,0.000000,0.022000,0.116500,0.000000,0.106875,0.192625,0.000000,0.205188,0.168438,0.000000,0.137000,0.197000,0.000000,0.100188,0.146750,0.000000,0.127000,0.150500,0.000000,0.167438,0.135500,0.000000,0.232500,0.097500,0.000000,0.073000,0.132500,0.000000,0.183500,0.098000,0.000000,0.082813,0.066250,0.000000,0.052438,0.029000,0.000000,0.168438,0.057438,0.000000,0.202688,0.025688,0.000000,0.129000,0.042000,0.000000,0.132000,-0.004500,0.000000
    ]; 

var diInd6 = [
    0, 1, 2, 0, 3, 1, 0, 4, 3, 5, 4, 0, 6, 7, 8, 4, 7, 6, 5, 9, 4, 9, 7, 4, 9, 10, 7, 10, 11, 7 ,11, 12, 7 ,5 ,13 ,9,
     14, 12, 11, 5 ,15 ,13 ,16, 15, 5, 17, 12, 14, 17, 18, 12, 16, 19, 15, 19, 18, 17, 16, 18, 19, 20, 18, 16
];

var diPos7 = [
0.024500,0.294500,0.000000,0.245000,0.341000,0.000000,0.024500,0.341000,0.000000,0.172000,0.294500,0.000000,0.090500,-0.004500,0.000000,0.047000,0.014500,0.000000
]

var diInd7 = [
    0, 1, 2, 0, 3, 1, 3, 4, 1, 5, 4, 3
];

var diPos8 = [

0.053938,0.317500,0.000000,0.200313,0.317188,0.000000,0.128500,0.345500,0.000000,0.024000,0.247500,0.000000,0.088063,0.285188,0.000000,0.127500,0.299000,0.000000,0.165188,0.284313,0.000000,0.229000,0.246500,0.000000,0.073000,0.248500,0.000000,0.180000,0.247500,0.000000,0.088875,0.212000,0.000000,0.034688,0.206813,0.000000,0.164313,0.211688,0.000000,0.218625,0.207813,0.000000,0.126500,0.196500,0.000000,0.186500,0.174000,0.000000,0.064500,0.174000,0.000000,0.028063,0.139625,0.000000,0.126000,0.150000,0.000000,0.222063,0.139750,0.000000,0.081625,0.135000,0.000000,0.168438,0.134625,0.000000,0.234000,0.092000,0.000000,0.016000,0.092500,0.000000,0.065000,0.096000,0.000000,0.185000,0.096000,0.000000,0.081875,0.057188,0.000000,0.169813,0.058313,0.000000,0.047750,0.023562,0.000000,0.202875,0.023313,0.000000,0.125000,0.042000,0.000000,0.126000,-0.004500,0.000000
];

var diInd8 = [
0, 1, 2, 3 ,4, 0, 4, 5, 0, 5, 1, 0, 5, 6, 1, 6, 7, 1, 3, 8, 4, 9, 7, 6, 3, 
10, 8, 11, 10, 3, 12, 7, 9, 12, 13, 7, 11, 14, 10, 14, 13, 12, 14, 15, 13, 16, 14, 11,
 16, 15, 14, 17, 15, 16, 17, 18, 15, 18, 19, 15, 17, 20, 18, 21, 19, 18,
  21, 22, 19, 23, 20, 17, 23, 24, 20, 25, 22, 21, 23, 26, 24, 27, 22, 25, 28, 26, 23, 27,
   29, 22, 30, 29, 27, 28, 30, 26, 28, 29, 30, 31, 29, 28
];

var diPos9 = [
0.046375,0.313938,0.000000,0.199875,0.310063,0.000000,0.122000,0.345500,0.000000,0.018000,0.244500,0.000000,0.082813,0.283813,0.000000,0.123000,0.299000,0.000000,0.163312,0.280625,0.000000,0.230500,0.221000,0.000000,0.067000,0.245000,0.000000,0.180000,0.237500,0.000000,0.084000,0.207188,0.000000,0.046000,0.173938,0.000000,0.179688,0.225063,0.000000,0.177500,0.210000,0.000000,0.192000,0.095688,0.000000,0.149750,0.195875,0.000000,0.167500,0.159500,0.000000,0.125000,0.191500,0.000000,0.114500,0.145000,0.000000,0.142125,0.148875,0.000000,0.133500,0.093438,0.000000,0.093500,-0.004500,0.000000,0.063500,0.031500,0.000000
];

var diInd9 = [
    0, 1, 2 ,3 ,4 ,0, 4, 5, 0, 5, 1, 0, 5, 6, 1, 6, 7, 1, 3, 8, 4, 9, 7, 6, 3, 
    10, 8, 11, 10, 3, 12, 7, 9, 13, 7, 12, 13, 14, 7, 15, 16, 13, 16, 14, 13, 11, 17,
    10, 17, 16, 15, 11, 16, 17, 18, 16, 11, 18, 19, 16, 20, 14, 16, 20, 21, 14, 22, 21, 20
];

var diNM = [
0.015900,0.088250,0.000000,  //son 44 vértices
0.044125,0.087475,0.000000,
0.028700,0.091600,0.000000,
0.068625,0.086800,0.000000,
0.107225,0.081950,0.000000,
0.085500,0.091600,0.000000,
-0.015300,0.000000,0.000000,
0.002500,0.089800,0.000000,
-0.015300,0.089800,0.000000,
0.002500,0.078000,0.000000,
0.055500,0.075400,0.000000,
0.078900,0.076600,0.000000,
0.092025,0.071200,0.000000,
0.115300,0.056400,0.000000,
0.002500,0.065200,0.000000,
0.013100,0.074125,0.000000,
0.024900,0.076600,0.000000,
0.036300,0.071675,0.000000,
0.069125,0.073450,0.000000,
0.058900,0.065200,0.000000,
0.041100,0.055800,0.000000,
0.097500,0.055600,0.000000,
0.002500,0.000000,0.000000,
0.058900,0.000000,0.000000,
0.115300,0.000000,0.000000,
0.041100,0.000000,0.000000,
0.097500,0.000000,0.000000,
-0.084500,0.088025,0.000000,
-0.048225,0.082725,0.000000,
-0.069900,0.091600,0.000000,
-0.114900,0.000000,0.000000,
-0.097100,0.089800,0.000000,
-0.114900,0.089800,0.000000,
-0.097100,0.078000,0.000000,
-0.096700,0.078000,0.000000,
-0.074700,0.077400,0.000000,
-0.061850,0.071450,0.000000,
-0.039300,0.055400,0.000000,
-0.097100,0.064400,0.000000,
-0.085675,0.074425,0.000000,
-0.057100,0.055600,0.000000,
-0.097100,0.000000,0.000000,
-0.057100,0.000000,0.000000,
-0.039300,0.000000,0.000000
];

var diIndNM = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 6, 9, 7, 9, 1, 0, 9, 10, 1, 10, 4, 3, 10, 11, 4, 11, 12, 4, 12, 13, 4, 6, 14, 9, 14, 15,
    9, 15, 16, 9, 16, 10, 9, 17, 10, 16, 10, 18, 11, 17, 18, 10, 17, 19, 18, 20, 19, 17, 21, 13, 12, 6 ,22, 14, 20, 23, 19,
     21, 24, 13, 25, 23, 20, 26, 24, 21, 27, 28, 29, 30, 31, 32, 30, 33, 31, 34, 28, 27, 34, 35, 28, 35, 36, 28, 36, 37, 28, 
     30, 34, 33, 30, 38, 34, 38, 39, 34, 39, 35, 34, 40, 37, 36, 30, 41, 38, 42, 37, 40, 42, 43, 37
];

var diGrado = [
0.050688, 0.344313, 0.000000, 0.146313, 0.344313, 0.000000, 
0.098500, 0.364000, 0.000000, 0.031000, 0.296500, 0.000000, 
0.069375, 0.325625, 0.000000, 0.098500, 0.337500, 0.000000, 
0.127875, 0.325625, 0.000000, 0.166000, 0.296500, 0.000000, 
0.057500, 0.296500, 0.000000 ,0.140000, 0.296500, 0.000000, 
0.050688, 0.248688, 0.000000, 0.069375, 0.267125, 0.000000, 
0.127875, 0.267125, 0.000000, 0.146313, 0.248688, 0.000000, 
0.098500, 0.255000, 0.000000, 0.098500, 0.229000, 0.000000
];

var diIndGrado = [
    0, 1, 2, 3, 4, 0, 4, 5, 0, 5, 1, 0, 5, 6, 1, 6, 7, 1, 3, 8, 4, 9, 7, 6, 10, 8, 3, 10, 11, 8, 12, 7,
    9, 12, 13, 7, 10, 14, 11, 14, 13, 12, 10, 13, 14, 15, 13, 10
];

var diPunto = [
0.033312, 0.046688, 0.000000, 0.075688, 0.046688 ,0.000000 ,0.054500 ,0.055500 ,0.000000 ,0.024500 ,
0.025500 ,0.000000, 0.084500, 0.025500, 0.000000, 0.033312, 0.004313, 0.000000, 0.075687 ,0.004312, 0.000000, 0.054500 ,
-0.004500, 0.000000
];

var diIndPunto = [
    0, 1, 2, 3, 1, 0, 3, 4, 1, 5, 4, 3, 5, 6, 4, 7, 6, 5
];
    /////////////////////////////////////////////////////////////////////////////////////////////////////