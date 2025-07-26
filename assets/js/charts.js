class ChartManager {
    constructor() {
        this.charts = {};
        this.colors = {
            cpu: '#3b82f6',
            memory: '#10b981',
            disk: '#f59e0b',
            network: '#8b5cf6'
        };
        
        this.gradients = {};
        this.performanceChart = null;
    }

    init() {
        this.createMetricCharts();
        this.createPerformanceChart();
    }

    createMetricCharts() {
        const metrics = ['cpu', 'memory', 'disk', 'network'];
        
        metrics.forEach(metric => {
            const canvas = document.getElementById(`${metric}Chart`);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                
                // Create gradient
                const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                gradient.addColorStop(0, this.colors[metric] + '40');
                gradient.addColorStop(1, this.colors[metric] + '00');
                this.gradients[metric] = gradient;
                
                this.charts[metric] = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [{
                            data: [],
                            borderColor: this.colors[metric],
                            backgroundColor: gradient,
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 0,
                            pointHoverRadius: 4,
                            pointBackgroundColor: this.colors[metric],
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                enabled: false
                            }
                        },
                        scales: {
                            x: {
                                display: false
                            },
                            y: {
                                display: false,
                                min: 0,
                                max: metric === 'network' ? 100 : 100
                            }
                        },
                        elements: {
                            point: {
                                radius: 0
                            }
                        },
                        interaction: {
                            intersect: false
                        }
                    }
                });
            }
        });
    }

    createPerformanceChart() {
        const canvas = document.getElementById('performanceChart');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            
            // Create gradients for each metric
            const cpuGradient = ctx.createLinearGradient(0, 0, 0, 400);
            cpuGradient.addColorStop(0, '#3b82f620');
            cpuGradient.addColorStop(1, '#3b82f600');
            
            const memoryGradient = ctx.createLinearGradient(0, 0, 0, 400);
            memoryGradient.addColorStop(0, '#10b98120');
            memoryGradient.addColorStop(1, '#10b98100');
            
            const diskGradient = ctx.createLinearGradient(0, 0, 0, 400);
            diskGradient.addColorStop(0, '#f59e0b20');
            diskGradient.addColorStop(1, '#f59e0b00');
            
            this.performanceChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'CPU',
                            data: [],
                            borderColor: '#3b82f6',
                            backgroundColor: cpuGradient,
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4
                        },
                        {
                            label: 'Memory',
                            data: [],
                            borderColor: '#10b981',
                            backgroundColor: memoryGradient,
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4
                        },
                        {
                            label: 'Disk',
                            data: [],
                            borderColor: '#f59e0b',
                            backgroundColor: diskGradient,
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                color: '#e2e8f0',
                                usePointStyle: true,
                                padding: 20
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: 'rgba(30, 41, 59, 0.9)',
                            titleColor: '#f8fafc',
                            bodyColor: '#e2e8f0',
                            borderColor: 'rgba(59, 130, 246, 0.2)',
                            borderWidth: 1,
                            cornerRadius: 8,
                            displayColors: true
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(59, 130, 246, 0.1)',
                                borderColor: 'rgba(59, 130, 246, 0.2)'
                            },
                            ticks: {
                                color: '#94a3b8',
                                maxTicksLimit: 8
                            }
                        },
                        y: {
                            min: 0,
                            max: 100,
                            grid: {
                                color: 'rgba(59, 130, 246, 0.1)',
                                borderColor: 'rgba(59, 130, 246, 0.2)'
                            },
                            ticks: {
                                color: '#94a3b8',
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    },
                    elements: {
                        point: {
                            radius: 3,
                            hoverRadius: 6,
                            borderWidth: 2,
                            hoverBorderWidth: 3
                        }
                    }
                }
            });
        }
    }

    updateMetricChart(metric, history) {
        const chart = this.charts[metric];
        if (!chart) return;
        
        const labels = history.map(item => 
            item.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            })
        );
        const data = history.map(item => item.value);
        
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.update('none');
    }

    updatePerformanceChart(metrics) {
        if (!this.performanceChart) return;
        
        // Get the latest history from all metrics
        const maxLength = Math.max(
            metrics.cpu.history.length,
            metrics.memory.history.length,
            metrics.disk.history.length
        );
        
        if (maxLength === 0) return;
        
        // Use CPU history for labels (assuming all metrics have similar timestamps)
        const labels = metrics.cpu.history.slice(-20).map(item => 
            item.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        );
        
        this.performanceChart.data.labels = labels;
        this.performanceChart.data.datasets[0].data = metrics.cpu.history.slice(-20).map(item => item.value);
        this.performanceChart.data.datasets[1].data = metrics.memory.history.slice(-20).map(item => item.value);
        this.performanceChart.data.datasets[2].data = metrics.disk.history.slice(-20).map(item => item.value);
        
        this.performanceChart.update('none');
    }

    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        
        if (this.performanceChart) {
            this.performanceChart.destroy();
        }
    }
}

// Export for use in other modules
window.ChartManager = ChartManager;