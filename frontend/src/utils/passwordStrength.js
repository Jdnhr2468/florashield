export function checkPasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    hasUpperLower: /[a-z]/.test(password) && /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^a-zA-Z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  let label, color, value;
  if (score <= 1) {
    label = 'Weak'; color = '#EF4444'; value = 25;
  } else if (score === 2) {
    label = 'Fair'; color = '#F59E0B'; value = 50;
  } else if (score === 3) {
    label = 'Good'; color = '#EAB308'; value = 75;
  } else {
    label = 'Strong'; color = '#22C55E'; value = 100;
  }

  return { label, color, value, checks };
}

export function isPasswordStrongEnough(password) {
  const { value } = checkPasswordStrength(password);
  return value >= 75; // минимум "Good", чтобы разрешить создание аккаунта
}