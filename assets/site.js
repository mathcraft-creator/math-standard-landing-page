(function () {
  'use strict';

  var KAKAO_CHAT_URL = 'http://pf.kakao.com/_yWFTn/chat';
  var LEGACY_HASHES = {
    '#ddak-elementary': './elementary.html#ddak-elementary',
    '#math-standard-secondary': './secondary.html#math-standard-secondary',
    '#fliplearning': './secondary.html#fliplearning',
    '#process': './secondary.html#process'
  };

  function clean(value) {
    return value == null ? '' : String(value).trim();
  }

  function buildConsultMessage(values) {
    values = values || {};
    return [
      '[수학 상담 문의]',
      '학생 이름: ' + clean(values.student),
      '학년: ' + clean(values.grade),
      '학교: ' + clean(values.school),
      '연락처: ' + clean(values.phone),
      '관심 과정: ' + clean(values.program),
      '선호 연락 방법: ' + clean(values.contact),
      '상담 내용: ' + clean(values.message)
    ].join('\n');
  }

  function resolveLegacyHash(page, hash) {
    if (page !== 'home') return null;
    return LEGACY_HASHES[hash] || null;
  }

  function attemptCopy(text, source, documentRef, navigatorRef) {
    if (navigatorRef && navigatorRef.clipboard && typeof navigatorRef.clipboard.writeText === 'function') {
      return navigatorRef.clipboard.writeText(text).then(function () { return true; }, function () {
        return legacyCopy(source, documentRef);
      });
    }
    return Promise.resolve(legacyCopy(source, documentRef));
  }

  function legacyCopy(source, documentRef) {
    if (!source || !documentRef || typeof documentRef.execCommand !== 'function') return false;
    if (typeof source.focus === 'function') source.focus();
    if (typeof source.select === 'function') {
      source.select();
    } else if (typeof documentRef.createRange === 'function') {
      var view = documentRef.defaultView;
      var selection = view && typeof view.getSelection === 'function' ? view.getSelection() : null;
      if (selection) {
        var range = documentRef.createRange();
        range.selectNodeContents(source);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    try {
      return documentRef.execCommand('copy') === true;
    } catch (_) {
      return false;
    }
  }

  function formValues(form) {
    var names = ['student', 'grade', 'school', 'phone', 'program', 'contact', 'message'];
    var values = {};
    names.forEach(function (name) {
      var field = form.elements && form.elements.namedItem(name);
      values[name] = field ? field.value : '';
    });
    return values;
  }

  function initConsultForm(windowRef, documentRef) {
    var form = documentRef.getElementById('consultForm');
    var output = documentRef.getElementById('consultMessage');
    var result = documentRef.getElementById('consultResult');
    var note = documentRef.getElementById('consultFormNote');
    if (!form || !output || !result || !note) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var message = buildConsultMessage(formValues(form));
      output.value = message;
      result.hidden = false;

      // This call stays in the submit event so popup blockers see a user action.
      windowRef.open(KAKAO_CHAT_URL, '_blank', 'noopener,noreferrer');

      attemptCopy(message, output, documentRef, windowRef.navigator).then(function (copied) {
        note.textContent = copied
          ? '상담 문구를 복사했습니다. 열린 카카오톡 채팅창에 붙여넣어 주세요.'
          : '자동 복사가 되지 않았습니다. 아래 문구를 직접 선택해 복사한 뒤 카카오톡으로 보내 주세요.';
      });
    });
    var submitButton = typeof form.querySelector === 'function' ? form.querySelector('[type="submit"]') : null;
    if (submitButton) submitButton.disabled = false;
  }

  function initLegacyRedirect(windowRef, documentRef) {
    function redirect() {
      var page = documentRef.body && documentRef.body.dataset ? documentRef.body.dataset.page : '';
      var target = resolveLegacyHash(page, windowRef.location.hash);
      if (target) windowRef.location.replace(target);
    }
    redirect();
    windowRef.addEventListener('hashchange', redirect);
  }

  function initPhoneDialog(windowRef, documentRef) {
    var dialog = documentRef.getElementById('phoneDialog');
    if (!dialog) return;
    var triggers = documentRef.querySelectorAll("a[href='tel:031-522-5431']");
    var copyButton = documentRef.getElementById('phoneCopyButton');
    var feedback = documentRef.getElementById('phoneCopyFeedback');
    var closeButtons = dialog.querySelectorAll ? dialog.querySelectorAll('[data-phone-close]') : [];
    var lastTrigger = null;

    Array.prototype.forEach.call(triggers, function (trigger) {
      trigger.addEventListener('click', function (event) {
        if (!windowRef.matchMedia('(min-width: 769px)').matches) return;
        event.preventDefault();
        lastTrigger = trigger;
        if (typeof dialog.showModal === 'function') dialog.showModal();
      });
    });

    function closeDialog() {
      if (dialog.open && typeof dialog.close === 'function') dialog.close();
    }
    Array.prototype.forEach.call(closeButtons, function (button) {
      button.addEventListener('click', closeDialog);
    });
    dialog.addEventListener('click', function (event) {
      if (event.target !== dialog || typeof dialog.getBoundingClientRect !== 'function') return;
      var bounds = dialog.getBoundingClientRect();
      var outside = event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom;
      if (outside) closeDialog();
    });
    dialog.addEventListener('close', function () {
      if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
      lastTrigger = null;
    });

    if (copyButton && feedback) {
      copyButton.addEventListener('click', function () {
        var numberSource = dialog.querySelector && dialog.querySelector('[data-phone-number]');
        var number = clean(numberSource ? numberSource.textContent : '031-522-5431');
        attemptCopy(number, numberSource, documentRef, windowRef.navigator).then(function (copied) {
          feedback.textContent = copied
            ? '전화번호를 복사했습니다.'
            : '복사하지 못했습니다. 위 전화번호를 직접 선택해 복사해 주세요.';
        });
      });
    }
  }

  function initFaq(windowRef, documentRef) {
    var toggle = documentRef.getElementById('faqChatbotToggle');
    var panel = documentRef.getElementById('faqChatbotPanel');
    if (!toggle || !panel) return;

    function setOpen(open, restoreFocus) {
      toggle.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      if (!open && restoreFocus && typeof toggle.focus === 'function') toggle.focus();
    }
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true', false);
    });
    toggle.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        event.preventDefault();
        setOpen(false, true);
      }
    });
    panel.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && (!panel.contains || panel.contains(documentRef.activeElement))) {
        event.preventDefault();
        setOpen(false, true);
      }
    });
    if (typeof panel.querySelectorAll === 'function') {
      Array.prototype.forEach.call(panel.querySelectorAll('a[href^="#faq-"]'), function (link) {
        link.addEventListener('click', function (event) {
          var href = link.getAttribute('href');
          var details = href && documentRef.getElementById(href.slice(1));
          if (!details) return;
          event.preventDefault();
          details.open = true;
          setOpen(false, false);
          windowRef.location.hash = href;
          var summary = details.querySelector && details.querySelector('summary');
          if (summary && typeof summary.focus === 'function') summary.focus();
        });
      });
    }
  }

  function initSite(windowRef, documentRef) {
    initLegacyRedirect(windowRef, documentRef);
    initConsultForm(windowRef, documentRef);
    initPhoneDialog(windowRef, documentRef);
    initFaq(windowRef, documentRef);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      buildConsultMessage: buildConsultMessage,
      resolveLegacyHash: resolveLegacyHash,
      legacyCopy: legacyCopy,
      initSite: initSite
    };
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { initSite(window, document); });
    } else {
      initSite(window, document);
    }
  }
})();
