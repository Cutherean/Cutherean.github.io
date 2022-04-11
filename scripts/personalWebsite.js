window.onload = function () {
	!(function ($) {
		"use strict";

		// Navigation active state on scroll
		const nav_sections = $('section');
		const main_nav = $('.nav-menu, .mobile-nav');

		$(window).on('scroll', function () {
			const cur_pos = $(this).scrollTop() + 200;

			nav_sections.each(function () {
				const top = $(this).offset().top,
					bottom = top + $(this).outerHeight();

				if (cur_pos >= top && cur_pos <= bottom) {
					if (cur_pos <= bottom) {
						main_nav.find('li').removeClass('active');
					}
					main_nav.find('a[href="#' + $(this).attr('id') + '"]').parent('li').addClass('active');
				}
				if (cur_pos < 300) {
					$(".nav-menu ul:first li:first").addClass('active');
				}
			});
		});
	})(jQuery);
}