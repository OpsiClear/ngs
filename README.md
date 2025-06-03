# ngs.github.io

# Project Page TODO List: "Fix False Transparency by Noise Guided Splatting"

This list outlines the necessary steps to finalize the project webpage. Ensure all placeholder links, content, and file paths are correctly updated.

## I. Global Settings & Links

1.  **Google Analytics:**
    * Replace `G-YOUR_ANALYTICS_ID` (appears twice in the `<head>`) with your actual Google Analytics ID.
2.  **Author Links:**
    * Confirm/update the link for Michael Jenkins in the hero section. The current placeholder is `mailto:michael.jenkins@opsiclear.com`.
3.  **Publication Links (Hero Section & Footer):**
    * Replace `YOUR_ACTUAL_LINK_TO_PAPER.pdf` with the direct link to your paper's PDF (appears in the hero section and footer).
    * Replace `YOUR_ARXIV_LINK` with the link to your paper on arXiv (if applicable).
    * Replace `YOUR_VIDEO_LINK` with the link to your project video (e.g., YouTube).
    * Replace `YOUR_CODE_REPO_LINK` with the link to your code repository (e.g., GitHub) (appears in the hero section and footer).
    * Replace `YOUR_DATASET_LINK` with the link to where your dataset(s) can be accessed.

## II. Interactive 3D Comparison Section (2x2 Grid)

1.  **`iframe` Source Paths (Initial Display):**
    * Update the `src` for `main-viewer-1`: `./static/3d/stone_1_3dgs_no_infill.html` (3DGS, No Infill).
    * Update the `src` for `main-viewer-2`: `./static/3d/stone_1_3dgs_infill.html` (3DGS, With Green Infill).
    * Update the `src` for `main-viewer-3`: `./static/3d/stone_1_ours_no_infill.html` (NGS, No Infill).
    * Update the `src` for `main-viewer-4`: `./static/3d/stone_1_ours_infill.html` (NGS, With Green Infill).
        * *Ensure these point to the correct initial models you want to display.*
2.  **Thumbnail `onclick` Functions & Paths (for `#comparison-thumbnail-carousel`):**
    * For each `.carousel-item` in this section:
        * Verify the four URLs passed to the `loadViewers(...)` function in the `onclick` attribute.
        * These URLs must point to the *four corresponding HTML files* for that specific model set, representing:
            1.  3DGS (no infill) view
            2.  3DGS (with green infill) view
            3.  NGS (Ours, no infill) view
            4.  NGS (Ours, with green infill) view
        * **Example for Stone 1 (already in code, verify paths):**
            `onclick="loadViewers('./static/3d/stone_1_3dgs_no_infill.html', './static/3d/stone_1_3dgs_infill.html', './static/3d/stone_1_ours_no_infill.html', './static/3d/stone_1_ours_infill.html')"`
3.  **Thumbnail Image Paths (for `#comparison-thumbnail-carousel`):**
    * Ensure all `<img>` tags within this carousel section have correct `src` paths pointing to your thumbnail images (e.g., `./static/thumbnails/stone_1.png`).
4.  **3D Model HTML Files (for 2x2 Comparison):**
    * Prepare and correctly place all HTML files that embed your 3D models for this 2x2 comparison (e.g., `stone_1_3dgs_no_infill.html`, `stone_1_3dgs_infill.html`, etc.). There should be **four** such files per model set listed in the carousel.

## III. Datasets Section (Noise Infill Visualization Viewer)

1.  **Link to Dataset:**
    * Near the end of the descriptive paragraph for the Stone Dataset, there's a comment: ``. Ensure the main "Data" button in the hero section correctly links to your dataset.
2.  **`iframe` Source Path (Initial Display for Noise Infill):**
    * Update the `src` for `infill-viewer-main`: `./static/3d/stone_1_noise_infill_only.html`.
        * *Ensure this points to the correct initial noise infill model you want to display.*
3.  **Thumbnail `onclick` Functions & Paths (for `#infill-thumbnail-carousel`):**
    * For each `.carousel-item` in this section:
        * Verify the single URL passed to the `loadInfillViewer(...)` function in the `onclick` attribute.
        * This URL must point to the HTML file for the standalone noise infill visualization of that specific model.
        * **Example for Stone 1 (already in code, verify path):**
            `onclick="loadInfillViewer('./static/3d/stone_1_noise_infill_only.html')"`
4.  **Thumbnail Image Paths (for `#infill-thumbnail-carousel`):**
    * Ensure all `<img>` tags within this carousel section have correct `src` paths pointing to your thumbnail images (these can be the same thumbnails used in the comparison carousel if appropriate).
5.  **3D Model HTML Files (for Noise Infill Visualization):**
    * Prepare and correctly place all HTML files that embed your standalone noise infill visualizations (e.g., `stone_1_noise_infill_only.html`). There should be **one** such file per model set listed in this carousel.

## IV. Other Content Sections

1.  **Video Presentation Section:**
    * Replace `YOUR_VIDEO_EMBED_URL` with the correct embed URL for your project video.
    * Alternatively, if using a local video file, uncomment the `<video>` tag and ensure its `src` path is correct (e.g., `./static/videos/your_main_presentation.mp4`).
2.  **Methodology Section:**
    * Ensure the image `src="./static/figures/summary.png"` correctly points to your Figure 1.
3.  **Quantitative & Qualitative Results Section:**
    * The HTML tables for Table 1 and Table 2 are now embedded directly. Review them for accuracy and formatting.
    * Ensure the image `src="./static/figures/figure_5_comparison.png"` (for the qualitative comparison based on Figure 5) correctly points to your image.
4.  **Datasets Section (Descriptive Images):**
    * Ensure image paths are correct:
        * `./static/figures/stone_dataset_examples.png` (for Fig S1)
        * `./static/figures/dtu_dataset_examples.png` (for Fig S2)
        * `./static/figures/omniobject3d_dataset_examples.png` (for Fig S3)
5.  **Ablation Study Section:**
    * Ensure the image `src="./static/figures/figure_s6_ablation.png"` correctly points to your image for visual ablation results. (Note: If you have indeed removed this figure from the HTML, this TODO can be ignored).

## V. Finalization

1.  **BibTeX Section:**
    * Review the BibTeX entry. Update author names (if changed from the example), conference details (e.g., specific track, proceedings name), or year if they change upon final publication. Add an `@misc` entry for arXiv if applicable.
2.  **Acknowledgements (Footer):**
    * Update the placeholders `[Funding Source/Grant Number if applicable]` and `[Individuals/Groups if applicable]` with specific acknowledgements.

## General Checks

* Thoroughly test all links and interactive elements (carousels, 3D viewers).
* Verify all image and 3D model HTML file paths.
* Check for any remaining placeholder text.
* Test responsiveness on different screen sizes.