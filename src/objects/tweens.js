export function setFrameValues(tween, key, values) {
    for (const value of values) {
        tween = tween
            .to({[key]: value},1)
            .to({[key]: value},80); /* 0.08s per frame */
    }

    return tween;
}
