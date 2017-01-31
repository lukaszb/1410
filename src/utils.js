
export function getMusicFiles(name) {
    return getAudioFiles(`assets/music/${name}`);
}

export function getSoundFiles(name) {
    return getAudioFiles(`assets/sounds/${name}`);
}


export function getAudioFiles(name) {
    return ['mp3', 'ogg'].map((ext) => {
        return `${name}.${ext}`;
    });
}

export function choice(array) {
    if (!array.length) {
        return null;
    }
    var idx = (Math.random() * array.length) | 0;
    return array[idx];
}


export function getRangeArray(n) {
    let array = [];
    for (let i=0; i<n; i++) {
        array.push(i);
    }
    return array;
}

export function getRangeWithRandomStart(n) {
    let array = getRangeArray(n);
    let idx = (Math.random() * n) | 0;
    let firstSlice = array.splice(idx);
    return firstSlice.concat(array);
}
