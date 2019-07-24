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

var htmolver = "v3.5"
var zoom, data, MainMenu;
var worker1;
var sizeglob = 0;
var url;
var totalframes = 0;
var totalframes1 = 0;
var numframe = 0;
var trjbnd = false;
var bitrate = 0;
var readstart = 0;
var readend = mxSize;
var requireddata = false;
var pos = 0;
var bndarray = true;
var bndbuffer = 0;
var bndfinal = false;
var bndknowframe = false;
var bndreview = false;
var sizearrayp = 0;
var trjauto = false;
var autoload = true;
var fpath;

function Main() {

    //var prr=
    //"-0.008575 0.018675 0.000000 0.008375 0.018675 0.000000 -0.000100 0.022200 0.000000 0.011900 0.010200 0.000000 -0.012100 0.010200 0.000000 -0.008575 0.001725 0.000000 0.008375 0.001725 0.000000 -0.000100 -0.001800 0.000000"
    //;
    //alert(prr.replace(/[ ,]+/g, ","));


    //-----------------------------------Bloque inicial para declarar el worker----------------------------------
    if (typeof (Worker) == "undefined") {
        alert("HTMoL: Alert. Workers not supported");
    } else {
        //Para modificar worker1.js y evitar caché
        var marcaTime = parseInt(Math.random() * 1000000);
        worker1 = new Worker("static/js/worker.js?=" + marcaTime);
        worker1.postMessage = worker1.webkitPostMessage || worker1.postMessage;
        worker1.onerror = function (e) {
            data.innerHTML = "HTMoL: " + e.message;
        }
        worker1.addEventListener("message", manejadorEventoWorker1, false);
    }
    //----------------------------------------------------------------------------------------------------------------
    var main = this;
    this.ObjP = new Process();

    //--------------------------
    console.log(PDBDIR + pdbInicial);
    var pdbUrl = 'http://' + WebIP + ':' + '/simfiles/' + pdbInicial;
    molecule = this.ObjP.ReadFile(pdbUrl);
    var about = "<a href='http://htmol.tripplab.com/' target='_blank' style='color:orange;font-weight: bold;'>HTMoL</a>"; // Please do not change nor remove
    info.innerHTML = about + htmolver + ": " + pdbInicial + " (" + molecule.LstAtoms.length + " atoms)";
    //    info.innerHTML=molecule.LstAtoms.length+" atoms";
    createBonds(this);
    initCamera(CzPers);
    // Set initial view
    UserSetView(molecule, 'FrontView');
    //---------------------------

    //AtomosSeleccionados=molecule.LstAtoms;

    var Container = null;
    var buffer = new ArrayBuffer();


    this.DeleteButtons = function () {
        for (var i = 0; i < LstBtnsChain.length; i++) {
            menu.removeChild(LstBtnsChain[i]);
        }
        LstBtnsChain = [];
    }


    this.Buttons = function () {
        //se cargan los botones de las Cadenas
        for (var i = 0; i < molecule.LstChain.length; i++) {
            var chain = molecule.LstChain[i];
            var button = document.createElement('input');
            button.type = "button";
            button.value = chain.Name;
            button.id = chain.Name;
            button.onclick = ProcesarCadena(i, button);
            if (button.value != "undefined") {
                menu.appendChild(button);
                LstBtnsChain.push(button);
            }
        }

        //se cargan las funciones para la selección por átomos
        for (var i = 0; i < LstAtoms.length; i++) //LstAtoms se encuentra en el support.js
        {
            var op = LstAtoms[i];
            var an = document.getElementById(op);
            an.onclick = ByAtoms(molecule, op);
        }

        for (var i = 0; i < LstAminoacid.length; i++) {
            var op = LstAminoacid[i];
            var an = document.getElementById(op);
            try {
                an.onclick = ByAmino(molecule, op);
            } catch (err) {}


        }

        for (var i in LstViews) {
            var op = LstViews[i];
            var an = document.getElementById(op.name);
            an.onclick = SetView(molecule, op);
        }

        /* for(var i=0; i< LstColors.length; i++)
         {
             var op=LstColors[i];
             var an = document.getElementById(op);
             an.onclick=ByColor(molecule,op);
         }*/

        //para el centrado por átom
        var an = document.getElementById('Center');
        an.onclick = CenterByAtom();

        an = document.getElementById('Distance'); //afecta el picking
        an.onclick = Distance();

        an = document.getElementById('Angle'); //afecta el picking
        an.onclick = Angle();

        an = document.getElementById('None2'); //para borrar las anteriores, también afecta el picking
        an.onclick = None();

        an = document.getElementById('DeleteMeasures'); //para borrar las anteriores, también afecta el picking
        an.onclick = DeleteMeasures();

        an = document.getElementById('Axis');
        an.onclick = Axis();

        an = document.getElementById('None1');
        an.onclick = NoAtomCenter();

    }
    this.CleanScene = function () {
        console.log("CleanScene");
        cleanMemory();
        //se limpian los botones de la dinámica
        var button = document.getElementById("playpause");
        var reg = document.getElementById("Rew");
        var forw = document.getElementById("Forw");
        button.style.display = "none";
        reg.style.display = "none";
        forw.style.display = "none";
        DinamicaActiva = false;
        coordsX = [
            []
        ];
        coordsY = [
            []
        ];
        coordsZ = [
            []
        ];
        pos = 0;
        numframe = 0;
        //////////////////////////

        //para limpiar los dígitos


        var newRotationMatrix = mat4.create();
        mat4.identity(newRotationMatrix);
        mat4.rotate(newRotationMatrix, degToRad(0), [0, 1, 0]); //vista frontal
        //  mat4.rotate(newRotationMatrix, degToRad(270), [0, 0, 1]); //vista frontal 0
        //  mat4.rotate(newRotationMatrix, degToRad(270), [0, 1, 0]); //vista frontal 0
        mat4.identity(RotationMatrix);
        mat4.multiply(newRotationMatrix, RotationMatrix, RotationMatrix);

        hayseleccionado = false;

        ArrayIndx = [0];
        var u_Array = gl.getUniformLocation(program, 'uIntArray');
        gl.uniform1fv(u_Array, ArrayIndx);
        ArrayIndx.pop();

        main.DeleteButtons();
    }


    this.MakeModel = function (url) {
        main.CleanScene();
        molecule = main.ObjP.ReadFile(url);
        //        info.innerHTML="HTMoLv3.5: "+url+" ("+molecule.LstAtoms.length+" atoms)";
        info.innerHTML = molecule.LstAtoms.length + " atoms";
        createBonds(main);
        initCamera(CzPers);
        if (RepresentacionInicial == 'SpheresBonds') {
            InitBufSB();
        } else if (RepresentacionInicial == 'Bonds') {
            InitBufBonds();
        } else if (RepresentacionInicial == 'VDW') {
            InitBufVDW();
        }

        main.Buttons();

        if (molecule != null) {
            data.innerHTML = "HTMoL3: Loading...";
            window.setTimeout(function () {
                if (main.ObjP.Model.Frames != 0 && main.ObjP.Model.Frames != "") {
                    main.filerequest();
                    //console.log("HTMoL3: "+trjauto);
                    trjauto = true;
                    autoplay = false;
                    //console.log("HTMoL3: "+trjauto);
                    DinamicaActiva = true;
                }
                data.innerHTML = "";
            }, 100);
        } else {
            data.innerHTML = "HTMoL3: Error (Main.js). Invalid URL or Connection not available.";
        }
    }


    this.Parse = function (txt) // Parsing commands in the console
    {

        var comando = txt.substr(0, txt.indexOf(" ")).toLowerCase(); //obtengo la primer palabra que es un comando

        //luego voy a obtener todo lo demás que va a ser la instrucción
        var lines = txt.split(" ");
        var inst = txt.replace(comando + ' ', '');


        if (comando == 'select') {
            EliminarSeleccion();

            //alert("comando select");
            //obtener todo lo demás antes del ;
            //alert(inst);
            //alert(inst.length);
            var numAtoms = 0;
            //var regex = /(\d+)/g;
            //alert(inst.match(regex));
            //alert(AtomosSeleccionados.length);

            if (inst == 'none') {
                EliminarSeleccion();
            } else if (inst == 'all') {
                AtomosSeleccionados = molecule.LstAtoms;
            } else {
                //script=inst.match(regex);
                var arrComa = inst.split(",");

                //alert(arrComa.length);
                var allselect = false;

                for (var i = 0; i < arrComa.length; i++) {
                    var ele = arrComa[i];

                    var n = ele.indexOf("-");
                    var m = ele.indexOf(":")
                    if (n > (-1)) //quiere decir que es un rango ejemplo 34-38
                    {
                        //alert("rango");
                        var arr2 = ele.split("-");
                        var rng1 = parseInt(arr2[0]);
                        var rng2 = parseInt(arr2[1]);
                        if (!isNaN(rng1) && !isNaN(rng2)) {
                            //alert("los dos son numeros");
                            if (rng1 > 0 && rng1 <= molecule.LstAtoms.length && rng2 > 0 && rng2 <= molecule.LstAtoms.length) {
                                if (rng2 < rng1) {
                                    for (var j = rng2; j <= rng1; j++) {
                                        AtomosSeleccionados.push(molecule.LstAtoms[j - 1]);
                                    }
                                } else {
                                    for (var j = rng1; j <= rng2; j++) {
                                        AtomosSeleccionados.push(molecule.LstAtoms[j - 1]);
                                    }
                                }

                            }

                        }

                    } else if (m > (-1)) //quiere decir que es un grupo ejemplo 0:45:A
                    {
                        var arr3 = ele.split(":");
                        if (arr3.length == 3) //quiere decir que sì tiene bien las tres partes
                        {
                            //0:2:1
                            //N:6:2
                            //Voy a poner todos los casos
                            if (arr3[0] == 0) //todos los àtomos del aminoàciodo
                            {
                                if (arr3[1] == 0) //todos los aminoácidos
                                {
                                    if (arr3[2] == 0) //todos los átomos de la molécula
                                    {
                                        allselect = true;
                                    } else //todos los atomos de una cadena
                                    {
                                        //primero checar si es un numero la cadena, entonces sera por index
                                        if (!isNaN(arr3[2])) //es un indice
                                        {
                                            if (arr3[2] > 0 && arr3[2] <= molecule.LstChain.length) //entonces esta en el rango
                                            {
                                                var cha = molecule.LstChain[arr3[2] - 1];
                                                for (var j = 0; j < cha.LstAminoacid.length; j++) {
                                                    var amin = cha.LstAminoacid[j];
                                                    for (var z = 0; z < amin.LstAtoms.length; z++) {
                                                        AtomosSeleccionados.push(amin.LstAtoms[z]);
                                                    }
                                                }

                                            } else {
                                                //la cadena no esta dentro del indice
                                            }
                                        } else //si no la cadena es por nombre
                                        {
                                            //tengo que buscarlo por la letra
                                            for (var j = 0; j < molecule.LstChain.length; j++) {
                                                if (arr3[2] == molecule.LstChain[j].Name.replace(" ", "")) {
                                                    //procesalo y salte del for
                                                    var cha = molecule.LstChain[j];
                                                    for (var k = 0; k < cha.LstAminoAcid.length; k++) {
                                                        var amin = cha.LstAminoAcid[k];
                                                        for (var z = 0; z < amin.LstAtoms.length; z++) {
                                                            AtomosSeleccionados.push(amin.LstAtoms[z]);
                                                        }
                                                    }
                                                    break; //checar si esta bien esta instruccion
                                                }

                                            }

                                        }

                                    }

                                } else //en esta parte quiere decir que sí se ha especificado el aminoácido
                                { //en esta parte el aminoácido
                                    if (!isNaN(arr3[1])) //el aminoácido es un índice pero hay que buscarlo
                                    {
                                        if (arr3[2] == 0) //de todas las cadenas
                                        {
                                            //para buscar el aminoacido en todas las cadenas
                                            for (var k = 0; k < molecule.LstChain.length; k++) {
                                                var caden = molecule.LstChain[k];
                                                for (var t = 0; t < caden.LstAminoAcid.length; t++) {
                                                    var amin = caden.LstAminoAcid[t];
                                                    //alert("length:"+amin.Number.replace(" ", "").length)
                                                    //alert("length:"+arr3[1].replace(" ", "").length)
                                                    if (parseInt(arr3[1]) == parseInt(amin.Number)) {
                                                        for (var v = 0; v < amin.LstAtoms.length; v++) {
                                                            AtomosSeleccionados.push(amin.LstAtoms[v]);
                                                        }
                                                        break; //quiere decir que lo encontré en esa cadena

                                                    }
                                                }

                                            }

                                        } else //de una cadena  la cadena puede ser por indice o por letra
                                        {
                                            if (!isNaN(arr3[2])) //es un indice
                                            {
                                                //los indices en la cadena son como aparecen en la lista
                                                if (arr3[2] > 0 && arr3[2] <= molecule.LstChain.length) //para saber que si esta en el rango
                                                {
                                                    var cha = molecule.LstChain[arr3[2] - 1]; //ya encontre la cadena
                                                    //ahora busco en todos los aminoacidos de esta cadena
                                                    for (var t = 0; t < cha.LstAminoAcid.length; t++) {
                                                        var amin = cha.LstAminoAcid[t];
                                                        //alert("length:"+amin.Number.replace(" ", "").length)
                                                        //alert("length:"+arr3[1].replace(" ", "").length)
                                                        if (parseInt(arr3[1]) == parseInt(amin.Number)) {
                                                            for (var v = 0; v < amin.LstAtoms.length; v++) {
                                                                AtomosSeleccionados.push(amin.LstAtoms[v]);
                                                            }
                                                            break; //quiere decir que lo encontré en esa cadena

                                                        }
                                                    }

                                                }
                                            } else //la cadena es por letra
                                            {
                                                //tengo que buscarlo por la letra
                                                for (var j = 0; j < molecule.LstChain.length; j++) {
                                                    if (arr3[2] == molecule.LstChain[j].Name.replace(" ", "")) {
                                                        //procesalo y salte del for
                                                        var cha = molecule.LstChain[j];
                                                        //ahora busco en todos los aminoacidos de esta cadena
                                                        for (var t = 0; t < cha.LstAminoAcid.length; t++) {
                                                            var amin = cha.LstAminoAcid[t];
                                                            //alert("length:"+amin.Number.replace(" ", "").length)
                                                            //alert("length:"+arr3[1].replace(" ", "").length)
                                                            if (parseInt(arr3[1]) == parseInt(amin.Number)) {
                                                                for (var v = 0; v < amin.LstAtoms.length; v++) {
                                                                    AtomosSeleccionados.push(amin.LstAtoms[v]);
                                                                }
                                                                break; //quiere decir que lo encontré en esa cadena

                                                            }
                                                        }
                                                    }

                                                }

                                            }

                                        }
                                    } else //el aminoácido es por letra, hay que buscarlo, Las letras se pueden repetir dentro de una cadena
                                    {
                                        //hay dos opciones todos los aminoacidos que tengan este nombre en una cadena
                                        //todos los aminoacidos que tengan este nombre en todas las cadenas
                                        if (arr3[2] == 0) //de todas las cadenas
                                        {
                                            //para buscar el aminoacido en todas las cadenas
                                            for (var k = 0; k < molecule.LstChain.length; k++) {
                                                var caden = molecule.LstChain[k];
                                                for (var t = 0; t < caden.LstAminoAcid.length; t++) {
                                                    var amin = caden.LstAminoAcid[t];
                                                    //alert("length:"+amin.Number.replace(" ", "").length)
                                                    //alert("length:"+arr3[1].replace(" ", "").length)
                                                    if (arr3[1].replace(" ", "") == amin.Name.replace(" ", "")) //
                                                    {
                                                        for (var v = 0; v < amin.LstAtoms.length; v++) {
                                                            AtomosSeleccionados.push(amin.LstAtoms[v]);
                                                        }
                                                    }
                                                }
                                            }

                                        } else {
                                            //de una cadena, la cadena puede estar dada por un indice o por una letra
                                            if (!isNaN(arr3[2])) //es un indice
                                            {
                                                //los indices en la cadena son como aparecen en la lista
                                                if (arr3[2] > 0 && arr3[2] <= molecule.LstChain.length) //para saber que si esta en el rango
                                                {
                                                    var cha = molecule.LstChain[arr3[2] - 1]; //ya encontre la cadena
                                                    //ahora busco en todos los aminoacidos de esta cadena
                                                    for (var t = 0; t < cha.LstAminoAcid.length; t++) {
                                                        var amin = cha.LstAminoAcid[t];
                                                        //alert("length:"+amin.Number.replace(" ", "").length)
                                                        //alert("length:"+arr3[1].replace(" ", "").length)
                                                        if (arr3[1].replace(" ", "") == amin.Name.replace(" ", "")) //
                                                        {
                                                            for (var v = 0; v < amin.LstAtoms.length; v++) {
                                                                AtomosSeleccionados.push(amin.LstAtoms[v]);
                                                            }
                                                        }
                                                    }

                                                }

                                            } else //la cadena es una letra
                                            {
                                                //tengo que buscarla por la letra
                                                for (var j = 0; j < molecule.LstChain.length; j++) {
                                                    if (arr3[2] == molecule.LstChain[j].Name.replace(" ", "")) {
                                                        //procesalo y salte del for
                                                        var cha = molecule.LstChain[j];
                                                        //ahora busco en todos los aminoacidos de esta cadena
                                                        for (var t = 0; t < cha.LstAminoAcid.length; t++) {
                                                            var amin = cha.LstAminoAcid[t];
                                                            //alert("length:"+amin.Number.replace(" ", "").length)
                                                            //alert("length:"+arr3[1].replace(" ", "").length)
                                                            if (arr3[1].replace(" ", "") == amin.Name.replace(" ", "")) //
                                                            {
                                                                for (var v = 0; v < amin.LstAtoms.length; v++) {
                                                                    AtomosSeleccionados.push(amin.LstAtoms[v]);
                                                                }
                                                            }
                                                        }
                                                    }

                                                }


                                            }

                                        }

                                    }

                                }
                            } else ////////////////por elemento
                            {
                                //buscar el elemento
                                if (arr3[1] == 0) //en todos los aminoácidos
                                {
                                    if (arr3[2] == 0) //en todas las cadenas
                                    {
                                        for (var j = 0; j < molecule.LstAtoms.length; j++) {
                                            if (arr3[0] == molecule.LstAtoms[j].Element) {
                                                if (molecule.LstAtoms[j].State == 'Active') { //checar lo de Active
                                                    AtomosSeleccionados.push(molecule.LstAtoms[j]);
                                                }

                                            }
                                        }
                                    } else //todos los aminoacidos de una cadena
                                    {
                                        //la cadena puede estar dada por un indice o por una letra
                                        if (!isNaN(arr3[2])) //es un indice
                                        {
                                            //los indices en la cadena son como aparecen en la lista
                                            if (arr3[2] > 0 && arr3[2] <= molecule.LstChain.length) //para saber que si esta en el rango
                                            {
                                                var cha = molecule.LstChain[arr3[2] - 1]; //ya encontre la cadena
                                                for (var t = 0; t < cha.LstAminoAcid.length; t++) {
                                                    var amin = cha.LstAminoAcid[t];
                                                    for (var v = 0; v < amin.LstAtoms.length; v++) {
                                                        if (arr3[0].replace(" ", "") == amin.LstAtoms[v].Element.replace(" ", "")) {
                                                            if (amin.LstAtoms[v].State == 'Active') {
                                                                AtomosSeleccionados.push(amin.LstAtoms[v]);
                                                            }
                                                        }
                                                    }
                                                }

                                            }
                                        } else //la cadena está dada por una letra, primero la tengo que buscar
                                        {
                                            //tengo que buscarla por la letra
                                            for (var j = 0; j < molecule.LstChain.length; j++) {
                                                if (arr3[2] == molecule.LstChain[j].Name.replace(" ", "")) {
                                                    //procesalo y salte del for
                                                    var cha = molecule.LstChain[j];
                                                    //ahora busco en todos los aminoacidos de esta cadena
                                                    for (var t = 0; t < cha.LstAminoAcid.length; t++) {
                                                        var amin = cha.LstAminoAcid[t];
                                                        for (var v = 0; v < amin.LstAtoms.length; v++) {
                                                            if (arr3[0].replace(" ", "") == amin.LstAtoms[v].Element.replace(" ", "")) {
                                                                if (amin.LstAtoms[v].State == 'Active') {
                                                                    AtomosSeleccionados.push(amin.LstAtoms[v]);
                                                                }
                                                            }
                                                        }

                                                    }
                                                }

                                            }

                                        }


                                    }

                                } else //en esta parte quiere decir que sí se ha especificado el aminoácido
                                { //en esta parte el aminoácido
                                    if (!isNaN(arr3[1])) //el aminoácido es un índice pero hay que buscarlo
                                    {
                                        if (arr3[2] == 0) //de todas las cadenas
                                        {
                                            //para buscar el aminoacido en todas las cadenas
                                            for (var k = 0; k < molecule.LstChain.length; k++) {
                                                var caden = molecule.LstChain[k];
                                                for (var t = 0; t < caden.LstAminoAcid.length; t++) {
                                                    var amin = caden.LstAminoAcid[t];
                                                    //alert("length:"+amin.Number.replace(" ", "").length)
                                                    //alert("length:"+arr3[1].replace(" ", "").length)
                                                    if (parseInt(arr3[1]) == parseInt(amin.Number)) {
                                                        for (var v = 0; v < amin.LstAtoms.length; v++) {
                                                            if (arr3[0].replace(" ", "") == amin.LstAtoms[v].Element.replace(" ", "")) {
                                                                if (amin.LstAtoms[v].State == 'Active') {
                                                                    AtomosSeleccionados.push(amin.LstAtoms[v]);
                                                                }
                                                            }
                                                        }
                                                        break; //quiere decir que encontré el aminoácido en esa cadena

                                                    }
                                                }

                                            }

                                        } else //de una cadena  la cadena puede ser por indice o por letra
                                        {
                                            if (!isNaN(arr3[2])) //es un indice
                                            {
                                                //los indices en la cadena son como aparecen en la lista
                                                if (arr3[2] > 0 && arr3[2] <= molecule.LstChain.length) //para saber que si esta en el rango
                                                {
                                                    var cha = molecule.LstChain[arr3[2] - 1]; //ya encontre la cadena
                                                    //ahora busco en todos los aminoacidos de esta cadena
                                                    for (var t = 0; t < cha.LstAminoAcid.length; t++) {
                                                        var amin = cha.LstAminoAcid[t];
                                                        //alert("length:"+amin.Number.replace(" ", "").length)
                                                        //alert("length:"+arr3[1].replace(" ", "").length)
                                                        if (parseInt(arr3[1]) == parseInt(amin.Number)) {
                                                            for (var v = 0; v < amin.LstAtoms.length; v++) {
                                                                if (arr3[0].replace(" ", "") == amin.LstAtoms[v].Element.replace(" ", "")) {
                                                                    if (amin.LstAtoms[v].State == 'Active') {
                                                                        AtomosSeleccionados.push(amin.LstAtoms[v]);
                                                                    }
                                                                }
                                                            }
                                                            break; //quiere decir que lo encontré en esa cadena

                                                        }
                                                    }

                                                }
                                            } else //la cadena es por letra
                                            {
                                                //tengo que buscarlo por la letra
                                                for (var j = 0; j < molecule.LstChain.length; j++) {
                                                    if (arr3[2] == molecule.LstChain[j].Name.replace(" ", "")) {
                                                        //procesalo y salte del for
                                                        var cha = molecule.LstChain[j];
                                                        //ahora busco en todos los aminoacidos de esta cadena
                                                        for (var t = 0; t < cha.LstAminoAcid.length; t++) {
                                                            var amin = cha.LstAminoAcid[t];
                                                            //alert("length:"+amin.Number.replace(" ", "").length)
                                                            //alert("length:"+arr3[1].replace(" ", "").length)
                                                            if (parseInt(arr3[1]) == parseInt(amin.Number)) {
                                                                for (var v = 0; v < amin.LstAtoms.length; v++) {
                                                                    if (arr3[0].replace(" ", "") == amin.LstAtoms[v].Element.replace(" ", "")) {
                                                                        if (amin.LstAtoms[v].State == 'Active') {
                                                                            AtomosSeleccionados.push(amin.LstAtoms[v]);
                                                                        }
                                                                    }
                                                                }
                                                                break; //quiere decir que lo encontré en esa cadena

                                                            }
                                                        }
                                                    }

                                                }

                                            }

                                        }


                                    } else //el aminoácido es por letra, hay que buscarlo
                                    {
                                        //hay dos opciones todos los aminoacidos que tengan este nombre en una cadena
                                        //todos los aminoacidos que tengan este nombre en todas las cadenas
                                        if (arr3[2] == 0) //de todas las cadenas
                                        {
                                            //para buscar el aminoacido en todas las cadenas
                                            for (var k = 0; k < molecule.LstChain.length; k++) {
                                                var caden = molecule.LstChain[k];
                                                for (var t = 0; t < caden.LstAminoAcid.length; t++) {
                                                    var amin = caden.LstAminoAcid[t];
                                                    //alert("length:"+amin.Number.replace(" ", "").length)
                                                    //alert("length:"+arr3[1].replace(" ", "").length)
                                                    if (arr3[1].replace(" ", "") == amin.Name.replace(" ", "")) //
                                                    {
                                                        for (var v = 0; v < amin.LstAtoms.length; v++) {
                                                            if (arr3[0].replace(" ", "") == amin.LstAtoms[v].Element.replace(" ", "")) {
                                                                if (amin.LstAtoms[v].State == 'Active') {
                                                                    AtomosSeleccionados.push(amin.LstAtoms[v]);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }

                                        } else {
                                            //de una cadena, la cadena puede estar dada por un indice o por una letra
                                            if (!isNaN(arr3[2])) //es un indice
                                            {
                                                //los indices en la cadena son como aparecen en la lista
                                                if (arr3[2] > 0 && arr3[2] <= molecule.LstChain.length) //para saber que si esta en el rango
                                                {
                                                    var cha = molecule.LstChain[arr3[2] - 1]; //ya encontre la cadena
                                                    //ahora busco en todos los aminoacidos de esta cadena
                                                    for (var t = 0; t < cha.LstAminoAcid.length; t++) {
                                                        var amin = cha.LstAminoAcid[t];
                                                        //alert("length:"+amin.Number.replace(" ", "").length)
                                                        //alert("length:"+arr3[1].replace(" ", "").length)
                                                        if (arr3[1].replace(" ", "") == amin.Name.replace(" ", "")) //
                                                        {
                                                            for (var v = 0; v < amin.LstAtoms.length; v++) {
                                                                if (arr3[0].replace(" ", "") == amin.LstAtoms[v].Element.replace(" ", "")) {
                                                                    if (amin.LstAtoms[v].State == 'Active') {
                                                                        AtomosSeleccionados.push(amin.LstAtoms[v]);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }

                                                }

                                            } else //la cadena es una letra
                                            {
                                                //tengo que buscarla por la letra
                                                for (var j = 0; j < molecule.LstChain.length; j++) {
                                                    if (arr3[2] == molecule.LstChain[j].Name.replace(" ", "")) {
                                                        //procesalo y salte del for
                                                        var cha = molecule.LstChain[j];
                                                        //ahora busco en todos los aminoacidos de esta cadena
                                                        for (var t = 0; t < cha.LstAminoAcid.length; t++) {
                                                            var amin = cha.LstAminoAcid[t];
                                                            //alert("length:"+amin.Number.replace(" ", "").length)
                                                            //alert("length:"+arr3[1].replace(" ", "").length)
                                                            if (arr3[1].replace(" ", "") == amin.Name.replace(" ", "")) //
                                                            {
                                                                for (var v = 0; v < amin.LstAtoms.length; v++) {
                                                                    if (arr3[0].replace(" ", "") == amin.LstAtoms[v].Element.replace(" ", "")) {
                                                                        if (amin.LstAtoms[v].State == 'Active') {
                                                                            AtomosSeleccionados.push(amin.LstAtoms[v]);
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }

                                                }


                                            }

                                        }

                                    }

                                }

                            }

                        }

                    } else //quiere decir que es un index ejemplo 45
                    {
                        AtomosSeleccionados.push(molecule.LstAtoms[ele - 1]);
                    }

                }

                /*
                for(var o in script)
                {
                    if(o==0)
                    {
                        AtomosSeleccionados=molecule.LstChain[0].LstAminoAcid[script[0]-1].GetAtoms();
                    }
                    else
                    {
                         AtomosSeleccionados=AtomosSeleccionados.concat(molecule.LstChain[0].LstAminoAcid[script[o]-1].GetAtoms());
                    }
                }
                */
                if (allselect == true) {
                    AtomosSeleccionados = molecule.LstAtoms;
                }
                ProcesarSeleccion();
            }

            //alert(AtomosSeleccionados.length);
            document.getElementById("Console_output").value = 'HTMoL3 selected atoms: ' + AtomosSeleccionados.length;
        } else if (comando == 'color') {
            //alert("comando color");
            var color = inst.toLowerCase();
            CambiarColor(color);

        } else if (comando == 'show') {
            instLower = inst.toLowerCase();
            if (instLower == 'sequence') //para el show sequence
            {
                var sqnc = '';
                for (var o in molecule.LstChain) //son los objetos seleccionados  main.oRepresentation.molecule
                {
                    var chain = molecule.LstChain[o];
                    for (var v in chain.LstAminoAcid) //son los objetos seleccionados  main.oRepresentation.molecule
                    {
                        if (v == 0) {
                            sqnc = chain.LstAminoAcid[v].Name + chain.LstAminoAcid[v].Number;

                        } else {
                            sqnc = sqnc + ', ' + chain.LstAminoAcid[v].Name + chain.LstAminoAcid[v].Number;
                        }

                    }

                }
                document.getElementById("Console_output").value = sqnc;
            } else if (instLower == 'vdw') //para mostrar el vdw
            {
                CambiarRepresentacion('VDW');
            } else if (instLower == 'cpk') //para mostrar en spheres bonds, cpk
            {
                CambiarRepresentacion('SB');
            } else if (instLower == 'lines') //para mostrar bonds
            {
                CambiarRepresentacion('Bonds');
            } else if (instLower == 'trace') //para mostrar el trace
            {
                CambiarRepresentacion('Skeleton');
            } else {
                document.getElementById("Console_output").value = 'HTM0L3: Error. Unknown command ' + inst;
            }


        } else if (comando == 'view') {
            UserSetView(molecule, inst);
        } else if (comando == 'zoom') {
            ZoomView(inst);
        } else {
            document.getElementById("Console_output").value = 'HTM0L3: Error. Unknown command ' + txt;
        }

    }

    this.onTestChange = function (event) {
        var key = event.which || event.keyCode; //se ponen los dos porque en firefox no sirve keycode
        // If the user has pressed enter
        if (key == 13) {
            event.preventDefault(); //esta línea es para que no se imprima una nueva línea con el enter
            main.Parse(document.getElementById("Console_input").value);
            document.getElementById("Console_input").value = '';
            //document.getElementById("Console_input").value =document.getElementById("Console_input").value + "\n*";
            return false;
        } else {
            return true;
        }
    }

    var menuStyle = "";
    var mediaquery = window.matchMedia("(max-width: 700px)");
    if (mediaquery.matches) {
        menuStyle += '<link rel="stylesheet" type="text/css" href="static/styles/style_tiny.css" />'
        maxTam = "150px";
    } else {
        menuStyle += '<link rel="stylesheet" type="text/css" href="static/styles/style.css" />'
        maxTam = "250px";
    }
    this.MakeMenu = function (container) {
        var many = CAmino(); //Esta en Buttons Function
        var hope = "<link rel='stylesheet' type='text/css' href='static/styles/component.css' />" +
            "<link rel='stylesheet' type='text/css' href='static/styles/Styles.css' />" +
            menuStyle +
            "  <div id='Menus'>" +
            "<div id='controles'></div>" +
            "  <div id='zoom'>" +
            "  <div id='menu'></div>" +
            "</div>" +
            "  </div>"

            +
            "<div id='Master' class='Master'>" +
            "<div id='Menu_Event'>" +
            "<button onclick='toggleNavPanel()'><span class ='icon-menu' id='aprima'></span></button>" +
            "</div>" +
            "<div id='Menu_MenuPrincipal' class='menu_MenuPrincipal'>" +
            "<div class='menu_iconos'>" +
            "<button onclick='menu_open()' class='B_open' ><span class ='icon-carpeta-abierta'  id='a1'></span><span class='tooltip1'>Files</span> </button>" +
            "<br>" +
            "<button onclick='menu_repre()' class='B_repre'><span class ='icon-molecula'  id='a2'></span><span class='tooltip2'>Representation</span></button>" +
            "<br>" +
            "<button onclick='menu_select()' class='B_select' style='display:none;'><span class ='icon-seleccionar-objeto'  id='a3'><span class='tooltip3'>Select</span></span></button>"
            // +"<br>"
            +
            "<button onclick='menu_action()' class='B_action'><span class ='icon-ajustes'  id='a4'></span><span class='tooltip4'>Actions</span> </button>" +
            "<br>" +
            "<button onclick='menu_view()' class='B_view' ><span class ='icon-orientacion' id='a5'></span><span class='tooltip5'>View</span> </button>" +
            "</div>" +
            "</div>"

            +
            "<div id='menu_open' class='menu_open' style='overflow:auto;'>" +
            "<ul id='Molecule' class='menu'>" +
            "<li><a href='#' onclick='menu_open_close()'><span class =' icon-boton-cancelar' style='font-size:18px;'></span></a></li>"

            +
            "</ul>" +
            "</div>" +
            "<div id='menu_repre' class='menu_open' >" +
            " <ul class='menu' id=M_R>" +
            "<li><a href='#' onclick='close_all()'><span class =' icon-boton-cancelar' style='font-size:18px;'></span></a></li>" +
            " <li><a href='#' id='VDW'>VDW</a></li>" +
            " <li><a href='#' id='Bonds'>Lines</a></li>" +
            "<li><a href='#' title='Spheres Bonds' id='Spheres Bonds'>CPK</a></li>" +
            "<li><a href='#' id='Skeleton'>Trace</a></li>" +
            "<li><a href='#' id='Spline'>Spline</a></li>" +
            "</ul>" +
            "</div>" +
            "<div id='menu_select' class='menu_open' style='overflow:auto;'>" +
            "<ul class='menu'>" +
            "<li><a href='#' onclick='menu_open_close()'><span class =' icon-boton-cancelar' style='font-size:18px;'></a></li>" +
            "<li><a href='#' id='#'>All</a></li>" +
            "<li><a href='#'>Atom&#9662;</a>" +
            "<ul id ='Atom'>" +
            "<li><a href='#' id='C'>C</a></li>" +
            "<li><a href='#' id='H'>H</a></li>" +
            "<li><a href='#' id='O'>O</a></li>" +
            "<li><a href='#' id='PB'>PB</a></li>" +
            "<li><a href='#' id='TI'>TI</a></li>" +
            "<li><a href='#' id='N'>N</a></li>" +
            "<li><a href='#' id='S'>S</a></li>" +
            "<li><a href='#' id='P'>P</a></li>" +
            "</ul>" +
            "</li>" +
            "<li><a href='#'>Aminiacido&#9662;</a>" +
            "<ul>" +
            many +
            "</ul>" +
            "</li>" +
            "</ul>" +
            "</div>" +
            "<div id='menu_action' class='menu_open' style='overflow:auto;'>" +
            "<ul class='menu'>" +
            "<li><a href='#' onclick='close_all()'><span class =' icon-boton-cancelar' style='font-size:18px;'></span></a></li>" +
            "<li><a href='#'>Measures&#9662;</a>" +
            "<ul>" +
            "<li><a href='#' id='Distance'>Distance</a></li>" +
            "<li><a href='#' id='Angle'>Angle</a></li>" +
            "<li><a href='#' id='None2'>None</a></li>" +
            "  <li><a href='#' id='DeleteMeasures'>Delete</a></li>" +
            "</ul>"

            +
            "<li style='display:none;'><a href='#'>Markers&#9662;</a>" +
            " <ul>" +
            "   <li><a href='#' id='ShowMarkers'>Show Markers</a></li>" +
            " <li><a href='#' id='HideMarkers'>Hide Markers</a></li>" +
            "<li><a href='#' id='DeleteMarkers'>Delete Markers</a></li>" +
            "</ul>" +
            "</li>" +
            "<li style='display:none;'><a href='#'>A.Selected&#9662;</a>" +
            "<ul>" +
            " <li><a href='#'id='Center'>Center Atom</a></li>" +
            " <li><a href='#' id='None1'>None</a></li>" +
            " </ul>" +
            " </li>" +
            "<li style='display:none;'><a href='#'  title='Helix and Sheet' id='ViewHS'>H&S</a></li>" +
            " <li><a href='#' id='Axis'>Axis</a></li>" +
            " <li><a href='#' onclick='consola()'>Consola</a></li>" +
            "</ul>" +
            "</div>"

            +
            " <div id='menu_view' class='menu_open' style='overflow:auto;'>" +
            " <ul class='menu'>" +
            "     <li><a href='#' onclick='close_all()'><span class =' icon-boton-cancelar' style='font-size:18px;'></span></a></li>" +
            "    <li><a href='#' id='FrontView'>Front</a></li>" +
            "    <li><a href='#' id='LeftView'>Left</a></li>" +
            "   <li><a href='#' id='RightView'>Right</a></li>" +
            "   <li><a href='#' id='UpView'>Top</a></li>" +
            "   <li><a href='#' id='DownView'>Bottom</a></li>" +
            "  <li><a href='#' id='BackView'>Back</a></li>" +
            " </ul>" +
            "</div>" +
            "<div id='menu_medidas' class='menu_open' style='overflow:auto;'>" +
            "<ul class>" +
            "<li><a href='#' onclick='close_all()'><span class =' icon-boton-cancelar' style='font-size:18px;'></span></a></li>" +
            "<li><a href='#' id='Distance'>Distance</a></li>" +
            "<li><a href='#' id='Angle'>Angle</a></li>" +
            "<li><a href='#' id='None2'>None</a></li>" +
            "  <li><a href='#' id='DeleteMeasures'>Delete</a></li>" +
            "</ul>" +
            "</div>" +
            "</div>" +
            "  <div id='MainMenu'>" +
            "</div>"

        document.getElementById('WebGL-Out').innerHTML = hope;
        var tagjs = document.createElement("script");
        //tagjs.setAttribute("src", "fonts/optimer_regular.typeface.js");
        document.getElementsByTagName("head")[0].appendChild(tagjs);
        Container = container;
        //Container.onmouseover=function (){main.Obj3D.updatecontrols=true};
        //Container.onmouseout=function (){main.Obj3D.updatecontrols=false};
        var Menus = document.getElementById("Menus");
        main.menu = document.getElementById("menu");
        var webgl = document.getElementById("WebGL-Out");
        MainMenu = document.getElementById('div');
        data = document.getElementById("data");
        zoom = document.getElementById("zoom");

        //Botones para las representaciones
        var buttonOp = document.getElementById("VDW");
        buttonOp.onclick = R_Cpk();

        buttonOp = document.getElementById("Spheres Bonds");
        buttonOp.onclick = R_SB();

        buttonOp = document.getElementById("Bonds");
        buttonOp.onclick = R_B();

        buttonOp = document.getElementById("Skeleton");
        buttonOp.onclick = R_Skele();

        buttonOp = document.getElementById("Spline");
        buttonOp.onclick = R_Spline();


        if (typeof (URLS) != "undefined") {
            for (var i in URLS) {
                var button = document.getElementById("Molecule");
                button.innerHTML += '<li><a href="#" id="new"></a></li>';

                button = document.getElementById("new");
                button.id = URLS[i].name;
                button.innerHTML = URLS[i].name;
            }

        } else {
            URLS = null;
        }

        var button = document.getElementById("Molecule");
        button.innerHTML += '<li id="btnDLPDB"><a href="http://' + WebIP + '/HTMoLv3.5/pdbfiles/' + pdbInicial + '" download>Download PDB</a></li>';
        button.innerHTML += '<li id="btnDLTRJ"><a href="http://' + WebIP + '/HTMoLv3.5/trjfiles/' + trjInicial + '" download>Download TRJ</a></li>';
        button.innerHTML += '<li id="btnByURL"><a href="#" id="ByURL">Load PDB</a></li>';
        button.innerHTML += '<li id="btnLoadTraj"><a href="#" id="loadtraj">Load TRJ</a></li>';
        button.innerHTML += '<li style="display:none;"><a href="#" id="trajauto">Auto trajectory</a></li>';

        button = document.getElementById("ByURL");
        button.onclick = this.ScenebyURL();

        var buttontraj = document.getElementById("loadtraj");
        buttontraj.onclick = this.ScenebyTrajectory();

        var buttontrj = document.getElementById("trajauto");
        buttontrj.onclick = function () {
            url = URL_TRJ_AutoLoad_default;
            main.MakeModel(url);
        }

        if (showOpen == false) {
            document.getElementById("btnByURL").style.display = "none";
            document.getElementById("btnLoadTraj").style.display = "none";
        }

        if (showDownload == false) {
            document.getElementById("btnDLPDB").style.display = "none";
            document.getElementById("btnDLTRJ").style.display = "none";
        }

        main.Buttons();

    }

    this.Scene = function (url) {
        return function (event) {
            main.Model(url);
        }
    }

    this.ScenebyURL = function () {
        return function (event) {
            // We can define a default PDB file used at the prompt
            url = prompt("URL: ", URL_PDB_Load_default);
            // or input the 4 letter code of the protein to be dowloaded from the PDB site
            if (url != '') {
                if (url.length == 4)
                    url = "http://www.rcsb.org/pdb/files/" + url + ".pdb";
                try {
                    main.MakeModel(url);
                } catch (e) {
                    data.innerHTML = 'HTMoL3: Error (ScenebyURL). Invalid URL (' + url + ') or connection to PDB server not available.';
                }
            }

        }
    }

    this.trajreview = function () //Esta función no se usa
    {
        alert("help");
        trjauto = true;
        bndknowframe = true;
        $('#loadtraj').click();
    }

    this.ScenebyTrajectory = function () {
        return function (event) {
            try {
                bndfinal = false;
                autoload = false;
                main.filerequest();
                DinamicaActiva = true;
            } catch (e) {
                data.innerHTML = 'HTMoL3: Error. Invalid file or connection not available '.concat(e);
            }
        }
    }

    this.loadTrjByScene = function () {
        try {
            trjauto = false;
            bndfinal = false;
            main.filerequest();
            DinamicaActiva = true;
        } catch (e) {
            data.innerHTML = 'HTMoL3: Error. Invalid file or connection not available '.concat(e);
        }
    }

    this.filerequest = function () {
        trjbnd = false;
        numframe = 0;
        requireddata = false;
        totalframes = 0;
        pos = 0;
        sizeglob = 0;
        readend = mxSize;
        readstart = 0;
        bndbuffer = 0;
        sizearrayp = 0;
        coordsX = new Float32Array();
        coordsX1 = new Float32Array();
        coordsY = new Float32Array();
        coordsY1 = new Float32Array();
        coordsZ = new Float32Array();
        coordsZ1 = new Float32Array();
        bndreview = false;
        bitratespeed();
        var interval = setInterval(function () {
            if ((sizeglob / molecule.GetAtoms().length) > 0) {
                trjbnd = true;
                var button = document.getElementById("playpause");
                button.style.display = "inline";
                clearInterval(interval);
            }
        }, 1000);
    }

    function bitratespeed() {
        var imageAddr = "static/speedtest.jpg" + "?n=" + Math.random();
        var startTime, endTime;
        var downloadSize = 81877;
        var download = new Image();
        download.onload = function () {
            endTime = (new Date()).getTime();
            senddataworker(startTime, endTime, downloadSize);
        }
        startTime = (new Date()).getTime();
        download.src = imageAddr;
    }

    function senddataworker(startTime, endTime, downloadSize) {
        var duration = Math.round((endTime - startTime) / 1000);
        var bitsLoaded = downloadSize * 8;
        bitrate = Math.round(bitsLoaded / duration);
        if (!trjauto && autoload == false) //en este bloque se asigna la trayectoria
        {
            // We can set a default trajectory file to be displayed at the prompt
            fpath = window.prompt("Name of the trajectory file", URL_TRJ_Load_default);
            molecule.TrjPath = fpath;
            bndknowframe = false;
        } else if (autoload == true) {
            fpath = trjInicial;
            molecule.TrjPath = trjInicial;
            bndknowframe = false;
            if (autoplay) {
                var button = document.getElementById("playpause");
                button.value = "Pause";
                button.className = "icon-boton-de-pausa";
                RegFrame = false;
            }
        } else {
            fpath = main.ObjP.Model.TrjPath;
            bndknowframe = true;
            trjauto = false;
            if (autoplay == false) {
                totalframes1 = main.ObjP.Model.Frames;
                var button = document.getElementById("playpause");
                button.value = 'Play';
            }
        }
        //       if(autoplay) {
        data.innerHTML = 'HTMoL: Loading trajectory file ' + fpath;
        //        }
        worker1.postMessage({
            cmd: "startfile",
            fpath: fpath,
            natoms: molecule.GetAtoms().length,
            bitrate: bitrate,
            readstart: readstart,
            readend: readend
        });
        var intervalreq = setInterval(function () {
            if (bndfinal == true) {
                //console.log("HTMoL3: ya lo borro");
                clearInterval(intervalreq);
            } else {
                if (parseInt(totalframes) == numframe && bndfinal == true) {
                    //main.DeleteModel();
                    //main.MakeModel(url);
                    //console.log("HTMoL3: lo va a borrar");
                    clearInterval(intervalreq);
                }
                if (totalframes > 200 && (totalframes - numframe) <= 200 && requireddata == true) {
                    requireddata = false;
                    sizearrayp = 0;
                    if (bndbuffer == 1) {
                        coordsX = new Float32Array(sizearrayp);
                        coordsY = new Float32Array(sizearrayp);
                        coordsZ = new Float32Array(sizearrayp);
                    } else {
                        coordsX1 = new Float32Array(sizearrayp);
                        coordsY1 = new Float32Array(sizearrayp);
                        coordsZ1 = new Float32Array(sizearrayp);
                    }
                    worker1.postMessage({
                        cmd: "startfile",
                        fpath: fpath,
                        natoms: molecule.GetAtoms().length,
                        bitrate: bitrate,
                        readstart: readstart,
                        readend: readend
                    });
                }
            }
        }, 2000);
    }

}

function handle_mousedown(e) {
    alert("entra");
    window.my_dragging = {};
    my_dragging.pageX0 = e.pageX;
    my_dragging.pageY0 = e.pageY;
    my_dragging.elem = this;
    my_dragging.offset0 = $(this).offset();

    function handle_dragging(e) {
        var left = my_dragging.offset0.left + (e.pageX - my_dragging.pageX0);
        var top = my_dragging.offset0.top + (e.pageY - my_dragging.pageY0);
        $(my_dragging.elem)
            .offset({
                top: top,
                left: left
            });
    }

    function handle_mouseup(e) {
        $('body')
            .off('mousemove', handle_dragging)
            .off('mouseup', handle_mouseup);
    }
    $('body')
        .on('mouseup', handle_mouseup)
        .on('mousemove', handle_dragging);
}
$('Console').mousedown(handle_mousedown);




$(function () {
    //    $( "#Console" ).draggable();
});

/*
$(function ()
{
var main= new Main();
var container = document.getElementById("Contenedor");
//main.SetBackgroundColor(0xff0000);
main.MakeMenu(container);

});
*/