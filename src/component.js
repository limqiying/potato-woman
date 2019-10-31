// creates default canvas element that will render the scene

export default () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'c';
    return canvas;
}