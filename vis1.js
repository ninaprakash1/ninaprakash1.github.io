
///////////// Visualization 1//////////////////

// Define variables for plotting
plotVars_vis1 = ({
  svgHeight: 600,
  mapWidth: 960,
  mapHeight: 600,
  radius: 200,
  innerRadius: 110,
  outerRadius: 160,
  pieCenterX: 1210,
  pieCenterY: 375,
  capScale: 150
});

// Define projection function for US
projection_vis1 = d3.geoAlbersUsa().scale(1260).translate([plotVars_vis1.mapWidth / 2, plotVars_vis1.mapHeight / 2]);

// Define plot colors for each fuel type
colors_vis1 = ({
  "Solar": "#f94144",
  "Coal": "#f3722c",
  "Oil": "#90be6d",
  "Hydro": "#43aa8b",
  "Gas": "#277da1",
  "Wind": "#577590",
  "Biomass": "#4d908e",
  "Other": "#f9c74f" // "Other" = Cogeneration, Geothermal, and Storage
});

fuel_types = Object.keys(colors_vis1);

// Load power plant data
plant_data = d3.csv("https://ninaprakash1.github.io/assets/cs448b-final-project/vis1/global_power_plant_database.csv", function (d) {
    return {
      country_long: d.country_long,
      primary_fuel: d.primary_fuel,
      capacity_mw: +d.capacity_mw,
      latitude: d.latitude,
      longitude: d.longitude
    }
  }).then(function(plant_data) {
    
    // Filter for US plants only
    plant_data = plant_data.filter(d => d.country_long=="United States of America");

    // Get counts of each power plant
    plant_counts = getCounts(plant_data);

    // Get US map data
    us = d3.json("https://cdn.jsdelivr.net/npm/us-atlas@1/us/10m.json").then(function(us) {

      us.objects.lower48 = {
        type: "GeometryCollection",
        geometries: us.objects.states.geometries
      };

      const svg = plotBaseMap(us);

      ///////////////// IMPORT FONT ////////////////
      svg.append('defs')
      .append('style')
      .attr('type', 'text/css')
      .text("@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200&display=swap');");

      //////////////// WRITE A TITLE //////////////
      svg.append('text')
        .attr('x',window.outerWidth / 2)
        .attr('y',50)
        .text('US Power Plants by Fuel Type')
        .attr('font-family','Montserrat')
        .attr('font-size','20px')
        .attr('text-anchor','middle')
        //.attr('font-weight','bold')
      
      ///////////////// SAVE VARIABLE FOR CURRENTLY SELECTED FUEL ////////////////
      var fuel_selected = "All";

      ///////////////// DRAW THE POWER PLANTS ////////////////
      var plantGroup = svg.selectAll('circle').data(plant_data).join('g')
        .attr('transform','translate(0,75)');

      var size_by_cap = false;

      plantGroup.append('ellipse')
        .attr('class','size-toggle')
        .attr('rx',60)
        .attr('ry',25)
        .attr('cx',750)
        .attr('cy',80)
        .attr('fill','gainsboro')
        .attr('opacity', size_by_cap === true ? 0.9 : 0.01)
        .attr('stroke','grey')
        .attr('stroke-width',2)
        .on('click', handleButtonClick)

      function handleButtonClick(event,d) {
        // Flip the value of size_by_cap
        size_by_cap = !size_by_cap;

        // Change the opacity of the button and add the text again
        d3.select(this).attr('opacity', size_by_cap === true ? 0.9 : 0.01);

        // Resize the power plant circles
        svg.selectAll('.powerPlant').attr('r', size_by_cap === true ? d => d.capacity_mw / plotVars_vis1.capScale : 3);

      }
        
      plantGroup.append('text')
        .attr('class','button-text')
        .attr('x',750)
        .attr('y',80)
        .attr('text-anchor','middle')
        .attr('font-size','12px')
        .attr('font-family','Montserrat')
        .text('Size by capacity')

      plantGroup.append('circle')
        .attr('class','powerPlant')
        .attr('r', size_by_cap === true ? d => d.capacity_mw / plotVars_vis1.capScale : 3)
        .attr('fill', d => colors_vis1[d.primary_fuel])
        .attr('fuel', d => d.primary_fuel)
        .attr('cx', function (d) {
          var lon_lat = {0: d.longitude, 1: d.latitude};
          if (projection_vis1(lon_lat) == null) { return 0; }
          return projection_vis1(lon_lat)[0];
        })
        .attr('cy', function (d) {
          var lon_lat = {0: d.longitude, 1: d.latitude};
          if (projection_vis1(lon_lat) == null) { return 0; }
          return projection_vis1(lon_lat)[1];
        })
        .attr('opacity', 0.5)
        .on('mouseover', handlePowerPlantHoverOn)
        .on('mouseout', handlePowerPlantHoverOff)
        .on('click',handlePlantClick);

      ///////////////// POWER PLANT HOVER ON ////////////////
      function handlePowerPlantHoverOn(event, d) {           //Handle 'mouseover' events
            if (d.primary_fuel == fuel_selected | fuel_selected == "All") {
              svg.append('ellipse')
                .attr('class','ptRect')
                .attr('cx',projection_vis1({0: d.longitude, 1: d.latitude})[0] - 55)
                .attr('cy', projection_vis1({0: d.longitude, 1: d.latitude})[1] - 18 + 75)
                .attr('rx',50)
                .attr('ry',40)
                .attr('fill','white')
                .attr('opacity',0.8)
              svg.append('text')
                .attr('class', 'ptLabel')
                .attr('x', projection_vis1({0: d.longitude, 1: d.latitude})[0] - 55)
                .attr('y', projection_vis1({0: d.longitude, 1: d.latitude})[1] - 23 + 75)
                .attr('font-family', 'Montserrat')
                .attr('font-weight', 'bold')
                .attr('font-size','16px')
                .attr('fill','black')
                .attr('text-anchor','middle')
                .text(d.primary_fuel);
              svg.append('text')
                .attr('class', 'ptLabel')
                .attr('x', projection_vis1({0: d.longitude, 1: d.latitude})[0] - 55)
                .attr('y', projection_vis1({0: d.longitude, 1: d.latitude})[1] + 2 + 75)
                .attr('font-family', 'Montserrat')
                .attr('font-weight', 'bold')
                .attr('font-size','16px')
                .attr('fill','black')
                .attr('text-anchor','middle')
                .text(d.capacity_mw.toFixed(1) + ' MW');
            }
        }

      ///////////////// POWER PLANT HOVER OFF ////////////////
      function handlePowerPlantHoverOff(event, d) {
            svg.selectAll('.ptLabel').remove();    // Remove all ptLabels
            svg.selectAll('.ptRect').remove();
        }

      ///////////////// POWER PLANT CLICK ////////////////
      function handlePlantClick(d,i) {
        if (fuel_selected == "All") {
          fuel_selected = this.getAttribute('fuel');
          // Recolor the map
            svg.selectAll('.powerPlant').attr('fill', d => d.primary_fuel === fuel_selected ? colors_vis1[d.primary_fuel] : 'white');
      
            // Recolor the pie chart
          pieGroup.selectAll('path').style('opacity',0.7);
          pieGroup.selectAll('path').each(function(d,i) {
            console.log(this.getAttribute('fuel'));
            if (this.getAttribute('fuel') == fuel_selected) {
              d3.select(this).style('opacity',0.5);
            }
          });
      
          // Bold the label for the selected pie chart section
          svg.select('.centerText').attr('font-weight','normal');
          pieGroup.selectAll('.pieLabel').attr('font-weight', d => d.data.key === fuel_selected ? 'bold' : 'normal' );

          var num_plants = plant_data.filter(d => d.primary_fuel == fuel_selected).map(d => 1).reduce((prev,next) => prev + next);
          svg.append('text')
            .attr('class','numLabel')
            .attr('font-family', 'Montserrat')
            .attr('x',620)
            .attr('y',600)
            .attr('font-size','28px')
            .attr('text-anchor','middle')
            .text(num_plants + ' ' + fuel_selected + ' plants')
          
        }
      }
      
      ///////////////// PLOT THE PIE CHART ////////////////
      var pieGroup = svg.append('g').attr("transform", "translate(" + plotVars_vis1.pieCenterX + "," + (plotVars_vis1.pieCenterY) + ")");
      var color = d3.scaleOrdinal().domain(Object.keys(colors_vis1)).range(Object.values(colors_vis1));
      var pie = d3.pie().sort(null).value(function(d) { return d.value; });
      var data_ready = pie(plant_counts);
      var arc = d3.arc().innerRadius(plotVars_vis1.innerRadius).outerRadius(plotVars_vis1.outerRadius); // for the pie itself
      var outerArc = d3.arc().innerRadius(plotVars_vis1.radius * 0.9).outerRadius(plotVars_vis1.radius * 0.9); // for the labels

      pieGroup.selectAll('BasePie')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fuel',function(d) { return d.data.key } )
        .attr('fill', function(d){ return(color(d.data.key)) })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)
        .on('mouseover', handlePieMouseOver)
        .on('mouseout', handlePieMouseOut)
        .on('click', handlePieClick)

      ///////////////// PIE CHART MOUSE ON ////////////////
      function handlePieMouseOver(d, i) {
        if (fuel_selected == "All") {
          var fuel_hovered = this.getAttribute('fuel');
          var num_plants = plant_data.filter(d => d.primary_fuel == fuel_hovered).map(d => 1).reduce((prev,next) => prev + next);
          svg.append('text')
            .attr('class','numLabel')
            .attr('font-family', 'Montserrat')
            .attr('x',620)
            .attr('y',600 + 75)
            .attr('font-size','28px')
            .attr('text-anchor','middle')
            .text(num_plants + ' ' + fuel_hovered + ' plants')
        }
      }
      
      ///////////////// PIE CHART MOUSE OFF ////////////////
      function handlePieMouseOut(d, i) {
        if (fuel_selected == "All") {
            d3.selectAll('.numLabel').remove();
        }
        }

      ///////////////// PIE CHART CLICK SLICE ////////////////
      function handlePieClick(d,i) {
          // Get the selected fuel
          fuel_selected = this.getAttribute('fuel');

          // Recolor the map
          svg.selectAll('.powerPlant').attr('fill', d => d.primary_fuel === fuel_selected ? colors_vis1[d.primary_fuel] : 'white');

          // Recolor the pie chart
          pieGroup.selectAll('path').style('opacity',0.7);
          d3.select(this).style('opacity', 0.5);

          // Bold the label for the selected pie chart section
          svg.select('.centerText').attr('font-weight','normal');
          pieGroup.selectAll('.pieLabel').attr('font-weight', d => d.data.key === fuel_selected ? 'bold' : 'normal' );

          var num_plants = plant_data.filter(d => d.primary_fuel == fuel_selected).map(d => 1).reduce((prev,next) => prev + next);
          d3.selectAll('.numLabel').remove();
          svg.append('text')
            .attr('class','numLabel')
            .attr('font-family', 'Montserrat')
            .attr('x',620)
            .attr('y',600 + 75)
            .attr('font-size','28px')
            .attr('text-anchor','middle')
            .text(num_plants + ' ' + fuel_selected + ' plants')
        }

      ///////////////// PIE CHART CLICK ALL ////////////////
      svg.append('text')
        .attr('class','centerText')
        .attr('x',plotVars_vis1.pieCenterX).attr('y',plotVars_vis1.pieCenterY)
        .text('All')
        .attr('font-family', 'Montserrat')
        .attr('fill','black')
        .attr('font-weight','bold')
        .attr('text-anchor','middle')
      
      svg.on('click', handleClickAll);

      function handleClickAll(event,d) {
        var click = d3.pointer(event);
        var clickX = click[0];
        var clickY = click[1];
        if ( ((clickX - plotVars_vis1.pieCenterX)**2 + (clickY - plotVars_vis1.pieCenterY)**2) < (plotVars_vis1.innerRadius)**2 ) {
          svg.selectAll('circle').attr('fill', d => colors_vis1[d.primary_fuel]);
          pieGroup.selectAll('.pieLabel').attr('font-weight','normal');
          pieGroup.selectAll('path').style('opacity',0.7);
          svg.select('.centerText').attr('font-weight','bold');
          svg.selectAll('circle').attr('fill', d => colors_vis1[d.primary_fuel]);
          fuel_selected = "All";
          d3.selectAll('.numLabel').remove();
        }
      }
      
      ///////////////// PIE CHART LABEL LINES ////////////////
      pieGroup.selectAll('allPolylines')
        .data(data_ready)
        .enter()
        .append('polyline')
          .attr("stroke", "black")
          .style("fill", "none")
          .attr("stroke-width", 1)
          .attr('points', function(d) {
            var posA = arc.centroid(d) // line insertion in the slice
            var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
            var posC = outerArc.centroid(d); // Label position = almost the same as posB
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
            posC[0] = plotVars_vis1.radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
            if (d.data.key == 'Other') {
              posB[1] = posB[1] - 10;
              posC[1] = posC[1] - 10; // shift it up a bit
            }
            return [posA, posB, posC]
          })

      ///////////////// PIE CHART LABELS TEXT ////////////////
      pieGroup.selectAll('allLabels')
        .data(data_ready)
        .enter()
        .append('text')
          .attr('class','pieLabel')
          .attr('font-family', 'Montserrat')
          .text( function(d) { return d.data.key } )
          .attr('transform', function(d) {
              var pos = outerArc.centroid(d);
              var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
              pos[0] = plotVars_vis1.radius * 1 * (midangle < Math.PI ? 1 : -1);
              if (d.data.key == 'Other') {
                pos[1] = pos[1] - 5; // shift it up
              }
              if (d.data.key == 'Biomass') {
                pos[1] = pos[1] + 5;
              }
              return 'translate(' + pos + ')';
          })
          .style('text-anchor', function(d) {
              var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
              return (midangle < Math.PI ? 'start' : 'end')
          });

      ///////////////// INSTRUCTIONS ////////////////
      svg.append('text')
        .attr('x',plotVars_vis1.pieCenterX)
        .attr('y',plotVars_vis1.pieCenterY + 250)
        .attr('text-anchor','middle')
        .text('Select region of pie chart to filter.')
        .attr('font-family','Montserrat')
      svg.append('text')
        .attr('x',plotVars_vis1.pieCenterX)
        .attr('y',plotVars_vis1.pieCenterY + 300)
        .attr('text-anchor','middle')
        .text('From All, select a power plant to see others of the same type.')
        .attr('font-family','Montserrat')
      svg.append('text')
        .attr('x',plotVars_vis1.pieCenterX)
        .attr('y',plotVars_vis1.pieCenterY + 350)
        .attr('text-anchor','middle')
        .text('Hover to see more information.')
        .attr('font-family','Montserrat')
              
      return us;

      headerRect = svg.append('g')

      headerRect.append('rect')
        .attr('width',50)
        .attr('height',5)
        .attr('fill','yellow')

    });

    // return plant_data;
    });

function getCounts(plant_data) {
  /*
  @param plant_data   Array of JSON objects that represent US power plants including
                      location, fuel type, and capacity
  @return             JSON object with number of power plants that use each fuel type
                      listed in the global fuel_types object
  */
  plant_counts = Array(fuel_types.length)
  for (var i = 0; i < plant_counts.length; i++) {
    if (fuel_types[i] == "Other") {
      plant_counts[i] = {
        "key": fuel_types[i],
        "value": plant_data.filter(d => d.primary_fuel == "Cogeneration").map(d => 1).reduce((prev,next) => prev + next) 
        + plant_data.filter(d => d.primary_fuel == "Geothermal").map(d => 1).reduce((prev,next) => prev + next)
        + plant_data.filter(d => d.primary_fuel == "Storage").map(d => 1).reduce((prev,next) => prev + next)
      }
    }
    else {
      plant_counts[i] = {
        "key": fuel_types[i],
        "value": plant_data.filter(d => d.primary_fuel == fuel_types[i]).map(d => 1).reduce((prev,next) => prev + next)
      }
    }
  }
  return plant_counts;
}

function plotBaseMap(us) {
  svg = d3.select("#vis1")
      .attr("viewBox", [0, 0, 1500, 750])
      .attr('width',window)
      .attr('height',plotVars_vis1.svgHeight);

  svg.append("path")
      .datum(topojson.merge(us, us.objects.lower48.geometries))
      .attr("fill", "#ddd")
      .attr("d", d3.geoPath())
      .attr('transform','translate(0,75)');

  svg.append("path")
      .datum(topojson.mesh(us, us.objects.lower48, (a, b) => a !== b))
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", d3.geoPath())
      .attr('transform','translate(0,75)');

  return svg;
}