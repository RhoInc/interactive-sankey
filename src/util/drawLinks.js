export default function drawLinks(chartObject, bars1, bars2, linkClass) {

  //Merge adjacent bar groups by [ config.y.column ].
    var linkData = [];
    bars1.each(function(bar1,i1) {
        bars2.each(function(bar2,i2) {
            bar1.values.raw.forEach(function(id1) {
                bar2.values.raw.forEach(function(id2) {
                    if (id1[chartObject.config.y.column] === id2[chartObject.config.y.column])
                        linkData.push(
                            {id: id1[chartObject.config.y.column]
                            ,split1: id1[chartObject.config.color_by]
                            ,x1: id1[chartObject.config.x.column]
                            ,split2: id2[chartObject.config.color_by]
                            ,x2: id2[chartObject.config.x.column]});
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
            var cat1 = bars1.data()[0].values.x;
            var bar1 = bars1
                .filter(dii => dii.key === d.key)
                .data()[0]
                .values;
            var offset1 = 0;
            d.values.sort((a,b) =>
                a.key < b.key ? -1 :
                b.key < a.key ?  1 : 0);

            d.values.forEach(di => {
                var cat2 = bars2.data()[0].values.x;
                var bar2 = bars2
                    .filter(dii => dii.key === di.key)
                    .data()[0]
                    .values;
                offsetList.push({key: di.key, offset: 0});
                var offset2 = offsetList.filter(dii => dii.key === di.key)[0].offset;

                collapsedLinkData.push(
                    {split1: d.key
                    ,split2: di.key

                    ,x1: chartObject.x(cat1)
                    ,x2: chartObject.x(cat2)

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
                    ,height: chartObject.y(di.values.n)
                    
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

                    ,x: d.x1 + chartObject.x.rangeBand()
                    ,y0: chartObject.y(d.y01)
                    ,y1: chartObject.y(d.y11)}
                ,   {x: d.x2
                    ,y0: chartObject.y(d.y02)
                    ,y1: chartObject.y(d.y12)}];
            chartObject.svg
                .append('path')
                .datum(path)
                .attr(
                    {'d': pathDrawer
                    ,'class': 'link ' + linkClass})
                .style(
                    {'fill': () => chartObject.colorScale(d.split1)
                    ,'fill-opacity': .5
                    ,'stroke': () => chartObject.colorScale(d.split1)
                    ,'stroke-opacity': .5});
        });
}
