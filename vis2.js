
/////////// Define Helper Variables for Plotting /////////
parser = d3.timeParse("%Y-%m-%d %H:%M");

plotVars_vis2 = ({
    baseWidth: window.outerWidth,
    baseHeight: 600,
    marginTop: 40,
    marginLeft: 175 ,
    mapWidth: 500,
    width: 300,
    height: 150,
    mapMargin: 600,
    graphTopMargin: 0
  });

daysOfWeek = ({
    0: "Sunday",
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday"
  });

  months = ({
    "January": 0,
    "February": 1,
    "March": 2,
    "April": 3,
    "May": 4,
    "June": 5,
    "July": 6,
    "August": 7,
    "September": 8,
    "October": 9,
    "November": 10,
    "December": 11
  });

iso_colors = ({
    "caiso": "#f49f2f",
    "ercot": "#686868",
    "spp": "#9D8385",
    "miso": "#86D0C9",
    "pjm": "#F4915F",
    "nyiso": "#E15100",
    "isone": "#E1C605"
  });
//////////// Load the Data /////////////
// Load ISO LMP Data
all_iso_lmp = d3.csv('https://ninaprakash1.github.io/assets/cs448b-final-project/vis2/all_iso_lmp.csv', function (d) {
  return {
    date: parser(d.date),
    value: +d.value,
    iso_name: d.iso_name
  };
}).then(function (all_iso_lmp) {
    // Load ISO Load Data
    all_iso_load = d3.csv('https://ninaprakash1.github.io/assets/cs448b-final-project/vis2/all_iso_load.csv', function (d) {
        return {
            date: parser(d.date),
            value: +d.value,
            iso_name: d.iso_name
        };
        }).then(function(all_iso_load) {

            var year = 2017;
            var month = months["January"];
            var day = 1;
            var iso_name = "pjm";

            // Create the base SVG
            var svg_vis2 = d3.select("#vis2")
              .attr("width", plotVars_vis2.baseWidth)
              .attr("height", plotVars_vis2.baseHeight);

            // Add plot title //
            svg_vis2.append('text')
              .attr('x',window.outerWidth / 2)
              .attr('y',25)
              .text('US Daily Pricing and Load by ISO Region')
              .attr('text-anchor','middle')
              .attr('font-size','17px')

            ///////////////// IMPORT FONT ////////////////
            svg_vis2.append('defs')
            .append('style')
            .attr('type', 'text/css')
            .text("@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200&display=swap');");

            var dropdown_year = d3.select('#select-year')
            var dropdown_month = d3.select('#select-month')
            var dropdown_day = d3.select('#select-day')

            var years = ["2017","2018","2019","2020","2021"]
            var days = [...Array(31).keys()].map(x => x + 1)

            dropdown_year.selectAll('myOptions')
                      .data(years)
                      .enter()
                      .append('option')
                      .text(d => d)
                      .attr('font-family','Montserrat')
                      .attr('value', d => parseInt(d))

            dropdown_month.selectAll('myOptions')
                      .data(Object.keys(months))
                      .enter()
                      .append('option')
                      .text(d => d)
                      .attr('font-family','Montserrat')
                      .attr('value', d => months[d])
            
            dropdown_day.selectAll('myOptions')
                      .data(days)
                      .enter()
                      .append('option')
                      .text(d => d)
                      .attr('font-family','Montserrat')
                      .attr('value', d => parseInt(d))

            dropdown_year.on('change', function(d) {
                year = this.value;
                svg_vis2.selectAll('.loadGraph').remove();
                svg_vis2.selectAll('.priceGraph').remove();
                drawGraphs(year, month, day)
            });

            dropdown_month.on('change', function(d) {
              month = parseInt(this.value);
              svg_vis2.selectAll('.loadGraph').remove();
              svg_vis2.selectAll('.priceGraph').remove();
              drawGraphs(year, month, day);
            });

            dropdown_day.on('change', function(d) {
              day = this.value;
              svg_vis2.selectAll('.loadGraph').remove();
              svg_vis2.selectAll('.priceGraph').remove();
              drawGraphs(year, month, day);
            })

            /////////////// Draw the Map ///////////////
            var mapGroup = svg_vis2.append('g')
                            .attr('transform','translate(' + plotVars_vis2.marginLeft + ',50)')

            mapGroup.append("svg:image")
                .attr("xlink:href", "https://ninaprakash1.github.io/assets/cs448b-final-project/vis2/iso-map.png")
                .attr("width", plotVars_vis2.mapWidth)
                .attr('y',plotVars_vis2.marginTop)

            mapGroup.append('text')
                .attr('x',plotVars_vis2.mapWidth / 2)
                .attr('y', 475)
                .attr('text-anchor','middle')
                .text('Map image source: https://sustainableferc.org')
                .attr('font-size','10px')
                    
            // Add buttons to select an ISO region (manual)
            mapGroup.append('rect') // CAISO
                .attr('x',plotVars_vis2.mapWidth * 0.05 - 5)
                .attr('y',plotVars_vis2.marginTop + 168)
                .attr('width',50)
                .attr('height',25)
                .attr('opacity',0)
                .on('click',handleCAISOClick);
        
            mapGroup.append('rect') // ERCOT
                .attr('x',plotVars_vis2.mapWidth / 2 - 38)
                .attr('y',plotVars_vis2.marginTop + 240)
                .attr('width',40)
                .attr('height',15)
                .attr('opacity',0)
                .on('click',handleERCOTClick);
        
            mapGroup.append('rect') // SPP
                .attr('x',plotVars_vis2.mapWidth / 2 - 41)
                .attr('y',plotVars_vis2.marginTop + 155)
                .attr('width',50)
                .attr('height',20)
                .attr('opacity',0)
                .on('click',handleSPPClick);
        
            mapGroup.append('rect') // PJM
                .attr('x',plotVars_vis2.mapWidth * 3/4 - 20)
                .attr('y',plotVars_vis2.marginTop + 105)
                .attr('width',70)
                .attr('height',20)
                .attr('opacity',0)
                .on('click',handlePJMClick);
            
            mapGroup.append('rect') // MISO
                .attr('x',plotVars_vis2.mapWidth / 2 - 3)
                .attr('y',plotVars_vis2.marginTop + 85)
                .attr('width',60)
                .attr('height',20)
                .attr('opacity',0)
                .on('click',handleMISOClick);
        
            mapGroup.append('rect') // ISONE
                .attr('x',plotVars_vis2.mapWidth * 3 / 4 + 47)
                .attr('y',plotVars_vis2.marginTop + 43)
                .attr('width',55)
                .attr('height',20)
                .attr('opacity',0)
                .on('click',handleISONEClick);
        
            mapGroup.append('rect') // NYISO
                .attr('x',plotVars_vis2.mapWidth * 3 / 4 + 13)
                .attr('y',plotVars_vis2.marginTop + 70)
                .attr('width',40)
                .attr('height',18)
                .attr('opacity',0)
                .on('click',handleNYISOClick);

            function handleCAISOClick(d,i) {
                console.log('clicked caiso');
                iso_name = "caiso";
            
                // Clear old graphs and replot
                svg_vis2.selectAll('.loadGraph').remove();
                svg_vis2.selectAll('.priceGraph').remove();
                drawGraphs(year, month, day);
              }
            
            function handleERCOTClick(d,i) {
                console.log('clicked ercot');
                iso_name = "ercot";
            
                // Clear old graphs and replot
                svg_vis2.selectAll('.loadGraph').remove();
                svg_vis2.selectAll('.priceGraph').remove();
                drawGraphs(year, month, day);
              }
            
            function handleISONEClick(d,i) {
                console.log('clicked isone');
                iso_name = "isone";
            
                // Clear old graphs and replot
                svg_vis2.selectAll('.loadGraph').remove();
                svg_vis2.selectAll('.priceGraph').remove();
                drawGraphs(year, month, day);
              }
            
            function handleMISOClick(d,i) {
                console.log('clicked miso');
                iso_name = "miso";
            
                // Clear old graphs and replot
                svg_vis2.selectAll('.loadGraph').remove();
                svg_vis2.selectAll('.priceGraph').remove();
                drawGraphs(year, month, day);
              }
            
            function handleNYISOClick(d,i) {
                console.log('clicked nyiso');
                iso_name = "nyiso";
            
                // Clear old graphs and replot
                svg_vis2.selectAll('.loadGraph').remove();
                svg_vis2.selectAll('.priceGraph').remove();
                drawGraphs(year, month, day);
              }
            
            function handlePJMClick(d,i) {
                console.log('clicked pjm');
                iso_name = "pjm";
            
                // Clear old graphs and replot
                svg_vis2.selectAll('.loadGraph').remove();
                svg_vis2.selectAll('.priceGraph').remove();
                drawGraphs(year, month, day);
              }
            
            function handleSPPClick(d,i) {
                console.log('clicked spp');
                iso_name = "spp";
            
                // Clear old graphs and replot
                svg_vis2.selectAll('.loadGraph').remove();
                svg_vis2.selectAll('.priceGraph').remove();
                drawGraphs(year, month, day);
              }
        
            //////////////// INSTRUCTIONS ///////////////////
            mapGroup.append('text')
                .attr('x',plotVars_vis2.mapWidth / 2)
                .attr('y',plotVars_vis2.marginTop + 150 + 200)
                .attr('font-size','12px')
                .attr('text-anchor','middle')
                .text('Select a date to see 24-hour load and LMP.')
                .attr('font-family','Montserrat')
            mapGroup.append('text')
                .attr('x',plotVars_vis2.mapWidth /2)
                .attr('y',plotVars_vis2.marginTop + 150 + 225)
                .attr('font-size','12px')
                .attr('text-anchor','middle')
                .text('Select an ISO name on the map to see data for that region.')
                .attr('font-family','Montserrat')

            function drawGraphs(year, month, day) {

                // Filter for that date
                var load_filtered = all_iso_load.filter(d => d.date.getFullYear() == year & d.date.getMonth() == month & d.date.getDate() == day & d.iso_name == iso_name);
                if (load_filtered.length == 0) { console.log('load is 0'); }
              
                var lmp_filtered = all_iso_lmp.filter(d => d.date.getFullYear() == year & d.date.getMonth() == month & d.date.getDate() == day & d.iso_name == iso_name);
                if (lmp_filtered.length == 0) { console.log('lmp is 0'); }
              
                var loadGroup = svg_vis2.append('g').attr('class','loadGraph').attr('transform','translate(' + plotVars_vis2.mapMargin + `,${plotVars_vis2.graphTopMargin + 50})`)
              
                // Make x axis
                  var xLoad = d3.scaleTime()
                    .domain(d3.extent(load_filtered, function(d) { return d.date; }))
                    .range([ 0, plotVars_vis2.width ]);
                
                  loadGroup.append("g")
                    .attr("transform", "translate(" + plotVars_vis2.marginLeft + "," + (plotVars_vis2.marginTop + plotVars_vis2.height) + ")")
                    .call(d3.axisBottom(xLoad).tickFormat(d3.timeFormat("%-I%-p")));
              
                  // Make y axis
                  var yLoad = d3.scaleLinear()
                    .domain([0, d3.max(load_filtered, function(d) { return +d.value; })])
                    .range([ plotVars_vis2.height, 0 ]);
                
                  loadGroup.append("g")
                    .attr("transform", "translate(" + plotVars_vis2.marginLeft + "," + plotVars_vis2.marginTop + ")")
                    .call(d3.axisLeft(yLoad));
              
                // Define an area function
                var areaLoad = d3.area()
                  .x(function(d) { return xLoad(d.date); })
                  .y0(plotVars_vis2.height)
                  .y1(function(d) { return yLoad(d.value); })
              
                  // Add the line
                const line = loadGroup.append("path")
                    .datum(load_filtered)
                    .attr("fill", iso_colors[iso_name])
                    .attr("stroke", "black")
                    .attr("stroke-width", 1)
                    .attr('opacity',0.8)
                    .attr("d", areaLoad)
                  .attr("transform","translate(" + plotVars_vis2.marginLeft + "," + plotVars_vis2.marginTop + ")")
              
                // Add axis titles
                const xAxisLabel = loadGroup.append("text")
                  .attr("transform", `translate(${(plotVars_vis2.marginLeft + plotVars_vis2.width/2)}, ${plotVars_vis2.marginTop + plotVars_vis2.height + 40})`)
                  .style("text-anchor", "middle")
                  .attr('font-size','15px')
                  .text("Time of Day");
                
                const yAxisLabel = loadGroup.append("text")
                  .attr("transform", "rotate(-90)")
                  .attr("y", plotVars_vis2.marginLeft - 55)
                  .attr("x", - plotVars_vis2.height / 2 - plotVars_vis2.marginTop)
                  .style("text-anchor", "middle")
                  .attr('font-size','15px')
                  .text("Load (MW)"); 
              
                const loadTitle = loadGroup.append("text")
                  .attr("x", plotVars_vis2.marginLeft + plotVars_vis2.width / 2)
                  .attr("y", plotVars_vis2.marginTop - 10)
                  .style("text-anchor", "middle")
                  .attr('font-size','15px')
                  .text(function (d) {
                    if (load_filtered.length == 0) {
                      return `${iso_name.toUpperCase()} Energy Load on ${year}-${(month+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
                    }
                    else {
                      return `${iso_name.toUpperCase()} Energy Load on ${daysOfWeek[load_filtered[0].date.getDay()]}, ${year}-${(month+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
                    }
                  
                  });
              
                  if (load_filtered.length == 0) {
                  loadGroup.append('text')
                    .attr('x', plotVars_vis2.marginLeft + plotVars_vis2.width / 2)
                    .attr('y', plotVars_vis2.marginTop + plotVars_vis2.height / 2)
                    .attr('text-anchor','middle')
                    .attr('font-weight','lighter')
                    .text('--- Data unavailable ---')
                    .attr('font-size','12px')
                }
              
                //////////// PLOT PRICE DATA //////////////////
              
                var priceGroup = svg_vis2.append('g').attr('class','priceGraph').attr('transform', 'translate(' + plotVars_vis2.mapMargin + `,${plotVars_vis2.graphTopMargin + 225 + 50})`)
              
                  // Make x axis
                    var xLMP = d3.scaleTime()
                      .domain(d3.extent(lmp_filtered, function(d) { return d.date; }))
                      .range([ 0, plotVars_vis2.width ]);
                  
                    priceGroup.append("g")
                      .attr("transform", "translate(" + plotVars_vis2.marginLeft + "," + (plotVars_vis2.marginTop + plotVars_vis2.height) + ")")
                      .call(d3.axisBottom(xLMP).tickFormat(d3.timeFormat("%-I%-p")));
                
                    // Make y axis
                    var yLMP = d3.scaleLinear()
                      .domain([Math.min(0, d3.min(lmp_filtered, function(d) {return +d.value})), d3.max(lmp_filtered, function(d) { return +d.value; })])
                      .range([ plotVars_vis2.height, 0 ]);
                  
                    priceGroup.append("g")
                      .attr("transform", "translate(" + plotVars_vis2.marginLeft + "," + plotVars_vis2.marginTop + ")")
                      .call(d3.axisLeft(yLMP));
                
                  // Define an area function
                  var areaLMP = d3.area()
                    .x(function(d) { return xLMP(d.date); })
                    .y0(plotVars_vis2.height)
                    .y1(function(d) { return yLMP(d.value); })
                
                    // Add the line
                  const linePrice = priceGroup.append("path")
                      .datum(lmp_filtered)
                      .attr("fill", iso_colors[iso_name])
                      .attr("stroke", "black")
                      .attr("stroke-width", 1)
                      .attr('opacity',0.8)
                      .attr("d", areaLMP)
                    .attr("transform","translate(" + plotVars_vis2.marginLeft + "," + plotVars_vis2.marginTop + ")")
                
                
                  if (lmp_filtered.length != 0 & Math.min(0, d3.min(lmp_filtered,function(d) {return +d.value})) < 0) {
                    // Draw 0 line
                    console.log('x1', xLMP(plotVars_vis2.marginLeft))
                    console.log('y1', yLMP(plotVars_vis2.marginTop))
                    console.log('x2', xLMP(plotVars_vis2.marginLeft + d3.max(lmp_filtered, function(d) { return +d.value; })))
                    console.log('y2', yLMP(plotVars_vis2.marginTop))
                    priceGroup.append("svg:line")
                      .attr("x1", plotVars_vis2.marginLeft)
                      .attr("y1", plotVars_vis2.marginTop + yLMP(0))
                      .attr("x2", plotVars_vis2.marginLeft + plotVars_vis2.width)
                      .attr("y2", plotVars_vis2.marginTop + yLMP(0))
                      .style("stroke-dasharray", ("3, 3"))
                      .style("stroke", 'red');
                  }
              
                // Add axis titles
                priceGroup.append("text")
                  .attr("transform", `translate(${(plotVars_vis2.marginLeft + plotVars_vis2.width/2)}, ${plotVars_vis2.marginTop + plotVars_vis2.height + 40})`)
                  .style("text-anchor", "middle")
                  .attr('font-size','15px')
                  .text("Time of Day");
                
                priceGroup.append("text")
                  .attr("transform", "rotate(-90)")
                  .attr("y", plotVars_vis2.marginLeft - 55)
                  .attr("x", - plotVars_vis2.height / 2 - plotVars_vis2.marginTop)
                  .style("text-anchor", "middle")
                  .attr('font-size','15px')
                  .text("LMP ($)"); 
              
                priceGroup.append("text")
                  .attr("x", plotVars_vis2.marginLeft + plotVars_vis2.width / 2)
                  .attr("y", plotVars_vis2.marginTop - 10)
                  .style("text-anchor", "middle")
                  .attr('font-size','15px')
                  .text(function (d) {
                    if (lmp_filtered.length == 0) {
                        return `${iso_name.toUpperCase()} Energy LMP on ${year}-${(month+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
                    }
                    else {
                      return `${iso_name.toUpperCase()} Energy LMP on ${daysOfWeek[lmp_filtered[0].date.getDay()]}, ${year}-${(month+1).toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
                    }
                  });
              
                if (lmp_filtered.length == 0) {
                  priceGroup.append('text')
                    .attr('x', plotVars_vis2.marginLeft + plotVars_vis2.width / 2)
                    .attr('y', plotVars_vis2.marginTop + plotVars_vis2.height / 2)
                    .attr('text-anchor','middle')
                    .attr('font-weight','lighter')
                    .text('--- Data unavailable ---')
                    .attr('font-size','12px')
                }
              
                  svg_vis2.selectAll('text').attr('font-family','Montserrat');
            
              }
                
              drawGraphs(year, month, day);

    // END OF NESTED THEN
    return all_iso_lmp, all_iso_load;
})
})