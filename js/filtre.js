"use strict";

document.addEventListener("DOMContentLoaded", initialiser);

function initialiser(evt) {
    let btnMenu = document.querySelector(".btn-menu");
    let menuList = document.querySelector(".menu-list");

    btnMenu.addEventListener("click", toggleMenu) //écouteur pour le click du menu-burger (btnMenu)
    function toggleMenu(evt) { 
        menuList.classList.toggle("open");
        btnMenu.classList.toggle("open");
    };
}