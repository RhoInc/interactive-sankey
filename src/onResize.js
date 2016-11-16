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
                var bars1 = barGroup1.selectAll('.bar');
                var bars2 = barGroup2.selectAll('.bar');

              //Merge adjacent bar groups by [ config.y.column ].
                var linkData = [];
                bars1.each(function(bar1,i1) {
                    bars2.each(function(bar2,i2) {
                        bar1.values.raw.forEach(function(id1) {
                            bar2.values.raw.forEach(function(id2) {
                                if (id1[context.config.y.column] === id2[context.config.y.column])
                                    linkData.push(
                                        {id: id1[context.config.y.column]
                                        ,split1: id1[context.config.color_by]
                                        ,x1: id1[context.config.x.column]
                                        ,split2: id2[context.config.color_by]
                                        ,x2: id2[context.config.x.column]});
                            });
                        });
                    });
                });

              //Nest merged bar groups by their respective [ config.marks.color_by ] values.
                var nestedLinkData = d3.nest()
                    .key(d => d.split1)
                    .key(d => d.split2)
                    .rollup(d => { return {n: d.length, IDs: d.map(di => di.id)}; })
                    .entries(linkData);
                nestedLinkData
                    .sort((a,b) => a.key > b.key ? 1 : -1);

              //Flatten nested data array to one item per left bar [ config.marks.color_by ]
              //value per right bar [ config.marks.color_by ] value.
                var collapsedLinkData = [];
                var offsetList = [];
                nestedLinkData
                    .forEach((d,i) => {
                        var cat1 = barGroup1.data()[0].key;
                        var bar1 = bars1
                            .filter(dii => dii.key === d.key)
                            .data()[0]
                            .values;
                        var offset1 = 0;
                        d.values.sort((a,b) =>
                            a.key < b.key ? -1 :
                            b.key < a.key ?  1 : 0);

                        d.values.forEach(di => {
                            var cat2 = barGroup2.data()[0].key;
                            var bar2 = bars2
                                .filter(dii => dii.key === di.key)
                                .data()[0]
                                .values;
                            offsetList.push({key: di.key, offset: 0});
                            var offset2 = offsetList.filter(dii => dii.key === di.key)[0].offset;

                            collapsedLinkData.push(
                                {split1: d.key
                                ,split2: di.key

                                ,x1: context.x(cat1)
                                ,x2: context.x(cat2)

                                ,y1: bar1.y
                                ,y2: bar2.y

                                ,start1: bar1.start
                                ,start2: bar2.start

                                ,stop1: bar1.start - bar1.y
                                ,stop2: bar2.start - bar2.y

                                ,y01: bar1.start - bar1.y + offset1
                                ,y11: bar1.start - bar1.y + di.values.n + offset1

                                ,y02: bar2.start - bar2.y + offset2
                                ,y12: bar2.start - bar2.y + di.values.n + offset2

                                ,n: di.values.n
                                ,height: context.y(di.values.n)
                                
                                ,IDs: di.values.IDs});

                            offset1 += collapsedLinkData[collapsedLinkData.length - 1].n;
                            offsetList.filter(dii => dii.key === di.key)[0]
                                .offset += di.values.n;
                        });
                    });

              //Draw links.
                var pathDrawer = d3.svg.area()
                    .x(d => d.x)
                    .y0(d => d.y0)
                    .y1(d => d.y1);
                collapsedLinkData
                    .forEach((d,i) => {
                        var path =
                            [   {split1: d.split1
                                ,split2: d.split2
                                ,n: d.n
                                ,IDs: d.IDs

                                ,x: d.x1 + context.x.rangeBand()
                                ,y0: context.y(d.y01)
                                ,y1: context.y(d.y11)}
                            ,   {x: d.x2
                                ,y0: context.y(d.y02)
                                ,y1: context.y(d.y12)}];
                        context.svg
                            .append('path')
                            .datum(path)
                            .attr(
                                {'d': pathDrawer
                                ,'class': 'link'})
                            .style(
                                {'fill': () => context.colorScale(d.split1)
                                ,'fill-opacity': .5
                                ,'stroke': () => context.colorScale(d.split1)
                                ,'stroke-opacity': .5});
                    });
            }

          //Add event listeners and tooltips to links.
            var links = d3.selectAll('path.link');
            links
                .on('mouseover', function() {
                    d3.select(this)
                        .style(
                            {'fill-opacity': 1
                            ,'stroke-opacity': 1}); })
                .on('mouseout', function() {
                    d3.select(this)
                        .style(
                            {'fill-opacity': .5
                            ,'stroke-opacity': .5}); })
                .append('title')
                .text(d => {
                    var n = d[0].n;
                    var split1 = d[0].split1;
                    var split2 = d[0].split2;
                    var IDs = d[0].IDs;
                    return  n + ' ' + context.config.y.column
                        +   (n > 1 ? 's ' : ' ')
                        +   (split1 === split2 ?
                             'remained at ' + split1 :
                             'progressed from ' + split1 + ' to ' + split2) + ':\n - '
                        + IDs.slice(0,3).join('\n - ')
                        + (n > 3 ? '\n - and ' + (n - 3) + ' more' : '');
                });
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
                bars.style('fill-opacity', .25);
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
                selectedData.forEach(d => {
                    d.values.forEach(di => {
                        selectedBarData.push(
                            {node: d.key
                            ,link: di.key
                            ,start: barData.filter(dii => dii.node === d.key && dii.link === di.key)[0].start
                            ,n: di.values});
                    });
                });
              //Draw bars.
                context.wrap.selectAll('.selectedIDs').remove();
                var selectedIDbars = context.svg.selectAll('rect.selectedIDs')
                    .data(selectedBarData).enter()
                    .append('rect')
                    .attr(
                        {class: 'selectedIDs'
                        ,x: d => context.x(d.node)
                        ,y: d => context.y(d.start)
                        ,width: d3.select(this).attr('width')
                        ,height: d => context.y(d.start - d.n) - context.y(d.start)})
                    .style(
                        {fill: d => context.colorScale(d.link)
                        ,stroke: d => context.colorScale(d.link)});
            });
}
