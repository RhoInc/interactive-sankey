import getXAxisOrder from './onInit/getXAxisOrder';
import getLegendOrder from './onInit/getLegendOrder';

// TODO: figure out why links are connecting in the right order
export default function onInit() {
    const chart = this;

    this.raw_data.sort((a,b) => (
        a[this.config.node_col] < b[this.config.node_col] ? -1 :
        b[this.config.node_col] < a[this.config.node_col] ?  1 : 0
    ));

    this.config.x.order = getXAxisOrder.call(this);
    this.config.x.domain = getXAxisOrder.call(this);
    console.log(getXAxisOrder.call(this));
    this.config.legend.order = getLegendOrder.call(this);
    this.config.color_dom = getLegendOrder.call(this);
    console.log(getLegendOrder.call(this));
}
