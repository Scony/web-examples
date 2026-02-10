var Utils = {};

Utils.now = Date.now;

Utils.busyLoop = function(durationMs) {
    const begin = Utils.now();
    while (true) {
        for (var i = 0; i < 1000000; ++i)
            continue;
        if (Utils.now() - begin >= durationMs)
            break;
    }
}
