var Utils = {};

Utils.now = window.performance && window.performance.now
          ? function () { return window.performance.now(); }
          : Date.now;

Utils.busyLoop = function(durationMs) {
    const begin = Utils.now();
    while (true) {
        for (var i = 0; i < 1000000; ++i)
            continue;
        if (Utils.now() - begin >= durationMs)
            break;
    }
}

Utils.drawRandomCurves = function(parameters) {
    const canvas = document.createElement("canvas");
    canvas.width = window.innerWidth -  20;
    canvas.height = window.innerHeight - 20;
    canvas.style.border = "1px solid #000";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    function getRandomIntInclusive(min, max) {
        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);
        return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
    }
    function getRandomX() {
        return getRandomIntInclusive(0, canvas.width);
    }
    function getRandomY() {
        return getRandomIntInclusive(0, canvas.height);
    }
    function drawRandomCurve() {
        ctx.strokeStyle = `rgb(${getRandomIntInclusive(0, 255)}, ${getRandomIntInclusive(0, 255)}, ${getRandomIntInclusive(0, 255)})`;
        ctx.lineWidth = getRandomIntInclusive(1, 10);
        ctx.beginPath();
        ctx.moveTo(getRandomX(), getRandomY());
        ctx.bezierCurveTo(
            getRandomX(), getRandomY(),
            getRandomX(), getRandomY(),
            getRandomX(), getRandomY()
        );
        ctx.stroke();
    }
    function drawRandomCurves(curves) {
        for (let i = 0; i < curves; i++)
            drawRandomCurve();
    }
    function renderFrame() {
        drawRandomCurves(parameters.curvesPerDraw);
    }

    if (parameters.raf) {
        requestAnimationFrame(function render() {
            renderFrame();
            requestAnimationFrame(render);
        });
    } else
        console.error("Not implemented");
}
