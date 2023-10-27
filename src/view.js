import _ from 'lodash';

const renderFeedback = (elements, error) => {
  const { feedbackElement } = elements;

  if (!error) {
    feedbackElement.textContent = 'RSS успешно загружен';
    feedbackElement.classList.add('text-success');
    feedbackElement.classList.remove('text-danger');
    return;
  }
  feedbackElement.classList.add('text-danger');
  feedbackElement.classList.remove('text-success');
  feedbackElement.textContent = error.message;
};

const renderErrors = (elements, state, errors, prevErrors) => {
  Object.entries(elements.fields).forEach(([fieldName, fieldElement]) => {
    const error = errors[fieldName];
    const fieldHasError = _.has(errors, fieldName);
    const fieldHadError = _.has(prevErrors, fieldName);

    if (!fieldHadError && !fieldHasError) {
      fieldElement.classList.remove('is-invalid');
      renderFeedback(elements, error);
      return;
    }

    if (fieldHadError && !fieldHasError) {
      fieldElement.classList.remove('is-invalid');
      renderFeedback(elements, error);
      return;
    }

    if ((!fieldHadError && fieldHasError) || (fieldHadError && fieldHasError)) {
      fieldElement.classList.add('is-invalid');
      renderFeedback(elements, error);
    }
  });
};

const render = (elements, state) => (path, value, prevValue) => {
  switch (path) {
    case 'form.errors':
      renderErrors(elements, state, value, prevValue);
      break;
    default:
      break;
  }
};

export default render;
