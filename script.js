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

// ---------- Телефон: маска +7 (XXX) XXX-XX-XX ----------

const PHONE_PREFIX = '+7 (';
const PHONE_PATTERN = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;

// Достаёт из введённого текста 10 цифр номера (без кода страны +7)
function extractPhoneDigits(value) {
  let digits = value.replace(/\D/g, '');
  if (value.startsWith('+7')) {
    digits = digits.slice(1); // убираем 7 из префикса +7
  } else if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8')) {
    digits = digits.slice(1); // вставили номер целиком: 7XXXXXXXXXX или 8XXXXXXXXXX
  }
  return digits.slice(0, 10); // больше 10 цифр ввести нельзя
}

// Превращает цифры в вид +7 (XXX) XXX-XX-XX
function formatPhone(digits) {
  let result = PHONE_PREFIX + digits.slice(0, 3);
  if (digits.length > 3) result += ') ' + digits.slice(3, 6);
  if (digits.length > 6) result += '-' + digits.slice(6, 8);
  if (digits.length > 8) result += '-' + digits.slice(8, 10);
  return result;
}

function validatePhone(value) {
  return PHONE_PATTERN.test(value);
}

// ---------- Пароль: реальные критерии надёжности ----------

// Самые популярные пароли из утечек
const COMMON_PASSWORDS = [
  '12345678', '123456789', '1234567890', '87654321', '11111111', '00000000',
  'qwerty12', 'qwerty123', 'qwertyui', '1q2w3e4r', '1qaz2wsx', 'zaq12wsx',
  'password', 'password1', 'iloveyou', 'admin123', 'йцукенгш', 'пароль123'
];

// Популярные слова, которые нельзя делать основой пароля (Password1! и т.п.)
const COMMON_WORDS = [
  'password', 'qwerty', 'qwertyuiop', 'admin', 'iloveyou', 'letmein', 'welcome',
  'parol', 'пароль', 'йцукен'
];

// Простые последовательности (в т.ч. по клавиатуре)
const SEQUENCES = /(0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|abcd|bcde|cdef|qwer|wert|erty|asdf|sdfg|zxcv|йцук|цуке|фыва|абвг)/i;

// Возвращает список того, чего не хватает паролю. Пустой список = пароль надёжный.
function getPasswordProblems(value) {
  const problems = [];
  const lower = value.toLowerCase();
  // "Расшифровываем" замены вроде P@ssw0rd → password, чтобы их тоже ловить
  const unleet = lower
    .replace(/@/g, 'a').replace(/0/g, 'o').replace(/[1!|]/g, 'i')
    .replace(/3/g, 'e').replace(/\$/g, 's').replace(/5/g, 's');
  const lettersOnly = lower.replace(/[^a-zа-яё]/g, '');
  const unleetLetters = unleet.replace(/[^a-zа-яё]/g, '');

  if (value.length < 8) problems.push('минимум 8 символов');
  if (!/[a-zа-яё]/.test(value)) problems.push('строчная буква');
  if (!/[A-ZА-ЯЁ]/.test(value)) problems.push('заглавная буква');
  if (!/[0-9]/.test(value)) problems.push('цифра');
  if (!/[^a-zA-Zа-яА-ЯёЁ0-9]/.test(value)) problems.push('спецсимвол (!, @, # и т.п.)');

  if (COMMON_PASSWORDS.includes(lower)) {
    problems.push('не используйте популярный пароль');
  } else if (COMMON_WORDS.includes(lettersOnly) || COMMON_WORDS.includes(unleetLetters)) {
    problems.push('не стройте пароль на популярном слове');
  }
  if (/(.)\1{2,}/.test(value)) problems.push('без 3+ одинаковых символов подряд (aaa, 111)');
  if (SEQUENCES.test(value)) problems.push('без простых последовательностей (1234, abcd, qwer)');
  if (new Set(value).size < 5) problems.push('больше разных символов');

  return problems;
}

// 0 — пусто, 1 — слабый, 2 — средний, 3 — сильный (только сильный принимается)
function getPasswordStrength(value) {
  if (value.length === 0) return 0;
  const problemsCount = getPasswordProblems(value).length;
  if (problemsCount === 0) return 3;
  if (problemsCount <= 2) return 2;
  return 1;
}

function isPasswordValid(value) {
  return getPasswordProblems(value).length === 0;
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

// ---------- Кнопка ----------

function isFormValid() {
  const phoneOk = validatePhone(phoneInput.value);
  const passwordOk = isPasswordValid(passwordInput.value);
  const confirmOk = doPasswordsMatch(passwordInput.value, confirmInput.value);
  return phoneOk && passwordOk && confirmOk;
}

// Кнопка неактивна (серая), пока не выполнены все условия
function updateSubmitButtonState() {
  submitBtn.disabled = !isFormValid();
  successMessage.textContent = '';
}

// ---------- Обработчики ----------

phoneInput.addEventListener('focus', () => {
  if (phoneInput.value === '') phoneInput.value = PHONE_PREFIX;
});

phoneInput.addEventListener('blur', () => {
  if (extractPhoneDigits(phoneInput.value).length === 0) phoneInput.value = '';
});

phoneInput.addEventListener('input', () => {
  const digits = extractPhoneDigits(phoneInput.value);
  phoneInput.value = formatPhone(digits);

  if (digits.length === 0) {
    phoneError.textContent = '';
  } else if (!validatePhone(phoneInput.value)) {
    phoneError.textContent = 'Введите 10 цифр после +7 (введено ' + digits.length + ')';
  } else {
    phoneError.textContent = '';
  }
  updateSubmitButtonState();
});

passwordInput.addEventListener('input', () => {
  updateStrengthUI(passwordInput.value);

  const problems = getPasswordProblems(passwordInput.value);
  if (passwordInput.value.length === 0 || problems.length === 0) {
    passwordError.textContent = '';
  } else {
    passwordError.textContent = 'Пароль ненадёжный. Нужно: ' + problems.join(', ');
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
