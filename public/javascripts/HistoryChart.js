/**
 * https://www.chartjs.org/docs/latest/
 */

var lineConfig = {
    type: 'line',
    data: {
        labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
        datasets: []
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2,
        title: {
            display: true,
            text: 'Expenses by month',
            fontColor: '#666'
        },
        tooltips: {
            mode: 'index',
            intersect: false,
        },
        hover: {
            mode: 'nearest',
            intersect: true
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: false,
                    labelString: 'Month'

                },
                ticks: {
                    beginAtZero: true,
                    fontColor: '#666'
                },
                gridLines: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            }],
            yAxes: [{
                stacked: false,
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'MONEY SPENT IN €'
                },
                ticks: {
                    beginAtZero: true,
                    stepSize: 50,
                    fontColor: '#666'
                },
                gridLines: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            }]
        },
        legend: {
            labels: {
                fontColor: '#666'
            }
        }
    }
};

console.log(lineConfig);

var randomScalingFactor = function() {
    return Math.round(Math.random() * 100);
};

var doughnutConfig = {
    type: 'doughnut',
    data: {
        datasets: [{
            backgroundColor: [],
            label: 'Expenses by category',
            borderColor: "#ffffff"
        }],
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: ($(window).width() < 960 ? 1 : 2),
        legend: {
            labels: {
                fontColor: '#666'
            }
        }
    }
};

function loadGraphs(categoryData) {
    doughnutConfig.data.datasets[0].backgroundColor = extractColors(categoryData);
    //console.log(categoryData);
    if (categoryData != null) {
        doughnutConfig.data.datasets[0].data = extractValues(categoryData);
        doughnutConfig.data.labels = extractNames(categoryData);
    }

    lineConfig.options.aspectRatio = ($(window).width() < 960 ? 1 : 2);

    if (!darkMode.isSet) {
        doughnutConfig.data.datasets[0].borderColor = "#ffffff";
        doughnutConfig.options.legend.labels.fontColor = "#666";
    } else {
        doughnutConfig.data.datasets[0].borderColor = "#2b2b2b";
        doughnutConfig.options.legend.labels.fontColor = "#ffffff";
    }

    var ctx = document.getElementById('doughnut-canvas').getContext('2d');
    window.myPie = new Chart(ctx, doughnutConfig);
}

function loadGraphs2(categoryData) {
    let keys = Array.from(categoryData.keys());
    for (let key of keys) {
        var json = {
            label: key,
            backgroundColor: categoryData.get(key).color,
            borderColor: categoryData.get(key).color,
            data: generateDataset(categoryData.get(key)),
            fill: false,
        }

        lineConfig.data.datasets.push(json);
    }


    lineConfig.options.aspectRatio = ($(window).width() < 960 ? 1 : 2);

    if (!darkMode.isSet) {
        lineConfig.options.legend.labels.fontColor = "#666";
        lineConfig.options.title.fontColor = "#666";
        lineConfig.options.scales.xAxes[0].ticks.fontColor = "#666";
        lineConfig.options.scales.yAxes[0].ticks.fontColor = "#666";
        lineConfig.options.scales.xAxes[0].gridLines.color = "rgba(0, 0, 0, 0.1)";
        lineConfig.options.scales.yAxes[0].gridLines.color = "rgba(0, 0, 0, 0.1)";
    } else {
        lineConfig.options.legend.labels.fontColor = "#ffffff";
        lineConfig.options.title.fontColor = "#ffffff";
        lineConfig.options.scales.xAxes[0].ticks.fontColor = "#ffffff";
        lineConfig.options.scales.yAxes[0].ticks.fontColor = "#ffffff";
        lineConfig.options.scales.xAxes[0].gridLines.color = "#999999";
        lineConfig.options.scales.yAxes[0].gridLines.color = "#999999";
    }

    var ctx = document.getElementById('line-canvas').getContext('2d');
    window.myLine = new Chart(ctx, lineConfig);


}

function getBackgroundColors(length) {
    var colors = [];

    var current1 = 255;
    var current2 = 200;
    var current3 = 200;
    for (var i = 0; i < length; i++) {
        colors.push("rgb(" + current1 + ", " + current2 + "," + current3 + ")");

        if (current1 < 100) {
            if (current2 < 100) {
                if (current3 < 100) {
                    current1 = 255;
                    current2 = 200;
                    current3 = 200;
                } else {
                    current3 -= 100;
                }
            } else {
                current2 -= 100;
            }
        } else {
            current1 -= 100;
        }
    }

    return colors;
}

function extractNames(data) {
    const names = [];
    for (let entry of data) {
        names.push(entry.name);
    }
    return names;
}

function extractValues(data) {
    const values = [];
    for (let entry of data) {
        values.push(entry.sum);
    }
    return values;
}

function extractColors(data) {
    const colors = [];
    for (let entry of data) {
        colors.push(entry.color);
    }
    return colors;
}

function generateDataset(category) {
    const arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let keys = Array.from(category.keys());
    for (let i of keys) {
        arr[monthToNumber(i) - 1] = category.get(i).sum;
        //console.log(category.get(i).sum);
    }
    return arr;
}

function monthToNumber(month) {
    switch (month) {
        case 'JAN':
            return 1;
        case 'FEB':
            return 2;
        case 'MAR':
            return 3;
        case 'APR':
            return 4;
        case 'MAY':
            return 5;
        case 'JUN':
            return 6;
        case 'JUL':
            return 7;
        case 'AUG':
            return 8;
        case 'SEP':
            return 9;
        case 'OCT':
            return 10;
        case 'NOV':
            return 11;
        case 'DEC':
            return 12;
    }
}