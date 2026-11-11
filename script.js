const form = document.getElementById('signupForm');
const phoneInput = document.getElementById('phone');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirmPassword');
const submitBtn = document.getElementById('submitBtn');
let formHint = document.getElementById('formHint');
if (!formHint) {
  formHint = document.createElement('span');
  formHint.id = 'formHint';
  formHint.className = 'strength-label';
  submitBtn.insertAdjacentElement('afterend', formHint);
}
formHint.setAttribute('role', 'status');
submitBtn.setAttribute('aria-describedby', 'formHint');

const phoneError = document.getElementById('phoneError');
const passwordError = document.getElementById('passwordError');
const confirmError = document.getElementById('confirmError');
const successMessage = document.getElementById('successMessage');

const strengthBar = document.getElementById('strengthBar');
const strengthLabel = document.getElementById('strengthLabel');

function validatePhone(value) {
  // Проверяем всю строку, включая отсутствие пробелов и перевода строки в конце.
  return /^(?:\+7|[78])[0-9]{10}(?![\s\S])/.test(value);
}

function getPasswordStrength(value) {
  if (value.length === 0) return 0;

  let score = 0;
  if (value.length >= 8) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^a-zA-Z0-9]/.test(value)) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;

  if (score <= 1) return 1;
  if (score <= 2) return 2;
  return 3;
}

function isPasswordValid(value) {
  if (value.length < 8 || value.length > 30) return false;
  if (/\s/.test(value)) return false;
  if (!/[0-9]/.test(value)) return false;
  if (!/[^a-zA-Z0-9]/.test(value)) return false;
  if (!/[a-zA-Z]/.test(value)) return false;

  return true;
}

function getPasswordErrorMessage(value) {
  if (value.length === 0) return '';
  if (/\s/.test(value)) return 'Пароль не должен содержать пробелов';
  if (value.length < 8) return 'Пароль слишком короткий: минимум 8 символов';
  if (value.length > 30) return 'Пароль слишком длинный: максимум 30 символов';
  if (!/[a-zA-Z]/.test(value)) return 'Пароль должен содержать хотя бы одну букву';
  if (!/[0-9]/.test(value)) return 'Пароль должен содержать хотя бы одну цифру';
  if (!/[^a-zA-Z0-9]/.test(value)) return 'Пароль должен содержать хотя бы один спецсимвол';
  return '';
}

function doPasswordsMatch(password, confirm) {
  return password === confirm && confirm.length > 0;
}

function updateStrengthUI(value) {
  const strength = getPasswordStrength(value);
  const widths = ['0%', '33%', '66%', '100%'];
  const colors = ['#eaeaea', '#e5484d', '#f5a623', '#1a7f37'];
  const labels = ['', 'Слабый', 'Средний', 'Сильный'];

  strengthBar.style.width = widths[strength];
  strengthBar.style.background = colors[strength];
  strengthLabel.textContent = labels[strength];
}

function isFormValid() {
  const phoneOk = validatePhone(phoneInput.value);
  const passwordOk = isPasswordValid(passwordInput.value);
  const confirmOk = doPasswordsMatch(passwordInput.value, confirmInput.value);
  return phoneOk && passwordOk && confirmOk;
}

function updateSubmitButtonState() {
  const corrections = [];
  if (!validatePhone(phoneInput.value)) {
    corrections.push('введите телефон в формате +7XXXXXXXXXX (11 цифр)');
  }
  if (!isPasswordValid(passwordInput.value)) {
    corrections.push(passwordInput.value.length === 0
      ? 'введите пароль (8–30 символов, буква, цифра и спецсимвол, без пробелов)'
      : getPasswordErrorMessage(passwordInput.value));
  }
  if (!doPasswordsMatch(passwordInput.value, confirmInput.value)) {
    corrections.push('повторите пароль так, чтобы пароли совпадали');
  }

  submitBtn.disabled = !isFormValid();
  formHint.textContent = submitBtn.disabled
    ? `Чтобы зарегистрироваться: ${corrections.join('; ')}.`
    : '';
  submitBtn.style.opacity = submitBtn.disabled ? '0.5' : '1';
  submitBtn.style.cursor = submitBtn.disabled ? 'not-allowed' : 'pointer';
}

phoneInput.addEventListener('input', () => {
  if (phoneInput.value.length === 0) {
    phoneError.textContent = '';
  } else if (!validatePhone(phoneInput.value)) {
    phoneError.textContent = 'Введите номер в формате +7XXXXXXXXXX (11 цифр)';
  } else {
    phoneError.textContent = '';
  }
  updateSubmitButtonState();
});

passwordInput.addEventListener('input', () => {
  updateStrengthUI(passwordInput.value);

  passwordError.textContent = getPasswordErrorMessage(passwordInput.value);

  if (confirmInput.value.length > 0) {
    confirmError.textContent = doPasswordsMatch(passwordInput.value, confirmInput.value)
      ? ''
      : 'Пароли не совпадают';
  }

  updateSubmitButtonState();
});

confirmInput.addEventListener('input', () => {
  if (confirmInput.value.length === 0) {
    confirmError.textContent = '';
  } else if (!doPasswordsMatch(passwordInput.value, confirmInput.value)) {
    confirmError.textContent = 'Пароли не совпадают';
  } else {
    confirmError.textContent = '';
  }
  updateSubmitButtonState();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (isFormValid()) {
    successMessage.textContent = 'Регистрация прошла успешно!';
  }
});

updateSubmitButtonState();
