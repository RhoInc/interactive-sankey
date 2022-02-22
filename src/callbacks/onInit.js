import getXAxisOrder from './onInit/getXAxisOrder';
import getLegendOrder from './onInit/getLegendOrder';

export default function onInit() {
    const chart = this;

    this.config.x.order = getXAxisOrder.call(this);
    this.config.x.domain = getXAxisOrder.call(this);
    this.config.legend.order = getLegendOrder.call(this);
    this.config.color_dom = getLegendOrder.call(this);
}
