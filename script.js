const form = document.getElementById('signupForm');
const phoneInput = document.getElementById('phone');
const passwordInput = document.getElementById('password');
const confirmInput = document.getElementById('confirmPassword');
const submitBtn = document.getElementById('submitBtn');

const phoneError = document.getElementById('phoneError');
const passwordError = document.getElementById('passwordError');
const confirmError = document.getElementById('confirmError');
const successMessage = document.getElementById('successMessage');

const strengthBar = document.getElementById('strengthBar');
const strengthLabel = document.getElementById('strengthLabel');

function validatePhone(value) {
  const digitsOnly = value.replace(/\D/g, '');
  const isValidLength = digitsOnly.length === 11;
  const startsCorrectly = digitsOnly.startsWith('7') || digitsOnly.startsWith('8');
  return isValidLength && startsCorrectly;
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
  return getPasswordStrength(value) >= 2 && value.length >= 8;
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
  submitBtn.disabled = !isFormValid();
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

  if (passwordInput.value.length === 0) {
    passwordError.textContent = '';
  } else if (!isPasswordValid(passwordInput.value)) {
    passwordError.textContent = 'Пароль слишком слабый: минимум 8 символов, добавьте цифры или спецсимволы';
  } else {
    passwordError.textContent = '';
  }

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
