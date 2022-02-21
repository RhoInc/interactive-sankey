export default function onInit() {
    const chart = this;

    //Sort raw data by node so that links are drawn between adjacent nodes.
    this.raw_data = this.raw_data.sort((a, b) =>
        a[this.config.node_col] < b[this.config.node_col]
            ? -1
            : a[this.config.node_col] > b[this.config.node_col]
            ? 1
            : 0
    );

    // Define order of states.
    const states = [...new Set(this.raw_data.map((d) => d[this.config.link_col])).values()].sort();

    if (this.config.legend.order === undefined || this.config.legend.order.constructor !== Array)
        this.config.legend.order = states;
    else {
        states.forEach((state) => {
            if (this.config.legend.order.includes(state) === false)
                this.config.legend.order.push(state);
        });
    }
}
