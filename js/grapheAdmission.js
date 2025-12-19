let myChart = null;
let intervalId = null;
let currentOptionType = 'pie';
let currentData = [
    { value: 0, name: 'Boursiers' },
    { value: 100, name: 'Non Boursiers' }
];

//Graphe Echarts amélioré

const palette = ['#E6136A', '#1BCDF5'];

const legendStyle = {
    orient: 'horizontal',
    bottom: '0',
    left: 'center',
    icon: 'circle',
    itemWidth: 10,
    itemHeight: 10,
    textStyle: {
        fontFamily: 'Readex Pro',
        fontSize: 12,
        color: '#2D1A22'
    }
};

function parliamentLayout(startAngle, endAngle, totalAngle, r0, r1, size) {
    let rowsCount = Math.ceil((r1 - r0) / size);
    let points = [];
    let r = r0;
    for (let i = 0; i < rowsCount; i++) {
        let totalRingSeatsNumber = Math.round((totalAngle * r) / size);
        let newSize = (totalAngle * r) / totalRingSeatsNumber;
        for (
            let k = Math.floor((startAngle * r) / newSize) * newSize;
            k < Math.floor((endAngle * r) / newSize) * newSize - 1e-6;
            k += newSize
        ) {
            let angle = k / r;
            let x = Math.cos(angle) * r;
            let y = Math.sin(angle) * r;
            points.push([x, y]);
        }
        r += size;
    }
    return points;
}

export function initGrapheAdmission() {
    var dom = document.querySelector('.grapheAdmission');
    if (!dom) return;

    myChart = echarts.init(dom, null, {
        renderer: 'canvas',
        useDirtyRect: false
    });

    window.addEventListener('resize', myChart.resize);
}

export function updateGrapheAdmission(dataStats) {
    if (!myChart || !dataStats) return;

    let tauxBoursiers = dataStats.taux_boursiers || 0;
    if (tauxBoursiers > 100) tauxBoursiers = 100;

    const tauxNonBoursiers = 100 - tauxBoursiers;

    currentData = [
        { value: tauxBoursiers, name: 'Boursiers' },
        { value: tauxNonBoursiers, name: 'Non Boursiers' }
    ];

    if (intervalId) clearInterval(intervalId);

    const radius = ['30%', '80%'];

    const pieOption = {
        color: palette,
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}%'
        },
        legend: legendStyle,
        series: [{
            type: 'pie',
            id: 'distribution',
            radius: radius,
            center: ['50%', '45%'],
            label: { show: false },
            universalTransition: true,
            animationDurationUpdate: 1000,
            data: currentData
        }
        ]
    };

    const getParliamentOption = (data) => {
        let sum = data.reduce(function (sum, cur) {
            return sum + cur.value;
        }, 0);

        let angles = [];
        let startAngle = -Math.PI / 2;
        let curAngle = startAngle;

        data.forEach(function (item) {
            angles.push(curAngle);
            curAngle += (item.value / sum) * Math.PI * 2;
        });
        angles.push(startAngle + Math.PI * 2);

        return {
            color: palette,
            tooltip: {
                trigger: 'item',
                formatter: '{b}: {c}%'
            },
            legend: legendStyle,
            series: {
                type: 'custom',
                id: 'distribution',
                data: data,
                coordinateSystem: undefined,
                universalTransition: true,
                animationDurationUpdate: 1000,
                renderItem: function (params, api) {
                    var idx = params.dataIndex;
                    var viewSize = Math.min(api.getWidth(), api.getHeight());
                    var r0 = ((parseFloat(radius[0]) / 100) * viewSize) / 2;
                    var r1 = ((parseFloat(radius[1]) / 100) * viewSize) / 2;

                    var cx = api.getWidth() * 0.5;
                    var cy = api.getHeight() * 0.45;

                    var size = viewSize / 50;

                    var points = parliamentLayout(
                        angles[idx],
                        angles[idx + 1],
                        Math.PI * 2,
                        r0,
                        r1,
                        size + 3
                    );

                    return {
                        type: 'group',
                        children: points.map(function (pt) {
                            return {
                                type: 'circle',
                                autoBatch: true,
                                shape: {
                                    cx: cx + pt[0],
                                    cy: cy + pt[1],
                                    r: size / 2
                                },
                                style: {
                                    fill: palette[idx % palette.length]
                                }
                            };
                        })
                    };
                }
            }
        };
    };

    myChart.setOption(pieOption);
    currentOptionType = 'pie';

    // Lancement de l'animation infinie
    intervalId = setInterval(function () {
        if (currentOptionType === 'pie') {
            myChart.setOption(getParliamentOption(currentData));
            currentOptionType = 'parliament';
        } else {
            myChart.setOption(pieOption);
            currentOptionType = 'pie';
        }
    }, 4000);
}