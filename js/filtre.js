"use strict";

// On lance la fonction une fois que la page est chargée
document.addEventListener("DOMContentLoaded", initialiser);

function initialiser(evt) {
    // On récupère les éléments
    let btnMenu = document.querySelector(".btn-menu");
    let menuList = document.querySelector(".menu-list");
    let menuLinks = document.querySelectorAll(".menu-item a");

    // Gestion du clic sur le bouton burger (Ouvrir/Fermer)
    btnMenu.addEventListener("click", toggleMenu);

    function toggleMenu() {
        // Si la classe existe, on l'enlève. Si elle n'existe pas, on l'ajoute.
        menuList.classList.toggle("open");
        btnMenu.classList.toggle("open");
    }

    // Gestion du clic sur chaque lien du menu
    // On parcourt chaque lien un par un
    menuLinks.forEach(function(leLienClique) {
        
        leLienClique.addEventListener("click", function() {
            
            // 1. On enlève la classe "active" de TOUS les liens
            // (On refait une boucle sur tous les liens pour nettoyer)
            menuLinks.forEach(function(unLien) {
                unLien.classList.remove("active");
            });

            // 2. On ajoute la classe "active" sur le lien qu'on vient de cliquer
            // "this" représente l'élément qui a déclenché l'événement (le lien cliqué)
            this.classList.add("active");

            // 3. On ferme le menu
            menuList.classList.remove("open");
            btnMenu.classList.remove("open");
        });
        
    });
}