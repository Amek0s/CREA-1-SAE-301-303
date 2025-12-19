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
            fontSize: 14 
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
            // On ne garde que 2 catégories
            data: ['Brut Annuel', 'Net Annuel'],
            axisLabel: {
                fontFamily: 'Readex Pro',
                fontWeight: 500,
                fontSize: 12,
                color: '#2D1A22',
                interval: 0 
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
                    color: '#FFE0E9',
                    type: 'dashed'
                }
            }
        },
        series: [
            {
                type: 'bar',
                barWidth: '50%', // Barres un peu plus larges vu qu'il n'y en a que 2
                data: [
                    { value: 0, itemStyle: { color: '#1BCDF5', borderRadius: [5, 5, 0, 0] } }, // Bleu pour le Brut
                    { value: 0, itemStyle: { color: '#E6136A', borderRadius: [5, 5, 0, 0] } }  // Rose pour le Net
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
        { value: data.salaire_net || 0, itemStyle: { color: '#E6136A', borderRadius: [5, 5, 0, 0] } }
    ];

    myChart.setOption({
        series: [{
            data: newData
        }]
    });
}