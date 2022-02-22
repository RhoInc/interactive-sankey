export default function getXAxisOrder() {
    const xAxisSet = new Set(this.raw_data.map((d) => d[this.config.node_col]));
    const xAxisArray = [...xAxisSet.values()];
    const xAxisOrder = xAxisArray
        .every(value => !isNaN(parseInt(value)))
            ? xAxisArray.sort((a,b) => parseInt(a) - parseInt(b))
            : xAxisArray.sort((a,b) => a < b ? -1 : b < a ? 1 : 0);

    return xAxisOrder;
}
