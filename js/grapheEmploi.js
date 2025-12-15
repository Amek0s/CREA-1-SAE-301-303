let myChart;

export function initGrapheEmploi() {
    var dom = document.querySelector('.grapheEmploi');
    if (!dom) return;

    myChart = echarts.init(dom, null, {
        renderer: 'canvas',
        useDirtyRect: false
    });

    const option = {
        textStyle: {
            fontFamily: 'Readex Pro',
            fontWeight: '500',
            fontSize: 14
        },
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)' // Ajout du pourcentage au survol
        },
        legend: {
            orient: 'horizontal',
            bottom: '0',
            left: 'center',
            textStyle: {
                fontFamily: 'Readex Pro',
                fontSize: 12,
                color: '#2D1A22'
            },
            itemWidth: 12,
            itemHeight: 12
        },
        series: [
            {
                name: 'Type d\'emploi',
                type: 'pie',
                radius: ['40%', '70%'], // Donut chart pour un look plus moderne
                center: ['50%', '45%'],
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 5,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false, // On masque les labels sur le graphe pour éviter le chevauchement
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 16,
                        fontWeight: 'bold'
                    },
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.1)'
                    }
                },
                data: [
                    { value: 0, name: 'Cadres', itemStyle: { color: '#F5E11B' } },
                    { value: 0, name: 'Stables', itemStyle: { color: '#1BCDF5' } },
                    { value: 0, name: 'Temps plein', itemStyle: { color: '#E6136A' } },
                ]
            }
        ]
    };

    if (option && typeof option === 'object') {
        myChart.setOption(option);
    }

    window.addEventListener('resize', myChart.resize);
}

export function updateGrapheEmploi(data) {
    if (!myChart || !data) return;

    const newData = [
        { value: data.nb_cadres || 0, name: 'Cadres', itemStyle: { color: '#F5E11B' } },
        { value: data.nb_stable || 0, name: 'Stables', itemStyle: { color: '#1BCDF5' } },
        { value: data.nb_temps_plein || 0, name: 'Temps plein', itemStyle: { color: '#E6136A' } },
    ];

    myChart.setOption({
        series: [{
            data: newData
        }]
    });
}