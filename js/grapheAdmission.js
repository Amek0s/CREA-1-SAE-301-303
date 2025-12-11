let myChart;

export function initGrapheAdmission() {
    var dom = document.querySelector('.grapheAdmission');
    if (!dom) return;

    myChart = echarts.init(dom, null, {
        renderer: 'canvas',
        useDirtyRect: false
    });

    const option = {
        textStyle: {
            fontFamily: 'Readex Pro',
            fontWeight: 700,
            fontSize: 10
        },
        xAxis: {
            type: 'category',
            // Utilisation de labels lisibles pour les catégories
            data: ['Taux admission', 'Taux insertion', 'Taux emploi'],
            axisLabel: {
                fontFamily: 'Readex Pro',
                fontWeight: 700,
                fontSize: 10,
                color: '#000'
            },
            axisLine: {
                lineStyle: {
                    color: '#000',
                    width: 1
                }
            },
            axisTick: {
                lineStyle: {
                    color: '#BA396B',
                    width: 1
                }
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                fontFamily: 'Readex Pro',
                fontWeight: 700,
                fontSize: 10,
                color: '#000'
            },
            axisLine: {
                lineStyle: {
                    color: '#000',
                    width: 1
                }
            },
            splitLine: {
                lineStyle: {
                    color: '#BA396B',
                    width: 1,
                    type: 'solid'
                }
            },
            axisTick: {
                lineStyle: {
                    color: '#BA396B',
                    width: 1
                }
            }
        },
        series: [
            {
                type: 'bar',
                // Données initiales
                data: [
                    { value: 0, itemStyle: { color: '#1BCDF5' } },
                    { value: 0, itemStyle: { color: '#F5E11B' } },
                    { value: 0, itemStyle: { color: '#D60C57' } }
                ],
                label: {
                    show: true,
                    fontFamily: 'Readex Pro',
                    fontWeight: 700,
                    fontSize: 10,
                    color: '#000',
                    position: 'top',
                    formatter: '{c}%' // Ajout de l'unité
                }
            }
        ]
    };

    if (option && typeof option === 'object') {
        myChart.setOption(option);
    }

    window.addEventListener('resize', myChart.resize);
}

export function updateGrapheAdmission(data) {
    if (!myChart || !data) return;

    // Mise à jour des données en utilisant les champs réels de l'API Mon Master
    const newData = [
        // Taux d'acceptation du master (en pourcentage)
        { value: data.pct_accept_master || 0, itemStyle: { color: '#1BCDF5' } },
        // Taux d'insertion professionnelle à 18 mois
        { value: data.taux_insert_18m|| 0, itemStyle: { color: '#F5E11B' } },
        // Taux d'emploi à 18 mois
        { value: data.taux_emploi_18m || 0, itemStyle: { color: '#D60C57' } }
    ];

    myChart.setOption({
        series: [{
            data: newData
        }]
    });
}