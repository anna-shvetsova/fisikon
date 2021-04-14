//==========================
class AnimatedObject {
    constructor({ springNode, weightNode, springObj, weightObj, startY, endY, duration }) {
        this.springNode = springNode;
        this.weightNode = weightNode;
        this.springObj = springObj;
        this.weightObj = weightObj;
        this.startY = startY;
        this.curY = startY;
        this.endY = endY;
        this.duration = duration;
        this.isStarted = false;
        this.isDone = false;
        this.startTime = null;
        this.time = 0;
    };

    startMotion() {
        if (this.isStarted || this.isDone) return;
        this.isStarted = true;

        const animateStep = (timestamp) => {
            if (this.isDone) return;
            if (!this.startTime) {
                this.startTime = timestamp;
            };

            const progress = (timestamp - this.startTime) / this.duration;
            if (progress >= 1) {
                this.curY = this.endY;
                this.isDone = true;
            } else {
                const curY = this.startY + (this.endY - this.startY) * progress;
                this.curY = curY;
                const { turns, wingLength, height, endHeight, frameWidth } = this.springObj;

                const curSpringObj = new Spring({
                    turns,
                    wingLength,
                    height: height + curY / turns,
                    endHeight,
                    frameWidth
                });

                this.springNode.setAttributeNS(null, 'points', curSpringObj.points);
                this.weightNode.setAttributeNS(null, 'cy', curSpringObj.length + parseInt(weightNode.getAttributeNS(null, 'r')));
                window.requestAnimationFrame(animateStep);
            };
        };

        window.requestAnimationFrame(animateStep);
    };

    startOscillation() {
        if (this.isStarted || this.isDone) return;
        this.isStarted = true;

        const animateStep = (timestamp) => {
            if (this.isDone) return;
            if (!this.startTime) {
                this.startTime = timestamp;
            };

            const curTime = timestamp - this.startTime;
            const { turns, wingLength, height, endHeight, frameWidth, koeff } = this.springObj;
            const { mass } = this.weightObj;
            const w = omega(koeff, mass);
            const curY = this.startY * Math.cos(curTime / 1000 * w);
            this.curY = curY;
            this.time = curTime / 1000;

            const curSpringObj = new Spring({
                turns,
                wingLength,
                height: height + curY / turns,
                endHeight,
                frameWidth
            });

            this.springNode.setAttributeNS(null, 'points', curSpringObj.points);
            this.weightNode.setAttributeNS(null, 'cy', curSpringObj.length + parseInt(weightNode.getAttributeNS(null, 'r')));
            window.requestAnimationFrame(animateStep);
        };

        window.requestAnimationFrame(animateStep);
    }
    cancel() {
        const { length, points } = this.springObj;
        this.springNode.setAttributeNS(null, 'points', points);
        this.weightNode.setAttributeNS(null, 'cy', length + parseInt(this.weightNode.getAttributeNS(null, 'r')));
        this.isDone = true;
    }
};

//==========================
class Spring {
    constructor({ turns, width, height, endHeight, wingLength, frameWidth, koeff }) {
        this.turns = turns;
        this.height = height;
        this.endHeight = endHeight;
        this.frameWidth = frameWidth;
        this.koeff = koeff;
        if (width) {
            this.width = width;
            this.wingLength = Math.sqrt((height / 4) ** 2 + (width / 2) ** 2);
        } else {
            this.wingLength = wingLength;
            this.width = Math.sqrt(wingLength ** 2 - (height / 4) ** 2) * 2;
        };
        this.length = this.endHeight * 2 + this.turns * this.height
        this.points = this.getPoints();
    };
    getPoints() {
        const stepY = this.height / 4;
        const halfFrameWidth = this.frameWidth / 2;
        const halfWidth = this.width / 2;
        let arrPoints = [[Math.floor(halfFrameWidth), 0], [Math.floor(halfFrameWidth), this.endHeight]];
        let y = this.endHeight;
        for (let i = 0; i < this.turns; i++) {
            arrPoints.push([Math.floor(halfFrameWidth + halfWidth), Math.floor(y + stepY)]);
            arrPoints.push([Math.floor(halfFrameWidth), Math.floor(y + 2 * stepY)]);
            arrPoints.push([halfFrameWidth - halfWidth, Math.floor(y + 3 * stepY)]);
            arrPoints.push([Math.floor(halfFrameWidth), Math.floor(y + 4 * stepY)]);
            y += 4 * stepY;
        };
        arrPoints.push([Math.floor(halfFrameWidth), Math.floor(y + this.endHeight)]);
        return arrPoints.join(' ');
    }
}

