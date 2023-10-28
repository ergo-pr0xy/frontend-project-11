import _ from 'lodash';

const renderFeedback = (elements, error, state, i18n) => {
  const { feedbackElement } = elements;

  if (state.form.status === 'correct') {
    feedbackElement.textContent = i18n.t('messageTexts.correctUrl');
    feedbackElement.classList.add('text-success');
    feedbackElement.classList.remove('text-danger');
    return;
  }
  feedbackElement.classList.add('text-danger');
  feedbackElement.classList.remove('text-success');
  feedbackElement.textContent = error.message;
};

const renderErrors = (elements, state, errors, prevErrors, i18n) => {
  Object.entries(elements.fields).forEach(([fieldName, fieldElement]) => {
    const error = errors[fieldName];
    const fieldHasError = _.has(errors, fieldName);
    const fieldHadError = _.has(prevErrors, fieldName);

    if (!fieldHadError && !fieldHasError) {
      fieldElement.classList.remove('is-invalid');
      renderFeedback(elements, error, state, i18n);
      elements.form.reset();
      elements.fields.url.focus();
      return;
    }

    if (fieldHadError && !fieldHasError) {
      fieldElement.classList.remove('is-invalid');
      renderFeedback(elements, error, state, i18n);
      return;
    }

    if ((!fieldHadError && fieldHasError) || (fieldHadError && fieldHasError)) {
      fieldElement.classList.add('is-invalid');
      renderFeedback(elements, error, state, i18n);
    }
  });
};

const render = (elements, state, i18n) => (path, value, prevValue) => {
  switch (path) {
    case 'form.errors':
      renderErrors(elements, state, value, prevValue, i18n);
      break;
    default:
      break;
  }
};

export default render;
