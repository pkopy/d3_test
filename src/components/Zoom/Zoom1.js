import React, {useEffect, useState} from 'react'
import * as d3 from 'd3'
import {select} from "d3-selection";
import {selectAll} from "d3";
import {Paper, Switch, Tooltip, Typography} from "@material-ui/core";
import Dialog from '../Dialog/Dialog'
import {transformer} from "d3-scale/src/continuous";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Button from '@material-ui/core/Button';
import TagDialog from "../Dialog/TagDialog";
import ChartDialog from "../Dialog/ChartDialog";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';


export default function BarChart(props) {
    const ref1 = React.useRef();
    const [taskId, setTaskId] = useState(props.data.taskId)
    const [open, setOpen] = useState(true)
    const [rawData1, setRawData] = useState(props.data.instance[0])
    const [mode, setMode] = useState('Free')
    const [full, setFull] = useState(false)
    const [line, setLine] = useState(0)
    const [refresh, setRefresh] = useState(false)
    const [tagDialogOpen, setTagDialogOpen] = useState(false)
    const [chartOpen, setChartOpen] = useState(false)
    useEffect(() => {

        create();

        return (() => {
            console.log('exit')
        })
    }, [mode]);

    useEffect(() => {
        create()
    }, [full, line, rawData1, refresh])

    const show = (index) => {
        const newCharts = [...chartOptions.charts]
        if (newCharts[index].line < 3) {
            // setLine(line + 1)
            newCharts[index].line++
        } else {
            newCharts[index].line = 0
        }
        const newChartOptions = {...chartOptions}
        newChartOptions.charts = newCharts
        setChartOptions(newChartOptions)
        // console.log(line)
    }

    const groupData = (x) => {
        setChartOptions({
            newY: undefined,
            newX: undefined,
            dataMax: undefined,
            xAsis: undefined,
            arr: undefined,
            marks: undefined,

        })
        setMode('Free')
        if (x > 0) {
            const dat = props.data
            const newObj = {}
            for (let key in dat) {
                let j = 0
                let u = x
                const arrr = []
                for (let i = j; i < dat[key].length / x; i++) {
                    const arr = dat[key].slice(j, u)
                    // console.log(arr)
                    const w = arr.reduce((pre, curr) => pre + curr)
                    // console.log(w)
                    arrr.push(w / x)
                    j = u

                    u += x
                }
                // arr.push( e:dat[e].slice(0,50)})
                newObj[key] = arrr
            }
            // console.log(newObj)
            setRawData(newObj)
            // rawData = newObj
            // console.log(rawData1)

        } else {
            setRawData(props.data)
        }
    }
    const chartArray = [];
    const colors = ['green', 'steelblue', 'orange', 'red']
    for (let i = 0; i < props.data.instance.length; i++) {
        chartArray.push({color: colors[i], disable: false, line: 0})
    }
    const [chartOptions, setChartOptions] = useState({
        newY: undefined,
        newX: undefined,
        dataMax: undefined,
        xAsis: undefined,
        arr: new Set(),
        marks: [],
        charts: chartArray

    })



    const changemode = (e) => {

        // console.log(e.target.value)
        // newChartOptions1.mode = e.target.value
        // console.log(newChartOptions1)
        // setChartOptions(newChartOptions1)
        setMode(e.target.value)
        // create()
        // setTimeout(() => {
        //     console.log(mode)
        //     create()
        // },1000)

    }


    /*========= CREATE CHART =========*/
    const create = () => {
        // console.log(fakeDate)
        let rawData = rawData1
        // console.log(rawData, 'rawdata')
        const node = ref1.current;
        const margin = ({top: 10, right: 30, bottom: 30, left: 60});
        let height = 500 - margin.top - margin.bottom;
        let width = 1060 - margin.left - margin.right;
        let newX
        let newY
        let isZoom = true
        let dataMax = 0
        select(node).selectAll('*').remove()
        const newChartOptions = {...chartOptions}
        const chartChange = (attr, value) => {
            for (let key in chartOptions) {
// console.log(key)
                if (key === attr) {
                    // console.log(value)
                    newChartOptions[key] = value
                }
            }

        }

        const maxValue = () => {
            let max = -Infinity
            for (let key in rawData) {
                max = d3.max(rawData[key], d => d) > max ? d3.max(rawData[key], d => d) : max
            }
            dataMax = chartOptions.dataMax ? chartOptions.dataMax : max + max * 0.1
            chartChange('dataMax', dataMax)

            setChartOptions(newChartOptions)

        }

        maxValue()

        const svg = select(node)
            .append('svg')
            .attr('class', 'tran')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            // .attr(viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            // .attr('preserveAspectRatio', "xMidYMid meet")
            .append("g")

            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        window
            .addEventListener('keydown', (e) => {
                // console.log(e)
                if (e.code === "ShiftLeft") {
                    zoom.on('zoom', updateChart)
                    zoomContainer.attr('width', width)
                        .call(d3.brush()
                            .extent([[0, 0], [width, height]])
                            .on('end', updateBrush))
                }
            })
        window
            .addEventListener('keyup', (e) => {
                if (e.code === "ShiftLeft") {
                    zoomContainer.attr('width', 0)
                        .call(d3.brush().move, null)
                }

            })

        let yScale = chartOptions.newY || d3.scaleLinear()
            .domain([0, dataMax])
            .range([height, 0])


        const yAxis = svg
            .append("g")
            // .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale).tickSize(-width))
        yAxis.selectAll('.tick')
            // .attr('stroke', 'yellow')
            .attr('stroke-width', 0.1)
        yAxis.select('.domain')
            .attr('stroke-width', 0.1)

        const xScale = d3.scaleBand()
            .domain(rawData.Open.map((d, i) => i))
            .range([0, width])
            .padding(0.2)

        let xScale2 = chartOptions.newX || d3.scaleLinear()
            .domain([-1, rawData.Open.length])
            .range([0, width])

        const xAxis = svg
            .append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale2).tickSize(-height))

        xAxis.select('.domain')
            .attr('stroke-width', 0.1)

        xAxis.selectAll('.tick')
            .attr('stroke-width', 0.1)


        const clip = svg.append("defs").append("SVG:clipPath")
            .attr("id", "clip")
            .append("SVG:rect")
            .attr("width", width)
            .attr("height", height)
            .attr("x", 0)
            .attr("y", 0);

        const scatter = svg.append("g")
            .attr("clip-path", "url(#clip)")

        const updateChart = (e) => {
            // console.log(e)

            // if (!newX || !newY) {

            newX = e.transform.rescaleX(xScale2)
            newY = e.transform.rescaleY(yScale)
            // console.log(newX.domain())
            // } else {
            //     // newX = chartOptions.newX
            //     // newY = chartOptions.newY
            // }
            xAxis
                .call(d3.axisBottom(newX).tickSize(-height))

            chartChange('newY', newY)
            chartChange('newX', newX)
            setChartOptions(newChartOptions)
            xAxis.selectAll('.tick')
                .attr('stroke-width', 0.1)
            yAxis.call(d3.axisLeft(newY).tickSize(-width))

            yAxis.selectAll('.tick')
                .attr('stroke-width', 0.1)


            for (let j = 0; j < props.data.instance.length; j++) {


                scatter
                    .selectAll(`.horizontal${j}`)

                    // .attr('con', (d) => console.log(select(d.target), 'oko'))
                    // eslint-disable-next-line no-loop-func
                    .attr('x1', (d, i) => newX(i))
                    // eslint-disable-next-line no-loop-func
                    .attr('x2', (d, i) => newX(i))
                    // eslint-disable-next-line no-loop-func
                    .attr('y1', (d, i) => newY(props.data.instance[j].Low[i]))
                    .attr('y2', (d, i) => newY(props.data.instance[j].High[i]))
                    // .attr('stroke-width', e.transform.k/2)
                    // .attr('stroke', 'black')
                    .attr('stroke-width', e.transform.k > 4 ? 0.1 * e.transform.k : 1);
                // console.log(lines)
            }
            for (let j = 0; j < props.data.instance.length; j++) {
                const rawData2 = props.data.instance[j]
                // console.log(rawData2)
                scatter
                    .selectAll(`.candle${j}`)
                    // .attr('class', 'xman')

                    // eslint-disable-next-line no-loop-func
                    .attr('x', (d, i) => xScale.bandwidth() > 8 || e.transform.k > 1.5 ? newX(i) - 4 : newX(i) - xScale.bandwidth() / 2)
                    // eslint-disable-next-line no-loop-func
                    // .attr('id', (d, i) => j * i + i)
                    // eslint-disable-next-line no-loop-func
                    .attr('y', (d, i) => rawData2['Open'][i] < rawData2['Close'][i] ? newY(rawData2['Close'][i]) : newY(rawData2['Open'][i]))
                    // eslint-disable-next-line no-loop-func
                    .attr('height', (d, i) => {
                        if (rawData2['Open'][i] < rawData2['Close'][i]) {
                            return (newY(0) - newY(rawData2['Close'][i] - d))
                        } else if (rawData2['Open'][i] > rawData2['Close'][i]) {
                            return (newY(0) - newY(d - rawData2['Close'][i]))
                        }
                    })
                    .attr('width', xScale.bandwidth() > 8 || e.transform.k > 1.5 ? 8 : xScale.bandwidth())

            }

            // }
            scatter
                .selectAll('.mark')
                .data(marks)
                .attr('x', d => newX(d.x))
                .attr('y', d => newY(d.y))
                .attr('width', d => newX(d.x0) - newX(d.x1))
                .attr('height', d => newY(d.y0) - newY(d.y1))
                .attr('fill', d => d.color)
                .attr('opacity', 0.2)
            scatter
                .selectAll('.mark-text')
                .data(marks)
                .attr('x', d => newX(d.x) + 5)
                .attr('y', d => newY(d.y) + 10)
            // .attr("font-size", d => newY(d.y))

            scatter
                .selectAll('.line-graph')
                .attr("d", d3.line()

                    .x((d, i) => newX(i))
                    .y((d) => newY(d))
                )
            // .attr('stroke-width', e.transform.k/3)

            scatter
                .selectAll('.dot')
                .attr("cx", (d, i) => newX(i))
                .attr("cy", (d) => newY(d))
                // .attr('r', e.transform.k/2)
                .attr('r', 0.4 * e.transform.k)
            // for (let mark of marks) {
            //     console.log(mark)
            //     mark.setAttributeNS(null,'x', newX(mark.attributes.x.value * 1))
            // }

            // .attr('y', (d, i) => rawData.Open[i] < rawData.Close[i] ? newY(rawData.Close[i]) : newY(rawData.Open[i]))


        }
        const zoom = d3.zoom()
            .scaleExtent([-2, 20])  // This control how much you can unzoom (x0.5) and zoom (x20)
            .extent([[0, 0], [width, height]])
            .on("zoom", updateChart);

        const zoomContainer = svg.append("rect")
            .attr("width", 0)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .call(zoom);


        const updateBrush = ({selection}) => {


            if (!newX) {
                newX = xScale2
                newY = yScale
            }
            if (selection) {

                newX.domain([selection[0][0], selection[1][0]].map(newX.invert, newX))
                newY.domain([selection[1][1], selection[0][1]].map(newY.invert, newY))
                xAxis
                    .transition().duration(300)
                    .attr("transform", `translate(0, ${height})`)
                    .attr('stroke-width', 0.1)
                    .call(d3.axisBottom(newX).tickSize(-height))
                yAxis
                    .attr('stroke-width', 0.1)
                    .call(d3.axisLeft(newY).tickSize(-width))
                scatter
                    .call(d3.brush().move, null)

            } else {
                yScale
                    .domain([0, dataMax])
                    .range([height, 0])
                xScale2
                    .domain([0, rawData.Open.length])
                    .range([0, width])
                xAxis
                    .transition().duration(300)
                    .attr("transform", `translate(0, ${height})`)
                    .attr('stroke-width', 0.1)
                    .call(d3.axisBottom(xScale2).tickSize(-height))
                yAxis
                    .transition().duration(300)
                    .attr('stroke-width', 0.1)
                    .call(d3.axisLeft(yScale).tickSize(-width))

            }
            scatter
                .selectAll('.horizontal')
                .attr('x1', (d, i) => newX(i))
                .attr('x2', (d, i) => newX(i))
                .attr('y1', (d, i) => newY(rawData.Low[i]))
                .attr('y2', (d, i) => newY(rawData.High[i]))
            // .attr('stroke-width', e.transform.k/2)
            // .attr('stroke', 'black')
            // .attr('stroke-width', e.transform.k > 4 ? 0.1 * e.transform.k : 1)
            scatter
                .selectAll('rect')
                // .attr('x', (d, i) => newX(i ) -(x(e.transform.k))/2)
                .attr('class', 'candle')
                .attr('x', (d, i) => xScale.bandwidth() > 8 ? newX(i) - 4 : newX(i) - 4)
                // .attr('x', (d, i) => newX(i) - 4)
                .transition().duration(300)
                .attr('y', (d, i) => rawData.Open[i] < rawData.Close[i] ? newY(rawData.Close[i]) : newY(rawData.Open[i]))
                .attr('height', (d, i) => {
                    // console.log(yScale(props.data.Close[i] - d))
                    // return props.data.Open[i] < props.data.Close[i]?yScale(0)-yScale(props.data.Close[i]-d):yScale(0) - yScale(d-props.data.Close[i]) })
                    if (rawData.Open[i] < rawData.Close[i]) {
                        return (newY(0) - newY(rawData.Close[i] - d))
                    } else if (rawData.Open[i] > rawData.Close[i]) {
                        return (newY(0) - newY(d - rawData.Close[i]))
                    }
                })
                .attr('width', xScale.bandwidth() > 4 ? 8 : xScale.bandwidth())

            scatter
                .selectAll('.line-graph')
                .attr("d", d3.line()

                    .x((d, i) => newX(i))
                    .y((d) => newY(d))
                )
            // .attr('stroke-width', e.transform.k/3)

            scatter
                .selectAll('.dot')
                .attr("cx", (d, i) => newX(i))
                .attr("cy", (d) => newY(d))
            // .attr('r', e.transform.k/2)
            // .attr('r', 0.4 * e.transform.k)
            scatter
                .call(d3.brush().move, null)
            // xcale2.domain([selection[0][0], selection[1][0]])
            // yScale.domain([selection[1][1], selection[0][1]])
            // console.log(xAxis)
            chartChange('newX', newX)
            chartChange('newY', newY)
            setMode('Free')

        }
        let arr = chartOptions.arr || new Set([]);
        const marks = chartOptions.marks || []

        const drawMarks = (marks) => {
            if (!newX) {
                newX = xScale2
                newY = yScale
            }
            if (marks.length > 0) {

                scatter.selectAll('.mark, .mark-text').remove()
                for (let mark of marks) {
                    if (!mark.disable) {

                        const container = scatter
                            .append('g')

                        container
                            .append('rect')
                            // .style('opacity', 0.01)
                            .attr('class', 'mark')

                            .attr('fill', mark.color)
                            .attr('opacity', 0.2)
                            .attr('x', newX(mark.x))
                            .attr('y', newY(mark.y))
                            .attr('height', newY(mark.y0) - newY(mark.y1))
                            .attr('width', newX(mark.x0) - newX(mark.x1))

                        if (newX(mark.x0) - newX(mark.x1) > 0) {

                            container
                                .append('text')
                                .attr('class', 'mark-text')
                                .attr("x", newX(mark.x) + 5)
                                .attr("y", newY(mark.y) + 10)
                                .attr('fill', 'black')
                                .attr("dy", ".35em")
                                .text(mark.name)
                        }
                    }
                }
            }
        }

        const updateBrushMark = ({selection}, start = false) => {
            // console.log(start)
            if (!newX || !newY) {
                newX = xScale2
                newY = yScale
            }
            const markReact = new Set()
            for (let i = 0; i < props.data.instance.length; i++) {
                let rects = scatter
                    .selectAll(`.candle${i}`)

                // drawMarks(marks)
                for (let rect of rects) {
                    // console.log(extent[0][0], rect.x.animVal.value, extent[1][0])
                    // console.log(rect)
                    // console.log(selection[0])
                    // const isBrushed = selection && selection[0] && selection[1] && selection[0][0] <= rect.x.animVal.value && selection[1][0] >= rect.x.animVal.value
                    const isBrushed = selection && selection[0] && selection[1] && selection[0][0] <= rect.x.animVal.value && selection[1][0] >= rect.x.animVal.value && selection[0][1] <= rect.y.animVal.value && selection[1][1] >= rect.y.animVal.value + rect.height.animVal.value

                    if (isBrushed) {

                        // console.log(rect.id)
                        if (arr.has(rect)) {
                            // console.log('dupa')
                            arr.delete(rect)
                            select(rect)
                                .attr('stroke', '#6dcd65')
                                .attr('stroke-width', 1)
                        } else {
                            select(rect)
                                .attr('stroke', 'red')
                                .attr('stroke-width', 1)
                                .attr('fill', 'none')
                                .attr('isMark', true)

                            arr.add(rect)
                            markReact.add(rect)
                            // console.log(arr)


                        }

                    }

                }
            }
            if (selection && selection[1][0] - selection[0][0] > 0) {

                marks.push({
                    x: newX.invert(selection[0][0]),
                    y: newY.invert(selection[0][1]),
                    y0: newY.invert(selection[1][1]),
                    y1: newY.invert(selection[0][1]),
                    x0: newX.invert(selection[1][0]),
                    x1: newX.invert(selection[0][0]),
                    rects: markReact,
                    name: `Mark ${marks.length + 1}`,
                    color: colors[marks.length % colors.length],
                    disable: false
                })
            }

            chartChange('marks', marks)
            chartChange('arr', arr)
            if (!start) setRefresh(!refresh)
        }


        const makeRects = (rawData, color, index = 0) => {

            if (!newX) {
                newX = xScale2
                newY = yScale
            }

            // scatter.selectAll('*').remove()
            if (chartOptions.charts[index].line === 0 || chartOptions.charts[index].line === 1) {

                scatter
                    .append('path')
                    .datum(rawData.Mean)
                    .attr('class', 'line-graph')
                    .attr("fill", "none")
                    .attr("stroke", color)
                    .attr("stroke-width", 1.5)
                    .attr('opacity', 1)
                    .attr("d", d3.line()

                        .x((d, i) => newX(i))
                        .y((d) => newY(d))
                    )
                scatter
                    .append('g')
                    .selectAll('.dot')
                    .data(rawData.Mean)
                    .enter()
                    .append('circle')
                    .attr('class', 'dot')
                    .attr('opacity', 1)
                    .attr('cx', (d, i) => newX(i))
                    .attr("cy", (d) => newY(d))
                    .attr("r", 1)
                    .attr('fill', color)
                    .on('mouseover', (e) => {
                        select(e.target)
                            .transition().duration(500)
                            .attr('r', 10)
                    })
            }
            if (chartOptions.charts[index].line === 0 || chartOptions.charts[index].line === 2) {
                scatter
                    .append('g')
                    .selectAll(`.horizontal${index}`)
                    .data(rawData.Open)
                    .enter()
                    .append('line')
                    .attr('class', `horizontal${index}`)
                    .attr('x1', (d, i) => newX(i))
                    .attr('x2', (d, i) => newX(i))
                    .attr('y1', (d, i) => newY(rawData.Low[i]))
                    .attr('y2', (d, i) => newY(rawData.High[i]))
                    .attr('stroke-width', 1)
                    .attr('stroke', color)
                    .attr('opacity', 1)

                scatter
                    .append('g')
                    .selectAll("rect")
                    .data(rawData.Open)
                    .enter()
                    .append('rect')
                    .attr('class', `candle${index}`)
                    .attr('opacity', 1)
                    // .attr('id', (d, i) => index * rawData.Open.length + i)
                    .attr('id', (d, i) => color + i)
                    .on("click", (d) => {
                        if (arr.has(d.target)) {
                            arr.delete(d.target)
                            select(d.target)
                                .attr('stroke', color)
                                .attr('stroke-width', 0.5)
                        } else {
                            select(d.target)
                                .attr('stroke', 'red')
                                .attr('stroke-width', 1)
                                .attr('fill', 'none')
                                .attr('isMark', true)
                            arr.add(d.target)
                        }
                    })
                    .attr('stroke', (d, i) => rawData.Open[i] > rawData.Close[i] ? null : color)
                    .attr('stroke-width', 0.5)
                    .style('fill', (d, i) => rawData.Open[i] < rawData.Close[i] ? '#fff' : color)
                    .style('cursor', 'pointer')
                    .attr('x', (d, i) => xScale.bandwidth() > 8 ? newX(i) - 4 : newX(i) - xScale.bandwidth() / 2)
                    .attr('q_value', (d, i) => d)
                    .attr('close_value', (d, i) => rawData.Close[i])
                    .attr('y', (d, i) => rawData.Open[i] < rawData.Close[i] ? newY(rawData.Close[i]) : newY(rawData.Open[i]))
                    // .transition().duration(300)
                    .attr('height', (d, i) => {
                        if (rawData.Open[i] < rawData.Close[i] && (rawData.Close[i] - d) > 0.05) {
                            return (newY(0) - newY(rawData.Close[i] - d))
                        } else if (rawData.Open[i] > rawData.Close[i] && (d - rawData.Close[i] > 0.05)) {
                            return (newY(0) - newY(d - rawData.Close[i]))
                        } else {
                            return 2
                        }
                    })
                    .attr('width', xScale.bandwidth() > 8 ? 8 : xScale.bandwidth())


            }

        }

        const createMarks = () => {
            const rects = scatter.selectAll(`rect`)._groups[0];
            const myArr = Array.from(chartOptions.arr)
            console.log(myArr)
            for (let i = 0; i < rects.length; i++) {

                if (chartOptions.arr) {

                    // for (let mark of marks) {


                    for (let markRect of myArr) {
                        if (markRect.id === rects[i].id && markRect.attributes.isMark.value === 'true') {
                            select(rects[i])
                                .attr('stroke', 'red')
                                .attr('stroke-width', 1)
                                // .attr('id', (d, i) => color+i)
                                .attr('isMark', markRect.attributes.isMark.value)
                            // newArr.add(select(rects[i])._groups[0][0])
                        }
                    }
                    // }
                }

            }
            // arr = newArr
            // chartChange('arr', newArr)
        }

        for (let i = 0; i < props.data.instance.length; i++) {
            if (chartOptions.charts[i] && !chartOptions.charts[i].disable) {
                makeRects(props.data.instance[i], colors[i], i)
            }
        }
        drawMarks(chartOptions.marks);
        createMarks()
        // setRefresh(!refresh)
        // console.log(chartOptions, 'ooo')
        switch (mode) {
            case "Free":
                // console.log('free');
                break;
            case "Mark":
                zoomContainer.attr("width", 0)
                zoom
                    .on('zoom', null)
                scatter
                    .call(d3.brush()
                        .extent([[0, 0], [width, height]])
                        .on('end', (e) => updateBrushMark(e))
                        .on('start', (e) => updateBrushMark(e, true)))
                break;
            case "Zoom":
                zoomContainer.attr("width", 0)
                zoom
                    .on('zoom', null)

                scatter
                    .call(d3.brush()
                        .extent([[0, 0], [width, height]])
                        .on('end', updateBrush))


        }

    }
    const setVisible = (array, property, index) => {
        const arr = [...array]
        if (property === 'charts') show(index)

        if (arr[index].line === 3 || property !== 'charts') {

            arr[index].disable = !arr[index].disable
        } else {
            arr[index].disable = false
        }
        const newChartOptions = {...chartOptions}
        newChartOptions[property] = arr
        console.log(newChartOptions)
        setChartOptions(newChartOptions)
        setRefresh(!refresh)
    }
    return (
        <div>
            <TagDialog
                open={tagDialogOpen}
                labels={props.data.labels}
                setTagDialogOpen={setTagDialogOpen}
            />
            <ChartDialog
                labels={props.data.labels}
                open={chartOpen}
                setChartOpen={setChartOpen}
            />
            <Dialog
                open={open}
                chartOptions={chartOptions}
                setTagDialogOpen={setTagDialogOpen}
                tagDialogOPen={tagDialogOpen}
            />

            {/*<button onClick={() => console.log((Array.from(data)))}>0000</button>*/}
            <div style={{marginLeft: 40}}><b>Task ID: {taskId}</b></div>
            <div style={{display: 'flex'}}>

                <div id={"kotek"} ref={ref1} style={{userSelect: "none"}}>
                    {/*<svg ref={ref1}/>*/}
                </div>

                {/*<div>*/}
                {/*    <Select*/}
                {/*        labelId="demo-simple-select-label"*/}
                {/*        id="demo-simple-select"*/}
                {/*        // value={0}*/}
                {/*        onChange={(e) => groupData(e.target.value)}*/}
                {/*    >*/}
                {/*        <MenuItem value={0}>0</MenuItem>*/}
                {/*        <MenuItem value={3}>3</MenuItem>*/}
                {/*        <MenuItem value={7}>7</MenuItem>*/}
                {/*        <MenuItem value={9}>9</MenuItem>*/}
                {/*    </Select>*/}
                {/*</div>*/}
                <div>
                    <Paper>
                        {/*<Typography variant="subtitle2">*/}
                        {/*    <b>Charts</b>*/}
                        {/*</Typography>*/}
                        {chartOptions.charts.map((data, i) =>


                            <div style={{display: "flex", alignItems: 'center'}}>

                                {/*<Switch*/}
                                {/*    color={"primary"}*/}
                                {/*    checked={!data.disable}*/}
                                {/*    onChange={() => setVisible(chartOptions.charts, 'charts', i)}*/}
                                {/*/>*/}


                                <div style={{
                                    margin: 10,
                                    width: 30,
                                    height: 30,
                                    background: data.color,
                                    borderRadius: 15,
                                    cursor: 'pointer'
                                }}
                                     onClick={() => setChartOpen(true)}
                                >
                                    {/*{data}*/}
                                </div>
                                <div style={{cursor: 'pointer'}}
                                     onClick={() => setVisible(chartOptions.charts, 'charts', i)}>
                                    <svg
                                        version="1.1"
                                        viewBox="0 0 26.458333 26.458334"
                                        height="100"
                                        width="100"
                                    >
                                        <g
                                            transform="translate(0,-270.54165)"
                                            id="layer1">
                                            {(data.line === 0 || data.line === 1) && <path
                                                d="m 9.2131697,283.77082 h 8.0792413 v 0 0"
                                                stroke={data.color}
                                                strokeWidth={0.211}
                                            />}
                                            {(data.line === 0 || data.line === 2) && <>
                                                <path
                                                    d="m 13.229167,271.86457 v 23.8125 0"
                                                    stroke={data.color}
                                                    strokeWidth={0.211}
                                                />

                                                <path
                                                    d="m 12.006927,277.9656 h 2.491727 v 11.9884 h -2.491727 z"
                                                    stroke={data.color}
                                                    strokeWidth={0.6}
                                                    fill={'#fff'}
                                                />
                                            </>}
                                            {data.line === 3&&<>
                                                <circle
                                                    r="4.1208663"
                                                    cy="283.88895"
                                                    cx="13.11105"
                                                    stroke={data.color}
                                                    strokeWidth={0.6}
                                                    fill={'none'}
                                                />
                                                <path
                                                    d="m 10.166509,286.78623 5.817189,-5.81719 v 0"
                                                    stroke={data.color}
                                                    strokeWidth={0.6}
                                                />
                                            </>}

                                        </g>

                                    </svg>
                                </div>
                            </div>
                        )}
                    </Paper>
                </div>
                <div>
                    <Paper style={{marginLeft: 10}}>
                    {chartOptions.marks.map((data, i) =>



                            <div style={{display: "flex", alignItems: 'center'}}>
                                <Switch
                                    color={"primary"}
                                    checked={!data.disable}
                                    onChange={() => setVisible(chartOptions.marks, 'marks', i)}
                                />
                                <div style={{
                                    margin: 10,
                                    width: 30,
                                    height: 30,
                                    background: data.color,
                                    opacity: 0.2,
                                    borderRadius: 15,
                                    cursor: 'pointer'
                                }}
                                     onClick={() => setVisible(chartOptions.marks, 'marks', i)}
                                >

                                </div>
                                <div style={{height: 20, marginRight: 10}}>
                                    {data.name}
                                </div>
                            </div>
                        )}
                    </Paper>
                </div>
            </div>
            {/*<button onClick={() => {*/}
            {/*    create();*/}
            {/*    console.log(chartOptions)*/}
            {/*    setOpen(!open)*/}
            {/*}}>ZZZZZZ</button>*/}
            <FormControl component="fieldset">
                {/*<FormLabel component="legend">labelPlacement</FormLabel>*/}
                <RadioGroup row aria-label="position" style={{marginLeft: 40}} name="position" onChange={changemode}
                            value={mode}>
                    <FormControlLabel
                        value="Free"
                        control={<Radio color="primary"/>}
                        label="Free"
                        labelPlacement="top"
                        // onClick={changemode}
                    />
                    <FormControlLabel
                        value="Zoom"
                        control={<Radio color="primary"/>}
                        label="Zoom"
                        labelPlacement="top"
                        // onClick={changemode}
                    />
                    <FormControlLabel
                        value="Mark"
                        control={<Radio color="primary"/>}
                        label="Mark"
                        labelPlacement="top"
                        // onClick={changemode}
                    />
                    {/*<FormControlLabel*/}
                    {/*    value="Click"*/}
                    {/*    control={<Radio color="primary" />}*/}
                    {/*    label="Click"*/}
                    {/*    labelPlacement="top"*/}
                    {/*    // onClick={changemode}*/}
                    {/*/>*/}
                    {/*<FormControlLabel value="end" control={<Radio color="primary" />} label="End" />*/}
                </RadioGroup>
            </FormControl>
            {/*<input type={'checkbox'} onChange={()=>{setLine(!line);}}/>*/}
            <Button style={{marginRight: 5}} variant="contained" color="primary"
                    onClick={() => setOpen(!open)}>TAG</Button>
            <Button style={{marginRight: 5}} variant="contained" color="primary" onClick={() => {
                const newOpt = {...chartOptions}
                newOpt.newX = undefined;
                newOpt.newY = undefined
                setChartOptions(newOpt)
                setMode('Free')
                setFull(!full)

                // reate()
            }}>FULL</Button>


            <Button style={{marginRight: 5}} variant="contained" color="secondary" onClick={() => {
                setChartOptions({
                    newY: undefined,
                    newX: undefined,
                    dataMax: undefined,
                    xAsis: undefined,
                    arr: undefined,
                    marks: undefined,
                    charts: []
                })
                setFull(!full)
            }}>RESET</Button>


        </div>
    )
}
