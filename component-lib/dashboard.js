/* eslint-disable react/prop-types */
import dynamic from 'next/dynamic';
import React from 'react';
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
});

export const LocalComponents = () => {
  return <>LocalComponents</>;
};

export class Statistics1 extends React.Component {
  constructor(props) {
    super(props);
    
    const { data, category } = this.props;

    this.state = {
      series: [
        {
          name: 'Total Sales',
          data,
        },
      ],
      options: {
        chart: {
          type: 'bar',
          height: 280,
        },
        grid: {
          borderColor: '#f2f6f7',
          show: true,
        },
        colors: ['var(--primary-bg-color)' || '#38cab3', '#e4e7ed'],
        plotOptions: {
          bar: {
            borderradius: '5px',
            colors: {
              ranges: [
                {
                  from: -100,
                  to: -46,
                  color: '#ebeff5',
                },
                {
                  from: -45,
                  to: 0,
                  color: '#ebeff5',
                },
              ],
            },
            columnWidth: '40%',
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,
          width: 4,
          colors: ['transparent'],
        },
        legend: {
          show: true,
          position: 'top',
        },
        xaxis: {
          type: 'month',
          categories: category,
          axisBorder: {
            show: true,
            color: 'rgba(119, 119, 142, 0.05)',
            offsetX: 0,
            offsetY: 0,
          },
          axisTicks: {
            show: true,
            borderType: 'solid',
            color: 'rgba(119, 119, 142, 0.05)',
            width: 6,
            offsetX: 0,
            offsetY: 0,
          },
          labels: {
            rotate: -90,
          },
        },
        yaxis: {
          title: {
            text: 'Growth',
            style: {
              color: '#adb5be',
              fontSize: '14px',
              fontFamily: 'poppins, sans-serif',
              fontWeight: 600,
              cssClass: 'apexcharts-yaxis-label',
            },
          },
          labels: {
            formatter: function (y) {
              return y.toFixed(0) + '';
            },
          },
        },
        fill: {
          opacity: 1,
        },
      },
    };
  }

  render() {
    return (
      <div id="chart">
        <ReactApexChart
          options={this.state.options}
          series={this.state.series}
          type="bar"
          height={280}
        />
      </div>
    );
  }
}

export default LocalComponents;
