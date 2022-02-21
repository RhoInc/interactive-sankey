import onDataTransform from './onDataTransform';
import onDestroy from './onDestroy';
import onDraw from './onDraw';
import onInit from './onInit';
import onLayout from './onLayout';
import onPreprocess from './onPreprocess';
import onResize from './onResize';

export default {
    onInit: onInit,
    onLayout: onLayout,
    onPreprocess: onPreprocess,
    onDataTransform: onDataTransform,
    onDraw: onDraw,
    onResize: onResize,
    onDestroy: onDestroy,
};
