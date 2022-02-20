const settings = {
    id_col: 'Participant ID',
    node_col: 'Visit',
    link_col: 'Peanut IgG Threshold (log 10)',
    aspect: 4
};

d3.csv('data.csv', function(data) {
    data.forEach(function(d) {
        d['Participant ID'] = d.participantId;
        d.Visit = +d.VISITNUM > 0 ? d.VISITNUM : '0';
        d['Peanut IgG Threshold (log 10)'] = 0 +
            (+d.LPNTRES >=  1)*1 +
            (+d.LPNTRES >=  0)*1 +
            (+d.LPNTRES >= -1)*1 +
            (+d.LPNTRES >= -2)*1;
    });

    const v0  = data.filter(d => +d.Visit ===  0).map(d => d.participantId);
    const v12 = data.filter(d => +d.Visit === 12).map(d => d.participantId);
    const v30 = data.filter(d => +d.Visit === 30).map(d => d.participantId);
    const v60 = data.filter(d => +d.Visit === 60).map(d => d.participantId);

    const filteredData = data
        .filter(d =>
            v0.indexOf(d.participantId) > -1 &&
            v12.indexOf(d.participantId) > -1 &&
            v30.indexOf(d.participantId) > -1 &&
            v60.indexOf(d.participantId) > -1
        );

    interactiveSankey('#consumption', settings)
        .init(filteredData.filter(d => d.TRTC === 'Peanut Consumption'));

    interactiveSankey('#avoidance', settings)
        .init(filteredData.filter(d => d.TRTC === 'Peanut Avoidance'));
});
