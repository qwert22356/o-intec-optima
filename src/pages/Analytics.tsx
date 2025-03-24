import React, { useEffect, useRef } from 'react';
import { LineChart as LineChartIcon, AlertTriangle, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import * as d3 from 'd3';
import { MOCK_DATA } from '../lib/utils';

export default function Analytics() {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Clear previous chart
    d3.select(chartRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 30, left: 60 };
    const width = chartRef.current.clientWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Process data
    const allDates = MOCK_DATA.lifePrediction.modules[0].predictions.map(d => new Date(d.date));
    
    const x = d3.scaleTime()
      .domain(d3.extent(allDates))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, 400])
      .range([height, 0]);

    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(6))
      .style("font-size", "12px");

    // Add Y axis
    svg.append("g")
      .call(d3.axisLeft(y).ticks(5))
      .style("font-size", "12px");

    // Add Y axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("剩余寿命 (天)");

    // Create line generator
    const line = d3.line()
      .x(d => x(new Date(d.date)))
      .y(d => y(d.remainingDays))
      .curve(d3.curveMonotoneX);

    // Add lines for each module
    const colors = ['#2563eb', '#16a34a'];
    MOCK_DATA.lifePrediction.modules.forEach((module, i) => {
      svg.append("path")
        .datum(module.predictions)
        .attr("fill", "none")
        .attr("stroke", colors[i])
        .attr("stroke-width", 2)
        .attr("d", line);

      // Add dots
      svg.selectAll(`dot-${i}`)
        .data(module.predictions)
        .enter()
        .append("circle")
        .attr("cx", d => x(new Date(d.date)))
        .attr("cy", d => y(d.remainingDays))
        .attr("r", 4)
        .attr("fill", colors[i]);
    });

    // Add legend
    const legend = svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "start")
      .selectAll("g")
      .data(MOCK_DATA.lifePrediction.modules)
      .enter().append("g")
      .attr("transform", (d, i) => `translate(${width - 100},${i * 20})`);

    legend.append("rect")
      .attr("x", 0)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", (d, i) => colors[i]);

    legend.append("text")
      .attr("x", 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(d => d.id);

  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-100">
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">光模块寿命预测</h2>
            <p className="text-sm text-gray-500">基于历史数据的AI预测分析</p>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-end space-x-4 mb-6">
            <div className="flex items-center space-x-2 text-sm">
              <span className="flex items-center text-green-600">
                <Clock className="w-4 h-4 mr-1" />
                正常
              </span>
              <span className="flex items-center text-yellow-600">
                <AlertTriangle className="w-4 h-4 mr-1" />
                预警
              </span>
              <span className="flex items-center text-red-600">
                <AlertTriangle className="w-4 h-4 mr-1" />
                危险
              </span>
            </div>
          </div>
          
          <div ref={chartRef} className="w-full h-[400px]" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">预警模块</h3>
          </div>
          <div className="p-6 space-y-4">
            {MOCK_DATA.lifePrediction.warningModules.map((module) => (
              <div key={module.id} 
                className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{module.id}</p>
                  <p className="text-sm text-gray-500">预计寿命: {module.prediction}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm ${
                    module.status === 'danger' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    温度: {module.temp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">历史趋势</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-gray-100">
              <p className="text-sm font-medium text-gray-500">平均寿命</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {MOCK_DATA.lifePrediction.statistics.averageLifespan}
              </p>
              <div className="flex items-center mt-1 text-sm text-green-600">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span>较上月 +0.2年</span>
              </div>
            </div>
            <div className="p-4 rounded-lg border border-gray-100">
              <p className="text-sm font-medium text-gray-500">更换率</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">
                {MOCK_DATA.lifePrediction.statistics.replacementRate}
              </p>
              <div className="flex items-center mt-1 text-sm text-green-600">
                <ArrowDownRight className="w-4 h-4 mr-1" />
                <span>较上月 -0.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}