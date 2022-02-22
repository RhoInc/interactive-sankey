import './util/object-assign';
import defaultSettings, { syncSettings } from './settings';
import callbacks from './callbacks/index';
import { createChart } from 'webcharts';

export default function interactiveSankey(element, settings) {
    //Merge user's settings with default settings..
    const mergedSettings = Object.assign({}, defaultSettings, settings);

    //Sync settings with data mappings.
    const syncedSettings = syncSettings(mergedSettings);

    //Create chart.
    const chart = createChart(element, syncedSettings);

    for (const callback in callbacks)
        chart.on(callback.toLowerCase().substring(2), callbacks[callback]);

    return chart;
}
