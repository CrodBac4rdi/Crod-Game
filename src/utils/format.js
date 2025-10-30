// src/utils/format.js

function formatNumber(num) {
    if (num < 1000) {
        return num.toFixed(0);
    }
    const suffixes = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
    const i = Math.floor(Math.log10(num) / 3);
    const scaled = num / Math.pow(10, i * 3);
    return scaled.toFixed(2) + suffixes[i];
}

window.formatNumber = formatNumber;
