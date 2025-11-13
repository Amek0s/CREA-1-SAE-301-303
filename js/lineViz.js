let myChart;


export function create() {
    // Reçu de l'élément DOM
    let chartDom = document.querySelector('#attempts > .viz'); // Récuperer la div :lasse
    // Création de l'instance echarts
    myChart = echarts.init(chartDom);

    const 
}


 // Mise en place de l'option (dessin de la viz) c
    myChart.setOption(option);


export function update(attempts){
        //mise a jour des options
}