// "use client"

// import { useEffect, useRef, useState } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import * as echarts from "echarts"
// import { MoreVertical, ZoomIn, ZoomOut } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import worldMapData from "./world-map-data"

// // Define types for our component props
// export interface LocationData {
//   name: string
//   value: number
//   coordinates: [number, number]
//   color?: string
// }

// interface RevenueMapProps {
//   title?: string
//   data: LocationData[]
//   onLocationClick?: (location: LocationData) => void
// }

// export default function RevenueMap({ title = "REVENUE BY LOCATION", data, onLocationClick }: RevenueMapProps) {
//   const chartRef = useRef<HTMLDivElement>(null)
//   const chartInstance = useRef<echarts.ECharts | null>(null)
//   const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
//   const [zoomLevel, setZoomLevel] = useState(1)

//   // Initialize and update chart when data changes
//   useEffect(() => {
//     if (!chartRef.current) return

//     // Initialize chart if not already done
//     if (!chartInstance.current) {
//       // Register world map data with ECharts
//       if (!echarts.getMap("world")) {
//         echarts.registerMap("world", worldMapData)
//       }
//       chartInstance.current = echarts.init(chartRef.current)
//     }

//     // Prepare data for the chart
//     const chartData = data.map((item) => ({
//       name: item.name,
//       value: [...item.coordinates, item.value],
//       itemStyle: {
//         color: item.color || "#4f46e5",
//       },
//     }))

//     // Set chart options
//     const option = {
//       backgroundColor: "transparent",
//       tooltip: {
//         trigger: "item",
//         formatter: (params: any) => {
//           return params.name
//         },
//       },
//       geo: {
//         map: "world",
//         roam: true,
//         zoom: zoomLevel,
//         selectedMode: false,
//         silent: true,
//         itemStyle: {
//           areaColor: "#f1f5f9",
//           borderColor: "#e2e8f0",
//         },
//         emphasis: {
//           itemStyle: {
//             areaColor: "#f1f5f9",
//           },
//         },
//       },
//       series: [
//         {
//           type: "effectScatter",
//           coordinateSystem: "geo",
//           data: chartData,
//           symbolSize: (val: any) => {
//             // Scale dot size based on value
//             const value = val[2]
//             return Math.min(Math.max(value / 10000, 10), 25)
//           },
//           showEffectOn: "render",
//           rippleEffect: {
//             brushType: "stroke",
//           },
//           emphasis: {
//             scale: true,
//           },
//         },
//       ],
//     }

//     // Apply options to chart
//     chartInstance.current.setOption(option)

//     // Handle click events
//     chartInstance.current.on("click", (params) => {
//       if (params.componentType === "series") {
//         const clickedLocation = data.find((item) => item.name === params.name)
//         if (clickedLocation) {
//           setSelectedLocation(clickedLocation.name)
//           if (onLocationClick) {
//             onLocationClick(clickedLocation)
//           }
//         }
//       }
//     })

//     // Handle resize
//     const handleResize = () => {
//       chartInstance.current?.resize()
//     }
//     window.addEventListener("resize", handleResize)

//     return () => {
//       window.removeEventListener("resize", handleResize)
//     }
//   }, [data, zoomLevel, onLocationClick])

//   // Handle zoom controls
//   const handleZoomIn = () => {
//     setZoomLevel((prev) => Math.min(prev + 0.5, 5))
//   }

//   const handleZoomOut = () => {
//     setZoomLevel((prev) => Math.max(prev - 0.5, 0.5))
//   }

//   // Sort data by value in descending order for the bar chart
//   const sortedData = [...data].sort((a, b) => b.value - a.value)

//   return (
//     <Card className="w-full">
//       <CardHeader className="flex flex-row items-center justify-between pb-2">
//         <CardTitle className="text-md font-medium text-gray-500">{title}</CardTitle>
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant="ghost" size="icon">
//               <MoreVertical className="h-4 w-4" />
//               <span className="sr-only">Menu</span>
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end">
//             <DropdownMenuItem>Download Report</DropdownMenuItem>
//             <DropdownMenuItem>Share</DropdownMenuItem>
//             <DropdownMenuItem>Print</DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </CardHeader>
//       <CardContent className="p-0">
//         <div className="relative h-[250px] w-full">
//           <div ref={chartRef} className="h-full w-full" />
//           <div className="absolute left-4 top-4 flex flex-col gap-2">
//             <Button variant="outline" size="icon" className="h-8 w-8 bg-white" onClick={handleZoomIn}>
//               <ZoomIn className="h-4 w-4" />
//               <span className="sr-only">Zoom in</span>
//             </Button>
//             <Button variant="outline" size="icon" className="h-8 w-8 bg-white" onClick={handleZoomOut}>
//               <ZoomOut className="h-4 w-4" />
//               <span className="sr-only">Zoom out</span>
//             </Button>
//           </div>
//         </div>
//         <div className="p-6">
//           {sortedData.map((location) => (
//             <div
//               key={location.name}
//               className="mb-4 last:mb-0"
//               onClick={() => {
//                 setSelectedLocation(location.name)
//                 if (onLocationClick) onLocationClick(location)
//               }}
//             >
//               <div className="flex items-center justify-between mb-1">
//                 <span className="text-sm font-medium">{location.name}</span>
//                 <span className="text-sm font-medium">
//                   {location.value.toLocaleString("en-US", {
//                     style: "decimal",
//                     maximumFractionDigits: 0,
//                   })}
//                   k
//                 </span>
//               </div>
//               <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
//                 <div
//                   className="h-full bg-blue-500 rounded-full"
//                   style={{
//                     width: `${(location.value / sortedData[0].value) * 100}%`,
//                     backgroundColor: location.color || "#4f46e5",
//                   }}
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   )
// }
import React from 'react';

export default function RevenueByLocation() {
  return <div>few</div>;
}
