import { loadHeatmapSettings, saveHeatmapSettings } from "./cacheManagement.js";

let myChart;


export function create() {
    // Reçu de l'élément DOM
    let chartDom = document.querySelector('#attemptsHeatmap > .viz'); // Récuperer la div : classe
    // Création de l'instance echarts
    myChart = echarts.init(chartDom);

    //recupere reglages si present
    const settings = loadHeatmapSettings();

    // Création de l'option (config de la viz avec les data)
    let option = {
        tooltip: {
            position: 'bottom',
            formatter: (params) => '% de tentative de connexion' + params.value[2].toFixed(2)
        },
        grid: {
            height: '50%',
            top: '10%'
        },
        xAxis: {
            type: 'category',
            data: ["Succès", "Echecs"],
            splitArea: {
                show: true
            }
        },
        yAxis: {
            type: 'category',
            splitArea: {
                show: true
            }
        },
        visualMap: {
            min: 0,
            max: 100,
            range: settings,
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '15%',
            inRange: {color: ['rgb(238, 223, 19)', 'rgb(161, 136, 24)', 'rgb(249, 164, 66)']}
        },
        series: [
            {
                name: 'Attempts',
                type: 'heatmap',
                label: {
                    show: true,
                    formatter: function (params) {
                        return params.value[2].toFixed(2) + '%';
                    }
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(153, 37, 231, 0.5)'
                    }
                }
            }
        ]
    };
    // Mise en place de l'option (dessin de la viz)
    myChart.setOption(option);

    //mise en place ecoute d'evenements
    let TimeoutSettingsSave;
    myChart.on('datarangeselected', (evt)=>{
      if (TimeoutSettingsSave){
        clearTimeout(TimeoutSettingsSave);
      }
      TimeoutSettingsSave = setTimeout(()=>{
        saveHeatmapSettings(evt.selected);
      }, 500);
    });
}


export function update(attempts) {
    console.log("UPDATE");


    // Calcul d'un tableau des num de tentatives uniques, trié
    const numTentatives = Array.from(new Set(attempts.map((attempt) => attempt[2]))).sort();
    // [1, 2, 4]
    // Compte des tentatives par num de tentatives et par succès
    // Dictionnaire num tentatives - compteurs [nbTentativeSuccess, nbTentativeEchec]
    const compteursByNumTentative = {};
    attempts.forEach((attempt) => {
        // Récupérer les compteurs du dico s'ils existent
        let compteurs = compteursByNumTentative[attempt[2]];
        // Si les compteurs n'existent pas, les créer et les placer dans le dico
        if (!compteurs) {
            compteurs = [0, 0];
            compteursByNumTentative[attempt[2]] = compteurs;
        }
        // Mettre à jour le bon compteur
        if (attempt[1]) {
            compteurs[0]++;
        } else {
            compteurs[1]++;
        }
    });
    // Parcourir le dico par entrée (clé, valeur) : Object.entries()
    // Pour chaque entrée créer 2 triplets de valeurs : un pour le succès un pour l'échec et les ajouter
   
    // au tableau de triplet global data
    const data = [];


    Object.entries(compteursByNumTentative).forEach((entry) => {
        const numTent = Number(entry[0]);
        const cptSuccess = entry[1][0] * 100 / attempts.length;
        const cptEchec = entry [1][1] * 100 / attempts.length;
        const idxNumTentatives = numTentatives.indexOf(numTent);
        data.push([0, idxNumTentatives, cptSuccess]);
        data.push([1, idxNumTentatives, cptEchec]);
    });
    console.log(data)


    // Mettre à jour la visualition
    myChart.setOption({
    yAxis: {
        data: numTentatives
    },
    series: [
        {
            name: "Attempts",
            data: data
        }
    ]
    });
}
