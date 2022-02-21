const settings = {
    id_col: 'Participant ID',
    node_col: 'Month',
    link_col: 'Peanut IgG Threshold (log 10)',
    aspect: 4
};

d3.csv('./data.csv', function(data) {
    data.forEach(function(d) {
        d['Participant ID'] = d.participantId;
        d.Month = +d.VISITNUM > 0 ? d.VISITNUM : '0';
        d['Peanut IgG Threshold (log 10)'] = 0 +
            (+d.LPNTRES >=  1)*1 +
            (+d.LPNTRES >=  0)*1 +
            (+d.LPNTRES >= -1)*1 +
            (+d.LPNTRES >= -2)*1;
    });

    const v0  = data.filter(d => +d.Month ===  0).map(d => d.participantId);
    const v12 = data.filter(d => +d.Month === 12).map(d => d.participantId);
    const v30 = data.filter(d => +d.Month === 30).map(d => d.participantId);
    const v60 = data.filter(d => +d.Month === 60).map(d => d.participantId);

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
