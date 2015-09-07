var data = []

var svg = d3.select("#vis")
            .append("svg")
            .attr("width",200)
            .attr("height",150);
svg.append("circle").style("stroke","gray")
                    .style("fill","white")
                    .attr("r",40)
                    .attr("cx",50)
                    .attr("cy",50)
                    .on("mouseover",function(){d3.select(this).style("fill","blue");})
                    .on("mouseout",function(){d3.select(this).style("fill","white");});
