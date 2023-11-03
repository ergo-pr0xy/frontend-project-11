import _ from 'lodash';

// const renderFeeds = (elements, state,)

const renderFeedback = (elements, state, i18n) => {
  const { feedbackElement } = elements;

  if (!state.form.hasErrors) {
    feedbackElement.textContent = i18n.t('messageTexts.correctUrl');
    feedbackElement.classList.add('text-success');
    feedbackElement.classList.remove('text-danger');
    return;
  }
  feedbackElement.classList.add('text-danger');
  feedbackElement.classList.remove('text-success');
  const messagePath = `messageTexts.${state.form.messageKey}`;
  feedbackElement.textContent = i18n.t(messagePath);
};

const renderErrors = (elements, state, errors, prevErrors, i18n) => {
  Object.entries(elements.fields).forEach(([fieldName, fieldElement]) => {
    const fieldHasError = _.has(errors, fieldName);
    const fieldHadError = _.has(prevErrors, fieldName);

    if (!fieldHadError && !fieldHasError) {
      fieldElement.classList.remove('is-invalid');
      renderFeedback(elements, state, i18n);
      elements.form.reset();
      elements.fields.url.focus();
      return;
    }

    if (fieldHadError && !fieldHasError) {
      fieldElement.classList.remove('is-invalid');
      renderFeedback(elements, state, i18n);
      return;
    }

    if ((!fieldHadError && fieldHasError) || (fieldHadError && fieldHasError)) {
      fieldElement.classList.add('is-invalid');
      renderFeedback(elements, state, i18n);
    }
  });
};

const render = (elements, state, i18n) => (path, value, prevValue) => {
  switch (path) {
    case 'form.hasErrors':
      renderErrors(elements, state, value, prevValue, i18n);
      break;
    default:
      break;
  }
};

export default render;
