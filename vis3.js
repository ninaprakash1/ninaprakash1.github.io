///////// Define Variables to help Plot //////////

// Define parser to load outage data
parser_date = d3.timeParse('%m/%d/%Y %_I:%M%p')

// Define colors for plotting
colors = ({
    'Severe Weather': '#E15100',
    'Physical Attack':  '#686868',
    'Cyber Attack': '#9D8385',
    'Fuel Supply Emergency': '#86D0C9',
    'Load Shedding': '#E1C605',
    'Voltage Reduction': 'pink',
    'Islanding': '#F4915F',
    'Equipment Failure': 'black',
    'Unknown': '#f49f2f'
  });

// Define maximum number of customers (after filtering for NaN, '', Unknown, etc.)
max_num_customers = 4645572

// Define spacing variables
plotVars_vis3 = ({
    mapWidth: 960,
    mapHeight: 600,
    sliderDistance: 75,
    minCircleSize: 10,
    maxCircleSize: 100,
    legendVertSpace: 30,
    legendHorizSpace: 20,
    legendCircleRadius: 10,
    scatterHeight: 600,
    scatterOutlierHeight: 100,
    scatterWidth: 600,
    scatterLeftMargin: 1150,
    scatterTopMargin: 200 + 50,
    backgroundOpacity: 0.02,
    scatterMax: 500000
  });

// Define vertical spacing for color legend
legend_spacing = [
    {'name': 'Severe Weather',  'cy': 0, 'color': colors['Severe Weather']},
    {'name': 'Physical Attack', 'cy': plotVars_vis3.legendVertSpace, 'color': colors['Physical Attack']},
    {'name': 'Cyber Attack', 'cy': plotVars_vis3.legendVertSpace*2, 'color': colors['Cyber Attack']},
    {'name': 'Fuel Supply Emergency', 'cy': plotVars_vis3.legendVertSpace*3, 'color': colors['Fuel Supply Emergency']},
    {'name': 'Load Shedding', 'cy': plotVars_vis3.legendVertSpace*4, 'color': colors['Load Shedding']},
    {'name': 'Voltage Reduction', 'cy': plotVars_vis3.legendVertSpace*5, 'color': colors['Voltage Reduction']},
    {'name': 'Islanding', 'cy': plotVars_vis3.legendVertSpace*6, 'color': colors['Islanding']},
    {'name': 'Equipment Failure', 'cy': plotVars_vis3.legendVertSpace*7, 'color': colors['Equipment Failure']},
    {'name': 'Unknown', 'cy': plotVars_vis3.legendVertSpace*8, 'color': colors['Unknown']}
  ];

// Define a projection for plotting on map
projection = d3.geoAlbersUsa().scale(1260).translate([plotVars_vis3.mapWidth / 2, plotVars_vis3.mapHeight / 2 + 50]); // CHANGED THIS

// Define a formatter for hovering over scatter plot
formatter = d3.timeFormat("%m/%d/%Y")

// Define scale for circle radii on map
sizeScale = d3.scaleSqrt()
  .domain([0.01, max_num_customers])
  .range([plotVars_vis3.minCircleSize, plotVars_vis3.maxCircleSize]);

// Define data for circle size legend
size_legend_data = [
  {r: sizeScale(10), cx: -75, cy: 225, text: '10'},
  {r: sizeScale(100000), cx: -75, cy: 300, text: '100k'},
  {r: sizeScale(1000000), cx: -75,cy: 425, text: '1000k'}
]

// Define y_axis scale for scatter plot
y = d3.scaleLinear()
  .domain([0, plotVars_vis3.scatterMax])
  .range([plotVars_vis3.scatterHeight,0])
  .nice()

// Define second y-axis for outliers
y_outlier = d3.scaleLinear()
  .domain([plotVars_vis3.scatterMax, max_num_customers])
  .range([plotVars_vis3.scatterOutlierHeight,0])
  .nice()

//////// Load Data //////////////
// Load data
outage_data = d3.csv("https://ninaprakash1.github.io/assets/cs448b-final-project/vis3/grid_disruption_database_coords_datetime.csv", function (d) {
  return {
    event_description: d['Event Description'],
    year: +d.Year,
    begin_date: d['Date Event Began'],
    begin_time: d['Time Event Began'],
    restoration_date: d['Date of Restoration'],
    restoration_time: d['Time of Restoration'],
    respondent: d.Respondent,
    location: d['Geographic Areas'],
    demand_loss: +d['Demand Loss (MW)'],
    num_customers: d['Number of Customers Affected'],
    tags: d.tags,
    lat: +d.lat,
    lon: +d.lon,
    datetime: parser_date(d.datetime)
  }
}).then(function(outage_data) { 
    outage_data = outage_data.filter(d => d.num_customers != ""
                    & d.num_customers != "unknown"
                    & d.datetime != null
                    & ! isNaN(parseInt(d.num_customers))
                    & d.location != "Puerto Rico")

    outage_data.forEach(row => row.num_customers = parseInt((row.num_customers).replace(/,/g,'')));

    us_map = d3.json("https://cdn.jsdelivr.net/npm/us-atlas@1/us/10m.json").then(function(us_map) {

        ///////////////// PLOT THE MAP ////////////////

        us_map.objects.lower48 = {
            type: "GeometryCollection",
            geometries: us_map.objects.states.geometries
            };

        const svg_vis3 = plotBaseMapVis3(us_map);

        ///////////////// IMPORT FONT ////////////////
        svg_vis3.append('defs')
        .append('style')
        .attr('type', 'text/css')
        .text("@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200&display=swap');");

        /// Add plot title //
        svg_vis3.append('text')
            .attr('x',window.outerWidth / 2 + 40)
            .attr('y',50)
            .text('Major US Grid Outages from 2000 - 2014')
            .attr('font-family','Montserrat')
            .attr('text-anchor','start')
            .attr('font-size','30px')

        ///////////// PLOT THE SLIDER /////////////
        var currentValue = 164; // pixel location on sliders. Start at Oct 2002


        ///////////////// PLOT SCATTER PLOT //////////////////

        startDate = d3.extent(outage_data, function(d) { return d.datetime; })[0]
        endDate = d3.extent(outage_data, function(d) { return d.datetime; })[1]
        x_axis = d3.scaleTime()
            .domain([startDate, endDate])
            .range([0, plotVars_vis3.scatterWidth])
        x_slider = d3.scaleTime()
            .domain([startDate, endDate])
            .range([0, plotVars_vis3.mapWidth - 100])
            .clamp(true);

        var scatterGroup = svg_vis3.append('g').attr('transform','translate(' + plotVars_vis3.scatterLeftMargin + ',' + plotVars_vis3.scatterTopMargin + ')')

        // Add x-axis
        var xaxis = svg_vis3.append('g')
            .attr('transform', `translate(${plotVars_vis3.scatterLeftMargin}, ${plotVars_vis3.scatterTopMargin + plotVars_vis3.scatterHeight})`)
            .style('font-family','Montserrat').style('font-size','20px')
            .call(d3.axisBottom(x_axis))
            .append('text')
            .attr('transform', `translate(${plotVars_vis3.scatterWidth / 2}, 70)`)
            .attr('text-anchor', 'middle')
            .attr('fill', 'black')
            .text('Date of Event');

        // Add y-axis
        var yaxis = svg_vis3.append('g')
            .attr('transform', `translate(${plotVars_vis3.scatterLeftMargin}, ${plotVars_vis3.scatterTopMargin})`)
            .style('font-family','Montserrat').style('font-size','20px')
            .call(d3.axisLeft(y))
            .append('text')
            .attr('transform', `translate(-115, ${plotVars_vis3.scatterHeight / 2 - 75}) rotate(-90)`)
            .attr('text-anchor', 'middle')
            .attr('fill', 'black')
            .text('Number of Customers Affected');

        // Add secondary y-axis
        var yaxis_outlier = svg_vis3.append('g')
          .attr('transform', `translate(${plotVars_vis3.scatterLeftMargin}, ${plotVars_vis3.scatterTopMargin - plotVars_vis3.scatterOutlierHeight - 25})`)
          .style('font-family','Montserrat').style('font-size','20px')
          .call(d3.axisLeft(y_outlier).ticks(3))
          
        // Add base line for outlier plot
        svg_vis3.append('line')
            .attr('x1',plotVars_vis3.scatterLeftMargin)
            .attr('y1', plotVars_vis3.scatterTopMargin - 25)
            .attr('x2',plotVars_vis3.scatterLeftMargin + plotVars_vis3.scatterWidth)
            .attr('y2',plotVars_vis3.scatterTopMargin - 25)
            .attr('stroke','grey')
            .attr('stroke-dasharray','3,3')
            .raise()

        // Add top line for scatter plot
        svg_vis3.append('line')
            .attr('x1',plotVars_vis3.scatterLeftMargin)
            .attr('y1', plotVars_vis3.scatterTopMargin)
            .attr('x2',plotVars_vis3.scatterLeftMargin + plotVars_vis3.scatterWidth)
            .attr('y2',plotVars_vis3.scatterTopMargin)
            .attr('stroke','grey')
            .attr('stroke-dasharray','3,3')
            .raise()

        // Add top line for outlier plot
        svg_vis3.append('line')
            .attr('x1',plotVars_vis3.scatterLeftMargin)
            .attr('y1',plotVars_vis3.scatterTopMargin - 25 - plotVars_vis3.scatterOutlierHeight)
            .attr('x2',plotVars_vis3.scatterLeftMargin + plotVars_vis3.scatterWidth)
            .attr('y2',plotVars_vis3.scatterTopMargin - 25 - plotVars_vis3.scatterOutlierHeight)
            .attr('stroke','black')

        // Add right line on main scatter plot
        svg_vis3.append('line')
            .attr('x1',plotVars_vis3.scatterLeftMargin + plotVars_vis3.scatterWidth)
            .attr('y1',plotVars_vis3.scatterTopMargin + plotVars_vis3.scatterHeight)
            .attr('x2',plotVars_vis3.scatterLeftMargin + plotVars_vis3.scatterWidth)
            .attr('y2',plotVars_vis3.scatterTopMargin)
            .attr('stroke','black')

        // Add right line on outlier plot
        svg_vis3.append('line')
          .attr('x1',plotVars_vis3.scatterLeftMargin + plotVars_vis3.scatterWidth)
          .attr('y1',plotVars_vis3.scatterTopMargin - 25)
          .attr('x2',plotVars_vis3.scatterLeftMargin + plotVars_vis3.scatterWidth)
          .attr('y2',plotVars_vis3.scatterTopMargin - 25 - plotVars_vis3.scatterOutlierHeight)
          .attr('stroke','black')

        var max_foo = 100;

        // Plot the points
        scatterGroup.selectAll('circle-scatter')
            .attr('class','circle.scatter')
            .data(outage_data)
            .join('circle')
            .attr('r',10)
            .attr('cx', d => x_axis(d.datetime))
            .attr('cy', function(d) {
              if (d.num_customers > max_foo) {
                max_foo = d.num_customers;
                console.log(max_foo);
              }
              if (parseInt(d.num_customers) > plotVars_vis3.scatterMax) {
                return y_outlier(parseInt(d.num_customers)) - 25 - plotVars_vis3.scatterOutlierHeight;
              }
              else {
                return y(parseInt(d.num_customers));
              }
            })
            .attr('fill', function (d) {
                return colors[data_descriptions[d.event_description]];
            })
            .attr('opacity', function (d) {
                if (matches(d.datetime, x_slider.invert(currentValue))) {
                    return 0.9;
                }
                else {
                    return plotVars_vis3.backgroundOpacity;
                }
            })
        .on('mouseover',handleScatterHoverOn)
        .on('mouseout',handleScatterHoverOff)

        function handleScatterHoverOn(event,d){
            if (x_axis(d.datetime) + 40 < plotVars_vis3.scatterLeftMargin + plotVars_vis3.scatterWidth - 400) {
                var x_anchor = x_axis(d.datetime) + 60;
                var anchor = 'start';
            }
            else {
                var x_anchor = x_axis(d.datetime)[0] - 60;
                var anchor = 'end';
            }
            if (parseInt(d.num_customers) > plotVars_vis3.scatterMax) {
              var fn = y_outlier;
              var shift = -plotVars_vis3.scatterOutlierHeight - 25;
            }
            else { var fn = y; var shift = 0;}
            scatterGroup.append('text')
                .attr('class', 'scatterLabel')
                .attr('x', x_anchor)
                .attr('y', fn(parseInt(d.num_customers)) - 23 + shift)
                .attr('font-family', 'Montserrat')
                .attr('font-weight', 'bold')
                .attr('font-size','16px')
                .attr('fill','black')
                .attr('text-anchor',anchor)
                .text(d.event_description);
            scatterGroup.append('text')
                .attr('class', 'scatterLabel')
                .attr('x', x_anchor)
                .attr('y', fn(parseInt(d.num_customers)) + 2 + shift)
                .attr('font-family', 'Montserrat')
                .attr('font-weight', 'bold')
                .attr('font-size','16px')
                .attr('fill','black')
                .attr('text-anchor',anchor)
                .text(parseInt(d.num_customers).toString() + ' Customers Affected');
            scatterGroup.append('text')
                .attr('class', 'scatterLabel')
                .attr('x', x_anchor)
                .attr('y', fn(parseInt(d.num_customers)) + 25 + shift)
                .attr('font-family', 'Montserrat')
                .attr('font-weight', 'bold')
                .attr('font-size','16px')
                .attr('fill','black')
                .attr('text-anchor',anchor)
                .text(d.location);
            scatterGroup.append('text')
                .attr('class', 'scatterLabel')
                .attr('x', x_anchor)
                .attr('y', fn(parseInt(d.num_customers)) + 50 + shift)
                .attr('font-family', 'Montserrat')
                .attr('font-weight', 'bold')
                .attr('font-size','16px')
                .attr('fill','black')
                .attr('text-anchor',anchor)
                .text('Occurred on ' + formatter(d.datetime));
        }

        function handleScatterHoverOff(event,d){
            scatterGroup.selectAll('.scatterLabel').remove();
        }

        var outageGroup = svg_vis3.append('g').attr('transform','translate(0,0)')

        var max_n_cust = 0;

        // Helper function to resize the circles based on number of customers affected
        function resizeOutages() {
          outageGroup.selectAll('circle')
            .attr('r', function (d) {
              if (matches(d.datetime, x_slider.invert(currentValue))) {
                let n_cust = parseInt(d.num_customers);
                if (n_cust > max_n_cust) { max_n_cust = n_cust;}
                if (isNaN(n_cust)) {return 0;}
                if (n_cust == 0) { return plotVars_vis3.minCircleSize; }
                else {
                  return sizeScale(n_cust);
                }
              }
              else { return 0; }
            })

          scatterGroup.selectAll('circle')
          .attr('opacity', function (d) {
              if (matches(d.datetime, x_slider.invert(currentValue))) {
                return 0.9;
              }
              else {
                return plotVars_vis3.backgroundOpacity;
              }
          })
        }
        
        // Add a circle size legend
        //var circleSizeLegend = svg.append('g')

        svg_vis3.selectAll('circle.size-legend')
          .attr('class', 'circle-legend')
          .data(size_legend_data)
          .enter()
          .append('circle')
          .attr('r', function(d) { console.log(d.r); return d.r; })
          .attr('cx', d => d.cx)
          .attr('cy', d => d.cy)
          .attr('fill','grey')
          .attr('opacity',0.15)

        svg_vis3.selectAll('text.size-legend')
          .attr('class','circle-legend')
          .data(size_legend_data)
          .enter()
          .append('text')
          .text(d => d.text)
          .attr('x', d => d.cx)
          .attr('y', d => d.cy - d.r - 10)
          .attr('text-anchor','middle')
          .attr('font-family','Montserrat')

        svg_vis3.append('text')
          .attr('x', -75)
          .attr('y', 135)
          .attr('text-anchor','middle')
          .text('Num Customers')
          .attr('font-family','Montserrat')

        svg_vis3.append('text')
          .attr('x', -75)
          .attr('y', 160)
          .attr('text-anchor','middle')
          .text('Affected')
          .attr('font-family','Montserrat')

        // Add the outage circles on the map
        outageGroup.selectAll('circle.outages')
          .attr('class', 'circle-outages')
          .data(outage_data)
          .enter()
          .append('circle')
          .attr('r', function (d) {
            if (matches(d.datetime, x_slider.invert(currentValue))) {
              let n_cust = parseInt(d.num_customers);
              if (n_cust > max_n_cust) { max_n_cust = n_cust;}
              if (isNaN(n_cust)) {return 0;}
              if (n_cust == 0) { return plotVars_vis3.minCircleSize; }
              else {
                return sizeScale(n_cust);
              }
            }
            else { return 0; }
          })
          .attr('cx', function (d) {
            var lon_lat = {0: d.lon, 1: d.lat};
            if (projection(lon_lat) == null) { return -10; }
            else {return projection(lon_lat)[0]};
          })
          .attr('cy',function (d) {
            var lon_lat = {0: d.lon, 1: d.lat};
            if (projection(lon_lat) == null) { return -10; }
            else {return projection(lon_lat)[1]};
          })
          .attr('fill', function (d) {
            if (d.datetime == null) { return 'white'; }
            else {
                return colors[data_descriptions[d.event_description]];
            }
          })
          .attr('opacity',0.9)
          .on('mouseover', handleOutageHoverOn)
          .on('mouseout', handleOutageHoverOff);

        function handleOutageHoverOn(event, d) {
          if (projection({0: d.lon, 1: d.lat})[0] + 40 < plotVars_vis3.mapWidth - 400) {
            var x_anchor = projection({0: d.lon, 1: d.lat})[0] + 40;
            var anchor = 'start';
          }
          else {
            var x_anchor = projection({0: d.lon, 1: d.lat})[0] - 40;
            var anchor = 'end';
          }
          svg_vis3.append('text')
            .attr('class', 'ptLabel')
            .attr('x', x_anchor)
            .attr('y', projection({0: d.lon, 1: d.lat})[1] - 23)
            .attr('font-family', 'Montserrat')
            .attr('font-weight', 'bold')
            .attr('font-size','16px')
            .attr('fill','black')
            .attr('text-anchor',anchor)
            .text(d.event_description);
          svg_vis3.append('text')
            .attr('class', 'ptLabel')
            .attr('x', x_anchor)
            .attr('y', projection({0: d.lon, 1: d.lat})[1] + 2)
            .attr('font-family', 'Montserrat')
            .attr('font-weight', 'bold')
            .attr('font-size','16px')
            .attr('fill','black')
            .attr('text-anchor',anchor)
            .text(d.num_customers + ' Customers Affected');
          svg_vis3.append('text')
                .attr('class', 'ptLabel')
                .attr('x', x_anchor)
                .attr('y', projection({0: d.lon, 1: d.lat})[1] + 25)
                .attr('font-family', 'Montserrat')
                .attr('font-weight', 'bold')
                .attr('font-size','16px')
                .attr('fill','black')
                .attr('text-anchor',anchor)
                .text(d.location);
          svg_vis3.append('text')
                .attr('class', 'ptLabel')
                .attr('x', x_anchor)
                .attr('y', projection({0: d.lon, 1: d.lat})[1] + 50)
                .attr('font-family', 'Montserrat')
                .attr('font-weight', 'bold')
                .attr('font-size','16px')
                .attr('fill','black')
                .attr('text-anchor',anchor)
                .text('Occurred on ' + formatter(d.datetime));
        }

        function handleOutageHoverOff(event, d) {
          svg_vis3.selectAll('.ptLabel').remove();
        }

        //////////////// LEGEND //////////////////
        var legend = svg_vis3.append('g').attr('transform',`translate(${plotVars_vis3.scatterLeftMargin + plotVars_vis3.scatterWidth + 100},200)`)

        legend.selectAll('circle.legend')
          .data(legend_spacing)
          .enter()
          .append('circle')
          .attr('r',plotVars_vis3.legendCircleRadius)
          .attr('cx',0)
          .attr('cy',d => d.cy)
          .attr('fill',d => d.color)
          .attr('opacity',0.9)

        legend.selectAll('text.legend')
          .data(legend_spacing)
          .enter()
          .append('text')
          .attr('x',plotVars_vis3.legendHorizSpace)
          .attr('y',d => d.cy)
          .text(d => d.name)
          .attr('font-family','Montserrat')
          .attr('font-size','20px')

        ////////// Instructions ///////////////
        svg_vis3.append('text')
          .attr('x', 50 + x_slider.range()[1] / 2)
          .attr('y', plotVars_vis3.mapHeight + 230)
          .text('Use the slider to see major grid outages over time.')
          .attr('font-family','Montserrat')
          .attr('font-size','23px')
          .attr('text-anchor','middle')

        svg_vis3.append('text')
          .attr('x', 50 + x_slider.range()[1] / 2)
          .attr('y', plotVars_vis3.mapHeight + 280)
          .text('Hover to see more information about each outage.')
          .attr('font-family','Montserrat')
          .attr('font-size','23px')
          .attr('text-anchor','middle')

        //////////////// SLIDER //////////////////
        // Citation: https://d19jftygre6gh0.cloudfront.net/officeofjane/47d2b0bfeecfcb41d2212d06d095c763
        
        var slider = svg_vis3.append("g")
            .attr("class", "slider")
            .attr("transform", "translate(50,50)");

        // Add the line
        slider.append('line')
          .attr('x1', x_slider.range()[0])
          .attr('x2', x_slider.range()[1])
          .attr('y1', plotVars_vis3.mapHeight + 75)
          .attr('y2', plotVars_vis3.mapHeight + 75)
          .style('stroke-width',20)
          .style('stroke','gainsboro')
          .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-inset")
          .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "track-overlay")
            .call(d3.drag()
                .on("start.interrupt", function() { slider.interrupt(); })
                .on("start drag", function(event,d) {
                  currentValue = event.x;      // Get the new current value
                  update(x_slider.invert(currentValue)); // Update the label
                  resizeOutages();
                })
            );

        function matches(item_dt, curr_val_dt) {
          return item_dt.getFullYear() == curr_val_dt.getFullYear()
                  & item_dt.getMonth() == curr_val_dt.getMonth();
        }

        function update(h) {
          // update position and text of label according to slider scale
          handle.attr("cx", x_slider(h)).raise();
          label.attr("x", x_slider(h))
            .text(d3.timeFormat("%b %Y")(h));
      }

        // Add ticks
        slider.insert("g", ".track-overlay")
          .attr("class", "ticks")
          .selectAll("text")
          .data(x_slider.ticks(10))
          .enter()
          .append("text")
          .attr("x", x_slider)
          .attr("y", plotVars_vis3.mapHeight + plotVars_vis3.sliderDistance + 35)
          .attr("text-anchor", "middle")
          .attr('font-family','Montserrat')
          .attr('font-weight','bold')
          .text(function(d) {return d3.timeFormat("%Y")(d); });

        // Add label while sliding
        var label = slider.append("text")  
          .attr("class", "label")
          .attr('x',currentValue)
          .attr('y',plotVars_vis3.mapHeight + plotVars_vis3.sliderDistance - 5)
          .attr('font-family','Montserrat')
          .attr('font-weight','bold')
          .attr("text-anchor", "middle")
          .text(d3.timeFormat("%b %Y")(x_slider.invert(currentValue)))
          .attr("transform", "translate(0," + (-25) + ")")

        // Add the handle
        var handle = slider.insert("circle", ".track-overlay")
          .attr("class", "handle")
          .attr('cx',currentValue)
          .attr('cy',plotVars_vis3.mapHeight + plotVars_vis3.sliderDistance)
          .attr("r", 9)
          .raise();


      })
      })

      function plotBaseMapVis3(us_map) {
          const svg_vis3 = d3.select('#vis3')
          .attr("viewBox", [-window.outerWidth / 2 + 200, 0, 2750, 900])

          svg_vis3.append("path")
          .datum(topojson.merge(us_map, us_map.objects.lower48.geometries))
          .attr("fill", "#ddd")
          .attr("d", d3.geoPath())
          .attr('transform','translate(0,50)');

          svg_vis3.append("path")
          .datum(topojson.mesh(us_map, us_map.objects.lower48, (a, b) => a !== b))
          .attr("fill", "none")
          .attr("stroke", "white")
          .attr("stroke-linejoin", "round")
          .attr("d", d3.geoPath())
          .attr('transform','translate(0,50)');

          return svg_vis3;

      }

      function matches(item_dt, curr_val_dt) {
          return item_dt.getFullYear() == curr_val_dt.getFullYear()
                  & item_dt.getMonth() == curr_val_dt.getMonth();
      }

data_descriptions = ({"Severe Weather - Thunderstorms": "Severe Weather",
                    "Fuel Supply Emergency - Coal": "Fuel Supply Emergency",
                    "Physical Attack - Vandalism": "Physical Attack",
                    "Suspected Physical Attack": "Physical Attack",
                    "Public Appeal to Reduce Electricity Usage - Wild Fires": "Severe Weather",
                    "Severe Weather - Heavy Winds": "Severe Weather", "Physical Attack": "Physical Attack", "Load shedding of 100 Megawatts": "Load Shedding",
                    "Severe Weather": "Severe Weather", "Voltage Reduction": "Voltage Reduction",
                    "Severe Weather - Wind": "Severe Weather", "System Wide Voltage Reduction": "Voltage Reduction",
                    "Electrical System Separation (Islanding)": "Islanding",
                    "Suspected Cyber Attack": "Cyber Attack", "Physical Attack - Sabatoge": "Physical Attack",
                    "Severe Weather - High Winds": "Severe Weather",
                    "Severe Weather - Winter Storm": "Severe Weather", "Fuel Supply Emergency - Hydro": "Fuel Supply Emergency", "Public Appeal due to Severe Weather - Cold": "Severe Weather",
                    "Severe Weather - Thunderstorms/High Winds": "Severe Weather", "Severe Weather - Snow/Ice": "Severe Weather", "Public Appeal to Reduce Electricity Usage": "Load Shedding", "Fuel Supply Emergency - Natural Gas": "Fuel Supply Emergency", "Severe Weather - Ice": "Severe Weather", "Electrical System Islanding": "Islanding",
                    "Voltage Reduction; Public Appeal; Load Shed 100+MW due to Severe Weather - Cold": "Severe Weather", "Voltage Reduction due to Severe Weather - Cold": "Severe Weather",
                    "Voltage Reduction; Public Appeal due to Severe Weather - Cold": "Severe Weather", "Fuel Supply Emergency due to Severe Weather - Cold": "Severe Weather",
                    "Severe Weather - Cold": "Severe Weather", "Vandalism": "Physical Attack",
                    "Severe Weather - Ice/Snow": "Severe Weather", "Fuel Supply Emergencies (Coal)": "Fuel Supply Emergency",
                    "Physical Attack - Vandalism, Theft": "Physical Attack", "Load Shed 100+ MW": "Load Shedding",
                    "Severe Weather - Wind Storm": "Severe Weather", "Severe Weather - Ice and Snow Storm": "Severe Weather",
                    "System-wide voltage reductions of 3 percent or more": "Voltage Reduction",
                    "Severe Weather - Tornadoes": "Severe Weather", "Loss of Power from Wholesale Provider; Major Distribution Disruption": "Load Shedding",
                    "Severe Weather - Hail Storm": "Severe Weather", "Cyber Event with Potential to Cause Impact": "Cyber Attack", "Physcial Attack; Sabotage": "Physical Attack", "Load Shed of 100+ MW": "Load Shedding",
                    "Electrical System Separation (Islanding); Severe Weather": "Severe Weather",
                    "Physcial Attack; Vandalism": "Physical Attack", "Severe Weather - Lightning Strike": "Severe Weather",
                    "Suspicious Activity": "Physical Attack", "Fuel Supply Emergency (Natural Gas & Fuel Oil)": "Fuel Supply Emergency", "Physical Attack; Vandalism": "Physical Attack",
                    "Physical Attack; Copper Theft": "Physical Attack", "Loss of 300+ MW Load": "Load Shedding", "Public Appeal - Heatwave": "Severe Weather", "Equipment Failure": "Equipment Failure",
                    "Fuel Supply Emergency (Natural Gas)": "Fuel Supply Emergency", "Voltage Reduction; Line and Generator Trip": "Voltage Reduction",
                    "Severe Weather - Fog": "Severe Weather", "Physical Attack; Vandalism & Sabotage": "Physical Attack",
                    "Severe Weather - Hailstorm": "Severe Weather", "Load Shed of 100+ MW Under Emergency Operational Policy": "Load Shedding",
                    "Loss of 300+ MW Load; Severe Weather - Thunderstorms": "Severe Weather", "Transmission System Interruption": "Equipment Failure",
                    "Severe Weather - Tornados": "Severe Weather", "Severe Weather - Lightning": "Severe Weather", "Vandalism/Theft": "Physical Attack",
                    "Generator Trip; Load Shed 100+ MW": "Load Shedding", "Severe Weather - Storms and Wind": "Severe Weather",
                    "Loss of Part of a High Voltage Substation, Physical Attack": "Physical Attack", "Sabotage; Vandalism": "Physical Attack", "Vandalism - Copper Wire Theft": "Physical Attack",
                    "Generator Trip; Load Shed": "Load Shedding", "Equipment Failure; Transmission System Interruption": "Equipment Failure",
                    "Severe Weather - Winter Storm Nemo": "Severe Weather", "Fuel Supply Emergency - Petroleum": "Fuel Supply Emergency", "Generator Trip; Voltage Reduction": "Voltage Reduction",
                    "Vandalism; Equipment Fault": "Physical Attack", "Equipment Trip & Failure": "Equipment Failure", "Distribution Interruption": "Equipment Failure",
                    "Transmission Interruption": "Equipment Failure", "Severe Weather - Thunderstorm": "Severe Weather", "Severe Weather - Cold Front, High Winds": "Severe Weather",
                    "Load Shed": "Load Shedding", "Fuel Supply Deficiency": "Fuel Supply Emergency", "Severe Weather - Nor'easter": "Severe Weather",
                    "Severe Weather - Hurricane Sandy": "Severe Weather",
                    "Vandalism; Theft": "Physical Attack", "Vandalsim": "Physical Attack",
                    "Fuel Supply Deficiency (Water)": "Fuel Supply Emergency",
                    "Severe Weather - Hurricane Isaac": "Severe Weather", "Severe Weather - TS Isaac": "Severe Weather",
                    "Severe Weather; Equipment Failure": "Severe Weather", "Fuel Supply Deficiency (Coal)": "Fuel Supply Emergency",
                    "Public Appeal to Reduce Energy Usage": "Load Shedding", "Severe Weather - Wind & Storms": "Severe Weather",
                    "Operational Failure; Storm Damage": "Severe Weather", "Severe Weather - Wind & Rain": "Severe Weather", "Load Shed/Severe Weather  - Lightning Storm": "Severe Weather",
                    "Operational Failure/Equipment Malfunction": "Equipment Failure", "Sabotage": "Physical Attack", "Suspected physical attack": "Physical Attack",
                    "Generation Inadequacy; Load Shed": "Load Shedding", "Transmission/Distribution Interruption; Load Shed; Generation Inadequacy": "Load Shedding",
                    "Actual Physical Attack": "Physical Attack", "Distribution System Interruption": "Equipment Failure", "Earthquake": "Severe Weather",
                    "Major System Interruption/Load Shed": "Load Shedding", "Severe Thunderstorms": "Severe Weather", "Load Shed/ Automatic undervoltage relay action": "Load Shedding",
                    "Transmission Level Interruption": "Equipment Failure", "Generation Inadequacy; Load Shed; Electrical System Separation (Islanding)": "Load Shedding",
                    "Suspected Sabotage": "Physical Attack", "Equipment Malfunction": "Equipment Failure", "Transmission Level Outage": "Equipment Failure", "Major Storm": "Severe Weather",
                    "Generation Inadequacy/Load Shed": "Load Shedding", "Winter Storm": "Severe Weather", "Cold Weather Event": "Severe Weather",
                    "Fuel Supply Deficiency (Natural Gas)": "Fuel Supply Emergency", "Ice Storm": "Severe Weather",
                    "Suspected Telecommunications Attack": "Cyber Attack", "Firm System Load Shed": "Load Shedding",
                    "Electrical Fault at Generator": "Equipment Failure", "Transmission Equipment/Firm System Load": "Equipment Failure",
                    "Electrical System Separation - Islanding": "Islanding", "High Winds": "Severe Weather", "Snow and High Winds": "Severe Weather",
                    "Transmission Equipment Failure/Interruptible Load Shed": "Load Shedding", "Firm System Load Loss": "Load Shedding", "Electrical System Separation-Islanding": "Islanding",
                    "Thunderstorms": "Severe Weather", "Rain and High Winds": "Severe Weather", "Interruptible Load Shed": "Load Shedding", "Firm Load Shed": "Load Shedding",
                    "Low Flying Helicopter": "Physical Attack", "Tropical Storm": "Severe Weather", "Made Public Appeals": "Load Shedding",
                    "Fuel Supply Defiency": "Fuel Supply Emergency", "Fuel Supply Deficiency (Hydro)": "Fuel Supply Emergency", "Shed Interruptible Load, Wildfire": "Severe Weather", "Strong Winds, Tornadoes": "Severe Weather",
                    "Loss of Transmission Equipment": "Equipment Failure", "Transformer Outage": "Equipment Failure", "Electrical System Separation": "Islanding", "Made Public Appeal/Transmission Equipment Failure": "Equipment Failure",
                    "Made Public Appeal": "Load Shedding", "Voltage Reduction (System Test)": "Voltage Reduction", "Electric System Separation": "Islanding",
                    "Made Public Appeal - System Drill": "Load Shedding", "Breakers Tripped": "Equipment Failure", "Generator Tripped": "Equipment Failure",
                    "Shed Firm Load": "Load Shedding", "High Winds and Rain": "Severe Weather", "High Winds and rain": "Severe Weather",
                    "High Winds and Flooding": "Severe Weather", "Ice Storm/Electrical System Separation": "Severe Weather", "Severe Storm": "Severe Weather",
                    "Interruptible Load Shed/Made Public Appeals": "Load Shedding", "Load Shed/Made Public Appeals": "Load Shedding", "Forced Outage Equipment Failure": "Equipment Failure",
                    "Switching Failure": "Equipment Failure", "Tropical Storm Ida": "Severe Weather",
                    "Ice": "Severe Weather", "Severe Storms": "Severe Weather", "Highwinds": "Severe Weather", "Loss of Part of Substation": "Equipment Failure",
                    "Failure of Computer Hardware Used for Monitoring": "Equipment Failure", "Unit Tripped": "Equipment Failure", "Severe Thunderstorm": "Severe Weather", "High Winds/Rain": "Severe Weather",
                    "Transmission Equipment Failure": "Equipment Failure", "Complete Electric System Failure": "Equipment Failure",
                    "Substation Load Interruption": "Equipment Failure", "Transmission Tripped": "Equipment Failure", "Unit Shut Down": "Equipment Failure", "Transformer Faulted/Unit Tripped": "Equipment Failure",
                    "Ice/Snow Storm": "Severe Weather", "Shed Load": "Load Shedding", "Wind Storm": "Severe Weather", "Lightning": "Severe Weather", "Load Shedding": "Load Shedding", "Declared Stage 1 Electric Emergency/Made Public Appeal": "Load Shedding",
                    "Snow Storm": "Severe Weather", "Equipment Failure/Made Public Appeal": "Equipment Failure", "Lines Loss/Transmission": "Equipment Failure", "Fire/Load Shedding": "Load Shedding", "Brush Fire/Shed Firm Load": "Severe Weather", "Tropical Depression Ike": "Severe Weather",
                    "Hurricane Ike": "Severe Weather", "Tropical Storm Hanna": "Severe Weather", "Hurricane Gustav": "Severe Weather", "Fuel Supply Curtailed": "Fuel Supply Emergency", "Tropical Storm Fay": "Severe Weather", "Fuel Supply Emergency-Low Coal Inventory Levels": "Fuel Supply Emergency", "Lightning/Transmission Equipment Damage": "Equipment Failure",
                    "Shed Firm Load/Voltage Reduction": "Voltage Reduction", "Declared Energy Emergency Alert 1/Made Public Appeals": "Load Shedding", "Electric System Separation/Severe Lightning Storms": "Severe Weather", "Hurricane Dolly": "Severe Weather", "Indequate Electric Resources to Serve Load/Public Appeal": "Load Shedding", "Storm": "Severe Weather",
                    "Heat Wave/Potential Fire Threat/Made Public Appeals": "Severe Weather", "Wild Land Fire": "Severe Weather", "Brush Fire/Lines Loss/Transmission Emergency Declared": "Severe Weather", "Severe Wind Storm": "Severe Weather", "Transmission Equipment Failure/Load Shedding": "Load Shedding", "Fire/Breaker Failure": "Equipment Failure",
                    "Lightning Stirke/Uncontrolled Loss of Load": "Severe Weather", "Electrical System Separation/Severe Lightning Storms": "Severe Weather", "Thunderstorms/Uncontrolled Loss of Load": "Severe Weather", "Electrical System Separation/Severe Thunderstorms": "Severe Weather", "Flooding and Uncontrolled Loss": "Severe Weather", "Uncontrolled Loss": "Load Shedding", "Inadequate Electric Resources to Serve Load": "Load Shedding",
                    "Indequate Electric Resources to Serve Load": "Load Shedding", "Lightning Storm": "Severe Weather", "Load Shedding/Voltage Reduction": "Load Shedding", "Load Shedding, Inadequate Electric Resources to Serve Load": "Load Shedding", "Windstorm": "Severe Weather",
                    "Under Frequency/Load Shedding": "Load Shedding", "Equipment Faulted": "Equipment Failure", "Wind/Ice Storm": "Severe Weather", "Exciter Faulted": "Equipment Failure", "Voltage Reduction/Made Public Appeal/Fuel Deficiency": "Voltage Reduction",
                    "Brush Fire/Load Shedding": "Load Shedding", "Brush Fire/Load Shedding/Implemented Emergency Alert": "Load Shedding", "Electrical System Separation/Load Shedding/ Implemented Emergency Alert/Severe Storms": "Severe Weather",
                    "Electrical System Separation/Load Shedding/ Implemented Emergency Alert/ Severe Storms": "Severe Weather", "Hurricane Humberto": "Severe Weather", "Severe Weather/Transmission Fault-Units Tripped": "Severe Weather", "High Temperatures/Made Public Appeals": "Severe Weather",
                    "Declared Energy Emergency Alert 1/Heat wave": "Severe Weather", "Declared Energy Emergency Alert2/Heat Wave": "Severe Weather", "Voltage Reduction/Made Public Appeal": "Voltage Reduction",
                    "Major Storms": "Severe Weather", "Electrical Separation/Load Shedding/Made Public Appeal": "Load Shedding", "Public Appeal": "Load Shedding", "Loss of Load": "Load Shedding", "HIgh Winds": "Severe Weather", "Heavy Snow Storm": "Severe Weather", "Trip of a Unit": "Equipment Failure", "Ice/Wind Storm": "Severe Weather",
                    "Major Windstorm": "Severe Weather", "Main Power Transformer Failure/Voltage Reduction/Fire": "Voltage Reduction", "Transmission Equipment/Fire": "Equipment Failure", "Wind/Snow Storm": "Severe Weather", "Wet Snow/Winds": "Severe Weather", "Earthquakes": "Severe Weather",
                    "Shed Firm Load/ Reduced Voltage": "Voltage Reduction", "Tropical Storm Ernesto": "Severe Weather", "Shed Firm Load/Reduced Voltage": "Voltage Reduction", "Declared Energy Emergency Alert 2/Heat Wave": "Severe Weather", "Made Public Appeals/Heat Wave": "Severe Weather",
                    "Widespread Heat Wave/CAISO  Implementation of Stage 2 Electrical Emergency Plan": "Severe Weather", "Widespread Heat Wave/CAISO Implementation of Stage 2 Electrical Emergency Plan": "Severe Weather",
                    "Widespread Heat Wave/Public Appeals Made": "Severe Weather", "Severe Storms (3) (Many customers experienced multiple outages.)": "Severe Weather",
                    "Load Reduction/Public Appeals Made": "Load Shedding", "Severe Lightning Storms": "Severe Weather", "Lightning Storms/Tripped Lines": "Severe Weather", "Severe Weather/Public Appeals Made/Voltage Reduction": "Severe Weather",
                    "Lightning Strike": "Severe Weather", "Transmission Equipment Failure/Fire": "Equipment Failure", "Load Shed/Declared EECP": "Load Shedding", "Load Shed/ Declared EECP": "Load Shedding", "Load Shed/Made Public Appeals/Rolling Blackouts": "Load Shedding", "Severe Weather/ Tornadoes": "Severe Weather",
                    "Voltage Reduction/Load Shed": "Load Shedding", "Major Storms/Tornadoes": "Severe Weather", "Severe Winter Storm": "Severe Weather", "Fuel Supply - Deficiency Coal Rail Transportation Interruption": "Fuel Supply Emergency", "Severe Thunderstorm/ Snow/Ice Storm": "Severe Weather",
                    "Winter Snow/Ice Storm": "Severe Weather", "Major Snow Storm": "Severe Weather", "Severe Snow Storm": "Severe Weather", "Severe Windstorm": "Severe Weather", "Strong Winds": "Severe Weather",
                    "Plant Tripped": "Equipment Failure", "Hurricane Wilma": "Severe Weather", "Hurricane Rita": "Severe Weather", "Hurricane Rita  disrupted normal gas allotment through natural gas pipelines (FGT & Gulf stream). Public Appeals for conservation were issued.": "Severe Weather",
                    "Hurricane Rita disrupted fuel supply in the Gulf of Mexico. Public Appeals for conservation were issued.": "Severe Weather", "High Winds/Tornados": "Severe Weather", "Hurricane Ophelia": "Severe Weather", "Breaker protection cable accidentally cut": "Equipment Failure",
                    "Hurricane Katrina disrupted normal gas supplies distribution. Public appeals for conservation were issued.": "Severe Weather", "Hurricane Katrina": "Severe Weather", "Hurricane Katrina disrupted fuel supply in the Gulf of Mexico. Public appeals for conservation were issued.": "Severe Weather",
                    "Hurricane Katrina  disrupted normal gas allotment through natural gas pipelines (FGT & Gulf stream). Public appeals for conservation were issued.": "Severe Weather", "CAISO initiated interruption of  interruptible and firm load due to declaration of  Transmission Emergency in Southern California": "Equipment Failure",
                    "CAISO determined there was  inadequate electric resources to serve load.  Public appeals and a shedding of interruptible and firm load occurred.": "Load Shedding", "CA ISO Stage 2 -Initiated interruption of Air Conditioner Cycling Interruptible Load Program": "Load Shedding",
                    "CA ISO  Stage 2 -Initiated interruption of Air Conditioner Cycling Interruptible Load Program": "Load Shedding", "Hurricane Dennis": "Severe Weather", "Tropical Storm Cindy": "Severe Weather", "Fuel Supply - Deficiency Coal Rail Transporation Interruption": "Fuel Supply Emergency",
                    "Strong Thunderstorm/High Winds": "Severe Weather",
                    "Fuel Supply Deficiency/Coal Rail Transportation Interruption": "Fuel Supply Emergency", "Strong Thunderstorm": "Severe Weather", "Strong Thunderstorms": "Severe Weather", "Wind Storms": "Severe Weather", "Generator Loss/Voltage Reduction": "Voltage Reduction",
                    "Generator Loss": "Load Shedding", "Voltage Reduction/Shed Load": "Voltage Reduction", "Winter Ice Storm": "Severe Weather", "Severe Weather/Line Relayed": "Severe Weather",
                    "Major Freezing Rain and Ice Storm": "Severe Weather", "Heavy Rain and Wind Storm": "Severe Weather", "Fuel Supply Deficiency - Williams Company: Event for Trans Continental Gas Pipeline": "Fuel Supply Emergency", "Severe Storm with High Wind Gusts": "Severe Weather", "High Wind Gusts": "Severe Weather",
                    "Major Transmission Distribution System Interruption": "Equipment Failure", "Public Appeal/Breaker Failure and Fire": "Equipment Failure", "Breaker Failure": "Equipment Failure",
                    "Hurricane Jeanne": "Severe Weather", "Hurricane Ivan": "Severe Weather", "Hurricane Frances": "Severe Weather", "Tropical Storm Gaston": "Severe Weather",
                    "Major Transmission Line Tripped due to Lightning Strike": "Severe Weather", "Hurricane Charley": "Severe Weather", "Two Large Units Tripped": "Equipment Failure", "Fault at Barre Substation": "Equipment Failure",
                    "Unplanned Generator Outage/High Loads Made Public Appeal": "Load Shedding", "Wildfire": "Severe Weather", "Wildfire/Shed Interruptible Load": "Severe Weather",
                    "Units Tripped": "Equipment Failure", "Fire/Substation Multiple Public Appeals": "Severe Weather", "Fault on Line": "Equipment Failure", "Tornado": "Severe Weather",
                    "Severe Thunderstorms with Strong Winds": "Severe Weather", "Severe  Thunderstorms with Strong Winds": "Severe Weather",
                    "Severe Storms with Strong Winds": "Severe Weather", "Public Appeals": "Load Shedding", "High Winds and Heavy Rains": "Severe Weather",
                    "Heat Storm": "Severe Weather", "Storm with High Winds": "Severe Weather", "Faulty Switch": "Equipment Failure", "Inadequate Resources": "Load Shedding",
                    "High Winds - Severe Storm": "Severe Weather", "Lightning struck Intertie Breaker": "Severe Weather", "Public Appeal to Reduce Load": "Load Shedding",
                    "Cable Failure": "Equipment Failure", "Transmission Equipment": "Equipment Failure", "Fault on 138 KV line": "Equipment Failure",
                    "Wild Fire _ Transmission Equipment": "Severe Weather", "Major Wind Storm": "Severe Weather", "Wild Fire": "Severe Weather", "Hurricane Isabel": "Severe Weather",
                    "Transmission  Equipment": "Equipment Failure", "Unknown *": "Unknown",
                    "Breaker Closed": "Equipment Failure", "Hurricane Claudette": "Severe Weather", "Tropical Storm Bill": "Severe Weather",
                    "Interruption of Firm Power": "Load Shedding", "Flood": "Severe Weather",
                    "Relaying Malfunction": "Equipment Failure", "Cyber Threat From Internet": "Cyber Attack", "Cable Tripped": "Equipment Failure", "Hurricane Lily": "Severe Weather", "Fire": "Severe Weather", "Interruption of Firm Power (Unit Tripped)": "Load Shedding", "Vandalism/Insulators": "Physical Attack", "Interruption of Firm Load": "Load Shedding", "Feeder Shutdowns": "Equipment Failure", "Flooding": "Severe Weather", "Firm Load Interruption": "Load Shedding", "Interruption of Firm Power (Public Appeal)": "Load Shedding", "Interruption of Power": "Load Shedding", "Interruption of Firm Power & Public Appeal": "Load Shedding", "Firm load interruption": "Load Shedding", "Tripped line": "Equipment Failure", "Circuit failure/fire": "Equipment Failure", "High winds and thunder": "Severe Weather", "B-phase to ground fault": "Equipment Failure", "Line Outages/Switch Fire": "Severe Weather", "Relay Trouble": "Equipment Failure", "Generating Resources Loss": "Fuel Supply Emergency", "Tripped Lines Fire": "Equipment Failure", "Voltage Elec Usage": "Voltage Reduction", "Thunder/Lightning": "Severe Weather", "Severe Weather High Wind": "Severe Weather", "Energy Conservation": "Load Shedding", "Relay Malfunction & Fire": "Equipment Failure", "Transformer Faulted": "Equipment Failure", "Transmission Line Loss": "Equipment Failure"})