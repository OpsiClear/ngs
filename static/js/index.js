window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");
    });

    // --- START: MODIFIED CAROUSEL INITIALIZATION ---

    // Options for the thumbnail carousels (many items)
    var thumbnailCarouselOptions = {
			slidesToScroll: 1,
			slidesToShow: 5, // Show more thumbnails at once
			loop: true,
			infinite: true,
			autoplay: false,
    };
    // Initialize the two thumbnail carousels with these options
    bulmaCarousel.attach('#comparison-thumbnail-carousel', thumbnailCarouselOptions);
    bulmaCarousel.attach('#infill-thumbnail-carousel', thumbnailCarouselOptions);


    // Options for the new Dataset image carousel
    var datasetCarouselOptions = {
      slidesToScroll: 1,
      slidesToShow: 3, // Show 3 images to allow for scrolling
      loop: true,
      infinite: true,
      autoplay: false,
    };
    // Initialize the dataset carousel with its specific options
    bulmaCarousel.attach('#dataset-image-carousel', datasetCarouselOptions);

    // --- END: MODIFIED CAROUSEL INITIALIZATION ---


    /* The old generic initialization is replaced by the specific ones above.
    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }
		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
    */


    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();
});