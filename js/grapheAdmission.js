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
            data: ['Admission', 'Insertion', 'Emploi'],
            axisLabel: {
                fontFamily: 'Readex Pro',
                fontWeight: 500,
                fontSize: 12,
                color: '#2D1A22'
            },
            axisLine: {
                lineStyle: { color: '#66585E' }
            },
            axisTick: { show: false }
        },
        yAxis: {
            type: 'value',
            max: 100, // Pourcentage donc max 100
            axisLabel: {
                fontFamily: 'Readex Pro',
                fontSize: 12,
                color: '#66585E',
                formatter: '{value}%'
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
                barWidth: '40%',
                data: [
                    { value: 0, itemStyle: { color: '#1BCDF5', borderRadius: [5, 5, 0, 0] } },
                    { value: 0, itemStyle: { color: '#F5E11B', borderRadius: [5, 5, 0, 0] } },
                    { value: 0, itemStyle: { color: '#E6136A', borderRadius: [5, 5, 0, 0] } }
                ],
                label: {
                    show: true,
                    fontFamily: 'Readex Pro',
                    fontWeight: 'bold',
                    fontSize: 14,
                    color: '#2D1A22',
                    position: 'top',
                    formatter: '{c}%'
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

    const newData = [
        { value: data.pct_accept_master || 0, itemStyle: { color: '#1BCDF5', borderRadius: [5, 5, 0, 0] } },
        { value: data.taux_insert_18m|| 0, itemStyle: { color: '#F5E11B', borderRadius: [5, 5, 0, 0] } },
        { value: data.taux_emploi_18m || 0, itemStyle: { color: '#E6136A', borderRadius: [5, 5, 0, 0] } }
    ];

    myChart.setOption({
        series: [{
            data: newData
        }]
    });
}