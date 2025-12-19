let myChart;

export function initGrapheInsertion() {
    var dom = document.querySelector('.grapheInsertion');
    if (!dom) return;

    myChart = echarts.init(dom, null, {
        renderer: 'canvas',
        useDirtyRect: false
    });

    const option = {
        tooltip: {
            formatter: '{b} : {c}%',
            backgroundColor: '#FFFFFF',
            borderColor: '#E6136A',
            textStyle: {
                color: '#2D1A22',
                fontFamily: 'Readex Pro'
            }
        },
        series: [
            {
                name: 'Taux d\'admission',
                type: 'gauge',
                startAngle: 180, 
                endAngle: 0,
                min: 0,
                max: 100,
                radius: '110%', 
                center: ['50%', '75%'], 
                
                itemStyle: {
                    color: '#E6136A', 
                    shadowColor: 'rgba(230, 19, 106, 0.3)',
                    shadowBlur: 10
                },
                progress: {
                    show: true,
                    roundCap: true, 
                    width: 40       
                },
                
                pointer: { show: false },
                
                axisLine: {
                    roundCap: true,
                    lineStyle: {
                        width: 40,
                        color: [[1, '#FFE0E9']] 
                    }
                },
                
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { show: false },
                
                title: {
                    show: true,
                    offsetCenter: [0, '35%'], 
                    fontSize: 20,
                    fontFamily: 'Readex Pro',
                    fontWeight: 'bold',
                    color: '#66585E' 
                },

                detail: {
                    valueAnimation: true,
                    formatter: '{value}%',
                    offsetCenter: [0, '-10%'], 
                    fontSize: 60,
                    fontFamily: 'Paytone One', 
                    color: '#2D1A22' 
                },
                
                data: [
                    { value: 0, name: 'TAUX D\'ADMISSION' }
                ]
            }
        ]
    };

    myChart.setOption(option);
    window.addEventListener('resize', myChart.resize);
}

export function updateGrapheInsertion(taux) {
    if (!myChart) return;
    
    let valeur = 0;
    let couleur = '#E0E0E0'; // Gris par défaut (si N/A)
    let formatTexte = 'N/A';
    let couleurTexte = '#A0AEC0'; // Gris pour le texte N/A

    // Si on a une vraie valeur (y compris 0)
    if (taux !== null && taux !== undefined) {
        valeur = Math.round(taux);
        couleur = '#E6136A'; // Rose si donnée présente
        formatTexte = '{value}%';
        couleurTexte = '#2D1A22';
    }

    myChart.setOption({
        series: [{
            itemStyle: {
                color: couleur
            },
            detail: {
                formatter: formatTexte,
                color: couleurTexte
            },
            data: [{
                value: valeur,
                name: 'TAUX D\'ADMISSION'
            }]
        }]
    });
}