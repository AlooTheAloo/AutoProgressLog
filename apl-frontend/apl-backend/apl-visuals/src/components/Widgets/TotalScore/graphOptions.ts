import { ApexOptions } from "apexcharts";
import { abbreviateNumber } from "js-abbreviation-number";
import { ReportData } from "../../../types/report-data";

function range(start:number, end:number, step = 1) {
    const len = Math.floor((end - start) / step) + 1
    return Array(len).fill(0).map((_, idx) => start + (idx * step))
}

export const chartOptions = (data:ReportData) => { 
    const ApexOptions:ApexOptions = {
    fill: {
    type: "gradient",
        gradient: {
            type: "diagonal2",
            shade: 'dark',
            colorStops: [
                {
                    offset: 0,
                    color: '#FF0000',
                    opacity: 1,
                },
                {
                    offset: 100,
                    color: '#5500FF',
                    opacity: 1,
                },
            ]
        }
    },
    chart: {
        height: "5px",
        animations: {
            enabled: false,
        },
        id: 'apex-chart',
        type: 'area',
        toolbar: {
            show: false,
        },
        zoom: {
            enabled: false,
        },
    },
    
    dataLabels: {
        enabled: false,
    },
    stroke: {
        width: 1,
        colors: ['#FFFFFF'],
        curve: "monotoneCubic",
    },
    grid: {
        borderColor: '#00000000',
        strokeDashArray: 10,
    },
    xaxis: {
        categories: range(data.reportNo - data.lastDaysPoints.length + 1, data.reportNo),
        labels: {
            rotate: 0,
            rotateAlways: false,
            style: {
                fontSize: '15px',
                colors: '#ffffff',
            },

        },
        axisBorder: {
            show: false,
        },
        axisTicks: {
            show: false,
        },
    },
    yaxis: {
        labels: {
            
            style: {
                fontSize: '13px',
                colors: ['#fff'],
            },
            formatter: function(value) {
                return abbreviateNumber(value as any as number, 1);
            },
        },
        axisBorder: {
            show: false,
        },
        axisTicks: {
            show: false,
        },
    },
    tooltip: {
        enabled: false,
    },
    markers: {
        size: 3,
        colors: '#FFFFFF',
    },

}
    return ApexOptions;

};