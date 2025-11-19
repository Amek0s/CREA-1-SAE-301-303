/* var dom = document.querySelector('.grapheAdmission');
var myChart = echarts.init(dom, null, {
    renderer: 'canvas',
    useDirtyRect: false
});
var app = {};


const option = {
  textStyle: {
    fontFamily: 'Readex Pro',
    fontWeight: 700,
    fontSize: 10
  },
  xAxis: {
    type: 'category',
    data: ['admission', 'insertion', 'emploi'],
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
      data: [
        { value: 1500, itemStyle: { color: '#1BCDF5' } },  // salaire brut annuel
        { value: 1000, itemStyle: { color: '#F5E11B' } },  // salaire médian
        { value: 2000, itemStyle: { color: '#D60C57' } }   // salaire net mensuel
      ],
      label: {
        show: true,
        fontFamily: 'Readex Pro',
        fontWeight: 700,
        fontSize: 10,
        color: '#000',
        position: 'top'
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
*/
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
            data: ['admission', 'insertion', 'emploi'],
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
                    position: 'top'
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

    // Mise à jour des données en gardant VOS couleurs
    const newData = [
        { value: data.taux_admission || 1500, itemStyle: { color: '#1BCDF5' } },
        { value: data.taux_insertion || 1000, itemStyle: { color: '#F5E11B' } },
        { value: data.taux_emploi || 2000, itemStyle: { color: '#D60C57' } }
    ];

    myChart.setOption({
        series: [{
            data: newData
        }]
    });
}