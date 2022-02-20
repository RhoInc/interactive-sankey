export default //Customizable template settings
{
    id_col: 'USUBJID',
    node_col: null,
    link_col: null,

    //Standard template settings
    x: { type: 'ordinal' },
    y: { type: 'linear' },
    marks: [
        {
            type: 'bar',
            arrange: 'stacked',
            summarizeY: 'count',
            tooltip: '$y at $x'
        }
    ],
    legend: {}
};

export function syncSettings(settings) {
    settings.x.column = settings.node_col;
    settings.x.label = settings.node_col;
    settings.y.column = settings.id_col;
    settings.y.label = '# of ' + settings.id_col + 's';
    settings.marks[0].per = [settings.node_col];
    settings.marks[0].split = settings.link_col;
    settings.color_by = settings.link_col;

    return settings;
}

export const controlInputs = [];

export function syncControlInputs(controlInputs, settings) {
    return controlInputs;
}
