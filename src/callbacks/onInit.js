export default function onInit() {
    const chart = this;

    //Sort raw data by node so that links are drawn between adjacent nodes.
    this.raw_data = this.raw_data.sort(
        (a, b) =>
            a[this.config.node_col] < b[this.config.node_col]
                ? -1
                : a[this.config.node_col] > b[this.config.node_col] ? 1 : 0
    );
}
