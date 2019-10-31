import component from './component';
import {
    init,
    update,
    moveJoint,
    getMousePos,
    waist,
    neck,
    renderer,
    setLeftOrRight
} from './render';

document.body.appendChild(component());

init();
update();

document.addEventListener('mousemove', function (e) {
    var mousecoords = getMousePos(e);
    if (neck && waist) {
        moveJoint(mousecoords, neck, 50);
        moveJoint(mousecoords, waist, 30);
    }
});

document.addEventListener('pointerdown', e => {
    var mousecoords = getMousePos(e);
    setLeftOrRight(mousecoords.x);
});

document.addEventListener('pointerup', _ => {
    setLeftOrRight(-1.0);
})

window.addEventListener('resize', function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
});