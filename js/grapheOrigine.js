let myChart;

export function initGrapheOrigine() {
    var dom = document.querySelector('.grapheOrigine');
    if (!dom) return;

    myChart = echarts.init(dom, null, {
        renderer: 'canvas',
        useDirtyRect: false
    });

    const option = {
        textStyle: {
            fontFamily: 'Readex Pro',
            fontWeight: 500,
            color: '#2D1A22'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: '#FFFFFF',
            borderColor: '#E6136A',
            textStyle: {
                color: '#2D1A22'
            }
        },
        grid: {
            left: '3%',
            right: '15%',
            bottom: '3%',
            top: '5%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            boundaryGap: [0, 0.01],
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#FFE0E9',
                    type: 'dashed'
                }
            },
            axisLabel: {
                show: false
            }
        },
        yAxis: {
            type: 'category',
            inverse: true,
            data: ['Licence Gen.', 'Licence Pro', 'Master', 'Autres', 'Non Inscrits'],
            axisLabel: {
                color: '#2D1A22',
                fontFamily: 'Readex Pro',
                fontWeight: 'bold',
                fontSize: 12,
                interval: 0,
                width: 110,
                overflow: 'break'
            },
            axisLine: { show: false },
            axisTick: { show: false }
        },
        series: [
            {
                name: 'Admis',
                type: 'bar',
                barWidth: '100%',
                itemStyle: {
                    borderRadius: [0, 4, 4, 0]
                },
                label: {
                    show: true,
                    position: 'right',
                    color: '#E6136A',
                    fontFamily: 'Paytone One',
                    fontSize: 14,
                    formatter: '{c}'
                },
                data: [
                    { value: 0, itemStyle: { color: '#E6136A' } },
                    { value: 0, itemStyle: { color: '#1BCDF5' } },
                    { value: 0, itemStyle: { color: '#F5E11B' } },
                    { value: 0, itemStyle: { color: '#0F172A' } },
                    { value: 0, itemStyle: { color: '#A0AEC0' } }
                ]
            }
        ]
    };

    myChart.setOption(option);
    window.addEventListener('resize', myChart.resize);
}

export function updateGrapheOrigine(data) {
    if (!myChart || !data) return;

    const newData = [
        { value: data.origine_lg3 || 0, itemStyle: { color: '#E6136A' } },
        { value: data.origine_lp3 || 0, itemStyle: { color: '#1BCDF5' } },
        { value: data.origine_master || 0, itemStyle: { color: '#F5E11B' } },
        { value: data.origine_autre || 0, itemStyle: { color: '#0F172A' } },
        { value: data.origine_non_inscrit || 0, itemStyle: { color: '#A0AEC0' } }
    ];

    myChart.setOption({
        series: [{
            data: newData
        }]
    });
}