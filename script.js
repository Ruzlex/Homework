(() => {
  "use strict";

  /** Formspree endpoint для реальной отправки заявок владельцу. */
  const FORM_ENDPOINT = "https://formspree.io/f/*******";

  const form = document.getElementById("consult-form");
  const success = document.getElementById("form-success");
  const resetBtn = document.getElementById("form-reset");
  const submitBtn = document.getElementById("form-submit");
  const yearEl = document.getElementById("year");
  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  const phoneDigits = (value) => value.replace(/\D/g, "");

  const formatPhone = (value) => {
    let digits = phoneDigits(value);

    if (digits.startsWith("8")) {
      digits = "7" + digits.slice(1);
    }
    if (!digits.startsWith("7") && digits.length > 0) {
      digits = "7" + digits;
    }
    digits = digits.slice(0, 11);

    const parts = ["+7"];
    if (digits.length > 1) parts.push(" (" + digits.slice(1, 4));
    if (digits.length >= 4) parts[1] += ")";
    if (digits.length > 4) parts.push(" " + digits.slice(4, 7));
    if (digits.length > 7) parts.push("-" + digits.slice(7, 9));
    if (digits.length > 9) parts.push("-" + digits.slice(9, 11));
    return parts.join("");
  };

  const setError = (input, errorEl, message) => {
    if (!input || !errorEl) return;
    if (message) {
      input.classList.add("is-invalid");
      input.setAttribute("aria-invalid", "true");
      errorEl.hidden = false;
      errorEl.textContent = message;
    } else {
      input.classList.remove("is-invalid");
      input.removeAttribute("aria-invalid");
      errorEl.hidden = true;
      errorEl.textContent = "";
    }
  };

  const validateName = () => {
    const value = nameInput.value.trim();
    const errorEl = document.getElementById("name-error");
    if (!value) {
      setError(nameInput, errorEl, "Укажите имя");
      return false;
    }
    if (value.length < 2) {
      setError(nameInput, errorEl, "Имя слишком короткое");
      return false;
    }
    if (!/^[a-zA-Zа-яА-ЯёЁ\s\-']+$/u.test(value)) {
      setError(nameInput, errorEl, "Используйте только буквы");
      return false;
    }
    setError(nameInput, errorEl, "");
    return true;
  };

  const validatePhone = () => {
    const digits = phoneDigits(phoneInput.value);
    const errorEl = document.getElementById("phone-error");
    if (!digits) {
      setError(phoneInput, errorEl, "Укажите телефон");
      return false;
    }
    if (!(digits.length === 11 && digits.startsWith("7"))) {
      setError(phoneInput, errorEl, "Введите номер полностью: +7 и 10 цифр");
      return false;
    }
    setError(phoneInput, errorEl, "");
    return true;
  };

  const showSuccess = () => {
    form.hidden = true;
    success.hidden = false;
    success.focus();
  };

  const showForm = () => {
    success.hidden = true;
    form.hidden = false;
    form.reset();
    setError(nameInput, document.getElementById("name-error"), "");
    setError(phoneInput, document.getElementById("phone-error"), "");
    nameInput.focus();
  };

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      const start = phoneInput.selectionStart;
      const before = phoneInput.value.length;
      phoneInput.value = formatPhone(phoneInput.value);
      const after = phoneInput.value.length;
      if (typeof start === "number") {
        const pos = Math.max(0, start + (after - before));
        phoneInput.setSelectionRange(pos, pos);
      }
      if (phoneInput.classList.contains("is-invalid")) {
        validatePhone();
      }
    });
  }

  if (nameInput) {
    nameInput.addEventListener("blur", validateName);
    nameInput.addEventListener("input", () => {
      if (nameInput.classList.contains("is-invalid")) validateName();
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener("blur", validatePhone);
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nameOk = validateName();
      const phoneOk = validatePhone();
      if (!nameOk || !phoneOk) {
        const firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const payload = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        source: "landing-back-joints",
      };

      submitBtn.disabled = true;
      submitBtn.textContent = "Отправляем…";

      try {
        const response = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("submit_failed");
        }

        showSuccess();
      } catch (error) {
        const phoneError = document.getElementById("phone-error");
        setError(
          phoneInput,
          phoneError,
          "Не удалось отправить заявку. Позвоните нам или попробуйте позже."
        );
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Отправить заявку";
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", showForm);
  }
})();
