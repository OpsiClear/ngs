// static/js/viewer.js (NEW, SIMPLIFIED VERSION)

import * as SPLAT from "https://cdn.jsdelivr.net/npm/gsplat@latest";
import { OrbitControls } from "./OrbitControls.js";

// Global object to hold our viewer instances
const viewers = {};

/**
 * Initializes a single viewer. This is our proven code from the test.
 * It creates a scene, camera, renderer, and controls for one canvas.
 */
function setupViewer(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const scene = new SPLAT.Scene();
    const camera = new SPLAT.Camera();
    const renderer = new SPLAT.WebGLRenderer(canvas);
    const controls = new OrbitControls(camera, canvas);

    const animate = () => {
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };
    animate();

    // Store the essential parts for later use
    viewers[canvasId] = { scene, currentSplat: null };
}

/**
 * Loads a .ply file into a specific viewer's scene.
 */
async function loadSplat(viewerId, url) {
    const viewer = viewers[viewerId];
    if (!viewer) return;

    // Clear previous model
    if (viewer.currentSplat) {
        viewer.scene.remove(viewer.currentSplat);
    }

    try {
        const splat = await SPLAT.PLYLoader.LoadAsync(url, viewer.scene);
        const rotation = new SPLAT.Quaternion().setFromEuler(new SPLAT.Vector3(Math.PI, 0, 0));
        splat.rotation = rotation;
        splat.applyRotation();
        viewer.currentSplat = splat;
    } catch (e) {
        console.error(`Failed to load ${url}`, e);
    }
}

// --- INITIALIZATION ---
// This code runs once the module is loaded.
// It sets up the canvases and prepares them for loading models.
document.addEventListener('DOMContentLoaded', () => {
    setupViewer('main-viewer-1');
    setupViewer('main-viewer-2');
    setupViewer('main-viewer-3');
    setupViewer('main-viewer-4');
    setupViewer('infill-viewer-main');

    // Load the initial default models
    window.updateComparisonViewers('stone_1');
    window.updateInfillViewer('stone_1');
});


// --- GLOBAL FUNCTIONS for HTML ---
// These are the functions that the onclick attributes will call.
window.updateComparisonViewers = (modelName) => {
    const basePath = './static/splats/';
    loadSplat('main-viewer-1', `${basePath}${modelName}_3dgs.ply`);
    loadSplat('main-viewer-2', `${basePath}${modelName}_3dgs_infill.ply`);
    loadSplat('main-viewer-3', `${basePath}${modelName}_ngs.ply`);
    loadSplat('main-viewer-4', `${basePath}${modelName}_ngs_infill.ply`);
};

window.updateInfillViewer = (modelName) => {
    const basePath = './static/splats/';
    loadSplat('infill-viewer-main', `${basePath}${modelName}_noise.ply`);
}; 