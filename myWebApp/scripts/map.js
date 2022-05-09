window.onload = function () {
    let margin = { top: 20, right: 20, bottom: 20, left: 20 };
    width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom,
        formatPercent = d3.format(".2f");

    // The svg
    let svg = d3.select("#map").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(d3.behavior.zoom()
            // .scaleExtent([1, 5])
            .on("zoom", function () {
            svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
        }));

    tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Load csv and json
    queue()
        .defer(d3.csv, "data/internet_usage.csv")
        .defer(d3.json, "data/countries-110m.json")
        .await(ready);

    const legendText = ["N/A", "", "10%", "", "30%", "", "50%", "", "70%", "", "90%", ""];
    const legendColors = ["#000000", "#9e0142", "#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#e6f598", "#abdda4", "#66c2a5", "#3288bd", "#5e4fa2"];

    function ready(error, data, world) {

        //parse map
        const countries = topojson.feature(world, world.objects.countries);

        //parse csv
        data.forEach(function (d) {
            d.country = d.country;
            d.year = +d.year;
            d.code = d.code;
            d.percent = +d.percent
        });

        //make object for csv
        const dataByCountryByYear = d3.nest()
            .key(function (d) { return d.country; })
            .key(function (d) { return d.year; })
            .map(data);

        countries.features.forEach(function (country) {
            country.properties.years = dataByCountryByYear[country.properties.name];
        });

        const color = d3.scale.threshold()
            .domain([-0.001, 10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 70.0, 80.0, 90.0, 100])
            .range(["#000000", "#9e0142", "#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#e6f598", "#abdda4", "#66c2a5", "#3288bd", "#5e4fa2"]);

        const projection = d3.geo.equirectangular()
            .rotate([0, 0])
            .scale(125)
            .translate([width / 2, height / 2]);

        const path = d3.geo.path().projection(projection);

        const countryShapes = svg.selectAll(".country")
            .data(countries.features)
            .enter()
            .append("path")
            .attr("class", "country")
            .attr("d", path);

        const legend = svg.append("g")
            .attr("id", "legend");

        const legenditem = legend.selectAll(".legenditem")
            .data(d3.range(11))
            .enter()
            .append("g")
            .attr("class", "legenditem")
            .attr("transform", function (d, i) { return "translate(" + i * 25 + ",0)"; });

        legenditem.append("rect")
            .attr("x", width - 264)
            .attr("y", -7)
            .attr("width", 24)
            .attr("height", 6)
            .attr("class", "rect")
            .style("fill", function (d, i) { return legendColors[i]; });

        legenditem.append("text")
            .attr("x", width - 264)
            .attr("y", -10)
            .style("text-anchor", "middle")
            .text(function (d, i) { return legendText[i]; });

        function update(year) {
            slider.property("value", year);
            d3.select(".year").text(year);
            countryShapes
                .on("mouseover", function (d) {
                    tooltip.transition()
                        .duration(250)
                        .style("opacity", 1);
                    tooltip.html(
                        "<table><tbody><tr><td class='wide'>" + d.properties.years[year][0].country + " (" + d.properties.years[year][0].code + ")</td><td>" + + d.properties.years[year][0].year + "</td></tr>" +
                        "<table><tbody><tr><td class='wide'>% of Population:</td><td>" + (d.properties.years[year][0].percent >= 0 ? formatPercent(d.properties.years[year][0].percent) + '%' : "No Data") + "</td></tr>"
                    )
                        .style("left", (d3.event.pageX + 15) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function (d) {
                    tooltip.transition()
                        .duration(250)
                        .style("opacity", 0);
                })
                .style("fill", function (d) {
                    return color(d.properties.years[year][0].percent);
                });
        }

        const slider = d3.select(".slider")
            .append("input")
            .attr("type", "range")
            .attr("min", 1960)
            .attr("max", 2020)
            .attr("step", 1)
            .on("input", function () {
                const year = this.value;
                update(year);
            });

        update(1960);
    }
    d3.select(self.frameElement).style("height", "685px");
}