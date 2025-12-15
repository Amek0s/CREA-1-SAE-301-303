let myChart;

export function initGrapheSalaire() {
    var dom = document.querySelector('.grapheSalaire');
    if (!dom) return;
    
    myChart = echarts.init(dom, null, {
        renderer: 'canvas',
        useDirtyRect: false
    });

    const option = {
        textStyle: {
            fontFamily: 'Readex Pro',
            fontWeight: 500,
            fontSize: 14 // Augmenté pour l'accessibilité
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['Brut Annuel', 'Médian Annuel', 'Net Annuel'], // Labels raccourcis pour mobile
            axisLabel: {
                fontFamily: 'Readex Pro',
                fontWeight: 500,
                fontSize: 12, // Augmenté
                color: '#2D1A22',
                interval: 0 // Force l'affichage de tous les labels
            },
            axisLine: {
                lineStyle: { color: '#66585E' }
            },
            axisTick: { show: false }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                fontFamily: 'Readex Pro',
                fontSize: 12,
                color: '#66585E'
            },
            splitLine: {
                lineStyle: {
                    color: '#FFE0E9', // Ligne grille plus douce
                    type: 'dashed'
                }
            }
        },
        series: [
            {
                type: 'bar',
                barWidth: '40%',
                data: [
                    { value: 0, itemStyle: { color: '#1BCDF5', borderRadius: [5, 5, 0, 0] } },
                    { value: 0, itemStyle: { color: '#F5E11B', borderRadius: [5, 5, 0, 0] } },
                    { value: 0, itemStyle: { color: '#E6136A', borderRadius: [5, 5, 0, 0] } } // Couleur principale au lieu de D60C57
                ],
                label: {
                    show: true,
                    position: 'top',
                    fontFamily: 'Readex Pro',
                    fontWeight: 'bold',
                    fontSize: 14,
                    color: '#2D1A22',
                    formatter: '{c} €'
                }
            }
        ]
    };

    if (option && typeof option === 'object') {
        myChart.setOption(option);
    }

    window.addEventListener('resize', myChart.resize);
}

export function updateGrapheSalaire(data) {
    if (!myChart || !data) return;

    const newData = [
        { value: data.salaire_brut || 0, itemStyle: { color: '#1BCDF5', borderRadius: [5, 5, 0, 0] } },
        { value: data.salaire_median || 0, itemStyle: { color: '#F5E11B', borderRadius: [5, 5, 0, 0] } },
        { value: data.salaire_net || 0, itemStyle: { color: '#E6136A', borderRadius: [5, 5, 0, 0] } }
    ];

    myChart.setOption({
        series: [{
            data: newData
        }]
    });
}