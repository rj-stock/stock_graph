import * as echarts from "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.esm.min.js"
import { getKData } from "./get_stock_data.js?ts=1"

export default async function init(id = "main", code, { period } = {}) {
  const isDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
  // get stock k data
  const stock = await getKData(code, period)

  // create the echarts instance
  const chart = echarts.init(document.getElementById(id))

  // draw the chart
  chart.setOption(createChartOption(stock, isDarkTheme))
  return chart
}

function shortenVol(v) {
  if (v >= (10 ** 8)) return (v / 10 ** 8).toFixed(0) + "亿"
  else if (v >= (10 ** 4)) return (v / 10 ** 4).toFixed(0) + "万"
  else return v.toFixed(0) + "手"
}

function shortenAmo(a) {
  if (a >= (10 ** 8)) return (a / 10 ** 8).toFixed(0) + "亿"
  else if (a >= (10 ** 4)) return (a / 10 ** 4).toFixed(0) + "万"
  else return a.toFixed(0) + "元"
}

function createChartOption(stock, isDarkTheme) {
  //stock.data = stock.data.slice(stock.data.length - 100) // test
  const len = stock.data.length
  // yesterday close: first K take open price, otherwise take pre close price
  const preC = len > 1 ? stock.data[len - 2].c : (len ? stock.data[0].o : undefined)
  const zhangFu = preC ? (stock.data[len - 1].c - preC) / preC * 100 : undefined
  // const up = len ? stock.data[len - 1].c >= stock.data[len - 1].o : undefined
  const delta = 0 // 0.01
  return {
    title: {
      left: "center",
      text: stock.code + (stock.name ? ` ${stock.name}` : ""),
      subtext: zhangFu !== undefined ? `${stock.data[len - 1].c.toFixed(2)}  ${zhangFu.toFixed(2)}%` : "",
      subtextStyle: {
        color: zhangFu !== undefined && zhangFu >= 0
          ? (isDarkTheme ? "#F64E56" : "#EB5454")
          : (isDarkTheme ? "#54EA92" : "#47B262"),
        fontSize: 14,
      },
    },
    tooltip: {
      backgroundColor: isDarkTheme ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)",
      formatter: (param) => tooltipFormatter(param, stock.data),
    },
    xAxis: {
      // ["2017-10-24", "2017-10-25", "2017-10-26", "2017-10-27"],
      data: stock.data.map(({ t }) => t),
      axisLabel: {
        formatter: (date) => `${parseInt(date.substring(5, 7))}/${parseInt(date.substring(8))}`,
        align: "right",
      },
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: "value",
      min: Math.min(...stock.data.map(({ l }) => l)) - delta,
      max: Math.max(...stock.data.map(({ h }) => h)) + delta,
      axisLabel: {
        formatter: (value) => value.toFixed(2),
        align: "right",
      },
    },
    series: [
      {
        type: "candlestick",
        // object to array
        data: stock.data.map(({ o, c, l, h, v, a }) => [o, c, l, h, v, a]),
        // data: [
        //   [20, 34, 10, 38],
        //   ...
        // ],
      },
    ],
  }
}
function tooltipFormatter(param, kdata) {
  // param is {name:string, data:[index, o, c, l, h, v, a]}
  const { name, data: [index, o] } = param
  const data = param.data
  const curK = kdata[index]
  // first K take open price, otherwise take pre close price
  const preC = index > 0 ? kdata[index - 1].c : o
  return `<div style="display:flex;flex-direction:column">
       <div>${name}</div>
       <div style="display:flex">
         <div style="width:3.5em">开盘</div>
         <div style="text-align:right;flex-grow:1;">${curK.o.toFixed(2)}</div>
       </div>
       <div style="display:flex">
         <div style="width:3.5em">收盘</div>
         <div style="text-align:right;flex-grow:1;">${curK.c.toFixed(2)}</div>
       </div>
       <div style="display:flex">
         <div style="width:3.5em">最低</div>
         <div style="text-align:right;flex-grow:1;">${curK.l.toFixed(2)}</div>
       </div>
       <div style="display:flex">
         <div style="width:3.5em">最高</div>
         <div style="text-align:right;flex-grow:1;">${curK.h.toFixed(2)}</div>
       </div>
       <div style="display:flex">
         <div style="width:3.5em">涨幅</div>
         <div style="text-align:right;flex-grow:1;">${((curK.c - preC) / preC * 100).toFixed(2)}%</div>
       </div>
       <div style="display:flex">
         <div style="width:3.5em">振幅</div>
         <div style="text-align:right;flex-grow:1;">${((curK.h - curK.l) / preC * 100).toFixed(2)}%</div>
       </div>
       <div style="display:flex">
         <div style="width:3.5em">成交量</div>
         <div style="text-align:right;flex-grow:1;">${shortenVol(curK.v / 100)}</div>
       </div>
       <div style="display:flex">
         <div style="width:3.5em">成交额</div>
         <div style="text-align:right;flex-grow:1;">${shortenAmo(curK.a)}</div>
       </div>
     </div>`
}
