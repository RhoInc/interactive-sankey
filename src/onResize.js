import drawLinks from './util/drawLinks';

export default function onResize() {
    var context = this;

  //Reset displays.
    this.wrap.selectAll('path.link').remove();
    this.wrap.selectAll('.barAnnotation').remove();

  //Update legend to represent categories represented in chart.
    this.makeLegend();
    var currentLinks = d3.set(this.filtered_data.map(d => d[context.config.link_col]))
        .values();
    this.wrap.selectAll('.legend-item')
        .filter(function() {
            return currentLinks.indexOf(d3.select(this).select('.legend-label')[0][0].textContent) === -1; })
        .remove();

    /**-------------------------------------------------------------------------------------------\
      Default links
    \-------------------------------------------------------------------------------------------**/

      //Capture stacked bar groups.
        var barGroups = this.svg.selectAll('.bar-group');
        var nBarGroups = barGroups[0].length - 1;
        barGroups.each(function(barGroup,i) {
          //Annotate bars and modify tooltips.
            var yPosition = barGroup.total;
            d3.select(this).selectAll('rect.wc-data-mark')
                .each(function (d) {
                    var bar = d3.select(this);
                    bar.classed(d.key.replace(/[^a-z0-9]/gi, ''), true);
                    var IDs = d.values.raw.map(d => d[context.config.id_col]);
                    var n = d.values.raw.length;
                    var N = context.raw_data.filter(di => di[context.config.node_col] === d.values.x).length;
                    var pct = n / N;
                    d3.select(bar.node().parentNode)
                        .append('text')
                        .datum([{node: d.values.x, link: d.key, text: n + ' (' + d3.format('%')(pct) + ')'}])
                        .attr(
                            {'class': 'barAnnotation'
                            ,'x': di => context.x(d.values.x)
                            ,'y': di => context.y(yPosition)
                            ,'dx': '.25em'
                            ,'dy': '.9em' })
                        .text(n + ' (' + d3.format('%')(pct) + ')');
                    bar.select('title')
                        .text(n + ' ' + context.config.id_col + 's at ' + d.key + ' (' + d3.format('%')(pct) + '):' +
                            '\n - ' + IDs.slice(0, 3).join('\n - ') + (n > 3 ? '\n - and ' + (n - 3) + ' more' : ''));
                    yPosition -= n;
                });

          //Draw links from any bar group except the last bar group.
            if (i < nBarGroups) {
                var barGroup1 = d3.select(this);
                var barGroup2 = d3.select(barGroups[0][i + 1]);
                drawLinks
                    (context
                    ,barGroup1.selectAll('.bar')
                    ,barGroup2.selectAll('.bar')
                    ,'defaultLink');
            }
        });

    /**-------------------------------------------------------------------------------------------\
      Selected links
    \-------------------------------------------------------------------------------------------**/

      //Flatten [ this.current_data ] to one item per node per link.
        var barData = [];
        this.current_data.forEach(d => {
            d.values.forEach(di => {
                barData.push(
                    {node: d.key
                    ,link: di.key
                    ,start: di.values.start});
            });
        });

      //Add click event listener to bars.
        var bars = this.wrap.selectAll('rect.wc-data-mark');
        bars.style('cursor', 'pointer')
            .on('click', function(d) {
              //Reduce bar opacity.
                var thisBar = this;
                bars.style('fill-opacity', .25);
                context.wrap.selectAll('.defaultLink').style('display', 'none');
                context.wrap.selectAll('.barAnnotation').style('display', 'none');
                context.wrap.selectAll('.selectedIDs').remove();
                context.wrap.selectAll('.selectedLink').remove();
              //Capture [ settings.id_col ] values represented by selected bar.
                var selectedIDs = d.values.raw.map(d => d[context.config.id_col]);
              //Filter raw data on selected [ settings.id_col ] values and nest by node and link.
                var selectedData = d3.nest()
                    .key(d => d[context.config.node_col])
                    .key(d => d[context.config.link_col])
                    .rollup(d => d.length)
                    .entries(context.raw_data
                        .filter(d => selectedIDs.indexOf(d[context.config.id_col]) > -1));
              //Flatten nested data to one item per node per link.
                var selectedBarData = [];
                selectedData
                    .forEach(d => {
                        d.values.forEach(di =>
                            selectedBarData.push(
                                {key: di.key
                                ,values:
                                    {raw: context.raw_data
                                        .filter(dii =>
                                            selectedIDs.indexOf(dii[context.config.id_col]) > -1 &&
                                            dii[context.config.node_col].toString() === d.key.toString() &&
                                            dii[context.config.link_col].toString() === di.key.toString())
                                    ,x: d.key
                                    ,y: di.values
                                    ,start: barData.filter(dii => dii.node === d.key && dii.link === di.key)[0].start}}));
                    });
              //Draw bars.
                var selectedIDbars = context.svg.selectAll('rect.selectedIDs')
                    .data(selectedBarData).enter()
                    .append('rect')
                    .attr(
                        {class: 'selectedIDs'
                        ,x: d => context.x(d.values.x)
                        ,y: d => context.y(d.values.start)
                        ,width: d3.select(this).attr('width')
                        ,height: d => context.y(d.values.start - d.values.y) - context.y(d.values.start)})
                    .style(
                        {fill: d => context.colorScale(d.key)
                        ,stroke: d => context.colorScale(d.key)});
              //Annotate bars.
                context.svg.selectAll('text.selectedIDs')
                    .data(selectedBarData).enter()
                    .append('text')
                    .attr(
                        {class: 'selectedIDs'
                        ,x: d => context.x(d.values.x)
                        ,y: d => context.y(d.values.start)
                        ,dx: '.25em'
                        ,dy: '.9em' })
                    .text(d => d.values.y + ' (' + d3.format('%')(d.values.y/selectedIDs.length) + ')');
              //Draw links.
                var nodes = selectedData.map(d => d.key);
                for (var i = 0; i < nodes.length; i++) {
                    if (i < (nodes.length - 1)) {
                        drawLinks
                            (context
                            ,selectedIDbars.filter(d => d.values.x === nodes[i    ])
                            ,selectedIDbars.filter(d => d.values.x === nodes[i + 1])
                            ,'selectedLink');
                    }
                }
              //Add click event listener to selected bars.
                selectedIDbars
                    .style('cursor', 'pointer')
                    .on('click', function() {
                        bars.style('fill-opacity', 1);
                        selectedIDbars.remove();
                        context.wrap.selectAll('text.selectedIDs').remove();
                        context.wrap.selectAll('.selectedLink').remove();
                        context.wrap.selectAll('.defaultLink').style('display', '');
                        context.wrap.selectAll('.barAnnotation').style('display', '');
                    });
            });
}
