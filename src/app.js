import * as yup from 'yup';
import _ from 'lodash';
import onChange from 'on-change';
import render from './view.js';

const arr = {
  errors: null,
};

const validate = async (url, addedUrls) => {
  const schema = yup.object().shape({
    url: yup.string()
      .url('Ссылка должна быть валидным URL')
      .notOneOf(addedUrls, 'RSS уже существует'),
  });
  return schema.validate(url, { abortEarly: false })
    .then(() => ({}))
    .catch((e) => _.keyBy(e.inner, 'path'));
};

const app = async () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    submitButton: document.querySelector('button[type="submit"]'),
    feedbackElement: document.querySelector('p.feedback'),
    fields: {
      url: document.querySelector('#url-input'),
    },
  };

  const state = {
    process: null,
    addedUrls: [],
    form: {
      fields: {
        url: null,
      },
      errors: {},
    },
  };

  const watchedState = onChange(state, render(elements, state));

  elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    watchedState.process = 'adding';
    watchedState.form.fields.url = formData.get('url');
    validate(watchedState.form.fields, watchedState.addedUrls)
      .then((errors) => {
        watchedState.form.errors = errors;
        if (_.isEmpty(watchedState.form.errors)) {
          watchedState.addedUrls.push(watchedState.form.fields.url);
          watchedState.process = 'added';
        } else {
          watchedState.process = 'error';
        }
      });
  });
};

export default app;
