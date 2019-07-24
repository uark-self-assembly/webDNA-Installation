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

const FIRSTIDX = 9;
    const ANGS_PER_NM = 10;
    var xtc_magicints = [0, 0, 0, 0, 0, 0, 0, 0, 0,8, 10, 12, 16, 20, 25, 32, 40, 50, 64,
    80, 101, 128, 161, 203, 256, 322, 406, 512, 645, 812, 1024, 1290,
    1625, 2048, 2580, 3250, 4096, 5060, 6501, 8192, 10321, 13003, 16384,
    20642, 26007, 32768, 41285, 52015, 65536, 82570, 104031, 131072,
    165140, 208063, 262144, 330280, 416127, 524287, 660561, 832255,
    1048576, 1321122, 1664510, 2097152, 2642245, 3329021, 4194304,
    5284491, 6658042, 8388607, 10568983, 13316085, 16777216];

    var currentBuffer;
    var startAt;
    var sizeint = new Array(3);   
    var minint = new Array(3);
    var maxint = new Array(3);
    var sizesmall = new Array(3);
    var positionglob = 0;
    //var client = new BinaryClient('ws://localhost:9000');
    var buffer = new ArrayBuffer();
    var fpath = "";
    var part = new ArrayBuffer();
    var numframe = -1;
    var st=1;
    var stop=0;
    
function xtc_sizeofint(size){
  var num = (1>>>0);
  var ssize = (size >>>0);
  var nbits = 0;  

  while (ssize >= num && nbits < 32) {
    nbits++;
    num <<= 1;
  }

  return nbits;
}

function xtc_sizeofints(nints, sizes){
  var i;
  var num;
  var nbytes, nbits, bytecnt, tmp;
  var bytes = new Array(32);
  nbytes = (1>>>0);
  bytes[0] = (1>>>0);
  nbits  = 0;

  for (i=0; i < nints; i++) { 
      tmp = 0;
      for (bytecnt = 0; bytecnt < nbytes; bytecnt++) {
        tmp = (bytes[bytecnt]>>>0) * (sizes[i]>>>0) + (tmp>>>0);
        bytes[bytecnt] = (tmp>>>0) & 0xff;
        tmp >>= 8;
      }

  while (tmp != 0) {
      bytes[bytecnt++] = (tmp>>>0) & 0xff;
      tmp >>= 8;

    }
    nbytes = (bytecnt>>>0);
  }
  num = 1;
  nbytes--;

  while (bytes[nbytes] >= num) {
    nbits++;
    num *= 2;
    
  }

  return nbits + nbytes * 8;
}


function xtc_receivebits(buf, nbits){
  var cnt, num;
  var lastbits, lastbyte, tmplast;
  var cbuf;
  var mask=(1<<nbits)-1;
  cbuf=buf[3];
  cnt=buf[0];
  lastbits = (buf[1]>>>0);
  lastbyte = (buf[2]>>>0);

  num = 0;
  while (nbits >= 8) {
    var minum = getInt8(cnt,cbuf);
      lastbyte = ( (lastbyte>>>0) << 8 ) | (minum>>>0);
      cnt+=8;
    num |=  ((lastbyte>>>0) >> (lastbits>>>0)) << (nbits - 8);
    nbits -=8;  

  }

  if (nbits > 0) {
    if (lastbits < (nbits>>>0)){
      lastbits += 8;
      minum = getInt8(cnt,cbuf);
      lastbyte = ((lastbyte>>>0) << 8) | (minum>>>0); 
      cnt+=8;
    }

    lastbits -= nbits;
    num |= ((lastbyte>>>0) >> (lastbits>>>0)) & ((1 << nbits) -1);
  }
  num &= mask;
  buf[0] = cnt;
  buf[1] = (lastbits>>>0);
  buf[2] = (lastbyte>>>0);  
  return num; 
}

function xtc_receiveints(buf, nints, nbits, sizes, nums){
  var bytes = new Array(32);
  var i, j, nbytes,p,  num;

  bytes[1] = bytes[2] = bytes[3] = 0;
  nbytes = 0;
  i=0;  

  do{ 
    bytes[i] = 0;
    i++;
  }while(i<32);

  while (nbits > 8) {
    bytes[nbytes] = parseInt(xtc_receivebits(buf, 8));
    nbytes++;
    nbits -= 8;
  }


  if (nbits > 0) {
    bytes[nbytes] = parseInt(xtc_receivebits(buf, nbits));
    nbytes++;
  }

  for (i = nints-1; i > 0; i--) {
    num = 0;

    for (j = nbytes-1; j >=0; j--) {      
      num = (num << 8) | bytes[j];
      p = parseInt(num /(sizes[i]>>>0));  
      bytes[j] = p;
      num = num - p * (sizes[i]>>>0);
    }
    nums[i] = num;
  }

  nums[0] = bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);


}


function getInt8(idx, buf) {
  var buffer = buf;
  var u8 = new Uint8Array(buf);
  var bidx = idx/8 | 0;
  var a = u8[bidx];
  return a;
}
