(function highlightCurrentScheduleSlot() {
    const items = document.querySelectorAll('.db-timeline-item[data-time]');
    if (!items.length) return;

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    let activeItem = null;
    let activeMinutes = -1;

    items.forEach((item) => {
        const [h, m] = item.dataset.time.split(':').map(Number);
        const slotMinutes = (h * 60) + m;
        if (slotMinutes <= nowMinutes && slotMinutes > activeMinutes) {
            activeItem = item;
            activeMinutes = slotMinutes;
        }
    });

    items.forEach((item) => item.classList.remove('is-now'));
    if (activeItem) activeItem.classList.add('is-now');
})();
(function initAnnouncementCarousel() {
    const carousel = document.querySelector('[data-carousel]');
    if (!carousel) return;

    const slides = Array.from(carousel.querySelectorAll('[data-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-carousel-dot]'));
    const prevBtn = carousel.querySelector('[data-carousel-prev]');
    const nextBtn = carousel.querySelector('[data-carousel-next]');
    if (!slides.length) return;

    let current = slides.findIndex((s) => s.classList.contains('is-active'));
    if (current < 0) current = 0;

    function goTo(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
        dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
})();

(function initAnnouncementFilters() {
    const tabsWrap = document.querySelector('[data-filter-tabs]');
    const searchInput = document.querySelector('[data-announcement-search]');
    const rows = Array.from(document.querySelectorAll('[data-announcement-row]'));
    const emptyMsg = document.querySelector('[data-announcement-empty]');
    if (!rows.length) return;

    let activeCategory = 'All Announcements';

    function applyFilters() {
        const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
        let visibleCount = 0;

        rows.forEach((row) => {
            const matchesCategory = activeCategory === 'All Announcements' || row.dataset.category === activeCategory;
            const rowText = row.textContent.toLowerCase();
            const matchesSearch = !query || rowText.includes(query);
            const show = matchesCategory && matchesSearch;
            row.classList.toggle('is-hidden', !show);
            if (show) visibleCount += 1;
        });

        if (emptyMsg) emptyMsg.classList.toggle('is-visible', visibleCount === 0);
        const loadMoreBtn = document.querySelector('[data-load-more]');
        if (loadMoreBtn) {
            const isFiltering = activeCategory !== 'All Announcements' || query.length > 0;
            loadMoreBtn.style.display = isFiltering ? 'none' : '';
        }
    }

    if (tabsWrap) {
        tabsWrap.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-filter-tab]');
            if (!btn) return;
            activeCategory = btn.dataset.filterTab;
            tabsWrap.querySelectorAll('.ps-tab').forEach((t) => t.classList.toggle('active', t === btn));
            applyFilters();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
})();
(function initLoadMore() {
    const btn = document.querySelector('[data-load-more]');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const hiddenRows = document.querySelectorAll('[data-announcement-row].is-hidden');
        hiddenRows.forEach((row) => row.classList.remove('is-hidden'));
        btn.textContent = 'No more announcements';
        btn.disabled = true;
    });
})();
(function initBookmarkToggles() {
    document.querySelectorAll('[data-bookmark-btn]').forEach((btn) => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('is-saved');
        });
    });
})();
(function initCalendarCategoryFilter() {
    const select = document.querySelector('[data-category-filter]');
    const scope = document.querySelector('[data-category-scope]');
    if (!select || !scope) return;

    select.addEventListener('change', () => {
        const chosen = select.value; // '' = All Categories
        scope.querySelectorAll('.cal-event').forEach((ev) => {
            const show = !chosen || ev.dataset.category === chosen;
            ev.classList.toggle('is-filtered-out', !show);
        });
    });
})();
(function initCalendarViewSwitch() {
    const group = document.querySelector('[data-view-switch]');
    if (!group) return;

    group.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-view]');
        if (!btn) return;
        group.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn));
    });
})();
(function initWizardStepForm() {
    const form = document.querySelector('[data-wizard-step-form]');
    if (!form) return;

    const notice = form.querySelector('[data-wizard-notice]');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!form.reportValidity()) return; // let the browser show its normal field errors
        if (notice) {
            notice.hidden = false;
            notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
})();
(function initFileUploadValidation() {
    // id-based lookup first (an input id="foo" pairs with an error
    // element id="fooError", same convention setAuthFieldError uses),
    // falling back to the structural search wedding-request-step2.php's
    // rows still rely on (no matching id on those error spans) --
    // works for both without every existing file input needing an
    // id+"Error" pair retrofitted.
    function findFileErrorElement(input) {
        if (input.id) {
            const byId = document.getElementById(input.id + 'Error');
            if (byId) return byId;
        }
        return input.closest('.wr-req-upload, .ps-field')?.querySelector('[data-file-error]') || null;
    }

    document.querySelectorAll('input[type="file"][data-max-size-mb]').forEach((input) => {
        input.addEventListener('change', () => {
            const maxMb = parseFloat(input.dataset.maxSizeMb);
            const errorEl = findFileErrorElement(input);
            const file = input.files && input.files[0];
            if (!file) return;

            const tooBig = file.size > maxMb * 1024 * 1024;
            if (errorEl) {
                errorEl.hidden = !tooBig;
                errorEl.textContent = tooBig
                    ? `"${file.name}" is too large (max ${maxMb}MB). Please choose a smaller file.`
                    : '';
            }
            if (tooBig) input.value = '';
        });
    });
})();

(function initConfirmToggle() {
    const toggle = document.querySelector('[data-confirm-toggle]');
    const submitBtn = document.querySelector('[data-confirm-submit]');
    if (!toggle || !submitBtn) return;

    const sync = () => { submitBtn.disabled = !toggle.checked; };
    toggle.addEventListener('change', sync);
    sync();
})();
(function initMobileMenu() {
    const toggle = document.querySelector('[data-mobile-menu-toggle]');
    const menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) return;

    function setOpen(isOpen) {
        menu.hidden = !isOpen;
        toggle.setAttribute('aria-expanded', String(isOpen));
    }

    toggle.addEventListener('click', () => setOpen(menu.hidden));
    menu.addEventListener('click', (e) => {
        if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !menu.hidden) setOpen(false);
    });
})();
(function initNotifPanel() {
    const btn = document.querySelector('[data-notif-toggle]');
    const panel = document.querySelector('[data-notif-panel]');
    if (!btn || !panel) return;

    function setOpen(isOpen) {
        panel.hidden = !isOpen;
        btn.setAttribute('aria-expanded', String(isOpen));
    }

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setOpen(panel.hidden);
    });
    document.addEventListener('click', (e) => {
        if (!panel.hidden && !panel.contains(e.target) && e.target !== btn) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !panel.hidden) setOpen(false);
    });

    // Confirming a seminar date is a design preview: no backend to
    // notify, so it just swaps the picker for a small confirmation
    // line inside the same notification item.
    panel.querySelectorAll('[data-seminar-confirm]').forEach((confirmBtn) => {
        confirmBtn.addEventListener('click', () => {
            const wrap = confirmBtn.closest('[data-seminar-notif]');
            const select = wrap ? wrap.querySelector('select') : null;
            if (!select || !select.value) {
                if (select) select.focus();
                return;
            }
            const chosenLabel = select.options[select.selectedIndex].text;
            wrap.innerHTML = '<p class="ps-notif-confirmed">' + ('You’re booked for the ' + chosenLabel + ' seminar.') + '</p>';
        });
    });
})();
(function initPasswordToggles() {
    document.querySelectorAll('[data-password-toggle]').forEach((btn) => {
        const input = btn.closest('.ps-field-icon')?.querySelector('input[type="password"], input[type="text"]');
        if (!input) return;

        btn.addEventListener('click', () => {
            const showing = input.type === 'text';
            input.type = showing ? 'password' : 'text';
            btn.setAttribute('aria-pressed', String(!showing));
            btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
        });
    });
})();

(function initLoginForm() {
    const form = document.querySelector('[data-login-form]');
    if (!form) return;

    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const alertBox = document.querySelector('[data-auth-alert]');
    const submitBtn = document.querySelector('[data-login-submit]');
    const submitLabel = submitBtn ? submitBtn.querySelector('[data-submit-label]') : null;
    if (!emailInput || !passwordInput) return;

    function validateEmail() {
        const value = emailInput.value.trim();
        if (!value) { setAuthFieldError(emailInput, 'Please enter your email address.'); return false; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setAuthFieldError(emailInput, 'Please enter a valid email address.');
            return false;
        }
        setAuthFieldError(emailInput, null);
        return true;
    }

    function validatePassword() {
        if (!passwordInput.value) { setAuthFieldError(passwordInput, 'Please enter your password.'); return false; }
        setAuthFieldError(passwordInput, null);
        return true;
    }
    emailInput.addEventListener('blur', validateEmail);
    passwordInput.addEventListener('blur', validatePassword);
    emailInput.addEventListener('input', () => {
        if (emailInput.closest('.auth-field').classList.contains('has-error')) validateEmail();
    });
    passwordInput.addEventListener('input', () => {
        if (passwordInput.closest('.auth-field').classList.contains('has-error')) validatePassword();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (alertBox) alertBox.hidden = true;

        const emailOk = validateEmail();
        const passwordOk = validatePassword();

        if (!emailOk) { emailInput.focus(); return; }
        if (!passwordOk) { passwordInput.focus(); return; }
        if (submitBtn) { submitBtn.disabled = true; submitBtn.classList.add('is-loading'); }
        if (submitLabel) submitLabel.textContent = 'Logging inâ€¦';

        window.setTimeout(() => {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.classList.remove('is-loading'); }
            if (submitLabel) submitLabel.textContent = 'Log In';
            passwordInput.value = '';

            if (alertBox) {
                alertBox.hidden = false;
                alertBox.focus();
            }
        }, 650);
    });
})();

(function initRegisterForm() {
    const form = document.querySelector('[data-register-form]');
    if (!form) return;

    const fields = {
        firstName: document.getElementById('firstName'),
        lastName: document.getElementById('lastName'),
        dateOfBirth: document.getElementById('dateOfBirth'),
        gender: document.getElementById('gender'),
        email: document.getElementById('registerEmail'),
        mobileNumber: document.getElementById('mobileNumber'),
        password: document.getElementById('registerPassword'),
        confirmPassword: document.getElementById('confirmPassword'),
        agreeTruthful: document.getElementById('agreeTruthful'),
    };
    if (Object.values(fields).some((el) => !el)) return;

    const alertBox = document.querySelector('[data-auth-alert]');
    const submitBtn = document.querySelector('[data-register-submit]');
    const submitLabel = submitBtn ? submitBtn.querySelector('[data-submit-label]') : null;

    const validators = {
        firstName: () => {
            if (!fields.firstName.value.trim()) { setAuthFieldError(fields.firstName, 'Please enter your first name.'); return false; }
            setAuthFieldError(fields.firstName, null); return true
        },
        lastName: () => {
            if (!fields.lastName.value.trim()) { setAuthFieldError(fields.lastName, 'Please enter your last name.'); return false; }
            setAuthFieldError(fields.lastName, null); return true;
        },
        dateOfBirth: () => {
            if (!fields.dateOfBirth.value) { setAuthFieldError(fields.dateOfBirth, 'Please enter your date of birth.'); return false; }
            setAuthFieldError(fields.dateOfBirth, null); return true;
        },
        gender: () => {
            if (!fields.gender.value) { setAuthFieldError(fields.gender, 'Please select your gender.'); return false; }
            setAuthFieldError(fields.gender, null); return true;
        },
        email: () => {
            const value = fields.email.value.trim();
            if (!value) { setAuthFieldError(fields.email, 'Please enter your email address.'); return false; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { setAuthFieldError(fields.email, 'Please enter a valid email address.'); return false; }
            setAuthFieldError(fields.email, null); return true;
        },
        mobileNumber: () => {
        const value = fields.mobileNumber.value.trim();
        if (!value) { setAuthFieldError(fields.mobileNumber, 'Please enter your mobile number.'); return false; }
        if (!/^09\d{9}$/.test(value)) { setAuthFieldError(fields.mobileNumber, 'Please enter a valid 11-digit mobile number (e.g. 09XXXXXXXXX).'); return false; }
        setAuthFieldError(fields.mobileNumber, null); return true;
        },
        password: () => {
            if (!fields.password.value) { setAuthFieldError(fields.password, 'Please create a password.'); return false; }
            if (fields.password.value.length < 8) { setAuthFieldError(fields.password, 'Password must be at least 8 characters.'); return false; }
            setAuthFieldError(fields.password, null); return true;
        },
        confirmPassword: () => {
            if (!fields.confirmPassword.value) { setAuthFieldError(fields.confirmPassword, 'Please confirm your password.'); return false; }
            if (fields.confirmPassword.value !== fields.password.value) { setAuthFieldError(fields.confirmPassword, 'Passwords do not match.'); return false; }
            setAuthFieldError(fields.confirmPassword, null); return true;
        },
        agreeTruthful: () => {
            if (!fields.agreeTruthful.checked) { setAuthFieldError(fields.agreeTruthful, 'Please confirm that the information provided is true and correct.'); return false; }
            setAuthFieldError(fields.agreeTruthful, null); return true;
        },
    };

    const order = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'email', 'mobileNumber', 'password', 'confirmPassword', 'agreeTruthful'];

    order.forEach((key) => {
        const el = fields[key];
        const evt = el.type === 'checkbox' ? 'change' : (el.tagName === 'SELECT' ? 'change' : 'blur');
        el.addEventListener(evt, validators[key]);

        if (el.tagName !== 'SELECT' && el.type !== 'checkbox') {
            el.addEventListener('input', () => {
                if (el.closest('.auth-field')?.classList.contains('has-error')) validators[key]();
            });
        }
    });
    fields.password.addEventListener('input', () => {
        if (fields.confirmPassword.value) validators.confirmPassword();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (alertBox) alertBox.hidden = true;

        let firstInvalid = null;
        order.forEach((key) => {
            const ok = validators[key]();
            if (!ok && !firstInvalid) firstInvalid = fields[key];
        });

        if (firstInvalid) { firstInvalid.focus(); return; }

        if (submitBtn) { submitBtn.disabled = true; submitBtn.classList.add('is-loading'); }
        if (submitLabel) submitLabel.textContent = 'Creating accountâ€¦';

        form.submit();
    });
})();


/**
 * A <select> has no native "placeholder" concept the way a text input
 * does -- its hint option ("Select suffix", "Select gender") renders
 * in the exact same color a real chosen answer would, which reads as
 * already-filled-in and looks inconsistent next to an actual empty
 * text field's lighter placeholder text right beside it. This just
 * toggles .is-placeholder while the current value is the empty hint
 * option; style.css dims the text for exactly that state (see
 * ".ps-field select.is-placeholder"). Runs on every <select> on the
 * page, not just form ones -- harmless where no matching CSS rule
 * exists (e.g. calendar.php's toolbar filter), so it doesn't need to
 * know which selects "count".
 */
(function initSelectPlaceholderStyling() {
    function sync(select) {
        select.classList.toggle('is-placeholder', select.value === '');
    }
    document.querySelectorAll('select').forEach((select) => {
        sync(select);
        select.addEventListener('change', () => sync(select));
    });
})();

/**
 * Admin portal: client-side filtering for a table of [data-admin-row]
 * elements, same "toggle .is-hidden, show an empty state" technique
 * initAnnouncementFilters() already uses -- generalized here since the
 * three admin list pages need different combinations of controls
 * (requests: type + status + search; donations: status + search;
 * announcements: search only). Any control that isn't present on a
 * given page is just skipped.
 */
(function initAdminTableFilters() {
    const rows = Array.from(document.querySelectorAll('[data-admin-row]'));
    if (!rows.length) return;

    const typeTabsWrap = document.querySelector('[data-admin-type-tabs]');
    const statusSelect = document.querySelector('[data-admin-status-select]');
    const searchInput = document.querySelector('[data-admin-search]');
    const emptyMsg = document.querySelector('[data-admin-empty]');

    let activeType = 'all';

    function apply() {
        const statusVal = statusSelect ? statusSelect.value : '';
        const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
        let visibleCount = 0;

        rows.forEach((row) => {
            const matchesType = activeType === 'all' || row.dataset.type === activeType;
            const matchesStatus = !statusVal || row.dataset.status === statusVal;
            const matchesSearch = !q || (row.dataset.search || '').toLowerCase().includes(q);
            const visible = matchesType && matchesStatus && matchesSearch;
            row.classList.toggle('is-hidden', !visible);
            if (visible) visibleCount += 1;
        });

        if (emptyMsg) emptyMsg.hidden = visibleCount > 0;
    }

    if (typeTabsWrap) {
        typeTabsWrap.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-admin-type-tab]');
            if (!btn) return;
            activeType = btn.dataset.adminTypeTab;
            typeTabsWrap.querySelectorAll('[data-admin-type-tab]').forEach((b) => b.classList.toggle('active', b === btn));
            apply();
        });
    }
    if (statusSelect) statusSelect.addEventListener('change', apply);
    if (searchInput) searchInput.addEventListener('input', apply);

    apply();
})();

/**
 * Admin portal: modal open/close + "save"/"delete" as a cosmetic-only
 * preview -- there is no backend this pass, so submitting the status-
 * update / add-announcement modal just reflects the change back onto
 * the row that opened it (or removes it, for delete) and shows a
 * toast saying so, rather than actually persisting anything.
 *
 * [data-modal-trigger="someId"] opens the [data-modal] with id="someId"
 * and copies each of the trigger's data-* values into that modal's
 * matching [data-modal-field="key"] elements (form fields get .value
 * set, checkboxes get .checked, plain elements get .textContent) --
 * this is how a row's already-rendered data gets into the edit modal
 * without any AJAX round-trip.
 */
(function initAdminModals() {
    const triggers = document.querySelectorAll('[data-modal-trigger]');
    if (!triggers.length) return;

    let activeRow = null;

    function showToast(message) {
        const toast = document.querySelector('[data-toast]');
        if (!toast) return;
        const text = toast.querySelector('[data-toast-text]');
        if (text) text.textContent = message;
        toast.hidden = false;
        clearTimeout(showToast._t);
        showToast._t = window.setTimeout(() => { toast.hidden = true; }, 3500);
    }

    // Wedding-only: the Pre-Cana Seminar Schedule field only makes
    // sense (and only unlocks) once every required document for THAT
    // wedding has been checked off -- reads live from the checklist's
    // checkboxes, not just their state at modal-open time, so ticking
    // the last box while the modal is still open reveals it right away.
    function syncSeminarAvailability(modal) {
        const seminarWrap = modal.querySelector('[data-modal-seminar-wrap]');
        if (!seminarWrap) return;
        const isWedding = activeRow && activeRow.dataset.type === 'wedding';
        if (!isWedding) { seminarWrap.hidden = true; return; }
        const boxes = modal.querySelectorAll('[data-doc-index]');
        const allChecked = boxes.length > 0 && Array.from(boxes).every((c) => c.checked);
        seminarWrap.hidden = !allChecked;
    }

    function fillModal(modal, trigger) {
        modal.querySelectorAll('[data-modal-field]').forEach((field) => {
            const key = field.dataset.modalField;
            if (!(key in trigger.dataset)) return;
            if (field.type === 'checkbox') {
                field.checked = Boolean(trigger.dataset[key]);
            } else if ('value' in field) {
                field.value = trigger.dataset[key];
            } else {
                field.textContent = trigger.dataset[key];
            }
        });

        // Required-documents checklist (sacrament requests only) --
        // rendered from the trigger's data-docs JSON since each request
        // type has a different document list (see admin-requests.php).
        const docsWrap = modal.querySelector('[data-modal-docs-wrap]');
        const docsContainer = modal.querySelector('[data-modal-docs]');
        if (docsWrap && docsContainer) {
            if (trigger.dataset.docs) {
                const items = JSON.parse(trigger.dataset.docs);
                docsContainer.innerHTML = items.map((item, i) => (
                    '<label class="admin-doc-item">' +
                    '<input type="checkbox" data-doc-index="' + i + '"' + (item.checked ? ' checked' : '') + '>' +
                    '<span>' + item.label + '</span>' +
                    '</label>'
                )).join('');
                docsWrap.hidden = false;
            } else {
                docsContainer.innerHTML = '';
                docsWrap.hidden = true;
            }
        }

        syncSeminarAvailability(modal);
    }

    function openModal(modal, trigger) {
        activeRow = trigger.closest('[data-admin-row]');
        fillModal(modal, trigger);
        modal.hidden = false;
        document.body.classList.add('ps-modal-open');
    }

    function closeModal(modal) {
        modal.hidden = true;
        document.body.classList.remove('ps-modal-open');
    }

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', () => {
            const modal = document.getElementById(trigger.dataset.modalTrigger);
            if (modal) openModal(modal, trigger);
        });
    });

    document.querySelectorAll('[data-modal]').forEach((modal) => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
        modal.querySelectorAll('[data-modal-close]').forEach((btn) => {
            btn.addEventListener('click', () => closeModal(modal));
        });

        const docsContainerEl = modal.querySelector('[data-modal-docs]');
        if (docsContainerEl) {
            docsContainerEl.addEventListener('change', () => syncSeminarAvailability(modal));
        }

        const form = modal.querySelector('form[data-mock-form]');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const statusField = form.querySelector('[name="status"]');
                if (activeRow && statusField) {
                    const pill = activeRow.querySelector('[data-row-status]');
                    if (pill) {
                        pill.textContent = statusField.options[statusField.selectedIndex]?.text || statusField.value;
                        pill.className = 'ps-status is-' + statusField.value;
                    }
                    activeRow.dataset.status = statusField.value;
                }

                const docCheckboxes = form.querySelectorAll('[data-doc-index]');
                let allDocsComplete = false;
                if (activeRow && docCheckboxes.length) {
                    const total = docCheckboxes.length;
                    const received = Array.from(docCheckboxes).filter((c) => c.checked).length;
                    allDocsComplete = received === total;
                    const count = activeRow.querySelector('.admin-doc-count');
                    if (count) {
                        count.classList.toggle('is-complete', allDocsComplete);
                        count.lastChild.textContent = ' ' + received + '/' + total;
                    }
                }

                closeModal(modal);

                const isWeddingApproval = activeRow && activeRow.dataset.type === 'wedding'
                    && statusField && statusField.value === 'approved' && allDocsComplete;
                showToast(isWeddingApproval
                    ? 'Approved — couple notified to pick a seminar date.'
                    : (form.dataset.mockForm || 'Saved. (Design preview only -- not connected to a database.)'));
            });
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        document.querySelectorAll('[data-modal]:not([hidden])').forEach(closeModal);
    });

    document.querySelectorAll('[data-mock-delete]').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (!window.confirm('Delete this item? (Design preview only -- nothing is actually saved.)')) return;
            const row = btn.closest('[data-admin-row]');
            if (row) row.remove();
            showToast('Deleted. (Design preview only -- not connected to a database.)');
        });
    });
})();
