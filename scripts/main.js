// Add your javascript here
// Don't forget to add it into respective layouts where this js file is needed

$(document).ready(function() {
  function setMode(mode) {
    if (mode === 'dark') {
      $('body').addClass('dark-mode');
      $('#theme-toggle').text('Light Mode');
    } else {
      $('body').removeClass('dark-mode');
      $('#theme-toggle').text('Dark Mode');
    }
    localStorage.setItem('theme', mode);
  }

  $('#theme-toggle').on('click', function() {
    const isDark = $('body').hasClass('dark-mode');
    setMode(isDark ? 'light' : 'dark');
  });

  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'dark') {
    setMode('dark');
  }
});

// Smooth scroll for links with hashes
$('a.smooth-scroll')
.click(function(event) {
  // On-page links
  if (
    location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') 
    && 
    location.hostname == this.hostname
  ) {
    // Figure out element to scroll to
    var target = $(this.hash);
    target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
    // Does a scroll target exist?
    if (target.length) {
      // Only prevent default if animation is actually gonna happen
      event.preventDefault();
      $('html, body').animate({
        scrollTop: target.offset().top
      }, 1000, function() {
        // Callback after animation
        // Must change focus!
        var $target = $(target);
        $target.focus();
        if ($target.is(":focus")) { // Checking if the target was focused
          return false;
        } else {
          $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
          $target.focus(); // Set focus again
        };
      });
    }
  }
});
