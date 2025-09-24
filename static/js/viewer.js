import * as SPLAT from "https://cdn.jsdelivr.net/npm/gsplat@latest";
import { OrbitControls } from "./OrbitControls.js";

const viewers = {};
const syncGroup = ['main-viewer-1', 'main-viewer-2', 'main-viewer-3', 'main-viewer-4'];
let masterViewerId = null;

function setupViewer(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const scene = new SPLAT.Scene();
    const camera = new SPLAT.Camera();
    const renderer = new SPLAT.WebGLRenderer(canvas);
    const controls = new OrbitControls(camera, canvas, undefined, undefined, undefined);
    renderer.backgroundColor = new SPLAT.Color32(255, 255, 255, 255); 

    const viewerState = {
        scene,
        camera,
        controls,
        currentSplat: null,
        isInteracting: false,
        lastInteractionTime: 0,
    };
    viewers[canvasId] = viewerState;

    let wheelTimeout;

    const onInteractionStart = () => {
        viewerState.isInteracting = true;
        viewerState.lastInteractionTime = Date.now();
        if (syncGroup.includes(canvasId)) {
            masterViewerId = canvasId;
        }
    };
    const onInteractionEnd = () => {
        viewerState.isInteracting = false;
        viewerState.lastInteractionTime = Date.now();
    };

    canvas.addEventListener('pointerdown', onInteractionStart);
    canvas.addEventListener('pointerup', onInteractionEnd);
    canvas.addEventListener('wheel', () => {
        onInteractionStart();
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(onInteractionEnd, 250);
    });

    const animate = () => {
        // --- CORRECTED Synchronization Logic ---
        if (masterViewerId && syncGroup.includes(canvasId) && canvasId !== masterViewerId) {
            // This is a "slave" viewer. Get master state and apply it.
            const masterState = viewers[masterViewerId].controls.getState();
            controls.setState(masterState);
        }

        // ALL viewers, master and slave, run their own update loop.
        controls.update();

        // Auto-rotation logic
        if (!viewerState.isInteracting && !controls.transitionResolver && (Date.now() - viewerState.lastInteractionTime > 2000)) {
            if (canvasId === masterViewerId || canvasId === 'infill-viewer-main' || canvasId === 'teaser-viewer') {
                controls.rotateCameraAngle(0.002, 0);
            }
        }
        
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };
    animate();
}

async function loadSplat(viewerId, url) {
    const viewer = viewers[viewerId];
    if (!viewer) return;

    viewer.scene.reset();


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

document.addEventListener('DOMContentLoaded', async () => {
    setupViewer('main-viewer-1');
    setupViewer('main-viewer-2');
    setupViewer('main-viewer-3');
    setupViewer('main-viewer-4');
    setupViewer('infill-viewer-main');
    setupViewer('teaser-viewer');

    masterViewerId = 'main-viewer-1';

    const basePath = './static/splats/';
    await loadSplat('teaser-viewer', `${basePath}scan_20250719_161647_mandarin.ply`);
    await viewers['teaser-viewer'].controls.setPose(0.0, 0.2, 1.0, true);

    // Load the default models for the viewers
    window.updateComparisonViewers('stone_1');
    window.updateInfillViewer('stone_1');
});

document.addEventListener('carouselsReady', () => {
    const firstComparisonModel = document.querySelector('#comparison-thumbnail-carousel .carousel-item').dataset.model;
    if (firstComparisonModel) {
        window.updateComparisonViewers(firstComparisonModel);
    }

    const firstInfillModel = document.querySelector('#infill-thumbnail-carousel .carousel-item').dataset.model;
    if (firstInfillModel) {
        window.updateInfillViewer(firstInfillModel);
    }
});

window.updateComparisonViewers = async (modelName) => {
    const basePath = './static/splats/';
    const viewersToUpdate = ['main-viewer-1', 'main-viewer-2', 'main-viewer-3', 'main-viewer-4'];
    
    const loadPromises = [
        loadSplat('main-viewer-1', `${basePath}${modelName}_3dgs.ply`),
        loadSplat('main-viewer-2', `${basePath}${modelName}_3dgs_infill.ply`),
        loadSplat('main-viewer-3', `${basePath}${modelName}_ngs.ply`),
        loadSplat('main-viewer-4', `${basePath}${modelName}_ngs_infill.ply`)
    ];

    await Promise.all(loadPromises);

    const posePromises = viewersToUpdate.map(viewerId => 
        viewers[viewerId].controls.setPose(0.0, 0.2, 1.0, true)
    );
    
    await Promise.all(posePromises);
};

window.updateInfillViewer = async (modelName) => {
    const basePath = './static/splats/';
    await loadSplat('infill-viewer-main', `${basePath}${modelName}_noise.ply`);
    await viewers['infill-viewer-main'].controls.setPose(0.0, 0.2, 1.0, true);
};