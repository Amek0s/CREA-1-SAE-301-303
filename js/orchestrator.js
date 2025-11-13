import { create, update } from "./heatmapViz.js";
import getLastAttempts from "./RESTManagement.js";


function setupAutomaticUpdate(initialAttempts) {
    // Tableau contenant TOUTES les tentatives
    let allAttempts = initialAttempts;
    // Date de la dernière tentative
    let lastAttemptDate = new Date (attempts[attempts.length - 1][0]);




    setInterval(() => {
        // Récup des tentatives nouvelles depuis lastAttemptDate
    getLastAttempts(lastAttemptDate).then((newAttempts) => {
        // Rajout des tentatives au tableau
        allAttempts = allAttempts.concat(newAttempts);
        console.log("All attempts: " + allAttempts.length);
        // Mise à jour date de la dernière tentative
        lastAttemptDate = new Date(allAttempts[allAttempts.length - 1][0]);
        // Mise à jour du graph
        update(attempts);
    });
    }, 2000);
}


function main() {
    create();


    getLastAttempts(new Date()).then((attempts) => {
        console.log(attempts.length + " tentatives...")
        update(attempts);
        setupAutomaticUpdate(attempts);
    });
}


main();
