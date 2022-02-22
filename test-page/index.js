const settings = {
    id_col: 'Participant',
    node_col: 'Study Month',
    node_col: 'timepoint',
    link_col: 'Peanut IgG Threshold (log 10)',
    link_col: 'stratum',
    legend: {
        order: [
            'low',
            'medium',
            'high',
            'extreme'
        ]
    },
    aspect: 4,
    displayAnnotations: false
};

d3.csv('./data.csv', function(data) {
    data.forEach(function(d) {
        d['Participant'] = d.participantId;

        d['Study Month'] = +d.VISITNUM > 0
            ? d.VISITNUM
            : '0';

        d.timepoint = +d.VISITNUM > 0
            ? `Month ${d.VISITNUM}`
            : `Screening`;

        d['Peanut IgG Threshold (log 10)'] = 0 +
            (+d.LPNTRES >=  1)*1 +
            (+d.LPNTRES >=  0)*1 +
            (+d.LPNTRES >= -1)*1 +
            (+d.LPNTRES >= -2)*1;

        d.stratum = +d.LPNTRES >=  1
            ? 'low'
            : +d.LPNTRES >=  0
            ? 'medium'
            : +d.LPNTRES >=  -1
            ? 'high'
            : +d.LPNTRES >=  -2
            ? 'extreme'
            : '?';

    });

    const v0  = data.filter(d => +d['Study Month'] ===  0).map(d => d.participantId);
    const v12 = data.filter(d => +d['Study Month'] === 12).map(d => d.participantId);
    const v30 = data.filter(d => +d['Study Month'] === 30).map(d => d.participantId);
    const v60 = data.filter(d => +d['Study Month'] === 60).map(d => d.participantId);

    // Display only those participants with results at all four visits.
    const filteredData = data
        .filter(d =>
            v0.indexOf(d.participantId) > -1 &&
            v12.indexOf(d.participantId) > -1 &&
            v30.indexOf(d.participantId) > -1 &&
            v60.indexOf(d.participantId) > -1
        );

    interactiveSankey('#consumption', JSON.parse(JSON.stringify(settings)))
        .init(filteredData.filter(d => d.TRTC === 'Peanut Consumption'));

    interactiveSankey('#avoidance', JSON.parse(JSON.stringify(settings)))
        .init(filteredData.filter(d => d.TRTC === 'Peanut Avoidance'));
});
