export default function getLegendOrder() {
    // Define order of states.
    const states = [...new Set(this.raw_data.map((d) => d[this.config.link_col])).values()].sort(
        d3.ascending
    );

    let legendOrder = this.config.legend.order;
    if (this.config.legend.order === undefined || this.config.legend.order.constructor !== Array)
        legendOrder = states;
    else {
        states.forEach((state) => {
            if (legendOrder.includes(state) === false) legendOrder.push(state);
        });
    }

    return legendOrder;
}
