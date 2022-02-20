import drawLinks from './onResize/drawLinks';

export default function onResize() {
    const chart = this;

    //Reset displays.
    this.wrap.selectAll('path.link').remove();
    this.wrap.selectAll('.barAnnotation').remove();

    //Update legend to represent categories represented in chart.
    this.makeLegend();
    var currentLinks = d3.set(this.filtered_data.map(d => d[chart.config.link_col])).values();
    this.wrap
        .selectAll('.legend-item')
        .filter(function() {
            return (
                currentLinks.indexOf(d3.select(this).select('.legend-label')[0][0].textContent) ===
                -1
            );
        })
        .remove();

    /**-------------------------------------------------------------------------------------------\
      Default links
    \-------------------------------------------------------------------------------------------**/

    //Capture stacked bar groups.
    var barGroups = this.svg.selectAll('.bar-group');
    var nBarGroups = barGroups[0].length - 1;
    barGroups.each(function(barGroup, i) {
        //Annotate bars and modify tooltips.
        var yPosition = barGroup.total;
        d3.select(this)
            .selectAll('rect.wc-data-mark')
            .each(function(d) {
                var bar = d3.select(this);
                bar.classed(d.key.replace(/[^a-z0-9]/gi, ''), true);
                var IDs = d.values.raw.map(d => d[chart.config.id_col]);
                var n = d.values.raw.length;
                var N = chart.raw_data.filter(di => di[chart.config.node_col] === d.values.x)
                    .length;
                var pct = n / N;
                d3.select(bar.node().parentNode)
                    .append('text')
                    .datum([
                        {
                            node: d.values.x,
                            link: d.key,
                            text: n + ' (' + d3.format('%')(pct) + ')'
                        }
                    ])
                    .attr({
                        class: 'barAnnotation',
                        x: di => chart.x(d.values.x),
                        y: di => chart.y(yPosition),
                        dx: '.25em',
                        dy: '.9em'
                    })
                    .text(n + ' (' + d3.format('%')(pct) + ')');
                bar.select('title').text(
                    n +
                        ' ' +
                        chart.config.id_col +
                        's at ' +
                        d.key +
                        ' (' +
                        d3.format('%')(pct) +
                        '):' +
                        '\n - ' +
                        IDs.slice(0, 3).join('\n - ') +
                        (n > 3 ? '\n - and ' + (n - 3) + ' more' : '')
                );
                yPosition -= n;
            });

        //Draw links from any bar group except the last bar group.
        if (i < nBarGroups) {
            var barGroup1 = d3.select(this);
            var barGroup2 = d3.select(barGroups[0][i + 1]);
            drawLinks(
                chart,
                barGroup1.selectAll('.bar'),
                barGroup2.selectAll('.bar'),
                'defaultLink'
            );
        }
    });

    /**-------------------------------------------------------------------------------------------\
      Selected links
    \-------------------------------------------------------------------------------------------**/

    //Flatten [ this.current_data ] to one item per node per link.
    var barData = [];
    this.current_data.forEach(d => {
        d.values.forEach(di => {
            barData.push({
                node: d.key,
                link: di.key,
                start: di.values.start
            });
        });
    });

    //Add click event listener to bars.
    var bars = this.wrap.selectAll('rect.wc-data-mark');
    bars.style('cursor', 'pointer').on('click', function(d) {
        //Reduce bar opacity.
        var thisBar = this;
        bars.style('fill-opacity', 0.25);
        chart.wrap.selectAll('.defaultLink').style('display', 'none');
        chart.wrap.selectAll('.barAnnotation').style('display', 'none');
        chart.wrap.selectAll('.selectedIDs').remove();
        chart.wrap.selectAll('.selectedLink').remove();
        //Capture [ settings.id_col ] values represented by selected bar.
        var selectedIDs = d.values.raw.map(d => d[chart.config.id_col]);
        //Filter raw data on selected [ settings.id_col ] values and nest by node and link.
        var selectedData = d3
            .nest()
            .key(d => d[chart.config.node_col])
            .key(d => d[chart.config.link_col])
            .rollup(d => d.length)
            .entries(chart.raw_data.filter(d => selectedIDs.indexOf(d[chart.config.id_col]) > -1));
        //Flatten nested data to one item per node per link.
        var selectedBarData = [];
        selectedData.forEach(d => {
            d.values.forEach(di =>
                selectedBarData.push({
                    key: di.key,
                    values: {
                        raw: chart.raw_data.filter(
                            dii =>
                                selectedIDs.indexOf(dii[chart.config.id_col]) > -1 &&
                                dii[chart.config.node_col].toString() === d.key.toString() &&
                                dii[chart.config.link_col].toString() === di.key.toString()
                        ),
                        x: d.key,
                        y: di.values,
                        start: barData.filter(dii => dii.node === d.key && dii.link === di.key)[0]
                            .start
                    }
                })
            );
        });
        //Draw bars.
        var selectedIDbars = chart.svg
            .selectAll('rect.selectedIDs')
            .data(selectedBarData)
            .enter()
            .append('rect')
            .attr({
                class: 'selectedIDs',
                x: d => chart.x(d.values.x),
                y: d => chart.y(d.values.start),
                width: d3.select(this).attr('width'),
                height: d => chart.y(d.values.start - d.values.y) - chart.y(d.values.start)
            })
            .style({
                fill: d => chart.colorScale(d.key),
                stroke: d => chart.colorScale(d.key)
            });
        selectedIDbars.each(function() {
            d3.select(this)
                .append('title')
                .text(
                    di =>
                        di.values.y +
                        ' ' +
                        chart.config.id_col +
                        's at ' +
                        di.values.x +
                        ' (' +
                        d3.format('%')(di.values.y / selectedIDs.length) +
                        '):' +
                        '\n - ' +
                        di.values.raw
                            .map(dii => dii[chart.config.id_col])
                            .slice(0, 3)
                            .join('\n - ') +
                        (di.values.y > 3 ? '\n - and ' + (di.values.y - 3) + ' more' : '')
                );
        });
        //Annotate bars.
        chart.svg
            .selectAll('text.selectedIDs')
            .data(selectedBarData)
            .enter()
            .append('text')
            .attr({
                class: 'selectedIDs',
                x: d => chart.x(d.values.x),
                y: d => chart.y(d.values.start),
                dx: '.25em',
                dy: '.9em'
            })
            .text(d => d.values.y + ' (' + d3.format('%')(d.values.y / selectedIDs.length) + ')');
        //Draw links.
        var nodes = selectedData.map(d => d.key);
        for (var i = 0; i < nodes.length; i++) {
            if (i < nodes.length - 1) {
                drawLinks(
                    chart,
                    selectedIDbars.filter(d => d.values.x === nodes[i]),
                    selectedIDbars.filter(d => d.values.x === nodes[i + 1]),
                    'selectedLink'
                );
            }
        }
        //Add click event listener to selected bars.
        selectedIDbars.style('cursor', 'pointer').on('click', function() {
            bars.style('fill-opacity', 1);
            selectedIDbars.remove();
            chart.wrap.selectAll('text.selectedIDs').remove();
            chart.wrap.selectAll('.selectedLink').remove();
            chart.wrap.selectAll('.defaultLink').style('display', '');
            chart.wrap.selectAll('.barAnnotation').style('display', '');
        });
    });
}
