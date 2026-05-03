import { capitalize } from '../utils';

export function attachValidation(inputs) {
  const updateErrorMessage = (event) => {
    const target = event.target;

    target.setCustomValidity('');

    if (target.validity.valueMissing) {
      target.setCustomValidity(`${capitalize(target.name)} is required`);
    }

    if (target.type === 'email' && target.validity.typeMismatch) {
      target.setCustomValidity('Invalid email format');
    }

    if (
      target.name === 'password' &&
      !target.id.includes('login') &&
      target.value.length < 8
    ) {
      target.setCustomValidity('Password must be at least 8 characters');
    }

    const isValid = target.validity.valid;
    const errorMessage = target.validationMessage;

    const connectedValidationId = target.getAttribute('aria-describedby');
    const connectedValidationEl = document.getElementById(
      connectedValidationId,
    );

    if (connectedValidationEl) {
      connectedValidationEl.innerText = !isValid ? errorMessage : '';
    }
  };

  Object.values(inputs).forEach((input) => {
    ['input', 'blur', 'invalid'].forEach((eventType) => {
      input.addEventListener(eventType, updateErrorMessage);
    });
  });
}
