import * as echarts from "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.esm.min.js"
import { getKData } from "./get_stock_data.js?ts=1"

export default async function init({ el, code, period } = {}) {
  const isDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
  // get stock k data
  const stock = await getKData(code, period)

  // create the echarts instance
  const chart = echarts.init(document.getElementById(el))

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

function themeColors(isDarkTheme) {
  return isDarkTheme
    ? {
      mainBg: "#000000",
      mainBorder: "#4C2121",
      // k 线
      k: { upFill: "transparent", upBorder: "#FF3D3D", downFill: "#10CC55", downBorder: "#10CC55", doji: "#c23531" },
      kTip: {
        bg: "rgba(0, 0, 0, 0.8)",
        border: "#144567",
      },
      // 均线
      ma: {
        opacity: 0.5,
        0: "#FF3D3D",
        5: "#00C6D1",
        10: "#5BE58E",
        20: "#6E79EF",
        30: "#FF9A75",
        60: "#19A0FF",
        125: "#3948EF",
        250: "#FF7575",
      },
      yAxis: {
        name: "#EEEFF0", // 轴名
        label: "#D03232", // 刻度值
      },
      cross: {
        bg: "#5B387F",
        line: "#ABADB2",
        label: "#ABADB2",
      },
    }
    : { mainBg: "#ffffff", mainBorder: "#4C2121" }
}

// dashed | solid | dotted
const crossLineType = "solid"

function createChartOption(stock, isDarkTheme) {
  const colors = themeColors(isDarkTheme)
  stock.data = stock.data.slice(stock.data.length - 50) // test
  const len = stock.data.length
  // yesterday close: first K take open price, otherwise take pre close price
  const preC = len > 1 ? stock.data[len - 2].c : (len ? stock.data[0].o : undefined)
  const zhangFu = preC ? (stock.data[len - 1].c - preC) / preC * 100 : undefined
  // const up = len ? stock.data[len - 1].c >= stock.data[len - 1].o : undefined
  const delta = 0.01
  const deltaV = 100
  const maRawData = stock.data.map(({ c }) => c)
  return {
    backgroundColor: colors.mainBg,
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
    axisPointer: {
      link: { xAxisIndex: "all" },
      label: {
        backgroundColor: colors.cross.bg,
        color: colors.cross.label,
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        crossStyle: { color: colors.cross.line, type: crossLineType, width: 1 },
        lineStyle: { color: colors.cross.line, type: crossLineType, width: 1 },
      },
      backgroundColor: colors.kTip.bg,
      borderColor: colors.kTip.border,
      position: function (pos, params, el, elRect, size) {
        const obj = { top: 60 }
        // 中间分割模式
        obj[["left", "right"][+(pos[0] < size.viewSize[0] / 2)]] = "55em"
        // TODO 保持固定直到鼠标进入提示框就反向定位
        return obj
      },
      extraCssText: "width: auto",
      // valueFormatter: (v) => typeof v === "number" ? v.toFixed(2) : v,
      formatter: (params) => tooltipFormatter(params[0].dataIndex, stock.data),
    },
    // 坐标轴组成的矩形的控制：left,right,top,bottom,width,height
    grid: [
      // 主图
      {
        show: true,
        containLabel: false,
        borderColor: colors.mainBorder,
        borderWidth: 2,
        top: "5%",
        // bottom: 0,
        left: 60,
        right: 60,
        height: "70%",
        // width: "75%",
      },
      // 副图：成交量
      {
        show: true,
        containLabel: false,
        borderColor: colors.mainBorder,
        borderWidth: 2,
        top: "80%",
        bottom: 25,
        left: 60,
        right: 60,
        // height: "20%",
        // width: "75%",
      },
    ],
    xAxis: [
      // 主图横轴：隐藏不显示
      {
        show: false,
        type: "category",
        // ["2017-10-24", "2017-10-25", "2017-10-26", "2017-10-27"],
        data: stock.data.map(({ t }) => t),
        boundaryGap: true,
        axisLine: { onZero: false },
        axisLabel: {
          show: true, // 这个设置很重要，否则横轴区会占用一定的高度
          // formatter: (date) => `${parseInt(date.substring(5, 7))}/${parseInt(date.substring(8))}`,
          align: "right",
        },
        axisPointer: {
          label: {
            show: false,
            // formatter: ({ value }) => `${value} ${weekCn[new Date(value).getDay()]}`,
          },
        },
        axisTick: {
          alignWithLabel: true,
        },
        splitNumber: 20,
        min: "dataMin",
        max: "dataMax",
      },
      // 副图成交量横轴
      {
        show: true,
        type: "category",
        gridIndex: 1,
        // ["2017-10-24", "2017-10-25", "2017-10-26", "2017-10-27"],
        data: stock.data.map(({ t }) => t),
        boundaryGap: true,
        axisLine: { show: false, onZero: false },
        axisLabel: {
          show: true,
          formatter: (date) => `${parseInt(date.substring(5, 7))}/${parseInt(date.substring(8))}`,
          align: "right",
        },
        axisPointer: {
          label: {
            show: true,
            formatter: ({ value }) => `${value} ${weekCn[new Date(value).getDay()]}`,
          },
        },
        axisTick: {
          show: true,
          alignWithLabel: true,
        },
        splitNumber: 20,
        min: "dataMin",
        max: "dataMax",
      },
    ],
    yAxis: [
      // 主图左 Y 轴
      {
        type: "value",
        name: `日线 ${stock.name}`,
        nameLocation: "end",
        nameTextStyle: { color: colors.yAxis.name },
        scale: true, // 设为 true 不限制显示 0 轴，设置了 min、max 则无效
        axisLine: { show: false }, // 轴线
        axisTick: { show: false }, // 刻度
        splitLine: { show: false }, // 横向分割线
        // 刻度值
        axisLabel: {
          show: true,
          showMinLabel: false,
          showMaxLabel: false,
          color: colors.yAxis.label,
          formatter: (value) => value.toFixed(2),
          align: "right",
        },
        // boundaryGap: false,
        min: Math.min(...stock.data.map(({ l }) => l)) - delta,
        max: Math.max(...stock.data.map(({ h }) => h)) + delta,
        axisPointer: {
          label: {
            show: true,
            precision: 2,
          },
        },
      },
      // 主图右 Y 轴
      {
        type: "value",
        position: "right",
        // name: `日线 ${stock.name}`,
        // nameTextStyle: { color: colors.yAxis.name },
        scale: true, // 设为 true 不限制显示 0 轴，设置了 min、max 则无效
        axisLine: { show: false, onZero: false }, // 轴线
        axisTick: { show: false }, // 刻度
        splitLine: { show: false }, // 横向分割线
        // 刻度值
        axisLabel: {
          show: true,
          showMinLabel: false,
          showMaxLabel: false,
          color: colors.yAxis.label,
          formatter: (value) => value.toFixed(2),
          align: "left",
        },
        // boundaryGap: false,
        min: Math.min(...stock.data.map(({ l }) => l)) - delta,
        max: Math.max(...stock.data.map(({ h }) => h)) + delta,
        axisPointer: {
          label: {
            show: true,
            precision: 2,
          },
        },
      },
      // 副图左 Y 轴
      {
        gridIndex: 1,
        splitNumber: 2,
        type: "value",
        position: "left",
        name: "成交量",
        nameTextStyle: { color: colors.yAxis.name },
        scale: true, // 设为 true 不限制显示 0 轴，设置了 min、max 则无效
        axisLine: { show: false }, // 轴线
        axisTick: { show: false }, // 刻度线
        splitLine: { show: false }, // 横向分割线
        // 刻度值
        axisLabel: {
          show: true,
          showMinLabel: false,
          showMaxLabel: false,
          color: colors.yAxis.label,
          formatter: (value) => (value / 100).toFixed(0),
          align: "right",
        },
        boundaryGap: false,
        splitNumber: 3,
        max: "dataMax",
        axisPointer: {
          label: {
            show: true,
            formatter: ({ value }) => (value / 100).toFixed(0) + "万手",
            precision: 0,
          },
        },
      },
      // 副图右 Y 轴
      {
        show: true, // TODO 无法将此轴移到右侧，应该是 bug
        gridIndex: 1,
        splitNumber: 2,
        type: "value",
        position: "right",
        // name: "成交量",
        // nameTextStyle: { color: colors.yAxis.name },
        scale: true, // 设为 true 不限制显示 0 轴，设置了 min、max 则无效
        axisLine: { show: false, onZero: false }, // 轴线
        axisTick: { show: false }, // 刻度线
        splitLine: { show: false }, // 横向分割线
        // 刻度值
        axisLabel: {
          show: true,
          showMinLabel: false,
          showMaxLabel: false,
          color: colors.yAxis.label,
          formatter: (value) => (value / 100).toFixed(0),
          align: "left",
        },
        boundaryGap: false,
        splitNumber: 3,
        max: "dataMax",
        axisPointer: {
          label: {
            show: true,
            formatter: ({ value }) => (value / 100).toFixed(0),
            precision: 0,
          },
        },
      },
    ],
    series: [
      {
        name: "日 K",
        type: "candlestick",
        data: stock.data.map(({ o, c, l, h, v, a }) => [o, c, l, h, v, a]),
        //dimensions: ["date", "open", "close", "highest", "lowest"], // TODO
        itemStyle: {
          color: colors.k.upFill,
          color0: colors.k.downFill,
          borderColor: colors.k.upBorder,
          borderColor0: colors.k.downBorder,
          //borderColorDoji: colors.k.doji,
        },
        tooltip: {
          // formatter: "{a}, {b}，{c}，{d}，{e}",
        },
        barWidth: "60%",
      },
      {
        name: "MA5",
        type: "line",
        data: ma(5, maRawData),
        silent: true,
        animation: false,
        smooth: false,
        symbol: "none",
        showSymbol: false,
        lineStyle: {
          opacity: colors.ma.opacity,
          color: colors.ma[5],
        },
        tooltip: {
          // formatter: "{a}, {b}，{c}，{d}，{e}",
        },
      },
      {
        name: "MA20",
        type: "line",
        data: ma(20, maRawData),
        silent: true,
        animation: false,
        smooth: false,
        // symbol: "none",
        showSymbol: false,
        lineStyle: {
          opacity: colors.ma.opacity,
          color: colors.ma[20],
        },
      },
      {
        name: "成交量",
        type: "bar",
        xAxisIndex: 1,
        yAxisIndex: 2,
        data: stock.data.map(({ o, c, l, h, v, a }) => v / 100),
        barWidth: "60%",
        itemStyle: {
          color: function (params) {
            const k = stock.data[params.dataIndex]
            return k.c >= k.o ? colors.k.upBorder : colors.k.downFill
          },
          borderWidth: 0,
          borderColor: function (params) {
            // bug: echarts not support functional borderColor
            const k = stock.data[params.dataIndex]
            return k.c >= k.o ? colors.k.upBorder : colors.k.downBorder
          },
        },
      },
    ],
  }
}

const weekCn = ["", "周一", "周二", "周三", "周四", "周五", "周六", "周日"]

function tooltipFormatter(index, kdata) {
  const curK = kdata[index]
  // console.log(curK)
  // first K take open price, otherwise take pre close price
  const preC = index > 0 ? kdata[index - 1].c : curK.o
  return `<div style="display:flex;flex-direction:column">
       <div style="display:flex">
         <div style="text-align:left;">${curK.t}</div>
         <div style="text-align:right;flex-grow:1;padding-left:.5em">${weekCn[new Date(curK.t).getDay()]}</div>
       </div>
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
         <div style="width:3.5em">涨跌</div>
         <div style="text-align:right;flex-grow:1;">${(curK.c - preC).toFixed(2)}</div>
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

/**
 * Calculate ma data.
 * Empty data use "-" instead.
 * @param {number} n Day count
 * @param {number[]} values Raw data
 * @param {number} fractionDigits Number of digits after the decimal point, default 2
 * @returns {string[]}
 */
const ma = (n, values, fractionDigits = 2) =>
  values.map((_, i) =>
    i < n - 1 ? "-" : (values.slice(i - n + 1, i + 1).reduce((a, b) => a + b, 0) / n).toFixed(fractionDigits)
  )
