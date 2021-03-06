
var headerVars = {
    titleVertSpacing: 150,
    subheadVertSpacing: 100
}

var intro = d3.select("#intro").attr('width',window.outerWidth).attr('height',900)

intro.append("svg:image")
    .attr("xlink:href", "https://ninaprakash1.github.io/assets/cs448b-final-project/vis3/map.jpg")
    .attr("width", window.outerWidth - 100)
    .attr('x', 50)
    .attr('y', 60)
    .attr('opacity',0.25)

intro.append('text')
    .text('A Visual Exploration of the US Power Grid')
    .attr('font-size','50px')
    .attr('x',window.outerWidth / 2)
    .attr('y',headerVars.titleVertSpacing)
    .attr('font-family','Montserrat')
    .attr('text-anchor','middle')

intro.append('text')
    .text('Nina Prakash | CS 448b @ Stanford University')
    .attr('x',window.outerWidth / 2)
    .attr('y',headerVars.titleVertSpacing + headerVars.subheadVertSpacing)
    .attr('text-anchor','middle')
    .attr('font-family','Montserrat')

intro.append('text')
    .text('The United States power grid is an interconnected network of generators and transmission and distribution lines')
    .attr('x', window.outerWidth / 2)
    .attr('y',headerVars.titleVertSpacing + headerVars.subheadVertSpacing*2)
    .attr('text-anchor','middle')

intro.append('text')
    .text(' that bring electricity to millions of homes and businesses. The visualizations below explore how electricity')
    .attr('x', window.outerWidth / 2)
    .attr('y',headerVars.titleVertSpacing + headerVars.subheadVertSpacing*2 + 30)
    .attr('text-anchor','middle')

intro.append('text')
    .text(' is generated, bought and sold in the United States as well as major grid outages over the past 20 years.')
    .attr('x', window.outerWidth / 2)
    .attr('y',headerVars.titleVertSpacing + headerVars.subheadVertSpacing*2 + 60)
    .attr('text-anchor','middle')

intro.append('text')
    .text('Electricity Generation')
    .attr('x', window.outerWidth / 2)
    .attr('y',headerVars.titleVertSpacing + headerVars.subheadVertSpacing*2 + 90 + headerVars.subheadVertSpacing)
    .attr('text-anchor','middle')
    .attr('font-weight','bold')
    .attr('font-size','25px')

intro.append('text')
    .text('Electricity in the United States is generated at over 10,000 utility-scale power plants that use nonrenewable')
    .attr('x', window.outerWidth / 2)
    .attr('y',headerVars.titleVertSpacing + headerVars.subheadVertSpacing*2 + 150 + headerVars.subheadVertSpacing)
    .attr('text-anchor','middle')

intro.append('text')
    .text('fuels (coal, gas, and oil) or renewable fuels (solar, wind, hydroelectric, and biomass). In 2020, these had just')
    .attr('x', window.outerWidth / 2)
    .attr('y',headerVars.titleVertSpacing + headerVars.subheadVertSpacing*2 + 180 + headerVars.subheadVertSpacing)
    .attr('text-anchor','middle')

intro.append('text')
    .text('over 1,000,000 MW of total utility-scale generating capacity. The map below shows the locations of power plants')
    .attr('x', window.outerWidth / 2)
    .attr('y',headerVars.titleVertSpacing + headerVars.subheadVertSpacing*2 + 210 + headerVars.subheadVertSpacing)
    .attr('text-anchor','middle')

intro.append('text')
    .text('in the US colored by fuel type. The pie chart shows the proportion of US power plants that use each type of fuel,')
    .attr('x', window.outerWidth / 2)
    .attr('y',headerVars.titleVertSpacing + headerVars.subheadVertSpacing*2 + 240 + headerVars.subheadVertSpacing)
    .attr('text-anchor','middle')

intro.append('text')
    .text('where Other represents Cogeneration, Geothermal, and Storage utility-scale operations. While solar represents the')
    .attr('x', window.outerWidth / 2)
    .attr('y',headerVars.titleVertSpacing + headerVars.subheadVertSpacing*2 + 270 + headerVars.subheadVertSpacing)
    .attr('text-anchor','middle')

intro.append('text')
    .text('largest proportion in terms of number of plants, if you select the button to size each power plant based on its')
    .attr('x', window.outerWidth / 2)
    .attr('y',headerVars.titleVertSpacing + headerVars.subheadVertSpacing*2 + 300 + headerVars.subheadVertSpacing)
    .attr('text-anchor','middle')

intro.append('text')
    .text('generating capacity, it becomes clear that gas and coal-powered plants provide significantly more capacity. If you')
    .attr('x', window.outerWidth / 2)
    .attr('y',headerVars.titleVertSpacing + headerVars.subheadVertSpacing*2 + 330 + headerVars.subheadVertSpacing)
    .attr('text-anchor','middle')

intro.append('text')
    .text('select regions of the pie chart to filter for fuel type, you can notice patterns in location. For example, wind')
    .attr('x', window.outerWidth / 2)
    .attr('y',headerVars.titleVertSpacing + headerVars.subheadVertSpacing*2 + 360 + headerVars.subheadVertSpacing)
    .attr('text-anchor','middle')

intro.append('text')
    .text('is primarily generated in the West and Midwest, while oil is primarily generated in Alaska and the Midwest.')
    .attr('x', window.outerWidth / 2)
    .attr('y',headerVars.titleVertSpacing + headerVars.subheadVertSpacing*2 + 390 + headerVars.subheadVertSpacing)
    .attr('text-anchor','middle')

var text1 = d3.select("#text_vis2").attr('width',window.outerWidth).attr('height',400)

text1.append('text')
    .text('Power Markets and Consumption')
    .attr('x', window.outerWidth / 2)
    .attr('y',100)
    .attr('text-anchor','middle')
    .attr('font-weight','bold')
    .attr('font-size','25px')

text1.append('text')
    .text('Once electricity is generated, it is sold to consumers or load-serving entities. In much of the US, this is')
    .attr('x', window.outerWidth / 2)
    .attr('y', 160)
    .attr('text-anchor','middle')

text1.append('text')
    .text('done through competitive wholesale markets managed by regional organizations called Independent Service')
    .attr('x', window.outerWidth / 2)
    .attr('y', 190)
    .attr('text-anchor','middle')

text1.append('text')
    .text('Operators (ISOs). In the wholesale market, electricity prices are determined by supply and demand where')
    .attr('x', window.outerWidth / 2)
    .attr('y', 220)
    .attr('text-anchor','middle')

text1.append('text')
    .text('power plants determine energy supply, and ultimately the end user determines energy demand. Use the visualization')
    .attr('x', window.outerWidth / 2)
    .attr('y', 250)
    .attr('text-anchor','middle')

text1.append('text')
    .text('below to explore what daily energy load (demand) and locational marginal pricing (cost) look like for the past')
    .attr('x', window.outerWidth / 2)
    .attr('y', 280)
    .attr('text-anchor','middle')

text1.append('text')
    .text('few years in different ISO regions. Observe how the peak demand changes in different seasons, days of the week,')
    .attr('x', window.outerWidth / 2)
    .attr('y', 310)
    .attr('text-anchor','middle')

text1.append('text')
    .text('and ISO regions, and how the peaks in price correspond to daily peaks in demand.')
    .attr('x', window.outerWidth / 2)
    .attr('y', 340)
    .attr('text-anchor','middle')

var text2 = d3.select('#text_vis3').attr('width',window.outerWidth).attr('height',430)

text2.append('text')
    .text('Grid Resiliency')
    .attr('x', window.outerWidth / 2)
    .attr('y',60)
    .attr('text-anchor','middle')
    .attr('font-weight','bold')
    .attr('font-size','25px')

text2.append('text')
    .text('We often don???t think much about electricity until there is an outage. As our current power lines, which')
    .attr('x', window.outerWidth / 2)
    .attr('y', 120)
    .attr('text-anchor','middle')

text2.append('text')
    .text('were constructed in the 1950s and 60s, reach their age limitations and we face an increasing number of')
    .attr('x', window.outerWidth / 2)
    .attr('y', 150)
    .attr('text-anchor','middle')

text2.append('text')
    .text('extreme weather events due to climate change, ensuring that the grid can withstand unexpected disruptions')
    .attr('x', window.outerWidth / 2)
    .attr('y', 180)
    .attr('text-anchor','middle')

text2.append('text')
    .text('or failures will be increasingly important. The map below shows grid outages reported by major electricity')
    .attr('x', window.outerWidth / 2)
    .attr('y', 210)
    .attr('text-anchor','middle')

text2.append('text')
    .text('providers and operators for every month from 2000 to 2014 sized by the number of customers that were affected')
    .attr('x', window.outerWidth / 2)
    .attr('y', 240)
    .attr('text-anchor','middle')

text2.append('text')
    .text('and colored by the cause of the outage. The scatter plot on the right shows another view of the same data, where')
    .attr('x', window.outerWidth / 2)
    .attr('y', 270)
    .attr('text-anchor','middle')

text2.append('text')
    .text('the x-axis represents time and the y-axis represents number of customers affected. You can use the slider to move')
    .attr('x', window.outerWidth / 2)
    .attr('y', 300)
    .attr('text-anchor','middle')

text2.append('text')
    .text('both the map and scatter plot through time. Observe that most of the outages are due to severe weather events')
    .attr('x', window.outerWidth / 2)
    .attr('y', 330)
    .attr('text-anchor','middle')

text2.append('text')
    .text('or equipment failure. This highlights the need to modernize energy system to deal with the demands and climate')
    .attr('x', window.outerWidth / 2)
    .attr('y', 360)
    .attr('text-anchor','middle')

text2.append('text')
    .text('risk of the 21st century.')
    .attr('x', window.outerWidth / 2)
    .attr('y', 390)
    .attr('text-anchor','middle')

var references = d3.select('#outro').attr('width',window.outerWidth).attr('height',400)

references.append('text')
    .attr('x',window.outerWidth / 2)
    .attr('y', 150)
    .text('Datasets')
    .attr('text-anchor','middle')
    .attr('font-family','Montserrat')
    .attr('font-weight','bold')
    .attr('font-size','25px')

references.append('text')
    .attr('x',window.outerWidth / 2)
    .attr('y',200)
    .text('https://datasets.wri.org/dataset/globalpowerplantdatabase')
    .attr('text-anchor','middle')
    .attr('font-family','Montserrat')
    .attr('font-size','17px')
    .attr('text-decoration','underline')
    .on('click', function(event,d) {
        window.open('https://datasets.wri.org/dataset/globalpowerplantdatabase')
    })
    .on('mouseover',function(event,d) {
        d3.select(this).style('cursor','pointer');
    })

references.append('text')
    .attr('x',window.outerWidth / 2)
    .attr('y',230)
    .text('https://github.com/tamu-engineering-research/COVID-EMDA')
    .attr('text-anchor','middle')
    .attr('font-family','Montserrat')
    .attr('font-size','17px')
    .attr('text-decoration','underline')
    .on('click', function(event,d) {
        window.open('https://github.com/tamu-engineering-research/COVID-EMDA')
    })
    .on('mouseover',function(event,d) {
        d3.select(this).style('cursor','pointer');
    })

references.append('text')
    .attr('x',window.outerWidth / 2)
    .attr('y',260)
    .text('http://insideenergy.org/2014/08/18/data-explore-15-years-of-power-outages')
    .attr('text-anchor','middle')
    .attr('font-family','Montserrat')
    .attr('font-size','17px')
    .attr('text-decoration','underline')
    .on('click', function(event,d) {
        window.open('http://insideenergy.org/2014/08/18/data-explore-15-years-of-power-outages')
    })
    .on('mouseover',function(event,d) {
        d3.select(this).style('cursor','pointer');
    })

references.append('text')
    .attr('x',window.outerWidth / 2)
    .attr('y',350)
    .text('Nina Prakash | CS 448b Fall 2021 @ Stanford University')
    .attr('text-anchor','middle')
    .attr('font-family','Montserrat')
    .attr('font-size','12px')