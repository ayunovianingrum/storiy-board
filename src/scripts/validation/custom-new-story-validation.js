export function validateDescription(value) {
  return value?.trim() ? '' : 'Description is required';
}

export function validatePhoto(photo) {
  return photo ? '' : 'Please upload a photo';
}

export function validateLocation(latitude, longitude) {
  return latitude && longitude ? '' : 'Please select a location on the map';
}

export function attachNewStoryLiveValidation(form) {
  if (!form) return;

  const validateField = (name, value) => {
    switch (name) {
      case 'description':
        return validateDescription(value);
      default:
        return '';
    }
  };

  const handler = (event) => {
    const target = event.target;
    if (!target.name) return;

    const errorMessage = validateField(target.name, target.value);
    const errorEl = document.getElementById(`err-message-${target.name}`);

    if (errorEl) {
      errorEl.innerText = errorMessage;
    }
  };

  form.addEventListener('input', handler);
  form.addEventListener('blur', handler, true);
}

export function validateNewStory({ description, photo, lat, lon }) {
  const errors = [];

  const descError = validateDescription(description);
  if (descError) {
    errors.push({ field: 'description', message: descError });
  }

  const photoError = validatePhoto(photo);
  if (photoError) {
    errors.push({ field: 'photo', message: photoError });
  }

  const locationError = validateLocation(lat, lon);
  if (locationError) {
    errors.push({ field: 'location', message: locationError });
  }

  return errors;
}

export const MAX_PHOTO_SIZE = 1 * 1024 * 1024; // 1MB

export function validatePhotoSize(file) {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  if (file.size > MAX_PHOTO_SIZE) {
    return {
      valid: false,
      error: 'The photo is too large. Please upload one under 1MB.',
    };
  }

  return { valid: true, error: '' };
}
