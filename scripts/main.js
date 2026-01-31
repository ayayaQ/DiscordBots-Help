/**
 * Main JavaScript for Bot Commander Help
 * Handles accordions and interactive elements
 */
(function() {
    'use strict';

    // Accordion functionality
    function initAccordions() {
        const collapsibles = document.querySelectorAll('.collapsible');

        collapsibles.forEach((button, index) => {
            // Skip menu button (first collapsible, has no expand icon)
            const expandIcon = button.querySelector('.expand');

            button.addEventListener('click', function() {
                this.classList.toggle('active');
                const content = this.nextElementSibling;

                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                    if (expandIcon) {
                        expandIcon.src = 'images/expand_more.svg';
                    }
                } else {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    if (expandIcon) {
                        expandIcon.src = 'images/expand_less.svg';
                    }
                }
            });
        });
    }

    // Smooth page load animation
    function initPageTransition() {
        document.body.classList.add('loaded');
    }

    // Initialize on DOM ready
    function init() {
        initAccordions();
        initPageTransition();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
