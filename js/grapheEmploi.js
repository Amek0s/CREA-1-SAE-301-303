var dom = document.querySelector('.grapheEmploi');
var myChart = echarts.init(dom, null, {
    renderer: 'canvas',
    useDirtyRect: false
});
var app = {};


const option = {

    textStyle: {
        fontFamily: 'Readex Pro',
        fontWeight: '500',
        fontSize: 10
    },
    title: {
        left: 'center',
        textStyle: {
            fontFamily: 'Readex Pro',
            fontSize: 20,
            fontWeight: 'bold',
            color: '#333'
        },
        subtextStyle: {
            fontFamily: 'Readex Pro',
            fontSize: 14,
            fontWeight: 'bold',
            color: '#666'
        }
    },
    tooltip: {
        trigger: 'item',
        textStyle: {
            fontFamily: 'Readex Pro',
            fontSize: 13,
            fontWeight: 'bold'
        }
    },
    legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: {
            fontFamily: 'Readex Pro',
            fontSize: 14,
            fontWeight: 'bold',
            color: '#444'
        }
    },
    series: [
        {
            name: 'Access From',
            type: 'pie',
            radius: '50%',
            label: {
                show: true,
                formatter: '{b}: {c}',
                fontFamily: 'Readex Pro',
                fontSize: 13,
                fontWeight: 'bold',
                color: '#000'
            },
            data: [
                { value: 800, name: 'Emplois cadre', itemStyle: { color: '#F5E11B' } },
                { value: 550, name: 'Emplois stables', itemStyle: { color: '#1BCDF5' } },
                { value: 700, name: 'Emplois à temps plein', itemStyle: { color: '#D60C57' } },
            ],
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }
    ]
};

if (option && typeof option === 'object') {
    myChart.setOption(option);
}

window.addEventListener('resize', myChart.resize);



// Mise en place de l'option (dessin de la viz) c
myChart.setOption(option);
