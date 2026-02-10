var Benchmarking = {};

Benchmarking.randomSeed = 49734323;
Benchmarking.random = Math.random = function() {
    // Robert Jenkins' 32 bit integer hash function.
    var randomSeed = Benchmarking.randomSeed;
    randomSeed = ((randomSeed + 0x7ed55d16) + (randomSeed << 12))  & 0xffffffff;
    randomSeed = ((randomSeed ^ 0xc761c23c) ^ (randomSeed >>> 19)) & 0xffffffff;
    randomSeed = ((randomSeed + 0x165667b1) + (randomSeed << 5))   & 0xffffffff;
    randomSeed = ((randomSeed + 0xd3a2646c) ^ (randomSeed << 9))   & 0xffffffff;
    randomSeed = ((randomSeed + 0xfd7046c5) + (randomSeed << 3))   & 0xffffffff;
    randomSeed = ((randomSeed ^ 0xb55a4f09) ^ (randomSeed >>> 16)) & 0xffffffff;
    Benchmarking.randomSeed = randomSeed;
    return (randomSeed & 0xfffffff) / 0x10000000;
}
Benchmarking.getRandomIntInclusive = function(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Benchmarking.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

Benchmarking.now = window.performance && window.performance.now
                 ? function () { return window.performance.now(); }
                 : Date.now;

Benchmarking.forceLayout = () => { document.body.offsetWidth; }

Benchmarking.measureRunsPerSecond = function(parameters) {
    if (!parameters.benchmarkFunction)
        return;

    if (!parameters.warmupDurationSeconds)
        parameters.warmupDurationSeconds = 3;
    if (!parameters.durationSeconds)
        parameters.durationSeconds = 20;

    Benchmarking.measureRunsPerSecondNonBlocking(parameters);
}

Benchmarking.measureRunsPerSecondNonBlocking = function(parameters) {
    let measureForASecond = () => {
        const benchmarkingBeginTime = Benchmarking.now();
        let runs = 0;
        while (true) {
            parameters.benchmarkFunction();
            ++runs;
            const benchmarkingCurrentTime = Benchmarking.now();
            if (benchmarkingCurrentTime - benchmarkingBeginTime >= 1000) {
                return [runs, benchmarkingCurrentTime - benchmarkingBeginTime];
            }
        }
    }

    let warmupIterationsLeft = parameters.warmupDurationSeconds;
    let benchmarkingIterationsLeft = parameters.durationSeconds;
    let totalRuns = 0;
    let totalTimeDeltaMs = 0;

    console.log("Starting: warmup first, then benchmarking");
    setTimeout(function iterate() {
        const [runs, timeDeltaMs] = measureForASecond();
        if (warmupIterationsLeft-- > 0) {
            console.log("Warmup iteration " + (parameters.warmupDurationSeconds - warmupIterationsLeft));
            setTimeout(iterate, 0);
            return;
        }
        totalRuns += runs;
        totalTimeDeltaMs += timeDeltaMs;
        const iteration = parameters.durationSeconds - benchmarkingIterationsLeft + 1;
        const runsPerSecond = totalRuns / (totalTimeDeltaMs / 1000);
        const result = parameters.results == 'ms'
              ? 1000.0 / runsPerSecond
              : runsPerSecond;
        const resultStr = result + (parameters.results == 'ms' ? ' ms/run' : ' runs/s');
        console.log("Benchmarking iteration " + iteration + ": " + resultStr);
        if (--benchmarkingIterationsLeft > 0)
            setTimeout(iterate, 0);
        else {
            console.log("Finished benchmarking: " + resultStr);
            if (parameters.visualResults) {
                let element = document.createElement("div");
                element.style.position = 'fixed';
                element.style.top = '0px';
                element.style.left = '0px';
                element.style.backgroundColor = 'orange';
                element.innerText = "Finished benchmarking: " + resultStr;
                document.body.appendChild(element);
            }
        }
    }, 0);
}

Benchmarking.enableFPSLogging = function() {
    Benchmarking.lastFPSCalculation = Benchmarking.now();
    Benchmarking.framesSinceLastFPSCalculation = 0;
    requestAnimationFrame(function loop() {
        Benchmarking.framesSinceLastFPSCalculation++;
        var now = Benchmarking.now();
        var delta = now - Benchmarking.lastFPSCalculation;
        if (delta > 1000) {
            console.log("FPS: " + (Benchmarking.framesSinceLastFPSCalculation / (delta / 1000)));
            Benchmarking.lastFPSCalculation = now;
            Benchmarking.framesSinceLastFPSCalculation = 0;
        }
        requestAnimationFrame(loop);
    });
}
