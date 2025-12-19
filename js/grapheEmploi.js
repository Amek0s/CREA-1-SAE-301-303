let myChart;

export function initGrapheEmploi() {
    var dom = document.querySelector('.grapheEmploi');
    if (!dom) return;

    myChart = echarts.init(dom, null, {
        renderer: 'canvas',
        useDirtyRect: false
    });

    const option = {
        // Titre discret ou absent car déjà géré dans le HTML
        tooltip: {
            trigger: 'item',
            // On personnalise l'infobulle pour qu'elle soit claire
            formatter: function (params) {
                return `
                <div style="font-family:'Readex Pro'; color:#2D1A22;">
                    <b>Profil de l'emploi :</b><br/>
                    Cadres : ${params.value[0]}%<br/>
                    Stable : ${params.value[1]}%<br/>
                    Temps plein : ${params.value[2]}%
                </div>`;
            }
        },
        radar: {
            // indicateur = les 3 axes du radar
            indicator: [
                { name: 'Cadres', max: 100 },
                { name: 'Emploi Stable', max: 100 },
                { name: 'Temps Plein', max: 100 }
            ],
            axisName: {
                color: '#2D1A22',
                fontFamily: 'Paytone One', 
                fontSize: 14,
                fontWeight: 'bold',
                padding: [3, 5]
            },
            // Forme du fond
            shape: 'circle',
            splitNumber: 4,
            splitArea: {
                show: true, 
                areaStyle: {
                    color: ['#FFFFFF', '#e6136b18'],
                    shadowColor: 'rgba(0, 0, 0, 0.1)',
                    shadowBlur: 10 
                }
            },
            splitLine: {
                lineStyle: {
                    color: '#E0E0E0'
                }
            }
        },
        series: [
            {
                name: 'Qualité de l\'emploi',
                type: 'radar',
                data: [
                    {
                        value: [0, 0, 0],
                        name: 'Moyenne'
                    }
                ],
                lineStyle: {
                    width: 3,
                    color: '#E6136A'
                },
                areaStyle: {
                    color: 'rgba(230, 19, 106, 0.2)'
                },
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: {
                    color: '#E6136A'
                }
            }
        ]
    };

    myChart.setOption(option);
    window.addEventListener('resize', myChart.resize);
}

export function updateGrapheEmploi(data) {
    if (!myChart || !data) return;


    const cadre = data.nb_cadres || "N/A";
    const stable = data.nb_stable || "N/A";
    const tempsPlein = data.nb_temps_plein || "N/A";

    myChart.setOption({
        series: [{
            data: [
                {
                    value: [cadre, stable, tempsPlein],
                    name: 'Statistiques Emploi'
                }
            ]
        }]
    });
}