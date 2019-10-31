import component from './component';
import {
    init,
    update,
    resizeRendererToDisplaySize
} from './render';

document.body.appendChild(component());

init();
update();