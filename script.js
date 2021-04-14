//===================== инициализация начальных значений
let interval;

// [type, min, max, step, initial value, valid]
const initialValues = {
    koeff: ['number', 1, 9, 1, 5, true],
    mass: ['number', 0.5, 1, 0.1, 0.5, true],
    decl: ['number', 10, 20, 2, 10, true]
};

//===================== полезные функции
const scale = 12; // 12 px/cm

const cmToPix = (type, value) => {
    const weightKoeff = 5;
    switch (type) {
        case 'mass':
            return Math.floor(Math.cbrt(value) * scale * weightKoeff / 2);
        case 'length':
            return value * scale;
        default:
            return value;
    }
}

const pxToCm = (value) => {
    return (value / scale).toFixed(1);
}

const omega = (koeff, mass) => {
    return Math.sqrt(koeff / mass);
}

const periods = (t, koeff, mass) => {
    return omega(koeff, mass) * t / 2 / Math.PI;
}

//===================== установка и валидация полей HTML
const setAttr = (control, arr) => {
    control.setAttribute('type', arr[0]);
    control.setAttribute('min', arr[1]);
    control.setAttribute('max', arr[2]);
    control.setAttribute('step', arr[3]);
    control.setAttribute('value', arr[4]);
    document.getElementById(`${control.id}Helper`).innerText = `(от ${arr[1]} до ${arr[2]})`;
};

const enableInput = (flag) => {
    if (flag) {
        for (const key in initialValues) {
            document.getElementById(`f${key}`).removeAttribute('disabled');
        };
    } else {
        for (const key in initialValues) {
            document.getElementById(`f${key}`).setAttribute('disabled', true);
        };
    }
};

const allValid = () => {
    for (const key in initialValues) {
        if (!initialValues[key][5]) {
            return false;
        }
    };
    return true;
};

const valid = (control, arr) => {
    const res = arr[1] <= control.value && control.value <= arr[2];
    control.setAttribute('style', `color: ${res ? 'inherit' : 'red'}`);
    document.getElementById(`${control.id}Helper`).setAttribute('style', `color: ${res ? 'inherit' : 'red'}`);
    arr[5] = res;
    startButton.disabled = !allValid();
    if (res) {
        arr[4] = control.value;
    };
    return res;
}

const updateOmega = () => {
    document.getElementById('out-w0').innerText = allValid() ?
        omega(initialValues.koeff[4], initialValues.mass[4]).toFixed(2) :
        '?';
}

const koeffControl = document.getElementById('fkoeff');
setAttr(koeffControl, initialValues.koeff);
koeffControl.addEventListener('change', () => {
    if (valid(koeffControl, initialValues.koeff)) {
        spring.koeff = koeffControl.value;
    }
    updateOmega();
});

const massControl = document.getElementById('fmass');
setAttr(massControl, initialValues.mass);
massControl.addEventListener('change', () => {
    if (valid(massControl, initialValues.mass)) {
        weight.mass = massControl.value;
        setWeightNode(massControl.value, animatedObject.curY);
    }
    updateOmega();
})

const declControl = document.getElementById('fdecl');
setAttr(declControl, initialValues.decl);
declControl.addEventListener('change', () => {
    if (!valid(declControl, initialValues.decl)) return;
    animateObject({ springNode, weightNode, springObj: spring, startY: animatedObject.curY, endY: cmToPix('length', declControl.value), duration: 500 });
    interval = setInterval(updateValues, 100);
});

//===================== рисование SVG
const springContainer = document.getElementById('spring-container');
const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

svgNode.setAttributeNS(null, 'viewBox', '0 0 100 900');
springContainer.appendChild(svgNode);

// пружина
const springNode = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
const spring = new Spring({
    turns: 12,
    width: 100,
    height: 30,
    endHeight: 30,
    frameWidth: 100,
    koeff: initialValues.koeff[4]
});
springNode.setAttributeNS(null, 'points', spring.points);
springNode.setAttributeNS(null, 'fill', 'none');
springNode.setAttributeNS(null, 'stroke', 'red');
svgNode.appendChild(springNode);

// груз
const weightNode = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
const weight = {
    mass: initialValues.mass[4]
};
const setWeightNode = (mass, curY) => {
    const radius = cmToPix('mass', mass);
    weightNode.setAttributeNS(null, 'cx', spring.frameWidth / 2);
    weightNode.setAttributeNS(null, 'cy', spring.length + curY + radius);
    weightNode.setAttributeNS(null, 'r', radius);
    weightNode.setAttributeNS(null, 'fill', 'red');
}
setWeightNode(initialValues.mass[4], spring.length);
svgNode.appendChild(weightNode);

// контрольная линия
const lineNode = document.createElementNS('http://www.w3.org/2000/svg', 'line');
lineNode.setAttributeNS(null, 'x1', spring.frameWidth / 4);
lineNode.setAttributeNS(null, 'y1', spring.length);
lineNode.setAttributeNS(null, 'x2', spring.frameWidth / 4 * 3);
lineNode.setAttributeNS(null, 'y2', spring.length);
lineNode.setAttributeNS(null, 'stroke', 'blue');
lineNode.setAttributeNS(null, 'stroke-width', 3);
svgNode.appendChild(lineNode);

// потолок
const ceilingNode = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
ceilingNode.setAttributeNS(null, 'width', 100);
ceilingNode.setAttributeNS(null, 'height', 20);
ceilingNode.setAttributeNS(null, 'fill', 'grey');
svgNode.appendChild(ceilingNode);


//===================== анимация SVG
const animateObject = ({ springNode, weightNode, springObj, weightObj, startY, endY, duration }) => {
    if (animatedObject) {
        animatedObject.cancel();
    };
    if (duration) {
        animatedObject = new AnimatedObject({ springNode, weightNode, springObj, startY, endY, duration });
        animatedObject.startMotion();
    } else {
        animatedObject = new AnimatedObject({ springNode, weightNode, springObj, weightObj, startY });
        animatedObject.startOscillation();
    }
}

const startButton = document.getElementById('start-button');
startButton.addEventListener('click', () => {
    if (!animatedObject.isDone) {
        enableInput(true);
        animateObject({ springNode, weightNode, springObj: spring, startY: animatedObject.curY, endY: cmToPix('length', declControl.value), duration: 500 });
        startButton.innerHTML = 'Старт';
    } else {
        enableInput(false);
        animateObject({ springNode, weightNode, springObj: spring, weightObj: weight, startY: animatedObject.curY });
        interval = setInterval(updateValues, 100);
        startButton.innerHTML = 'Стоп';
    }
});

const updateValues = () => {
    document.getElementById('out-y').innerText = pxToCm(animatedObject.curY);
    document.getElementById('out-t').innerText = animatedObject.time.toFixed(1);
    document.getElementById('out-periods').innerText = Math.floor(periods(animatedObject.time, initialValues.koeff[4], initialValues.mass[4]));

    if (animatedObject.isDone) {
        clearInterval(interval);
    }
};

updateOmega();

let animatedObject;
animateObject({ springNode, weightNode, springObj: spring, startY: 0, endY: cmToPix('length', initialValues.decl[4]), duration: 500 });
interval = setInterval(updateValues, 100);

