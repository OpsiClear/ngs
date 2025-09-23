// Branched from https://github.com/huggingface/gsplat.js/blob/d6df8ec0b8ac3683438cb99fec308e56ca7b14a9/src/controls/OrbitControls.ts#L6
// as there's too little control to spin the camera ourselves in their version.
import * as SPLAT from "https://cdn.jsdelivr.net/npm/gsplat@latest";

const Matrix3 = SPLAT.Matrix3;
const Quaternion = SPLAT.Quaternion;
const Vector3 = SPLAT.Vector3;

class OrbitControls {
    minAngle = -90
    maxAngle = 90
    minZoom = 0.1
    maxZoom = 30
    orbitSpeed = 1
    panSpeed = 1
    zoomSpeed = 1
    dampening = 0.12
    maxPanDistance = undefined

    constructor(
        camera,
        canvas,
        alpha = 0.5,
        beta = 0.5,
        radius = 5,
        inputTarget = new Vector3()
    ) {
        let target = inputTarget.clone()

        let desiredTarget = target.clone()
        let desiredAlpha = alpha
        let desiredBeta = beta
        let desiredRadius = radius

        this.transitionResolver = null;

        let dragging = false
        let panning = false
        let lastDist = 0
        let lastX = 0
        let lastY = 0

        let isUpdatingCamera = false

        // --- NEW: getState and setState methods for synchronization ---
        this.getState = () => {
            return {
                alpha, beta, radius, target,
                desiredAlpha, desiredBeta, desiredRadius, desiredTarget
            };
        };
        this.setState = (state) => {
            alpha = state.alpha;
            beta = state.beta;
            radius = state.radius;
            target = state.target;
            desiredAlpha = state.desiredAlpha;
            desiredBeta = state.desiredBeta;
            desiredRadius = state.desiredRadius;
            desiredTarget = state.desiredTarget;
        };
        // --- END NEW ---

        const onCameraChange = () => {
            if (isUpdatingCamera) return

            const eulerRotation = camera.rotation.toEuler()
            desiredAlpha = -eulerRotation.y
            desiredBeta = -eulerRotation.x

            const x =
                camera.position.x -
                desiredRadius * Math.sin(desiredAlpha) * Math.cos(desiredBeta)
            const y = camera.position.y + desiredRadius * Math.sin(desiredBeta)
            const z =
                camera.position.z +
                desiredRadius * Math.cos(desiredAlpha) * Math.cos(desiredBeta)

            desiredTarget = new Vector3(x, y, z)
        }

        camera.addEventListener("objectChanged", onCameraChange)

        this.setCameraTarget = newTarget => {
            const dx = newTarget.x - camera.position.x
            const dy = newTarget.y - camera.position.y
            const dz = newTarget.z - camera.position.z
            desiredRadius = Math.sqrt(dx * dx + dy * dy + dz * dz)
            desiredBeta = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz))
            desiredAlpha = -Math.atan2(dx, dz)
            desiredTarget = new Vector3(newTarget.x, newTarget.y, newTarget.z)
        }

        // Add in a method to manually rotate the camera in our branch.
        this.rotateCameraAngle = (deltaAlpha, deltaBeta) => {
            desiredAlpha += deltaAlpha;
            deltaBeta += deltaBeta;
        }

        this.setPose = (alpha, beta, radius, smooth = false) => {
            desiredAlpha = alpha;
            desiredBeta = beta;
            desiredRadius = radius;
            
            if (smooth) {
                return new Promise((resolve) => {
                    this.transitionResolver = resolve;
                });
            }
        };

        const computeZoomNorm = () => {
            return (
                0.1 +
                (0.9 * (desiredRadius - this.minZoom)) / (this.maxZoom - this.minZoom)
            )
        }

        const onMouseDown = e => {
            preventDefault(e)

            dragging = true
            panning = e.button === 2
            lastX = e.clientX
            lastY = e.clientY
            window.addEventListener("mouseup", onMouseUp)
        }

        const onMouseUp = e => {
            preventDefault(e)

            dragging = false
            panning = false
            window.removeEventListener("mouseup", onMouseUp)
        }

        const onMouseMove = e => {
            preventDefault(e)

            if (!dragging || !camera) return

            const dx = e.clientX - lastX
            const dy = e.clientY - lastY

            if (panning) {
                const zoomNorm = computeZoomNorm()
                const panX = -dx * this.panSpeed * 0.01 * zoomNorm
                const panY = -dy * this.panSpeed * 0.01 * zoomNorm
                const R = Matrix3.RotationFromQuaternion(camera.rotation).buffer
                const right = new Vector3(R[0], R[3], R[6])
                const up = new Vector3(R[1], R[4], R[7])
                desiredTarget = desiredTarget.add(right.multiply(panX))
                desiredTarget = desiredTarget.add(up.multiply(panY))

                if (this.maxPanDistance !== undefined) {
                    if (desiredTarget.magnitude() > 0.0) {
                        const mag = Math.min(desiredTarget.magnitude(), this.maxPanDistance)
                        desiredTarget = desiredTarget.normalize().multiply(mag)
                    }
                }
            } else {
                desiredAlpha -= dx * this.orbitSpeed * 0.003
                desiredBeta += dy * this.orbitSpeed * 0.003
                desiredBeta = Math.min(
                    Math.max(desiredBeta, (this.minAngle * Math.PI) / 180),
                    (this.maxAngle * Math.PI) / 180
                )
            }

            lastX = e.clientX
            lastY = e.clientY
        }

        const onWheel = e => {
            preventDefault(e)

            const zoomNorm = computeZoomNorm()
            desiredRadius += e.deltaY * this.zoomSpeed * 0.025 * zoomNorm
            desiredRadius = Math.min(
                Math.max(desiredRadius, this.minZoom),
                this.maxZoom
            )
        }

        const onTouchStart = e => {
            preventDefault(e)

            if (e.touches.length === 1) {
                dragging = true
                panning = false
                lastX = e.touches[0].clientX
                lastY = e.touches[0].clientY
                lastDist = 0
            } else if (e.touches.length === 2) {
                dragging = true
                panning = true
                lastX = (e.touches[0].clientX + e.touches[1].clientX) / 2
                lastY = (e.touches[0].clientY + e.touches[1].clientY) / 2
                const distX = e.touches[0].clientX - e.touches[1].clientX
                const distY = e.touches[0].clientY - e.touches[1].clientY
                lastDist = Math.sqrt(distX * distX + distY * distY)
            }
        }

        const onTouchEnd = e => {
            preventDefault(e)

            dragging = false
            panning = false
        }

        const onTouchMove = e => {
            preventDefault(e)

            if (!dragging || !camera) return

            if (panning) {
                const zoomNorm = computeZoomNorm()

                const distX = e.touches[0].clientX - e.touches[1].clientX
                const distY = e.touches[0].clientY - e.touches[1].clientY
                const dist = Math.sqrt(distX * distX + distY * distY)
                const delta = lastDist - dist
                desiredRadius += delta * this.zoomSpeed * 0.1 * zoomNorm
                desiredRadius = Math.min(
                    Math.max(desiredRadius, this.minZoom),
                    this.maxZoom
                )
                lastDist = dist

                const touchX = (e.touches[0].clientX + e.touches[1].clientX) / 2
                const touchY = (e.touches[0].clientY + e.touches[1].clientY) / 2
                const dx = touchX - lastX
                const dy = touchY - lastY
                const R = Matrix3.RotationFromQuaternion(camera.rotation).buffer
                const right = new Vector3(R[0], R[3], R[6])
                const up = new Vector3(R[1], R[4], R[7])
                desiredTarget = desiredTarget.add(
                    right.multiply(-dx * this.panSpeed * 0.025 * zoomNorm)
                )
                desiredTarget = desiredTarget.add(
                    up.multiply(-dy * this.panSpeed * 0.025 * zoomNorm)
                )
                lastX = touchX
                lastY = touchY
            } else {
                const dx = e.touches[0].clientX - lastX
                const dy = e.touches[0].clientY - lastY

                desiredAlpha -= dx * this.orbitSpeed * 0.003
                desiredBeta += dy * this.orbitSpeed * 0.003
                desiredBeta = Math.min(
                    Math.max(desiredBeta, (this.minAngle * Math.PI) / 180),
                    (this.maxAngle * Math.PI) / 180
                )

                lastX = e.touches[0].clientX
                lastY = e.touches[0].clientY
            }
        }

        const lerp = (a, b, t) => {
            return (1 - t) * a + t * b
        }

        this.update = () => {
            isUpdatingCamera = true

            const dampeningFactor = this.transitionResolver ? 0.04 : this.dampening;

            alpha = lerp(alpha, desiredAlpha, dampeningFactor)
            beta = lerp(beta, desiredBeta, dampeningFactor)
            radius = lerp(radius, desiredRadius, dampeningFactor)
            target = target.lerp(desiredTarget, this.dampening)

            if (this.transitionResolver) {
                const threshold = 0.01;
                if (
                    Math.abs(alpha - desiredAlpha) < threshold &&
                    Math.abs(beta - desiredBeta) < threshold &&
                    Math.abs(radius - desiredRadius) < threshold
                ) {
                    alpha = desiredAlpha;
                    beta = desiredBeta;
                    radius = desiredRadius;
                    this.transitionResolver();
                    this.transitionResolver = null;
                }
            }

            const x = target.x + radius * Math.sin(alpha) * Math.cos(beta)
            const y = target.y - radius * Math.sin(beta)
            const z = target.z - radius * Math.cos(alpha) * Math.cos(beta)
            camera.position = new Vector3(x, y, z)

            const direction = target.subtract(camera.position).normalize()
            const rx = Math.asin(-direction.y)
            const ry = Math.atan2(direction.x, direction.z)
            camera.rotation = Quaternion.FromEuler(new Vector3(rx, ry, 0))

            isUpdatingCamera = false
        }

        const preventDefault = e => {
            e.preventDefault()
            e.stopPropagation()
        }

        this.dispose = () => {
            canvas.removeEventListener("dragenter", preventDefault)
            canvas.removeEventListener("dragover", preventDefault)
            canvas.removeEventListener("dragleave", preventDefault)
            canvas.removeEventListener("contextmenu", preventDefault)

            canvas.removeEventListener("mousedown", onMouseDown)
            canvas.removeEventListener("mousemove", onMouseMove)
            canvas.removeEventListener("wheel", onWheel)

            canvas.removeEventListener("touchstart", onTouchStart)
            canvas.removeEventListener("touchend", onTouchEnd)
            canvas.removeEventListener("touchmove", onTouchMove)
        }

        canvas.addEventListener("dragenter", preventDefault)
        canvas.addEventListener("dragover", preventDefault)
        canvas.addEventListener("dragleave", preventDefault)
        canvas.addEventListener("contextmenu", preventDefault)

        canvas.addEventListener("mousedown", onMouseDown)
        canvas.addEventListener("mousemove", onMouseMove)
        canvas.addEventListener("wheel", onWheel)

        canvas.addEventListener("touchstart", onTouchStart)
        canvas.addEventListener("touchend", onTouchEnd)
        canvas.addEventListener("touchmove", onTouchMove)

        this.update()
    }
}

export { OrbitControls }
