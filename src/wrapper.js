import { createChart, createControls, createTable } from 'webcharts';
import { controlInputs, syncControlInputs, syncSettings } from './default-settings'
import config from './default-settings';
import onInit from './onInit';
import onLayout from './onLayout';
import onDataTransform from './onDataTransform';
import onDraw from './onDraw';
import onResize from './onResize';
import './util/object-assign';

export default function interactiveSankey(element, settings) {

  //Merge user's settings with default settings..
    let mergedSettings = Object.assign({}, config, settings);

  //Sync settings with data mappings.
    mergedSettings = syncSettings(mergedSettings);

  //Sync settings with control inputs.
    //let syncedControlInputs = syncControlInputs(controlInputs, mergedSettings);
    //let controls = createControls(element, {location: 'top', inputs: syncedControlInputs});

  //Create chart.
    let chart = createChart(element, mergedSettings);
    chart.on('init', onInit);
    chart.on('layout', onLayout);
    chart.on('datatransform', onDataTransform);
    chart.on('draw', onDraw);
    chart.on('resize', onResize);

    return chart;
}
