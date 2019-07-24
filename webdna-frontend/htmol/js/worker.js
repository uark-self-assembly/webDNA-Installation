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

self.importScripts('../local/config.js');
self.importScripts('binary.js');

var readstart = 0,
    readend = 0,
    bnd = true,
    bndrev = false;


self.addEventListener('message', function (e) {
    if (e.data.cmd == "startfile") {
        var client = new BinaryClient("ws://" + WebIP + ":" + WebPort);
        var sizeint = new Array(3);
        var minint = new Array(3);
        var maxint = new Array(3);
        var sizesmall = new Array(3);
        var buffer = new ArrayBuffer();
        var fpath = "";
        var iarr = 0;
        var iarr1 = 0;
        var iarr2 = 0;
        var numframe = -1;
        var st = 1;
        var stop = 0;
        var tam = 0;
        var trans = 0;
        var init = 0;
        var part = new ArrayBuffer();
        var arreglo = new Float32Array(50000);
        var arreglo1 = new Float32Array(50000);
        var arreglo2 = new Float32Array(50000);

        //Bandera
        var xtc = false;
        var dcd = false;
        var endianess = false;

        //Variables DCD
        var rec_scale64 = false;
        var charmm = false;
        var hdrbuf;
        var n_csets;
        var first_ts;
        var framefreq;
        var n_fixed;
        var timestep;
        var unitcell;
        var noremarks;
        var dcdtitle;
        var remarks;
        var n_atoms;
        var ntitle;
        var n_floats;
        var s;
        var paso = 0;
        var arregl = new Float32Array(50000);
        var arregl1 = new Float32Array(50000);
        var arregl2 = new Float32Array(50000);

        const FIRSTIDX = 9;
        const ANGS_PER_NM = 10;
        var xtc_magicints = [0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 10, 12, 16, 20, 25, 32, 40, 50, 64,
            80, 101, 128, 161, 203, 256, 322, 406, 512, 645, 812, 1024, 1290,
            1625, 2048, 2580, 3250, 4096, 5060, 6501, 8192, 10321, 13003, 16384,
            20642, 26007, 32768, 41285, 52015, 65536, 82570, 104031, 131072,
            165140, 208063, 262144, 330280, 416127, 524287, 660561, 832255,
            1048576, 1321122, 1664510, 2097152, 2642245, 3329021, 4194304,
            5284491, 6658042, 8388607, 10568983, 13316085, 16777216
        ];

        readstart = e.data.readstart;
        readend = e.data.readend;
        fpath = e.data.fpath;
        //retardo para alcanzar a crear el binaryclient
        setTimeout(function () {
            client.send("fpath", {
                fpath: fpath,
                reqsize: true,
                verif: false
            });
        }, 2000);
        //console.log("HTMoL3: aa");
        client.on('stream', function (stream, meta) {
            // Buffer for parts:

            // Got new data
            stream.on('data', function (data) {
                try {
                    if (data == 'error') {
                        throw Error("HTMoL3: Error. File does not exists or corrupt");
                    } else if (data.slice(0, 4) == "size") {
                        tam = parseInt(data.slice(4));
                        //    self.postMessage({cmd:"sizefile",
                        //          sizef:tam); 
                        client.send("fpath", {
                            fpath: fpath,
                            reqsize: false,
                            verif: true,
                            start: 4,
                            end: 7
                        });
                    } else if (meta.natoms == true) {
                        if (new DataView(data).getInt32(0) == e.data.natoms) {
                            init = 1;
                            xtc = true;
                            client.send("fpath", {
                                fpath: fpath,
                                reqsize: false,
                                verif: false,
                                start: readstart,
                                end: readend
                            });
                        } else if (new DataView(data).getInt32(0) == 1146244931 || new DataView(data).getInt32(0, 1) == 1146244931) {
                            dcd = true;
                            client.send("fpath", {
                                fpath: fpath,
                                reqsize: false,
                                verif: false,
                                start: readstart,
                                end: readend
                            });
                        } else {
                            throw new Error("HTMoL3: Unrecognized or damaged file. Number of atoms on file are not equal (TRJ:" + new DataView(data).getInt32(0) + " PDB:" + e.data.natoms + ")");
                        }
                    } else {
                        //    console.log(part.byteLength);
                        trans += data.byteLength;
                        var tmp = new Uint8Array(part.byteLength + data.byteLength);
                        //console.log(tmp);
                        tmp.set(new Uint8Array(part), 0);
                        tmp.set(new Uint8Array(data), part.byteLength);
                        part = tmp.buffer;
                        if (xtc == true) {
                            if (st == 1) {
                                if (bndrev == true) {
                                    for (var i = 0; i < 5; i++) {
                                        if (new DataView(part).getInt32(i) != 1995) {
                                            console.log("HTMoL3: ACA ");
                                        } else {
                                            part = part.slice(i);
                                            bndrev = false;
                                            console.log("HTMoL3: AQUI" + new DataView(part).getInt32(0));

                                            break;
                                        }
                                    }
                                }
                                checkfile(part);
                                st = 0;
                            }
                            if (stop == 0) {
                                readhead(part);
                            }
                        } else {

                        }
                    }
                } catch (err) {
                    throw err;
                }
            });
            stream.on('end', function () {
                if (dcd == true) {
                    leer(part);
                    //console.log("HTMoL3: final");
                    bnd = true;
                    readend = 0;
                    readstart = 0;
                    bndrev = false;
                    self.postMessage({
                        cmd: "endfinal"
                    });
                } else {
                    if (!meta.natoms) {
                        //if(trans==5000000){
                        var myfloat = arreglo.subarray(0, iarr);
                        var myfloat1 = arreglo1.subarray(0, iarr1);
                        var myfloat2 = arreglo2.subarray(0, iarr2);
                        self.postMessage({
                            cmd: "enviar",
                            dato: myfloat,
                            dato1: myfloat1,
                            dato2: myfloat2,
                            bndarray: bnd
                        });
                        trans = 0;
                        st = 1;
                        iarr = 0, iarr1 = 0, iarr2 = 0;
                        // }
                        self.postMessage({
                            cmd: "final",
                            wast: part.byteLength - 1
                        });
                        bnd = !bnd;
                        if (readend >= tam) {
                            //console.log("HTMoL3: final");
                            bnd = true;
                            readend = 0;
                            readstart = 0;
                            bndrev = false;
                            self.postMessage({
                                cmd: "endfinal"
                            });
                        }

                    }
                }

            });
        });

        function checkfile(buffer) {
            if (new DataView(buffer).getInt32(0) != 1995) {
                throw new Error("HTMoL3: Erro. File is not an XTC-File! ");
                stop = 1;
                return -1;
            }
            natoms = new DataView(buffer).getInt32(4);
            if (natoms != e.data.natoms) {
                throw Error("HTMoL3:  Bad format or number of atoms on file are not equal (TRJ:" + natoms + " PDB:" + e.data.natoms + ")");
                stop = 1;
                return -1;
            }
        }


        function readhead(buffer) {
            //var x = new Array(3);
            //var y = new Array(3);
            //var z = new Array(3);
            var bitsizeint = new Array(3);
            var buf = new Array(4);
            var position = 0;
            //if(new DataView(buffer).getInt32(position)!=1995){  
            //return -1;
            //}else{
            position += 4;
            //}
            //natoms = new DataView(buffer).getInt32(position);
            //if(natoms!=main.Obj3D.molecule.GetAtoms().length){
            //alert("This file not is valid for this molecule");
            //disconnect=true;
            //return;
            //}
            position += 4;

            //step = new DataView(buffer).getInt32(position);
            position += 4;

            //time = new DataView(buffer).getFloat32(position);
            position += 4;

            //for(i=0;i<3;i++){
            //x[i] = new DataView(buffer).getFloat32(position); 
            //y[i] = new DataView(buffer).getFloat32(position+4);
            //z[i] = new DataView(buffer).getFloat32(position+8);
            position += 36; //*36 without for cicle 
            //}

            lsize = new DataView(buffer).getInt32(position);
            size = lsize;
            position += 4;

            precision = new DataView(buffer).getFloat32(position);
            position += 4;

            for (i = 0; i < 3; i++) {
                minint[i] = new DataView(buffer).getInt32(position);
                maxint[i] = new DataView(buffer).getInt32(position + 12);
                position += 4;
            }
            position += 12;

            sizeint[0] = maxint[0] - minint[0] + 1;
            sizeint[1] = maxint[1] - minint[1] + 1;
            sizeint[2] = maxint[2] - minint[2] + 1;

            if ((sizeint[0] | sizeint[1] | sizeint[2]) > 0xffffff) {
                bitsizeint[0] = xtc_sizeofint(sizeint[0]);
                bitsizeint[1] = xtc_sizeofint(sizeint[1]);
                bitsizeint[2] = xtc_sizeofint(sizeint[2]);
                bitsize = 0; /* flag the use of large sizes */
            } else {
                bitsizeint[0] = xtc_sizeofint(sizeint[0]);
                bitsize = xtc_sizeofints(3, sizeint);
            }

            smallidx = new DataView(buffer).getInt32(position);
            position += 4;

            smaller = (xtc_magicints[FIRSTIDX > smallidx - 1 ? FIRSTIDX : smallidx - 1] / 2) | 0;
            small = (xtc_magicints[smallidx] / 2) | 0;
            sizesmall[0] = sizesmall[1] = sizesmall[2] = (xtc_magicints[smallidx] >>> 0);

            buf[0] = new DataView(buffer).getInt32(position);
            position += 4;

            if (buf[0] < 0) return -1;

            if ((part.byteLength - 92) >= buf[0]) {
                part = buffer.slice(position);
                calculatecoords(part, buf);
            }
        }


        function calculatecoords(buffer, buf) {
            var thiscoord = new Array(3);
            var prevcoord = new Array(3);
            var lfp = [];
            var cntcoor = 0;
            var j = 0;
            buf[3] = buffer.slice(0, buf[0]);
            buf[0] = buf[1] = buf[2] = 0;
            //lfp = fp;
            inv_precision = 1.0 / (precision);
            run = 0;
            i = 0;
            lip = null;
            numframe++;

            //thiscoord[0] = xtc_receivebits(buf, bitsizeint[0]);
            while (i < lsize) {
                //thiscoord=lip+i*3;
                if (bitsize == 0) {
                    // hd: in this case this code will be never loaded
                    thiscoord[0] = xtc_receivebits(buf, bitsizeint[0]);
                    thiscoord[1] = xtc_receivebits(buf, bitsizeint[1]);
                    thiscoord[2] = xtc_receivebits(buf, bitsizeint[2]);
                } else {
                    xtc_receiveints(buf, 3, bitsize, sizeint, thiscoord);
                }

                i++;

                thiscoord[0] += minint[0];
                thiscoord[1] += minint[1];
                thiscoord[2] += minint[2];

                prevcoord[0] = thiscoord[0];
                prevcoord[1] = thiscoord[1];
                prevcoord[2] = thiscoord[2];

                flag = xtc_receivebits(buf, 1);
                is_smaller = 0;

                if (flag == 1) {
                    run = xtc_receivebits(buf, 5);
                    is_smaller = run % 3;
                    run -= is_smaller;
                    is_smaller--;
                }

                if (run > 0) {
                    //thiscoord += 3; // HD note: just effects that all elements in the array thiscoord gets the value 0
                    for (k = 0; k < run; k += 3) {

                        xtc_receiveints(buf, 3, smallidx, sizesmall, thiscoord);
                        i++;
                        thiscoord[0] += prevcoord[0] - small;
                        thiscoord[1] += prevcoord[1] - small;
                        thiscoord[2] += prevcoord[2] - small;


                        if (k == 0) {
                            /* interchange first with second atom for better
                             * compression of water molecules
                             */

                            tmp = thiscoord[0];
                            thiscoord[0] = prevcoord[0];
                            prevcoord[0] = tmp;
                            tmp = thiscoord[1];
                            thiscoord[1] = prevcoord[1];
                            prevcoord[1] = tmp;
                            tmp = thiscoord[2];
                            thiscoord[2] = prevcoord[2];
                            prevcoord[2] = tmp;

                            lfp[cntcoor] = prevcoord[0] * inv_precision;
                            lfp[cntcoor + 1] = prevcoord[1] * inv_precision;
                            lfp[cntcoor + 2] = prevcoord[2] * inv_precision;
                            cntcoor += 3;

                        } else {
                            prevcoord[0] = thiscoord[0];
                            prevcoord[1] = thiscoord[1];
                            prevcoord[2] = thiscoord[2];


                        }

                        lfp[cntcoor] = thiscoord[0] * inv_precision;
                        lfp[cntcoor + 1] = thiscoord[1] * inv_precision;
                        lfp[cntcoor + 2] = thiscoord[2] * inv_precision;
                        cntcoor += 3;
                    } // loop for

                } else {
                    lfp[cntcoor] = thiscoord[0] * inv_precision;
                    lfp[cntcoor + 1] = thiscoord[1] * inv_precision;
                    lfp[cntcoor + 2] = thiscoord[2] * inv_precision;
                    cntcoor += 3;
                }

                smallidx += is_smaller;
                if (is_smaller < 0) {
                    small = smaller;
                    if (smallidx > FIRSTIDX) {
                        smaller = xtc_magicints[smallidx - 1] / 2;
                    } else {
                        smaller = 0;
                    }
                } else if (is_smaller > 0) {
                    smaller = small;
                    small = xtc_magicints[smallidx] / 2;
                }
                sizesmall[0] = sizesmall[1] = sizesmall[2] = xtc_magicints[smallidx];


            }

            //Scale
            for (n = 0; n < natoms * 3; n++) {
                lfp[n] *= ANGS_PER_NM;
            }

            var row = 1;
            var counter = 0;
            //atom=main.Obj3D.molecule.GetAtoms()[counter];
            do {

                if (row > 3) {
                    row = 1;
                    counter++;
                    //atom=main.Obj3D.molecule.GetAtoms()[counter];
                }

                //var floatTmp = lfp[j]/ANGS_PER_NM;

                if (row == 1) {
                    arreglo[iarr] = lfp[j];
                    iarr++;
                } else if (row == 2) {

                    arreglo1[iarr1] = lfp[j];
                    iarr1++;
                } else if (row == 3) {
                    arreglo2[iarr2] = lfp[j];
                    iarr2++;
                }

                if (iarr2 == arreglo2.length) {
                    iarr2 = 0, iarr1 = 0, iarr = 0;
                    self.postMessage({
                        cmd: "enviar",
                        dato: arreglo,
                        dato1: arreglo1,
                        dato2: arreglo2,
                        bndarray: bnd
                    });
                }

                row++;
                j++;
            } while (j < natoms * 3);

            //          console.log(buffer.byteLength + "   " + buf[3].byteLength);

            if (buffer.byteLength >= buf[3].byteLength + 9) {
                for (i = 0; i < 5; i++) {
                    if (buffer.byteLength > buf[3].byteLength + i) {
                        if (new DataView(buffer).getInt32(buf[3].byteLength + i) != 1995) {} else {
                            break;
                        }
                    }
                }

                part = buffer.slice(buf[3].byteLength + i);
            } else if (trans < tam) {
                part = buffer.slice(buf[3].byteLength);
                bndrev = true;
            }
            //console.log("HTMoL3: "+part.byteLength);

            if (part.byteLength >= 92) {
                nextbuf = new DataView(part).getInt32(88);
                if (part.byteLength >= 92 + nextbuf) {
                    //console.log("pasa");   
                    readhead(part);
                }
            }

        }



        function xtc_sizeofint(size) {
            var num = (1 >>> 0);
            var ssize = (size >>> 0);
            var nbits = 0;

            while (ssize >= num && nbits < 32) {
                nbits++;
                num <<= 1;
            }

            return nbits;
        }

        function xtc_sizeofints(nints, sizes) {
            var i;
            var num;
            var nbytes, nbits, bytecnt, tmp;
            var bytes = new Array(32);
            nbytes = (1 >>> 0);
            bytes[0] = (1 >>> 0);
            nbits = 0;

            for (i = 0; i < nints; i++) {
                tmp = 0;
                for (bytecnt = 0; bytecnt < nbytes; bytecnt++) {
                    tmp = (bytes[bytecnt] >>> 0) * (sizes[i] >>> 0) + (tmp >>> 0);
                    bytes[bytecnt] = (tmp >>> 0) & 0xff;
                    tmp >>= 8;
                }

                while (tmp != 0) {
                    bytes[bytecnt++] = (tmp >>> 0) & 0xff;
                    tmp >>= 8;

                }
                nbytes = (bytecnt >>> 0);
            }
            num = 1;
            nbytes--;

            while (bytes[nbytes] >= num) {
                nbits++;
                num *= 2;

            }

            return nbits + nbytes * 8;
        }


        function xtc_receivebits(buf, nbits) {
            var cnt, num;
            var lastbits, lastbyte, tmplast;
            var cbuf;
            var mask = (1 << nbits) - 1;
            cbuf = buf[3];
            cnt = buf[0];
            lastbits = (buf[1] >>> 0);
            lastbyte = (buf[2] >>> 0);

            num = 0;
            while (nbits >= 8) {
                var minum = getInt8(cnt, cbuf);
                lastbyte = ((lastbyte >>> 0) << 8) | (minum >>> 0);
                cnt += 8;
                num |= ((lastbyte >>> 0) >> (lastbits >>> 0)) << (nbits - 8);
                nbits -= 8;

            }

            if (nbits > 0) {
                if (lastbits < (nbits >>> 0)) {
                    lastbits += 8;
                    minum = getInt8(cnt, cbuf);
                    lastbyte = ((lastbyte >>> 0) << 8) | (minum >>> 0);
                    cnt += 8;
                }

                lastbits -= nbits;
                num |= ((lastbyte >>> 0) >> (lastbits >>> 0)) & ((1 << nbits) - 1);
            }
            num &= mask;
            buf[0] = cnt;
            buf[1] = (lastbits >>> 0);
            buf[2] = (lastbyte >>> 0);
            return num;
        }

        function xtc_receiveints(buf, nints, nbits, sizes, nums) {
            var bytes = new Array(32);
            var i, j, nbytes, p, num;

            bytes[1] = bytes[2] = bytes[3] = 0;
            nbytes = 0;
            i = 0;

            do {
                bytes[i] = 0;
                i++;
            } while (i < 32);

            while (nbits > 8) {
                bytes[nbytes] = parseInt(xtc_receivebits(buf, 8));
                nbytes++;
                nbits -= 8;
            }


            if (nbits > 0) {
                bytes[nbytes] = parseInt(xtc_receivebits(buf, nbits));
                nbytes++;
            }

            for (i = nints - 1; i > 0; i--) {
                num = 0;

                for (j = nbytes - 1; j >= 0; j--) {
                    num = (num << 8) | bytes[j];
                    p = parseInt(num / (sizes[i] >>> 0));
                    bytes[j] = p;
                    num = num - p * (sizes[i] >>> 0);
                }
                nums[i] = num;
            }

            nums[0] = bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);


        }


        function getInt8(idx, buf) {
            var buffer = buf;
            var u8 = new Uint8Array(buf);
            var bidx = idx / 8 | 0;
            var a = u8[bidx];
            return a;
        }

        function endianness() {
            var b = new ArrayBuffer(4);
            var a = new Uint32Array(b);
            var c = new Uint8Array(b);
            a[0] = 0xdeadbeef;
            if (c[0] == 0xef) return 'LE';
            if (c[0] == 0xde) return 'BE';
            throw new Error('unknown endianness');
        }

        function swap32(val, endian) { //Esta funcion voltea la endianess segun la bandera endian
            if (endian) {
                return ((val & 0xFF) << 24) |
                    ((val & 0xFF00) << 8) |
                    ((val >> 8) & 0xFF00) |
                    ((val >> 24) & 0xFF);
            } else //si no hay necesidad de voltearlo lo regresa igual
                return val;
        }

        function swaparray(buf, endian) //Para hacer swap a un arreglo
        {
            if (endian) {
                var endi = false;
                if (endianness() == 'BE') {
                    endi = true;
                }
                var n = new Float32Array(n_atoms + 2);
                for (var i = 0, index = 0; i < n.length; i++, index += 4) {
                    n[i] = new DataView(buf).getFloat32(index, endi);
                }
                return n;
            } else {
                return new Float32Array(buf);
            }
        }

        leer = function (part) {
            var doc = new Int32Array(part); // Se ven los bytes como Ints de 4 Bytes
            if (doc[0] + doc[1] == 84) { //Todos los Archivos DCD Empiezan con un 84 seguido de la palabra CORD
                console.log("HTMoL3: 64 bits Rescale ");
                rec_scale64 = true; //Se Activa La Bandera de que son Numeros de 64bits(8 Bytes)
                throw new error("HTMoL3: Error. 64 bit Format Is not Supported");
            } else if (doc[0] == 84 && doc[1] == 1146244931) { //Valor de la palabra CORD en Numero
                console.log("HTMoL3: 32 bit Rescale");
                rec_scale64 = false; //Se desactiva la bandera son enteros comunes 32bits(4 bytes)
            } else if (swap32(doc[0], true) == 84 && doc[1] == 1146244931) {
                endianess = true;
                console.log("HTMoL3: I need to change DCD file endianess");
            } else if (doc[0] == null) {
                throw new Error("HTMoL3: Connection delay, but don't worry, I'm still loading DCD file...");
            } else {
                throw new Error("HTMoL3: Error. DCD CORD or Initial 84 Not Found");
            }
            if (!rec_scale64) { //Proceso si el archivo maneja enteros de 32bits
                hdrbuf = new Int32Array(doc.subarray(2, 22)); //Se Lee encabezado(80 Bytes)
                //console.log(hdrbuf);
                if (hdrbuf[-1] != 0) { //Si el ultimo valor del encabezado 0 es formato X-PLOR de lo contrario es CHARMM
                    charmm = true;
                } else {
                    throw new Error("HTMoL3: Error. DCD X-plor Format Not Supported"); //Por Ahora
                }
                n_csets = swap32(hdrbuf[0], endianess); //Numero de sets de 
                first_ts = swap32(hdrbuf[1], endianess); //Cuadro desde el que inicia la animacion
                framefreq = swap32(hdrbuf[2], endianess); //Cantidad de Cuadros entre archivos dcd
                n_fixed = swap32(hdrbuf[8], endianess); // Cantidad De Atomos Fijos


                if (n_fixed != 0) {
                    throw new Error("HTMoL3: Error. DCD Trajectories with Fixed Atoms are Not Supported");
                }

                timestep = swap32(hdrbuf[9], endianess); //Cantidad De Cuadros Por segundo
                unitcell = swap32(hdrbuf[10], endianess) == 1; //Indica si Hay Informacion de Unitcell

                if (unitcell) {
                    paso = 14;
                }

                if (swap32(doc[22], endianess) != 84) { //Estas validaciones verifican el fin del bloque....
                    throw new Error("HTMoL3: Error. DCD Bad Format");
                }
                if ((swap32(doc[23], endianess) - 4) % 80 != 0) { //y El inicio del siguiente
                    throw new Error("HTMoL3: Error. DCD Bad Format");
                }
                noremarks = swap32(doc[23], endianess) == 84; //Se verifica si hay remarks 
                ntitle = swap32(doc[24], endianess); // se lee ntitle
                var pos = 25; //Variable para posicion, A partir de este punto puede haber variaciones
                dcdtitle = new Uint32Array(doc.subarray(pos, pos + (ntitle * 20))); //Se lee dcdtitle
                pos += (ntitle * 20);
                if ((swap32(doc[pos], endianess) - 4) % 80 != 0 || swap32(doc[pos + 1], endianess) != 4) { //Aqui se valida el fin del bloque
                    throw new Error("HTMoL3: Error. DCD Bad Format");
                }
                pos += 2;
                n_atoms = swap32(doc[pos], endianess);
                pos++;
                if (swap32(doc[pos], endianess) != 4 || n_atoms != e.data.natoms) {
                    throw new Error("HTMoL3: Error. Bad Format or Number of Atoms on file are not equal (TRJ:" + n_atoms + " PDB:" + e.data.natoms + ")");
                }
                pos += paso + 1;
                var buff = new Float32Array(part);
                n_floats = n_atoms + 2;
                for (var i = 0; i < n_csets; i++) {
                    var arr = new Float32Array(buff.subarray(pos, pos + n_floats));
                    arr = swaparray(arr.buffer, endianess);
                    pos += n_floats;
                    var arr1 = new Float32Array(buff.subarray(pos, pos + n_floats));
                    arr1 = swaparray(arr1.buffer, endianess);
                    pos += n_floats;
                    var arr2 = new Float32Array(buff.subarray(pos, pos + n_floats));
                    arr2 = swaparray(arr2.buffer, endianess);
                    self.postMessage({
                        cmd: "enviar",
                        dato: arr.subarray(1, -1),
                        dato1: arr1.subarray(1, -1),
                        dato2: arr2.subarray(1, -1),
                        bndarray: bnd
                    });
                    pos += n_floats + paso;
                }


                console.log("HTMoL3: Fin de lectura");


            }
        }




    }
}, false);