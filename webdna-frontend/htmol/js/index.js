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

maxH2 = "153px";
maxTam = "250px";
maxH1 = "110px";
var mediaquery = window.matchMedia("(max-width: 700px)");
if (mediaquery.matches) {

    maxTam ="150px";
    maxH2="165px";
    maxH1 = "135px";
} else {

    maxTam = "250px";
    maxH2="153px";
    maxH1 = "110px";
}

function toggleNavPanel() {

    var panel = document.getElementById("Menu_MenuPrincipal");

        if (panel.style.height == maxTam) {

            close_all();
            panel.style.height = "0px";

        } else {

            panel.style.height = maxTam;
            //navarrow.innerHTML = "&#9652;";
        }
}

function menu_open() {
    var panel = document.getElementById("menu_open");
    if (panel.style.height == maxH1) {
        panel.style.height = "0px";
    } else if (panel.style.height !== maxH1) {
        close_all();
        panel.style.height = maxH1;

    }
}

function menu_repre() {

    var panel = document.getElementById("menu_repre")

    if (panel.style.height == maxH2) {
        panel.style.height = "0px";


    } else if (panel.style.height !== maxH2) {
        close_all();
        panel.style.height = maxH2;


    }
}

function menu_action() {

    var panel = document.getElementById("menu_action"),
        maxH3 = "190px";
    if (panel.style.height == maxH3) {
        panel.style.height = "0px";

    } else if (panel.style.height !== maxH3) {
        close_all();
        panel.style.height = maxH3;

    }
}

function menu_select() {
    var panel = document.getElementById("menu_select"),
        maxH4 = "116px";
    if (panel.style.height == maxH4) {

        panel.style.height = "0px";

    } else if (panel.style.height !== maxH4) {
        close_all();
        panel.style.height = maxH4;

    }
}

function menu_view() {
    var panel = document.getElementById("menu_view"),
        maxH5 = "182px";
    if (panel.style.height == maxH5) {
        panel.style.height = "0px";

    } else if (panel.style.height !== maxH5) {
        close_all();
        panel.style.height = maxH5;

    }
}

function menu_medidas(x) {
    var panel = document.getElementById(x),
        maxH5 = "30%";
    if (panel.style.height == maxH5) {
        panel.style.height = "0px";

    } else if (panel.style.height !== maxH5) {
        close_all();
        panel.style.height = maxH5;

    }
}

function menu_open_close() {
    document.getElementById("menu_open").style.height = "0px";
    document.getElementById("menu_repre").style.height = "0px";
    document.getElementById("menu_action").style.height = "0px";
    document.getElementById("menu_select").style.height = "0px";
    document.getElementById("menu_view").style.height = "0px";
    document.getElementById("menu_medidas").style.height = "0px";
}

function close_all() {
    document.getElementById("menu_open").style.height = "0px";
    document.getElementById("menu_repre").style.height = "0px";
    document.getElementById("menu_action").style.height = "0px";
    document.getElementById("menu_select").style.height = "0px";
    document.getElementById("menu_view").style.height = "0px";
    document.getElementById("menu_medidas").style.height = "0px";

}
