import * as echarts from "https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.esm.min.js"
import { getKData } from "./get_stock_data.js?ts=1"

export default async function init(id = "main", code, { period } = {}) {
  // get kdata
  const kdata = await getKData(code, period)

  // Create the echarts instance
  const myChart = echarts.init(document.getElementById(id))

  // Draw the chart
  myChart.setOption({
    title: {
      text: "ECharts Getting Started Example",
    },
    tooltip: {},
    xAxis: {
      data: ["shirt", "cardigan", "chiffon", "pants", "heels", "socks"],
    },
    yAxis: {},
    series: [
      {
        name: "sales",
        type: "bar",
        data: [5, 20, 36, 10, 10, 20],
      },
    ],
  })
  return myChart
}
